/* ===================================================================
   STORE — Couche d'accès aux données.
   Utilise Firestore si js/firebase-config.js est configuré,
   sinon bascule automatiquement sur un mode local (localStorage)
   pratique pour tester le site avant d'avoir créé le projet Firebase.
   ⚠️ En mode local, RIEN n'est synchronisé entre téléphones.
=================================================================== */

const LOCAL_MODE = !db;
const LOCAL_KEY = "bng_local_db_v1";

function nowTs(){ return Date.now(); }

function loadLocalDB(){
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e){}
  return { teams:{}, config:{ verreAssignment:{}, challengeAssignment:{}, verreDrawn:false, challengeDrawn:false,
           minuitTriggered:false, minuitAutoEnabled:false, minuitTriggeredAt:null, currentChapter:0, finaleRevealed:false,
           coffreOpened:false, coffreOpenedAt:null },
           events:[], requests:[], market:[],
           fcmTokens:[], notificationDrafts:[], notificationsToSend:[] };
}
function saveLocalDB(d){
  localStorage.setItem(LOCAL_KEY, JSON.stringify(d));
  window.dispatchEvent(new CustomEvent("bng-local-update"));
}
function defaultTeam(){
  return { score:0, unlockedCount:1, completed:{}, powerUsed:false, powerUsedAt:null,
           blockedUntil:null, protectedUntil:null, extraMissions:[], log:[], proofs:[],
           secretContract:null, minuitFinalUnlocked:false,
           handlerScore:0, secretCompleted:{}, omegaActivatedAt:null,
           ipcQuiz: { started:false, done:false, questionIds:[], answers:{}, correct:0, wrong:0, score:0 },
           drawnChallenges: {}, drawnFestifs: {}, festifsDone: {}, introSeen:false };
}

/* ---------------- MISSIONS "CORE" D'UNE ÉQUIPE (hors défis festifs) ----------------
   Même logique que app.js/missionListFor, dupliquée ici sans dépendance DOM :
   liste cumulée des identifiants de mission d'une équipe du chapitre 1 au
   chapitre courant inclus (fixes ou tirées au sort). Sert de base au calcul
   "l'équipe a-t-elle terminé absolument toutes ses missions ?", nécessaire
   aussi bien à app.js (afficher le chiffre secret) qu'à admin.js (savoir
   quand notifier "rejoignez le téléphone principal"). */
function coreMissionIds(teamId, currentChapter, teamData){
  const chapterNum = currentChapter || 0;
  const byChapter = (GAME_DATA.teams[teamId] || {}).missions || {};
  let out = [];
  for (let c = 1; c <= chapterNum; c++){
    const slot = byChapter[c];
    if (!slot) continue;
    if (Array.isArray(slot)) out = out.concat(slot);
    else if (slot.draw){
      const drawn = (teamData && teamData.drawnChallenges && teamData.drawnChallenges[c]) || [];
      out = out.concat(drawn);
      // Défis festifs : obligatoires et notés, tirés au sort par équipe au
      // même moment que les défis de ce chapitre (banque commune, jamais le
      // même tirage deux fois) — comptent donc dans "l'équipe a terminé
      // toutes ses missions" (voir teamMissionsComplete).
      const drawnFestifs = (teamData && teamData.drawnFestifs && teamData.drawnFestifs[c]) || [];
      out = out.concat(drawnFestifs);
    }
  }
  return out;
}

/* ---------------- TIRAGE DES DÉFIS IPC (chapitre 2) ----------------
   Choisit "count" défis pour une équipe : 1 défi "produit" (quiz1)
   garanti + 1 défi garanti dans la catégorie "signature" de l'équipe (voir
   TEAM_SIGNATURE_CATEGORY ci-dessous — sa couleur d'univers) + le reste au
   hasard parmi toutes les autres catégories (jamais les défis festifs,
   jamais deux fois le même pour une même équipe). Comme pour le Quiz IPC,
   se rabat automatiquement sur d'autres catégories si une catégorie est
   vide ou déjà épuisée. C'est la partie "banque commune" du mix
   dédié + commune : chaque tirage est aléatoire, mais toujours coloré par
   l'identité de la cellule qui le reçoit. */
const TEAM_SIGNATURE_CATEGORY = {
  casa: "commercial",      // bluff, négociation, marketing, humour
  potter: "minijeu",       // mystères et duels (Tabou IPC, mimes...)
  batman: "collegues",     // observation/filature via l'entourage
  aventuriers: "culture",  // exploration, découverte, culture IPC
  tarzan: "ambiance"       // danse, communication, énergie
};
function selectChapterDraw(count, teamId){
  const items = (GAME_DATA.challengeBank && GAME_DATA.challengeBank.items) || [];
  const produits = items.filter(i => i.category === "produit");
  let picked = [];
  if (produits.length) picked = picked.concat(pickRandom(produits, 1));

  const sigCat = TEAM_SIGNATURE_CATEGORY[teamId];
  if (sigCat && count > picked.length){
    const usedIds = new Set(picked.map(i=>i.id));
    const sigPool = items.filter(i => i.category === sigCat && !usedIds.has(i.id));
    if (sigPool.length) picked = picked.concat(pickRandom(sigPool, 1));
  }

  const autres = items.filter(i => i.category !== "produit");
  const remaining = count - picked.length;
  if (remaining > 0){
    const usedIds = new Set(picked.map(i=>i.id));
    const pool = autres.filter(i=>!usedIds.has(i.id));
    picked = picked.concat(pickRandom(pool, Math.min(remaining, pool.length)));
  }
  // Si jamais la banque totale est trop petite pour "count" items uniques,
  // complète avec ce qu'il reste (sans jamais planter).
  if (picked.length < count){
    const usedIds = new Set(picked.map(i=>i.id));
    const rest = items.filter(i=>!usedIds.has(i.id));
    picked = picked.concat(pickRandom(rest, count - picked.length));
  }
  return pickRandom(picked, picked.length).map(i=>i.id); // mélange l'ordre d'affichage
}

/* ---------------- TIRAGE DES DÉFIS FESTIFS (chapitre 2) ----------------
   Même principe que selectChapterDraw, mais sur la banque à part des défis
   festifs (challengeBank.festifs) : simple tirage aléatoire de "count"
   défis, sans catégorie ni garantie particulière — c'est précisément ce qui
   fait que deux équipes n'ont jamais exactement le même tirage festif. */
function selectFestifsDraw(count){
  const items = (GAME_DATA.challengeBank && GAME_DATA.challengeBank.festifs) || [];
  return pickRandom(items, Math.min(count, items.length)).map(i=>i.id);
}

/* ---------------- QUIZ IPC — sélection aléatoire ----------------
   Pioche questionsPerRun questions dans la banque, en respectant au
   mieux categoryMix (ex: 3 produits / 1 culture / 1 piège). Si une
   catégorie n'a pas assez de questions disponibles (ex: "culture"
   vide tant qu'Andreia n'a pas fourni les vrais faits IPC), le
   manque est automatiquement comblé par les autres catégories —
   jamais d'erreur, jamais moins de questionsPerRun questions tant que
   la banque totale en contient assez. Rejoué à chaque nouvelle partie,
   jamais deux équipes (ni deux soirées) ne voient exactement le même tirage. */
function pickRandom(arr, n){
  const copy = arr.slice();
  const out = [];
  while (out.length < n && copy.length){
    const i = Math.floor(Math.random()*copy.length);
    out.push(copy.splice(i,1)[0]);
  }
  return out;
}
function selectQuizQuestions(){
  const cfg = GAME_DATA.ipcQuiz;
  const bank = cfg.bank || [];
  const byCat = {};
  Object.keys(cfg.categoryMix||{}).forEach(cat=>{ byCat[cat] = bank.filter(q=>q.category===cat); });
  let picked = [];
  Object.keys(cfg.categoryMix||{}).forEach(cat=>{
    const n = Math.min(cfg.categoryMix[cat], (byCat[cat]||[]).length);
    picked = picked.concat(pickRandom(byCat[cat]||[], n));
  });
  const total = cfg.questionsPerRun || 5;
  if (picked.length < total){
    const usedIds = new Set(picked.map(q=>q.id));
    const remaining = bank.filter(q=>!usedIds.has(q.id));
    picked = picked.concat(pickRandom(remaining, total - picked.length));
  }
  return pickRandom(picked, picked.length); // ré-ordonne aussi l'ordre d'affichage
}

