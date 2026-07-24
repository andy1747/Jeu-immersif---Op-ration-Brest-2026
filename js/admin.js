/* ===================================================================
   ADMIN.JS — panneau organisatrice
=================================================================== */

const TEAM_ORDER = ["casa","potter","batman","aventuriers","tarzan"];
const TEAM_EMOJI = { casa:"🎭", potter:"⚡", batman:"🦇", aventuriers:"🗺️", tarzan:"🌴" };

function $(id){ return document.getElementById(id); }
function getMissionDef(missionId){
  return GAME_DATA.commonMissions[missionId] || GAME_DATA.missions[missionId]
    || GAME_DATA.finalMissions[missionId] || (GAME_DATA.secretMissions && GAME_DATA.secretMissions[missionId]);
}
function fmtTime(ts){ return new Date(ts).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}); }

function toast(title, message, kind){
  const stack = $("toast-stack");
  const el = document.createElement("div");
  el.className = "toast pop-in";
  if (kind==="fail") el.style.background = "linear-gradient(135deg,#ff5a5f,#a30000)";
  el.innerHTML = `<span class="toast-title">${title}</span>${message||""}`;
  stack.appendChild(el);
  setTimeout(()=>{ el.style.transition="opacity .4s"; el.style.opacity="0"; setTimeout(()=>el.remove(),400); }, 4500);
}
function openModal(innerHTML){
  const root = $("modal-root");
  root.innerHTML = `<div class="modal-overlay" id="modal-overlay">
    <div class="modal-sheet"><button class="modal-close" id="modal-close-btn"></button>${innerHTML}</div>
  </div>`;
  $("modal-close-btn").onclick = closeModal;
  $("modal-overlay").addEventListener("click", (e)=>{ if(e.target.id==="modal-overlay") closeModal(); });
}
function closeModal(){ $("modal-root").innerHTML=""; }

/* ---------------- ALERTES (son + notif + badge onglet) ---------------- */
let audioCtx;
function playAlertBeep(){
  if (localStorage.getItem("bng_admin_sound") === "off") return;
  try {
    audioCtx = audioCtx || new (window.AudioContext||window.webkitAudioContext)();
    const freqs = [520, 780, 520, 780];
    let t = audioCtx.currentTime;
    freqs.forEach((f,i)=>{
      const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
      o.connect(g); g.connect(audioCtx.destination);
      o.type = "sine"; o.frequency.setValueAtTime(f, t+i*0.16);
      g.gain.setValueAtTime(0.001, t+i*0.16);
      g.gain.exponentialRampToValueAtTime(0.22, t+i*0.16+0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t+i*0.16+0.14);
      o.start(t+i*0.16); o.stop(t+i*0.16+0.15);
    });
  } catch(e){}
}
function notifSupported(){ return typeof Notification !== "undefined"; }
function notifPermissionState(){ return notifSupported() ? Notification.permission : "unsupported"; }
async function requestNotifPermission(){
  if (!notifSupported()) return "unsupported";
  const p = await Notification.requestPermission();
  return p;
}
function fireNotification(title, body){
  if (notifSupported() && Notification.permission === "granted"){
    try { new Notification(title, { body, icon: undefined }); } catch(e){}
  }
}
const ORIGINAL_TITLE = document.title;
function updateTitleBadge(count){
  document.title = count>0 ? `🔴(${count}) ${ORIGINAL_TITLE}` : ORIGINAL_TITLE;
}
let KNOWN_PENDING_IDS = new Set();
let FIRST_PROOFS_PASS = true;
function checkForNewProofs(list){
  const pending = list.filter(p=>p.status==="pending");
  updateTitleBadge(pending.length);
  const currentIds = new Set(pending.map(p=> p.id || (p.teamId+p.createdAt)));
  if (!FIRST_PROOFS_PASS){
    const newOnes = pending.filter(p => !KNOWN_PENDING_IDS.has(p.id || (p.teamId+p.createdAt)));
    if (newOnes.length){
      playAlertBeep();
      newOnes.forEach(p=>{
        const def = getMissionDef(p.missionId);
        const team = GAME_DATA.teams[p.teamId];
        fireNotification("📸 Nouvelle preuve à valider", `${team?team.nom:p.teamId} — ${def?def.titre:p.missionId}`);
      });
      toast("🔔 Nouvelle preuve", newOnes.length>1 ? `${newOnes.length} preuves en attente` : "Une équipe attend ta validation");
    }
  }
  FIRST_PROOFS_PASS = false;
  KNOWN_PENDING_IDS = currentIds;
}

