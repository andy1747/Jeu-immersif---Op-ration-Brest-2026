/* ===================================================================
   SERVICE WORKER — reçoit les notifications push même quand le jeu
   est fermé ou le téléphone verrouillé (Firebase Cloud Messaging).

   Doit rester à la RACINE du site (même dossier que index.html) :
   c'est une exigence technique de Firebase Messaging, ne pas le
   déplacer dans js/.
=================================================================== */

importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

// Même config que js/firebase-config.js (dupliquée ici car les service
// workers ne peuvent pas importer les autres scripts du site).
firebase.initializeApp({
  apiKey: "AIzaSyDb2z4iw0ppC6yJ1eL4WzbuUytGZ1WI_zU",
  authDomain: "mission-a-brest.firebaseapp.com",
  projectId: "mission-a-brest",
  storageBucket: "mission-a-brest.firebasestorage.app",
  messagingSenderId: "950837561626",
  appId: "1:950837561626:web:31a1f99f00d20d283784a3"
});

const messaging = firebase.messaging();

// Notification affichée quand l'appli est fermée / en arrière-plan.
messaging.onBackgroundMessage((payload) => {
  const title = (payload.notification && payload.notification.title) || "Opération Tornade AD";
  const body = (payload.notification && payload.notification.body) || "";
  self.registration.showNotification(title, {
    body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    vibrate: [200, 100, 200]
  });
});

// Ramène sur le jeu quand on tape la notification.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow("/");
    })
  );
});

/* -------------------------------------------------------------------
   Mise en cache basique (app installable, coquille dispo hors-ligne).
   Ce même service worker gère à la fois les notifications push et
   ce cache : un seul fichier, un seul scope, pas de conflit.
------------------------------------------------------------------- */
const CACHE_NAME = "bng-shell-v1";
const APP_SHELL = [
  "/", "/index.html", "/manifest.json", "/icon-192.png", "/icon-512.png"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL).catch(() => {}))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Stratégie "réseau d'abord, cache de secours" : toujours la dernière version
// si le téléphone a du réseau, mais le site reste ouvrable sans connexion.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
