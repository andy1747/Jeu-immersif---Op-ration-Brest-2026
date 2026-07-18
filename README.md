# 🎉 Brest Night Game

Jeu de soirée numérique 100 % mobile, piloté par QR codes. 5 équipes, 2 missions
communes, 40 missions d'équipe, 15 défis surprise, des pouvoirs, des
événements aléatoires, et un panneau admin pour toi (Andreia).

Aucune app à installer : tout tourne dans le navigateur du téléphone, via des
liens ouverts depuis un QR code.

---

## 1. Arborescence

```
├── index.html          → page joueur / espace équipe (routage par ?player= ou ?team=)
├── admin.html           → panneau organisatrice
├── qrcodes.html         → génère tous les QR codes (à ouvrir une fois le site en ligne)
├── manifest.json        → permet l'ajout à l'écran d'accueil
├── css/
│   └── styles.css       → tous les styles + thèmes par équipe
└── js/
    ├── data.js           → TOUT le contenu du jeu (joueurs, indices, missions, défis, pouvoirs)
    ├── firebase-config.js→ tes clés Firebase + mot de passe admin
    ├── store.js          → couche d'accès aux données (Firestore ou mode local de secours)
    ├── app.js            → logique de l'espace joueur / équipe
    ├── admin.js          → logique du panneau admin
    └── qrcodes.js         → génération des QR codes
```

Tu n'as normalement besoin de modifier que **`js/data.js`** (contenu) et
**`js/firebase-config.js`** (connexion + mot de passe admin).

---

## 2. Installation — Firebase (synchronisation en temps réel)

Le jeu synchronise les scores entre tous les téléphones grâce à Firebase
(gratuit, ~5 minutes de mise en place).

1. Va sur [console.firebase.google.com](https://console.firebase.google.com)
   → **Ajouter un projet** → donne-lui un nom (ex. `brest-night`) → pas besoin
   de Google Analytics.
2. Une fois le projet créé : icône **`</>`** (Ajouter une application Web) →
   nomme-la (ex. `brest-night-web`) → **PAS besoin** de configurer Firebase
   Hosting.
3. Firebase affiche un bloc `firebaseConfig = { apiKey: ..., authDomain: ..., ... }`.
   Copie ces valeurs dans **`js/firebase-config.js`**, à la place des
   `"REMPLACE-MOI"`.
4. Dans le menu de gauche : **Firestore Database** → **Créer une base de
   données** → choisis **mode test** (permet lecture/écriture sans
   authentification, ce qui est nécessaire ici puisque les joueurs n'ont pas
   de compte). Choisis une région proche (europe-west par exemple).
5. (Optionnel mais recommandé) Dans l'onglet **Règles** de Firestore,
   remplace les règles par défaut par celles-ci, qui expirent automatiquement
   après ta soirée (adapte la date) :

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.time < timestamp.date(2026, 7, 20);
       }
     }
   }
   ```

6. Change aussi le mot de passe admin dans `js/firebase-config.js` :
   ```js
   const ADMIN_PASSWORD = "ton-mot-de-passe";
   ```

⚠️ Sans étape 3, le site fonctionne quand même (mode local de secours via
`localStorage`) mais **rien n'est partagé entre les téléphones** — pratique
uniquement pour tester le design tout seul avant la soirée.

---

## 3. Déploiement — GitHub Pages

1. Crée un dépôt GitHub (public ou privé, peu importe) et pousse-y tous ces
   fichiers.
2. Dans le dépôt : **Settings → Pages → Source** → sélectionne la branche
   `main` et le dossier `/ (root)` → **Save**.
3. GitHub te donne une URL du type
   `https://ton-pseudo.github.io/nom-du-depot/`. Attends 1-2 minutes que le
   déploiement se termine (onglet Actions).
4. Vérifie que `https://.../index.html`, `https://.../admin.html` et
   `https://.../qrcodes.html` s'ouvrent bien.

---

## 4. Générer et distribuer les QR codes

1. Une fois le site en ligne, ouvre **`qrcodes.html`** sur CETTE URL en
   ligne (pas en local) : les QR codes s'adaptent automatiquement à l'URL
   réelle du site.