document.addEventListener("DOMContentLoaded", init);

function init(){
  if (sessionStorage.getItem("bng_admin_auth") === "1") renderDashboard();
  else renderLogin();
}

function renderLogin(){
  $("app").innerHTML = `
    <div class="center-screen">
      <div class="icon-circle">🔐</div>
      <h1>Espace organisatrice</h1>
      <p class="dim">Entre le mot de passe admin.</p>
      <input type="password" id="admin-pass" placeholder="Mot de passe" style="max-width:280px;">
      <button id="admin-login-btn" class="btn-block" style="max-width:280px;">Entrer</button>
      <p class="dim" id="admin-login-err"></p>
    </div>`;
  $("admin-login-btn").onclick = ()=>{
    if ($("admin-pass").value === ADMIN_PASSWORD){
      sessionStorage.setItem("bng_admin_auth","1");
      renderDashboard();
    } else {
      $("admin-login-err").textContent = "Mot de passe incorrect.";
    }
  };
}

let TEAMS_CACHE = {};
let PROOFS_CACHE = [];
let REQUESTS_CACHE = [];
let CONFIG_CACHE = {};
let DRAFTS_CACHE = [];
let CURRENT_TAB = "scores";
let listenersStarted = false;

function renderDashboard(){
  if (!listenersStarted){
    listenersStarted = true;
    Store.listenAllTeams(d=>{ TEAMS_CACHE = d; if(document.getElementById('tab-content')) renderTabContent(); });
    Store.listenProofs("*", d=>{ PROOFS_CACHE = d; checkForNewProofs(d); if(document.getElementById('tab-content')) renderTabContent(); });
    Store.listenRequests(d=>{ REQUESTS_CACHE = d; if(document.getElementById('tab-content')) renderTabContent(); });
    Store.listenConfig(d=>{ CONFIG_CACHE = d||{}; if(document.getElementById('tab-content')) renderTabContent(); });
    Store.listenDrafts(d=>{ DRAFTS_CACHE = d; if(document.getElementById('tab-content')) renderTabContent(); });
  }
  const pendingCount = PROOFS_CACHE.filter(p=>p.status==="pending").length;
  const reqCount = REQUESTS_CACHE.filter(r=>r.status==="pending").length;

  const notifState = notifPermissionState();
  $("app").innerHTML = `
    <div class="row between" style="margin-bottom:6px;">
      <h1 style="margin:0;">🎛️ Admin</h1>
      <button class="btn-outline btn-sm" id="logout-btn">Se déconnecter</button>
    </div>
    <p class="dim">Opération Tornade AD — Cellule Ouessant, panneau organisatrice</p>
    ${notifState==="granted" ? `<div class="msg ok">🔔 Notifications activées</div>` : notifState==="unsupported" ? "" : `
      <div class="card" style="padding:12px 16px;">
        <div class="row between">
          <span class="dim">🔔 Reçois une alerte quand une preuve arrive</span>
          <button class="btn-sm" id="enable-notif-btn">Activer</button>
        </div>
      </div>`}
    <div class="tabs">
      <div class="tab" data-tab="chapitres">📖 Chapitres</div>
      <div class="tab" data-tab="scores">🏆 Scores</div>
      <div class="tab" data-tab="proofs">📸 Preuves${pendingCount?` (${pendingCount})`:""}</div>
      <div class="tab" data-tab="draws">🎲 Tirages</div>
      <div class="tab" data-tab="events">🌩️ Événements</div>
      <div class="tab" data-tab="requests">🧭 Demandes${reqCount?` (${reqCount})`:""}</div>
      <div class="tab" data-tab="notifications">🔔 Notifications${DRAFTS_CACHE.length?` (${DRAFTS_CACHE.length})`:""}</div>
      <div class="tab" data-tab="dormants">🕶️ Dormants</div>
      <div class="tab" data-tab="awards">🥇 Récompenses</div>
    </div>
    <div id="tab-content"></div>
  `;
  $("logout-btn").onclick = ()=>{ sessionStorage.removeItem("bng_admin_auth"); renderLogin(); };
  const notifBtn = $("enable-notif-btn");
  if (notifBtn) notifBtn.onclick = async ()=>{
    const p = await requestNotifPermission();
    if (p === "granted") { toast("🔔 Notifications activées", ""); renderDashboard(); }
    else toast("Notifications refusées", "Tu peux les activer plus tard dans les réglages de Safari.", "fail");
  };
  document.querySelectorAll(".tab").forEach(t=>{
    t.onclick = ()=>{ CURRENT_TAB = t.dataset.tab; renderDashboard(); };
  });
  renderTabContent();
}

