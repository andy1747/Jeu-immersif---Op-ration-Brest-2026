# 🎉 Brest Night Game

Jeu de soirée numérique 100 % mobile, piloté par QR codes. 5 équipes, 2 missions
communes, 40 missions d'équipe (manipulation, bluff, négociation, risque),
25 défis surprise, des pouvoirs, des événements aléatoires, un Marché Noir,
des Contrats Secrets, une Opération Minuit finale, et un panneau admin pour
toi (Andreia). Chaque équipe a sa propre identité visuelle et sonore
(fond animé, typographie, musique d'ambiance procédurale, effets sonores) et
une mise en scène cinématique à la découverte de son équipe.

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
    ├── audio.js          → musique d'ambiance + effets sonores, générés en direct (aucun fichier audio)
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
  preuve, pénalité). Une mission par équipe est de type `"choix"` (risque vs
  sécurité, résolution instantanée sans preuve à envoyer — voir section 6).
- `commonMissions` : Le Verre du Destin et Le Défi du Hasard.
- `surpriseChallenges` : les 25 défis surprise.
- `finalMissions` : la mission finale à 100 points de chaque équipe, débloquée
  uniquement au déclenchement de l'Opération Minuit (voir section 6).

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

## 7. Les nouveaux systèmes (manipulation, négo, bluff)

Le jeu est pensé pour une bande de commerciaux qui adorent négocier,
manipuler, bluffer et prendre des risques. Quatre mécaniques s'ajoutent aux
missions classiques :

**Missions à choix (risque/sécurité)** — une mission par équipe (ex.
`casa-1`) propose un choix binaire, résolu instantanément dans le
téléphone : sécuriser un petit gain garanti, ou tenter un gros coup avec un
vrai risque de perdre des points. Aucune preuve à envoyer, aucune validation
admin nécessaire — tu vois juste le résultat apparaître dans l'onglet
Scores.

**Marché Noir** — chaque équipe peut publier une offre (indice, objet,
points, protection, alliance, faveur...) depuis son espace, visible par
toutes les autres. Les négociations se font en vrai, dans la soirée. Une
fois qu'un accord est trouvé, va dans l'onglet **🖤 Marché** du panneau admin
pour marquer l'offre comme conclue, puis ajuste les points ou effets dans
l'onglet **🏆 Scores** en conséquence (le site ne solde pas l'échange
automatiquement — c'est volontaire, pour que tu gardes la main sur
l'équilibrage).

**Contrats Secrets** — depuis l'onglet **🕵️ Contrats**, envoie à UNE seule
équipe une mission secrète à forte valeur (invisible pour toutes les
autres) : retourner une alliance, saboter une mission adverse, voler un
objet précis... L'équipe la voit apparaître dans son espace, envoie une
preuve/note une fois réalisée, et tu valides ou refuses depuis ce même
onglet.

**Opération Minuit (grand final)** — se déclenche automatiquement à minuit
pile si tu actives la bascule dans l'onglet **🚨 Minuit** (ou manuellement à
tout moment via le bouton "Déclencher maintenant"). Effet immédiat sur tous
les téléphones : classement gelé, alliances rompues, protections
supprimées, pouvoirs réutilisables une seconde fois, et une mission finale
unique à 100 points débloquée chez chaque équipe, qui force l'interaction
avec les 4 autres. Pensé pour driver les 45 dernières minutes de la soirée.
Le déclenchement est protégé contre les doublons : une fois parti, il ne se
redéclenche pas.

---

## 8. Immersion visuelle et sonore

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
d'un événement, utilisation du pouvoir, ouverture d'une nouvelle mission,
Opération Minuit). Un bouton rond 🔊/🔇 flottant en bas à droite de chaque
espace équipe permet de couper le son à tout moment.

**Révélation d'équipe** — dès qu'un binôme/trio valide correctement son
équipe en Phase 1, un écran noir s'affiche avec une mise en scène en 4
temps ("Connexion...", "ÉQUIPE IDENTIFIÉE", logo animé de l'univers, puis
une phrase immersive propre à l'équipe) avant de basculer automatiquement
vers l'espace d'équipe, musique déjà lancée.

---

## 9. Panneau admin

Va sur `https://.../admin.html`, entre ton mot de passe (défini dans
`js/firebase-config.js`). Onglets disponibles : **🏆 Scores** (voir les
scores en direct, ajuster manuellement les points, bloquer/débloquer une
équipe, débloquer une mission manuellement), **📸 Preuves** (valider ou
refuser les preuves de mission), **🎲 Tirages**, **🌩️ Événements**,
**🧭 Demandes** (indices du pouvoir des Aventuriers), **🖤 Marché** (voir et
conclure les offres du Marché Noir), **🕵️ Contrats** (envoyer et valider les
Contrats Secrets), **🚨 Minuit** (activer/déclencher l'Opération Minuit), et
**🥇 Récompenses** (classement final).

---

## 10. Checklist avant la soirée

- [ ] Firebase configuré (`js/firebase-config.js` rempli, pas de
      "REMPLACE-MOI" restant)
- [ ] Mot de passe admin changé
- [ ] Site déployé et accessible sur mobile (teste `index.html?player=mathieu`
      par exemple)
- [ ] QR codes générés depuis `qrcodes.html` **en ligne** et imprimés /
      envoyés
- [ ] Test rapide : ouvrir deux téléphones différents, valider une équipe,
      vérifier que le score bouge en direct sur les deux
- [ ] Tester une mission à choix, publier/conclure une offre au Marché Noir,
      envoyer un Contrat Secret, et déclencher l'Opération Minuit
      manuellement une fois pour vérifier que tout s'affiche bien
- [ ] Vérifier la connexion internet/4G prévue sur les lieux du parcours

---

## 11. Limites connues

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
