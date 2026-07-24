/* ===================================================================
   APP.JS — logique de l'espace joueur / espace équipe
=================================================================== */

const TEAM_ORDER = ["casa","potter","batman","aventuriers","tarzan"];
const TEAM_EMOJI = { casa:"🎭", potter:"⚡", batman:"🦇", aventuriers:"🗺️", tarzan:"🌴" };
const FAIL_MESSAGES = [
  "Mauvaise piste, agent. Le plan s'effondre déjà.",
  "Non... et vos partenaires viennent silencieusement de perdre confiance en vous.",
  "Erreur. Le Choixpeau se moque de vous en silence.",
  "Raté. Gotham reste sans protection un peu plus longtemps.",
  "Cette réponse ferait fuir même Alfred.",
  "Non. La relique change de main pendant que vous hésitez.",
  "Jerry aurait fait mieux, honnêtement.",
  "Le plan du Professeur ne prévoyait pas... ça."
];

function normalize(s){
  return (s||"").toString().trim().toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g,"")
    .replace(/[^a-z0-9\s]/g,"");
}
function $(id){ return document.getElementById(id); }
function qsParam(name){ return new URLSearchParams(window.location.search).get(name); }
function fmtCountdown(ms){
  if (ms<=0) return "00:00";
  const s = Math.floor(ms/1000);
  const m = Math.floor(s/60);
  const r = s%60;
  return String(m).padStart(2,"0")+":"+String(r).padStart(2,"0");
}

/* ---------------- SON ---------------- */
function soundEnabled(){ return localStorage.getItem("bng_sound") !== "off"; }
function toggleSound(){ localStorage.setItem("bng_sound", soundEnabled() ? "off":"on"); }
let audioCtx;
function playBeep(kind){
  if (!soundEnabled()) return;
  if (window.AudioFX && AudioFX.isMuted()) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext||window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    const freqs = kind==="success" ? [660,880,1100] : kind==="fail" ? [220,180] : [440,660];
    o.type = "sine";
    let t = audioCtx.currentTime;
    freqs.forEach((f,i)=>{ o.frequency.setValueAtTime(f, t+i*0.09); });
    g.gain.setValueAtTime(0.001, t);
    g.gain.exponentialRampToValueAtTime(0.18, t+0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t+freqs.length*0.09+0.15);
    o.start(t); o.stop(t+freqs.length*0.09+0.2);
  } catch(e){}
}

/* ---------------- AMBIANCE (musique procédurale par équipe) ---------------- */
let ambientEngagedTheme = null;
function engageAmbient(theme){
  if (!window.AudioFX || ambientEngagedTheme === theme) return;
  try{
    AudioFX.ensureCtx();
    AudioFX.startAmbient(theme);
    ambientEngagedTheme = theme;
  } catch(e){}
}

/* ---------------- CINÉMATIQUE DE RÉVÉLATION D'ÉQUIPE ---------------- */
const CINEMATIC_PHRASES = {
  potter: "Le Choixpeau vous a réunis. Une ancienne magie protège désormais votre équipe.",
  casa: "Le braquage commence maintenant. Faites confiance à vos complices... mais jamais complètement.",
  batman: "Gotham compte sur vous. Chaque décision peut sauver... ou condamner votre équipe.",
  aventuriers: "Une relique oubliée vous attend. Les autres équipes sont déjà sur votre piste.",
  tarzan: "La jungle n'appartient qu'aux plus malins. Survivrez-vous jusqu'à la fin de la nuit ?"
};
function playCinematic(team, onDone){
  try{ if (window.AudioFX) AudioFX.ensureCtx(); } catch(e){}
  const overlay = document.createElement("div");
  overlay.className = "cinematic-overlay";
  document.body.appendChild(overlay);
  const steps = [
    { html: `<div class="cine-line">⚡ Connexion...</div>`, wait: 1300 },
    { html: `<div class="cine-title">ÉQUIPE IDENTIFIÉE</div>`, sfx:"chest", wait: 1500 },
    { html: `<div class="cine-logo">${TEAM_EMOJI[team.theme]}</div><div class="cine-title" style="font-size:1.5rem;">${team.nom}</div>`, sfx:"victory", ambient:true, wait: 1900 },
    { html: `<div class="cine-phrase">${CINEMATIC_PHRASES[team.theme]||""}</div>`, wait: 3400 }
  ];
  let i = 0;
  function next(){
    if (i >= steps.length){
      overlay.classList.add("cine-out");
      setTimeout(()=>{ overlay.remove(); if (onDone) onDone(); }, 600);
      return;
    }
    const step = steps[i];
    overlay.innerHTML = step.html;
    if (step.sfx && window.AudioFX) { try{ AudioFX.play(step.sfx, team.theme); }catch(e){} }
    if (step.ambient) engageAmbient(team.theme);
    i++;
    setTimeout(next, step.wait);
  }
  next();
}

/* ---------------- INTRO DE CHAPITRE ---------------- */
// Courte séquence auto-fermante jouée quand un nouveau chapitre s'active
// pendant que la joueuse a déjà sa page ouverte (pas de callback de
// navigation nécessaire, contrairement à playCinematic).
function playChapterIntro(chapitre, theme){
  const overlay = document.createElement("div");
  overlay.className = "cinematic-overlay";
  document.body.appendChild(overlay);
  const steps = [
    { html: `<div class="cine-line">📡 TRANSMISSION ENTRANTE</div>`, wait: 1300 },
    { html: `<div class="cine-title" style="font-size:1.6rem;">${chapitre.nom}</div><div class="cine-phrase">${chapitre.accroche||""}</div>`, wait: 3200 }
  ];
  let i = 0;
  function next(){
    if (i >= steps.length){
      overlay.classList.add("cine-out");
      setTimeout(()=> overlay.remove(), 600);
      return;
    }
    const step = steps[i];
    overlay.innerHTML = step.html;
    i++;
    setTimeout(next, step.wait);
  }
  next();
}

/* ---------------- OUVERTURE DE LA MALLETTE IPC ---------------- */
// Petite séquence jouée une fois, juste avant l'écran de révélation finale,
// quand la Mallette IPC vient d'être ouverte (code validé par n'importe
// quelle équipe). Même mécanique que playChapterIntro (overlay auto-fermant).
function playMalletteOpeningCinematic(team, onDone){
  try{ if (window.AudioFX) { AudioFX.ensureCtx(); AudioFX.play("chest", team.theme); } }catch(e){}
  const overlay = document.createElement("div");
  overlay.className = "cinematic-overlay";
  document.body.appendChild(overlay);
  const steps = [
    { html: `<div class="cine-line">🧳 Code reçu...</div>`, wait: 1100 },
    { html: `<div class="mallette-open-anim">🧳</div><div class="cine-title" style="font-size:1.5rem;">LA MALLETTE S'OUVRE</div>`, wait: 2200 },
    { html: `<div class="cine-phrase">TORNADE AD est sécurisée. La Cellule Ouessant referme le dossier.</div>`, wait: 2600 }
  ];
  let i = 0;
  function next(){
    if (i >= steps.length){
      overlay.classList.add("cine-out");
      setTimeout(()=>{ overlay.remove(); if (onDone) onDone(); }, 600);
      return;
    }
    const step = steps[i];
    overlay.innerHTML = step.html;
    i++;
    setTimeout(next, step.wait);
  }
  next();
}

