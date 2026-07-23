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
      missions: { 1: ["roland"], 2: ["casa-1", "casa-2", "casa-3", "casa-4"], 3: ["casa-5"] },
      finalMission: null
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
      missions: { 1: ["roland"], 2: ["potter-1", "potter-2", "potter-3", "potter-4"], 3: ["potter-5"] },
      finalMission: "final-potter"
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
      missions: { 1: ["roland"], 2: ["batman-1", "batman-2", "batman-3", "batman-4"], 3: ["batman-5"] },
      finalMission: null
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
      missions: { 1: ["roland"], 2: ["aventuriers-1", "aventuriers-2", "aventuriers-3", "aventuriers-4"], 3: ["aventuriers-5"] },
      finalMission: null
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
      missions: { 1: ["roland"], 2: ["tarzan-1", "tarzan-2", "tarzan-3", "tarzan-4"], 3: ["tarzan-5"] },
      finalMission: null
    }
  },

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
      id: 3, nom: "Protocole Omega",
      accroche: "Le compte à rebours final a commencé.",
      notifTitle: "⚠️ PROTOCOLE OMEGA ACTIVÉ",
      notifBody: "Le chiffrement final de TORNADE AD entre dans sa dernière phase. Une dernière mission apparaît chez chaque équipe."
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
      description:"Suivre un indice sensoriel transmis par la Cellule, menant à un lieu précis où récupérer la pièce finale avant convergence." }
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
      description:"Au moment du Protocole Omega, jouer la tension entre l'envie de réussir et la loyauté envers le Groupe Kestrel — validé par l'organisatrice sur la qualité du jeu d'acteur." }
  },

  // ---------------------------------------------------------------
  // MISSION FINALE — Protocole Omega (Harry Potter uniquement).
  // Débloquée à l'activation du Chapitre 3. Countdown + saisie de code,
  // pas de photo/preuve : voir type "omega" géré spécifiquement par app.js.
  // ---------------------------------------------------------------
  finalMissions: {
    "final-potter": { id:"final-potter", team:"potter", titre:"Protocole Omega", points:50, type:"omega",
      dureeMinutes: 12, omegaCode: "2920",
      description:"Le chiffrement final de TORNADE AD entre dans sa dernière phase. Un code à 4 chiffres peut encore tout arrêter. Un seul homme le connaît : Roland. Retrouvez-le, obtenez le CODE OMEGA, et saisissez-le avant la fin du compte à rebours." }
  }
};

// Rend accessible partout (navigateur classique, pas de bundler)
if (typeof window !== "undefined") window.GAME_DATA = GAME_DATA;
