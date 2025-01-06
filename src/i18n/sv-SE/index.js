export default {
  app: {
    title: "RummiScore",
    subtitle: "Partiet startade {date} kl {time}",
    emptyState: {
      title: "Lägg till spelare för att börja",
      icon: "groups",
    },
  },
  stats: {
    currentLeader: "Nuvarande ledare",
    highestRoundScore: "Högsta rundpoäng",
    totalRounds: "Totalt antal rundor",
    noPlayers: "Inga spelare",
    noScores: "Inga poäng",
    playerProgress: "{player}: {score}",
  },
  players: {
    addPlayer: "Lägg till spelare",
    playerExists: "Spelaren finns redan",
    nameTooLong: "Namnet är för långt (max 20 tecken)",
    invalidName: "Ange ett giltigt namn",
    playerAdded: "Spelare tillagd",
    confirmRemove: "Är du säker på att du vill ta bort {player}?",
    playerRemoved: "Spelare borttagen",
    resetGame: "Återställ parti",
    resetGameConfirm:
      "Att ta bort den sista spelaren kommer att återställa spelet. Fortsätt?",
    removePlayer: "Ta bort spelare",
    nameUpdated: "Spelarnamn ändrat från {oldName} till {newName}",
  },
  game: {
    newGame: "Nytt parti",
    startNewGame: "Starta nytt parti?",
    confirmNewGame: "Nuvarande parti kommer att arkiveras. Fortsätt?",
    gameStarted: "Nytt parti startat",
    endGame: "Avsluta parti",
    confirmEndGame:
      "Är du säker på att du vill avsluta detta parti? Det kommer att sparas i historiken.",
    gameEnded:
      "Spelet är slut! {winner} vann med {points} poäng! Nytt parti startat med samma spelare.",
    round: "Runda",
    total: "Totalt",
    addRound: "Lägg till runda",
    removeRound: "Ta bort runda",
    confirmRemoveRound: "Är du säker på att du vill ta bort runda {round}?",
    roundRemoved: "Runda borttagen",
  },
  actions: {
    undo: "Ångra",
    redo: "Gör om",
    cancel: "Avbryt",
    confirm: "Bekräfta",
    close: "Stäng",
    gotIt: "Uppfattat",
    nothingToUndo: "Inget att ångra",
    nothingToRedo: "Inget att göra om",
    undoAction: "Ångra {action} ({time})",
    redoAction: "Gör om {action} ({time})",
    updateScores: "Poängställning uppdaterad",
  },
  features: {
    joker: {
      title: "Stängde med joker runda",
      description: "Dubbla poäng för stängaren, dubbelt negativt för övriga",
      applied: "Joker använd! Stängaren dubblad, övriga dubbelt negativt.",
      useJoker: "Använd joker",
      jokerUsed: "Joker använd",
      needCloser: "Markera stängaren innan stängde med joker används",
    },
    closer: {
      title: "Rundans stängare",
      description: "Markera spelaren som stängde rundan (+50 poäng)",
      markAs: "Markera som stängare",
      unmark: "Avmarkera som stängare",
      alreadyCloser: "{player} är redan stängare",
      closerMarked: "{player} markerad som stängare (+50 poäng)",
      closerUnmarked: "{player} avmarkerad som stängare (-50 poäng)",
    },
    displayCard: {
      title: "Fick visningskortet",
      description: "Markera spelaren som fick visningskortet (+50 poäng)",
      markAs: "Markera som innehavare av visningskort",
      unmark: "Avmarkera som innehavare av visningskort",
      alreadyHas: "{player} har redan visningskortet",
      cardMarked:
        "{player} markerad som innehavare av visningskort (+50 poäng)",
      cardUnmarked:
        "{player} avmarkerad som innehavare av visningskort (-50 poäng)",
    },
    didNotComeOut: {
      markAs: "Markera som Kom Inte Ut (-200)",
      unmark: "Ta bort Kom Inte Ut status",
      marked: "{player} markerad som Kom Inte Ut",
      unmarked: "Tog bort Kom Inte Ut status för {player}",
    },
  },
  history: {
    title: "Spelhistorik",
    noHistory: "Ingen spelhistorik",
    noHistoryDesc: "Slutför ett parti för att se det här",
    players: "{count} spelare",
    rounds: "{count} rundor",
    gameDate: "{date}",
  },
  info: {
    title: "RummiScore funktionsguide",
    gameControls: "Spelkontroller",
    roundActions: "Rundåtgärder",
    controls: {
      gameHistory: {
        title: "Spelhistorik",
        description: "Se tidigare parti och resultat",
      },
      newGame: {
        title: "Nytt parti",
        description: "Starta ett nytt parti (nuvarande parti arkiveras)",
      },
      undo: {
        title: "Ångra",
        description: "Ångra senaste åtgärden (Ctrl/Cmd + Z)",
      },
      redo: {
        title: "Gör om",
        description: "Gör om tidigare ångrad åtgärd (Ctrl/Cmd + Shift + Z)",
      },
      language: {
        title: "Byta Språk",
        description: "Byta språk på programmet",
      },
    },
    actions: {
      joker: {
        title: "Stängde med joker runda",
        description: "Dubbla poäng för stängaren, dubbelt negativt för övriga",
      },
      closer: {
        title: "Rundans stängare",
        description: "Markera spelaren som stängde rundan (+50 poäng)",
      },
      displayCard: {
        title: "Fick visningskortet",
        description: "Markera spelaren som fick visningskortet (+50 poäng)",
      },
      removeRound: {
        title: "Ta bort runda",
        description: "Radera aktuell runda",
      },
      didNotComeOut: {
        title: "Kom Ej Ut",
        description: "Spelaren kom ej ut denna rundan (-200 poäng)",
      },
    },
  },
  errors: {
    loadingState: "Fel vid laddning av sparat parti",
    undoOperation: "Fel vid ångra-åtgärd",
    redoOperation: "Fel vid gör om-åtgärd",
    savingHistory: "Fel vid sparande av historik",
  },
  time: {
    justNow: "just nu",
    minutesAgo: "för {minutes}m sedan",
    hoursAgo: "för {hours}t sedan",
    daysAgo: "för {days}d sedan",
  },
  language: {
    changed: "Språk ändrat",
  },
};
