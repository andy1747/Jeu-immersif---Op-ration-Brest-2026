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
      missions: { 1: ["roland"], 2: ["casa-1", "casa-2", "casa-3", "casa-4"], 3: ["quiz-ipc"] },
      finalMission: null,
      codeFragment: "TO", fragmentPosition: 1
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
      missions: { 1: ["roland"], 2: ["potter-1", "potter-2", "potter-3", "potter-4"], 3: ["quiz-ipc"] },
      finalMission: null,
      codeFragment: "RN", fragmentPosition: 2
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
      missions: { 1: ["roland"], 2: ["batman-1", "batman-2", "batman-3", "batman-4"], 3: ["quiz-ipc"] },
      finalMission: null,
      codeFragment: "AD", fragmentPosition: 3
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
      missions: { 1: ["roland"], 2: ["aventuriers-1", "aventuriers-2", "aventuriers-3", "aventuriers-4"], 3: ["quiz-ipc"] },
      finalMission: null,
      codeFragment: "EI", fragmentPosition: 4
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
      missions: { 1: ["roland"], 2: ["tarzan-1", "tarzan-2", "tarzan-3", "tarzan-4"], 3: ["quiz-ipc"] },
      finalMission: null,
      codeFragment: "PC", fragmentPosition: 5
    }
  },

  // ---------------------------------------------------------------
  // LA MALLETTE IPC — final commun à toutes les équipes.
  // Chaque équipe récupère son fragment (team.codeFragment) en terminant
  // sa mission "quiz-ipc" (chapitre 3). Une fois les 5 quiz terminés,
  // les équipes se réunissent physiquement autour du téléphone d'Hermione
  // et mettent en commun leurs fragments dans l'ordre de fragmentPosition
  // pour reconstituer ce code (voir js/store.js: validateMalletteCode).
  // ---------------------------------------------------------------
  malletteCode: "TORNADEIPC",

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
  // MISSION COMMUNE — la fenêtre Roland (Chapitre 1, toutes équipes)
  // ---------------------------------------------------------------
  commonMissions: {
    "roland": {
      id: "roland",
      titre: "Interroger Roland",
      points: 15,
      chapitre: 1,
      description: "Roland Kerdoncuff, directeur financier d'Armorik Biotech, ne reste que le début de la soirée. Posez-lui vos questions sur l'incident avant son départ — ce qu'il vous confie peut tout changer.",
      penalite: "Aucune, mais une question trop vague obtient une réponse bien moins utile."
    }
  },

  // ---------------------------------------------------------------
  // MISSIONS PRINCIPALES — 5 par équipe (chapitres 2 et 3)
  // ---------------------------------------------------------------
  missions: {

    // ===================== LA CASA DE PAPEL =====================
    "casa-1": { id:"casa-1", team:"casa", titre:"Reconnaissance du Site", points:10, chapitre:2,
      description:"Repérer et photographier discrètement les issues du lieu de la réception — la scène présumée de l'intrusion." },
    "casa-2": { id:"casa-2", team:"casa", titre:"L'Alibi", points:15, chapitre:2,
      description:"Interroger discrètement une personne présente pour établir qui se trouvait encore sur place au moment de l'alerte, sans révéler la vraie raison de la question." },
    "casa-3": { id:"casa-3", team:"casa", titre:"Le Faux Badge", points:15, chapitre:2,
      description:"Reproduire de mémoire (dessin ou mise en scène photo) un badge de sécurité aperçu brièvement sur un document transmis par la Cellule." },
    "casa-4": { id:"casa-4", team:"casa", titre:"Négociation", points:20, chapitre:2,
      description:"Obtenir d'une équipe adverse un indice qu'elle détient, en échange d'une information plausible... mais pas nécessairement vraie." },
    "casa-5": { id:"casa-5", team:"casa", titre:"Le Message Codé", points:25, chapitre:3,
      description:"Décoder un message intercepté transmis par la Cellule, menant à un point précis de Brest où récupérer une pièce à conviction." },

    // ===================== HARRY POTTER =====================
    "potter-1": { id:"potter-1", team:"potter", titre:"Le Symbole", points:10, chapitre:2,
      description:"Repérer, quelque part sur le lieu, un signe discret laissé par le suspect — à identifier et photographier." },
    "potter-2": { id:"potter-2", team:"potter", titre:"Le Chiffre", points:15, chapitre:2,
      description:"Résoudre une énigme de chiffrement transmise par la Cellule, révélant un mot-clé utile à l'enquête." },
    "potter-3": { id:"potter-3", team:"potter", titre:"Le Témoin Réticent", points:15, chapitre:2,
      description:"Amener un inconnu à « se souvenir » d'un détail utile, en lui posant exactement 3 questions choisies avec soin." },
    "potter-4": { id:"potter-4", team:"potter", titre:"Analyse Comparée", points:20, chapitre:2,
      description:"Comparer deux échantillons d'écriture transmis par la Cellule et déterminer, avec justification, lequel correspond au profil recherché." },
    "potter-5": { id:"potter-5", team:"potter", titre:"La Piste d'Ouessant", points:25, chapitre:3,
      description:"Suivre une série de 3 indices géolocalisés dans Brest, menant à un point de rendez-vous où récupérer la pièce suivante du dossier." },

    // ===================== BATMAN & ROBIN =====================
    "batman-1": { id:"batman-1", team:"batman", titre:"Prise de Notes", points:10, chapitre:2,
      description:"Observer une zone du lieu pendant 3 minutes et lister tout ce qui semble sortir de l'ordinaire." },
    "batman-2": { id:"batman-2", team:"batman", titre:"Filature Express", points:15, chapitre:2,
      description:"Suivre discrètement un membre d'une équipe adverse pendant 3 minutes sans être repéré, et rapporter un détail inédit." },
    "batman-3": { id:"batman-3", team:"batman", titre:"L'Interrogatoire", points:15, chapitre:2,
      description:"Obtenir d'un inconnu une information « sensible » en 3 questions maximum, façon interrogatoire posé." },
    "batman-4": { id:"batman-4", team:"batman", titre:"Le Rapport de Surveillance", points:20, chapitre:2,
      description:"Croiser deux fragments obtenus par d'autres équipes pour compléter le tableau d'enquête sur le site." },
    "batman-5": { id:"batman-5", team:"batman", titre:"Le Piège", points:25, chapitre:3,
      description:"Tendre un piège verbal à une équipe suspectée d'être infiltrée, et documenter la réaction obtenue pour la Cellule." },

    // ===================== LARA CROFT & INDIANA JONES =====================
    "aventuriers-1": { id:"aventuriers-1", team:"aventuriers", titre:"Repérage Terrain", points:10, chapitre:2,
      description:"Trouver un point de vue emblématique de Brest et y prendre une photo de reconnaissance." },
    "aventuriers-2": { id:"aventuriers-2", team:"aventuriers", titre:"L'Indice Caché", points:15, chapitre:2,
      description:"Localiser, à partir d'une énigme géographique transmise par la Cellule, un indice physique caché quelque part à Brest." },
    "aventuriers-3": { id:"aventuriers-3", team:"aventuriers", titre:"Le Passage Discret", points:15, chapitre:2,
      description:"Trouver un raccourci ou passage peu connu entre deux lieux du parcours, prouvé par une photo." },
    "aventuriers-4": { id:"aventuriers-4", team:"aventuriers", titre:"Le Marchandage", points:20, chapitre:2,
      description:"Échanger un fragment de dossier avec une autre équipe en 2 minutes chrono, façon marché aux antiquités." },
    "aventuriers-5": { id:"aventuriers-5", team:"aventuriers", titre:"La Carte Reconstituée", points:25, chapitre:3,
      description:"Assembler 3 fragments dispersés dans Brest au fil de la soirée pour reconstituer le point de convergence final." },

    // ===================== TARZAN & JANE =====================
    "tarzan-1": { id:"tarzan-1", team:"tarzan", titre:"Flair de Meute", points:10, chapitre:2,
      description:"Deviner, sans poser de question directe, quelle autre équipe semble la plus sous pression ce soir, et le noter sur le site." },
    "tarzan-2": { id:"tarzan-2", team:"tarzan", titre:"Contact Direct", points:15, chapitre:2,
      description:"Obtenir d'un inconnu un conseil ou une anecdote sur Brest en moins d'une minute de conversation." },
    "tarzan-3": { id:"tarzan-3", team:"tarzan", titre:"Le Défi Physique", points:15, chapitre:2,
      description:"Relever un petit défi physique sur le lieu du parcours, prouvé par une photo." },
    "tarzan-4": { id:"tarzan-4", team:"tarzan", titre:"L'Instinct du Clan", points:20, chapitre:2,
      description:"Rallier au moins 2 personnes extérieures au jeu autour d'une « cause » inventée en lien avec l'enquête." },
    "tarzan-5": { id:"tarzan-5", team:"tarzan", titre:"La Piste Chaude", points:25, chapitre:3,
      description:"Suivre un indice sensoriel transmis par la Cellule, menant à un lieu précis où récupérer la pièce finale avant convergence." },

    // ===================== QUIZ IPC (commun aux 5 équipes) =====================
    // Remplace la mission de chapitre 3 de chaque équipe (voir teams.*.missions).
    // Score dynamique (pas de "points" fixe) : voir type "quiz" dans app.js/store.js.
    "quiz-ipc": { id:"quiz-ipc", team:null, titre:"Quiz IPC", type:"quiz", chapitre:3,
      description:"Un mini quiz de 5 questions sur les produits et l'histoire d'IPC vous attend. Chaque bonne réponse rapporte des points, chaque erreur reste discrètement notée par l'organisatrice. À la fin, un fragment du code final vous est confié." }
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
      description:"Au moment de la Mallette IPC, jouer la tension entre l'envie de réussir et la loyauté envers le Groupe Kestrel — validé par l'organisatrice sur la qualité du jeu d'acteur." }
  },

  // ---------------------------------------------------------------
  // MISSIONS FINALES — inutilisé depuis le remplacement du Protocole
  // Omega (exclusif à Harry Potter) par la Mallette IPC, commune aux
  // 5 équipes (voir quiz-ipc dans "missions" + malletteCode ci-dessus).
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
        options:["Loft System IOTOX Premium","Cyclone Biotech Zen","Cert Progress","Loft System IOTOX Pretium"], correct:3, explanation:"« Loft System IOTOX Pretium » est un piège très proche du vrai nom « Loft System IOTOX Premium »." }
    ]
  }
};

// Rend accessible partout (navigateur classique, pas de bundler)
if (typeof window !== "undefined") window.GAME_DATA = GAME_DATA;
