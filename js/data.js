/* ===================================================================
   OPÉRATION TORNADE AD — Contenu du jeu
   Modifie librement ce fichier : joueurs, missions, équipes...
   Tout le site lit ses données ici. Rien n'est codé en dur ailleurs.
=================================================================== */

const GAME_DATA = {

  // ---------------------------------------------------------------
  // BARÈME DE POINTS (référence)
  // ---------------------------------------------------------------
  POINTS: {
    SIMPLE: 10,
    INTERMEDIAIRE: 15,
    DIFFICILE: 20,
    CLIMAX: 25,
    PENALITE_LEGERE: -5
  },

  // ---------------------------------------------------------------
  // ÉQUIPES — cellules de terrain de la Cellule Ouessant
  // ---------------------------------------------------------------
  teams: {
    casa: {
      id: "casa",
      nom: "La Casa de Papel",
      accroche: "Le casse parfait ne laisse aucune trace.",
      objectif: "Infiltration, ingénierie sociale, bluff. Découvrez ce qui s'est réellement passé chez Armorik Biotech — sans jamais vous faire piéger.",
      membres: ["mathieu", "manue", "brice"],
      theme: "casa",
      dormant: true,
      handler: "Solenn Dynamics",
      pouvoir: {
        nom: "Braquage Éclair",
        description: "Une fois dans la soirée, volez publiquement 10 points à l'équipe adverse de votre choix.",
        type: "vol_points",
        valeur: 10
      },
      missions: { 1: ["casa-1"], 2: { draw: 4 }, 3: ["quiz-ipc"] },
      finalMission: null,
      codeDigit: "2"
    },
    potter: {
      id: "potter",
      nom: "Harry Potter",
      accroche: "Une malédiction plane sur cette soirée. À vous de la déjouer.",
      objectif: "Cryptographie, déduction rapide, décodage. Une seule cellule retrouvera Roland avant la fin — et ce sera peut-être la vôtre.",
      membres: ["andreia", "marc"],
      theme: "potter",
      dormant: true,
      handler: "Groupe Kestrel",
      pouvoir: {
        nom: "Retourneur de Temps",
        description: "Une fois dans la soirée, annulez une pénalité déjà reçue OU obtenez de rejouer une mission ratée.",
        type: "annule_penalite",
        valeur: 1
      },
      missions: { 1: ["potter-1"], 2: { draw: 4 }, 3: ["quiz-ipc"] },
      finalMission: null,
      codeDigit: "9"
    },
    batman: {
      id: "batman",
      nom: "Batman & Robin",
      accroche: "Gotham a besoin de vous. Enquêtez, protégez, démasquez.",
      objectif: "Filature, analyse comportementale, interrogatoire. Traquez LE CORBEAU avant qu'il ne quitte Brest.",
      membres: ["audrey", "arnaud"],
      theme: "batman",
      dormant: false,
      pouvoir: {
        nom: "Surveillance Nocturne",
        description: "Une fois dans la soirée, révélez si une équipe a utilisé son pouvoir récemment, et annulez un vol de points dirigé contre vous dans les 10 minutes qui suivent son activation.",
        type: "protection",
        valeur: 10
      },
      missions: { 1: ["batman-1"], 2: { draw: 4 }, 3: ["quiz-ipc"] },
      finalMission: null,
      codeDigit: "2"
    },
    aventuriers: {
      id: "aventuriers",
      nom: "Lara Croft & Indiana Jones",
      accroche: "Un trésor est caché sur le parcours de ce soir.",
      objectif: "Exploration urbaine, terrain, découverte d'indices physiques. Reconstituez la carte avant tout le monde.",
      membres: ["emilie", "patrice"],
      theme: "aventuriers",
      dormant: false,
      pouvoir: {
        nom: "Sixième Sens de l'Aventurier",
        description: "Une fois dans la soirée, obtenez un indice supplémentaire de l'organisatrice sur n'importe quelle mission en cours.",
        type: "indice",
        valeur: 1
      },
      missions: { 1: ["aventuriers-1"], 2: { draw: 4 }, 3: ["quiz-ipc"] },
      finalMission: null,
      codeDigit: "0"
    },
    tarzan: {
      id: "tarzan",
      nom: "Tarzan & Jane",
      accroche: "La jungle a ses propres règles. Ce soir, c'est vous qui les écrivez.",
      objectif: "Instinct, contact humain, débrouille physique. Suivez votre flair, il ne vous trompe jamais.",
      membres: ["fred", "manon"],
      theme: "tarzan",
      dormant: false,
      pouvoir: {
        nom: "Cri de la Jungle",
        description: "Une fois dans la soirée, échangez une de vos missions en cours contre une mission déjà débloquée d'une équipe adverse de votre choix.",
        type: "echange_mission",
        valeur: 1
      },
      missions: { 1: ["tarzan-1"], 2: { draw: 4 }, 3: ["quiz-ipc"] },
      finalMission: null,
      codeDigit: "0"
    }
  },

  // ---------------------------------------------------------------
  // LE COFFRE IPC — final commun à toutes les équipes.
  // Chaque équipe reçoit UN SEUL chiffre (team.codeDigit), et seulement
  // une fois qu'elle a terminé ABSOLUMENT TOUTES ses missions en cours
  // (voir Store.teamMissionsComplete) — pas seulement le Quiz IPC. Chaque
  // équipe ignore totalement le chiffre des autres.
  // Le numéro d'équipe (1 à 5, affiché dès le début) correspond à sa
  // position dans TEAM_ORDER : Casa=1, Potter=2, Batman=3, Aventuriers=4,
  // Tarzan=5. Mis bout à bout dans cet ordre, les 5 chiffres reconstituent
  // ce code (voir js/store.js: validateCoffreCode) : c'est le code postal
  // de Brest, où se déroule la soirée — un joli clin d'œil.
  //
  // Le code n'est saisi QUE sur le "téléphone principal" (onglet admin
  // 🔐 Coffre IPC), jamais sur les téléphones des équipes elles-mêmes.
  // ---------------------------------------------------------------
  coffreCode: "29200",

  // ---------------------------------------------------------------
  // CHAPITRES — activés manuellement par l'organisatrice (onglet admin).
  // ---------------------------------------------------------------
  chapitres: {
    1: {
      id: 1, nom: "Briefing & Roland",
      accroche: "L'alerte vient de tomber. Roland ne reste que quelques minutes.",
      notifTitle: "🔴 ALERTE CELLULE OUESSANT",
      notifBody: "Intrusion détectée chez Armorik Biotech. Formule TORNADE AD en verrouillage d'urgence. Rejoignez votre poste."
    },
    2: {
      id: 2, nom: "Enquête",
      accroche: "L'enquête est officiellement lancée. Chaque indice compte.",
      notifTitle: "🚨 Chapitre 2 — Enquête",
      notifBody: "Vos ordres de mission viennent de tomber. À vous de jouer."
    },
    3: {
      id: 3, nom: "Quiz IPC & Convergence",
      accroche: "Le compte à rebours final a commencé.",
      notifTitle: "🧠 QUIZ IPC DÉBLOQUÉ",
      notifBody: "Une dernière mission apparaît chez chaque équipe : le Quiz IPC. Terminez-le pour obtenir votre fragment du code final."
    }
  },

  // ---------------------------------------------------------------
  // JOUEURS — QR codes personnels (phase 1)
  // Les alias (Professeur, Nairobi, Hermione...) sont les codenames
  // choisis par la Cellule Ouessant pour ses agents de terrain.
  // partners = prénoms attendus (en minuscules) pour valider l'équipe
  // ---------------------------------------------------------------
  players: {
    mathieu: {
      id: "mathieu", nom: "Mathieu", team: "casa", personnage: "Le Professeur",
      univers: "La Casa de Papel",
      intro: "La Cellule Ouessant t'a attribué le codename LE PROFESSEUR. Architecte silencieux, tu gardes toujours un coup d'avance. Ce soir, deux complices t'attendent : Nairobi, aussi imprévisible que brillante, et Berlin, persuadé d'avoir déjà résolu l'affaire. Retrouve-les avant que l'enquête ne t'échappe.",
      partners: ["manue", "brice"],
      indices: [
        "Nairobi ne recule jamais devant une négociation, même perdue d'avance.",
        "Berlin est convaincu d'être le meilleur agent de la soirée — demandez-lui, il vous le dira lui-même.",
        "L'un des deux a déjà proposé un toast avant même le début du briefing.",
        "L'autre est du genre à réécrire les règles... et à jurer que c'était prévu depuis le début.",
        "Ensemble, ils forment un duo capable de vous vendre n'importe quelle couverture avec le sourire."
      ]
    },
    manue: {
      id: "manue", nom: "Manue", team: "casa", personnage: "Nairobi",
      univers: "La Casa de Papel",
      intro: "Codename NAIROBI. Le cœur de la cellule, celle qui garde tout le monde soudé même quand le plan part en vrille. Deux agents comptent sur toi ce soir : le Professeur, calculateur jusqu'à l'obsession, et Berlin, aussi charmant qu'ingérable.",
      partners: ["mathieu", "brice"],
      indices: [
        "Le Professeur a probablement déjà un plan B, C et D avant même le début de l'opération.",
        "Il n'aime pas l'improvisation — mais il adore observer avant d'agir.",
        "Berlin, lui, se croit irrésistible et le fait savoir sans qu'on lui demande.",
        "L'un des deux porte ce soir quelque chose qui trahit son perfectionnisme discret.",
        "L'autre a sûrement déjà fait un compliment excessif à quelqu'un dans les dix premières minutes."
      ]
    },
    brice: {
      id: "brice", nom: "Brice", team: "casa", personnage: "Berlin",
      univers: "La Casa de Papel",
      intro: "Codename BERLIN. Élégant, sûr de lui, persuadé que cette enquête ne peut aboutir que grâce à toi. Deux complices te suivent malgré eux ce soir : le Professeur, stratège obsessionnel, et Nairobi, redoutable en négociation.",
      partners: ["mathieu", "manue"],
      indices: [
        "Le Professeur parle peu, observe beaucoup, et déteste qu'on improvise sur son plan.",
        "Nairobi est du genre à retourner une situation perdue en trois phrases.",
        "L'un des deux a probablement relu le briefing plus d'une fois.",
        "L'autre n'a jamais peur de dire tout haut ce que les autres pensent tout bas.",
        "Repérez qui garde son calme même dans le chaos : c'est un bon indice."
      ]
    },
    andreia: {
      id: "andreia", nom: "Andreia", team: "potter", personnage: "Hermione Granger",
      univers: "Harry Potter",
      intro: "Codename HERMIONE GRANGER. Stratège redoutable, incapable de laisser un dossier mal classé. Ce soir, Harry est ton partenaire — vous formez sans doute la cellule la plus méthodique de la soirée.",
      partners: ["marc"],
      indices: [
        "Il porte le poids d'une réputation qu'il n'a pas choisie, mais il ne recule jamais devant un défi.",
        "Il a une petite cicatrice dont il refuse obstinément de parler ce soir.",
        "Il fonce avant de réfléchir — l'exact inverse de toi.",
        "Il déteste perdre, presque autant que toi."
      ]
    },
    marc: {
      id: "marc", nom: "Marc", team: "potter", personnage: "Harry Potter",
      univers: "Harry Potter",
      intro: "Codename HARRY POTTER. Celui qui fonce sans toujours réfléchir, porté par l'instinct plus que par la méthode. Ce soir, Hermione est ta partenaire — la seule capable de garder ton enquête sur les rails.",
      partners: ["andreia"],
      indices: [
        "Elle a probablement déjà mémorisé le briefing complet de la soirée.",
        "Elle n'improvise jamais sans un plan de secours.",
        "Elle déteste perdre, et elle le montre même quand elle essaie de le cacher.",
        "Elle corrige les gens sans même s'en rendre compte."
      ]
    },
    audrey: {
      id: "audrey", nom: "Audrey", team: "batman", personnage: "Robin",
      univers: "Batman & Robin",
      intro: "Codename ROBIN. Partenaire fidèle et impulsif·ve, toujours prêt·e à foncer là où l'autre hésite encore. Ce soir, un agent plus discret que toi t'attend pour former la cellule de surveillance.",
      partners: ["arnaud"],
      indices: [
        "Votre partenaire n'aime pas être le centre de l'attention, mais il remarque tout.",
        "Il a probablement déjà repéré les sorties et les recoins du lieu sans que personne ne le lui demande.",
        "Discret en apparence, redoutablement stratège en réalité.",
        "Reconnaissable à sa capacité à garder un secret bien plus longtemps que la moyenne."
      ]
    },
    arnaud: {
      id: "arnaud", nom: "Arnaud", team: "batman", personnage: "Batman",
      univers: "Batman & Robin",
      intro: "Codename BATMAN. Stratège solitaire, observateur depuis l'ombre. Ce soir, Robin t'attend — plus impulsif·ve que toi, mais d'une loyauté à toute épreuve.",
      partners: ["audrey"],
      indices: [
        "Votre partenaire a le sens de l'observation d'un détective né.",
        "Elle préfère agir vite plutôt que trop réfléchir.",
        "Une énergie qui contraste avec votre calme apparent.",
        "Vous formez un duo que personne ne voit vraiment venir."
      ]
    },
    emilie: {
      id: "emilie", nom: "Émilie", team: "aventuriers", personnage: "Lara Croft",
      univers: "Lara Croft & Indiana Jones",
      intro: "Codename LARA CROFT. Intrépide, indépendante, toujours prête à prendre un risque calculé pour faire avancer l'enquête. Indiana Jones est ton partenaire de terrain ce soir — aussi passionné que toi, mais nettement moins organisé.",
      partners: ["patrice"],
      indices: [
        "Il a un chapeau imaginaire qu'il ajuste sans même y penser.",
        "Il improvise plus qu'il ne planifie, et ça lui réussit étonnamment bien.",
        "Il déteste les serpents. Demandez-lui, juste pour voir sa réaction.",
        "Il a le sens de la formule et de l'anecdote qui capte l'attention."
      ]
    },
    patrice: {
      id: "patrice", nom: "Patrice", team: "aventuriers", personnage: "Indiana Jones",
      univers: "Lara Croft & Indiana Jones",
      intro: "Codename INDIANA JONES. Débrouillard, plus doué pour improviser que pour suivre un plan. Lara Croft est ta partenaire ce soir — aussi intrépide que toi, mais bien plus méthodique.",
      partners: ["emilie"],
      indices: [
        "Elle a toujours un plan B, même pour une mission censée être improvisée.",
        "Elle n'a peur de rien, ou en tout cas ne le montre jamais.",
        "Elle observe une pièce entière avant d'y entrer complètement.",
        "Elle est du genre à accepter un pari risqué juste pour le frisson."
      ]
    },
    fred: {
      id: "fred", nom: "Fred", team: "tarzan", personnage: "Tarzan",
      univers: "Tarzan & Jane",
      intro: "Codename TARZAN. Élevé loin des codes classiques du renseignement, tu fais confiance à ton instinct avant tout. Ce soir, Jane t'attend — aussi curieuse que toi, mais bien plus stratège.",
      partners: ["manon"],
      indices: [
        "Votre partenaire a un sens de l'orientation étonnamment fiable, même en terrain inconnu.",
        "Elle est capable de rallier tout un groupe autour d'une idée complètement folle.",
        "Curieuse de tout ce qui sort de l'ordinaire.",
        "Repérez qui semble le plus à l'aise à improviser."
      ]
    },
    manon: {
      id: "manon", nom: "Manon", team: "tarzan", personnage: "Jane",
      univers: "Tarzan & Jane",
      intro: "Codename JANE. Curieuse, cultivée, mais totalement à l'aise sur le terrain. Ce soir, Tarzan t'attend — moins bavard que toi, mais d'un instinct plus sûr que n'importe quel plan écrit à l'avance.",
      partners: ["fred"],
      indices: [
        "Votre partenaire a un instinct plus sûr que n'importe quel plan écrit à l'avance.",
        "Il se sent plus à l'aise en pleine nature que dans les conventions.",
        "Sous des airs sauvages, il est étonnamment protecteur envers son clan.",
        "Repérez qui semble toujours prêt à improviser un cri de ralliement."
      ]
    }
  },

  // ---------------------------------------------------------------
  // MISSIONS COMMUNES — vide désormais : la fenêtre Roland (chapitre 1)
  // n'est plus une mission unique partagée par les 5 équipes (c'était
  // exactement le problème signalé : des missions presque identiques
  // d'une équipe à l'autre). Elle est remplacée par 5 missions dédiées,
  // une par équipe, dans "missions" ci-dessous. Conservé vide pour
  // compatibilité avec getMissionDef() (chaîne de recherche inchangée).
  // ---------------------------------------------------------------
  commonMissions: {},

  // ---------------------------------------------------------------
  // MISSIONS PAR ÉQUIPE (chapitre 1) + QUIZ IPC (chapitre 3, commun).
  // Chapitre 1 = univers vraiment dédié à chaque équipe : même point de
  // départ narratif (Roland Kerdoncuff, directeur financier d'Armorik
  // Biotech, ne reste que quelques minutes avant son départ précipité),
  // mais une façon de s'y prendre totalement différente selon l'identité
  // de la cellule — TOUJOURS un travail d'équipe collectif, jamais une
  // seule personne sommée de tenir un rôle ou d'arracher des confidences :
  //   - Casa de Papel      → faux prétexte inventé collectivement (bluff/humour)
  //   - Harry Potter        → déchiffrer un message laissé par Roland (logique)
  //   - Batman & Robin      → filature chronométrée + mime (observation d'équipe)
  //   - Lara Croft/Indiana  → exploration de terrain + preuve (découverte)
  //   - Tarzan & Jane       → posture/signal synchronisé chronométré (instinct de groupe)
  // Le chapitre 2 (banque commune tirée au sort) et le chapitre 3 (Quiz
  // IPC) restent communs à toutes les équipes : c'est la partie "banque
  // commune" du mix dédié + commune demandé.
  // ---------------------------------------------------------------
  missions: {
    "casa-1": { id:"casa-1", team:"casa", titre:"Le Bluff de Roland", points:15, chapitre:1,
      description:"Roland Kerdoncuff, directeur financier d'Armorik Biotech, se méfie de toutes les questions directes. Toute l'équipe invente ensemble, en 1 minute chrono, un faux prétexte crédible (faux titre, fausse mission officielle, argument commercial culotté) puis va l'aborder à plusieurs pour en tirer au moins une information utile sur la nuit du vol.",
      penalite:"Aucune, mais un prétexte improvisé sans concertation d'équipe obtient une réponse bien moins utile." },
    "potter-1": { id:"potter-1", team:"potter", titre:"La Formule Retrouvée", points:15, chapitre:1,
      description:"Avant de filer, Roland glisse à votre équipe un vieux parchemin où il a griffonné à la va-vite deux noms de produits IPC, lettres inversées : « MROTS » et « XOTOI ». Déchiffrez-les ensemble à voix haute, puis présentez votre trouvaille à Roland pour obtenir en échange une information sur la nuit du vol.",
      penalite:"Aucune, mais un déchiffrage incomplet obtient une réponse bien moins précise." },
    "batman-1": { id:"batman-1", team:"batman", titre:"Filature Chronométrée", points:15, chapitre:1,
      description:"Vous avez 3 minutes chrono pour observer discrètement Roland Kerdoncuff et repérer un détail qui trahit sa nervosité (un tic, un regard, un mot répété). Une fois le temps écoulé, mimez ce détail devant votre équipe sans un mot : si tout le monde devine, la piste est confirmée et Roland vous laisse repartir avec une information sur la nuit du vol.",
      penalite:"Aucune, mais une observation trop vague obtient une réponse bien moins utile." },
    "aventuriers-1": { id:"aventuriers-1", team:"aventuriers", titre:"L'Indice du Terrain", points:15, chapitre:1,
      description:"Avant de repartir voir Roland Kerdoncuff, prouvez votre connaissance du terrain : partez explorer les environs immédiats et rapportez une preuve concrète (photo, objet, observation précise) d'un détail lié à IPC ou à son histoire. Présentez ensuite votre preuve à Roland, qui vous confie en échange une information sur la nuit du vol.",
      penalite:"Aucune, mais revenir sans preuve concrète obtient une réponse bien moins utile." },
    "tarzan-1": { id:"tarzan-1", team:"tarzan", titre:"Le Signal du Clan", points:15, chapitre:1,
      description:"Roland ne va pas s'attarder. Sans un mot pour vous concerter à voix haute, toute l'équipe doit se figer en même temps dans une seule posture commune de repérage (bras tendus, doigts pointés, regard fixe — à vous de choisir, mais tout le monde doit faire pareil), en 15 secondes chrono à partir du top départ. Si l'équipe est parfaitement synchronisée, Roland est impressionné et livre une information sur la nuit du vol avant de partir.",
      penalite:"Aucune, mais une posture non synchronisée obtient une information bien moins précise." },

    // Remplace la mission de chapitre 3 de chaque équipe. Score dynamique
    // (pas de "points" fixe) : voir type "quiz" dans app.js/store.js.
    "quiz-ipc": { id:"quiz-ipc", team:null, titre:"Quiz IPC", type:"quiz", chapitre:3,
      description:"Un mini quiz de 5 questions sur les produits et l'histoire d'IPC vous attend. Chaque bonne réponse rapporte des points, chaque erreur reste discrètement notée par l'organisatrice. À la fin, un fragment du code final vous est confié." }
  },

  // ---------------------------------------------------------------
  // BANQUE DE DÉFIS IPC — chapitre 2, tirage aléatoire (4 par équipe,
  // jamais le même tirage deux fois, ni forcément le même d'une équipe
  // à l'autre). Voir Store.drawChallenges pour la logique de tirage :
  // 1 défi "produit" garanti + 3 défis au hasard parmi les autres
  // catégories (commercial, collègues, ambiance, mini-jeux).
  //
  // Deux champs par défi :
  //  - kind:"action"  → carte + bouton "Mission accomplie" (auto-validée),
  //    exactement comme les anciennes missions.
  //  - kind:"quiz1"    → une seule question à choix multiple (question/
  //    options/correct/explanation), rendue par le même moteur que le
  //    Quiz IPC mais pour une seule question.
  //  - kind:"roue"     → mini-jeu "Roue du Hasard" (voir outcomes).
  //
  // ⚠️ Les défis "produit" ci-dessous portent uniquement sur la
  // reconnaissance de noms (vrai/faux, complétion) : pas de vrais usages
  // de chaque produit, donc pas de question "à quoi sert ce produit /
  // quel produit choisir pour telle situation" pour l'instant.
  // La catégorie "culture" (histoire, siège social, valeurs,
  // certifications...) est remplie avec des faits réels sourcés sur
  // ipc-sa.com (voir questions culture-01 à culture-04 ci-dessous et
  // q057-q064 dans ipcQuiz.bank). Il reste deux points à obtenir
  // directement d'Andreia, non publics : quels produits sont devenus
  // "cultes" en interne, et lesquels ont disparu du catalogue — le
  // tirage se rabat automatiquement sur les autres catégories tant que
  // ces deux points précis ne sont pas ajoutés.
  // ---------------------------------------------------------------
  challengeBank: {
    items: [

      // ===================== 🧴 PRODUITS IPC (kind: quiz1) =====================
      { id:"prod-01", category:"produit", kind:"quiz1", titre:"Question Produit IPC", points:10,
        question:"Quel est le nom exact de ce produit de la gamme IPC ?",
        options:["Loft System IOTOX Premium","Loft System IOTOX Pretium","Loft System IOTOX Prime"], correct:0,
        explanation:"« Loft System IOTOX Premium » est bien le nom exact du produit IPC." },
      { id:"prod-02", category:"produit", kind:"quiz1", titre:"Question Produit IPC", points:10,
        question:"Parmi ces noms, lequel est un vrai produit IPC ?",
        options:["IOTOX","IOTOX Neo","IOTOX Plus"], correct:0,
        explanation:"« IOTOX » tout court, sans suffixe, est le vrai produit IPC." },
      { id:"prod-03", category:"produit", kind:"quiz1", titre:"Question Produit IPC", points:10,
        question:"Lequel de ces noms correspond à un vrai produit IPC ?",
        options:["Tornade Biotech AD","Tornade Infinity","Tornade Biotech Pro"], correct:0,
        explanation:"« Tornade Biotech AD » est un vrai produit de la gamme IPC." },
      { id:"prod-04", category:"produit", kind:"quiz1", titre:"Question Produit IPC", points:10,
        question:"Quel est le vrai nom du produit qui a inspiré le nom de cette soirée ?",
        options:["Tornade AD","Tornade Infinity","Tornade Plus"], correct:0,
        explanation:"« Tornade AD » existe vraiment chez IPC — clin d'œil au nom de l'opération de ce soir !" },
      { id:"prod-05", category:"produit", kind:"quiz1", titre:"Question Produit IPC", points:10,
        question:"Parmi ces variantes, laquelle est le vrai produit IPC ?",
        options:["Cert Progress","Cert Platinum","Cert Protect"], correct:0,
        explanation:"« Cert Progress » est le vrai produit ; les autres variantes « Cert » sont inventées." },
      { id:"prod-06", category:"produit", kind:"quiz1", titre:"Question Produit IPC", points:10,
        question:"Quel est le nom exact de ce produit ?",
        options:["Ecolagress PAE","Ecolagress Max","Ecolagress Pro"], correct:0,
        explanation:"« Ecolagress PAE » est le vrai nom du produit IPC." },
      { id:"prod-07", category:"produit", kind:"quiz1", titre:"Question Produit IPC", points:10,
        question:"Lequel de ces noms est un vrai produit de la gamme IPC ?",
        options:["Vivo Multi","Vivo Fresh","Vivo Ultra"], correct:0,
        explanation:"« Vivo Multi » est le vrai produit IPC." },
      { id:"prod-08", category:"produit", kind:"quiz1", titre:"Question Produit IPC", points:10,
        question:"Quel est le vrai nom de ce produit, sans suffixe ajouté ?",
        options:["Storm","Storm Black","Storm Pro"], correct:0,
        explanation:"« Storm » tout court est le vrai produit ; les variantes avec suffixe sont inventées." },
      { id:"prod-09", category:"produit", kind:"quiz1", titre:"Question Produit IPC", points:10,
        question:"Parmi ces noms, lequel existe réellement chez IPC ?",
        options:["Cyclone Biotech Zen","Cyclone Titan","Cyclone Platinum"], correct:0,
        explanation:"« Cyclone Biotech Zen » est le vrai produit IPC." },
      { id:"prod-10", category:"produit", kind:"quiz1", titre:"Question Produit IPC", points:10,
        question:"Quel est le nom exact de ce produit technique ?",
        options:["A4 Inox Cert","A4 Inox Plus","A4 Inox Max"], correct:0,
        explanation:"« A4 Inox Cert » est le vrai nom du produit IPC." },
      { id:"prod-11", category:"produit", kind:"quiz1", titre:"Question Produit IPC", points:10,
        question:"Lequel de ces noms est un vrai produit IPC ?",
        options:["Biostop","Biostop Forte","BioStorm"], correct:0,
        explanation:"« Biostop » tout court est le vrai produit ; les variantes sont inventées." },
      { id:"prod-12", category:"produit", kind:"quiz1", titre:"Question Produit IPC", points:10,
        question:"Quel est le vrai nom de ce produit ?",
        options:["Easy Doz","Easy Mix","Easy Cert"], correct:0,
        explanation:"« Easy Doz » est le vrai produit de la gamme IPC." },
      { id:"prod-13", category:"produit", kind:"quiz1", titre:"Question Produit IPC", points:10,
        question:"Parmi ces noms, lequel existe réellement dans la gamme IPC ?",
        options:["Bobson","Bobson Extra","Bobson Plus"], correct:0,
        explanation:"« Bobson » tout court est le vrai produit ; les extensions sont inventées." },
      { id:"prod-14", category:"produit", kind:"quiz1", titre:"Question Produit IPC", points:10,
        question:"Quel est le vrai nom de ce produit ?",
        options:["Apetit","Apetit Gold","Apetit Plus"], correct:0,
        explanation:"« Apetit » tout court est le vrai produit IPC." },
      { id:"prod-15", category:"produit", kind:"quiz1", titre:"Question Produit IPC — piège", points:10,
        question:"Piège : lequel de ces 4 noms est totalement inventé (les 3 autres sont réels) ?",
        options:["Tornade Infinity","Tornade AD","Tornade Biotech AD","Bobson"], correct:0,
        explanation:"« Tornade Infinity » n'existe pas — un faux bien imité !" },
      { id:"prod-16", category:"produit", kind:"quiz1", titre:"Question Produit IPC — piège", points:10,
        question:"Piège : un seul de ces noms est faux, lequel ?",
        options:["Storm","Cert Progress","Apetit","Storm Black"], correct:3,
        explanation:"« Storm Black » n'existe pas ; « Storm » tout court est le vrai produit." },
      { id:"prod-17", category:"produit", kind:"quiz1", titre:"Question Produit IPC — piège", points:10,
        question:"Piège : quel produit n'a jamais existé chez IPC ?",
        options:["Vivo Multi","IOTOX","Biostop","Vivo Ultra"], correct:3,
        explanation:"« Vivo Ultra » est inventé ; « Vivo Multi » est le vrai produit." },
      { id:"prod-18", category:"produit", kind:"quiz1", titre:"Question Produit IPC — piège", points:10,
        question:"Piège : parmi ces produits « Cyclone », lequel est le seul à exister réellement ?",
        options:["Cyclone Titan","Cyclone Biotech Zen","Cyclone Platinum"], correct:1,
        explanation:"« Cyclone Biotech Zen » est le seul vrai produit de cette famille." },
      { id:"prod-19", category:"produit", kind:"quiz1", titre:"Question Produit IPC — piège", points:10,
        question:"Piège : repérez le seul vrai produit parmi ces variantes « Cert » :",
        options:["Cert Platinum","Cert Progress","Cert Protect"], correct:1,
        explanation:"« Cert Progress » est le seul vrai produit de cette famille." },
      { id:"prod-20", category:"produit", kind:"quiz1", titre:"Question Produit IPC — complétion", points:10,
        question:"Complétez le nom : « Loft System IOTOX ___ »",
        options:["Premium","Pretium","Prime"], correct:0,
        explanation:"« Loft System IOTOX Premium » est le nom complet et exact." },

      // ===================== 🏢 CULTURE IPC (kind: quiz1, faits réels sourcés ipc-sa.com) =====================
      { id:"culture-01", category:"culture", kind:"quiz1", titre:"Culture IPC", points:10,
        question:"En quelle année et dans quelle ville IPC a-t-elle été créée ?",
        options:["1987, à Brest","1995, à Rennes","1978, à Nantes"], correct:0,
        explanation:"IPC est née à Brest en 1987, avec un projet dans l'hygiène et la maintenance industrielle." },
      { id:"culture-02", category:"culture", kind:"quiz1", titre:"Culture IPC", points:10,
        question:"Que signifient les lettres I, P, C dans l'ADN de l'entreprise ?",
        options:["Innovation, Protection, Conseil","Industrie, Production, Chimie","International Product Company"], correct:0,
        explanation:"Innovation (recherche, brevets), Protection (santé/environnement) et Conseil (plus de 200 commerciaux de terrain)." },
      { id:"culture-03", category:"culture", kind:"quiz1", titre:"Culture IPC", points:10,
        question:"Quelle marque écoresponsable IPC a-t-elle lancée en 2008 ?",
        options:["Cap Vert","Bio Nature","Green Line"], correct:0,
        explanation:"En 2008, IPC prend un virage écoresponsable avec la création de la marque Cap Vert." },
      { id:"culture-04", category:"culture", kind:"quiz1", titre:"Culture IPC", points:10,
        question:"Après la France, dans quels pays IPC s'est-elle implantée ?",
        options:["Belgique puis Espagne","Allemagne puis Italie","Suisse puis Portugal"], correct:0,
        explanation:"Bureaux ouverts en Belgique en 2010, puis en Espagne en 2018." },

      // ===================== 🔎 DÉFIS D'ENQUÊTE (kind: action / quiz1) =====================
      // Ambiance "aventure immersive" : chercher un indice, décoder un message,
      // retrouver une information (souvent auprès d'une autre équipe — ça fait
      // circuler tout le monde et ça crée des interactions), assembler des
      // éléments, observer un détail, résoudre une petite énigme. Rien qui ne
      // dépende d'une seule personne : toujours un travail d'équipe, jamais
      // de performance imposée à un seul joueur.
      { id:"enq-01", category:"enquete", kind:"action", titre:"Info Croisée", points:15,
        description:"Une autre équipe détient, sans le savoir, une information utile sur Armorik Biotech ou la nuit du vol. Allez discuter avec elle et repartez avec un détail que vous ignoriez." },
      { id:"enq-02", category:"enquete", kind:"action", titre:"Message Inversé", points:15,
        description:"Le voleur a laissé ce message codé — chaque mot est écrit à l'envers, lettre par lettre : « ZELLIEVRUS AL EITROS DRON ». Déchiffrez-le en équipe, puis annoncez la phrase complète pour valider." },
      { id:"enq-03", category:"enquete", kind:"action", titre:"L'Objet qui Dépare", points:10,
        description:"Repérez, dans la salle, un objet qui n'a rien à voir avec IPC ni avec la soirée. Montrez-le (ou prenez-le en photo) pour valider votre sens de l'observation." },
      { id:"enq-04", category:"enquete", kind:"action", titre:"Portrait-Robot Express", points:15,
        description:"Récoltez un détail (vêtement, accessoire, attitude) auprès de membres de trois équipes différentes, puis assemblez-les à voix haute en un portrait-robot imaginaire du voleur. Le plus convaincant marque les points." },
      { id:"enq-05", category:"enquete", kind:"action", titre:"Le Dossier Manquant", points:15,
        description:"Une pièce du dossier d'enquête vous manque. Une autre équipe la détient sans le savoir : posez-lui 3 questions maximum, sans jamais dire pourquoi, pour deviner laquelle." },
      { id:"enq-06", category:"enquete", kind:"quiz1", titre:"Calcul du Coffre", points:10,
        question:"Un vieux coffre d'Armorik Biotech porte un indice retrouvé dans les archives : son code est le double de 21, moins 9. Quel est ce nombre ?",
        options:["33","31","39"], correct:0, explanation:"21 × 2 = 42, puis 42 − 9 = 33." },
      { id:"enq-07", category:"enquete", kind:"action", titre:"Compte les Indices", points:10,
        description:"Observez les chaussures de tous les membres de votre équipe : combien de couleurs différentes comptez-vous en tout ? Annoncez le nombre exact." },
      { id:"enq-08", category:"enquete", kind:"action", titre:"Témoin Surprise", points:15,
        description:"Trouvez un témoin (n'importe quel collègue présent, pas Roland) et posez-lui 3 questions fermées (oui/non) improvisées sur ce qu'il aurait vu la nuit du vol. Assemblez ses réponses en une théorie à présenter à voix haute." },
      { id:"enq-09", category:"enquete", kind:"action", titre:"Repérage Terrain", points:10,
        description:"Déplacez-vous jusqu'à un point précis du lieu (l'entrée, le bar, ou une sortie) et repérez-y un détail que vous n'aviez pas remarqué avant. Décrivez-le à votre équipe pour valider." },
      { id:"enq-10", category:"enquete", kind:"quiz1", titre:"L'Alibi", points:15,
        question:"Trois suspects donnent un alibi. Le Comptable : « J'étais avec la Stagiaire. » La Stagiaire : « J'étais seule. » Le Gardien : « J'ai vu le Comptable ET la Stagiaire, séparément. » Qui ment ?",
        options:["Le Comptable","La Stagiaire","Le Gardien"], correct:0,
        explanation:"Le Gardien confirme avoir vu les deux suspects séparément, ce qui contredit directement l'alibi du Comptable prétendant avoir été avec la Stagiaire." },
      { id:"enq-11", category:"enquete", kind:"action", titre:"Puzzle à Quatre", points:20,
        description:"Récoltez un mot-indice auprès de chacune des autres équipes présentes (jusqu'à 4 mots), puis assemblez-les en une phrase qui a un sens, même approximatif. Présentez-la pour valider." },
      { id:"enq-12", category:"enquete", kind:"action", titre:"Trouve le Détail Commun", points:10,
        description:"Observez discrètement deux équipes adverses : trouvez un point commun visuel entre elles (couleur, accessoire, posture...) que personne n'a signalé. Annoncez-le pour valider." },
      { id:"enq-13", category:"enquete", kind:"action", titre:"La Carte au Trésor", points:15,
        description:"Un indice sur la nuit du vol est caché quelque part dans la salle (au sens propre ou déguisé en objet anodin). Partez le chercher en équipe et rapportez-le pour valider." },
      { id:"enq-14", category:"enquete", kind:"quiz1", titre:"Le Faux Numéro", points:10,
        question:"Sur un ticket retrouvé près d'Armorik Biotech figure l'heure « 23:65 ». Pourquoi cette heure est-elle forcément fausse ?",
        options:["Les minutes ne dépassent jamais 59","Il ne peut pas être 23h un jour de semaine","Le ticket est trop vieux pour être lisible"], correct:0,
        explanation:"Une heure valide ne peut jamais afficher plus de 59 minutes — le ticket est un faux, ou mal recopié." },

      // ===================== 🎤 DÉFIS COMMERCIAUX (kind: action) =====================
      { id:"com-01", category:"commercial", kind:"action", titre:"Pitch Éclair", points:15,
        description:"Faites une démonstration improvisée d'un produit IPC de votre choix en 30 secondes chrono, comme si vous étiez sur un salon professionnel." },
      { id:"com-02", category:"commercial", kind:"action", titre:"Le Vendeur du Siècle", points:20,
        description:"Convainquez une autre équipe d'« acheter » un produit IPC en 1 minute maximum. La meilleure argumentation de la soirée sera votée en fin de jeu." },
      { id:"com-03", category:"commercial", kind:"action", titre:"Le Slogan", points:15,
        description:"Inventez un slogan publicitaire pour le produit IPC de votre choix, et présentez-le à voix haute à une autre équipe." },
      { id:"com-04", category:"commercial", kind:"action", titre:"Pub Improvisée", points:20,
        description:"Improvisez une publicité télé de 20 secondes pour un produit IPC, avec au moins un membre de l'équipe en acteur principal." },
      { id:"com-05", category:"commercial", kind:"action", titre:"Sans Le Dire", points:15,
        description:"Faites deviner un produit IPC à une autre équipe sans jamais prononcer son nom." },
      { id:"com-06", category:"commercial", kind:"action", titre:"Le Produit Imaginaire", points:15,
        description:"Inventez un tout nouveau produit IPC (nom + slogan) et présentez-le en 30 secondes." },
      { id:"com-07", category:"commercial", kind:"action", titre:"Le Vote du Public", points:15,
        description:"Présentez votre meilleure idée publicitaire de la soirée à une autre équipe et faites-la voter à main levée." },

      // ===================== 😂 DÉFIS ENTRE COLLÈGUES (kind: action) =====================
      { id:"col-01", category:"collegues", kind:"action", titre:"Photo Croisée", points:10,
        description:"Prenez un selfie avec au moins un membre d'une autre équipe." },
      { id:"col-02", category:"collegues", kind:"action", titre:"L'Expert Caché", points:15,
        description:"Retrouvez, parmi les personnes présentes, celle qui connaît le mieux un produit IPC de votre choix, et faites-vous expliquer pourquoi." },
      { id:"col-03", category:"collegues", kind:"action", titre:"Anecdote de la Maison", points:15,
        description:"Faites raconter une anecdote sur IPC par un collègue présent depuis plus longtemps que vous." },
      { id:"col-04", category:"collegues", kind:"action", titre:"Le Faux Bon de Livraison", points:10,
        description:"Faites signer à un collègue d'une autre équipe un « bon de livraison » improvisé pour un produit imaginaire." },
      { id:"col-05", category:"collegues", kind:"action", titre:"Pub Décalée", points:20,
        description:"Créez avec une autre équipe une publicité complètement absurde pour un produit IPC." },

      // ===================== 💃 DÉFIS D'AMBIANCE (kind: action) =====================
      { id:"amb-01", category:"ambiance", kind:"action", titre:"30 Secondes de Danse", points:10,
        description:"Dansez 30 secondes avec votre partenaire, sur la musique de votre choix." },
      { id:"amb-02", category:"ambiance", kind:"action", titre:"Chorégraphie Collective", points:15,
        description:"Apprenez un mouvement de danse à une autre équipe et exécutez-le ensemble." },
      { id:"amb-03", category:"ambiance", kind:"action", titre:"Rétro Dancefloor", points:15,
        description:"Reproduisez une danse emblématique des années 80/90, au choix de l'équipe." },
      { id:"amb-04", category:"ambiance", kind:"action", titre:"Le Fou Rire Garanti", points:10,
        description:"Prenez la photo la plus drôle possible de votre équipe." },
      { id:"amb-05", category:"ambiance", kind:"action", titre:"Catalogue IPC", points:10,
        description:"Mettez-vous en scène comme sur une fiche catalogue, avec un produit IPC (réel ou imaginaire) mis en valeur." },
      { id:"amb-06", category:"ambiance", kind:"action", titre:"Photo VIP", points:15,
        description:"Prenez une photo avec un membre de la direction présent ce soir (ou, à défaut, la personne la plus haut placée que vous trouverez)." },

      // ===================== 🎮 MINI-JEUX (kind: action, sauf Roue) =====================
      { id:"mini-mime-01", category:"minijeu", kind:"action", titre:"Mime IPC", points:15,
        description:"Mimez ce mot devant les autres équipes, sans parler ni écrire : « STORM ». Validez une fois deviné !" },
      { id:"mini-mime-02", category:"minijeu", kind:"action", titre:"Mime IPC", points:15,
        description:"Mimez ce mot devant les autres équipes, sans parler ni écrire : « TORNADE ». Validez une fois deviné !" },
      { id:"mini-mime-03", category:"minijeu", kind:"action", titre:"Mime IPC", points:15,
        description:"Mimez ce mot devant les autres équipes, sans parler ni écrire : « CYCLONE ». Validez une fois deviné !" },
      { id:"mini-pict-01", category:"minijeu", kind:"action", titre:"Pictionary IPC", points:15,
        description:"Faites deviner ce mot en le dessinant (pas de lettres ni de chiffres) : « BOBSON ». Validez une fois deviné !" },
      { id:"mini-pict-02", category:"minijeu", kind:"action", titre:"Pictionary IPC", points:15,
        description:"Faites deviner ce mot en le dessinant (pas de lettres ni de chiffres) : « APETIT ». Validez une fois deviné !" },
      { id:"mini-tabou-01", category:"minijeu", kind:"action", titre:"Tabou IPC", points:20,
        description:"Faites deviner le mot « TORNADE AD » à une autre équipe sans jamais dire : « produit », « gamme », « IPC », « soirée », ou « opération »." },
      { id:"mini-tabou-02", category:"minijeu", kind:"action", titre:"Tabou IPC", points:20,
        description:"Faites deviner le mot « ENTREPRISE » à une autre équipe sans jamais dire : « travail », « bureau », « société », « boîte », ou « collègue »." },
      { id:"mini-chrono-01", category:"minijeu", kind:"action", titre:"Défi Chrono", points:15,
        description:"Vous avez 60 secondes, chrono à lancer maintenant : citez le plus de produits IPC possible (vrais ou inventés avec humour), un membre de l'équipe compte à voix haute." },
      { id:"mini-chrono-02", category:"minijeu", kind:"action", titre:"Défi Chrono", points:15,
        description:"Vous avez 45 secondes, chrono à lancer maintenant : formez le plus de mots possible en utilisant les lettres de « TORNADE AD »." },
      { id:"mini-bonus-01", category:"minijeu", kind:"action", titre:"Défi Bonus Caché", points:20,
        description:"Bonus caché : improvisez un jingle publicitaire de 10 secondes pour IPC, à fredonner devant une autre équipe." },
      { id:"mini-bonus-02", category:"minijeu", kind:"action", titre:"Défi Bonus Caché", points:20,
        description:"Bonus caché : en 60 secondes chrono, toute l'équipe doit inventer une phrase-code de 7 mots où chaque mot commence, dans l'ordre, par une lettre du nom « TORNADE » (T-O-R-N-A-D-E). Présentez-la à voix haute une fois trouvée." },
      { id:"mini-roue-01", category:"minijeu", kind:"roue", titre:"Roue du Hasard", points:0,
        description:"Lancez la roue et laissez le sort décider du sort de votre équipe !",
        outcomes: [
          { label:"Jackpot ! +20 points", points:20 },
          { label:"+15 points", points:15 },
          { label:"+10 points", points:10 },
          { label:"+5 points, pas mal", points:5 },
          { label:"Rejoué : ce tour ne compte pas", points:0 },
          { label:"-5 points, dommage", points:-5 }
        ] },
      // Variante ambiance "apéro" de la Roue du Hasard, purement facultative :
      // les résultats évoquent la boisson pour le folklore, mais rien n'est
      // jamais compté ni imposé côté appli — chacun fait ce qu'il veut du
      // résultat (soft accepté, ou rien du tout).
      { id:"mini-roue-02", category:"minijeu", kind:"roue", titre:"Roue du Destin (Ambiance)", points:0,
        description:"Lancez la roue de l'ambiance ! Le résultat est à prendre à la légère — libre à chacun d'accepter une petite gorgée (soft ou alcool, comme on veut) ou de simplement en rire.",
        outcomes: [
          { label:"Gorgée facultative (soft accepté) + 15 points", points:15 },
          { label:"Joker : personne ne boit, +15 points", points:15 },
          { label:"Bonus surprise ! +20 points", points:20 },
          { label:"Toast collectif improvisé, +10 points", points:10 },
          { label:"Rejoué : ce tour ne compte pas", points:0 },
          { label:"-5 points, la roue est cruelle", points:-5 }
        ] },

      // Jeu des 7 différences — deux photos souvenirs fournies par Andreia,
      // déjà montées en visuel A/B. Auto-validé comme un défi "action"
      // classique une fois les différences trouvées en équipe (pas de
      // détection automatique, l'honneur suffit).
      { id:"mini-diff-01", category:"minijeu", kind:"action", titre:"Jeu des 7 Différences", points:15, image:"img/diff-1.jpg",
        description:"Observez bien les deux photos A et B ci-dessus : sauras-tu trouver les 7 différences ? Validez une fois que toute l'équipe est d'accord sur les 7." },
      { id:"mini-diff-02", category:"minijeu", kind:"action", titre:"Jeu des 7 Différences", points:15, image:"img/diff-2.jpg",
        description:"Observez bien les deux photos A et B ci-dessus : sauras-tu trouver les différences ? Validez une fois que toute l'équipe est d'accord." }
    ],

    // ---------------------------------------------------------------
    // 🥂 DÉFIS FESTIFS — obligatoires ET notés au même titre que les
    // autres défis. Banque commune de 14 idées, tirée au sort par équipe
    // à l'activation du chapitre 2 (festifsDrawCount défis chacune, voir
    // Store.selectFestifsDraw) — exactement le même principe que le tirage
    // des défis du chapitre 2 : jamais le même tirage deux fois, ni
    // forcément le même d'une équipe à l'autre. Pas de bouton "Passer".
    //
    // ⚠️ Consigne explicite d'Andreia, à ne jamais enfreindre : certains
    // défis évoquent volontairement des jeux d'ambiance autour des
    // boissons (trinquer, cul sec, pierre-feuille-ciseaux, roue du
    // destin...), mais TOUJOURS de façon facultative, avec alternative
    // sans alcool acceptée (un soft compte exactement pareil). L'appli
    // elle-même ne compte, ne gère ni ne pénalise jamais la consommation
    // d'alcool : aucun compteur de gorgées obligatoire, aucune pénalité
    // de points liée au fait de boire ou non. Le seul contenu noté est
    // la mission elle-même (l'idée, la photo, le vote, la manche
    // gagnée...), jamais la consommation en tant que telle.
    // ---------------------------------------------------------------
    festifsDrawCount: 4,
    festifs: [
      { id:"fest-01", titre:"Le Toast", points:10,
        description:"Faites un toast avec votre équipe — improvisez quelques mots en l'honneur d'IPC ou de la soirée. Validez une fois fait." },
      { id:"fest-02", titre:"Le Cocktail IPC", points:10,
        description:"Inventez un nom de cocktail (ou mocktail, au choix) inspiré d'un produit IPC. Pas besoin de le préparer, juste de trouver le nom !" },
      { id:"fest-03", titre:"Trinquons", points:10,
        description:"Allez trinquer avec une autre équipe, à la santé de tous — avec ce que chacun préfère boire." },
      { id:"fest-04", titre:"Meilleure Ambiance", points:10,
        description:"En équipe, élisez l'équipe (autre que la vôtre) qui a la meilleure ambiance ce soir, et allez le leur annoncer." },
      { id:"fest-05", titre:"Photo Apéro", points:10,
        description:"Prenez une photo souvenir de votre équipe façon \"apéro\" du séminaire — montrez-la à l'organisatrice pour valider." },
      { id:"fest-06", titre:"Le Slogan", points:10,
        description:"Inventez un slogan d'équipe à scander avant de lever votre verre." },
      { id:"fest-07", titre:"Pub IPC Improvisée", points:15,
        description:"Improvisez une publicité humoristique pour un produit IPC, verre à la main comme accessoire de la mise en scène." },
      { id:"fest-08", titre:"Discours de Remise de Prix", points:10,
        description:"Improvisez un discours de remerciement façon remise de trophée, dédié à IPC et à la soirée — le plus sérieux (ou le plus drôle) possible." },
      { id:"fest-09", titre:"Le Compliment Sincère", points:10,
        description:"Faites un compliment sincère et précis à une autre équipe, devant tout le monde." },
      { id:"fest-10", titre:"Le Surnom de Soirée", points:10,
        description:"Inventez un surnom convivial pour chaque membre de votre équipe, valable pour le reste de la soirée." },
      { id:"fest-11", titre:"Le Toast Vidéo", points:10,
        description:"Filmez un mini toast d'équipe de 10 secondes maximum, à partager en fin de soirée." },
      { id:"fest-12", titre:"Le Titre Honorifique", points:10,
        description:"Décernez un titre honorifique inventé à un collègue présent ce soir (ex : « Ambassadeur IOTOX de l'année »)." },
      { id:"fest-13", titre:"Merci à l'Organisatrice", points:10,
        description:"Allez trinquer avec l'organisatrice de la soirée et remerciez-la, à votre façon." },
      { id:"fest-14", titre:"Le Chant Convivial", points:15,
        description:"Improvisez une courte phrase chantée ou scandée dédiée à IPC, et faites-la reprendre par une autre équipe." },

      // Jeux d'ambiance "boissons" — toujours facultatifs, toujours avec
      // alternative sans alcool (soft accepté), jamais de pénalité liée
      // au choix de chacun. Le seul contenu noté est la mission elle-même.
      { id:"fest-15", titre:"Le Choix du Rival", points:10,
        description:"Désignez un membre d'une autre équipe : il ou elle devient officiellement le DJ de votre prochaine boisson, sans droit de veto de votre part ! Facultatif bien sûr, option soft toujours au menu." },
      { id:"fest-16", titre:"Cul Sec (au choix)", points:10,
        description:"Défi cul sec façon « chacun sa vitesse » : celles et ceux qui le veulent finissent leur verre d'un coup — alcool, soft, ou même un verre d'eau si le cœur vous en dit. Les autres valident en portant un toast bien théâtral à leur courage." },
      { id:"fest-17", titre:"Pierre-Feuille-Ciseaux Express", points:10,
        description:"Duel au sommet contre un membre d'une autre équipe : pierre-feuille-ciseaux, une seule manche, aucun rattrapage possible. Le ou la perdant(e) a le droit sacré (jamais l'obligation) de siroter une petite gorgée, soft ou alcool." },
      { id:"fest-18", titre:"Santé Générale", points:15,
        description:"Rameutez le plus d'équipes possible pour un « SANTÉ ! » collectif et synchronisé — plus il y a de monde, plus l'écho est beau. Eau, soft ou pétillant, tout compte pareil." },
      { id:"fest-19", titre:"Le Dernier Verre Levé", points:10,
        description:"3, 2, 1 : tout le monde lève son verre en même temps avec au moins une autre équipe (rempli de ce que chacun veut, soft accepté). Le ou la dernier(ère) a « perdu » — perdu quoi exactement, personne ne sait, mais c'est immanquablement drôle." },
      { id:"fest-20", titre:"Devine Ma Boisson", points:10,
        description:"Mimez votre boisson à un membre d'une autre équipe façon charades — sans un mot, sans la montrer, sans la nommer. S'il ou elle devine juste, bravo à vous deux." },
      { id:"fest-21", titre:"Bar Éclair", points:15,
        description:"Improvisez un cocktail (ou mocktail) avec ce qui traîne sur la table, donnez-lui un nom de produit IPC totalement inventé, et vendez-le à une autre équipe comme le nouveau best-seller de la gamme." },
      { id:"fest-22", titre:"Le Verre qui Parle", points:10,
        description:"Donnez une voix à votre verre pendant 10 secondes chrono : imaginez tout haut ce qu'il raconterait de sa soirée s'il pouvait parler. On juge l'humour, pas le talent d'acteur." },
      { id:"fest-23", titre:"Cheers Autour du Monde", points:10,
        description:"Trinquez avec une autre équipe en disant « santé » dans une langue étrangère différente à chaque fois. Bonus imagination si personne n'est sûr que le mot existe vraiment." }
    ]
  },

  // ---------------------------------------------------------------
  // MISSIONS SECRÈTES — agents dormants uniquement (Casa + Potter).
  // Toujours visibles dès le début, jamais montrées aux autres équipes.
  // Rapportent des points "Handler" séparés du score officiel.
  // ---------------------------------------------------------------
  secretMissions: {
    "casa-sab-1": { id:"casa-sab-1", team:"casa", titre:"Fausse Piste", points:15,
      description:"Convaincre une équipe adverse, avec des détails plausibles inventés, que le suspect a été aperçu à un endroit précis — un endroit faux." },
    "casa-sab-2": { id:"casa-sab-2", team:"casa", titre:"Vol Discret d'Indice", points:20,
      description:"Obtenir un fragment de dossier d'une autre équipe sous un prétexte d'échange, et ne jamais le restituer." },
    "casa-sab-3": { id:"casa-sab-3", team:"casa", titre:"Silence Radio", points:20,
      description:"Lors de la fenêtre Roland, poser des questions volontairement vagues et ne partager aucune information utile obtenue avec les autres équipes." },

    "potter-sab-1": { id:"potter-sab-1", team:"potter", titre:"Le Faux Décodage", points:15,
      description:"Transmettre à une autre équipe un décodage volontairement erroné, mais présenté avec assurance." },
    "potter-sab-2": { id:"potter-sab-2", team:"potter", titre:"Diversion Chronométrée", points:20,
      description:"Occuper une autre équipe dans une conversation ou un défi sans lien avec l'enquête pendant au moins 10 minutes, à un moment critique." },
    "potter-sab-3": { id:"potter-sab-3", team:"potter", titre:"Double Jeu Final", points:25,
      description:"Au moment du Coffre IPC, jouer la tension entre l'envie de réussir et la loyauté envers le Groupe Kestrel — validé par l'organisatrice sur la qualité du jeu d'acteur." }
  },

  // ---------------------------------------------------------------
  // MISSIONS FINALES — inutilisé depuis le remplacement du Protocole
  // Omega (exclusif à Harry Potter) par le Coffre IPC, commun aux
  // 5 équipes (voir quiz-ipc dans "missions" + coffreCode ci-dessus).
  // Conservé vide pour compatibilité avec getMissionDef().
  // ---------------------------------------------------------------
  finalMissions: {},

  // ---------------------------------------------------------------
  // QUIZ IPC — banque de questions (module ajouté, n'affecte aucune
  // autre mission). 5 questions tirées au sort à chaque partie parmi
  // cette banque (voir Store.startIpcQuiz), réparties par catégorie
  // selon categoryMix ci-dessous (avec repli automatique si une
  // catégorie est vide — utile tant que "culture" n'est pas remplie).
  //
  // ⚠️ Catégorie "culture" volontairement vide pour l'instant : elle
  // nécessite les vrais faits sur IPC (siège, année de création,
  // valeurs, certifications...) qu'Andreia doit encore fournir. Les
  // questions "produits" ci-dessous ne portent QUE sur la reconnaissance
  // de noms (vrai/faux produit), pas sur leur usage réel : on ne connaît
  // pas la fonction exacte de chaque produit, donc pas de question
  // inventée là-dessus pour éviter toute fausse information.
  // ---------------------------------------------------------------
  ipcQuiz: {
    questionsPerRun: 5,
    timerSeconds: 20,
    pointsPerCorrect: 10,
    categoryMix: { produit: 3, culture: 1, piege: 1 },
    bank: [
      // ===================== PRODUITS (noms réels IPC) =====================
      { id:"q001", category:"produit", type:"trouver", question:"Quel est le nom exact de ce produit de la gamme IPC ?",
        options:["Loft System IOTOX Premium","Loft System IOTOX Pretium","Loft System IOTOX Prime","Loft System Iotox Pro"], correct:0,
        explanation:"« Loft System IOTOX Premium » est bien le nom exact du produit IPC." },
      { id:"q002", category:"produit", type:"trouver", question:"Parmi ces noms, lequel est un vrai produit IPC ?",
        options:["IOTOX","IOTOX Neo","IOTOX Plus","IOTOX Zen"], correct:0,
        explanation:"« IOTOX » tout court, sans suffixe, est le vrai produit IPC." },
      { id:"q003", category:"produit", type:"trouver", question:"Lequel de ces noms correspond à un vrai produit IPC ?",
        options:["Tornade Biotech AD","Tornade Biotech Max","Tornade Biotech Pro","Tornade Biotech X"], correct:0,
        explanation:"« Tornade Biotech AD » est un vrai produit de la gamme IPC." },
      { id:"q004", category:"produit", type:"trouver", question:"Quel est le vrai nom de ce produit, celui qui a inspiré le nom de cette soirée ?",
        options:["Tornade AD","Tornade Max","Tornade Plus","Tornade X"], correct:0,
        explanation:"« Tornade AD » existe vraiment chez IPC — un joli clin d'œil au nom de l'opération de ce soir !" },
      { id:"q005", category:"produit", type:"trouver", question:"Parmi ces variantes, laquelle est le vrai produit IPC ?",
        options:["Cert Progress","Cert Protect","Cert Ultra","Cert Plus"], correct:0,
        explanation:"« Cert Progress » est le vrai produit ; les autres variantes « Cert » sont inventées." },
      { id:"q006", category:"produit", type:"trouver", question:"Quel est le nom exact de ce produit ?",
        options:["Ecolagress PAE","Ecolagress Max","Ecolagress Pro","Ecolagress Plus"], correct:0,
        explanation:"« Ecolagress PAE » est le vrai nom du produit IPC." },
      { id:"q007", category:"produit", type:"trouver", question:"Lequel de ces noms est un vrai produit de la gamme IPC ?",
        options:["Vivo Multi","Vivo Fresh","Vivo Ultra","Vivo Zen"], correct:0,
        explanation:"« Vivo Multi » est le vrai produit IPC." },
      { id:"q008", category:"produit", type:"trouver", question:"Quel est le vrai nom de ce produit, sans suffixe ajouté ?",
        options:["Storm","Storm X","Storm Pro","BioStorm"], correct:0,
        explanation:"« Storm » tout court est le vrai produit ; toutes les variantes avec suffixe sont inventées." },
      { id:"q009", category:"produit", type:"trouver", question:"Parmi ces noms, lequel existe réellement chez IPC ?",
        options:["Cyclone Biotech Zen","Cyclone Platinum","Cyclone Nova","Cyclone Biotech Max"], correct:0,
        explanation:"« Cyclone Biotech Zen » est le vrai produit IPC." },
      { id:"q010", category:"produit", type:"trouver", question:"Quel est le nom exact de ce produit technique ?",
        options:["A4 Inox Cert","A4 Inox Plus","A4 Inox Max","A4 Inox Pro"], correct:0,
        explanation:"« A4 Inox Cert » est le vrai nom du produit IPC." },
      { id:"q011", category:"produit", type:"trouver", question:"Lequel de ces noms est un vrai produit IPC ?",
        options:["Biostop","Biostop Forte","BioStorm","Biostop Plus"], correct:0,
        explanation:"« Biostop » tout court est le vrai produit ; les variantes sont inventées." },
      { id:"q012", category:"produit", type:"trouver", question:"Quel est le vrai nom de ce produit ?",
        options:["Easy Doz","Easy Mix","Easy Cert","Easy Max"], correct:0,
        explanation:"« Easy Doz » est le vrai produit de la gamme IPC." },
      { id:"q013", category:"produit", type:"trouver", question:"Parmi ces noms, lequel existe réellement dans la gamme IPC ?",
        options:["Bobson","Bobson Extra","Bobson Plus","Bobson Pro"], correct:0,
        explanation:"« Bobson » tout court est le vrai produit ; toutes les extensions sont inventées." },
      { id:"q014", category:"produit", type:"trouver", question:"Quel est le vrai nom de ce produit ?",
        options:["Apetit","Apetit Gold","Apetit Plus","Apetit Max"], correct:0,
        explanation:"« Apetit » tout court est le vrai produit IPC." },
      { id:"q015", category:"produit", type:"existence", question:"Vrai ou faux : « Loft System IOTOX Premium » fait partie de la gamme IPC.",
        options:["Vrai","Faux"], correct:0, explanation:"Vrai, c'est un vrai produit de la gamme IPC." },
      { id:"q016", category:"produit", type:"existence", question:"Vrai ou faux : « IOTOX » est un vrai produit IPC.",
        options:["Vrai","Faux"], correct:0, explanation:"Vrai, « IOTOX » existe bien chez IPC." },
      { id:"q017", category:"produit", type:"existence", question:"Vrai ou faux : « Tornade Biotech AD » existe réellement chez IPC.",
        options:["Vrai","Faux"], correct:0, explanation:"Vrai, c'est un vrai produit de la gamme IPC." },
      { id:"q018", category:"produit", type:"existence", question:"Vrai ou faux : le produit « Tornade AD » existe réellement (et a donné son nom à cette soirée).",
        options:["Vrai","Faux"], correct:0, explanation:"Vrai ! Le nom de l'opération de ce soir vient d'un vrai produit IPC." },
      { id:"q019", category:"produit", type:"existence", question:"Vrai ou faux : « Cert Progress » est un vrai produit de la gamme IPC.",
        options:["Vrai","Faux"], correct:0, explanation:"Vrai, c'est un vrai produit IPC." },
      { id:"q020", category:"produit", type:"existence", question:"Vrai ou faux : « Ecolagress PAE » fait partie des produits IPC.",
        options:["Vrai","Faux"], correct:0, explanation:"Vrai, c'est un vrai produit de la gamme IPC." },
      { id:"q021", category:"produit", type:"existence", question:"Vrai ou faux : « Vivo Multi » est un vrai produit IPC.",
        options:["Vrai","Faux"], correct:0, explanation:"Vrai, c'est un vrai produit de la gamme IPC." },
      { id:"q022", category:"produit", type:"existence", question:"Vrai ou faux : « Storm » est un vrai produit de la gamme IPC.",
        options:["Vrai","Faux"], correct:0, explanation:"Vrai, « Storm » tout court existe bien chez IPC." },
      { id:"q023", category:"produit", type:"existence", question:"Vrai ou faux : « Cyclone Biotech Zen » existe réellement chez IPC.",
        options:["Vrai","Faux"], correct:0, explanation:"Vrai, c'est un vrai produit IPC." },
      { id:"q024", category:"produit", type:"existence", question:"Vrai ou faux : « A4 Inox Cert » est un vrai produit IPC.",
        options:["Vrai","Faux"], correct:0, explanation:"Vrai, c'est un vrai produit de la gamme IPC." },
      { id:"q025", category:"produit", type:"existence", question:"Vrai ou faux : « Biostop » fait partie de la gamme IPC.",
        options:["Vrai","Faux"], correct:0, explanation:"Vrai, « Biostop » tout court existe bien chez IPC." },
      { id:"q026", category:"produit", type:"existence", question:"Vrai ou faux : « Easy Doz » est un vrai produit IPC.",
        options:["Vrai","Faux"], correct:0, explanation:"Vrai, c'est un vrai produit de la gamme IPC." },
      { id:"q027", category:"produit", type:"existence", question:"Vrai ou faux : « Bobson » est un vrai produit de la gamme IPC.",
        options:["Vrai","Faux"], correct:0, explanation:"Vrai, « Bobson » tout court existe bien chez IPC." },
      { id:"q028", category:"produit", type:"existence", question:"Vrai ou faux : « Apetit » fait partie des produits IPC.",
        options:["Vrai","Faux"], correct:0, explanation:"Vrai, c'est un vrai produit de la gamme IPC." },
      { id:"q029", category:"produit", type:"intrus", question:"Quel est l'intrus (celui qui n'existe pas chez IPC) ?",
        options:["IOTOX","Storm","Biostop","IOTOX Neo"], correct:3, explanation:"« IOTOX Neo » est inventé ; les trois autres sont de vrais produits IPC." },
      { id:"q030", category:"produit", type:"intrus", question:"Quel est l'intrus parmi ces noms « Cert » (celui qui existe vraiment) ?",
        options:["Cert Ultra","Cert Protect","Cert Progress","Cert Plus"], correct:2, explanation:"« Cert Progress » est le seul vrai produit ; les autres variantes sont inventées." },
      { id:"q031", category:"produit", type:"intrus", question:"Repérez l'intrus : lequel de ces produits n'existe pas chez IPC ?",
        options:["Vivo Multi","Ecolagress PAE","A4 Inox Cert","Vivo Ultra"], correct:3, explanation:"« Vivo Ultra » est inventé ; les trois autres sont de vrais produits IPC." },
      { id:"q032", category:"produit", type:"intrus", question:"Quel est l'intrus parmi ces « Cyclone » (celui qui existe vraiment) ?",
        options:["Cyclone Platinum","Cyclone Nova","Cyclone Biotech Zen","Cyclone Max"], correct:2, explanation:"« Cyclone Biotech Zen » est le seul vrai produit ; les autres sont inventés." },
      { id:"q033", category:"produit", type:"intrus", question:"Repérez l'intrus : lequel n'existe pas chez IPC ?",
        options:["Tornade AD","Tornade Biotech AD","Bobson","Tornade Plus"], correct:3, explanation:"« Tornade Plus » est inventé ; les trois autres sont de vrais produits IPC." },
      { id:"q034", category:"produit", type:"intrus", question:"Quel est l'intrus parmi ces « Easy » (celui qui existe vraiment) ?",
        options:["Easy Mix","Easy Cert","Easy Doz","Easy Max"], correct:2, explanation:"« Easy Doz » est le seul vrai produit ; les autres sont inventés." },
      { id:"q035", category:"produit", type:"intrus", question:"Repérez l'intrus : lequel n'existe pas dans la gamme IPC ?",
        options:["Loft System IOTOX Premium","Apetit","Biostop","BioStorm"], correct:3, explanation:"« BioStorm » est inventé ; les trois autres sont de vrais produits IPC." },
      { id:"q036", category:"produit", type:"intrus", question:"Quel est l'intrus parmi ces noms (celui qui n'existe pas) ?",
        options:["A4 Inox Plus","A4 Inox Cert","Storm","Cert Progress"], correct:0, explanation:"« A4 Inox Plus » est inventé ; les trois autres sont de vrais produits IPC." },
      { id:"q037", category:"produit", type:"intrus", question:"Repérez l'intrus parmi ces « Storm » (le seul vrai produit) :",
        options:["Storm X","Storm Pro","Storm","BioStorm"], correct:2, explanation:"« Storm » tout court est le seul vrai produit ; les autres sont inventés." },
      { id:"q038", category:"produit", type:"intrus", question:"Quel est l'intrus (celui qui n'existe pas chez IPC) ?",
        options:["Biostop","Biostop Forte","Vivo Multi","Apetit"], correct:1, explanation:"« Biostop Forte » est inventé ; les trois autres sont de vrais produits IPC." },
      { id:"q039", category:"produit", type:"intrus", question:"Repérez l'intrus parmi ces noms (le seul faux) :",
        options:["Bobson Extra","Bobson","Cert Progress","IOTOX"], correct:0, explanation:"« Bobson Extra » est inventé ; les trois autres sont de vrais produits IPC." },
      { id:"q040", category:"produit", type:"intrus", question:"Quel est l'intrus (celui qui n'existe pas chez IPC) ?",
        options:["Ecolagress PAE","Ecolagress Max","Cyclone Biotech Zen","Easy Doz"], correct:1, explanation:"« Ecolagress Max » est inventé ; les trois autres sont de vrais produits IPC." },

      // ===================== QUESTIONS PIÈGES =====================
      { id:"q041", category:"piege", type:"piege", question:"Piège : lequel de ces 4 noms est totalement inventé (les 3 autres sont réels) ?",
        options:["Tornade Max","Tornade AD","Tornade Biotech AD","Bobson"], correct:0, explanation:"« Tornade Max » n'existe pas — un faux bien imité !" },
      { id:"q042", category:"piege", type:"piege", question:"Piège : un seul de ces noms est faux, lequel ?",
        options:["Storm","Cert Progress","Apetit","Storm X"], correct:3, explanation:"« Storm X » n'existe pas ; « Storm » tout court est le vrai produit." },
      { id:"q043", category:"piege", type:"piege", question:"Piège : quel produit n'a jamais existé chez IPC ?",
        options:["Vivo Multi","IOTOX","Biostop","Vivo Fresh"], correct:3, explanation:"« Vivo Fresh » est inventé ; « Vivo Multi » est le vrai produit." },
      { id:"q044", category:"piege", type:"piege", question:"Piège : parmi ces produits « Cyclone », lequel est le seul à exister réellement ?",
        options:["Cyclone Platinum","Cyclone Biotech Zen","Cyclone Nova","Cyclone Max"], correct:1, explanation:"« Cyclone Biotech Zen » est le seul vrai produit de cette famille." },
      { id:"q045", category:"piege", type:"piege", question:"Piège : parmi ces variantes « Cert », laquelle est réellement un produit IPC ?",
        options:["Cert Ultra","Cert Progress","Cert Protect","Cert Plus"], correct:1, explanation:"« Cert Progress » est le seul vrai produit de cette famille." },
      { id:"q046", category:"piege", type:"piege", question:"Piège : repérez le seul nom réel parmi ces « Easy » :",
        options:["Easy Mix","Easy Cert","Easy Doz","Easy Max"], correct:2, explanation:"« Easy Doz » est le seul vrai produit de cette famille." },
      { id:"q047", category:"piege", type:"piege", question:"Piège : repérez le seul vrai produit « Vivo » parmi ces noms :",
        options:["Vivo Fresh","Vivo Ultra","Vivo Zen","Vivo Multi"], correct:3, explanation:"« Vivo Multi » est le seul vrai produit de cette famille." },
      { id:"q048", category:"piege", type:"piege", question:"Piège : lequel de ces 4 noms « Storm » est le vrai produit IPC (sans suffixe) ?",
        options:["Storm X","Storm Pro","BioStorm","Storm"], correct:3, explanation:"« Storm » tout court, sans aucun suffixe, est le vrai produit." },
      { id:"q049", category:"piege", type:"piege", question:"Piège : repérez le seul vrai produit parmi ces variantes « Bobson » :",
        options:["Bobson Extra","Bobson Plus","Bobson Pro","Bobson"], correct:3, explanation:"« Bobson » tout court, sans aucun suffixe, est le vrai produit." },
      { id:"q050", category:"piege", type:"piege", question:"Piège : repérez le seul vrai produit parmi ces variantes « Apetit » :",
        options:["Apetit Gold","Apetit Plus","Apetit Max","Apetit"], correct:3, explanation:"« Apetit » tout court, sans aucun suffixe, est le vrai produit." },
      { id:"q051", category:"piege", type:"piege", question:"Piège : repérez le seul vrai produit parmi ces variantes « Biostop » :",
        options:["Biostop Forte","BioStorm","Biostop Plus","Biostop"], correct:3, explanation:"« Biostop » tout court, sans aucun suffixe, est le vrai produit." },
      { id:"q052", category:"piege", type:"piege", question:"Piège : repérez le seul vrai produit parmi ces variantes « A4 Inox » :",
        options:["A4 Inox Plus","A4 Inox Max","A4 Inox Pro","A4 Inox Cert"], correct:3, explanation:"« A4 Inox Cert » est le seul vrai produit de cette famille." },
      { id:"q053", category:"piege", type:"piege", question:"Piège : repérez le seul vrai produit parmi ces variantes « Ecolagress » :",
        options:["Ecolagress Max","Ecolagress Pro","Ecolagress Plus","Ecolagress PAE"], correct:3, explanation:"« Ecolagress PAE » est le seul vrai produit de cette famille." },
      { id:"q054", category:"piege", type:"piege", question:"Piège : repérez le seul vrai produit parmi ces variantes « IOTOX » :",
        options:["IOTOX Neo","IOTOX Plus","IOTOX Zen","IOTOX"], correct:3, explanation:"« IOTOX » tout court, sans aucun suffixe, est le vrai produit." },
      { id:"q055", category:"piege", type:"piege", question:"Piège : parmi ces 4 noms « Tornade », un seul est réel, tous les autres sont des pièges. Lequel est le vrai ?",
        options:["Tornade Plus","Tornade Max","Tornade X","Tornade AD"], correct:3, explanation:"« Tornade AD » est le vrai produit — celui qui a donné son nom à l'opération de ce soir." },
      { id:"q056", category:"piege", type:"piege", question:"Piège final : parmi tous ces noms, lequel est LE SEUL inventé ?",
        options:["Loft System IOTOX Premium","Cyclone Biotech Zen","Cert Progress","Loft System IOTOX Pretium"], correct:3, explanation:"« Loft System IOTOX Pretium » est un piège très proche du vrai nom « Loft System IOTOX Premium »." },

      // ===================== CULTURE IPC (faits réels, source ipc-sa.com) =====================
      { id:"q057", category:"culture", type:"culture", question:"En quelle année et dans quelle ville IPC a-t-elle été créée ?",
        options:["1987, à Brest","1995, à Rennes","1978, à Nantes","2003, à Quimper"], correct:0,
        explanation:"IPC est née à Brest en 1987, avec un projet dans l'hygiène et la maintenance industrielle." },
      { id:"q058", category:"culture", type:"culture", question:"Que signifient les trois lettres I, P, C dans l'ADN de l'entreprise ?",
        options:["Innovation, Protection, Conseil","Industrie, Production, Chimie","International Product Company","Innovation, Performance, Certification"], correct:0,
        explanation:"L'ADN d'IPC repose sur Innovation (recherche, brevets), Protection (santé/environnement) et Conseil (plus de 200 commerciaux de terrain)." },
      { id:"q059", category:"culture", type:"culture", question:"Où se trouve le siège social d'IPC ?",
        options:["À Brest, quai Malbert","À Rennes","À Nantes","À Quimper"], correct:0,
        explanation:"Le siège social d'IPC est au 10 quai Malbert à Brest — là où se déroule cette soirée !" },
      { id:"q060", category:"culture", type:"culture", question:"Quelle marque écoresponsable IPC a-t-elle lancée en 2008 ?",
        options:["Cap Vert","Bio Nature","Green Line","Eco Pro"], correct:0,
        explanation:"En 2008, IPC prend un virage écoresponsable avec la création de la marque Cap Vert." },
      { id:"q061", category:"culture", type:"culture", question:"Quelles certifications qualité et environnement IPC a-t-elle obtenues ?",
        options:["ISO 9001 et ISO 14001","ISO 26000 uniquement","OHSAS 18001 uniquement","Aucune certification"], correct:0,
        explanation:"IPC est certifiée ISO 9001 (qualité, depuis 2001) et ISO 14001 (environnement, depuis 2011), toutes deux reconduites récemment." },
      { id:"q062", category:"culture", type:"culture", question:"Après la France, dans quels pays IPC s'est-elle implantée ?",
        options:["Belgique puis Espagne","Allemagne puis Italie","Suisse puis Portugal","Royaume-Uni puis Pays-Bas"], correct:0,
        explanation:"IPC ouvre des bureaux en Belgique en 2010, puis arrive en Espagne en 2018." },
      { id:"q063", category:"culture", type:"culture", question:"Quels sont les deux brevets déposés par IPC (2013 et 2015) ?",
        options:["ONE'D et KOLORS","AQUAPUR et SOLARIS","NANOTECH et BIOCLEAN","HYDRA et LUMEN"], correct:0,
        explanation:"IPC dépose le brevet ONE'D en 2013, puis KOLORS en 2015." },
      { id:"q064", category:"culture", type:"culture", question:"Quel nouveau produit IPC fait l'actualité en ce début d'année 2026 ?",
        options:["Vivo Multi 360°","Cyclone Ultra 500","Storm Nova Plus","Cert Infinity"], correct:0,
        explanation:"Lancé en janvier 2026, Vivo Multi 360° est présenté comme le tout-en-un qui révolutionne le nettoyage professionnel." }
    ]
  }
};

// Rend accessible partout (navigateur classique, pas de bundler)
if (typeof window !== "undefined") window.GAME_DATA = GAME_DATA;
