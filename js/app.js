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
    let minuitFiring = false;

    const rerender = ()=> { if (currentTeamData) paintTeam(teamId, team, currentTeamData, currentConfig, currentMarket); };

    _teamListeners.push(Store.listenTeam(teamId, (data)=>{ currentTeamData = data; rerender(); }));
    _teamListeners.push(Store.listenConfig((cfg)=>{ currentConfig = cfg||currentConfig; rerender(); }));
    _teamListeners.push(Store.listenMarket((offers)=>{ currentMarket = offers; rerender(); }));
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

    // Vérification périodique pour le déclenchement automatique de l'Opération Minuit
    const minuitCheck = setInterval(async ()=>{
      if (minuitFiring) return;
      if (!currentConfig || !currentConfig.minuitAutoEnabled || currentConfig.minuitTriggered) return;
      if (new Date().getHours() === 0){
        minuitFiring = true;
        await Store.triggerMinuit(TEAM_ORDER);
      }
    }, 15000);
    _teamListeners.push(()=> clearInterval(minuitCheck));
  });
}

function missionListFor(teamId){
  return GAME_DATA.teams[teamId].missions; // [verre-destin, defi-hasard, team-1..8]
}

function getMissionDef(missionId){
  return GAME_DATA.commonMissions[missionId] || GAME_DATA.missions[missionId] || GAME_DATA.finalMissions[missionId];
}