/* ---------------- TOASTS ---------------- */
function toast(title, message, kind){
  const stack = $("toast-stack");
  const el = document.createElement("div");
  el.className = "toast pop-in";
  el.innerHTML = `<span class="toast-title">${title}</span>${message||""}`;
  stack.appendChild(el);
  playBeep(kind==="fail" ? "fail" : "success");
  setTimeout(()=>{ el.style.transition="opacity .4s"; el.style.opacity="0"; setTimeout(()=>el.remove(),400); }, 5200);
}

/* ---------------- MODAL ---------------- */
function openModal(innerHTML){
  const root = $("modal-root");
  root.innerHTML = `<div class="modal-overlay" id="modal-overlay">
    <div class="modal-sheet">
      <button class="modal-close" id="modal-close-btn"></button>
      ${innerHTML}
    </div>
  </div>`;
  $("modal-close-btn").onclick = closeModal;
  $("modal-overlay").addEventListener("click", (e)=>{ if(e.target.id==="modal-overlay") closeModal(); });
}
function closeModal(){ $("modal-root").innerHTML=""; }

/* ---------------- IMAGE ---------------- */
function compressImage(file){
  return new Promise((resolve,reject)=>{
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = (e)=>{
      const img = new Image();
      img.onload = ()=>{
        const maxW = 640;
        const scale = Math.min(1, maxW/img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width*scale; canvas.height = img.height*scale;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img,0,0,canvas.width,canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.6));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ===================================================================
   ROUTAGE
=================================================================== */
document.addEventListener("DOMContentLoaded", init);

function init(){
  document.body.removeAttribute("data-theme");
  // Enregistre le service worker (cache offline + réception des notifications
  // en arrière-plan) dès l'arrivée sur le site, indépendamment de la permission.
  if (window.Notifications) { try{ Notifications.registerServiceWorker(); }catch(e){} }
  const playerId = qsParam("player");
  const teamId = qsParam("team");
  if (playerId) renderPlayer(playerId);
  else if (teamId) renderTeam(teamId);
  else renderHome();
}

function renderHome(){
  $("app").innerHTML = `
    <div class="center-screen">
      <div class="icon-circle">🕶️</div>
      <h1>Opération Tornade AD</h1>
      <p class="dim">Ce site se découvre uniquement via un QR code personnel.<br>Scanne le tien pour rejoindre la Cellule Ouessant.</p>
      <div class="a2hs">Astuce : une fois ta page ouverte, ajoute-la à l'écran d'accueil de ton téléphone pour y revenir toute la soirée.</div>
    </div>`;
}

/* ===================================================================
   PHASE 1 — RÉVÉLATION JOUEUR + FORMATION D'ÉQUIPE
=================================================================== */
function renderPlayer(playerId){
  const player = GAME_DATA.players[playerId];
  if (!player){
    $("app").innerHTML = `<div class="center-screen"><h1>Introuvable</h1><p class="dim">Ce QR code ne correspond à aucun joueur. Vérifie le lien.</p></div>`;
    return;
  }
  const team = GAME_DATA.teams[player.team];
  document.body.setAttribute("data-theme", team.theme);

  const alreadyValidated = localStorage.getItem("bng_validated_"+playerId) === "1";

  const partnerCount = player.partners.length;
  const inputsHTML = player.partners.map((_,i)=>
    `<input type="text" id="partner-input-${i}" placeholder="${partnerCount>1 ? 'Prénom partenaire '+(i+1) : 'Prénom de ton/ta partenaire'}" autocomplete="off">`
  ).join("");

  $("app").innerHTML = `
    <div class="team-header">
      <div class="emoji">${TEAM_EMOJI[player.team]}</div>
      <span class="badge">${player.univers}</span>
      <h1>${player.personnage}</h1>
      <p class="dim">Bienvenue, ${player.nom}.</p>
    </div>

    <div class="card">
      <p>${player.intro}</p>
    </div>

    <div class="card">
      <h3>🔍 Indices sur ${partnerCount>1 ? "tes partenaires" : "ton/ta partenaire"}</h3>
      <ul class="indice-list">
        ${player.indices.map(i=>`<li>${i}</li>`).join("")}
      </ul>
      ${partnerCount>1 ? `<p class="dim" style="margin-top:8px;">Vous êtes trois. Retrouve les deux autres membres de ton équipe.</p>` : ""}
    </div>

    <div class="card" id="team-form-card">
      <h3>🤝 Former l'équipe</h3>
      <p class="dim">Une fois que tu penses avoir trouvé, entre le(s) prénom(s) ci-dessous.</p>
      ${inputsHTML}
      <button class="btn-block" id="validate-team-btn">Valider l'équipe</button>
      <div id="validate-result"></div>
    </div>

    ${alreadyValidated ? `<button class="btn-block btn-success" id="goto-team-btn">✅ Aller à l'espace équipe</button>` : ""}

    <footer class="site">Opération Tornade AD · ${team.nom}</footer>
  `;

  if (alreadyValidated){
    $("goto-team-btn").onclick = ()=> window.location.href = `index.html?team=${player.team}`;
  }

  $("validate-team-btn").onclick = ()=>{
    const values = player.partners.map((_,i)=> normalize($("partner-input-"+i).value));
    const expected = player.partners.map(pid => normalize(GAME_DATA.players[pid].nom)).sort();
    const given = values.filter(Boolean).sort();
    const ok = given.length === expected.length && expected.every((v,i)=> given[i] && (given[i]===v || given[i].includes(v) || v.includes(given[i])));

    if (ok){
      localStorage.setItem("bng_validated_"+playerId, "1");
      playBeep("success");
      $("validate-result").innerHTML = `<div class="msg ok pop-in">✅ Équipe validée. Votre mission peut commencer.</div>`;
      playCinematic(team, ()=> window.location.href = `index.html?team=${player.team}`);
    } else {
      playBeep("fail");
      const msg = FAIL_MESSAGES[Math.floor(Math.random()*FAIL_MESSAGES.length)];
      $("validate-result").innerHTML = `<div class="msg err pop-in">❌ ${msg}</div>`;
    }
  };
}

/* ===================================================================
   PHASE 2 — ESPACE D'ÉQUIPE
=================================================================== */
let _teamListeners = [];
let _lastConfig = { verreAssignment:{}, challengeAssignment:{}, currentChapter:0 };
let _lastAllTeams = {}; // dernier snapshot de toutes les équipes (pour la condition "5 quiz terminés" de la Mallette IPC)
let _finaleCineFired = {}; // garde idempotente : ne joue l'animation d'ouverture qu'une fois par équipe/session
function clearTeamListeners(){ _teamListeners.forEach(u=>u && u()); _teamListeners=[]; }

function renderTeam(teamId){
  const team = GAME_DATA.teams[teamId];
  if (!team){
    $("app").innerHTML = `<div class="center-screen"><h1>Équipe introuvable</h1></div>`;
    return;
  }
  document.body.setAttribute("data-theme", team.theme);
  clearTeamListeners();

  engageAmbient(team.theme);
  const ambientUnlock = ()=> engageAmbient(team.theme);
  document.addEventListener("click", ambientUnlock, { once:true });
  document.addEventListener("touchstart", ambientUnlock, { once:true });
  _teamListeners.push(()=>{
    document.removeEventListener("click", ambientUnlock);
    document.removeEventListener("touchstart", ambientUnlock);
  });

  Store.ensureTeam(teamId).then(()=>{
    let currentTeamData = null;
    let currentConfig = { verreAssignment:{}, challengeAssignment:{} };
    let currentMarket = [];
    let loadStartTs = Date.now();
    let shownEventIds = new Set();
    let shownNotifIds = new Set();
    let minuitFiring = false;

    const rerender = ()=> {
      if (!currentTeamData) return;
      if (currentConfig && currentConfig.finaleRevealed){
        if (!_finaleCineFired[teamId]){
          _finaleCineFired[teamId] = true;
          playMalletteOpeningCinematic(team, ()=> renderFinaleScreen(teamId, currentConfig));
        } else {
          renderFinaleScreen(teamId, currentConfig);
        }
      }
      else paintTeam(teamId, team, currentTeamData, currentConfig, currentMarket);
    };

    _teamListeners.push(Store.listenTeam(teamId, (data)=>{ currentTeamData = data; rerender(); }));
    _teamListeners.push(Store.listenConfig((cfg)=>{ currentConfig = cfg||currentConfig; _lastConfig = currentConfig; rerender(); }));
    _teamListeners.push(Store.listenMarket((offers)=>{ currentMarket = offers; rerender(); }));
    _teamListeners.push(Store.listenAllTeams((all)=>{ _lastAllTeams = all||{}; rerender(); }));
    _teamListeners.push(Store.listenEvents(teamId, (events)=>{
      events.forEach(e=>{
        const key = e.id || e.timestamp;
        if (e.timestamp >= loadStartTs && !shownEventIds.has(key)){
          shownEventIds.add(key);
          toast("🌩️ "+(e.title||"Événement"), e.message||"", e.type==="danger"?"fail":"success");
          if (window.AudioFX) { try{ AudioFX.play("event", team.theme); }catch(err){} }
        }
      });
    }));
    // Filet de sécurité : si les notifications système ne sont pas activées
    // (ou refusées), on affiche quand même l'alerte tant que la page est ouverte.
    _teamListeners.push(Store.listenNotifications(teamId, (notifs)=>{
      notifs.forEach(n=>{
        const key = n.id || n.createdAt;
        if (n.createdAt >= loadStartTs && !shownNotifIds.has(key)){
          shownNotifIds.add(key);
          toast(n.title||"🔔 Notification", n.body||"");
          if (navigator.vibrate) { try{ navigator.vibrate([200,100,200]); }catch(err){} }
          if (window.AudioFX) { try{ AudioFX.play("event", team.theme); }catch(err){} }
        }
      });
    }));

  });
}

// Renvoie la liste cumulée des missions visibles pour une équipe, du
// chapitre 1 jusqu'au chapitre actuellement activé par l'organisatrice.
function missionListFor(teamId, currentChapter){
  const chapterNum = currentChapter || 0;
  const byChapter = GAME_DATA.teams[teamId].missions;
  let out = [];
  for (let c = 1; c <= chapterNum; c++){
    if (byChapter[c]) out = out.concat(byChapter[c]);
  }
  return out;
}

// Écran de générique de fin : classement, réussite/échec du Protocole Omega,
// et révélation des deux agents dormants. Déclenché pour tout le monde en
// même temps par Store.revealFinale() depuis l'admin.
async function renderFinaleScreen(teamId, config){
  const team = GAME_DATA.teams[teamId];
  document.body.setAttribute("data-theme", team.theme);
  const allData = {};
  await Promise.all(TEAM_ORDER.map(async t=>{ allData[t] = await Store.getTeam(t); }));
  const ranking = TEAM_ORDER.map(t=>({ t, score:(allData[t]||{}).score||0 })).sort((a,b)=>b.score-a.score);
  const dormants = TEAM_ORDER.filter(t=> GAME_DATA.teams[t].dormant);
  const success = !!(config && config.malletteOpened);

  const html = `
    <div class="center-screen">
      <h1 style="color:var(--danger);">🏁 DOSSIER CLOS</h1>
      <p class="dim">${success
        ? "LA MALLETTE IPC EST OUVERTE. TORNADE AD SÉCURISÉE. Bon travail, agents. La Cellule Ouessant vous remercie pour votre service."
        : "La révélation a été déclenchée manuellement par l'organisatrice, avant l'ouverture complète de la mallette."}</p>
    </div>
    <div class="card">
      <h3>🏆 Classement final</h3>
      <ol style="padding-left:20px;">
        ${ranking.map(r=>`<li>${GAME_DATA.teams[r.t].nom} — <b>${r.score} pts</b></li>`).join("")}
      </ol>
    </div>
    <div class="card">
      <h3>🧠 Quiz IPC — statistiques</h3>
      <ul class="indice-list">
        ${TEAM_ORDER.map(t=>{
          const q = (allData[t]||{}).ipcQuiz || {};
          return `<li><b>${GAME_DATA.teams[t].nom}</b> — ${q.correct||0} bonnes réponses, ${q.wrong||0} mauvaises (🥃 ${q.wrong||0} gorgées), fragment « ${GAME_DATA.teams[t].codeFragment} »</li>`;
        }).join("")}
      </ul>
    </div>
    <div class="card" style="border-color:var(--danger);">
      <h3>🕶️ Révélation</h3>
      <p>Deux cellules présentes ce soir n'étaient pas ce qu'elles semblaient être :</p>
      <ul class="indice-list">
        ${dormants.map(t=>`<li><b>${GAME_DATA.teams[t].nom}</b> — Agent double, au service de ${GAME_DATA.teams[t].handler}. (${(allData[t]||{}).handlerScore||0} points Handler)</li>`).join("")}
      </ul>
      <p class="dim">Ni l'une ni l'autre ne savait, jusqu'à cet instant, que l'autre existait.</p>
    </div>
    <footer class="site">Fin de l'Opération Tornade AD</footer>
  `;
  $("app").innerHTML = html;
}

function getMissionDef(missionId){
  return GAME_DATA.commonMissions[missionId] || GAME_DATA.missions[missionId]
    || GAME_DATA.finalMissions[missionId] || (GAME_DATA.secretMissions && GAME_DATA.secretMissions[missionId]);
}

let _soundState = {};
let _soundFired = {}; // garde idempotente : {teamId: {doneCount:Set, chapter:0, minuit:bool}}
function paintTeam(teamId, team, data, config, market){
  market = market || [];
  const currentChapter = (config && config.currentChapter) || 0;
  const missions = missionListFor(teamId, currentChapter);
  const completed = data.completed || {};
  const doneCount = Object.values(completed).filter(c=>c.status==="done").length;

  // Effets sonores + cinématique déclenchés par un changement d'état
  // (validation de mission, nouveau chapitre, dénouement). Gardes idempotentes
  // par valeur atteinte : aucun doublon même si paintTeam est rappelé plusieurs
  // fois de suite pour la même donnée.
  if (window.AudioFX){
    const fired = _soundFired[teamId] = _soundFired[teamId] || { doneCounts:new Set(), chapter:0, minuit:false };
    const prev = _soundState[teamId];
    const minuitNow = !!(data && data.minuitFinalUnlocked);
    if (prev && doneCount > prev.doneCount && !fired.doneCounts.has(doneCount)){
      fired.doneCounts.add(doneCount);
      try{ AudioFX.play("validation", team.theme); }catch(e){}
    }
    if (currentChapter > fired.chapter){
      const isFirstPaint = !prev; // pas de cinématique au tout premier rendu de la page
      fired.chapter = currentChapter;
      if (!isFirstPaint){
        try{ AudioFX.play("chest", team.theme); }catch(e){}
        const ch = GAME_DATA.chapitres[currentChapter];
        if (ch) playChapterIntro(ch, team.theme);
      }
    }
    if (minuitNow && !fired.minuit){
      fired.minuit = true;
      try{ AudioFX.play("victory", team.theme); }catch(e){}
    }
    _soundState[teamId] = { doneCount };
  }
  const totalMissions = missions.length + (data.minuitFinalUnlocked ? 1 : 0);
  const progressPct = totalMissions ? Math.round((doneCount/totalMissions)*100) : 0;
  const blocked = data.blockedUntil && data.blockedUntil > Date.now();
  const protectedActive = data.protectedUntil && data.protectedUntil > Date.now();

  let html = "";

  if (data.minuitFinalUnlocked){
    html += `<div class="card pulse" style="border-color:var(--danger); background:linear-gradient(135deg, rgba(255,90,95,.18), rgba(0,0,0,.1)); text-align:center;">
      <h2 style="color:var(--danger); margin-bottom:4px;">⚠️ CHAPITRE 3 — LE DÉNOUEMENT</h2>
      <p class="dim">Pouvoirs réinitialisés, protections supprimées. La mission finale vous attend plus bas.</p>
    </div>`;
  }

  html += `
    <div class="team-header">
      <div class="emoji">${TEAM_EMOJI[teamId]}</div>
      <span class="badge">${team.membres.map(m=>GAME_DATA.players[m].nom).join(" & ")}</span>
      <h1>${team.nom}</h1>
      <p class="dim">${team.objectif}</p>
      <div class="score-display" id="score-display">${data.score||0}</div>
      <p class="dim">points</p>
      <div class="progress-wrap"><div class="progress-bar" style="width:${progressPct}%"></div></div>
      <p class="dim">${doneCount} / ${totalMissions} missions accomplies</p>
    </div>
  `;

  if (blocked){
    html += `<div class="card" style="border-color:var(--danger);text-align:center;">
      <h3>⛔ Équipe bloquée</h3>
      <p class="dim">Vous ne pouvez valider aucune mission pendant <b id="block-countdown">${fmtCountdown(data.blockedUntil-Date.now())}</b>.</p>
    </div>`;
  }
  if (protectedActive){
    html += `<div class="card" style="border-color:var(--success);text-align:center;">
      <p>🛡️ Protection active encore <b>${fmtCountdown(data.protectedUntil-Date.now())}</b></p>
    </div>`;
  }

  // Activation des notifications push (masqué une fois activées ou si non supporté)
  if (window.Notifications && !Notifications.alreadyEnabled(teamId) && Notifications.permissionState() !== "denied"){
    html += `<div class="card" style="text-align:center;border-color:var(--accent);">
      <p>🔔 Reçois une alerte direct sur ton téléphone dès qu'une mission ou un événement arrive, même appli fermée.</p>
      <button class="btn-block" id="enable-push-btn">Activer les notifications</button>
    </div>`;
  } else if (window.Notifications && Notifications.permissionState() === "denied"){
    html += `<div class="card" style="text-align:center;">
      <p class="dim">🔕 Notifications refusées sur ce téléphone. Pas de souci : garde l'onglet ouvert, les alertes s'affichent quand même dans le jeu.</p>
    </div>`;
  }

  // Pouvoir
  html += `<div class="card">
    <span class="badge">Pouvoir d'équipe</span>
    <h3>${team.pouvoir.nom}</h3>
    <p class="dim">${team.pouvoir.description}</p>
    <button class="btn-block ${data.powerUsed?'btn-outline':''}" id="power-btn" ${data.powerUsed?'disabled':''}>
      ${data.powerUsed ? "Pouvoir déjà utilisé" : "Utiliser le pouvoir"}
    </button>
  </div>`;

  // Canal privé — visible uniquement des agents dormants, jamais des autres équipes.
  if (team.dormant){
    const secretCompleted = data.secretCompleted || {};
    const secretIds = Object.keys(GAME_DATA.secretMissions || {}).filter(id => GAME_DATA.secretMissions[id].team === teamId);
    html += `<div class="card" style="border-color:var(--danger); background:rgba(179,18,27,.08);">
      <span class="badge" style="background:var(--danger);color:#fff;">🕶️ Canal privé</span>
      <h3>Message de ${team.handler}</h3>
      <p class="dim">Ceci n'existe pour aucune autre équipe. Agissez avec discrétion.</p>
    </div>`;
    secretIds.forEach(mid=>{ html += renderSecretMissionCard(teamId, mid, secretCompleted); });
  }

  // Missions du/des chapitre(s) actifs
  if (!currentChapter){
    html += `<div class="card" style="text-align:center;">
      <span class="badge">📂 Dossier confidentiel</span>
      <h3>En attente d'activation</h3>
      <p class="dim">Le Prologue n'a pas encore été lancé par l'organisatrice. Restez disponible, votre premier ordre de mission ne devrait pas tarder.</p>
    </div>`;
  } else {
    html += `<h2 style="margin-top:22px;">🎯 Ordres de mission</h2>`;
    missions.forEach(mid=>{
      html += renderMissionCard(teamId, mid, completed, false, config, null, data);
    });
  }

  // Mission finale — Chapitre 3 (Protocole Omega pour Harry Potter, mission
  // finale classique pour toute autre équipe qui en aurait une un jour).
  // ⚠️ minuitFinalUnlocked ne devrait plus jamais être vrai (aucune équipe
  // n'a de finalMission depuis le remplacement du Protocole Omega par la
  // Mallette IPC), mais une équipe testée AVANT ce remplacement peut avoir
  // ce champ resté à true dans Firestore. On vérifie donc que la mission
  // existe encore avant de tenter de l'afficher, pour ne jamais planter le
  // rendu sur d'anciennes données de test.
  if (data.minuitFinalUnlocked){
    const finalId = "final-" + teamId;
    const finalDef = getMissionDef(finalId);
    if (finalDef){
      const heading = finalDef.type === "omega" ? "⚠️ Protocole Omega" : "⚠️ Mission finale";
      html += `<h2 style="margin-top:22px;">${heading}</h2>`;
      html += renderMissionCard(teamId, finalId, completed, true, config, data.omegaActivatedAt, data);
    }
  }

  // Missions bonus (échange Tarzan & Jane)
  if (data.extraMissions && data.extraMissions.length){
    html += `<h2 style="margin-top:22px;">🔀 Missions échangées</h2>`;
    data.extraMissions.forEach(mid=>{
      html += renderMissionCard(teamId, mid, completed, false, config, null, data);
    });
  }

  // La Mallette IPC — finale commune, visible une fois les 5 équipes
  // ayant terminé leur Quiz IPC. N'importe quelle équipe peut saisir le
  // code (la fiction dit "rassemblez-vous autour du téléphone
  // d'Hermione", mais on ne verrouille pas techniquement sur un seul
  // téléphone : plus sûr pendant une vraie soirée si ce téléphone a un
  // souci). Reste masqué tant que tout le monde n'a pas fini.
  const allTeamsData = _lastAllTeams || {};
  const allQuizDone = TEAM_ORDER.every(t => allTeamsData[t] && allTeamsData[t].ipcQuiz && allTeamsData[t].ipcQuiz.done);
  if (allQuizDone && !(config && config.malletteOpened)){
    html += `
      <div class="card pulse" style="border-color:var(--accent); text-align:center; margin-top:22px;">
        <span class="badge" style="background:var(--accent);color:#0b0b14;">🧳 CONVERGENCE</span>
        <h3>La Mallette IPC</h3>
        <p class="dim">Les 5 fragments ont été distribués. Rassemblez-vous autour du téléphone d'Hermione, mettez vos fragments en commun dans l'ordre indiqué, et saisissez le code complet ci-dessous.</p>
        <input type="text" id="mallette-input" placeholder="Code complet" style="text-align:center;font-size:1.3rem;letter-spacing:4px;text-transform:uppercase;margin-top:8px;">
        <button class="btn-block" id="mallette-submit-btn" style="margin-top:8px;">🔓 Ouvrir la mallette</button>
        <p class="dim" id="mallette-status" style="margin-top:6px;"></p>
      </div>`;
  }

  html += `
    <div class="a2hs">Ajoute cette page à ton écran d'accueil (Partager → Sur l'écran d'accueil) pour la retrouver toute la soirée.</div>
    <footer class="site">Opération Tornade AD · ${team.nom}</footer>
    <button class="sound-toggle-btn" id="sound-toggle-btn" title="Couper / activer le son">${(window.AudioFX && AudioFX.isMuted()) ? "🔇" : "🔊"}</button>
  `;

  $("app").innerHTML = html;

  if (data.blockedUntil && data.blockedUntil>Date.now()){
    const cd = $("block-countdown");
    if (cd){
      const iv = setInterval(()=>{
        const left = data.blockedUntil-Date.now();
        if (left<=0){ clearInterval(iv); return; }
        if ($("block-countdown")) $("block-countdown").textContent = fmtCountdown(left);
        else clearInterval(iv);
      },1000);
    }
  }

  $("sound-toggle-btn").onclick = ()=>{
    engageAmbient(team.theme);
    const nowMuted = window.AudioFX ? AudioFX.toggleMuted() : false;
    $("sound-toggle-btn").textContent = nowMuted ? "🔇" : "🔊";
  };

  const pushBtn = $("enable-push-btn");
  if (pushBtn) pushBtn.onclick = async ()=>{
    pushBtn.disabled = true; pushBtn.textContent = "Activation…";
    const result = await Notifications.enableForTeam(teamId);
    if (result === "granted"){
      toast("🔔 Notifications activées", "Tu recevras les prochaines alertes directement.");
      renderTeam(teamId);
    } else if (result === "denied"){
      toast("Notifications refusées", "Pas de souci, les alertes resteront visibles dans le jeu.", "fail");
      renderTeam(teamId);
    } else {
      pushBtn.disabled = false; pushBtn.textContent = "Activer les notifications";
      toast("Notifications indisponibles", "Ce navigateur ne les supporte pas, ou la config n'est pas prête.", "fail");
    }
  };

  const powerBtn = $("power-btn");
  if (powerBtn && !data.powerUsed) powerBtn.onclick = ()=>{
    if (window.AudioFX) { try{ AudioFX.play("power", team.theme); }catch(e){} }
    openPowerModal(teamId, team, data);
  };

  missions.forEach((mid)=> wireMissionCard(teamId, mid, completed, blocked, false));
  if (data.extraMissions) data.extraMissions.forEach(mid=> wireMissionCard(teamId, mid, completed, blocked, false));
  if (data.minuitFinalUnlocked && getMissionDef("final-"+teamId)) wireMissionCard(teamId, "final-"+teamId, completed, blocked, true, data.omegaActivatedAt);

  const malletteBtn = $("mallette-submit-btn");
  if (malletteBtn) malletteBtn.onclick = async ()=>{
    const input = $("mallette-input");
    const status = $("mallette-status");
    const code = (input && input.value) || "";
    malletteBtn.disabled = true; malletteBtn.textContent = "Vérification...";
    const res = await Store.validateMalletteCode(code);
    if (res.ok){
      if (status) status.textContent = "";
      if (window.AudioFX){ try{ AudioFX.play("victory", team.theme); }catch(e){} }
    } else {
      if (status) status.textContent = "❌ Code incorrect. Réessayez.";
      if (input) input.value = "";
      malletteBtn.disabled = false; malletteBtn.textContent = "🔓 Ouvrir la mallette";
      if (window.AudioFX){ try{ AudioFX.play("event", team.theme); }catch(e){} }
    }
  };

  if (team.dormant){
    Object.keys(GAME_DATA.secretMissions || {}).filter(id => GAME_DATA.secretMissions[id].team === teamId).forEach(mid=>{
      const btn = document.querySelector(`[data-secret="${mid}"]`);
      if (btn) btn.onclick = ()=> validateSecret(teamId, mid, btn);
    });
  }
}

function renderSecretMissionCard(teamId, missionId, secretCompleted){
  const def = GAME_DATA.secretMissions[missionId];
  const state = secretCompleted[missionId];
  const done = state && state.status === "done";
  return `<div class="card pop-in dossier" style="border-color:var(--danger);">
    <span class="badge dossier-tag" style="color:var(--danger);">🕶️ SABOTAGE</span>
    <span class="badge points">+${def.points} pts (Handler)</span>
    ${done ? `<span class="badge done">✅ Réalisé</span>` : ""}
    <h3>${def.titre}</h3>
    <p>${def.description}</p>
    <div data-actions="${missionId}">${done ? "" : `<button class="btn-block" data-secret="${missionId}">✔️ Mission accomplie</button>`}</div>
  </div>`;
}

async function validateSecret(teamId, missionId, btn){
  const def = GAME_DATA.secretMissions[missionId];
  btn.disabled = true;
  btn.textContent = "Validation…";
  const ok = await Store.completeSecretMission(teamId, missionId, def.points || 0);
  if (ok){
    toast("🕶️ Sabotage réalisé", `+${def.points||0} points Handler (secret)`, "success");
  } else {
    btn.disabled = false;
    btn.textContent = "✔️ Mission accomplie";
  }
}

let _omegaGen = {};
function startOmegaCountdown(missionId, activatedAt){
  const def = getMissionDef(missionId);
  if (!activatedAt || !def) return;
  const deadline = activatedAt + (def.dureeMinutes||10)*60000;
  const myGen = (_omegaGen[missionId] = (_omegaGen[missionId]||0) + 1);
  const tick = ()=>{
    if (_omegaGen[missionId] !== myGen) return;
    const target = $("omega-countdown-"+missionId);
    if (!target) return;
    const left = deadline - Date.now();
    if (left<=0){ target.textContent = "00:00"; target.style.color = "var(--danger)"; return; }
    target.textContent = fmtCountdown(left);
    setTimeout(tick, 1000);
  };
  tick();
}

async function submitOmegaCode(teamId, missionId){
  const def = getMissionDef(missionId);
  const input = $("omega-input-"+missionId);
  const status = $("omega-status-"+missionId);
  const code = (input && input.value || "").trim();
  if (code.length !== 4){ if (status) status.textContent = "Le code fait 4 chiffres."; return; }
  if (status) status.textContent = "Déchiffrement en cours...";
  const res = await Store.validateOmegaCode(teamId, code, def);
  if (res.ok){
    if (status) status.textContent = "";
    toast("🔓 TORNADE AD SÉCURISÉE", "Le code était le bon. Bravo, agents.", "success");
    if (window.AudioFX){ try{ AudioFX.play("victory", (GAME_DATA.teams[teamId]||{}).theme); }catch(e){} }
  } else {
    if (status) status.textContent = "❌ Code incorrect. Réessayez.";
    if (input) input.value = "";
    if (window.AudioFX){ try{ AudioFX.play("event", (GAME_DATA.teams[teamId]||{}).theme); }catch(e){} }
  }
}

function renderMissionCard(teamId, missionId, completed, isFinal, config, omegaActivatedAt, teamData){
  const def = getMissionDef(missionId);
  if (!def) return ""; // filet de sécurité : identifiant de mission inconnu (ex: ancienne donnée) -> on n'affiche rien plutôt que de planter le rendu
  const state = completed[missionId];
  const pointsBadge = def.points ? `<span class="badge points">+${def.points} pts</span>` : "";

  let desc = def.description;
  if (missionId === "verre-destin"){
    const target = config && config.verreAssignment && config.verreAssignment[teamId];
    desc += target ? `<br><br><b>Cible tirée au sort : ${GAME_DATA.teams[target].nom}</b>` : `<br><br><i>En attente du tirage par l'organisatrice…</i>`;
  }

  let statusBadge = "";
  let bodyExtra = "";
  let cardClass = "card pop-in dossier";
  const isChoix = def.type === "choix";
  const isOmega = def.type === "omega";
  const isQuiz = def.type === "quiz";

  if (isQuiz && state && state.status === "done"){
    // Carte de fin de quiz : récap compact au lieu du badge générique.
    cardClass += " done";
    const q = (teamData && teamData.ipcQuiz) || {};
    const frag = (GAME_DATA.teams[teamId]||{}).codeFragment;
    const pos = (GAME_DATA.teams[teamId]||{}).fragmentPosition;
    return `<div class="${cardClass}" id="mission-${missionId}">
      <span class="badge dossier-tag">🧠 QUIZ IPC</span>
      <span class="badge done">✅ Terminé (+${state.points} pts)</span>
      <h3>${def.titre}</h3>
      <p class="dim">${q.correct||0} bonne(s) réponse(s) sur 5.</p>
      <div class="card" style="border-color:var(--accent); text-align:center; margin-top:10px;">
        <p class="dim">🔑 Fragment de code obtenu</p>
        <div class="score-display" style="font-size:1.6rem; letter-spacing:4px;">${frag}</div>
        <p class="dim">Position ${pos}/5 dans le code final</p>
      </div>
    </div>`;
  }

  if (state && state.status === "done"){
    cardClass += " done";
    if (isChoix){
      statusBadge = state.win
        ? `<span class="badge done">✅ Réussi (+${state.points} pts)</span>`
        : `<span class="badge" style="background:var(--danger);color:#fff;">💥 Raté (${state.points} pts)</span>`;
    } else if (isOmega){
      statusBadge = `<span class="badge done">🔓 Code validé</span>`;
    } else {
      statusBadge = `<span class="badge done">✅ Validée</span>`;
    }
  } else if (state && state.status === "rejected"){
    statusBadge = `<span class="badge">❌ Refusée</span>`;
    bodyExtra = `<button class="btn-block btn-sm" data-retry="${missionId}">Réessayer</button>`;
  } else if (isChoix){
    bodyExtra = `
      <div class="grid-2">
        <button class="btn-block btn-outline" data-safe="${missionId}">🔒 Sécuriser ${def.safePoints} pts</button>
        <button class="btn-block btn-danger" data-risky="${missionId}">🎲 Parier (${def.riskWin>0?'+':''}${def.riskWin} / ${def.riskLose})</button>
      </div>`;
  } else if (isOmega){
    bodyExtra = `
      <div class="omega-countdown" id="omega-countdown-${missionId}">--:--</div>
      <input type="text" inputmode="numeric" maxlength="4" id="omega-input-${missionId}" placeholder="Code à 4 chiffres" style="text-align:center;font-size:1.4rem;letter-spacing:6px;margin-top:8px;">
      <button class="btn-block" data-omega="${missionId}" style="margin-top:8px;">🔓 Déchiffrer</button>
      <p class="dim" id="omega-status-${missionId}" style="margin-top:6px;"></p>`;
  } else if (isQuiz){
    bodyExtra = `<button class="btn-block" data-quiz="${missionId}">🧠 Lancer le Quiz IPC</button>`;
  } else if (isFinal){
    bodyExtra = `<button class="btn-block" data-submit="${missionId}">✔️ Valider la mission finale</button>`;
  } else {
    bodyExtra = `<button class="btn-block" data-instant="${missionId}">✔️ Mission accomplie</button>`;
  }

  const eyebrow = isOmega ? "⚠️ PROTOCOLE OMEGA" : isQuiz ? "🧠 QUIZ IPC" : isFinal ? "⚠️ PRIORITÉ MAXIMALE" : (isChoix ? "🎯 ORDRE DE MISSION" : "📂 DOSSIER CONFIDENTIEL");

  return `<div class="${cardClass}" id="mission-${missionId}">
    <span class="badge dossier-tag">${eyebrow}</span>
    ${pointsBadge} ${statusBadge}
    <h3>${def.titre}</h3>
    <p>${desc}</p>
    ${def.penalite ? `<p class="dim">⚠️ ${def.penalite}</p>` : ""}
    <div data-actions="${missionId}">${bodyExtra}</div>
  </div>`;
}

function wireMissionCard(teamId, missionId, completed, blocked, isFinal, omegaActivatedAt){
  const instantBtn = document.querySelector(`[data-instant="${missionId}"]`);
  if (instantBtn){
    instantBtn.disabled = !!blocked;
    instantBtn.onclick = ()=> validateInstant(teamId, missionId, instantBtn);
  }
  const btn = document.querySelector(`[data-submit="${missionId}"]`);
  if (btn){
    btn.disabled = !!blocked;
    btn.onclick = ()=> openProofModal(teamId, missionId);
  }
  const retry = document.querySelector(`[data-retry="${missionId}"]`);
  if (retry){ retry.disabled = !!blocked; retry.onclick = ()=> openProofModal(teamId, missionId); }

  const safeBtn = document.querySelector(`[data-safe="${missionId}"]`);
  const riskyBtn = document.querySelector(`[data-risky="${missionId}"]`);
  if (safeBtn){
    safeBtn.disabled = !!blocked;
    safeBtn.onclick = ()=> resolveChoice(teamId, missionId, "safe");
  }
  if (riskyBtn){
    riskyBtn.disabled = !!blocked;
    riskyBtn.onclick = ()=> resolveChoice(teamId, missionId, "risky");
  }

  const omegaBtn = document.querySelector(`[data-omega="${missionId}"]`);
  if (omegaBtn){
    omegaBtn.onclick = ()=> submitOmegaCode(teamId, missionId);
    startOmegaCountdown(missionId, omegaActivatedAt);
  }

  const quizBtn = document.querySelector(`[data-quiz="${missionId}"]`);
  if (quizBtn){
    quizBtn.disabled = !!blocked;
    quizBtn.onclick = ()=> openIpcQuiz(teamId, missionId);
  }
}

async function validateInstant(teamId, missionId, btn){
  const def = getMissionDef(missionId);
  btn.disabled = true;
  btn.textContent = "Validation…";
  const ok = await Store.completeMissionInstant(teamId, missionId, def.points || 0);
  if (ok){
    if (window.AudioFX){ try{ AudioFX.play("validation", (GAME_DATA.teams[teamId]||{}).theme); }catch(e){} }
    toast("✅ Mission validée", `+${def.points||0} points`, "success");
  } else {
    btn.disabled = false;
    btn.textContent = "✔️ Mission accomplie";
  }
}

async function resolveChoice(teamId, missionId, choice){
  const def = getMissionDef(missionId);
  if (choice === "risky" && !confirm(`Tenter le pari ? Gain possible : +${def.riskWin} pts. Risque : ${def.riskLose} pts.`)) return;
  const res = await Store.resolveChoiceMission(teamId, missionId, choice, def);
  if (res.win){
    toast("🎉 Réussi !", `+${res.points} points`, "success");
  } else {
    toast("💥 Raté...", `${res.points} points`, "fail");
  }
}

/* ---------------- QUIZ IPC (écran plein-écran) ---------------- */
// Lance (ou reprend, si la page a été rafraîchie en cours de route) le
// tirage de 5 questions pour cette équipe, puis enchaîne les cartes.
async function openIpcQuiz(teamId, missionId){
  const quizState = await Store.startIpcQuiz(teamId);
  const questions = quizState.questionIds
    .map(id => GAME_DATA.ipcQuiz.bank.find(q => q.id === id))
    .filter(Boolean);
  renderQuizQuestion(teamId, missionId, questions, 0, {
    correct: quizState.correct||0, wrong: quizState.wrong||0, score: quizState.score||0
  });
}

function renderQuizQuestion(teamId, missionId, questions, idx, stats){
  const team = GAME_DATA.teams[teamId];
  if (idx >= questions.length) return finishIpcQuiz(teamId, missionId, stats);

  const q = questions[idx];
  const total = questions.length;
  const pct = Math.round((idx/total)*100);

  $("app").innerHTML = `
    <div class="team-header" style="padding-bottom:0;">
      <span class="badge">🧠 Question ${idx+1}/${total}</span>
      <span class="badge points">Score : ${stats.score||0} pts</span>
    </div>
    <div class="progress-wrap"><div class="progress-bar" style="width:${pct}%"></div></div>
    <div class="card quiz-card pop-in" id="quiz-card">
      <div class="quiz-timer" id="quiz-timer">${GAME_DATA.ipcQuiz.timerSeconds}</div>
      <h3>${q.question}</h3>
      <div id="quiz-options">
        ${q.options.map((opt,i)=>`<button class="btn-block btn-outline quiz-option" data-opt="${i}">${opt}</button>`).join("")}
      </div>
      <div id="quiz-feedback"></div>
    </div>
  `;

  let answered = false;
  let timeLeft = GAME_DATA.ipcQuiz.timerSeconds;
  const timerEl = $("quiz-timer");
  const timerIv = setInterval(()=>{
    timeLeft--;
    if (timerEl) timerEl.textContent = timeLeft;
    if (timeLeft <= 0){
      clearInterval(timerIv);
      if (!answered) selectAnswer(-1); // temps écoulé sans réponse = comptée comme mauvaise
    }
  }, 1000);

  async function selectAnswer(selectedIndex){
    if (answered) return;
    answered = true;
    clearInterval(timerIv);
    document.querySelectorAll(".quiz-option").forEach(b=> b.disabled = true);
    const res = await Store.answerIpcQuizQuestion(teamId, q.id, selectedIndex);
    const card = $("quiz-card");
    const feedback = $("quiz-feedback");
    if (res.correct){
      stats.correct = (stats.correct||0) + 1;
      stats.score = (stats.score||0) + (GAME_DATA.ipcQuiz.pointsPerCorrect||10);
      if (card) card.classList.add("quiz-flash-correct");
      if (feedback) feedback.innerHTML = `<p class="msg ok">✅ Bonne réponse ! ${res.explanation||""}</p>`;
      if (window.AudioFX){ try{ AudioFX.play("validation", team.theme); }catch(e){} }
    } else {
      stats.wrong = (stats.wrong||0) + 1;
      if (card) card.classList.add("quiz-flash-wrong");
      if (feedback) feedback.innerHTML = `<p class="msg err">❌ Mauvaise réponse. ${res.explanation||""}</p>`;
      if (window.AudioFX){ try{ AudioFX.play("event", team.theme); }catch(e){} }
    }
    document.querySelectorAll(".quiz-option").forEach((b,i)=>{
      if (i === res.correctIndex) b.classList.add("quiz-option-correct");
      else if (i === selectedIndex) b.classList.add("quiz-option-wrong");
    });
    setTimeout(()=> renderQuizQuestion(teamId, missionId, questions, idx+1, stats), 2600);
  }

  document.querySelectorAll(".quiz-option").forEach(b=>{
    b.onclick = ()=> selectAnswer(parseInt(b.dataset.opt,10));
  });
}

async function finishIpcQuiz(teamId, missionId, stats){
  await Store.completeIpcQuiz(teamId);
  const team = GAME_DATA.teams[teamId];
  $("app").innerHTML = `
    <div class="center-screen">
      <div class="icon-circle">🧠</div>
      <h1>Quiz terminé !</h1>
      <p class="dim">${stats.correct||0} bonne(s) réponse(s) sur 5 — +${stats.score||0} points.</p>
    </div>
    <div class="card" style="border-color:var(--accent); text-align:center;">
      <p class="dim">🔑 Fragment de code obtenu</p>
      <div class="score-display" style="font-size:1.8rem; letter-spacing:4px;">${team.codeFragment}</div>
      <p class="dim">Position ${team.fragmentPosition}/5 dans le code final. Notez-le précieusement.</p>
    </div>
    <button class="btn-block" id="quiz-back-btn" style="margin-top:12px;">Retour à mes missions</button>
  `;
  if (window.AudioFX){ try{ AudioFX.play("chest", team.theme); }catch(e){} }
  $("quiz-back-btn").onclick = ()=> renderTeam(teamId);
}

function openProofModal(teamId, missionId){
  const def = getMissionDef(missionId);
  openModal(`
    <h2>${def.titre}</h2>
    <p class="dim">Décris comment vous avez accompli la mission. Une photo aide beaucoup l'organisatrice à valider vite !</p>
    <label>Note / mot secret / description</label>
    <textarea id="proof-note" placeholder="Racontez votre exploit..."></textarea>
    <label>Photo (optionnel)</label>
    <input type="file" accept="image/*" capture="environment" id="proof-photo">
    <button class="btn-block" id="proof-submit-btn">Envoyer à l'organisatrice</button>
    <p class="dim" id="proof-status" style="margin-top:8px;"></p>
  `);
  $("proof-submit-btn").onclick = async ()=>{
    const note = $("proof-note").value.trim();
    const file = $("proof-photo").files[0];
    $("proof-submit-btn").disabled = true;
    $("proof-status").textContent = "Envoi en cours...";
    try {
      const photo = await compressImage(file);
      await Store.submitProof(teamId, missionId, note, photo);
      $("proof-status").textContent = "✅ Envoyé ! En attente de validation par l'organisatrice.";
      toast("📨 Preuve envoyée", "En attente de validation.", "success");
      setTimeout(closeModal, 1200);
    } catch(e){
      $("proof-status").textContent = "Erreur d'envoi, réessaie.";
      $("proof-submit-btn").disabled = false;
    }
  };
}

/* ---------------- POUVOIRS ---------------- */
function openPowerModal(teamId, team, data){
  const type = team.pouvoir.type;
  if (type === "vol_points"){
    const others = TEAM_ORDER.filter(t=>t!==teamId);
    openModal(`
      <h2>${team.pouvoir.nom}</h2>
      <p class="dim">Choisissez la cible de votre braquage (10 points).</p>
      ${others.map(t=>`<button class="btn-block btn-outline" style="margin-bottom:8px;" data-target="${t}">${GAME_DATA.teams[t].nom}</button>`).join("")}
    `);
    others.forEach(t=>{
      document.querySelector(`[data-target="${t}"]`).onclick = async ()=>{
        closeModal();
        const res = await Store.stealPoints(teamId, t, team.pouvoir.valeur);
        if (res.blocked){
          toast("🛡️ Braquage neutralisé", "L'équipe ciblée était protégée !", "fail");
          await Store.broadcastEvent("all","danger","🛡️ Braquage déjoué", `${team.nom} a tenté un braquage contre ${GAME_DATA.teams[t].nom}... neutralisé !`);
        } else {
          toast("💰 Braquage réussi", `+${team.pouvoir.valeur} points volés à ${GAME_DATA.teams[t].nom}.`, "success");
          await Store.broadcastEvent("all","event","💰 Braquage !", `${team.nom} a volé ${team.pouvoir.valeur} points à ${GAME_DATA.teams[t].nom} !`);
        }
      };
    });
  } else if (type === "protection"){
    openModal(`
      <h2>${team.pouvoir.nom}</h2>
      <p class="dim">Active une protection de 10 minutes contre les vols de points, et alerte l'organisatrice de ta vigilance.</p>
      <button class="btn-block" id="confirm-protection">Activer la protection</button>
    `);
    $("confirm-protection").onclick = async ()=>{
      closeModal();
      await Store.setProtection(teamId, 10);
      toast("🦇 Protection activée", "Vigilance active pendant 10 minutes.", "success");
      await Store.broadcastEvent("all","event","🦇 Vigilance activée", `${team.nom} veille sur Gotham. Protection active.`);
    };
  } else if (type === "annule_penalite"){
    openModal(`
      <h2>${team.pouvoir.nom}</h2>
      <p class="dim">Choisissez votre sortilège :</p>
      <button class="btn-block" style="margin-bottom:8px;" id="btn-revert-penalty">Annuler la dernière pénalité reçue</button>
      <button class="btn-block btn-outline" id="btn-reset-mission">Rejouer une mission refusée</button>
      <p class="dim" id="power-result" style="margin-top:8px;"></p>
    `);
    $("btn-revert-penalty").onclick = async ()=>{
      const ok = await Store.revertLastPenalty(teamId);
      $("power-result").textContent = ok ? "✅ Pénalité annulée !" : "Aucune pénalité à annuler pour l'instant.";
      if (ok) { toast("⏳ Retourneur de Temps", "Une pénalité a été annulée.", "success"); setTimeout(closeModal,1200); }
    };
    $("btn-reset-mission").onclick = ()=>{
      const rejected = Object.entries(data.completed||{}).filter(([,v])=>v.status==="rejected").map(([k])=>k);
      if (!rejected.length){ $("power-result").textContent = "Aucune mission refusée à rejouer."; return; }
      $("power-result").innerHTML = rejected.map(mid=>`<button class="btn-block btn-sm" style="margin-top:6px;" data-mid="${mid}">${getMissionDef(mid).titre}</button>`).join("");
      rejected.forEach(mid=>{
        document.querySelector(`[data-mid="${mid}"]`).onclick = async ()=>{
          await Store.resetRejectedMission(teamId, mid);
          toast("⏳ Retourneur de Temps", "Mission de nouveau disponible !", "success");
          closeModal();
        };
      });
    };
  } else if (type === "indice"){
    openModal(`
      <h2>${team.pouvoir.nom}</h2>
      <p class="dim">Une demande sera envoyée à l'organisatrice, qui vous donnera un indice supplémentaire sur la mission de votre choix.</p>
      <button class="btn-block" id="confirm-hint">Envoyer la demande</button>
    `);
    $("confirm-hint").onclick = async ()=>{
      await Store.requestHint(teamId);
      toast("🧭 Demande envoyée", "L'organisatrice va vous transmettre un indice.", "success");
      closeModal();
    };
  } else if (type === "echange_mission"){
    const others = TEAM_ORDER.filter(t=>t!==teamId);
    openModal(`
      <h2>${team.pouvoir.nom}</h2>
      <p class="dim">Choisissez l'équipe avec qui échanger une mission débloquée.</p>
      ${others.map(t=>`<button class="btn-block btn-outline" style="margin-bottom:8px;" data-target="${t}">${GAME_DATA.teams[t].nom}</button>`).join("")}
    `);
    others.forEach(t=>{
      document.querySelector(`[data-target="${t}"]`).onclick = async ()=>{
        const otherData = await Store.getTeam(t);
        const myData = await Store.getTeam(teamId);
        const chapterNow = _lastConfig.currentChapter || 0;
        const otherMissions = missionListFor(t, chapterNow).filter(mid=> !otherData.completed || !otherData.completed[mid]);
        const myMissions = missionListFor(teamId, chapterNow).filter(mid=> !myData.completed || !myData.completed[mid]);
        if (!otherMissions.length || !myMissions.length){
          openModal(`<h2>Impossible</h2><p class="dim">Aucune mission échangeable pour le moment avec cette équipe.</p>`);
          return;
        }
        openModal(`
          <h2>Choisissez votre offre</h2>
          <label>Votre mission à céder</label>
          <select id="my-mission">${myMissions.map(m=>`<option value="${m}">${getMissionDef(m).titre}</option>`).join("")}</select>
          <label>Leur mission que vous récupérez</label>
          <select id="their-mission">${otherMissions.map(m=>`<option value="${m}">${getMissionDef(m).titre}</option>`).join("")}</select>
          <button class="btn-block" id="confirm-swap">Échanger</button>
        `);
        $("confirm-swap").onclick = async ()=>{
          const mine = $("my-mission").value; const theirs = $("their-mission").value;
          await Store.swapMissions(teamId, mine, t, theirs);
          toast("🔀 Échange effectué", `Chaos ! Mission échangée avec ${GAME_DATA.teams[t].nom}.`, "success");
          await Store.broadcastEvent(t,"event","🔀 Échange forcé", `${team.nom} a échangé une mission avec vous !`);
          closeModal();
        };
      };
    });
  }
}
