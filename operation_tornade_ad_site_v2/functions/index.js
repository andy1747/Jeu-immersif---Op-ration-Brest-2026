/* ===================================================================
   CLOUD FUNCTIONS — envoi des vraies notifications push (FCM)
   -------------------------------------------------------------------
   Une seule fonction : dès qu'un document est créé dans la collection
   Firestore "notificationsToSend", elle récupère les tokens des
   téléphones concernés (une équipe précise ou "all") et leur envoie
   une notification push via Firebase Cloud Messaging.

   L'admin (admin.js) n'appelle jamais cette fonction directement :
   elle écrit juste un document Firestore (comme le reste du site le
   fait déjà pour les événements, les tirages, etc.), et cette fonction
   se déclenche toute seule. Aucune clé secrète côté client.
=================================================================== */

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

initializeApp();

// Logique pure, injectée avec db/messaging → testable sans émulateur Firebase.
async function sendPushLogic(data, db, messaging) {
  const title = data.title || "Opération Tornade AD";
  const body = data.body || "";
  const target = data.target || "all";

  let tokensQuery = db.collection("fcmTokens");
  if (target !== "all") {
    tokensQuery = tokensQuery.where("teamId", "==", target);
  }
  const tokensSnap = await tokensQuery.get();

  if (tokensSnap.empty) {
    return { sentCount: 0, failCount: 0, note: "Aucun téléphone inscrit pour cette cible." };
  }

  const docs = tokensSnap.docs;
  const tokens = docs.map((d) => d.data().token);

  const message = {
    notification: { title, body },
    webpush: {
      notification: {
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        vibrate: [200, 100, 200]
      },
      fcmOptions: { link: "/" }
    },
    tokens
  };

  const response = await messaging.sendEachForMulticast(message);

  const deletions = [];
  response.responses.forEach((r, i) => {
    if (!r.success) {
      const code = r.error && r.error.code;
      if (
        code === "messaging/invalid-registration-token" ||
        code === "messaging/registration-token-not-registered"
      ) {
        deletions.push(docs[i].ref.delete());
      }
    }
  });
  await Promise.all(deletions);

  return { sentCount: response.successCount, failCount: response.failureCount };
}

exports.sendPushLogic = sendPushLogic; // exporté pour les tests

exports.sendPushNotification = onDocumentCreated(
  "notificationsToSend/{id}",
  async (event) => {
    const snap = event.data;
    if (!snap) return;
    const data = snap.data();
    const db = getFirestore();
    const messaging = getMessaging();

    const result = await sendPushLogic(data, db, messaging);

    await snap.ref.set(
      { sentAt: FieldValue.serverTimestamp(), ...result },
      { merge: true }
    );
  }
);