function renderTabContent(){
  document.querySelectorAll(".tab").forEach(t=> t.classList.toggle("active", t.dataset.tab===CURRENT_TAB));
  const c = $("tab-content");
  if (!c) return;
  if (CURRENT_TAB==="chapitres") return renderChapitresTab(c);
  if (CURRENT_TAB==="scores") return renderScoresTab(c);
  if (CURRENT_TAB==="proofs") return renderProofsTab(c);
  if (CURRENT_TAB==="draws") return renderDrawsTab(c);
  if (CURRENT_TAB==="events") return renderEventsTab(c);
  if (CURRENT_TAB==="requests") return renderRequestsTab(c);
  if (CURRENT_TAB==="notifications") return renderNotificationsTab(c);
  if (CURRENT_TAB==="dormants") return renderDormantsTab(c);
  if (CURRENT_TAB==="awards") return renderAwardsTab(c);
}

/* ---------------- CHAPITRES ---------------- */
function missionCountFor(teamId, currentChapter){
  const byChapter = GAME_DATA.teams[teamId].missions;
  let total = 0;
  for (let n = 1; n <= currentChapter; n++){
    if (byChapter[n]) total += byChapter[n].length;
  }
  return total;
}

function renderChapitresTab(c){
  const current = CONFIG_CACHE.currentChapter || 0;
  c.innerHTML = `
    <div class="card" style="text-align:center;">
      <h2>📖 Chapitres</h2>
      <p class="dim">Chapitre actuel : <b>${current ? GAME_DATA.chapitres[current].nom : "Aucun — la soirée n'a pas encore commencé"}</b></p>
    </div>
    ${[1,2,3].map(n=>{
      const ch = GAME_DATA.chapitres[n];
      const active = current === n;
      const done = current > n;
      return `<div class="card" style="${active ? 'border-color:var(--accent);' : ''}">
        <span class="badge ${done||active?'done':''}">${done ? '✅ Terminé' : active ? '▶️ Chapitre en cours' : 'À venir'}</span>
        <h3>Chapitre ${n} — ${ch.nom}</h3>
        <p class="dim">${ch.accroche}</p>
        <button class="btn-block ${(active||done)?'btn-outline':''}" data-activate-chapter="${n}">
          ${active ? "🔁 Ré-envoyer la notification" : done ? "Relancer ce chapitre" : "Activer ce chapitre"}
        </button>
      </div>`;
    }).join("")}
  `;
  document.querySelectorAll("[data-activate-chapter]").forEach(b=> b.onclick = async ()=>{
    const n = parseInt(b.dataset.activateChapter,10);
    const ch = GAME_DATA.chapitres[n];
    if (!confirm(`Activer le Chapitre ${n} — ${ch.nom} ?\nUne notification sera envoyée à toutes les équipes.`)) return;
    await Store.activateChapter(n, TEAM_ORDER, ch.notifTitle, ch.notifBody);
    toast(`📖 Chapitre ${n} activé`, ch.nom);
    renderTabContent();
  });
}

/* ---------------- SCORES ---------------- */
function renderScoresTab(c){
  const currentChapter = CONFIG_CACHE.currentChapter || 0;
  const rows = TEAM_ORDER.map(tid=>{
    const team = GAME_DATA.teams[tid];
    const d = TEAMS_CACHE[tid] || {};
    const done = Object.values(d.completed||{}).filter(x=>x.status==="done").length;
    const total = missionCountFor(tid, currentChapter) + (d.minuitFinalUnlocked ? 1 : 0);
    const blocked = d.blockedUntil && d.blockedUntil>Date.now();
    return `<div class="card">
      <div class="row between">
        <h3>${TEAM_EMOJI[tid]} ${team.nom}</h3>
        <span class="score-display" style="font-size:1.8rem;">${d.score||0}</span>
      </div>
      <p class="dim">${done}/${total||"?"} missions · ${d.powerUsed?"pouvoir utilisé":"pouvoir disponible"} ${blocked?" · ⛔ bloquée":""}${team.dormant?` · 🕶️ ${d.handlerScore||0} pts Handler`:""} · 🥃 ${(d.ipcQuiz&&d.ipcQuiz.wrong)||0} gorgées</p>
      <div class="grid-2">
        <button class="btn-sm btn-outline" data-adj="${tid}:10">+10</button>
        <button class="btn-sm btn-outline" data-adj="${tid}:-10">-10</button>
        <button class="btn-sm btn-outline" data-adj="${tid}:20">+20</button>
        <button class="btn-sm btn-outline" data-adj="${tid}:-5">-5</button>
      </div>
      <div class="grid-2" style="margin-top:8px;">
        <button class="btn-sm ${blocked?'btn-success':'btn-danger'}" data-block="${tid}" style="grid-column:span 2;">${blocked?"Débloquer l'équipe":"Bloquer 10 min"}</button>
      </div>
    </div>`;
  }).join("");
  c.innerHTML = rows;
  document.querySelectorAll("[data-adj]").forEach(b=> b.onclick = async ()=>{
    const [tid, amt] = b.dataset.adj.split(":");
    await Store.adjustPoints(tid, parseInt(amt,10), "Ajustement manuel admin");
    toast("Points ajustés", `${amt} pts pour ${GAME_DATA.teams[tid].nom}`);
  });
  document.querySelectorAll("[data-block]").forEach(b=> b.onclick = async ()=>{
    const tid = b.dataset.block;
    const d = TEAMS_CACHE[tid]||{};
    if (d.blockedUntil && d.blockedUntil>Date.now()) await Store.unblockTeam(tid);
    else await Store.blockTeam(tid, 10);
    toast("Statut mis à jour", GAME_DATA.teams[tid].nom);
  });
}

