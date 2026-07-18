/* ===================================================================
   ADMIN.JS — panneau organisatrice
=================================================================== */

const TEAM_ORDER = ["casa","potter","batman","aventuriers","tomjerry"];
const TEAM_EMOJI = { casa:"🎭", potter:"⚡", batman:"🦇", aventuriers:"🗺️", tomjerry:"🐱" };

function $(id){ return document.getElementById(id); }
function getMissionDef(missionId){ return GAME_DATA.commonMissions[missionId] || GAME_DATA.missions[missionId]; }
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
let CURRENT_TAB = "scores";
let listenersStarted = false;

function renderDashboard(){
  if (!listenersStarted){
    listenersStarted = true;
    Store.listenAllTeams(d=>{ TEAMS_CACHE = d; if(document.getElementById('tab-content')) renderTabContent(); });
    Store.listenProofs("*", d=>{ PROOFS_CACHE = d; if(document.getElementById('tab-content')) renderTabContent(); });
    Store.listenRequests(d=>{ REQUESTS_CACHE = d; if(document.getElementById('tab-content')) renderTabContent(); });
    Store.listenConfig(d=>{ CONFIG_CACHE = d||{}; if(document.getElementById('tab-content')) renderTabContent(); });
  }
  const pendingCount = PROOFS_CACHE.filter(p=>p.status==="pending").length;
  const reqCount = REQUESTS_CACHE.filter(r=>r.status==="pending").length;

  $("app").innerHTML = `
    <div class="row between" style="margin-bottom:6px;">
      <h1 style="margin:0;">🎛️ Admin</h1>
      <button class="btn-outline btn-sm" id="logout-btn">Se déconnecter</button>
    </div>
    <p class="dim">Brest Night Game — panneau organisatrice</p>
    <div class="tabs">
      <div class="tab" data-tab="scores">🏆 Scores</div>
      <div class="tab" data-tab="proofs">📸 Preuves${pendingCount?` (${pendingCount})`:""}</div>
      <div class="tab" data-tab="draws">🎲 Tirages</div>
      <div class="tab" data-tab="events">🌩️ Événements</div>
      <div class="tab" data-tab="requests">🧭 Demandes${reqCount?` (${reqCount})`:""}</div>
      <div class="tab" data-tab="awards">🥇 Récompenses</div>
    </div>
    <div id="tab-content"></div>
  `;
  $("logout-btn").onclick = ()=>{ sessionStorage.removeItem("bng_admin_auth"); renderLogin(); };
  document.querySelectorAll(".tab").forEach(t=>{
    t.onclick = ()=>{ CURRENT_TAB = t.dataset.tab; renderDashboard(); };
  });
  renderTabContent();
}

function renderTabContent(){
  document.querySelectorAll(".tab").forEach(t=> t.classList.toggle("active", t.dataset.tab===CURRENT_TAB));
  const c = $("tab-content");
  if (!c) return;
  if (CURRENT_TAB==="scores") return renderScoresTab(c);
  if (CURRENT_TAB==="proofs") return renderProofsTab(c);
  if (CURRENT_TAB==="draws") return renderDrawsTab(c);
  if (CURRENT_TAB==="events") return renderEventsTab(c);
  if (CURRENT_TAB==="requests") return renderRequestsTab(c);
  if (CURRENT_TAB==="awards") return renderAwardsTab(c);
}

