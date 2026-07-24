# 🕶️ Opération Tornade AD

Jeu d'espionnage immersif 100 % mobile, piloté par QR codes, pour une soirée
de 3 à 4 heures à Brest (vendredi 28 août 2026). 5 équipes/cellules de terrain,
une enquête sur le vol de la formule confidentielle TORNADE AD, des missions
courtes (comprises en moins de 10 secondes) propres à l'univers de chaque
équipe, des pouvoirs, de vraies notifications push, et un panneau admin pour
toi (Andreia). Chaque équipe garde sa propre identité visuelle et sonore
(fond animé, typographie, musique d'ambiance procédurale, effets sonores),
une mise en scène cinématique à la découverte de son équipe, et le site
porte désormais une couche « renseignement » (scanlines, effet glitch,
présentation façon dossier confidentiel).

Le jeu est organisé en **3 chapitres** que tu actives toi-même depuis le
panneau admin, au bon moment de la soirée : **1. Briefing & Roland**, **2.
Enquête**, **3. Quiz IPC & Convergence**. Chaque activation envoie une vraie
notification push à toutes les équipes.

**Deux équipes sont secrètement des agents dormants** (Casa de Papel et Harry
Potter), chacune ignorant l'existence de l'autre — voir section 8. Au
chapitre 3, chaque équipe passe un **Quiz IPC** (5 questions sur les produits
et l'entreprise IPC, tirées au sort dans une banque de 56+ questions — voir
section 9) qui lui rapporte un fragment du **code final de la Mallette IPC**.
Une fois les 5 fragments récupérés, toutes les équipes se réunissent pour
saisir le code complet et déclencher la révélation finale.

Aucune app à installer : tout tourne dans le navigateur du téléphone, via des
liens ouverts depuis un QR code.

---

## 1. Arborescence

```
├── index.html               → page joueur / espace équipe (routage par ?player= ou ?team=)
├── admin.html                → panneau organisatrice
├── qrcodes.html               → génère tous les QR codes (à ouvrir une fois le site en ligne)
├── manifest.json              → permet l'ajout à l'écran d'accueil (PWA)
├── firebase-messaging-sw.js   → service worker : notifications push + cache hors-ligne
├── icon-192.png / icon-512.png→ icônes de l'app
├── firebase.json, .firebaserc → config de déploiement des Cloud Functions
├── functions/
│   ├── index.js               → Cloud Function qui envoie les vraies notifications push
│   └── package.json
├── css/
│   └── styles.css       → tous les styles + thèmes par équipe
└── js/
    ├── data.js           → TOUT le contenu du jeu (joueurs, indices, missions, défis, pouvoirs)
    ├── firebase-config.js→ tes clés Firebase + mot de passe admin + clé VAPID
    ├── store.js          → couche d'accès aux données (Firestore ou mode local de secours)
    ├── audio.js          → musique d'ambiance + effets sonores, générés en direct (aucun fichier audio)
    ├── notifications.js  → activation des notifications push côté joueur
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

## 4. Notifications push (vraies, même téléphone verrouillé)

C'est la partie la plus technique du projet, mais tu n'as besoin de la faire
**qu'une seule fois**, avant la soirée. Ensuite tout se pilote depuis l'onglet
**🔔 Notifications** du panneau admin.

### 4.1 Activer la facturation Firebase (plan Blaze)

Les Cloud Functions (le petit programme qui envoie réellement les
notifications) nécessitent le plan "Blaze" de Firebase. Il reste **gratuit à
cette échelle** (quelques dizaines d'envois sur un week-end, très loin des
quotas gratuits), mais Google demande une carte bancaire pour l'activer.

1. Va sur [console.firebase.google.com](https://console.firebase.google.com) → ton projet.
2. En bas à gauche : **Modifier la formule** (ou icône ⚙️ → Utilisation et facturation) → choisis **Blaze** → renseigne une carte.
3. Tu peux définir un budget d'alerte (ex. 1€) dans **Google Cloud Console → Facturation** si tu veux dormir tranquille.

### 4.2 Générer la clé VAPID

1. Toujours dans la console Firebase : **⚙️ Paramètres du projet → Cloud Messaging**.
2. Section **Configuration Web** → **Générer une paire de clés**.
3. Copie la longue clé générée dans **`js/firebase-config.js`** :
   ```js
   const VAPID_KEY = "colle-la-clé-ici";
   ```

### 4.3 Installer les outils (une seule fois, sur ton ordinateur)

Ouvre le Terminal (application "Terminal" sur Mac) et tape, une ligne à la fois :

```bash
node -v
```
Si ça affiche une erreur "command not found", installe d'abord Node.js depuis
[nodejs.org](https://nodejs.org) (bouton vert "LTS"), puis reviens ici.

```bash
npm install -g firebase-tools
firebase login
```
Une page internet s'ouvre : connecte-toi avec le compte Google qui a créé le
projet Firebase.

### 4.4 Déployer les notifications

Dans le Terminal, place-toi dans le dossier du projet (celui avec
`index.html`, `functions/`, etc. — glisse le dossier dans le Terminal après
avoir tapé `cd ` pour remplir le chemin automatiquement), puis :

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

Ça prend 1 à 3 minutes. À la fin, le Terminal affiche une ligne
`✔ Deploy complete!`. C'est fait — plus jamais besoin d'y retoucher, sauf si
tu modifies `functions/index.js`.

### 4.5 Installer le jeu et activer les notifications (pour chaque joueur)

**Sur iPhone (Safari) :**
1. Ouvrir le lien personnel reçu → bouton **Partager** (carré avec flèche) → **Sur l'écran d'accueil** → Ajouter.
2. **Important** : quitter Safari et rouvrir le jeu depuis l'icône ajoutée à l'écran d'accueil (pas depuis Safari) — c'est une exigence d'Apple pour que les notifications marchent.
3. Une fois dans l'espace d'équipe, taper **"Activer les notifications"** et choisir **Autoriser**.

**Sur Android (Chrome) :**
1. Ouvrir le lien personnel → menu **⋮** → **Ajouter à l'écran d'accueil** (facultatif mais recommandé).
2. Dans l'espace d'équipe, taper **"Activer les notifications"** et choisir **Autoriser**.

### 4.6 Utiliser le panneau notifications pendant la soirée

Onglet **🔔 Notifications** de l'admin : boutons d'action rapide (mission à
toutes les équipes, mission à une équipe précise, bonus secret avec ajout de
points automatique, publication du classement), plus un formulaire pour
préparer des brouillons à l'avance et les envoyer d'un clic au bon moment.

### 4.7 Solution de secours

Si quelqu'un refuse la permission ou que son téléphone ne supporte pas les
notifications, ce n'est pas grave : tant que l'onglet du jeu reste ouvert
(même en arrière-plan), l'alerte s'affiche quand même à l'écran avec un son
et une vibration — c'est géré automatiquement, rien à faire.

---

## 5. Générer et distribuer les QR codes

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

## 6. Personnaliser le contenu

Tout est dans **`js/data.js`**, en clair et commenté :

- `players` : un objet par joueur avec son personnage (= son codename
  d'agent de la Cellule Ouessant), son intro immersive, et ses **indices sur
  son/ses partenaire(s)**. Indices génériques (archétypes de personnages)
  puisque je ne connais pas vos private jokes — **c'est l'endroit où les
  personnaliser** pour un effet beaucoup plus fun.
- `teams` : nom, objectif, pouvoir, thème visuel, un champ `missions` qui
  liste les identifiants de mission de l'équipe **par chapitre**
  (`{ 1: ["roland"], 2: [...4 missions...], 3: ["quiz-ipc"] }`), un champ
  `codeFragment` + `fragmentPosition` (le morceau de code de la Mallette IPC
  obtenu en terminant le Quiz IPC), et pour les deux équipes infiltrées :
  `dormant: true` + `handler` (nom du commanditaire). Le champ `finalMission`
  existe toujours dans la structure mais n'est plus utilisé (legacy Protocole
  Omega, remplacé par la Mallette IPC commune — voir section 9).
- `chapitres` : les 3 chapitres (`nom`, `accroche`, et le titre/texte de la
  notification push envoyée à l'activation).
- `commonMissions` : la mission « Interroger Roland » (chapitre 1, commune
  aux 5 équipes — l'échange avec Roland est une interaction en direct, pas
  une mécanique numérique : chaque équipe valide elle-même la mission une
  fois l'échange terminé).
- `missions` : le catalogue des missions principales (4 par équipe au
  chapitre 2 + `"quiz-ipc"` commun à toutes au chapitre 3, qui remplace
  l'ancienne 5e mission propre à chaque équipe), courtes, comprises en moins
  de 10 secondes, validées d'un seul tap. Une mission par équipe au chapitre
  2 est de type `"choix"` (risque vs sécurité, résolution instantanée).
- `secretMissions` : les missions de sabotage des deux agents dormants
  (3 par équipe infiltrée), toujours visibles dans leur propre espace via un
  bloc « Canal privé », jamais montrées aux autres équipes. Créditent un
  `handlerScore` séparé du score officiel.
- `finalMissions` : vide (`{}`), conservé uniquement pour compatibilité —
  legacy Protocole Omega, remplacé par la Mallette IPC (section 9).
- `ipcQuiz` : la banque de questions du Quiz IPC (`bank`, 56 questions à ce
  jour), `questionsPerRun` (5), `timerSeconds` (20), `pointsPerCorrect` (10)
  et `categoryMix` (répartition cible produits/culture/pièges — voir
  section 9 pour les détails et pour compléter la catégorie « culture »).
- `malletteCode` : le code final de la Mallette IPC, reconstitué en
  concaténant `teams.*.codeFragment` dans l'ordre `TEAM_ORDER`.

Aucune autre modification de code n'est nécessaire pour changer le contenu.

---

## 7. Déroulé de la soirée (logique du jeu)

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
trouve : score en direct, barre de progression, les missions du/des
chapitre(s) actifs, pouvoir d'équipe (une seule utilisation), et les
événements envoyés par toi.

**Les 3 chapitres** — depuis l'onglet **📖 Chapitres** du panneau admin, tu
actives chaque chapitre au bon moment de la soirée. Chaque activation envoie
une vraie notification push à toutes les équipes et fait apparaître les
nouvelles missions correspondantes (les missions restent cumulatives : au
chapitre 2, les équipes voient encore la mission du chapitre 1) :

1. **Briefing & Roland** — l'alerte tombe, et chaque équipe a 30 minutes pour
   interroger Roland avant son départ (mission commune « Interroger Roland »,
   validée par les équipes elles-mêmes une fois l'échange terminé).
2. **Enquête** — le gros de la soirée : 4 missions courtes par équipe,
   réellement liées à leur spécialité (bluff pour la Casa, filature pour
   Batman, terrain pour les Aventuriers, décodage pour Potter, instinct pour
   Tarzan & Jane), dont une mission à choix risque/sécurité.
3. **Quiz IPC & Convergence** — la mission « Quiz IPC » se débloque chez les
   5 équipes (elle remplace l'ancienne 5e mission propre à chaque équipe).
   Chaque équipe qui la termine reçoit un fragment du code final de la
   Mallette IPC (voir section 9). Les pouvoirs et protections sont
   réinitialisés pour tout le monde.

**Validation des missions** : toutes les missions principales se valident
d'un seul tap ("✔️ Mission accomplie"), sans preuve à envoyer — les points
sont crédités instantanément. Seul le **Quiz IPC** a sa propre interface
(questions à la suite, chrono, feedback immédiat), décrite en section 9.

**Pouvoirs** : chaque équipe a un bouton "Utiliser le pouvoir" dans son
espace, utilisable une seule fois (remis à zéro à l'activation du chapitre
3). Effets automatiques (vol de points, protection, échange de mission...)
gérés par le site.

**Événements** : onglet **🌩️ Événements** de l'admin — types prêts à
l'emploi (bonus, piège, mission urgente, vol de points...), envoyables à une
équipe ou à toutes, avec message personnalisable.

**Fin de soirée** : normalement automatique — dès que les 5 équipes ont
terminé leur Quiz IPC et qu'une équipe saisit le bon code sur la page « La
Mallette IPC » (voir section 9), la révélation finale se déclenche toute
seule chez tout le monde : classement, statistiques du Quiz IPC (bonnes/
mauvaises réponses, gorgées), et démasquage des deux agents dormants.
L'onglet **🕶️ Dormants** (voir section 8) garde un bouton de secours pour la
déclencher manuellement en cas de souci technique. Termine avec l'onglet
**🥇 Récompenses** pour annoncer les prix (équipe gagnante, meilleure
enquête, meilleur bluff, mission la plus drôle, meilleur agent double,
meilleure preuve).

---

## 8. Les agents dormants (confidentiel)

Casa de Papel et Harry Potter sont secrètement des agents doubles — chacune
sait qu'elle est infiltrée, mais ignore totalement l'existence de l'autre.
Toute cette mécanique est gérée dans un onglet admin séparé et confidentiel :

**Missions secrètes** — visibles uniquement dans l'espace de ces deux
équipes, via un bloc rouge « 🕶️ Canal privé », toujours affiché (pas besoin
d'attendre un chapitre). Chaque sabotage réussi crédite un `handlerScore`
séparé du score officiel — invisible du classement pendant toute la soirée.

**Onglet 🕶️ Dormants (admin)** — réservé à toi : progression des sabotages
de chaque équipe infiltrée, le code complet de la Mallette IPC + le fragment
et l'état (pas commencé / en cours / fini) de chaque équipe + son compteur de
gorgées, et le bouton de secours **🏁 Déclencher la révélation finale**, qui
envoie à toutes les équipes en même temps : le classement officiel, les
statistiques du Quiz IPC, et le démasquage des deux agents dormants (avec
leurs commanditaires et leurs points Handler).

⚠️ Ne projette/n'affiche jamais l'onglet Dormants à l'écran pendant la
soirée — c'est le seul endroit qui casse la surprise.

---

## 9. Le Quiz IPC et la Mallette finale

Au Chapitre 3, la mission **« Quiz IPC »** se débloque chez les 5 équipes (à
la place de leur ancienne 5e mission). C'est un module de formation ludique :
5 questions tirées au sort dans une banque de **56 questions** (`GAME_DATA.
ipcQuiz.bank`), jamais les mêmes deux parties de suite.

**Catégories** (réglables dans `ipcQuiz.categoryMix`) :
- **Produits** (40 questions actives) — reconnaître les vrais noms de
  produits IPC parmi des noms inventés très ressemblants (existence,
  intrus, trouver le bon nom exact).
- **Pièges** (16 questions actives) — variante plus retorse du même
  principe, explicitement présentée comme un piège.
- **Culture générale** (0 question pour l'instant) — ⚠️ **catégorie à
  compléter** : elle nécessite les vrais faits sur IPC (siège social,
  signification du sigle, année de création, métiers/secteurs, valeurs,
  certifications, engagements environnementaux, univers produits...) que je
  n'avais pas au moment de construire ce module, pour ne pas risquer
  d'inventer une fausse information sur l'entreprise. Donne-moi ces faits et
  j'ajoute les questions dans `ipcQuiz.bank` (même format que les autres,
  `category:"culture"`) — le tirage s'en sert alors automatiquement, sans
  autre changement de code. Idem si tu veux aussi des questions sur l'usage
  réel de chaque produit (je n'ai construit que des questions de
  reconnaissance de nom, faute de connaître leur fonction exacte).

**Déroulé pour une équipe** : chrono de 20 secondes par question, feedback
immédiat (vert/rouge + courte explication), score en direct. Chaque bonne
réponse rapporte 10 points (crédités au score officiel une fois les 5
questions terminées) ; chaque mauvaise réponse incrémente un compteur de
« gorgées » **visible uniquement dans l'onglet admin 🕶️ Dormants** — aucune
pénalité de points, aucune règle de jeu à boire gérée par le site.

À la fin du quiz, l'équipe reçoit son **fragment de code** (`team.
codeFragment`, ex. `"TO"` pour La Casa de Papel) et sa position (1 à 5).

**La Mallette IPC** : une fois que les 5 équipes ont terminé leur Quiz IPC,
un bandeau « 🧳 La Mallette IPC » apparaît chez toutes les équipes,
invitant tout le monde à se rassembler autour du téléphone d'Hermione pour
mettre les 5 fragments en commun (dans l'ordre de leur position) et saisir
le code complet. Bon code → petite animation d'ouverture puis, directement,
l'écran de révélation finale chez toutes les équipes en même temps.

---

## 10. Immersion visuelle et sonore

Dès qu'un joueur ou une équipe accède à son espace, `document.body` reçoit
l'attribut `data-theme` de son univers, qui pilote tout : palette de
couleurs, typographie (`Cinzel Decorative` pour Harry Potter, `Bebas Neue`
pour La Casa, `Orbitron` pour Batman, `Rye` pour les Aventuriers, `Fredoka`
pour Tarzan & Jane), fond animé discret propre à l'univers (bougies et
particules dorées pour Poudlard, alarme et billets pour le braquage, pluie
et Bat-Signal pour Gotham, sable et poussière pour l'aventure, feuillage et
lucioles pour la jungle), et halo lumineux sur les cartes et le score.

**Musique et sons** — tout est généré en direct par le navigateur
(`js/audio.js`, Web Audio API), sans aucun fichier audio externe : chaque
équipe a sa propre ambiance sonore discrète qui démarre automatiquement (ou
au premier clic si le téléphone bloque la lecture auto) et des effets
sonores courts et propres à son univers (validation de mission, réception
d'un événement, utilisation du pouvoir, activation d'un nouveau chapitre,
ouverture de la Mallette IPC). Un bouton rond 🔊/🔇 flottant en bas à droite
de chaque espace équipe permet de couper le son à tout moment.

**Révélation d'équipe** — dès qu'un binôme/trio valide correctement son
équipe en Phase 1, un écran noir s'affiche avec une mise en scène en 4
temps ("Connexion...", "ÉQUIPE IDENTIFIÉE", logo animé de l'univers, puis
une phrase immersive propre à l'équipe) avant de basculer automatiquement
vers l'espace d'équipe, musique déjà lancée.

**Habillage « renseignement »** — scanlines rouges discrètes en fond sur
tout le site, classe utilitaire `.glitch` pour les titres qui doivent
« grésiller », police terminal pour le chrono du Quiz IPC, animations
vert/rouge de feedback et animation d'ouverture pour la Mallette IPC.
Chaque équipe garde sa propre couleur/thème (déjà en place) : cette couche
vient se superposer, pas remplacer.

---

## 11. Panneau admin

Va sur `https://.../admin.html`, entre ton mot de passe (défini dans
`js/firebase-config.js`). Onglets disponibles : **📖 Chapitres** (activer
Briefing & Roland, Enquête ou Quiz IPC & Convergence — voir section 7), **🏆
Scores** (scores en direct, ajustement manuel des points, bloquer/débloquer
une équipe — affiche aussi les points Handler des agents dormants et le
compteur de gorgées de chaque équipe), **📸 Preuves** (missions avec photo à
valider, s'il y en a), **🎲 Tirages** (rappel sur la fenêtre Roland +
indices/rebondissements libres), **🌩️ Événements**, **🧭 Demandes** (indice
du pouvoir des Aventuriers), **🔔 Notifications** (actions rapides +
brouillons — voir section 4.6), **🕶️ Dormants** (confidentiel — sabotages,
code et état de la Mallette IPC, gorgées, révélation finale de secours —
voir sections 8 et 9), et **🥇 Récompenses** (classement final).