/* ---------------- PREUVES ---------------- */
function renderProofsTab(c){
  const pending = PROOFS_CACHE.filter(p=>p.status==="pending").sort((a,b)=>a.createdAt-b.createdAt);
  if (!pending.length){ c.innerHTML = `<div class="card"><p class="dim">Aucune preuve en attente pour le moment.</p></div>`; return; }
  c.innerHTML = pending.map(p=>{
    const def = getMissionDef(p.missionId);
    const team = GAME_DATA.teams[p.teamId];
    return `<div class="card pending">
      <span class="badge pending">En attente</span>
      <h3>${team ? team.nom : p.teamId} — ${def ? def.titre : p.missionId}</h3>
      <p class="dim">${fmtTime(p.createdAt)}</p>
      ${p.note ? `<p>"${p.note}"</p>` : ""}
      ${p.photo ? `<img src="${p.photo}" style="width:100%;border-radius:12px;margin:8px 0;">` : ""}
      <div class="grid-2">
        <button class="btn-success btn-sm" data-approve="${p.teamId}:${p.id}:${p.missionId}">✅ Valider (+${def?def.points:0})</button>
        <button class="btn-danger btn-sm" data-reject="${p.teamId}:${p.id}:${p.missionId}">❌ Refuser</button>
      </div>
    </div>`;
  }).join("");
  document.querySelectorAll("[data-approve]").forEach(b=> b.onclick = async ()=>{
    const [teamId, proofId, missionId] = b.dataset.approve.split(":");
    const def = getMissionDef(missionId);
    await Store.approveProof(teamId, proofId, missionId, def.points||0);
    toast("✅ Mission validée", `${GAME_DATA.teams[teamId].nom} +${def.points||0} pts`);
  });
  document.querySelectorAll("[data-reject]").forEach(b=> b.onclick = ()=>{
    const [teamId, proofId, missionId] = b.dataset.reject.split(":");
    openModal(`
      <h2>Refuser la mission</h2>
      <p class="dim">Pénalité optionnelle (0 par défaut).</p>
      <select id="penalty-select">
        <option value="0">Aucune pénalité</option>
        <option value="-5">-5 points</option>
        <option value="-15">-15 points</option>
      </select>
      <button class="btn-block btn-danger" id="confirm-reject">Confirmer le refus</button>
    `);
    $("confirm-reject").onclick = async ()=>{
      const penalty = parseInt($("penalty-select").value,10);
      await Store.rejectProof(teamId, proofId, missionId, penalty);
      toast("❌ Mission refusée", GAME_DATA.teams[teamId].nom);
      closeModal();
    };
  });
}