let _soundState = {};
let _soundFired = {}; // garde idempotente : {teamId: {doneCount:Set, unlockedCount:Set, minuit:bool}}
function paintTeam(teamId, team, data, config, market){
  market = market || [];
  const missions = missionListFor(teamId);
  const unlockedCount = data.unlockedCount || 1;
  const completed = data.completed || {};
  const doneCount = Object.values(completed).filter(c=>c.status==="done").length;

  // Effets sonores déclenchés par un changement d'état (validation, déblocage, minuit)
  // Gardes idempotentes par valeur atteinte : évite tout doublon même si paintTeam
  // est appelé plusieurs fois de suite pour le même changement de donnée.
  if (window.AudioFX){
    const fired = _soundFired[teamId] = _soundFired[teamId] || { doneCounts:new Set(), unlockedCounts:new Set(), minuit:false };
    const prev = _soundState[teamId];
    const minuitNow = !!(config && config.minuitTriggered);
    if (prev && doneCount > prev.doneCount && !fired.doneCounts.has(doneCount)){
      fired.doneCounts.add(doneCount);
      try{ AudioFX.play("validation", team.theme); }catch(e){}
    }
    if (prev && unlockedCount > prev.unlockedCount && !fired.unlockedCounts.has(unlockedCount)){
      fired.unlockedCounts.add(unlockedCount);
      try{ AudioFX.play("chest", team.theme); }catch(e){}
    }
    if (minuitNow && !fired.minuit){
      fired.minuit = true;
      try{ AudioFX.play("victory", team.theme); }catch(e){}
    }
    _soundState[teamId] = { doneCount, unlockedCount, minuitTriggered: minuitNow };
  }
  const totalMissions = missions.length;
  const progressPct = Math.round((doneCount/totalMissions)*100);
  const blocked = data.blockedUntil && data.blockedUntil > Date.now();
  const protectedActive = data.protectedUntil && data.protectedUntil > Date.now();
  const minuit = config && config.minuitTriggered;

  let html = "";

  if (minuit){
    html += `<div class="card pulse" style="border-color:var(--danger); background:linear-gradient(135deg, rgba(255,90,95,.18), rgba(0,0,0,.1)); text-align:center;">
      <h2 style="color:var(--danger); margin-bottom:4px;">🚨 OPÉRATION MINUIT 🚨</h2>
      <p class="dim">Classement gelé. Protections supprimées. Pouvoirs réutilisables. La mission finale est ouverte plus bas.</p>
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

  // Pouvoir
  html += `<div class="card">
    <span class="badge">Pouvoir d'équipe</span>
    <h3>${team.pouvoir.nom}</h3>
    <p class="dim">${team.pouvoir.description}</p>
    <button class="btn-block ${data.powerUsed?'btn-outline':''}" id="power-btn" ${data.powerUsed?'disabled':''}>
      ${data.powerUsed ? "Pouvoir déjà utilisé" : "Utiliser le pouvoir"}
    </button>
  </div>`;

  // Contrat secret (visible uniquement par cette équipe)
  const contract = data.secretContract;
  if (contract && (contract.status === "active" || contract.status === "pending")){
    html += `<div class="card pop-in" style="border-color:var(--warning);">
      <span class="badge pending">🕵️ Contrat secret</span>
      <h3>${contract.title}</h3>
      <p>${contract.description}</p>
      <p class="dim">📈 ${contract.points} points · Les autres équipes ne savent pas que ce contrat existe.</p>
      ${contract.status === "pending"
        ? `<p class="msg ok">En attente de validation par l'organisatrice…</p>`
        : `<button class="btn-block" id="secret-contract-btn">Valider le contrat</button>`}
    </div>`;
  }

  // Mission finale — Opération Minuit
  if (data.minuitFinalUnlocked){
    const finalId = "final-" + teamId;
    html += `<h2 style="margin-top:22px;">🚨 Mission finale</h2>`;
    html += renderMissionCard(teamId, finalId, 0, 999, completed, config, true);
  }

  // Missions
  html += `<h2 style="margin-top:22px;">🎯 Missions</h2>`;
  missions.forEach((mid, idx)=>{
    html += renderMissionCard(teamId, mid, idx, unlockedCount, completed, config);
  });

  // Missions bonus (échange Tarzan & Jane)
  if (data.extraMissions && data.extraMissions.length){
    html += `<h2 style="margin-top:22px;">🔀 Missions échangées</h2>`;
    data.extraMissions.forEach(mid=>{
      html += renderMissionCard(teamId, mid, 0, 999, completed, config, true);
    });
  }

  // Marché Noir
  const openOffers = market.filter(o=>o.status==="open");
  html += `<h2 style="margin-top:22px;">🖤 Marché Noir</h2>
    <p class="dim">Indices, objets, points, protections, alliances, faveurs... tout se négocie. Publiez une offre ou répondez à celle d'une autre équipe.</p>
    <button class="btn-block btn-outline" id="market-post-btn" style="margin-bottom:12px;">+ Publier une offre</button>`;
  if (!openOffers.length){
    html += `<p class="dim">Aucune offre en ce moment.</p>`;
  } else {
    openOffers.forEach(o=>{
      const mine = o.teamId === teamId;
      const offerTeam = GAME_DATA.teams[o.teamId];
      html += `<div class="card">
        <span class="badge">${offerTeam ? offerTeam.nom : o.teamId}${mine ? " · votre offre" : ""}</span>
        <h3>${o.title}</h3>
        ${o.description ? `<p>${o.description}</p>` : ""}
        ${o.wants ? `<p class="dim">En échange : ${o.wants}</p>` : ""}
        ${mine ? "" : `<button class="btn-block btn-sm" data-interest="${o.id}:${o.teamId}:${(o.title||"").replace(/"/g,'&quot;')}">Je suis intéressée</button>`}
      </div>`;
    });
  }

  html += `
    <div class="a2hs">Ajoute cette page à ton écran d'accueil (Partager → Sur l'écran d'accueil) pour la retrouver toute la soirée.</div>
    <footer class="site">Brest Night Game · ${team.nom}</footer>
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

  const powerBtn = $("power-btn");
  if (powerBtn && !data.powerUsed) powerBtn.onclick = ()=>{
    if (window.AudioFX) { try{ AudioFX.play("power", team.theme); }catch(e){} }
    openPowerModal(teamId, team, data);
  };

  missions.forEach((mid)=> wireMissionCard(teamId, mid, unlockedCount, completed, blocked));
  if (data.extraMissions) data.extraMissions.forEach(mid=> wireMissionCard(teamId, mid, 999, completed, blocked));
  if (data.minuitFinalUnlocked) wireMissionCard(teamId, "final-"+teamId, 999, completed, blocked);

  const contractBtn = $("secret-contract-btn");
  if (contractBtn) contractBtn.onclick = ()=> openSecretContractModal(teamId, contract);

  const marketPostBtn = $("market-post-btn");
  if (marketPostBtn) marketPostBtn.onclick = ()=> openMarketPostModal(teamId);

  document.querySelectorAll("[data-interest]").forEach(b=>{
    b.onclick = async ()=>{
      const [offerId, offerTeamId, title] = b.dataset.interest.split(":");
      b.disabled = true; b.textContent = "Intérêt envoyé !";
      await Store.expressInterest(offerTeamId, teamId, title);
    };
  });
}

function openSecretContractModal(teamId, contract){
  openModal(`
    <h2>🕵️ ${contract.title}</h2>
    <p>${contract.description}</p>
    <label>Note / preuve</label>
    <textarea id="secret-note" placeholder="Racontez comment vous avez rempli le contrat..."></textarea>
    <button class="btn-block" id="secret-submit-btn">Envoyer à l'organisatrice</button>
    <p class="dim" id="secret-status" style="margin-top:8px;"></p>
  `);
  $("secret-submit-btn").onclick = async ()=>{
    const note = $("secret-note").value.trim();
    await Store.submitSecretContractProof(teamId, note);
    $("secret-status").textContent = "✅ Envoyé ! En attente de validation par l'organisatrice.";
    toast("🕵️ Contrat envoyé", "En attente de validation.", "success");
    setTimeout(closeModal, 1200);
  };
}

function openMarketPostModal(teamId){
  openModal(`
    <h2>🖤 Publier une offre</h2>
    <label>Titre de l'offre</label>
    <input type="text" id="market-title" placeholder="Ex: Vends un indice sur Batman">
    <label>Description</label>
    <textarea id="market-desc" placeholder="Détaillez votre offre..."></textarea>
    <label>En échange de quoi ?</label>
    <input type="text" id="market-wants" placeholder="Ex: 15 points, ou une faveur, ou une alliance...">
    <button class="btn-block" id="market-submit-btn">Publier</button>
  `);
  $("market-submit-btn").onclick = async ()=>{
    const title = $("market-title").value.trim();
    if (!title){ return; }
    await Store.postMarketOffer(teamId, title, $("market-desc").value.trim(), $("market-wants").value.trim());
    toast("🖤 Offre publiée", "Visible par toutes les équipes.", "success");
    closeModal();
  };
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
  const isChoix = def.type === "choix";

  if (state && state.status === "done"){
    cardClass += " done";
    if (isChoix){
      statusBadge = state.win
        ? `<span class="badge done">✅ Réussi (+${state.points} pts)</span>`
        : `<span class="badge" style="background:var(--danger);color:#fff;">💥 Raté (${state.points} pts)</span>`;
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
    ${(def.preuve && !isChoix) ? `<p class="dim">📸 Preuve : ${def.preuve}</p>` : ""}
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