/* ---------------- SCORES ---------------- */
function renderScoresTab(c){
  const rows = TEAM_ORDER.map(tid=>{
    const team = GAME_DATA.teams[tid];
    const d = TEAMS_CACHE[tid] || {};
    const done = Object.values(d.completed||{}).filter(x=>x.status==="done").length;
    const blocked = d.blockedUntil && d.blockedUntil>Date.now();
    return `<div class="card">
      <div class="row between">
        <h3>${TEAM_EMOJI[tid]} ${team.nom}</h3>
        <span class="score-display" style="font-size:1.8rem;">${d.score||0}</span>
      </div>
      <p class="dim">${done}/10 missions · ${d.powerUsed?"pouvoir utilisé":"pouvoir disponible"} ${blocked?" · ⛔ bloquée":""}</p>
      <div class="grid-2">
        <button class="btn-sm btn-outline" data-adj="${tid}:10">+10</button>
        <button class="btn-sm btn-outline" data-adj="${tid}:-10">-10</button>
        <button class="btn-sm btn-outline" data-adj="${tid}:20">+20</button>
        <button class="btn-sm btn-outline" data-adj="${tid}:-5">-5</button>
      </div>
      <div class="grid-2" style="margin-top:8px;">
        <button class="btn-sm btn-outline" data-unlock="${tid}">Débloquer mission suivante</button>
        <button class="btn-sm ${blocked?'btn-success':'btn-danger'}" data-block="${tid}">${blocked?"Débloquer l'équipe":"Bloquer 10 min"}</button>
      </div>
    </div>`;
  }).join("");
  c.innerHTML = rows;
  document.querySelectorAll("[data-adj]").forEach(b=> b.onclick = async ()=>{
    const [tid, amt] = b.dataset.adj.split(":");
    await Store.adjustPoints(tid, parseInt(amt,10), "Ajustement manuel admin");
    toast("Points ajustés", `${amt} pts pour ${GAME_DATA.teams[tid].nom}`);
  });
  document.querySelectorAll("[data-unlock]").forEach(b=> b.onclick = async ()=>{
    await Store.unlockNext(b.dataset.unlock);
    toast("Mission débloquée", GAME_DATA.teams[b.dataset.unlock].nom);
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

/* ---------------- TIRAGES ---------------- */
function renderDrawsTab(c){
  const verre = CONFIG_CACHE.verreAssignment || {};
  const defi = CONFIG_CACHE.challengeAssignment || {};
  c.innerHTML = `
    <div class="card">
      <h3>🍸 Le Verre du Destin</h3>
      <p class="dim">Attribue à chaque équipe une équipe cible (aléatoire, sans auto-attribution).</p>
      <button class="btn-block" id="draw-verre">${CONFIG_CACHE.verreDrawn ? "Relancer le tirage" : "Lancer le tirage"}</button>
      ${CONFIG_CACHE.verreDrawn ? `<ul class="indice-list" style="margin-top:10px;">${TEAM_ORDER.map(t=>`<li>${GAME_DATA.teams[t].nom} → <b>${GAME_DATA.teams[verre[t]] ? GAME_DATA.teams[verre[t]].nom : "?"}</b></li>`).join("")}</ul>` : ""}
    </div>
    <div class="card">
      <h3>🎲 Le Défi du Hasard</h3>
      <p class="dim">Tire un défi surprise unique par équipe parmi les 15.</p>
      <button class="btn-block" id="draw-defi">${CONFIG_CACHE.challengeDrawn ? "Relancer le tirage" : "Lancer le tirage"}</button>
      ${CONFIG_CACHE.challengeDrawn ? `<ul class="indice-list" style="margin-top:10px;">${TEAM_ORDER.map(t=>{
        const ch = GAME_DATA.surpriseChallenges.find(x=>x.id===defi[t]);
        return `<li>${GAME_DATA.teams[t].nom} → ${ch?ch.texte:"?"}</li>`;
      }).join("")}</ul>` : ""}
    </div>
  `;
  $("draw-verre").onclick = async ()=>{
    const assignment = await Store.drawVerreAssignment(TEAM_ORDER);
    for (const t of TEAM_ORDER){
      await Store.broadcastEvent(t,"event","🍸 Le Verre du Destin", `Votre cible est désignée. Rendez-vous dans votre espace mission pour la découvrir.`);
    }
    toast("Tirage effectué", "Le Verre du Destin a désigné les cibles.");
  };
  $("draw-defi").onclick = async ()=>{
    await Store.drawChallengeAssignment(TEAM_ORDER, GAME_DATA.surpriseChallenges);
    for (const t of TEAM_ORDER){
      await Store.broadcastEvent(t,"event","🎲 Défi du Hasard", `Votre défi surprise est prêt ! Consultez votre espace mission.`);
    }
    toast("Tirage effectué", "Les défis surprise ont été distribués.");
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
      <p class="dim">À annoncer au One Club : équipe gagnante (classement), + prix bonus ci-dessous à décider en direct.</p>
      <ul class="indice-list">
        <li>🏆 Équipe gagnante : score final le plus haut</li>
        <li>🧠 Meilleure stratégie</li>
        <li>🎭 Meilleur bluff</li>
        <li>😂 Mission la plus drôle</li>
        <li>🗡️ Meilleure trahison</li>
        <li>📸 Meilleure photo / preuve</li>
      </ul>
    </div>
  `;
}