/* ---------------- TIRAGES / INDICES ---------------- */
function renderDrawsTab(c){
  c.innerHTML = `
    <div class="card">
      <h3>🕶️ Fenêtre Roland</h3>
      <p class="dim">L'interrogatoire de Roland est une interaction en direct, pas une mécanique numérique : chaque équipe valide elle-même la mission « Interroger Roland » (chapitre 1) une fois l'échange terminé. Rien à faire ici — improvisez ses réponses selon la qualité des questions posées (voir le dossier de conception, section 8).</p>
    </div>
    <div class="card">
      <h3>🎁 Indice ou rebondissement</h3>
      <p class="dim">Envoie un indice, un rebondissement (ex : « Signal intercepté ») ou un petit coup de pouce improvisé à une équipe ou à tout le monde.</p>
      <select id="bonus-team">
        <option value="all">Toutes les équipes</option>
        ${TEAM_ORDER.map(t=>`<option value="${t}">${GAME_DATA.teams[t].nom}</option>`).join("")}
      </select>
      <input type="text" id="bonus-title" placeholder="Titre (ex : Signal intercepté)">
      <textarea id="bonus-msg" placeholder="Message affiché à l'équipe..."></textarea>
      <button class="btn-block" id="send-bonus">Envoyer</button>
    </div>
  `;
  $("send-bonus").onclick = async ()=>{
    const target = $("bonus-team").value;
    const title = $("bonus-title").value.trim() || "Indice";
    const msg = $("bonus-msg").value.trim();
    await Store.broadcastEvent(target, "event", title, msg);
    toast("Envoyé", target==="all" ? "Toutes les équipes" : GAME_DATA.teams[target].nom);
  };
}

/* ---------------- AGENTS DORMANTS (confidentiel) ---------------- */
function renderDormantsTab(c){
  const dormantTeams = TEAM_ORDER.filter(t => GAME_DATA.teams[t].dormant);

  c.innerHTML = `
    <div class="card" style="border-color:var(--danger);">
      <h3>🕶️ Agents dormants — confidentiel</h3>
      <p class="dim">Réservé à l'organisatrice. Ne jamais afficher cet onglet à l'écran pendant la soirée.</p>
    </div>
    ${dormantTeams.map(t=>{
      const d = TEAMS_CACHE[t] || {};
      const secretIds = Object.keys(GAME_DATA.secretMissions).filter(id => GAME_DATA.secretMissions[id].team === t);
      const doneCount = secretIds.filter(id => d.secretCompleted && d.secretCompleted[id] && d.secretCompleted[id].status === "done").length;
      return `<div class="card">
        <h3>${GAME_DATA.teams[t].nom} — commanditaire : ${GAME_DATA.teams[t].handler}</h3>
        <p class="dim">${doneCount}/${secretIds.length} sabotages réalisés · <b>${d.handlerScore||0} points Handler</b></p>
      </div>`;
    }).join("")}

    <div class="card" style="border-color:var(--accent);">
      <h3>🧳 Mallette IPC — code final</h3>
      <p class="dim">Code complet à reconstituer (les équipes n'en voient jamais que leur fragment) : <b style="letter-spacing:3px;">${GAME_DATA.malletteCode}</b></p>
      <p class="dim">${CONFIG_CACHE.malletteOpened ? "✅ Mallette déjà ouverte." : "En attente que les 5 équipes terminent leur Quiz IPC, puis saisissent le code réuni."}</p>
      <table style="width:100%; border-collapse:collapse; margin-top:8px;">
        ${TEAM_ORDER.map(t=>{
          const d = TEAMS_CACHE[t] || {};
          const q = d.ipcQuiz || {};
          return `<tr>
            <td style="padding:4px 0;">${TEAM_EMOJI[t]} ${GAME_DATA.teams[t].nom}</td>
            <td style="padding:4px 0;">Fragment <b>${GAME_DATA.teams[t].codeFragment}</b> (pos. ${GAME_DATA.teams[t].fragmentPosition})</td>
            <td style="padding:4px 0;">${q.done ? "✅ Quiz fait" : q.started ? "⏳ En cours" : "— Pas commencé"}</td>
            <td style="padding:4px 0;">🥃 ${q.wrong||0} gorgées</td>
          </tr>`;
        }).join("")}
      </table>
    </div>

    <div class="card" style="text-align:center;">
      <h3>🏁 Révélation finale</h3>
      <p class="dim">Déclenche l'écran de fin (classement, statistiques du Quiz IPC, révélation des agents dormants) chez toutes les équipes en même temps. Normalement automatique dès que la Mallette IPC est ouverte — ce bouton sert de secours (technique) si besoin de forcer la main.</p>
      <button class="btn-block btn-danger" id="reveal-btn" ${CONFIG_CACHE.finaleRevealed ? "disabled" : ""}>
        ${CONFIG_CACHE.finaleRevealed ? "✅ Révélation déjà déclenchée" : "🏁 Déclencher la révélation finale (secours)"}
      </button>
    </div>
  `;
  const revealBtn = $("reveal-btn");
  if (revealBtn && !CONFIG_CACHE.finaleRevealed) revealBtn.onclick = async ()=>{
    if (!confirm("Déclencher la révélation finale maintenant ? Visible instantanément par toutes les équipes.")) return;
    await Store.revealFinale();
    toast("🏁 Révélation déclenchée", "");
    renderTabContent();
  };
}

