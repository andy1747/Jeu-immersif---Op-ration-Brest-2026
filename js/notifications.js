/* ===================================================================
   NOTIFICATIONS.JS — activation des notifications push côté joueur
   -------------------------------------------------------------------
   Toute la logique FCM (permission, token, enregistrement) est isolée
   ici pour ne pas alourdir app.js. Fonctionne uniquement si :
   - le navigateur supporte les Service Workers + la Push API
   - VAPID_KEY a été configurée dans js/firebase-config.js
   - la fonction Cloud "sendPushNotification" est déployée côté Firebase
=================================================================== */

const Notifications = (function () {
  let swRegistration = null;

  function isSupported() {
    return (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      messaging &&
      typeof VAPID_KEY !== "undefined" &&
      VAPID_KEY &&
      VAPID_KEY !== "REMPLACE-MOI-VAPID"
    );
  }

  function permissionState() {
    if (typeof Notification === "undefined") return "unsupported";
    return Notification.permission; // "granted" | "denied" | "default"
  }

  async function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return null;
    if (swRegistration) return swRegistration;
    try {
      swRegistration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      return swRegistration;
    } catch (e) {
      console.warn("Échec d'enregistrement du service worker de notifications :", e);
      return null;
    }
  }

  // Demande la permission, récupère le token FCM, l'enregistre dans Firestore
  // pour l'équipe donnée. Renvoie "granted" / "denied" / "unsupported" / "error".
  async function enableForTeam(teamId) {
    if (!isSupported()) return "unsupported";
    try {
      const reg = await registerServiceWorker();
      if (!reg) return "error";
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return permission; // "denied" ou "default"

      const token = await messaging.getToken({
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: reg
      });
      if (!token) return "error";

      await Store.saveFcmToken(teamId, token);
      localStorage.setItem("bng_notif_enabled_" + teamId, "1");
      return "granted";
    } catch (e) {
      console.error("Erreur activation notifications :", e);
      return "error";
    }
  }

  function alreadyEnabled(teamId) {
    return localStorage.getItem("bng_notif_enabled_" + teamId) === "1" && permissionState() === "granted";
  }

  return { isSupported, permissionState, enableForTeam, alreadyEnabled, registerServiceWorker };
})();

if (typeof window !== "undefined") window.Notifications = Notifications;
