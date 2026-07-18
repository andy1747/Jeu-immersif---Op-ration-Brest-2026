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
    tarzan: {
      id: "tarzan",
      nom: "Tarzan & Jane",
      accroche: "La jungle a ses propres règles. Ce soir, c'est vous qui les écrivez.",
      objectif: "Survivre à la jungle urbaine de Brest ce soir : suivez votre instinct, marquez votre territoire, et hurlez votre victoire avant les autres.",
      membres: ["fred", "manon"],
      theme: "tarzan",
      pouvoir: {
        nom: "Cri de la Jungle",
        description: "Une fois dans la soirée, échangez une de vos missions en cours contre une mission déjà débloquée d'une équipe adverse de votre choix : la loi de la jungle vous autorise à changer de territoire.",
        type: "echange_mission",
        valeur: 1
      },
      missions: ["verre-destin", "defi-hasard", "tarzan-1", "tarzan-2", "tarzan-3", "tarzan-4", "tarzan-5", "tarzan-6", "tarzan-7", "tarzan-8"]
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
      id: "audrey", nom: "Audrey", team: "batman", personnage: "Robin",
      univers: "Batman & Robin",
      intro: "Tu es ROBIN. Le partenaire fidèle et impulsif du Chevalier Noir, toujours prêt·e à foncer là où Batman hésite encore. Ce soir, un protecteur plus discret que toi t'attend pour former le duo de Gotham.",
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
      intro: "Tu es BATMAN. Le Chevalier Noir, stratège solitaire, protecteur de Gotham depuis l'ombre. Ce soir, Robin t'attend — plus impulsif·ve que toi, mais d'une loyauté à toute épreuve.",
      partners: ["audrey"],
      indices: [
        "Votre partenaire a le sens de l'observation d'un détective né.",
        "Elle préfère agir vite plutôt que de trop réfléchir.",
        "Une énergie qui contraste avec votre calme apparent.",
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
      id: "fred", nom: "Fred", team: "tarzan", personnage: "Tarzan",
      univers: "Tarzan & Jane",
      intro: "Tu es TARZAN. Élevé loin des codes de la civilisation, tu fais confiance à ton instinct avant tout. Ce soir, Jane t'attend — aussi curieuse de la jungle que toi, mais bien plus stratège.",
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
      intro: "Tu es JANE. Curieuse, cultivée, mais totalement conquise par la vie sauvage. Ce soir, Tarzan t'attend — moins bavard que toi, mais d'un instinct plus sûr que n'importe quel plan écrit à l'avance.",
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
    { id: "sd15", texte: "Créer un surnom de code pour chaque membre des autres équipes et l'utiliser au moins une fois ce soir, sans expliquer pourquoi." },
    { id: "sd16", texte: "Convaincre un serveur ou une équipe adverse de trinquer avec vous en prononçant une phrase absurde de votre choix comme toast." },
    { id: "sd17", texte: "Imiter la démarche ou la voix d'un membre de votre propre équipe pendant 30 secondes, sans le prévenir à l'avance." },
    { id: "sd18", texte: "Faire deviner un film à une équipe adverse uniquement par des bruitages, sans aucun mot, en moins d'une minute." },
    { id: "sd19", texte: "Obtenir d'un inconnu qu'il vous donne une note sur 10 pour votre interprétation, après lui avoir joué votre personnage pendant 15 secondes, sans lui expliquer le jeu." },
    { id: "sd20", texte: "Composer une phrase d'accroche digne d'un James Bond et la ressortir à voix haute au moment où on s'y attend le moins." },
    { id: "sd21", texte: "Faire un compliment tellement exagéré à un membre d'une autre équipe qu'iel doit deviner que c'est un défi." },
    { id: "sd22", texte: "Marcher au ralenti façon film d'action pendant 15 secondes devant au moins deux personnes extérieures au jeu." },
    { id: "sd23", texte: "Trouver quelqu'un du groupe qui accepte d'échanger sa boisson contre la vôtre sans lui dire pourquoi." },
    { id: "sd24", texte: "Raconter une fausse anecdote personnelle totalement improbable à un inconnu, avec un aplomb total, sans rire." },
    { id: "sd25", texte: "Faire applaudir un groupe d'inconnus pour une raison inventée sur le moment." }
  ],

  // ---------------------------------------------------------------
  // MISSIONS PAR ÉQUIPE (8 chacune)
  // ---------------------------------------------------------------
  missions: {

    // ===================== LA CASA DE PAPEL =====================
    "casa-1": { id: "casa-1", team: "casa", titre: "Le Plan B", points: 20,
      type: "choix", safePoints: 20, riskWin: 50, riskLose: -30, riskChance: 0.5,
      description: "Sécurisez 20 points maintenant, ou tentez un braquage à haut risque : 50 points s'il passe, -30 s'il échoue. Le Professeur n'improvise jamais... vous, si.",
      preuve: "Résolution instantanée, aucune preuve à envoyer." },
    "casa-2": { id: "casa-2", team: "casa", titre: "Fausse Piste", points: 20,
      description: "Inventez une fausse règle du jeu totalement crédible et obtenez qu'une équipe adverse l'applique au moins une fois, sans jamais avouer que c'est faux avant la fin de la soirée.",
      preuve: "Décrivez la manœuvre et son résultat à l'organisatrice.", penalite: "Aucune si la tentative échoue, juste pas de points." },
    "casa-3": { id: "casa-3", team: "casa", titre: "Recel", points: 20,
      description: "Publiez une offre sur le Marché Noir (indice, service, objet, promesse...) et concluez un vrai échange avec une autre équipe.",
      preuve: "L'échange doit être visible dans le Marché Noir et confirmé par l'organisatrice.", penalite: "Aucune si aucun acheteur ne se présente." },
    "casa-4": { id: "casa-4", team: "casa", titre: "L'Alliance de la Casa", points: 15,
      description: "Formez une alliance officielle avec une équipe adverse : un objectif commun, un service mutuel, ou un pacte de non-agression. Les deux équipes doivent la confirmer à l'organisatrice.",
      preuve: "Confirmation des deux équipes.", penalite: "Aucune si refusée." },
    "casa-5": { id: "casa-5", team: "casa", titre: "Trahison Programmée", points: 25,
      description: "Rompez une alliance en cours (la vôtre ou une que vous avez infiltrée) au moment le plus payant possible, pile quand l'autre équipe compte sur vous.",
      preuve: "Racontez le timing et l'effet de surprise à l'organisatrice.", penalite: "Aucune." },
    "casa-6": { id: "casa-6", team: "casa", titre: "La Taupe", points: 20,
      description: "Faites parler un membre d'une équipe adverse sur l'avancement réel de son équipe (score approximatif, mission en cours, pouvoir déjà utilisé ou non) sans jamais le demander frontalement.",
      preuve: "Info obtenue rapportée à l'organisatrice, qui confirme si c'est exact.", penalite: "Aucune." },
    "casa-7": { id: "casa-7", team: "casa", titre: "La Promesse en l'Air", points: 25,
      description: "Obtenez d'une équipe adverse un vrai avantage (indice, objet, service) en échange d'une promesse que vous ne comptez pas tenir. Si l'équipe découvre le bluff avant la fin de la soirée, la mission peut se retourner contre vous.",
      preuve: "Racontez la manœuvre à l'organisatrice.", penalite: "-10 points si l'équipe flouée le découvre et le signale avant la fin de la soirée." },
    "casa-8": { id: "casa-8", team: "casa", titre: "Sang-Froid Absolu", points: 30,
      description: "Mission de clôture : avant minuit, votre équipe doit avoir conclu au moins un échange (Marché Noir ou promesse), rompu une alliance, et bluffé au moins une fois sans se faire démasquer.",
      preuve: "Bilan vérifié par l'organisatrice.", penalite: "Mission simplement non validée si conditions non réunies." },

    // ===================== HARRY POTTER =====================
    "potter-1": { id: "potter-1", team: "potter", titre: "Pari Magique", points: 20,
      type: "choix", safePoints: 20, riskWin: 50, riskLose: -30, riskChance: 0.5,
      description: "Lancez un sort sûr : 20 points garantis. Ou tentez un sortilège avancé et risqué : 50 points s'il fonctionne, -30 s'il rate. Hermione dirait de jouer la sécurité. Vous ferez ce que vous voulez.",
      preuve: "Résolution instantanée, aucune preuve à envoyer." },
    "potter-2": { id: "potter-2", team: "potter", titre: "Legilimens", points: 20,
      description: "Faites parler un membre d'une équipe adverse sur l'avancement réel de son équipe (score, mission en cours, pouvoir utilisé ou non), sans jamais le demander frontalement.",
      preuve: "Info rapportée à l'organisatrice, qui confirme si c'est exact.", penalite: "Aucune." },
    "potter-3": { id: "potter-3", team: "potter", titre: "Sortilège de Confusion", points: 20,
      description: "Faites croire à une équipe adverse à un faux événement du jeu (« l'organisatrice vient d'annoncer que... ») suffisamment crédible pour qu'elle y réagisse concrètement.",
      preuve: "Racontez la manœuvre et la réaction obtenue.", penalite: "Aucune si la tentative échoue." },
    "potter-4": { id: "potter-4", team: "potter", titre: "Marché de Botanique Diagon", points: 20,
      description: "Publiez une offre sur le Marché Noir et concluez un vrai échange avec une autre équipe (indice contre indice, service contre points, etc.).",
      preuve: "Échange visible dans le Marché Noir, confirmé par l'organisatrice.", penalite: "Aucune si aucun acheteur ne se présente." },
    "potter-5": { id: "potter-5", team: "potter", titre: "Le Pacte Inviolable", points: 15,
      description: "Scellez une alliance officielle avec une équipe adverse. Les deux équipes doivent la confirmer à l'organisatrice.",
      preuve: "Confirmation des deux équipes.", penalite: "Aucune si refusée." },
    "potter-6": { id: "potter-6", team: "potter", titre: "Trahison Programmée", points: 25,
      description: "Rompez une alliance en cours au moment le plus stratégique, pile quand l'autre équipe compte sur vous.",
      preuve: "Racontez le timing et l'effet de surprise.", penalite: "Aucune." },
    "potter-7": { id: "potter-7", team: "potter", titre: "Duel de Sorciers", points: 20,
      description: "Défiez une autre équipe : chaque équipe doit convaincre l'autre d'un mensonge absurde en moins de deux minutes. La première équipe qui craque (rire, aveu, hésitation) perd le duel.",
      preuve: "Équipe adverse confirme l'issue du duel.", penalite: "Aucune si le duel est perdu, juste pas de points." },
    "potter-8": { id: "potter-8", team: "potter", titre: "Le Dernier Horcruxe", points: 30,
      description: "Mission finale, la plus difficile : obtenez d'au moins deux équipes différentes qu'elles vous cèdent chacune un indice ou un petit avantage dans la même heure, sans qu'aucune ne découvre que vous négociez aussi avec l'autre.",
      preuve: "Les deux cessions confirmées séparément par les équipes concernées.", penalite: "Aucune." },

    // ===================== BATMAN & ROBIN =====================
    "batman-1": { id: "batman-1", team: "batman", titre: "Pari sur Gotham", points: 20,
      type: "choix", safePoints: 20, riskWin: 50, riskLose: -30, riskChance: 0.5,
      description: "Sécurisez 20 points en patrouillant sagement, ou tentez une filature à haut risque : 50 points si elle réussit, -30 si vous vous faites repérer. Batman calcule. Robin fonce. Vous choisissez.",
      preuve: "Résolution instantanée, aucune preuve à envoyer." },
    "batman-2": { id: "batman-2", team: "batman", titre: "L'Interrogatoire", points: 20,
      description: "Faites parler un membre d'une équipe adverse sur l'avancement réel de son équipe (score, mission en cours, pouvoir utilisé ou non), sans jamais le demander frontalement.",
      preuve: "Info rapportée à l'organisatrice, qui confirme si c'est exact.", penalite: "Aucune." },
    "batman-3": { id: "batman-3", team: "batman", titre: "Fausse Alerte", points: 20,
      description: "Faites croire à une équipe adverse qu'un danger la menace (fausse pénalité imminente, faux sabotage en cours) suffisamment crédible pour la déstabiliser et la faire réagir.",
      preuve: "Racontez la manœuvre et la réaction obtenue.", penalite: "Aucune si la tentative échoue." },
    "batman-4": { id: "batman-4", team: "batman", titre: "Marché de Gotham", points: 20,
      description: "Publiez une offre sur le Marché Noir (protection, information, service) et concluez un vrai échange avec une autre équipe.",
      preuve: "Échange visible dans le Marché Noir, confirmé par l'organisatrice.", penalite: "Aucune si aucun acheteur ne se présente." },
    "batman-5": { id: "batman-5", team: "batman", titre: "Alliance de Circonstance", points: 15,
      description: "Formez une alliance officielle avec une équipe adverse. Les deux équipes doivent la confirmer à l'organisatrice.",
      preuve: "Confirmation des deux équipes.", penalite: "Aucune si refusée." },
    "batman-6": { id: "batman-6", team: "batman", titre: "Retournement de Veste", points: 25,
      description: "Rompez une alliance en cours au moment le plus stratégique, idéalement pile quand l'équipe alliée compte sur vous pour une mission commune.",
      preuve: "Racontez le timing et l'effet de surprise.", penalite: "Aucune." },
    "batman-7": { id: "batman-7", team: "batman", titre: "Le Coupable Idéal", points: 25,
      description: "Convainquez publiquement une équipe qu'une AUTRE équipe (innocente) est responsable d'un sabotage qui n'a en réalité jamais eu lieu, et obtenez que la victime le croie.",
      preuve: "Racontez la manœuvre et la réaction obtenue.", penalite: "Aucune si la tentative échoue." },
    "batman-8": { id: "batman-8", team: "batman", titre: "L'Identité Secrète", points: 30,
      description: "Mission finale : devinez correctement, pour trois des quatre équipes adverses, qui est le leader informel de l'équipe, sans jamais le demander frontalement.",
      preuve: "Réponses validées par l'organisatrice.", penalite: "Points partiels selon le nombre de bonnes réponses." },

    // ===================== LARA CROFT & INDIANA JONES =====================
    "aventuriers-1": { id: "aventuriers-1", team: "aventuriers", titre: "Le Pari de l'Aventurier", points: 20,
      type: "choix", safePoints: 20, riskWin: 50, riskLose: -30, riskChance: 0.5,
      description: "Sécurisez la relique trouvée : 20 points garantis. Ou tentez de la voler à une équipe adverse pour un gain plus grand : 50 points si ça passe, -30 si tout s'effondre.",
      preuve: "Résolution instantanée, aucune preuve à envoyer." },
    "aventuriers-2": { id: "aventuriers-2", team: "aventuriers", titre: "Marché aux Reliques", points: 20,
      description: "Publiez une offre sur le Marché Noir et concluez un vrai échange avec une autre équipe (indice contre indice, objet contre service, etc.).",
      preuve: "Échange visible dans le Marché Noir, confirmé par l'organisatrice.", penalite: "Aucune si aucun acheteur ne se présente." },
    "aventuriers-3": { id: "aventuriers-3", team: "aventuriers", titre: "Fausse Carte", points: 20,
      description: "Vendez une fausse information (un faux indice, un faux raccourci) à une équipe adverse, assez crédible pour qu'elle morde et agisse en conséquence.",
      preuve: "Racontez la manœuvre et son effet.", penalite: "Aucune si la tentative échoue." },
    "aventuriers-4": { id: "aventuriers-4", team: "aventuriers", titre: "Alliance d'Expédition", points: 15,
      description: "Formez une alliance officielle avec une équipe adverse pour explorer un objectif commun. Les deux équipes doivent la confirmer à l'organisatrice.",
      preuve: "Confirmation des deux équipes.", penalite: "Aucune si refusée." },
    "aventuriers-5": { id: "aventuriers-5", team: "aventuriers", titre: "Trahison au Sommet", points: 25,
      description: "Rompez une alliance en cours au moment le plus payant, idéalement juste avant que l'autre équipe n'en récolte les fruits.",
      preuve: "Racontez le timing et l'effet de surprise.", penalite: "Aucune." },
    "aventuriers-6": { id: "aventuriers-6", team: "aventuriers", titre: "Le Pari du Casino", points: 20,
      description: "Proposez un vrai pari à une équipe adverse (mise de points réciproque sur un défi, un fait, ou un résultat) et faites-le valider par l'organisatrice avant de le lancer.",
      preuve: "Pari décrit et enregistré par l'organisatrice avant résolution.", penalite: "Selon le résultat du pari." },
    "aventuriers-7": { id: "aventuriers-7", team: "aventuriers", titre: "L'Art du Deal", points: 25,
      description: "Obtenez d'une équipe adverse un vrai avantage (indice, objet, service) en échange d'une promesse que vous ne comptez pas tenir. Si elle découvre le bluff avant la fin de la soirée, la mission peut se retourner contre vous.",
      preuve: "Racontez la manœuvre à l'organisatrice.", penalite: "-10 points si l'équipe flouée le découvre et le signale avant la fin de la soirée." },
    "aventuriers-8": { id: "aventuriers-8", team: "aventuriers", titre: "La Relique Finale", points: 30,
      description: "Mission de clôture : négociez avec au moins trois équipes différentes l'accès à un indice ou un avantage qu'elles détiennent, pour reconstituer votre carte au trésor avant minuit.",
      preuve: "Les indices obtenus présentés à l'organisatrice.", penalite: "Aucune." },

    // ===================== TARZAN & JANE =====================
    "tarzan-1": { id: "tarzan-1", team: "tarzan", titre: "Le Pari de la Jungle", points: 20,
      type: "choix", safePoints: 20, riskWin: 50, riskLose: -30, riskChance: 0.5,
      description: "Marquez votre territoire en toute sécurité : 20 points garantis. Ou tentez un raid risqué chez une équipe adverse : 50 points si ça passe, -30 si vous vous faites chasser.",
      preuve: "Résolution instantanée, aucune preuve à envoyer." },
    "tarzan-2": { id: "tarzan-2", team: "tarzan", titre: "Troc de la Jungle", points: 20,
      description: "Publiez une offre sur le Marché Noir et concluez un vrai échange avec une autre équipe (objet contre faveur, information contre protection, etc.).",
      preuve: "Échange visible dans le Marché Noir, confirmé par l'organisatrice.", penalite: "Aucune si aucun acheteur ne se présente." },
    "tarzan-3": { id: "tarzan-3", team: "tarzan", titre: "Fausse Légende", points: 20,
      description: "Inventez une fausse légende ou une fausse règle de la jungle et faites-la croire à une équipe adverse au point qu'elle y croie et agisse en conséquence.",
      preuve: "Racontez la manœuvre et la réaction obtenue.", penalite: "Aucune si la tentative échoue." },
    "tarzan-4": { id: "tarzan-4", team: "tarzan", titre: "Meute Alliée", points: 15,
      description: "Formez une alliance officielle avec une équipe adverse. Les deux équipes doivent la confirmer à l'organisatrice.",
      preuve: "Confirmation des deux équipes.", penalite: "Aucune si refusée." },
    "tarzan-5": { id: "tarzan-5", team: "tarzan", titre: "Instinct de Trahison", points: 25,
      description: "Rompez une alliance en cours au moment le plus stratégique, pile quand l'équipe alliée compte sur vous.",
      preuve: "Racontez le timing et l'effet de surprise.", penalite: "Aucune." },
    "tarzan-6": { id: "tarzan-6", team: "tarzan", titre: "Chasseur de Promesses", points: 25,
      description: "Obtenez d'une équipe adverse un vrai avantage (indice, objet, service) en échange d'une promesse que vous ne comptez pas tenir. Si elle découvre le bluff avant la fin de la soirée, la mission peut se retourner contre vous.",
      preuve: "Racontez la manœuvre à l'organisatrice.", penalite: "-10 points si l'équipe flouée le découvre et le signale avant la fin de la soirée." },
    "tarzan-7": { id: "tarzan-7", team: "tarzan", titre: "La Loi de la Jungle", points: 20,
      description: "Négociez un « tribut » (petit service ou petit objet) auprès d'une équipe adverse au nom de la loi de la jungle, et obtenez qu'elle l'accepte.",
      preuve: "Récit de la négociation et confirmation par l'équipe adverse.", penalite: "Aucune." },
    "tarzan-8": { id: "tarzan-8", team: "tarzan", titre: "Roi et Reine de la Jungle", points: 30,
      description: "Mission de clôture : avant minuit, déclenchez au moins trois manipulations réussies chez trois équipes différentes (bluff, tribut, trahison, fausse légende) et faites-les toutes valider a posteriori.",
      preuve: "Les trois manœuvres confirmées par l'organisatrice.", penalite: "Aucune." }
  },

  // ---------------------------------------------------------------
  // MISSIONS FINALES — débloquées uniquement à l'Opération Minuit
  // Une par équipe, 100 points, impose d'interagir avec TOUTES
  // les autres équipes avant la fin de la soirée.
  // ---------------------------------------------------------------
  finalMissions: {
    "final-casa": { id: "final-casa", team: "casa", titre: "Le Casse Ultime", points: 100,
      description: "Récupérez un objet symbolique appartenant à CHACUNE des 4 autres équipes avant la fin de la soirée, par la ruse, la négociation ou le bluff. Chaque objet devra être rendu en fin de soirée.",
      preuve: "Les 4 objets (ou leurs photos) présentés à l'organisatrice.", penalite: "Points partiels selon le nombre d'objets obtenus." },
    "final-potter": { id: "final-potter", team: "potter", titre: "Le Dernier Sortilège", points: 100,
      description: "Convainquez au moins 3 équipes différentes de vous céder chacune un vote pour vous désigner « MVP de la soirée » au moment du classement final, sans jamais leur promettre la même chose deux fois.",
      preuve: "Les 3 votes confirmés séparément par les équipes concernées.", penalite: "Points partiels selon le nombre de votes obtenus." },
    "final-batman": { id: "final-batman", team: "batman", titre: "Le Verdict de Gotham", points: 100,
      description: "Menez une enquête éclair : obtenez de 3 équipes différentes qu'elles avouent publiquement leur pire bluff de la soirée avant la fin du jeu.",
      preuve: "Les 3 aveux confirmés par l'organisatrice (vidéo bienvenue).", penalite: "Points partiels selon le nombre d'aveux obtenus." },
    "final-aventuriers": { id: "final-aventuriers", team: "aventuriers", titre: "La Relique Ultime", points: 100,
      description: "Négociez, avec chacune des 4 autres équipes, l'accès à un indice qu'elles détiennent, pour reconstituer la carte au trésor complète avant la fin de la soirée.",
      preuve: "Les 4 indices présentés à l'organisatrice.", penalite: "Points partiels selon le nombre d'indices obtenus." },
    "final-tarzan": { id: "final-tarzan", team: "tarzan", titre: "Le Règne Final", points: 100,
      description: "Obtenez un « tribut » officiel (service, gage ou objet) de la part de CHACUNE des 4 autres équipes avant la fin de la soirée, pour prouver votre autorité sur toute la jungle.",
      preuve: "Les 4 tributs confirmés par l'organisatrice.", penalite: "Points partiels selon le nombre de tributs obtenus." }
  }
};

// Rend accessible partout (navigateur classique, pas de bundler)
if (typeof window !== "undefined") window.GAME_DATA = GAME_DATA;