/* ---------------- ÉVÉNEMENTS ---------------- */
const EVENT_PRESETS = [
  { id:"malediction", label:"🕯️ Malédiction", title:"Malédiction !", msg:"Une malédiction s'abat sur votre équipe. L'organisatrice vous en dira plus...", danger:true },
  { id:"bonus", label:"✨ Bonus", title:"Bonus surprise !", msg:"Un bonus de points inattendu vous est accordé.", danger:false },
  { id:"piege", label:"🪤 Piège", title:"Piège déclenché", msg:"Vous venez de tomber dans un piège. Restez vigilants.", danger:true },
  { id:"urgente", label:"⏰ Mission urgente", title:"Mission urgente !", msg:"Une mission urgente vient d'apparaître. Vous avez 5 minutes.", danger:true },
  { id:"echange", label:"🔀 Échange de mission", title:"Échange forcé", msg:"Une de vos missions vient d'être échangée avec une autre équipe.", danger:false },
  { id:"vol", label:"💸 Vol de points", title:"Vol de points !", msg:"Une équipe adverse vous a discrètement volé des points.", danger:true },
  { id:"alliance", label:"🤝 Proposition d'alliance", title:"Alliance proposée", msg:"Une équipe adverse vous propose une alliance. À vous de décider.", danger:false },
  { id:"trahison", label:"🗡️ Trahison", title:"Trahison !", msg:"Une alliance vient d'être rompue à vos dépens.", danger:true },
  { id:"enigme", label:"❓ Énigme", title:"Énigme surprise", msg:"Une énigme flash vous attend. L'organisatrice va vous la transmettre.", danger:false },
  { id:"faux_indice", label:"🎭 Faux indice", title:"Rumeur douteuse...", msg:"Un indice circule à votre sujet... mais est-il vrai ?", danger:false }
];

function renderEventsTab(c){
  c.innerHTML = `
    <div class="card">
      <h3>Déclencher un événement</h3>
      <label>Cible</label>
      <select id="event-target">
        <option value="all">Toutes les équipes</option>
        ${TEAM_ORDER.map(t=>`<option value="${t}">${GAME_DATA.teams[t].nom}</option>`).join("")}
      </select>
      <label>Type</label>
      <div class="grid-2" id="preset-grid">
        ${EVENT_PRESETS.map(p=>`<button class="btn-sm btn-outline" data-preset="${p.id}">${p.label}</button>`).join("")}
      </div>
      <hr class="hr">
      <label>Titre (personnalisable)</label>
      <input type="text" id="event-title" placeholder="Titre de l'événement">
      <label>Message</label>
      <textarea id="event-msg" placeholder="Message affiché à l'équipe"></textarea>
      <button class="btn-block" id="send-event">Envoyer</button>
    </div>
    <div class="card">
      <h3>💥 Points volés (manuel)</h3>
      <p class="dim">Transférer des points entre deux équipes (hors pouvoir).</p>
      <select id="steal-from">${TEAM_ORDER.map(t=>`<option value="${t}">${GAME_DATA.teams[t].nom}</option>`).join("")}</select>
      <select id="steal-to">${TEAM_ORDER.map(t=>`<option value="${t}">${GAME_DATA.teams[t].nom}</option>`).join("")}</select>
      <input type="number" id="steal-amount" placeholder="Montant" value="10">
      <button class="btn-block btn-danger" id="do-steal">Transférer</button>
    </div>
  `;
  document.querySelectorAll("[data-preset]").forEach(b=>{
    b.onclick = ()=>{
      const p = EVENT_PRESETS.find(x=>x.id===b.dataset.preset);
      $("event-title").value = p.title; $("event-msg").value = p.msg;
      document.querySelectorAll("[data-preset]").forEach(x=>x.classList.remove("active"));
      b.classList.add("active");
    };
  });
  $("send-event").onclick = async ()=>{
    const target = $("event-target").value;
    const title = $("event-title").value.trim() || "Événement";
    const msg = $("event-msg").value.trim();
    await Store.broadcastEvent(target, "event", title, msg);
    toast("Événement envoyé", target==="all" ? "Toutes les équipes" : GAME_DATA.teams[target].nom);
  };
  $("do-steal").onclick = async ()=>{
    const from = $("steal-from").value, to = $("steal-to").value, amt = parseInt($("steal-amount").value,10)||0;
    if (from===to) { toast("Impossible","Choisis deux équipes différentes","fail"); return; }
    await Store.adjustPoints(from, -amt, "Transfert admin vers "+to);
    await Store.adjustPoints(to, amt, "Transfert admin depuis "+from);
    await Store.broadcastEvent(to,"event","💸 Vol de points", `${amt} points vous ont été discrètement pris par ${GAME_DATA.teams[from].nom} !`);
    toast("Transfert effectué", `${amt} pts de ${GAME_DATA.teams[from].nom} vers ${GAME_DATA.teams[to].nom}`);
  };
}

