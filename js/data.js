/* ===================================================================
   BREST NIGHT GAME — Contenu du jeu
   Modifie librement ce fichier : joueurs, indices, missions, défis...
   Tout le site lit ses données ici. Rien n'est codé en dur ailleurs.
=================================================================== */

const GAME_DATA = {

  // ---------------------------------------------------------------
  // BARÈME DE POINTS (référence, utilisé aussi comme constantes)
  // ---------------------------------------------------------------
  POINTS: {
    SIMPLE: 10,
    INTERMEDIAIRE: 20,
    DIFFICILE: 30,
    PENALITE_LEGERE: -5,
    PENALITE_LOURDE: -15,
    BONUS_POUVOIR: 5
  },

  // ---------------------------------------------------------------
  // ÉQUIPES
  // ---------------------------------------------------------------
  teams: {
    casa: {
      id: "casa",
      nom: "La Casa de Papel",
      accroche: "Le casse parfait ne laisse aucune trace.",
      objectif: "Exécuter le casse parfait : accumuler un maximum de points sans jamais vous faire piéger. Le bluff est votre meilleure arme.",
      membres: ["mathieu", "manue", "brice"],
      theme: "casa",
      pouvoir: {
        nom: "Braquage Éclair",
        description: "Une fois dans la soirée, volez 10 points à l'équipe adverse de votre choix. Le vol est annoncé publiquement (c'est un braquage, pas une lâcheté).",
        type: "vol_points",
        valeur: 10
      },
      missions: ["verre-destin", "defi-hasard", "casa-1", "casa-2", "casa-3", "casa-4", "casa-5", "casa-6", "casa-7", "casa-8"]
    },
    potter: {
      id: "potter",
      nom: "Harry Potter",
      accroche: "Une malédiction plane sur cette soirée. À vous de la déjouer.",
      objectif: "Déjouer la malédiction qui plane sur cette soirée. Résolvez, ensorcelez, et surpassez tous les autres sorciers.",
      membres: ["andreia", "marc"],
      theme: "potter",
      pouvoir: {
        nom: "Retourneur de Temps",
        description: "Une fois dans la soirée, annulez une pénalité déjà reçue OU obtenez de rejouer une mission ratée.",
        type: "annule_penalite",
        valeur: 1
      },
      missions: ["verre-destin", "defi-hasard", "potter-1", "potter-2", "potter-3", "potter-4", "potter-5", "potter-6", "potter-7", "potter-8"]
    },
    batman: {
      id: "batman",
      nom: "Batman & Robin",
      accroche: "Gotham a besoin de vous. Enquêtez, protégez, démasquez.",
      objectif: "Gotham est infiltrée par le crime organisé (les autres équipes). Enquêtez, surveillez, protégez, et démasquez le coupable avant la fin de la nuit.",
      membres: ["audrey", "arnaud"],
      theme: "batman",
      pouvoir: {
        nom: "Surveillance Nocturne",
        description: "Une fois dans la soirée, révélez si une équipe a utilisé son pouvoir récemment, et annulez un vol de points dirigé contre vous dans les 10 minutes qui suivent son activation.",
        type: "protection",
        valeur: 10
      },
      missions: ["verre-destin", "defi-hasard", "batman-1", "batman-2", "batman-3", "batman-4", "batman-5", "batman-6", "batman-7", "batman-8"]
    },
    aventuriers: {
      id: "aventuriers",
      nom: "Lara Croft & Indiana Jones",
      accroche: "Un trésor est caché sur le parcours de ce soir.",
      objectif: "Un trésor est caché sur le parcours de cette soirée. Suivez les indices, prenez des risques, et ramenez la relique avant tout le monde.",
      membres: ["emilie", "patrice"],
      theme: "aventuriers",
      pouvoir: {
        nom: "Sixième Sens de l'Aventurier",
        description: "Une fois dans la soirée, obtenez un indice supplémentaire de l'organisatrice sur n'importe quelle mission en cours.",
        type: "indice",
        valeur: 1
      },
      missions: ["verre-destin", "defi-hasard", "aventuriers-1", "aventuriers-2", "aventuriers-3", "aventuriers-4", "aventuriers-5", "aventuriers-6", "aventuriers-7", "aventuriers-8"]
    },
    tomjerry: {
      id: "tomjerry",
      nom: "Tom & Jerry",
      accroche: "Le chat et la souris ne font jamais vraiment équipe... sauf ce soir.",
      objectif: "Le chat et la souris ne font jamais vraiment équipe... et pourtant, ce soir, il va falloir semer le chaos ensemble pour gagner.",
      membres: ["fred", "manon"],
      theme: "tomjerry",
      pouvoir: {
        nom: "Poursuite Infernale",
        description: "Une fois dans la soirée, échangez une de vos missions en cours contre une mission déjà débloquée d'une équipe adverse de votre choix.",
        type: "echange_mission",
        valeur: 1
      },
      missions: ["verre-destin", "defi-hasard", "tomjerry-1", "tomjerry-2", "tomjerry-3", "tomjerry-4", "tomjerry-5", "tomjerry-6", "tomjerry-7", "tomjerry-8"]
    }
  },

  // ---------------------------------------------------------------
  // JOUEURS — QR codes personnels (phase 1)
  // partners = prénoms attendus (en minuscules) pour valider l'équipe
  // ---------------------------------------------------------------
  players: {
    mathieu: {
      id: "mathieu", nom: "Mathieu", team: "casa", personnage: "Le Professeur",
      univers: "La Casa de Papel",
      intro: "Tu es LE PROFESSEUR. L'architecte silencieux du plan parfait. Ce soir, deux complices t'attendent : Nairobi, l'âme du groupe, aussi imprévisible que brillante, et Berlin, l'égocentrique charmeur persuadé d'avoir déjà gagné. Trouve-les avant que le plan ne s'effondre.",
      partners: ["manue", "brice"],
      indices: [
        "Nairobi ne recule jamais devant une négociation, même perdue d'avance.",
        "Berlin est convaincu d'être le plus charismatique de la soirée — demandez-lui, il vous le dira lui-même.",
        "L'un des deux a déjà proposé un toast avant même que le champagne ne soit servi.",
        "L'autre est du genre à changer les règles du jeu... et à jurer que c'était prévu depuis le début.",
        "Ensemble, ils forment un duo capable de vous vendre n'importe quoi avec le sourire."
      ]
    },
    manue: {
      id: "manue", nom: "Manue", team: "casa", personnage: "Nairobi",
      univers: "La Casa de Papel",
      intro: "Tu es NAIROBI. Le cœur du groupe, celle qui garde tout le monde soudé même quand le plan part en vrille. Deux hommes comptent sur toi ce soir : le Professeur, calculateur jusqu'à l'obsession, et Berlin, aussi charmant qu'ingérable.",
      partners: ["mathieu", "brice"],
      indices: [
        "Le Professeur a probablement déjà un plan B, C et D avant même que la soirée ne commence.",
        "Il n'aime pas l'improvisation — mais il adore observer avant d'agir.",
        "Berlin, lui, se croit irrésistible et le fait savoir sans qu'on lui demande.",
        "L'un des deux porte ce soir quelque chose qui trahit son perfectionnisme discret.",
        "L'autre a sûrement déjà fait un compliment excessif à quelqu'un dans les dix premières minutes."
      ]
    },
    brice: {
      id: "brice", nom: "Brice", team: "casa", personnage: "Berlin",
      univers: "La Casa de Papel",
      intro: "Tu es BERLIN. Élégant, arrogant, persuadé que le casse ne peut réussir que grâce à toi. Deux complices te suivent malgré eux ce soir : le Professeur, stratège obsessionnel, et Nairobi, imprévisible et redoutable en négociation.",
      partners: ["mathieu", "manue"],
      indices: [
        "Le Professeur parle peu, observe beaucoup, et déteste qu'on improvise sur son plan.",
        "Nairobi est du genre à retourner une situation perdue en trois phrases.",
        "L'un des deux a probablement relu le programme de la soirée plus d'une fois.",
        "L'autre n'a jamais peur de dire tout haut ce que les autres pensent tout bas.",
        "Repérez qui garde son calme même dans le chaos : c'est un bon indice."
      ]
    },
    andreia: {
      id: "andreia", nom: "Andreia", team: "potter", personnage: "Hermione Granger",
      univers: "Harry Potter",
      intro: "Tu es HERMIONE GRANGER. La plus brillante sorcière de ta génération, stratège redoutable, incapable de perdre sans en analyser les raisons. Ce soir, Harry Potter est ton partenaire — vous formez sans doute le duo le plus compétitif de la soirée.",
      partners: ["marc"],
      indices: [
        "Il porte le poids d'un destin qu'il n'a pas choisi, mais il ne recule jamais devant un défi.",
        "Il a une cicatrice qu'il refuse obstinément de mentionner ce soir.",
        "Il fonce avant de réfléchir — l'exact inverse de toi.",
        "Il déteste perdre, presque autant que toi."
      ]
    },
    marc: {
      id: "marc", nom: "Marc", team: "potter", personnage: "Harry Potter",
      univers: "Harry Potter",
      intro: "Tu es HARRY POTTER. Le survivant, celui qui fonce sans toujours réfléchir, porté par l'instinct plus que par la stratégie. Ce soir, Hermione est ta partenaire — la seule capable de garder ton plan sur les rails.",
      partners: ["andreia"],
      indices: [
        "Elle a probablement déjà mémorisé le programme complet de la soirée.",
        "Elle n'improvise jamais sans avoir un plan de secours.",
        "Elle déteste perdre, et elle le montre même quand elle essaie de le cacher.",
        "Elle corrige les gens sans même s'en rendre compte."
      ]
    },
    audrey: {
      id: "audrey", nom: "Audrey", team: "batman", personnage: "Batman ou Robin",
      univers: "Batman & Robin",
      intro: "Tu es un chevalier de Gotham — Batman ou Robin, à toi de le décider ce soir. Un partenaire masqué t'attend, aussi discret et observateur que toi. Ensemble, vous protégerez la ville... ou tenterez juste de gagner ce jeu.",
      partners: ["arnaud"],
      indices: [
        "Votre partenaire n'aime pas être le centre de l'attention, mais il ou elle remarque tout.",
        "Il ou elle a probablement déjà repéré les sorties et les recoins du lieu sans que personne ne le lui demande.",
        "Discret en apparence, redoutablement stratège en réalité.",
        "Reconnaissable à sa capacité à garder un secret bien plus longtemps que la moyenne."
      ]
    },
    arnaud: {
      id: "arnaud", nom: "Arnaud", team: "batman", personnage: "Batman ou Robin",
      univers: "Batman & Robin",
      intro: "Tu es un chevalier de Gotham — Batman ou Robin, à toi de le décider ce soir. Un partenaire masqué t'attend, aussi discret et observateur que toi. Ensemble, vous protégerez la ville... ou tenterez juste de gagner ce jeu.",
      partners: ["audrey"],
      indices: [
        "Votre partenaire a le sens de l'observation d'un détective né.",
        "Il ou elle préfère agir dans l'ombre plutôt que de se mettre en avant.",
        "Une personne calme en apparence, mais redoutable une fois le plan lancé.",
        "Vous formez un duo que personne ne voit vraiment venir."
      ]
    },
    emilie: {
      id: "emilie", nom: "Émilie", team: "aventuriers", personnage: "Lara Croft",
      univers: "Lara Croft & Indiana Jones",
      intro: "Tu es LARA CROFT. Intrépide, indépendante, toujours prête à prendre un risque calculé pour atteindre le trésor. Indiana Jones est ton partenaire d'expédition ce soir — aussi passionné que toi, mais nettement moins organisé.",
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
      intro: "Tu es INDIANA JONES. Aventurier, débrouillard, plus doué pour improviser que pour suivre un plan. Lara Croft est ta partenaire ce soir — aussi intrépide que toi, mais bien plus méthodique.",
      partners: ["emilie"],
      indices: [
        "Elle a toujours un plan B, même pour une soirée censée être improvisée.",
        "Elle n'a peur de rien, ou en tout cas ne le montre jamais.",
        "Elle observe une pièce entière avant d'y entrer complètement.",
        "Elle est du genre à accepter un pari risqué juste pour le frisson."
      ]
    },
    fred: {
      id: "fred", nom: "Fred", team: "tomjerry", personnage: "Tom ou Jerry",
      univers: "Tom & Jerry",
      intro: "Tu es TOM ou JERRY, à toi de choisir ton rôle ce soir. Un éternel duo de rivaux-complices qui ne s'arrête jamais de se chamailler... et de s'entraider quand ça compte vraiment.",
      partners: ["manon"],
      indices: [
        "Votre partenaire a le sens du timing comique, même sans le vouloir.",
        "Il ou elle adore provoquer gentiment les gens autour d'elle ou de lui.",
        "Sous des airs chaotiques, il ou elle est étonnamment stratège.",
        "Repérez qui rit en premier dans un groupe : c'est un bon indice."
      ]
    },
    manon: {
      id: "manon", nom: "Manon", team: "tomjerry", personnage: "Tom ou Jerry",
      univers: "Tom & Jerry",
      intro: "Tu es TOM ou JERRY, à toi de choisir ton rôle ce soir. Un éternel duo de rivaux-complices qui ne s'arrête jamais de se chamailler... et de s'entraider quand ça compte vraiment.",
      partners: ["fred"],
      indices: [
        "Votre partenaire ne recule jamais devant une bonne provocation, même risquée.",
        "Il ou elle a un humour qui désarme complètement ses adversaires.",
        "Capable de retourner une situation perdue en fou rire général.",
        "Repérez qui semble toujours prêt à faire une bêtise calculée."
      ]
    }
  },

  // ---------------------------------------------------------------
  // MISSIONS COMMUNES (débloquées en premier, pour toutes les équipes)
  // ---------------------------------------------------------------
  commonMissions: {
    "verre-destin": {
      id: "verre-destin",
      titre: "Le Verre du Destin",
      points: 15,
      duree: "20 min",
      description: "Le sort a désigné une équipe adverse. Sans jamais lui demander directement ce qu'elle boit ni pourquoi, faites-lui livrer ou offrez-lui le cocktail ou la boisson qu'elle aurait choisi. Observez, déduisez, surprenez.",
      preuve: "Photo de la boisson livrée à l'équipe cible + leur réaction.",
      reussite: "La boisson est acceptée par l'équipe cible sans qu'elle ait été consultée sur son choix.",
      penalite: "-5 points si la question directe « qu'est-ce que tu veux boire ? » a été posée à l'équipe cible.",
      interaction: "Cible attribuée automatiquement par l'organisatrice (tirage sans équipe qui se retrouve avec elle-même).",
      type: "admin"
    },
    "defi-hasard": {
      id: "defi-hasard",
      titre: "Le Défi du Hasard",
      points: 20,
      duree: "15 min",
      description: "Un défi surprise vous a été tiré au sort parmi quinze possibles. Il apparaît directement sur votre écran une fois le tirage lancé par l'organisatrice.",
      preuve: "Selon le défi tiré : photo, vidéo courte ou témoignage.",
      reussite: "Défi réalisé et validé par l'organisatrice.",
      penalite: "-5 points si le défi est refusé sans tentative.",
      type: "admin"
    }
  },

  // ---------------------------------------------------------------
  // DÉFIS SURPRISE (pool de 15, un tiré aléatoirement par équipe)
  // ---------------------------------------------------------------
  surpriseChallenges: [
    { id: "sd1", texte: "Convaincre un inconnu du bar que vous êtes en tournage d'une émission de télé-réalité, sans rire, pendant 1 minute." },
    { id: "sd2", texte: "Inventer et raconter à voix haute une légende bretonne à propos du téléphérique de Brest, avec un aplomb total." },
    { id: "sd3", texte: "Faire deviner votre personnage à un inconnu uniquement par mimes, en moins de 2 minutes." },
    { id: "sd4", texte: "Commander une boisson en imitant l'accent d'une nationalité de votre choix, sans craquer." },
    { id: "sd5", texte: "Négocier un extra ou une petite attention avec le sourire, sans jamais mentir sur votre identité." },
    { id: "sd6", texte: "Faire une déclaration d'amour théâtrale et absurde à un lampadaire, un vélo ou tout objet inanimé trouvé sur le trajet." },
    { id: "sd7", texte: "Convaincre les membres d'une autre équipe de vous apprendre leur code secret en échange d'un service inventé sur le moment." },
    { id: "sd8", texte: "Improviser une chorégraphie de 20 secondes sur la musique du lieu actuel (ou fredonnée), filmée." },
    { id: "sd9", texte: "Trouver un point commun improbable avec un inconnu du bar en moins de 3 minutes de conversation." },
    { id: "sd10", texte: "Échanger un vêtement ou un accessoire (chaussures exclues) avec un coéquipier pendant au moins 15 minutes." },
    { id: "sd11", texte: "Faire un discours de 30 secondes expliquant pourquoi votre équipe mérite de gagner, devant au moins une autre équipe." },
    { id: "sd12", texte: "Deviner correctement le métier d'un inconnu présent sur les lieux, en lui posant seulement 3 questions indirectes." },
    { id: "sd13", texte: "Réciter l'alphabet à l'envers en moins de 20 secondes, filmé comme preuve." },
    { id: "sd14", texte: "Convaincre le reste de votre équipe d'un mensonge absurde pendant 5 minutes avant de révéler la vérité." },
    { id: "sd15", texte: "Créer un surnom de code pour chaque membre des autres équipes et l'utiliser au moins une fois ce soir, sans expliquer pourquoi." }
  ],

  // ---------------------------------------------------------------
  // MISSIONS PAR ÉQUIPE (8 chacune)
  // ---------------------------------------------------------------
  missions: {

    // ===================== LA CASA DE PAPEL =====================
    "casa-1": { id: "casa-1", team: "casa", titre: "Repérage des lieux", points: 10,
      description: "Avant la fin de la première étape, obtenez discrètement le prénom réel ET le personnage d'un membre d'une équipe adverse, sans jamais lui dire pourquoi vous le demandez.",
      preuve: "Annoncez ce nom en secret à l'organisatrice (message).", penalite: "-5 si vous êtes surpris à espionner ouvertement." },
    "casa-2": { id: "casa-2", team: "casa", titre: "Le Faux Plan", points: 10,
      description: "Faites croire à une équipe adverse qu'une fausse règle du jeu existe, et obtenez qu'elle l'applique au moins une fois.",
      preuve: "Décrivez la manœuvre et son résultat à l'organisatrice.", penalite: "Aucune si la tentative échoue, juste pas de points." },
    "casa-3": { id: "casa-3", team: "casa", titre: "Alliance de Circonstance", points: 20, duree: "15 min",
      description: "Proposez une alliance temporaire (échange d'informations ou de service) à une autre équipe.",
      preuve: "L'équipe alliée doit confirmer l'alliance depuis son propre espace.", penalite: "Aucune, mission simplement non validée si refus." },
    "casa-4": { id: "casa-4", team: "casa", titre: "Le Butin", points: 20, duree: "10 min",
      description: "Récupérez discrètement un petit objet appartenant à une autre équipe (sous-verre, accessoire, menu...) sans qu'elle s'en aperçoive. L'objet doit impérativement être rendu avant la fin de la soirée.",
      preuve: "Photo de l'objet « en captivité ».", penalite: "-15 points si l'objet n'est pas rendu avant la fin de la soirée." },
    "casa-5": { id: "casa-5", team: "casa", titre: "La Trahison Programmée", points: 20,
      description: "Après une alliance (mission 3 ou spontanée), rompez-la au moment le plus stratégique possible, et signalez-le à l'organisatrice avant que l'autre équipe ne le découvre.",
      preuve: "Description du timing et de l'effet de surprise.", penalite: "Aucune." },
    "casa-6": { id: "casa-6", team: "casa", titre: "Bella Ciao", points: 10,
      description: "Toute l'équipe doit chanter en chœur les premières secondes de Bella Ciao, déclenchées par un signal secret convenu entre vous, sans concertation visible juste avant.",
      preuve: "Courte vidéo.", penalite: "Aucune." },
    "casa-7": { id: "casa-7", team: "casa", titre: "Le Money Heist", points: 30,
      description: "Négociez avec une équipe adverse l'échange d'un indice ou d'un avantage contre des points ou un service, et faites valider l'accord par les deux équipes.",
      preuve: "Confirmation des deux équipes à l'organisatrice.", penalite: "Aucune si la négociation échoue." },
    "casa-8": { id: "casa-8", team: "casa", titre: "Sang-Froid Absolu", points: 30,
      description: "Mission finale : dans les 20 dernières minutes de la soirée, votre équipe doit avoir rendu au moins un objet volé, rompu une alliance, et n'avoir subi aucune pénalité de bluff raté.",
      preuve: "Bilan vérifié par l'organisatrice en fin de soirée.", penalite: "Mission simplement non validée si conditions non réunies." },

    // ===================== HARRY POTTER =====================
    "potter-1": { id: "potter-1", team: "potter", titre: "Le Choixpeau", points: 10,
      description: "Devinez, sans le demander directement, à quelle équipe adverse « appartiendrait » chaque personne présente si le Choixpeau les répartissait ce soir.",
      preuve: "Liste soumise à l'organisatrice, points selon justesse.", penalite: "Aucune." },
    "potter-2": { id: "potter-2", team: "potter", titre: "Sortilège d'Attraction", points: 10,
      description: "Convainquez discrètement un membre d'une autre équipe de vous révéler un de ses indices personnels de la phase 1, sans révéler le vôtre en échange.",
      preuve: "Indice obtenu rapporté à l'organisatrice.", penalite: "Aucune." },
    "potter-3": { id: "potter-3", team: "potter", titre: "Le Polynectar", points: 20, duree: "5 min",
      description: "Imitez (voix, posture, expressions) un membre d'une équipe adverse pendant une minute devant témoins, assez bien pour qu'un tiers devine de qui il s'agit sans que vous ne le nommiez.",
      preuve: "Témoin extérieur confirmant avoir deviné.", penalite: "Aucune." },
    "potter-4": { id: "potter-4", team: "potter", titre: "Duel de Sorciers", points: 20,
      description: "Défiez une autre équipe : chaque équipe doit convaincre l'autre d'un mensonge absurde en moins de deux minutes. La première équipe qui craque (rire, aveu, hésitation) perd le duel.",
      preuve: "Équipe adverse confirme l'issue du duel.", penalite: "Aucune si le duel est perdu, juste pas de points." },
    "potter-5": { id: "potter-5", team: "potter", titre: "Objet Enchanté", points: 20, duree: "10 min",
      description: "Posez discrètement un petit gage caché sur la table d'une équipe adverse sans qu'elle s'en rende compte pendant dix minutes.",
      preuve: "Photo du gage en place + confirmation qu'il n'a pas été repéré à temps.", penalite: "Aucune." },
    "potter-6": { id: "potter-6", team: "potter", titre: "Sortilège Impardonnable... ou presque", points: 20,
      description: "Imposez un gage inoffensif et drôle à une équipe adverse (surnom pour 15 minutes, voix particulière, etc.) en le présentant comme une malédiction.",
      preuve: "Équipe ciblée confirme avoir subi le sort.", penalite: "Aucune si elle refuse avec une contre-proposition valable." },
    "potter-7": { id: "potter-7", team: "potter", titre: "La Carte du Maraudeur", points: 30, duree: "10 min",
      description: "Localisez discrètement où se trouvent, à un instant donné, les quatre autres équipes (quelle zone du lieu), et prouvez-le avant qu'elles ne se déplacent.",
      preuve: "Photo ou description horodatée des positions.", penalite: "Aucune." },
    "potter-8": { id: "potter-8", team: "potter", titre: "Le Dernier Horcruxe", points: 30,
      description: "Mission finale, la plus difficile : obtenez d'au moins deux équipes différentes qu'elles vous cèdent chacune un indice ou un petit avantage dans la même heure, sans qu'aucune ne découvre que vous négociez aussi avec l'autre.",
      preuve: "Les deux cessions confirmées séparément par les équipes concernées.", penalite: "Aucune." },

    // ===================== BATMAN & ROBIN =====================
    "batman-1": { id: "batman-1", team: "batman", titre: "Dossier Gotham", points: 10,
      description: "Identifiez discrètement les personnages (pas les prénoms) des quatre autres équipes en observant les indices échangés autour de vous, sans poser de question directe.",
      preuve: "Liste soumise à l'organisatrice.", penalite: "Aucune." },
    "batman-2": { id: "batman-2", team: "batman", titre: "Filature", points: 10, duree: "10 min",
      description: "Suivez discrètement les déplacements d'une équipe adverse pendant dix minutes sans vous faire repérer, et rapportez trois informations précises sur ce qu'elle a fait.",
      preuve: "Rapport des trois informations à l'organisatrice.", penalite: "Aucune." },
    "batman-3": { id: "batman-3", team: "batman", titre: "Le Signal", points: 10,
      description: "Créez votre propre signal (geste discret) pour vous alerter mutuellement d'un danger le reste de la soirée, et utilisez-le au moins une fois de façon observable.",
      preuve: "Décrivez le signal à l'organisatrice et prouvez son usage.", penalite: "Aucune." },
    "batman-4": { id: "batman-4", team: "batman", titre: "Protection Rapprochée", points: 20,
      description: "Empêchez activement (diversion, négociation, blocage) une équipe adverse de réussir une mission qui vous cible directement.",
      preuve: "Récit de la tentative déjouée.", penalite: "Aucune." },
    "batman-5": { id: "batman-5", team: "batman", titre: "Identifier le Coupable", points: 20,
      description: "Déterminez quelle équipe a été la première à utiliser son pouvoir ce soir, et prouvez-le par déduction ou aveux obtenus.",
      preuve: "Réponse validée par l'organisatrice.", penalite: "Aucune si la réponse est fausse, juste pas de points." },
    "batman-6": { id: "batman-6", team: "batman", titre: "Interception", points: 20, duree: "15 min",
      description: "Interceptez un message, un indice ou un objet échangé entre deux équipes adverses avant qu'il n'arrive à destination, puis restituez-le immédiatement après validation.",
      preuve: "Objet ou message intercepté montré à l'organisatrice avant restitution.", penalite: "Aucune." },
    "batman-7": { id: "batman-7", team: "batman", titre: "Neutraliser le Sabotage", points: 30, duree: "5 min",
      description: "Repérez une mission de sabotage en cours contre votre équipe (événement ou comportement suspect) et neutralisez-la en moins de cinq minutes.",
      preuve: "Récit du sabotage déjoué.", penalite: "Aucune." },
    "batman-8": { id: "batman-8", team: "batman", titre: "L'Identité Secrète", points: 30,
      description: "Mission finale : devinez correctement, pour trois des quatre équipes adverses, qui est le leader informel de l'équipe, sans jamais le demander frontalement.",
      preuve: "Réponses validées par l'organisatrice.", penalite: "Points partiels selon le nombre de bonnes réponses." },

    // ===================== LARA CROFT & INDIANA JONES =====================
    "aventuriers-1": { id: "aventuriers-1", team: "aventuriers", titre: "La Carte au Trésor", points: 10,
      description: "Dessinez ou décrivez de mémoire le trajet complet de la soirée (les six lieux, dans l'ordre) sans consulter le programme.",
      preuve: "Photo ou description envoyée à l'organisatrice.", penalite: "Points partiels si le trajet est incomplet." },
    "aventuriers-2": { id: "aventuriers-2", team: "aventuriers", titre: "Objet Ancien", points: 10,
      description: "Trouvez et photographiez un objet du lieu actuel qui semble « plus vieux que tout le reste », puis inventez son origine légendaire en trois phrases.",
      preuve: "Photo + légende écrite ou racontée.", penalite: "Aucune." },
    "aventuriers-3": { id: "aventuriers-3", team: "aventuriers", titre: "Le Passage Secret", points: 10,
      description: "Trouvez un raccourci, un passage ou un recoin non évident dans l'un des lieux visités.",
      preuve: "Photo du passage trouvé.", penalite: "Aucune." },
    "aventuriers-4": { id: "aventuriers-4", team: "aventuriers", titre: "Piège à Explorateur", points: 20,
      description: "Relevez un défi physique léger inventé sur place (équilibre, franchissement, timing) sans aucun risque, validé par un témoin extérieur à l'équipe.",
      preuve: "Témoignage ou vidéo courte.", penalite: "Aucune." },
    "aventuriers-5": { id: "aventuriers-5", team: "aventuriers", titre: "L'Artefact Volé", points: 20, duree: "10 min",
      description: "Récupérez un petit objet symbolique appartenant à une autre équipe, présenté comme une relique maudite à retrouver. L'objet doit être rendu.",
      preuve: "Photo de l'objet récupéré, puis confirmation de restitution.", penalite: "-15 points si l'objet n'est pas rendu." },
    "aventuriers-6": { id: "aventuriers-6", team: "aventuriers", titre: "Décision à Risque", points: 20,
      description: "Faites un choix binaire risqué proposé en direct par l'organisatrice (mise de points sur un pari) qui peut faire gagner ou perdre des points.",
      preuve: "Décision enregistrée par l'organisatrice.", penalite: "Selon le résultat du pari." },
    "aventuriers-7": { id: "aventuriers-7", team: "aventuriers", titre: "Énigme de la Cité Perdue", points: 30,
      description: "Résolvez une énigme envoyée par l'organisatrice, liée à un des lieux du parcours, pour débloquer un indice sur la mission finale.",
      preuve: "Réponse correcte transmise à l'organisatrice.", penalite: "Aucune." },
    "aventuriers-8": { id: "aventuriers-8", team: "aventuriers", titre: "La Relique Finale", points: 30,
      description: "Mission finale : rassemblez trois « indices de relique » dispersés dans la soirée (obtenus via énigmes, pouvoirs ou négociations) pour réclamer le bonus de la Relique.",
      preuve: "Les trois indices présentés à l'organisatrice.", penalite: "Aucune." },

    // ===================== TOM & JERRY =====================
    "tomjerry-1": { id: "tomjerry-1", team: "tomjerry", titre: "Le Fromage Piégé", points: 10,
      description: "Tendez un piège inoffensif et drôle à une autre équipe (fausse règle, faux gage) et obtenez qu'elle morde à l'hameçon.",
      preuve: "Récit de la manœuvre et de son résultat.", penalite: "Aucune si la tentative échoue." },
    "tomjerry-2": { id: "tomjerry-2", team: "tomjerry", titre: "Course-Poursuite", points: 10,
      description: "Provoquez un petit défi de rapidité absurde avec une équipe adverse (sans se presser dangereusement), validé par un témoin.",
      preuve: "Témoignage du résultat.", penalite: "Aucune." },
    "tomjerry-3": { id: "tomjerry-3", team: "tomjerry", titre: "Détournement", points: 10,
      description: "Détournez discrètement l'attention d'une équipe adverse pendant qu'un de ses membres tente de valider une mission, pour la ralentir (sans toucher à ses affaires).",
      preuve: "Récit de la manœuvre.", penalite: "Aucune." },
    "tomjerry-4": { id: "tomjerry-4", team: "tomjerry", titre: "Provocation Amusante", points: 20,
      description: "Lancez un défi public et drôle à une équipe adverse qu'elle doit relever ou refuser publiquement.",
      preuve: "Récit du défi lancé et de la réaction.", penalite: "Aucune." },
    "tomjerry-5": { id: "tomjerry-5", team: "tomjerry", titre: "Sabotage Léger", points: 20,
      description: "Glissez un faux indice ou une fausse information à une équipe adverse concernant une mission ou un pouvoir, assez crédible pour qu'elle morde.",
      preuve: "Récit de la manœuvre et de son effet.", penalite: "Aucune." },
    "tomjerry-6": { id: "tomjerry-6", team: "tomjerry", titre: "Le Retournement", points: 20,
      description: "Faites-vous piéger volontairement par une autre équipe, puis retournez la situation à votre avantage dans la même heure.",
      preuve: "Récit complet du retournement.", penalite: "Aucune." },
    "tomjerry-7": { id: "tomjerry-7", team: "tomjerry", titre: "Chat et Souris", points: 30, duree: "15 min",
      description: "Un membre de votre équipe devient « le chat » et doit repérer, sans le demander, où se trouve un membre désigné d'une équipe adverse (tiré au sort par l'organisatrice), en rapportant trois observations exactes.",
      preuve: "Observations validées par l'organisatrice.", penalite: "Aucune." },
    "tomjerry-8": { id: "tomjerry-8", team: "tomjerry", titre: "Chaos Final", points: 30,
      description: "Mission finale : déclenchez au moins trois petits « grains de sable » chez trois équipes différentes pendant la soirée (faux indice, détournement, provocation, piège) et faites-les tous valider a posteriori.",
      preuve: "Les trois manœuvres confirmées par l'organisatrice.", penalite: "Aucune." }
  }
};

// Rend accessible partout (navigateur classique, pas de bundler)
if (typeof window !== "undefined") window.GAME_DATA = GAME_DATA;