---

## 12. Checklist avant la soirée

- [ ] Firebase configuré (`js/firebase-config.js` rempli, pas de
      "REMPLACE-MOI" restant)
- [ ] Mot de passe admin changé
- [ ] Site déployé et accessible sur mobile (teste `index.html?player=mathieu`
      par exemple)
- [ ] QR codes générés depuis `qrcodes.html` **en ligne** et imprimés /
      envoyés
- [ ] Test rapide : ouvrir deux téléphones différents, valider une équipe,
      vérifier que le score bouge en direct sur les deux
- [ ] Tester l'activation des 3 chapitres depuis l'onglet **📖 Chapitres**,
      vérifier le Canal privé des deux agents dormants, et faire passer le
      Quiz IPC à une équipe test
- [ ] Compléter la catégorie « culture générale » du Quiz IPC avec les
      vrais faits sur IPC (voir section 9) — sinon le quiz tourne quand même
      très bien avec les seules catégories « produits » et « pièges »
- [ ] Tester la Mallette IPC : faire terminer le Quiz IPC aux 5 équipes,
      vérifier qu'un mauvais code est refusé puis que le bon code
      (`GAME_DATA.malletteCode`, visible dans l'onglet 🕶️ Dormants) ouvre
      bien la révélation finale chez toutes les équipes
- [ ] Vérifier que l'onglet **🕶️ Dormants** n'est jamais projeté à l'écran
- [ ] Plan Blaze activé, clé VAPID renseignée, `firebase deploy --only
      functions` exécuté sans erreur (section 4)
- [ ] Notifications testées : installer le jeu sur un téléphone, activer les
      notifications, envoyer un test depuis l'onglet 🔔 Notifications, et
      vérifier qu'elle arrive même écran verrouillé
- [ ] Vérifier la connexion internet/4G prévue sur les lieux du parcours
- [ ] Briefer en amont la personne qui joue Roland (script/questions-réponses
      dans le dossier de conception « Opération Tornade AD »)

---

## 13. Limites connues

- Le mode Firestore "test" utilisé ici est ouvert (pas d'authentification) :
  suffisant et simple pour une soirée privée entre proches, mais à ne pas
  réutiliser tel quel pour un usage public ou permanent.
- Sans configuration Firebase, le site fonctionne en mode local
  (`localStorage`) mais sans synchronisation entre téléphones — utile
  seulement pour prévisualiser avant la soirée.
- Les photos de preuve sont compressées côté téléphone avant envoi pour
  rester légères, mais nécessitent malgré tout une connexion internet
  correcte au moment de l'envoi.
- Certains navigateurs mobiles bloquent la lecture audio automatique tant
  que l'utilisateur n'a pas interagi avec la page : la musique démarre alors
  dès le premier tap n'importe où sur l'écran (comportement normal, prévu
  par le code).

Bonne soirée à Brest ! 🥂