/* ---------------- DEMANDES D'INDICES ---------------- */
function renderRequestsTab(c){
  const pending = REQUESTS_CACHE.filter(r=>r.status==="pending");
  if (!pending.length){ c.innerHTML = `<div class="card"><p class="dim">Aucune demande en attente.</p></div>`; return; }
  c.innerHTML = pending.map(r=>`
    <div class="card">
      <h3>${GAME_DATA.teams[r.teamId] ? GAME_DATA.teams[r.teamId].nom : r.teamId}</h3>
      <p class="dim">Demande d'indice · ${fmtTime(r.timestamp)}</p>
      <p>Donnez-leur un indice en direct, puis marquez la demande comme traitée.</p>
      <button class="btn-block btn-sm" data-done="${r.id||r.timestamp}">Marquer comme traité</button>
    </div>
  `).join("");
  document.querySelectorAll("[data-done]").forEach(b=> b.onclick = ()=>{
    // Simplification : masque localement (les requêtes n'ont pas de update dédié en mode local)
    b.closest(".card").style.opacity = ".4";
    b.disabled = true; b.textContent = "Traité ✓";
  });
}

/* ---------------- NOTIFICATIONS PUSH ---------------- */
function renderNotificationsTab(c){
  const rankingText = ()=>{
    const rows = TEAM_ORDER
      .map(tid => ({ tid, score:(TEAMS_CACHE[tid]||{}).score||0 }))
      .sort((a,b)=> b.score-a.score);
    return rows.map((r,i)=> `${i+1}. ${GAME_DATA.teams[r.tid].nom} — ${r.score} pts`).join("\n");
  };

  c.innerHTML = `
    <div class="card">
      <h3>⚡ Actions rapides</h3>
      <p class="dim">Envoyées immédiatement (vraie notification push + alerte dans le jeu).</p>
      <button class="btn-block" id="qa-mission-all" style="margin-bottom:8px;">🚨 Envoyer une mission à toutes les équipes</button>
      <div class="grid-2" id="qa-mission-team-grid" style="margin-bottom:8px;"></div>
      <button class="btn-block btn-outline" id="qa-bonus-btn" style="margin-bottom:8px;">💰 Donner un bonus secret à une équipe</button>
      <button class="btn-block btn-outline" id="qa-ranking-btn">📊 Publier le classement provisoire</button>
    </div>

    <div class="card">
      <h3>Préparer un brouillon</h3>
      <p class="dim">Rédige à l'avance, envoie plus tard au bon moment.</p>
      <select id="draft-target">
        <option value="all">Toutes les équipes</option>
        ${TEAM_ORDER.map(t=>`<option value="${t}">${GAME_DATA.teams[t].nom}</option>`).join("")}
      </select>
      <input type="text" id="draft-title" placeholder="Titre (ex : Nouvelle mission)">
      <textarea id="draft-body" placeholder="Message affiché dans la notification..."></textarea>
      <button class="btn-block" id="draft-save-btn">Enregistrer comme brouillon</button>
    </div>

    <h2 style="margin-top:20px;">Brouillons en attente</h2>
    ${!DRAFTS_CACHE.length ? `<div class="card"><p class="dim">Aucun brouillon pour le moment.</p></div>` : DRAFTS_CACHE.map(d=>{
      const teamName = d.target==="all" ? "Toutes les équipes" : (GAME_DATA.teams[d.target]?GAME_DATA.teams[d.target].nom:d.target);
      return `<div class="card">
        <span class="badge">${teamName}</span>
        <h3>${d.title}</h3>
        <p>${d.body}</p>
        <div class="grid-2">
          <button class="btn-success btn-sm" data-send-draft="${d.id}">📤 Envoyer maintenant</button>
          <button class="btn-danger btn-sm" data-delete-draft="${d.id}">🗑️ Supprimer</button>
        </div>
      </div>`;
    }).join("")}
  `;

  const teamGrid = $("qa-mission-team-grid");
  teamGrid.innerHTML = TEAM_ORDER.map(t=>`<button class="btn-sm btn-outline" data-qa-team="${t}">${TEAM_EMOJI[t]} ${GAME_DATA.teams[t].nom}</button>`).join("");

  $("qa-mission-all").onclick = async ()=>{
    await Store.sendNotificationNow("all", "🎯 Nouvel ordre de mission", "Une nouvelle mission vient d'être débloquée. Ouvrez le jeu !", "mission");
    toast("🚨 Notification envoyée", "À toutes les équipes");
  };
  document.querySelectorAll("[data-qa-team]").forEach(b=> b.onclick = async ()=>{
    const tid = b.dataset.qaTeam;
    await Store.sendNotificationNow(tid, "🎯 Nouvel ordre de mission", "Une mission vous est spécialement destinée. Ouvrez le jeu !", "mission");
    toast("Notification envoyée", GAME_DATA.teams[tid].nom);
  });
  $("qa-bonus-btn").onclick = ()=> openBonusModal();
  $("qa-ranking-btn").onclick = async ()=>{
    await Store.sendNotificationNow("all", "📊 Classement provisoire", rankingText(), "classement");
    toast("📊 Classement envoyé", "À toutes les équipes");
  };
  $("draft-save-btn").onclick = async ()=>{
    const target = $("draft-target").value;
    const title = $("draft-title").value.trim();
    const body = $("draft-body").value.trim();
    if (!title) return;
    await Store.saveNotificationDraft(target, title, body, "info");
    toast("Brouillon enregistré", "Il apparaît dans la liste ci-dessous.");
    renderTabContent();
  };
  document.querySelectorAll("[data-send-draft]").forEach(b=> b.onclick = async ()=>{
    await Store.sendDraftNow(b.dataset.sendDraft);
    toast("📤 Notification envoyée", "");
  });
  document.querySelectorAll("[data-delete-draft]").forEach(b=> b.onclick = async ()=>{
    await Store.deleteDraft(b.dataset.deleteDraft);
  });
}

