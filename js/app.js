/* ===================================================================
   APP.JS — logique de l'espace joueur / espace équipe
=================================================================== */

const TEAM_ORDER = ["casa","potter","batman","aventuriers","tomjerry"];
const TEAM_EMOJI = { casa:"🎭", potter:"⚡", batman:"🦇", aventuriers:"🗺️", tomjerry:"🐱" };
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
  const playerId = qsParam("player");
  const teamId = qsParam("team");
  if (playerId) renderPlayer(playerId);
  else if (teamId) renderTeam(teamId);
  else renderHome();
}

function renderHome(){
  $("app").innerHTML = `
    <div class="center-screen">
      <div class="icon-circle">🎉</div>
      <h1>Brest Night Game</h1>
      <p class="dim">Ce site se découvre uniquement via un QR code personnel.<br>Scanne le tien pour commencer l'aventure.</p>
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

    <footer class="site">Brest Night Game · ${team.nom}</footer>
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
      $("validate-result").innerHTML = `<div class="msg ok pop-in">✅ Équipe validée. Votre mission peut commencer.</div>
        <button class="btn-block btn-success" style="margin-top:8px;" id="goto-team-btn-2">Entrer dans l'espace équipe</button>`;
      $("goto-team-btn-2").onclick = ()=> window.location.href = `index.html?team=${player.team}`;
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
function clearTeamListeners(){ _teamListeners.forEach(u=>u && u()); _teamListeners=[]; }

function renderTeam(teamId){
  const team = GAME_DATA.teams[teamId];
  if (!team){
    $("app").innerHTML = `<div class="center-screen"><h1>Équipe introuvable</h1></div>`;
    return;
  }
  document.body.setAttribute("data-theme", team.theme);
  clearTeamListeners();

  Store.ensureTeam(teamId).then(()=>{
    let currentTeamData = null;
    let currentConfig = { verreAssignment:{}, challengeAssignment:{} };
    let loadStartTs = Date.now();
    let shownEventIds = new Set();

    const rerender = ()=> { if (currentTeamData) paintTeam(teamId, team, currentTeamData, currentConfig); };

    _teamListeners.push(Store.listenTeam(teamId, (data)=>{ currentTeamData = data; rerender(); }));
    _teamListeners.push(Store.listenConfig((cfg)=>{ currentConfig = cfg||currentConfig; rerender(); }));
    _teamListeners.push(Store.listenEvents(teamId, (events)=>{
      events.forEach(e=>{
        const key = e.id || e.timestamp;
        if (e.timestamp >= loadStartTs && !shownEventIds.has(key)){
          shownEventIds.add(key);
          toast("🌩️ "+(e.title||"Événement"), e.message||"", e.type==="danger"?"fail":"success");
        }
      });
    }));
  });
}

function missionListFor(teamId){
  return GAME_DATA.teams[teamId].missions; // [verre-destin, defi-hasard, team-1..8]
}

function getMissionDef(missionId){
  return GAME_DATA.commonMissions[missionId] || GAME_DATA.missions[missionId];
}

function paintTeam(teamId, team, data, config){
  const missions = missionListFor(teamId);
  const unlockedCount = data.unlockedCount || 1;
  const completed = data.completed || {};
  const doneCount = Object.values(completed).filter(c=>c.status==="done").length;
  const totalMissions = missions.length;
  const progressPct = Math.round((doneCount/totalMissions)*100);
  const blocked = data.blockedUntil && data.blockedUntil > Date.now();
  const protectedActive = data.protectedUntil && data.protectedUntil > Date.now();

  let html = `
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

  // Pouvoir
  html += `<div class="card">
    <span class="badge">Pouvoir d'équipe</span>
    <h3>${team.pouvoir.nom}</h3>
    <p class="dim">${team.pouvoir.description}</p>
    <button class="btn-block ${data.powerUsed?'btn-outline':''}" id="power-btn" ${data.powerUsed?'disabled':''}>
      ${data.powerUsed ? "Pouvoir déjà utilisé" : "Utiliser le pouvoir"}
    </button>
  </div>`;

  // Missions
  html += `<h2 style="margin-top:22px;">🎯 Missions</h2>`;
  missions.forEach((mid, idx)=>{
    html += renderMissionCard(teamId, mid, idx, unlockedCount, completed, config);
  });

  // Missions bonus (échange Tom & Jerry)
  if (data.extraMissions && data.extraMissions.length){
    html += `<h2 style="margin-top:22px;">🔀 Missions échangées</h2>`;
    data.extraMissions.forEach(mid=>{
      html += renderMissionCard(teamId, mid, 0, 999, completed, config, true);
    });
  }

  html += `
    <div class="row between" style="margin-top:20px;">
      <button class="btn-outline btn-sm" id="sound-toggle-btn">${soundEnabled() ? "🔊 Son activé" : "🔇 Son coupé"}</button>
    </div>
    <div class="a2hs">Ajoute cette page à ton écran d'accueil (Partager → Sur l'écran d'accueil) pour la retrouver toute la soirée.</div>
    <footer class="site">Brest Night Game · ${team.nom}</footer>
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

  $("sound-toggle-btn").onclick = ()=>{ toggleSound(); $("sound-toggle-btn").textContent = soundEnabled() ? "🔊 Son activé" : "🔇 Son coupé"; };

  const powerBtn = $("power-btn");
  if (powerBtn && !data.powerUsed) powerBtn.onclick = ()=> openPowerModal(teamId, team, data);

  missions.forEach((mid)=> wireMissionCard(teamId, mid, unlockedCount, completed, blocked));
  if (data.extraMissions) data.extraMissions.forEach(mid=> wireMissionCard(teamId, mid, 999, completed, blocked));
}

function renderMissionCard(teamId, missionId, idx, unlockedCount, completed, config, isExtra){
  const isCommon = !!GAME_DATA.commonMissions[missionId];
  const def = getMissionDef(missionId);
  const locked = !isExtra && idx >= unlockedCount;
  const state = completed[missionId];
  const pointsBadge = def.points ? `<span class="badge points">+${def.points} pts</span>` : "";

  if (locked){
    return `<div class="card locked">
      <span class="badge">Mission ${idx+1} / ${unlockedCount>idx?idx+1:'?'}</span>
      <h3>🔒 Mission verrouillée</h3>
      <p class="dim">Débloquée après la mission précédente.</p>
    </div>`;
  }

  let desc = def.description;
  if (missionId === "verre-destin"){
    const target = config.verreAssignment && config.verreAssignment[teamId];
    desc += target ? `<br><br><b>Cible tirée au sort : ${GAME_DATA.teams[target].nom}</b>` : `<br><br><i>En attente du tirage par l'organisatrice…</i>`;
  }
  if (missionId === "defi-hasard"){
    const chId = config.challengeAssignment && config.challengeAssignment[teamId];
    if (chId){
      const ch = GAME_DATA.surpriseChallenges.find(c=>c.id===chId);
      desc = ch ? ch.texte : desc;
    } else {
      desc = "En attente du tirage par l'organisatrice…";
    }
  }

  let statusBadge = "";
  let bodyExtra = "";
  let cardClass = "card pop-in";
  if (state && state.status === "done"){
    cardClass += " done";
    statusBadge = `<span class="badge done">✅ Validée</span>`;
  } else if (state && state.status === "rejected"){
    statusBadge = `<span class="badge">❌ Refusée</span>`;
    bodyExtra = `<button class="btn-block btn-sm" data-retry="${missionId}">Réessayer</button>`;
  } else {
    // check pending — géré via listenProofs séparé, on affiche juste le bouton
    bodyExtra = `<button class="btn-block" data-submit="${missionId}">✔️ Valider la mission</button>`;
  }

  return `<div class="${cardClass}" id="mission-${missionId}">
    ${isExtra ? `<span class="badge">Mission échangée</span>` : ""}
    ${pointsBadge} ${statusBadge}
    <h3>${def.titre}</h3>
    <p>${desc}</p>
    ${def.duree ? `<p class="dim">⏱️ ${def.duree}</p>` : ""}
    ${def.preuve ? `<p class="dim">📸 Preuve : ${def.preuve}</p>` : ""}
    <div data-actions="${missionId}">${bodyExtra}</div>
  </div>`;
}

function wireMissionCard(teamId, missionId, unlockedCount, completed, blocked){
  const btn = document.querySelector(`[data-submit="${missionId}"]`);
  if (btn){
    btn.disabled = !!blocked;
    btn.onclick = ()=> openProofModal(teamId, missionId);
  }
  const retry = document.querySelector(`[data-retry="${missionId}"]`);
  if (retry){ retry.disabled = !!blocked; retry.onclick = ()=> openProofModal(teamId, missionId); }
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
        const otherMissions = missionListFor(t).filter((mid,idx)=> idx < (otherData.unlockedCount||1) && (!otherData.completed || !otherData.completed[mid]));
        const myMissions = missionListFor(teamId).filter((mid,idx)=> idx < (myData.unlockedCount||1) && (!myData.completed || !myData.completed[mid]));
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
