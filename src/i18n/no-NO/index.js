export default {
  app: {
    title: "RummiScore",
    subtitle: "Spillet startet {date} kl. {time}",
    emptyState: {
      title: "Legg til spillere for å starte",
      icon: "grupper",
    },
  },
  stats: {
    currentLeader: "Nåværende leder",
    highestRoundScore: "Høyeste poengsum i runde",
    totalRounds: "Totalt antall runder",
    noPlayers: "Ingen spillere",
    noScores: "Ingen poeng",
    playerProgress: "{player}: {score}",
  },
  players: {
    addPlayer: "Legg til spiller",
    playerExists: "Spiller finnes allerede",
    nameTooLong: "Navnet er for langt (maks 20 tegn)",
    invalidName: "Vennligst skriv inn et gyldig navn",
    playerAdded: "Spiller lagt til",
    confirmRemove: "Er du sikker på at du vil fjerne {player}?",
    playerRemoved: "Spiller fjernet",
    resetGame: "Tilbakestill spillet",
    resetGameConfirm:
      "Å fjerne den siste spilleren vil tilbakestille spillet. Fortsette?",
    removePlayer: "Fjern spiller",
    nameUpdated: "Spillernavn endret fra {oldName} til {newName}",
  },
  game: {
    newGame: "Nytt spill",
    startNewGame: "Start nytt spill?",
    confirmNewGame: "Nåværende spill vil bli arkivert. Fortsette?",
    gameStarted: "Nytt spill startet",
    endGame: "Avslutt spill",
    confirmEndGame:
      "Er du sikker på at du vil avslutte dette spillet? Det vil bli lagret i historikken.",
    gameEnded:
      "Spill avsluttet! {winner} vant med {points} poeng! Nytt spill startet med samme spillere.",
    round: "Runde",
    total: "Totalt",
    addRound: "Legg til runde",
    removeRound: "Fjern runde",
    confirmRemoveRound: "Er du sikker på at du vil fjerne runde {round}?",
    roundRemoved: "Runde fjernet",
  },
  actions: {
    undo: "Angre",
    redo: "Gjør om",
    cancel: "Avbryt",
    confirm: "Bekreft",
    close: "Lukk",
    gotIt: "Forstått",
    nothingToUndo: "Ingenting å angre",
    nothingToRedo: "Ingenting å gjøre om",
    undoAction: "Angre {action} ({time})",
    redoAction: "Gjør om {action} ({time})",
    updateScores: "Poeng oppdatert",
  },
  features: {
    joker: {
      title: "Lukket med Joker-runde",
      description: "Dobbel poeng til avslutter, dobbel negativ til andre",
      applied: "Joker brukt! Avslutter doblet, andre doblet negativ.",
      useJoker: "Bruk Joker",
      jokerUsed: "Joker brukt",
      needCloser: "Vennligst marker avslutter før du bruker joker",
    },
    closer: {
      title: "Rundeavslutter",
      description: "Marker spilleren som avsluttet runden (+50 poeng)",
      markAs: "Marker som avslutter",
      unmark: "Fjern markering som avslutter",
      alreadyCloser: "{player} er allerede avslutter",
      closerMarked: "{player} markert som avslutter (+50 poeng)",
      closerUnmarked: "{player} fjernet som avslutter (-50 poeng)",
    },
    displayCard: {
      title: "Fikk visningskort",
      description: "Marker spilleren som fikk visningskortet (+50 poeng)",
      markAs: "Marker som har visningskort",
      unmark: "Fjern markering som har visningskort",
      alreadyHas: "{player} har allerede visningskortet",
      cardMarked: "{player} markert som har visningskort (+50 poeng)",
      cardUnmarked: "{player} fjernet som har visningskort (-50 poeng)",
    },
    didNotComeOut: {
      markAs: "Marker som ikke kom ut (-200)",
      unmark: "Fjern status for Ikke kom ut",
      marked: "{player} markert som Ikke kom ut",
      unmarked: "Fjernet Ikke kom ut-status for {player}",
    },
  },
  history: {
    title: "Spillhistorikk",
    noHistory: "Ingen spillhistorikk",
    noHistoryDesc: "Fullfør et spill for å se det her",
    players: "{count} spillere",
    rounds: "{count} runder",
    gameDate: "{date}",
  },
  info: {
    title: "RummiScore Funksjonsguide",
    gameControls: "Spillkontroller",
    roundActions: "Rundehandlinger",
    controls: {
      gameHistory: {
        title: "Spillhistorikk",
        description: "Tilgang til tidligere spill og resultater",
      },
      newGame: {
        title: "Nytt Spill",
        description: "Start et nytt spill (nåværende spill blir arkivert)",
      },
      undo: {
        title: "Angre",
        description: "Angre siste handling (Ctrl/Cmd + Z)",
      },
      redo: {
        title: "Gjør om",
        description: "Gjør om forrige handling (Ctrl/Cmd + Shift + Z)",
      },
      language: {
        title: "Endre Språk",
        description: "Endre språk for applikasjonen",
      },
    },
    actions: {
      joker: {
        title: "Lukket med Joker-runde",
        description: "Dobbel poeng til avslutter, dobbel negativ til andre",
      },
      closer: {
        title: "Rundeavslutter",
        description: "Marker spilleren som avsluttet runden (+50 poeng)",
      },
      displayCard: {
        title: "Fikk Visningskort",
        description: "Marker spilleren som fikk visningskortet (+50 poeng)",
      },
      removeRound: {
        title: "Fjern runde",
        description: "Slett den aktuelle runden",
      },
      didNotComeOut: {
        title: "Kom ikke ut",
        description: "Spilleren kom ikke ut denne runden (-200 poeng)",
      },
    },
  },
  errors: {
    loadingState: "Feil ved lasting av lagret spill",
    undoOperation: "Feil under angreoperasjon",
    redoOperation: "Feil under gjør om-operasjon",
    savingHistory: "Feil ved lagring av historikk",
  },
  time: {
    justNow: "akkurat nå",
    minutesAgo: "for {minutes} min siden",
    hoursAgo: "for {hours} t siden",
    daysAgo: "for {days} d siden",
  },
  language: {
    changed: "Språket er endret",
  },
};
