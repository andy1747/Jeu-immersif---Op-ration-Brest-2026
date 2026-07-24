/* ===================================================================
   CONFIGURATION FIREBASE
   -------------------------------------------------------------------
   1. Va sur https://console.firebase.google.com → Ajouter un projet
      (gratuit, ~2 minutes, pas besoin de carte bancaire).
   2. Dans le projet : "Créer une application Web" (icône </>),
      donne-lui un nom (ex: "brest-night"), PAS besoin d'Hosting.
   3. Firebase t'affiche un objet "firebaseConfig" : copie-colle
      ses valeurs ci-dessous, à la place des "REMPLACE-MOI".
   4. Dans le menu de gauche : Firestore Database → Créer une base
      → démarrer en "mode test" (suffisant pour une soirée privée).
   5. Voir le README.md pour les règles de sécurité recommandées.
=================================================================== */

const firebaseConfig = {
  apiKey: "AIzaSyDb2z4iw0ppC6yJ1eL4WzbuUytGZ1WI_zU",
  authDomain: "mission-a-brest.firebaseapp.com",
  projectId: "mission-a-brest",
  storageBucket: "mission-a-brest.firebasestorage.app",
  messagingSenderId: "950837561626",
  appId: "1:950837561626:web:31a1f99f00d20d283784a3"
};

// Mot de passe simple pour accéder au panneau admin (change-le !)
const ADMIN_PASSWORD = "brest2026";

// Clé VAPID pour les notifications push (Firebase Console → Paramètres du
// projet → Cloud Messaging → "Configuration Web" → Générer une paire de clés).
// Tant que ce n'est pas rempli, le bouton "Activer les notifications" reste désactivé.
const VAPID_KEY = "REMPLACE-MOI-VAPID";

let db = null;
let messaging = null;
try {
  if (firebaseConfig.apiKey !== "REMPLACE-MOI") {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    try {
      if (firebase.messaging && firebase.messaging.isSupported && typeof window !== "undefined" && "serviceWorker" in navigator) {
        messaging = firebase.messaging();
      }
    } catch (e) {
      console.warn("Messaging non disponible sur ce navigateur.", e);
    }
  } else {
    console.warn("⚠️ Firebase non configuré : voir js/firebase-config.js");
  }
} catch (e) {
  console.error("Erreur d'initialisation Firebase", e);
}