2. Clique sur **Imprimer / Exporter en PDF** pour tout imprimer, ou copie
   chaque lien individuellement pour l'envoyer par SMS/WhatsApp à chaque
   invité avant la soirée (les liens personnels ne révèlent rien avant
   d'être ouverts).
3. Distribue à chacun **uniquement son propre QR code personnel**. Le
   panneau admin et les QR codes d'équipe restent pour toi.

---

## 5. Personnaliser le contenu

Tout est dans **`js/data.js`**, en clair et commenté :

- `players` : un objet par joueur avec son personnage, son intro immersive,
  et ses **indices sur son/ses partenaire(s)**. J'ai écrit des indices
  génériques (fondés sur les archétypes de personnages) puisque je ne
  connais pas vos private jokes — **c'est l'endroit où les personnaliser**
  pour un effet beaucoup plus fun (ex. remplacer par de vraies private
  jokes, habitudes, répliques cultes du groupe).
- `teams` : nom, objectif, pouvoir, thème visuel.
- `missions` : les 8 missions par équipe (titre, points, description,
  preuve, pénalité).
- `commonMissions` : Le Verre du Destin et Le Défi du Hasard.
- `surpriseChallenges` : les 15 défis surprise.

Aucune autre modification de code n'est nécessaire pour changer le contenu.

---

## 6. Déroulé de la soirée (logique du jeu)

**Phase 1 — Retrouver son partenaire (18h-19h, hôtel)**
Chaque invité ouvre son QR code personnel → découvre son personnage, son
univers, une intro immersive et des indices sur son/ses partenaire(s) (sans
jamais de prénom). Il discute avec le groupe, puis entre le(s) prénom(s)
supposé(s) dans son propre espace. Bonne réponse → accès à l'espace
d'équipe partagé. Mauvaise réponse → message drôle, sans révéler la
solution.

**Phase 2 — L'espace d'équipe**
Une fois l'équipe formée, chaque membre accède au même espace (via
`index.html?team=...`, atteint automatiquement après validation). On y
trouve : score en direct, barre de progression, missions débloquées
progressivement, pouvoir d'équipe (une seule utilisation), et les
événements envoyés par toi.

**Missions communes** : Le Verre du Destin (mission 1) et Le Défi du Hasard
(mission 2) sont débloquées en premier pour toutes les équipes. Va dans
l'onglet **🎲 Tirages** du panneau admin pour lancer les deux tirages
aléatoires quand tu es prête (par exemple pendant la Croisette).

**Missions d'équipe** : les 8 missions suivantes se débloquent une par une,
à chaque fois qu'une mission précédente est validée. Une équipe bloquée ne
voit qu'un maximum de suspense — les missions verrouillées n'affichent ni
titre ni description.

**Validation** : chaque équipe envoie une preuve (texte + photo optionnelle)
via le bouton "Valider la mission". Tu la vois apparaître en direct dans
l'onglet **📸 Preuves** de l'admin, avec Approuver / Refuser (+ pénalité
optionnelle).

**Pouvoirs** : chaque équipe a un bouton "Utiliser le pouvoir" dans son
espace, utilisable une seule fois. Effets automatiques (vol de points,
protection, échange de mission...) gérés par le site.

**Événements** : onglet **🌩️ Événements** de l'admin — 10 types prêts à
l'emploi (malédiction, bonus, piège, mission urgente, échange, vol de
points, alliance, trahison, énigme, faux indice), envoyables à une équipe
ou à toutes, avec message personnalisable.

**Fin de soirée (One Club, ~1h)** : onglet **🥇 Récompenses** de l'admin
pour voir le classement final et annoncer les prix (équipe gagnante,
meilleure stratégie, meilleur bluff, mission la plus drôle, meilleure
trahison, meilleure preuve).

---

## 7. Panneau admin

Va sur `https://.../admin.html`, entre ton mot de passe (défini dans
`js/firebase-config.js`). Tu peux : voir les scores en direct, valider ou
refuser les preuves de mission, ajuster manuellement les points, bloquer /
débloquer une équipe, débloquer une mission manuellement en cas de blocage,
lancer les tirages, déclencher des événements, transférer des points entre
équipes, et suivre les demandes d'indices (pouvoir des Aventuriers).

---

## 8. Checklist avant la soirée

- [ ] Firebase configuré (`js/firebase-config.js` rempli, pas de
      "REMPLACE-MOI" restant)
- [ ] Mot de passe admin changé
- [ ] Site déployé et accessible sur mobile (teste `index.html?player=mathieu`
      par exemple)
- [ ] QR codes générés depuis `qrcodes.html` **en ligne** et imprimés /
      envoyés
- [ ] Test rapide : ouvrir deux téléphones différents, valider une équipe,
      vérifier que le score bouge en direct sur les deux
- [ ] Vérifier la connexion internet/4G prévue sur les lieux du parcours

---

## 9. Limites connues

- Le mode Firestore "test" utilisé ici est ouvert (pas d'authentification) :
  suffisant et simple pour une soirée privée entre proches, mais à ne pas
  réutiliser tel quel pour un usage public ou permanent.
- Sans configuration Firebase, le site fonctionne en mode local
  (`localStorage`) mais sans synchronisation entre téléphones — utile
  seulement pour prévisualiser avant la soirée.
- Les photos de preuve sont compressées côté téléphone avant envoi pour
  rester légères, mais nécessitent malgré tout une connexion internet
  correcte au moment de l'envoi.

Bonne soirée à Brest ! 🥂