function openBonusModal(){
  openModal(`
    <h2>💰 Bonus secret</h2>
    <p class="dim">Ajoute des points ET prévient l'équipe par notification.</p>
    <select id="bonus-team">${TEAM_ORDER.map(t=>`<option value="${t}">${GAME_DATA.teams[t].nom}</option>`).join("")}</select>
    <label>Points</label>
    <input type="number" id="bonus-points" value="15">
    <label>Message (optionnel)</label>
    <input type="text" id="bonus-msg" placeholder="Ex : Pour votre créativité ce soir !">
    <button class="btn-block" id="bonus-send-btn">Envoyer le bonus</button>
  `);
  $("bonus-send-btn").onclick = async ()=>{
    const team = $("bonus-team").value;
    const points = parseInt($("bonus-points").value,10) || 0;
    const msg = $("bonus-msg").value.trim();
    await Store.adjustPoints(team, points, "Bonus secret de l'organisatrice");
    await Store.sendNotificationNow(team, "💰 Bonus secret", msg || `+${points} points viennent de vous être offerts !`, "bonus");
    toast("💰 Bonus envoyé", `${GAME_DATA.teams[team].nom} +${points} pts`);
    closeModal();
  };
}

/* ---------------- RÉCOMPENSES ---------------- */
function renderAwardsTab(c){
  const ranking = TEAM_ORDER.map(t=>({ t, score:(TEAMS_CACHE[t]&&TEAMS_CACHE[t].score)||0 })).sort((a,b)=>b.score-a.score);
  c.innerHTML = `
    <div class="card">
      <h3>🏆 Classement en direct</h3>
      <ol style="padding-left:20px;">
        ${ranking.map(r=>`<li>${GAME_DATA.teams[r.t].nom} — <b>${r.score} pts</b></li>`).join("")}
      </ol>
    </div>
    <div class="card">
      <h3>🥇 Récompenses de fin de soirée</h3>
      <p class="dim">À annoncer en fin de soirée : équipe gagnante (classement), + prix bonus ci-dessous à décider en direct.</p>
      <ul class="indice-list">
        <li>🏆 Équipe gagnante : score final le plus haut</li>
        <li>🧠 Meilleure enquête</li>
        <li>🎭 Meilleur bluff</li>
        <li>😂 Mission la plus drôle</li>
        <li>🕶️ Meilleur agent double (score Handler le plus élevé)</li>
        <li>📸 Meilleure photo / preuve</li>
      </ul>
    </div>
  `;
}