const Store = {

  mode: LOCAL_MODE ? "local" : "firestore",

  // ---------------- TEAM ----------------
  async ensureTeam(teamId){
    if (LOCAL_MODE){
      const d = loadLocalDB();
      if (!d.teams[teamId]) { d.teams[teamId] = defaultTeam(); saveLocalDB(d); }
      return;
    }
    const ref = db.collection("teams").doc(teamId);
    const snap = await ref.get();
    if (!snap.exists) await ref.set(defaultTeam());
  },

  listenTeam(teamId, cb){
    if (LOCAL_MODE){
      const handler = () => { const d = loadLocalDB(); cb(d.teams[teamId] || defaultTeam()); };
      window.addEventListener("bng-local-update", handler);
      handler();
      return () => window.removeEventListener("bng-local-update", handler);
    }
    return db.collection("teams").doc(teamId).onSnapshot(snap => {
      cb(snap.exists ? snap.data() : defaultTeam());
    });
  },

  async getTeam(teamId){
    if (LOCAL_MODE){ const d = loadLocalDB(); return d.teams[teamId] || defaultTeam(); }
    const snap = await db.collection("teams").doc(teamId).get();
    return snap.exists ? snap.data() : defaultTeam();
  },

  // Marque la cinématique d'introduction ("Dossier confidentiel IPC") comme
  // vue pour TOUTE l'équipe (état partagé Firestore/localStorage, jamais par
  // appareil) : si une équipe recharge la page ou qu'un autre membre ouvre le
  // même lien plus tard, elle arrive directement sur ses missions. Idempotent.
  async markIntroSeen(teamId){
    if (LOCAL_MODE){
      const d = loadLocalDB();
      d.teams[teamId] = d.teams[teamId] || defaultTeam();
      if (d.teams[teamId].introSeen) return false;
      d.teams[teamId].introSeen = true;
      saveLocalDB(d);
      return true;
    }
    const teamRef = db.collection("teams").doc(teamId);
    let applied = false;
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(teamRef);
      const team = snap.exists ? snap.data() : defaultTeam();
      if (team.introSeen) return;
      applied = true;
      tx.set(teamRef, { introSeen: true }, { merge:true });
    });
    return applied;
  },

  listenAllTeams(cb){
    if (LOCAL_MODE){
      const handler = () => { const d = loadLocalDB(); cb(d.teams); };
      window.addEventListener("bng-local-update", handler);
      handler();
      return () => window.removeEventListener("bng-local-update", handler);
    }
    return db.collection("teams").onSnapshot(qs => {
      const out = {};
      qs.forEach(doc => out[doc.id] = doc.data());
      cb(out);
    });
  },

  // ---------------- PROOFS (missions) ----------------
  async submitProof(teamId, missionId, note, photoDataUrl){
    const proof = { teamId, missionId, note: note||"", photo: photoDataUrl||null, status:"pending", createdAt: nowTs() };
    if (LOCAL_MODE){
      const d = loadLocalDB();
      d.teams[teamId] = d.teams[teamId] || defaultTeam();
      proof.id = "p" + nowTs();
      d.teams[teamId].proofs.push(proof);
      saveLocalDB(d);
      return proof.id;
    }
    const ref = await db.collection("teams").doc(teamId).collection("proofs").add(proof);
    return ref.id;
  },

  listenProofs(teamId, cb){
    // teamId === "*" -> écoute toutes les équipes (mode admin)
    if (LOCAL_MODE){
      const handler = () => {
        const d = loadLocalDB();
        if (teamId === "*"){
          let all = [];
          Object.keys(d.teams).forEach(tid => {
            (d.teams[tid].proofs||[]).forEach(p => all.push(Object.assign({teamId:tid}, p)));
          });
          cb(all);
        } else {
          cb(((d.teams[teamId]||defaultTeam()).proofs)||[]);
        }
      };
      window.addEventListener("bng-local-update", handler);
      handler();
      return () => window.removeEventListener("bng-local-update", handler);
    }
    if (teamId === "*"){
      // Pas de orderBy() ici : une requête collectionGroup triée demande un index
      // Firestore dédié. On trie côté client à la place, plus simple et fiable.
      return db.collectionGroup("proofs").onSnapshot(qs => {
        const out = []; qs.forEach(doc => out.push(Object.assign({id:doc.id}, doc.data())));
        out.sort((a,b)=> (b.createdAt||0) - (a.createdAt||0));
        cb(out);
      }, err => console.error("listenProofs(*) error:", err));
    }
    return db.collection("teams").doc(teamId).collection("proofs").onSnapshot(qs => {
      const out = []; qs.forEach(doc => out.push(Object.assign({id:doc.id}, doc.data())));
      out.sort((a,b)=> (b.createdAt||0) - (a.createdAt||0));
      cb(out);
    }, err => console.error("listenProofs("+teamId+") error:", err));
  },

  async approveProof(teamId, proofId, missionId, points){
    if (LOCAL_MODE){
      const d = loadLocalDB();
      const t = d.teams[teamId] = d.teams[teamId] || defaultTeam();
      const p = t.proofs.find(x => x.id === proofId);
      if (p) p.status = "approved";
      t.completed[missionId] = { status:"done", points, timestamp: nowTs() };
      t.score = (t.score||0) + points;
      t.unlockedCount = Math.min(10, (t.unlockedCount||1) + 1);
      t.log.push({ type:"points", amount: points, reason:"Mission validée : " + missionId, timestamp: nowTs() });
      saveLocalDB(d);
      return;
    }
    const teamRef = db.collection("teams").doc(teamId);
    const proofRef = teamRef.collection("proofs").doc(proofId);
    const logRef = teamRef.collection("log").doc();
    await db.runTransaction(async (tx) => {
      const teamSnap = await tx.get(teamRef);
      const team = teamSnap.exists ? teamSnap.data() : defaultTeam();
      const completed = team.completed || {};
      completed[missionId] = { status:"done", points, timestamp: nowTs() };
      tx.set(teamRef, {
        completed,
        score: (team.score||0) + points,
        unlockedCount: Math.min(10, (team.unlockedCount||1) + 1)
      }, { merge:true });
      tx.update(proofRef, { status:"approved" });
      tx.set(logRef, { type:"points", amount: points, reason:"Mission validée : " + missionId, timestamp: nowTs() });
    });
  },

  async rejectProof(teamId, proofId, missionId, penalty){
    penalty = penalty || 0;
    if (LOCAL_MODE){
      const d = loadLocalDB();
      const t = d.teams[teamId] = d.teams[teamId] || defaultTeam();
      const p = t.proofs.find(x => x.id === proofId);
      if (p) p.status = "rejected";
      t.completed[missionId] = { status:"rejected", points:0, timestamp: nowTs() };
      if (penalty) { t.score = Math.max(0, (t.score||0) + penalty); t.log.push({type:"penalite", amount:penalty, reason:"Mission refusée : "+missionId, timestamp: nowTs()}); }
      saveLocalDB(d);
      return;
    }
    const teamRef = db.collection("teams").doc(teamId);
    const proofRef = teamRef.collection("proofs").doc(proofId);
    const logRef = teamRef.collection("log").doc();
    await db.runTransaction(async (tx) => {
      const teamSnap = await tx.get(teamRef);
      const team = teamSnap.exists ? teamSnap.data() : defaultTeam();
      const completed = team.completed || {};
      completed[missionId] = { status:"rejected", points:0, timestamp: nowTs() };
      const newScore = penalty ? Math.max(0, (team.score||0) + penalty) : (team.score||0);
      tx.set(teamRef, { completed, score: newScore }, { merge:true });
      tx.update(proofRef, { status:"rejected" });
      if (penalty) tx.set(logRef, { type:"penalite", amount:penalty, reason:"Mission refusée : "+missionId, timestamp: nowTs() });
    });
  },

  // ---------------- POINTS / ADMIN ADJUST ----------------
  async adjustPoints(teamId, amount, reason){
    if (LOCAL_MODE){
      const d = loadLocalDB();
      const t = d.teams[teamId] = d.teams[teamId] || defaultTeam();
      t.score = Math.max(0, (t.score||0) + amount);
      t.log.push({ type: amount>=0?"bonus":"penalite", amount, reason: reason||"Ajustement admin", timestamp: nowTs() });
      saveLocalDB(d);
      return;
    }
    const teamRef = db.collection("teams").doc(teamId);
    const logRef = teamRef.collection("log").doc();
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(teamRef);
      const team = snap.exists ? snap.data() : defaultTeam();
      tx.set(teamRef, { score: Math.max(0, (team.score||0) + amount) }, { merge:true });
      tx.set(logRef, { type: amount>=0?"bonus":"penalite", amount, reason: reason||"Ajustement admin", timestamp: nowTs() });
    });
  },

  async unlockNext(teamId){
    if (LOCAL_MODE){
      const d = loadLocalDB();
      const t = d.teams[teamId] = d.teams[teamId] || defaultTeam();
      t.unlockedCount = Math.min(10, (t.unlockedCount||1) + 1);
      saveLocalDB(d);
      return;
    }
    const teamRef = db.collection("teams").doc(teamId);
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(teamRef);
      const team = snap.exists ? snap.data() : defaultTeam();
      tx.set(teamRef, { unlockedCount: Math.min(10, (team.unlockedCount||1) + 1) }, { merge:true });
    });
  },

  async blockTeam(teamId, minutes){
    const until = nowTs() + minutes*60000;
    if (LOCAL_MODE){
      const d = loadLocalDB(); const t = d.teams[teamId] = d.teams[teamId] || defaultTeam();
      t.blockedUntil = until; saveLocalDB(d); return;
    }
    await db.collection("teams").doc(teamId).set({ blockedUntil: until }, { merge:true });
  },
  async unblockTeam(teamId){
    if (LOCAL_MODE){ const d = loadLocalDB(); const t = d.teams[teamId] = d.teams[teamId] || defaultTeam(); t.blockedUntil=null; saveLocalDB(d); return; }
    await db.collection("teams").doc(teamId).set({ blockedUntil: null }, { merge:true });
  },

  // ---------------- POWERS ----------------
  async setProtection(teamId, minutes){
    const until = nowTs() + minutes*60000;
    if (LOCAL_MODE){ const d=loadLocalDB(); const t=d.teams[teamId]=d.teams[teamId]||defaultTeam(); t.protectedUntil=until; t.powerUsed=true; t.powerUsedAt=nowTs(); saveLocalDB(d); return; }
    await db.collection("teams").doc(teamId).set({ protectedUntil: until, powerUsed:true, powerUsedAt: nowTs() }, { merge:true });
  },

  async stealPoints(fromTeamId, toTeamId, amount){
    if (LOCAL_MODE){
      const d = loadLocalDB();
      const from = d.teams[fromTeamId] = d.teams[fromTeamId] || defaultTeam();
      const to = d.teams[toTeamId] = d.teams[toTeamId] || defaultTeam();
      if (to.protectedUntil && to.protectedUntil > nowTs()){
        saveLocalDB(d);
        return { blocked:true };
      }
      from.score = (from.score||0) + amount;
      from.powerUsed = true; from.powerUsedAt = nowTs();
      to.score = Math.max(0, (to.score||0) - amount);
      from.log.push({type:"power", amount, reason:"Braquage envers "+toTeamId, timestamp: nowTs()});
      to.log.push({type:"penalite", amount:-amount, reason:"Braquage subi de la part de "+fromTeamId, timestamp: nowTs()});
      saveLocalDB(d);
      return { blocked:false };
    }
    const fromRef = db.collection("teams").doc(fromTeamId);
    const toRef = db.collection("teams").doc(toTeamId);
    let blocked = false;
    await db.runTransaction(async (tx) => {
      const fromSnap = await tx.get(fromRef);
      const toSnap = await tx.get(toRef);
      const from = fromSnap.exists ? fromSnap.data() : defaultTeam();
      const to = toSnap.exists ? toSnap.data() : defaultTeam();
      if (to.protectedUntil && to.protectedUntil > nowTs()){ blocked = true; return; }
      tx.set(fromRef, { score:(from.score||0)+amount, powerUsed:true, powerUsedAt: nowTs() }, { merge:true });
      tx.set(toRef, { score: Math.max(0,(to.score||0)-amount) }, { merge:true });
      tx.set(fromRef.collection("log").doc(), { type:"power", amount, reason:"Braquage envers "+toTeamId, timestamp: nowTs() });
      tx.set(toRef.collection("log").doc(), { type:"penalite", amount:-amount, reason:"Braquage subi de la part de "+fromTeamId, timestamp: nowTs() });
    });
    return { blocked };
  },

  async revertLastPenalty(teamId){
    if (LOCAL_MODE){
      const d = loadLocalDB(); const t = d.teams[teamId] = d.teams[teamId] || defaultTeam();
      const last = [...(t.log||[])].reverse().find(l => l.type==="penalite" && !l.reverted);
      if (!last) return false;
      last.reverted = true;
      t.score = (t.score||0) + Math.abs(last.amount);
      t.powerUsed = true; t.powerUsedAt = nowTs();
      saveLocalDB(d);
      return true;
    }
    const teamRef = db.collection("teams").doc(teamId);
    const logSnap = await teamRef.collection("log").where("type","==","penalite").orderBy("timestamp","desc").limit(5).get();
    const last = logSnap.docs.find(doc => !doc.data().reverted);
    if (!last) return false;
    const amount = Math.abs(last.data().amount);
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(teamRef);
      const team = snap.exists ? snap.data() : defaultTeam();
      tx.set(teamRef, { score:(team.score||0)+amount, powerUsed:true, powerUsedAt: nowTs() }, { merge:true });
      tx.update(last.ref, { reverted:true });
    });
    return true;
  },

  async resetRejectedMission(teamId, missionId){
    if (LOCAL_MODE){
      const d = loadLocalDB(); const t = d.teams[teamId] = d.teams[teamId] || defaultTeam();
      delete t.completed[missionId];
      t.powerUsed = true; t.powerUsedAt = nowTs();
      saveLocalDB(d);
      return;
    }
    const teamRef = db.collection("teams").doc(teamId);
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(teamRef);
      const team = snap.exists ? snap.data() : defaultTeam();
      const completed = team.completed || {};
      delete completed[missionId];
      tx.set(teamRef, { completed, powerUsed:true, powerUsedAt: nowTs() }, { merge:true });
    });
  },

  async requestHint(teamId){
    const req = { teamId, type:"indice", status:"pending", timestamp: nowTs() };
    if (LOCAL_MODE){
      const d = loadLocalDB();
      const t = d.teams[teamId] = d.teams[teamId] || defaultTeam();
      t.powerUsed = true; t.powerUsedAt = nowTs();
      d.requests.push(req); saveLocalDB(d); return;
    }
    await db.collection("teams").doc(teamId).set({ powerUsed:true, powerUsedAt: nowTs() }, { merge:true });
    await db.collection("requests").add(req);
  },

  async swapMissions(teamAId, missionAId, teamBId, missionBId){
    if (LOCAL_MODE){
      const d = loadLocalDB();
      const a = d.teams[teamAId] = d.teams[teamAId] || defaultTeam();
      const b = d.teams[teamBId] = d.teams[teamBId] || defaultTeam();
      a.extraMissions = a.extraMissions || []; b.extraMissions = b.extraMissions || [];
      a.extraMissions.push(missionBId);
      b.extraMissions.push(missionAId);
      a.powerUsed = true; a.powerUsedAt = nowTs();
      saveLocalDB(d);
      return;
    }
    const aRef = db.collection("teams").doc(teamAId);
    const bRef = db.collection("teams").doc(teamBId);
    await db.runTransaction(async (tx) => {
      const aSnap = await tx.get(aRef); const bSnap = await tx.get(bRef);
      const a = aSnap.exists ? aSnap.data() : defaultTeam();
      const b = bSnap.exists ? bSnap.data() : defaultTeam();
      const aExtra = (a.extraMissions||[]).concat([missionBId]);
      const bExtra = (b.extraMissions||[]).concat([missionAId]);
      tx.set(aRef, { extraMissions:aExtra, powerUsed:true, powerUsedAt: nowTs() }, { merge:true });
      tx.set(bRef, { extraMissions:bExtra }, { merge:true });
    });
  },

  // ---------------- EVENTS ----------------
  async broadcastEvent(target, type, title, message){
    const ev = { target, type, title, message, timestamp: nowTs() };
    if (LOCAL_MODE){
      const d = loadLocalDB(); d.events.push(ev); saveLocalDB(d); return;
    }
    await db.collection("events").add(ev);
  },

  listenEvents(teamId, cb){
    // renvoie tous les events ciblant teamId ou 'all', triés du plus récent
    if (LOCAL_MODE){
      const handler = () => {
        const d = loadLocalDB();
        cb((d.events||[]).filter(e => e.target === teamId || e.target === "all").sort((a,b)=>b.timestamp-a.timestamp));
      };
      window.addEventListener("bng-local-update", handler);
      handler();
      return () => window.removeEventListener("bng-local-update", handler);
    }
    return db.collection("events").orderBy("timestamp","desc").limit(50).onSnapshot(qs => {
      const out = [];
      qs.forEach(doc => { const e = doc.data(); if (e.target===teamId || e.target==="all") out.push(Object.assign({id:doc.id}, e)); });
      cb(out);
    });
  },

  // ---------------- CONFIG (tirages) ----------------
  listenConfig(cb){
    if (LOCAL_MODE){
      const handler = () => { const d = loadLocalDB(); cb(d.config); };
      window.addEventListener("bng-local-update", handler);
      handler();
      return () => window.removeEventListener("bng-local-update", handler);
    }
    return db.collection("config").doc("state").onSnapshot(snap => {
      cb(snap.exists ? snap.data() : { verreAssignment:{}, challengeAssignment:{}, verreDrawn:false, challengeDrawn:false,
        minuitTriggered:false, minuitAutoEnabled:false, minuitTriggeredAt:null, currentChapter:0, finaleRevealed:false,
        coffreOpened:false, coffreOpenedAt:null });
    });
  },

  async drawVerreAssignment(teamIds){
    // dérangement : aucune équipe ne se retrouve avec elle-même
    let target;
    do {
      target = [...teamIds].sort(() => Math.random()-0.5);
    } while (target.some((t,i)=>t===teamIds[i]));
    const assignment = {};
    teamIds.forEach((t,i) => assignment[t] = target[i]);
    if (LOCAL_MODE){
      const d = loadLocalDB(); d.config.verreAssignment = assignment; d.config.verreDrawn = true; saveLocalDB(d);
    } else {
      await db.collection("config").doc("state").set({ verreAssignment: assignment, verreDrawn:true }, { merge:true });
    }
    return assignment;
  },

  async drawChallengeAssignment(teamIds, challenges){
    const pool = [...challenges].sort(() => Math.random()-0.5);
    const assignment = {};
    teamIds.forEach((t,i) => assignment[t] = pool[i % pool.length].id);
    if (LOCAL_MODE){
      const d = loadLocalDB(); d.config.challengeAssignment = assignment; d.config.challengeDrawn = true; saveLocalDB(d);
    } else {
      await db.collection("config").doc("state").set({ challengeAssignment: assignment, challengeDrawn:true }, { merge:true });
    }
    return assignment;
  },

  // ---------------- REQUESTS (indices demandés à l'admin) ----------------
  listenRequests(cb){
    if (LOCAL_MODE){
      const handler = () => { const d = loadLocalDB(); cb(d.requests||[]); };
      window.addEventListener("bng-local-update", handler);
      handler();
      return () => window.removeEventListener("bng-local-update", handler);
    }
    return db.collection("requests").orderBy("timestamp","desc").onSnapshot(qs => {
      const out = []; qs.forEach(doc => out.push(Object.assign({id:doc.id}, doc.data())));
      cb(out);
    });
  },

  // ---------------- MISSIONS À CHOIX (risque / sécurité) ----------------
  async resolveChoiceMission(teamId, missionId, choice, def){
    const win = choice === "safe" ? true : Math.random() < (def.riskChance != null ? def.riskChance : 0.5);
    const points = choice === "safe" ? def.safePoints : (win ? def.riskWin : def.riskLose);
    if (LOCAL_MODE){
      const d = loadLocalDB();
      const t = d.teams[teamId] = d.teams[teamId] || defaultTeam();
      t.completed[missionId] = { status:"done", points, choice, win, timestamp: nowTs() };
      t.score = Math.max(0, (t.score||0) + points);
      t.unlockedCount = Math.min(10, (t.unlockedCount||1) + 1);
      t.log.push({ type: points>=0?"points":"penalite", amount: points, reason:"Mission à choix : "+missionId, timestamp: nowTs() });
      saveLocalDB(d);
      return { win, points };
    }
    const teamRef = db.collection("teams").doc(teamId);
    const logRef = teamRef.collection("log").doc();
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(teamRef);
      const team = snap.exists ? snap.data() : defaultTeam();
      const completed = team.completed || {};
      completed[missionId] = { status:"done", points, choice, win, timestamp: nowTs() };
      tx.set(teamRef, {
        completed,
        score: Math.max(0, (team.score||0) + points),
        unlockedCount: Math.min(10, (team.unlockedCount||1) + 1)
      }, { merge:true });
      tx.set(logRef, { type: points>=0?"points":"penalite", amount: points, reason:"Mission à choix : "+missionId, timestamp: nowTs() });
    });
    return { win, points };
  },

  // ---------------- MARCHÉ NOIR ----------------
  async postMarketOffer(teamId, title, description, wants){
    const offer = { teamId, title, description: description||"", wants: wants||"", status:"open", createdAt: nowTs() };
    if (LOCAL_MODE){
      const d = loadLocalDB();
      offer.id = "m" + nowTs();
      d.market = d.market || [];
      d.market.push(offer);
      saveLocalDB(d);
      return offer.id;
    }
    const ref = await db.collection("market").add(offer);
    return ref.id;
  },

  listenMarket(cb){
    if (LOCAL_MODE){
      const handler = () => {
        const d = loadLocalDB();
        cb([...(d.market||[])].sort((a,b)=>b.createdAt-a.createdAt));
      };
      window.addEventListener("bng-local-update", handler);
      handler();
      return () => window.removeEventListener("bng-local-update", handler);
    }
    return db.collection("market").onSnapshot(qs => {
      const out = []; qs.forEach(doc => out.push(Object.assign({id:doc.id}, doc.data())));
      out.sort((a,b)=> (b.createdAt||0) - (a.createdAt||0));
      cb(out);
    }, err => console.error("listenMarket error:", err));
  },

  async closeMarketOffer(offerId){
    if (LOCAL_MODE){
      const d = loadLocalDB();
      const o = (d.market||[]).find(x => x.id === offerId);
      if (o) o.status = "closed";
      saveLocalDB(d);
      return;
    }
    await db.collection("market").doc(offerId).set({ status:"closed" }, { merge:true });
  },

  async expressInterest(offerTeamId, fromTeamId, offerTitle){
    await Store.broadcastEvent(offerTeamId, "event", "🖤 Intérêt pour votre offre",
      `Une équipe est intéressée par votre offre du Marché Noir : « ${offerTitle} ». Allez négocier !`);
  },

  // ---------------- CONTRATS SECRETS ----------------
  async sendSecretContract(teamId, title, description, points){
    const contract = { title, description, points, status:"active", sentAt: nowTs() };
    if (LOCAL_MODE){
      const d = loadLocalDB(); const t = d.teams[teamId] = d.teams[teamId] || defaultTeam();
      t.secretContract = contract; saveLocalDB(d); return;
    }
    await db.collection("teams").doc(teamId).set({ secretContract: contract }, { merge:true });
  },

  async submitSecretContractProof(teamId, note){
    if (LOCAL_MODE){
      const d = loadLocalDB(); const t = d.teams[teamId] = d.teams[teamId] || defaultTeam();
      if (t.secretContract){ t.secretContract.status = "pending"; t.secretContract.note = note||""; }
      saveLocalDB(d); return;
    }
    const teamRef = db.collection("teams").doc(teamId);
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(teamRef);
      const team = snap.exists ? snap.data() : defaultTeam();
      const contract = team.secretContract || null;
      if (contract){ contract.status = "pending"; contract.note = note||""; }
      tx.set(teamRef, { secretContract: contract }, { merge:true });
    });
  },

  async approveSecretContract(teamId){
    if (LOCAL_MODE){
      const d = loadLocalDB(); const t = d.teams[teamId] = d.teams[teamId] || defaultTeam();
      if (!t.secretContract) return 0;
      const pts = t.secretContract.points||0;
      t.score = Math.max(0, (t.score||0) + pts);
      t.log.push({ type:"points", amount: pts, reason:"Contrat secret : "+t.secretContract.title, timestamp: nowTs() });
      t.secretContract.status = "done";
      saveLocalDB(d);
      return pts;
    }
    const teamRef = db.collection("teams").doc(teamId);
    const logRef = teamRef.collection("log").doc();
    let pts = 0;
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(teamRef);
      const team = snap.exists ? snap.data() : defaultTeam();
      const contract = team.secretContract;
      if (!contract) return;
      pts = contract.points||0;
      contract.status = "done";
      tx.set(teamRef, { secretContract: contract, score: Math.max(0,(team.score||0)+pts) }, { merge:true });
      tx.set(logRef, { type:"points", amount: pts, reason:"Contrat secret : "+contract.title, timestamp: nowTs() });
    });
    return pts;
  },

  async rejectSecretContract(teamId){
    if (LOCAL_MODE){
      const d = loadLocalDB(); const t = d.teams[teamId] = d.teams[teamId] || defaultTeam();
      if (t.secretContract) t.secretContract.status = "active";
      saveLocalDB(d); return;
    }
    const teamRef = db.collection("teams").doc(teamId);
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(teamRef);
      const team = snap.exists ? snap.data() : defaultTeam();
      const contract = team.secretContract;
      if (contract) contract.status = "active";
      tx.set(teamRef, { secretContract: contract }, { merge:true });
    });
  },

  // ---------------- OPÉRATION MINUIT ----------------
  async setMinuitAuto(enabled){
    if (LOCAL_MODE){ const d = loadLocalDB(); d.config.minuitAutoEnabled = enabled; saveLocalDB(d); return; }
    await db.collection("config").doc("state").set({ minuitAutoEnabled: enabled }, { merge:true });
  },

  async triggerMinuit(teamIds){
    if (LOCAL_MODE){
      const d = loadLocalDB();
      if (d.config.minuitTriggered) return false;
      d.config.minuitTriggered = true; d.config.minuitTriggeredAt = nowTs();
      teamIds.forEach(tid => {
        const t = d.teams[tid] = d.teams[tid] || defaultTeam();
        t.powerUsed = false; t.powerUsedAt = null; t.protectedUntil = null; t.minuitFinalUnlocked = true;
      });
      d.events.push({ target:"all", type:"danger", title:"🚨 OPÉRATION MINUIT 🚨",
        message:"Le classement est gelé. Toutes les protections tombent. Les pouvoirs sont réutilisables. Une mission finale vient d'apparaître chez chaque équipe. Il vous reste 45 minutes pour tout renverser.",
        timestamp: nowTs() });
      saveLocalDB(d);
      return true;
    }
    const configRef = db.collection("config").doc("state");
    let fired = false;
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(configRef);
      const cfg = snap.exists ? snap.data() : {};
      if (cfg.minuitTriggered) return;
      fired = true;
      tx.set(configRef, { minuitTriggered:true, minuitTriggeredAt: nowTs() }, { merge:true });
      teamIds.forEach(tid => {
        tx.set(db.collection("teams").doc(tid), { powerUsed:false, powerUsedAt:null, protectedUntil:null, minuitFinalUnlocked:true }, { merge:true });
      });
    });
    if (fired){
      await Store.broadcastEvent("all","danger","🚨 OPÉRATION MINUIT 🚨",
        "Le classement est gelé. Toutes les protections tombent. Les pouvoirs sont réutilisables. Une mission finale vient d'apparaître chez chaque équipe. Il vous reste 45 minutes pour tout renverser.");
    }
    return fired;
  },

  // ---------------- CHAPITRES ----------------

  // Validation instantanée d'une mission courte : pas de preuve, pas
  // d'attente d'approbation admin. Un tap = les points sont acquis.
  async completeMissionInstant(teamId, missionId, points){
    if (LOCAL_MODE){
      const d = loadLocalDB();
      const t = d.teams[teamId] = d.teams[teamId] || defaultTeam();
      if (t.completed && t.completed[missionId] && t.completed[missionId].status==="done") return false;
      t.completed = t.completed || {};
      t.completed[missionId] = { status:"done", points, timestamp: nowTs(), instant:true };
      t.score = (t.score||0) + points;
      saveLocalDB(d);
      return true;
    }
    const teamRef = db.collection("teams").doc(teamId);
    let applied = false;
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(teamRef);
      const team = snap.exists ? snap.data() : defaultTeam();
      if (team.completed && team.completed[missionId] && team.completed[missionId].status==="done") return;
      applied = true;
      const completed = Object.assign({}, team.completed, { [missionId]: { status:"done", points, timestamp: nowTs(), instant:true } });
      tx.set(teamRef, { completed, score: (team.score||0) + points }, { merge:true });
    });
    return applied;
  },

  // Active un chapitre (1, 2 ou 3) : change config.currentChapter, et pour
  // le chapitre 3 débloque la mission finale UNIQUEMENT pour la ou les
  // équipes qui ont un finalMission défini dans data.js (ex : Harry Potter
  // pour le Protocole Omega) + réinitialise pouvoirs/protections pour tout
  // le monde. Envoie systématiquement une notification push à toutes les équipes.
  async activateChapter(chapterNum, teamIds, notifTitle, notifBody){
    const finalTeams = teamIds.filter(tid => GAME_DATA.teams[tid] && GAME_DATA.teams[tid].finalMission);
    // Pour tout chapitre où team.missions[chapterNum] = {draw:N} (ex: chapitre 2),
    // tire une fois pour toutes N défis par équipe, persisté (jamais retiré au
    // rafraîchissement de la page).
    if (LOCAL_MODE){
      const d = loadLocalDB();
      d.config.currentChapter = chapterNum;
      teamIds.forEach(tid => {
        const slot = GAME_DATA.teams[tid] && GAME_DATA.teams[tid].missions[chapterNum];
        if (slot && typeof slot === "object" && slot.draw){
          const t = d.teams[tid] = d.teams[tid] || defaultTeam();
          t.drawnChallenges = t.drawnChallenges || {};
          if (!t.drawnChallenges[chapterNum]) t.drawnChallenges[chapterNum] = selectChapterDraw(slot.draw, tid);
          // Tirage des défis festifs (banque commune, jamais le même tirage
          // deux fois) au même moment que le tirage des défis du chapitre.
          t.drawnFestifs = t.drawnFestifs || {};
          const festifsCount = (GAME_DATA.challengeBank && GAME_DATA.challengeBank.festifsDrawCount) || 4;
          if (!t.drawnFestifs[chapterNum]) t.drawnFestifs[chapterNum] = selectFestifsDraw(festifsCount);
        }
      });
      if (chapterNum >= 3){
        teamIds.forEach(tid => {
          const t = d.teams[tid] = d.teams[tid] || defaultTeam();
          t.powerUsed = false; t.powerUsedAt = null; t.protectedUntil = null;
          if (finalTeams.includes(tid)){ t.minuitFinalUnlocked = true; t.omegaActivatedAt = nowTs(); }
        });
      }
      d.notificationsToSend = d.notificationsToSend || [];
      d.notificationsToSend.push({ id:"n"+nowTs(), target:"all", title:notifTitle, body:notifBody, type:"chapitre", createdAt: nowTs() });
      saveLocalDB(d);
      return true;
    }
    await db.collection("config").doc("state").set({ currentChapter: chapterNum }, { merge:true });
    const drawBatch = db.batch();
    let hasDraw = false;
    for (const tid of teamIds){
      const slot = GAME_DATA.teams[tid] && GAME_DATA.teams[tid].missions[chapterNum];
      if (slot && typeof slot === "object" && slot.draw){
        const teamRef = db.collection("teams").doc(tid);
        const snap = await teamRef.get();
        const team = snap.exists ? snap.data() : defaultTeam();
        const drawnChallenges = team.drawnChallenges || {};
        const drawnFestifs = team.drawnFestifs || {};
        let teamHasDraw = false;
        if (!drawnChallenges[chapterNum]){
          drawnChallenges[chapterNum] = selectChapterDraw(slot.draw, tid);
          teamHasDraw = true;
        }
        if (!drawnFestifs[chapterNum]){
          const festifsCount = (GAME_DATA.challengeBank && GAME_DATA.challengeBank.festifsDrawCount) || 4;
          drawnFestifs[chapterNum] = selectFestifsDraw(festifsCount);
          teamHasDraw = true;
        }
        if (teamHasDraw){
          hasDraw = true;
          drawBatch.set(teamRef, { drawnChallenges, drawnFestifs }, { merge:true });
        }
      }
    }
    if (hasDraw) await drawBatch.commit();
    if (chapterNum >= 3){
      const batch = db.batch();
      teamIds.forEach(tid => {
        const extra = finalTeams.includes(tid) ? { minuitFinalUnlocked:true, omegaActivatedAt: nowTs() } : {};
        batch.set(db.collection("teams").doc(tid), Object.assign({ powerUsed:false, powerUsedAt:null, protectedUntil:null }, extra), { merge:true });
      });
      await batch.commit();
    }
    await db.collection("notificationsToSend").add({ target:"all", title:notifTitle, body:notifBody, type:"chapitre", createdAt: nowTs() });
    return true;
  },

  // Remet TOUTE la partie à zéro, comme au tout premier lancement : les 5
  // équipes retrouvent un score de 0, aucune mission/défi/festif/quiz fait,
  // aucun tirage effectué, l'intro pas encore vue, et la config repasse au
  // chapitre 0 ("En attente d'activation"), coffre fermé, révélation finale
  // non déclenchée. Les tokens de notification (fcmTokens) sont volontairement
  // conservés pour que les équipes n'aient pas à réactiver les notifications.
  // ⚠️ Irréversible : à n'utiliser qu'avant de (re)lancer une vraie soirée.
  async resetGame(){
    if (LOCAL_MODE){
      const d = loadLocalDB();
      d.teams = {};
      TEAM_ORDER.forEach(t => { d.teams[t] = defaultTeam(); });
      d.config = { verreAssignment:{}, challengeAssignment:{}, verreDrawn:false, challengeDrawn:false,
        minuitTriggered:false, minuitAutoEnabled:false, minuitTriggeredAt:null, currentChapter:0, finaleRevealed:false,
        coffreOpened:false, coffreOpenedAt:null, allCompleteNotifiedAt:null };
      d.events = []; d.requests = []; d.market = [];
      d.notificationDrafts = []; d.notificationsToSend = [];
      saveLocalDB(d);
      return true;
    }
    // Purge les sous-collections "proofs" (Firestore ne les supprime jamais
    // automatiquement, même en écrasant le document parent).
    for (const tid of TEAM_ORDER){
      const proofsSnap = await db.collection("teams").doc(tid).collection("proofs").get();
      if (!proofsSnap.empty){
        const delBatch = db.batch();
        proofsSnap.forEach(doc => delBatch.delete(doc.ref));
        await delBatch.commit();
      }
    }
    const teamBatch = db.batch();
    TEAM_ORDER.forEach(tid => { teamBatch.set(db.collection("teams").doc(tid), defaultTeam()); });
    await teamBatch.commit();

    await db.collection("config").doc("state").set({
      verreAssignment:{}, challengeAssignment:{}, verreDrawn:false, challengeDrawn:false,
      minuitTriggered:false, minuitAutoEnabled:false, minuitTriggeredAt:null, currentChapter:0, finaleRevealed:false,
      coffreOpened:false, coffreOpenedAt:null, allCompleteNotifiedAt:null
    });

    for (const collName of ["events", "requests", "market", "notificationDrafts", "notificationsToSend"]){
      const snap = await db.collection(collName).get();
      if (snap.empty) continue;
      const delBatch = db.batch();
      snap.forEach(doc => delBatch.delete(doc.ref));
      await delBatch.commit();
    }
    return true;
  },

  // ---------------- MISSIONS SECRÈTES (agents dormants) ----------------
  // Comme completeMissionInstant, mais crédite handlerScore au lieu de score :
  // ce total reste invisible du classement officiel et n'est révélé qu'à la fin.
  async completeSecretMission(teamId, missionId, points){
    if (LOCAL_MODE){
      const d = loadLocalDB();
      const t = d.teams[teamId] = d.teams[teamId] || defaultTeam();
      t.secretCompleted = t.secretCompleted || {};
      if (t.secretCompleted[missionId] && t.secretCompleted[missionId].status==="done") return false;
      t.secretCompleted[missionId] = { status:"done", points, timestamp: nowTs() };
      t.handlerScore = (t.handlerScore||0) + points;
      saveLocalDB(d);
      return true;
    }
    const teamRef = db.collection("teams").doc(teamId);
    let applied = false;
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(teamRef);
      const team = snap.exists ? snap.data() : defaultTeam();
      const secretCompleted = team.secretCompleted || {};
      if (secretCompleted[missionId] && secretCompleted[missionId].status==="done") return;
      applied = true;
      secretCompleted[missionId] = { status:"done", points, timestamp: nowTs() };
      tx.set(teamRef, { secretCompleted, handlerScore: (team.handlerScore||0) + points }, { merge:true });
    });
    return applied;
  },

  // ---------------- PROTOCOLE OMEGA (legacy, non utilisé) ----------------
  // Ancien mécanisme exclusif à Harry Potter, remplacé par la Mallette
  // IPC commune aux 5 équipes (voir validateMalletteCode ci-dessus).
  // Conservé tel quel : aucune mission de data.js n'a plus type:"omega",
  // donc cette méthode n'est plus jamais appelée.
  async validateOmegaCode(teamId, code, def){
    const correct = String(code).trim() === String(def.omegaCode).trim();
    if (!correct) return { ok:false };
    const missionId = "final-" + teamId;
    if (LOCAL_MODE){
      const d = loadLocalDB();
      const t = d.teams[teamId] = d.teams[teamId] || defaultTeam();
      if (t.completed && t.completed[missionId] && t.completed[missionId].status==="done") return { ok:true, already:true };
      t.completed = t.completed || {};
      t.completed[missionId] = { status:"done", points: def.points, timestamp: nowTs() };
      t.score = (t.score||0) + def.points;
      saveLocalDB(d);
      return { ok:true };
    }
    const teamRef = db.collection("teams").doc(teamId);
    let already = false;
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(teamRef);
      const team = snap.exists ? snap.data() : defaultTeam();
      if (team.completed && team.completed[missionId] && team.completed[missionId].status==="done"){ already = true; return; }
      const completed = Object.assign({}, team.completed, { [missionId]: { status:"done", points: def.points, timestamp: nowTs() } });
      tx.set(teamRef, { completed, score: (team.score||0) + def.points }, { merge:true });
    });
    return { ok:true, already };
  },

  // ---------------- QUIZ IPC ----------------
  // Démarre (une seule fois, idempotent) le tirage de 5 questions pour
  // cette équipe. Un rafraîchissement de page en cours de quiz ne
  // re-tire donc jamais de nouvelles questions.
  async startIpcQuiz(teamId){
    if (LOCAL_MODE){
      const d = loadLocalDB();
      const t = d.teams[teamId] = d.teams[teamId] || defaultTeam();
      t.ipcQuiz = t.ipcQuiz || { started:false, done:false, questionIds:[], answers:{}, correct:0, wrong:0, score:0 };
      if (!t.ipcQuiz.started){
        t.ipcQuiz.questionIds = selectQuizQuestions().map(q=>q.id);
        t.ipcQuiz.started = true;
        saveLocalDB(d);
      }
      return t.ipcQuiz;
    }
    const teamRef = db.collection("teams").doc(teamId);
    let result;
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(teamRef);
      const team = snap.exists ? snap.data() : defaultTeam();
      const quiz = team.ipcQuiz || { started:false, done:false, questionIds:[], answers:{}, correct:0, wrong:0, score:0 };
      if (!quiz.started){
        quiz.questionIds = selectQuizQuestions().map(q=>q.id);
        quiz.started = true;
        tx.set(teamRef, { ipcQuiz: quiz }, { merge:true });
      }
      result = quiz;
    });
    return result;
  },

  // Valide une réponse. Idempotent : si la question a déjà été répondue
  // (ex: double-clic, reconnexion), renvoie simplement le résultat déjà
  // enregistré sans recompter les points ni la gorgée.
  async answerIpcQuizQuestion(teamId, questionId, selectedIndex){
    const def = (GAME_DATA.ipcQuiz.bank || []).find(q => q.id === questionId);
    if (!def) return { ok:false };
    const correct = selectedIndex === def.correct;
    const pts = GAME_DATA.ipcQuiz.pointsPerCorrect || 10;
    if (LOCAL_MODE){
      const d = loadLocalDB();
      const t = d.teams[teamId] = d.teams[teamId] || defaultTeam();
      t.ipcQuiz = t.ipcQuiz || { started:true, done:false, questionIds:[], answers:{}, correct:0, wrong:0, score:0 };
      if (t.ipcQuiz.answers[questionId]){
        const already = t.ipcQuiz.answers[questionId];
        return { ok:true, already:true, correct: already.correct, explanation: def.explanation, correctIndex: def.correct };
      }
      t.ipcQuiz.answers[questionId] = { selected: selectedIndex, correct };
      if (correct){ t.ipcQuiz.correct = (t.ipcQuiz.correct||0) + 1; t.ipcQuiz.score = (t.ipcQuiz.score||0) + pts; }
      else { t.ipcQuiz.wrong = (t.ipcQuiz.wrong||0) + 1; }
      saveLocalDB(d);
      return { ok:true, correct, explanation: def.explanation, correctIndex: def.correct };
    }
    const teamRef = db.collection("teams").doc(teamId);
    let out;
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(teamRef);
      const team = snap.exists ? snap.data() : defaultTeam();
      const quiz = team.ipcQuiz || { started:true, done:false, questionIds:[], answers:{}, correct:0, wrong:0, score:0 };
      if (quiz.answers && quiz.answers[questionId]){
        out = { ok:true, already:true, correct: quiz.answers[questionId].correct, explanation: def.explanation, correctIndex: def.correct };
        return;
      }
      const answers = Object.assign({}, quiz.answers, { [questionId]: { selected: selectedIndex, correct } });
      const newQuiz = Object.assign({}, quiz, {
        answers,
        correct: (quiz.correct||0) + (correct?1:0),
        wrong: (quiz.wrong||0) + (correct?0:1),
        score: (quiz.score||0) + (correct ? pts : 0)
      });
      tx.set(teamRef, { ipcQuiz: newQuiz }, { merge:true });
      out = { ok:true, correct, explanation: def.explanation, correctIndex: def.correct };
    });
    return out;
  },

  // Clôt le quiz : crédite les points accumulés au score officiel de
  // l'équipe et marque la mission "quiz-ipc" comme validée (comme
  // n'importe quelle autre mission — visible dans le classement, la
  // barre de progression, etc.). Le chiffre secret (team.codeDigit,
  // statique dans data.js) ne devient affichable côté app.js que si
  // Store.teamMissionsComplete renvoie true (TOUTES les missions de
  // l'équipe terminées, pas seulement le quiz).
  async completeIpcQuiz(teamId){
    const missionId = "quiz-ipc";
    if (LOCAL_MODE){
      const d = loadLocalDB();
      const t = d.teams[teamId] = d.teams[teamId] || defaultTeam();
      if (t.completed && t.completed[missionId] && t.completed[missionId].status==="done") return false;
      const pts = (t.ipcQuiz && t.ipcQuiz.score) || 0;
      t.ipcQuiz = t.ipcQuiz || {}; t.ipcQuiz.done = true;
      t.completed = t.completed || {};
      t.completed[missionId] = { status:"done", points: pts, timestamp: nowTs(), instant:true };
      t.score = (t.score||0) + pts;
      saveLocalDB(d);
      return true;
    }
    const teamRef = db.collection("teams").doc(teamId);
    let applied = false;
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(teamRef);
      const team = snap.exists ? snap.data() : defaultTeam();
      if (team.completed && team.completed[missionId] && team.completed[missionId].status==="done") return;
      applied = true;
      const pts = (team.ipcQuiz && team.ipcQuiz.score) || 0;
      const quiz = Object.assign({}, team.ipcQuiz, { done:true });
      const completed = Object.assign({}, team.completed, { [missionId]: { status:"done", points: pts, timestamp: nowTs(), instant:true } });
      tx.set(teamRef, { ipcQuiz: quiz, completed, score: (team.score||0) + pts }, { merge:true });
    });
    return applied;
  },

  // ---------------- DÉFIS DU CHAPITRE 2 (tirage aléatoire) ----------------
  // Valide une question à choix multiple "quiz1" (un seul défi produit,
  // pas les 5 questions du Quiz IPC). Crédite def.points si correct, 0
  // sinon ; une seule tentative, comme les autres défis instantanés.
  async answerSingleQuiz(teamId, missionId, selectedIndex){
    const def = (GAME_DATA.challengeBank.items || []).find(i => i.id === missionId);
    if (!def) return { ok:false };
    const correct = selectedIndex === def.correct;
    const points = correct ? (def.points||0) : 0;
    if (LOCAL_MODE){
      const d = loadLocalDB();
      const t = d.teams[teamId] = d.teams[teamId] || defaultTeam();
      if (t.completed && t.completed[missionId] && t.completed[missionId].status==="done"){
        const prev = t.completed[missionId];
        return { ok:true, already:true, correct: prev.correct, points: prev.points, explanation: def.explanation };
      }
      t.completed = t.completed || {};
      t.completed[missionId] = { status:"done", points, correct, timestamp: nowTs() };
      t.score = (t.score||0) + points;
      saveLocalDB(d);
      return { ok:true, correct, points, explanation: def.explanation };
    }
    const teamRef = db.collection("teams").doc(teamId);
    let out;
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(teamRef);
      const team = snap.exists ? snap.data() : defaultTeam();
      if (team.completed && team.completed[missionId] && team.completed[missionId].status==="done"){
        const prev = team.completed[missionId];
        out = { ok:true, already:true, correct: prev.correct, points: prev.points, explanation: def.explanation };
        return;
      }
      const completed = Object.assign({}, team.completed, { [missionId]: { status:"done", points, correct, timestamp: nowTs() } });
      tx.set(teamRef, { completed, score: (team.score||0) + points }, { merge:true });
      out = { ok:true, correct, points, explanation: def.explanation };
    });
    return out;
  },

  // Fait tourner la Roue du Hasard : tire un résultat au hasard parmi
  // def.outcomes, crédite les points correspondants (peut être négatif ou
  // nul), marque la mission comme faite. Résultat renvoyé pour l'animation.
  async spinWheel(teamId, missionId, def){
    const outcome = def.outcomes[Math.floor(Math.random()*def.outcomes.length)];
    const outcomeIndex = def.outcomes.indexOf(outcome);
    if (LOCAL_MODE){
      const d = loadLocalDB();
      const t = d.teams[teamId] = d.teams[teamId] || defaultTeam();
      if (t.completed && t.completed[missionId] && t.completed[missionId].status==="done"){
        return { ok:true, already:true, outcome: t.completed[missionId].outcome, outcomeIndex: t.completed[missionId].outcomeIndex };
      }
      t.completed = t.completed || {};
      t.completed[missionId] = { status:"done", points: outcome.points, outcome: outcome.label, outcomeIndex, timestamp: nowTs() };
      t.score = Math.max(0, (t.score||0) + outcome.points);
      saveLocalDB(d);
      return { ok:true, outcome: outcome.label, outcomeIndex, points: outcome.points };
    }
    const teamRef = db.collection("teams").doc(teamId);
    let out;
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(teamRef);
      const team = snap.exists ? snap.data() : defaultTeam();
      if (team.completed && team.completed[missionId] && team.completed[missionId].status==="done"){
        out = { ok:true, already:true, outcome: team.completed[missionId].outcome, outcomeIndex: team.completed[missionId].outcomeIndex };
        return;
      }
      const completed = Object.assign({}, team.completed, { [missionId]: { status:"done", points: outcome.points, outcome: outcome.label, outcomeIndex, timestamp: nowTs() } });
      tx.set(teamRef, { completed, score: Math.max(0, (team.score||0) + outcome.points) }, { merge:true });
      out = { ok:true, outcome: outcome.label, outcomeIndex, points: outcome.points };
    });
    return out;
  },

  // Marque un défi festif comme "fait" et attribue ses points — obligatoires
  // et notés au même titre que les autres défis (voir data.js pour la
  // consigne stricte : jamais de gestion/obligation d'alcool, uniquement le
  // contenu de la mission qui est noté). Idempotent : un second appel sur le
  // même défi ne redonne pas les points. Écrit à la fois dans festifsDone
  // (affichage détaillé côté app.js) et dans completed (même clé que toutes
  // les autres missions, pour que coreMissionIds/teamMissionsComplete les
  // comptent naturellement dans "l'équipe a tout terminé").
  async markFestif(teamId, festifId){
    const def = (GAME_DATA.challengeBank && GAME_DATA.challengeBank.festifs || []).find(f => f.id === festifId);
    const points = (def && def.points) || 0;
    if (LOCAL_MODE){
      const d = loadLocalDB();
      const t = d.teams[teamId] = d.teams[teamId] || defaultTeam();
      t.festifsDone = t.festifsDone || {};
      t.completed = t.completed || {};
      if (t.festifsDone[festifId] && t.festifsDone[festifId].status === "done") return { ok:true, already:true, points: t.festifsDone[festifId].points };
      const entry = { status:"done", points, timestamp: nowTs() };
      t.festifsDone[festifId] = entry;
      t.completed[festifId] = entry;
      t.score = (t.score||0) + points;
      saveLocalDB(d);
      return { ok:true, points };
    }
    const teamRef = db.collection("teams").doc(teamId);
    let out = { ok:true, points };
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(teamRef);
      const team = snap.exists ? snap.data() : defaultTeam();
      if (team.festifsDone && team.festifsDone[festifId] && team.festifsDone[festifId].status === "done"){
        out = { ok:true, already:true, points: team.festifsDone[festifId].points };
        return;
      }
      const entry = { status:"done", points, timestamp: nowTs() };
      const festifsDone = Object.assign({}, team.festifsDone, { [festifId]: entry });
      const completed = Object.assign({}, team.completed, { [festifId]: entry });
      tx.set(teamRef, { festifsDone, completed, score: (team.score||0) + points }, { merge:true });
    });
    return out;
  },

  // ---------------- LE COFFRE IPC (finale commune) ----------------

  // Liste des identifiants de mission "core" d'une équipe (chapitres 1 à
  // currentChapter inclus). Exposé pour que app.js n'ait pas à dupliquer
  // cette logique (missionListFor peut désormais simplement délégier ici).
  coreMissionIds(teamId, currentChapter, teamData){
    return coreMissionIds(teamId, currentChapter, teamData);
  },

  // Numéro d'équipe (1 à 5), affiché dès le début : simple position dans
  // TEAM_ORDER, aucune donnée supplémentaire à stocker.
  teamNumber(teamId){
    const i = TEAM_ORDER.indexOf(teamId);
    return i === -1 ? null : i + 1;
  },

  // Une équipe a "terminé absolument toutes ses missions" quand chaque
  // identifiant renvoyé par coreMissionIds est marqué "done" dans
  // team.completed. Tant que ce n'est pas vrai, le chiffre secret de
  // l'équipe (team.codeDigit) ne doit être affiché nulle part.
  teamMissionsComplete(teamId, currentChapter, teamData){
    const ids = coreMissionIds(teamId, currentChapter, teamData);
    if (!ids.length) return false;
    const completed = (teamData && teamData.completed) || {};
    return ids.every(id => completed[id] && completed[id].status === "done");
  },

  // Vrai seulement quand les 5 équipes ont chacune terminé toutes leurs
  // missions — condition qui déclenche, côté admin, la notification
  // "rejoignez le téléphone principal" (voir renderCoffreTab dans admin.js).
  allTeamsComplete(currentChapter, allTeamsData){
    return TEAM_ORDER.every(t => this.teamMissionsComplete(t, currentChapter, (allTeamsData||{})[t]));
  },

  // Vérifie le code reconstitué à partir des 5 chiffres d'équipe (un par
  // équipe, dans l'ordre TEAM_ORDER — voir GAME_DATA.coffreCode). Si
  // correct, ouvre le coffre ET déclenche la même révélation finale que
  // Store.revealFinale() (classement + démasquage des dormants), vue par
  // toutes les équipes en même temps. N'est appelé QUE depuis le
  // "téléphone principal" (onglet admin 🔐 Coffre IPC) — jamais depuis
  // l'espace d'une équipe.
  async validateCoffreCode(code){
    const given = String(code||"").trim().toUpperCase().replace(/\s+/g,"");
    const correct = given === String(GAME_DATA.coffreCode||"").toUpperCase();
    if (!correct) return { ok:false };
    if (LOCAL_MODE){
      const d = loadLocalDB();
      d.config.coffreOpened = true;
      d.config.coffreOpenedAt = nowTs();
      d.config.finaleRevealed = true;
      saveLocalDB(d);
      return { ok:true };
    }
    await db.collection("config").doc("state").set({
      coffreOpened: true, coffreOpenedAt: nowTs(), finaleRevealed: true
    }, { merge:true });
    return { ok:true };
  },

  // Dès que les 5 équipes ont terminé toutes leurs missions, on prévient
  // tout le monde une seule fois ("🚨 MISSION TERMINÉE... rejoignez le
  // téléphone principal"), via notification push ET événement in-app de
  // secours. Le flag config.allCompleteNotifiedAt évite les envois en
  // double si l'admin garde le tableau de bord ouvert (listener qui
  // re-déclenche à chaque re-render).
  async notifyAllTeamsCompleteIfNeeded(currentChapter, allTeamsData){
    if (!this.allTeamsComplete(currentChapter, allTeamsData)) return false;
    if (LOCAL_MODE){
      const d = loadLocalDB();
      if (d.config.allCompleteNotifiedAt) return false;
      d.config.allCompleteNotifiedAt = nowTs();
      saveLocalDB(d);
    } else {
      const ref = db.collection("config").doc("state");
      const already = await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        const cfg = snap.exists ? snap.data() : {};
        if (cfg.allCompleteNotifiedAt) return true;
        tx.set(ref, { allCompleteNotifiedAt: nowTs() }, { merge:true });
        return false;
      });
      if (already) return false;
    }
    const title = "🚨 MISSION TERMINÉE";
    const body = "Tous les agents sont attendus au Quartier Général. Veuillez rejoindre le téléphone principal.";
    await this.broadcastEvent("all", "event", title, body);
    await this.sendNotificationNow("all", title, body, "finale");
    return true;
  },

  // Déclenche l'écran de révélation finale (classement, agents dormants,
  // réussite/échec) chez toutes les équipes en même temps.
  async revealFinale(){
    if (LOCAL_MODE){
      const d = loadLocalDB();
      d.config.finaleRevealed = true;
      saveLocalDB(d);
      return;
    }
    await db.collection("config").doc("state").set({ finaleRevealed: true }, { merge:true });
  },

  // ---------------- NOTIFICATIONS PUSH ----------------

  // Enregistre (ou met à jour) le token FCM d'un téléphone pour une équipe.
  // Le token sert d'identifiant de document → une réinscription écrase juste la même entrée.
  async saveFcmToken(teamId, token){
    if (LOCAL_MODE){
      const d = loadLocalDB();
      d.fcmTokens = d.fcmTokens || [];
      const existing = d.fcmTokens.find(t => t.token === token);
      if (existing) existing.teamId = teamId;
      else d.fcmTokens.push({ token, teamId, createdAt: nowTs() });
      saveLocalDB(d);
      return;
    }
    await db.collection("fcmTokens").doc(token).set({ token, teamId, createdAt: nowTs() }, { merge:true });
  },

  // Brouillons : préparés à l'avance, jamais envoyés tant qu'on ne clique pas "Envoyer".
  async saveNotificationDraft(target, title, body, type){
    const draft = { target, title, body, type: type||"info", createdAt: nowTs() };
    if (LOCAL_MODE){
      const d = loadLocalDB();
      draft.id = "d" + nowTs();
      d.notificationDrafts = d.notificationDrafts || [];
      d.notificationDrafts.push(draft);
      saveLocalDB(d);
      return draft.id;
    }
    const ref = await db.collection("notificationDrafts").add(draft);
    return ref.id;
  },

  listenDrafts(cb){
    if (LOCAL_MODE){
      const handler = () => {
        const d = loadLocalDB();
        cb([...(d.notificationDrafts||[])].sort((a,b)=>b.createdAt-a.createdAt));
      };
      window.addEventListener("bng-local-update", handler);
      handler();
      return () => window.removeEventListener("bng-local-update", handler);
    }
    return db.collection("notificationDrafts").onSnapshot(qs => {
      const out = []; qs.forEach(doc => out.push(Object.assign({id:doc.id}, doc.data())));
      out.sort((a,b)=> (b.createdAt||0) - (a.createdAt||0));
      cb(out);
    }, err => console.error("listenDrafts error:", err));
  },

  async deleteDraft(draftId){
    if (LOCAL_MODE){
      const d = loadLocalDB();
      d.notificationDrafts = (d.notificationDrafts||[]).filter(x => x.id !== draftId);
      saveLocalDB(d);
      return;
    }
    await db.collection("notificationDrafts").doc(draftId).delete();
  },

  // Écrit dans notificationsToSend → déclenche la Cloud Function "sendPushNotification"
  // (vraie notification push) ET alimente listenNotifications (filet de sécurité in-app).
  async sendNotificationNow(target, title, body, type){
    const notif = { target, title, body, type: type||"info", createdAt: nowTs() };
    if (LOCAL_MODE){
      const d = loadLocalDB();
      notif.id = "n" + nowTs();
      d.notificationsToSend = d.notificationsToSend || [];
      d.notificationsToSend.push(notif);
      saveLocalDB(d);
      return notif.id;
    }
    const ref = await db.collection("notificationsToSend").add(notif);
    return ref.id;
  },

  // Envoie un brouillon existant maintenant : copie son contenu dans notificationsToSend
  // puis retire le brouillon de la liste (pour ne pas le renvoyer par erreur).
  async sendDraftNow(draftId){
    if (LOCAL_MODE){
      const d = loadLocalDB();
      const draft = (d.notificationDrafts||[]).find(x => x.id === draftId);
      if (!draft) return;
      d.notificationsToSend = d.notificationsToSend || [];
      d.notificationsToSend.push({ id:"n"+nowTs(), target:draft.target, title:draft.title, body:draft.body, type:draft.type, createdAt: nowTs() });
      d.notificationDrafts = d.notificationDrafts.filter(x => x.id !== draftId);
      saveLocalDB(d);
      return;
    }
    const draftRef = db.collection("notificationDrafts").doc(draftId);
    const snap = await draftRef.get();
    if (!snap.exists) return;
    const draft = snap.data();
    await db.collection("notificationsToSend").add({
      target: draft.target, title: draft.title, body: draft.body, type: draft.type, createdAt: nowTs()
    });
    await draftRef.delete();
  },

  // Filet de sécurité : si l'appli est ouverte (même sans permission de notification
  // système accordée), on affiche quand même l'alerte en direct dans l'interface.
  listenNotifications(teamId, cb){
    if (LOCAL_MODE){
      const handler = () => {
        const d = loadLocalDB();
        cb((d.notificationsToSend||[]).filter(n => n.target === teamId || n.target === "all").sort((a,b)=>b.createdAt-a.createdAt));
      };
      window.addEventListener("bng-local-update", handler);
      handler();
      return () => window.removeEventListener("bng-local-update", handler);
    }
    return db.collection("notificationsToSend").orderBy("createdAt","desc").limit(50).onSnapshot(qs => {
      const out = [];
      qs.forEach(doc => { const n = doc.data(); if (n.target===teamId || n.target==="all") out.push(Object.assign({id:doc.id}, n)); });
      cb(out);
    }, err => console.error("listenNotifications error:", err));
  }
};

if (typeof window !== "undefined") window.Store = Store;
