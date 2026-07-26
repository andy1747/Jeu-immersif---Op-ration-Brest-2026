/* ===================================================================
   Génère les QR codes en fonction de l'URL réelle du site.
=================================================================== */

function baseUrl(){
  const path = window.location.pathname.replace(/qrcodes\.html$/, "");
  return window.location.origin + path;
}

function makeCard(container, { title, sub, url }){
  const card = document.createElement("div");
  card.className = "qr-card";
  const qrDiv = document.createElement("div");
  card.appendChild(qrDiv);
  const h3 = document.createElement("h3"); h3.textContent = title; card.appendChild(h3);
  if (sub){ const p = document.createElement("p"); p.className="dim"; p.textContent = sub; card.appendChild(p); }
  const linkP = document.createElement("p"); linkP.className = "link"; linkP.textContent = url; card.appendChild(linkP);
  const btn = document.createElement("button");
  btn.className = "btn-outline copy-btn no-print";
  btn.textContent = "Copier le lien";
  btn.onclick = ()=>{ navigator.clipboard.writeText(url).then(()=>{ btn.textContent="Copié !"; setTimeout(()=>btn.textContent="Copier le lien",1500); }); };
  card.appendChild(btn);
  container.appendChild(card);
  new QRCode(qrDiv, { text: url, width: 160, height: 160, correctLevel: QRCode.CorrectLevel.M });
}

function renderAllCodes(){
  const base = baseUrl();
  const playersGrid = document.getElementById("players-grid");
  const teamsGrid = document.getElementById("teams-grid");
  const adminGrid = document.getElementById("admin-grid");

  Object.values(GAME_DATA.players).forEach(p=>{
    makeCard(playersGrid, {
      title: p.nom + " — " + p.personnage,
      sub: GAME_DATA.teams[p.team].nom,
      url: base + "index.html?player=" + p.id
    });
  });

  Object.values(GAME_DATA.teams).forEach(t=>{
    makeCard(teamsGrid, {
      title: t.nom,
      sub: t.membres.map(m=>GAME_DATA.players[m].nom).join(" & "),
      url: base + "index.html?team=" + t.id
    });
  });

  makeCard(adminGrid, { title: "Panneau admin", sub: "Réservé à Andreia", url: base + "admin.html" });
}

window.addEventListener("DOMContentLoaded", ()=>{
  // Page protégée par mot de passe : elle révèle tous les personnages et
  // toutes les équipes, donc on ne l'affiche qu'après authentification.
  if (sessionStorage.getItem("bng_qr_auth") === "1"){
    document.getElementById("qr-login-gate").style.display = "none";
    document.getElementById("qr-protected-content").style.display = "block";
    renderAllCodes();
    return;
  }
  document.getElementById("qr-login-btn").onclick = ()=>{
    const val = document.getElementById("qr-pass").value;
    if (typeof ADMIN_PASSWORD !== "undefined" && val === ADMIN_PASSWORD){
      sessionStorage.setItem("bng_qr_auth","1");
      document.getElementById("qr-login-gate").style.display = "none";
      document.getElementById("qr-protected-content").style.display = "block";
      renderAllCodes();
    } else {
      document.getElementById("qr-login-err").textContent = "Mot de passe incorrect.";
    }
  };
});
