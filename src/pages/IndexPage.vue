<template>
  <q-page class="q-pa-md">
    <!-- Header Section with Stats -->
    <div class="header-section q-mb-lg">
      <div class="row items-center justify-between q-pb-md">
        <div>
          <h4 class="text-h4 q-my-none text-weight-medium">RummiScore</h4>
          <p class="text-subtitle2 text-grey-7" v-if="currentGameStartTime">
            {{ timeElapsed }}
          </p>
        </div>
        <div class="row q-gutter-sm">
          <q-btn
            flat
            round
            icon="analytics"
            @click="showStats = true"
            color="primary"
          />
          <q-btn
            flat
            round
            icon="history"
            @click="showHistory = true"
            color="primary"
          />
          <q-btn
            flat
            round
            icon="add"
            @click="confirmNewGame"
            color="primary"
          />
          <q-btn
            flat
            round
            icon="undo"
            :disable="!canUndo"
            @click="undo"
            :color="canUndo ? 'primary' : 'grey-4'"
          >
            <q-tooltip>{{ undoTooltip }}</q-tooltip>
          </q-btn>

          <q-btn
            flat
            round
            icon="redo"
            :disable="!canRedo"
            @click="redo"
            :color="canRedo ? 'primary' : 'grey-4'"
          >
            <q-tooltip>{{ redoTooltip }}</q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            icon="help_outline"
            @click="showInfo = true"
            color="primary"
          />
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="row q-col-gutter-md" v-if="players.length">
        <div
          class="col-12 col-sm-4"
          v-for="(stat, index) in quickStats"
          :key="index"
        >
          <q-card flat class="stats-card">
            <q-card-section>
              <div class="text-subtitle2 text-grey-7">{{ stat.label }}</div>
              <div class="text-h5 text-weight-medium q-mt-sm text-uppercase">
                {{ stat.value }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
    <!-- Player Management -->
    <div class="player-section q-mb-lg">
      <q-card flat class="bg-white">
        <q-card-section>
          <q-input
            v-model="newPlayer"
            placeholder="Add player"
            outlined
            @keyup.enter="addPlayer"
            :rules="[
              (val) => val.trim().length <= 20 || 'Name too long',
              (val) =>
                !players.some(
                  (player) => player.toUpperCase() === val.trim().toUpperCase(),
                ) || 'Player already exists',
            ]"
          >
            <template v-slot:prepend>
              <q-icon name="person_add" color="primary" />
            </template>
            <template v-slot:append>
              <q-btn
                flat
                round
                dense
                icon="add"
                color="primary"
                @click="addPlayer"
                :disable="!newPlayer.trim()"
              />
            </template>
          </q-input>
        </q-card-section>
      </q-card>
    </div>

    <!-- Score Table with Enhanced Features -->
    <div class="score-table" v-if="players.length">
      <q-card flat class="bg-white">
        <q-table
          :rows="rounds"
          :columns="tableColumns"
          flat
          bordered
          :pagination="{ rowsPerPage: 0 }"
          :loading="loading"
          row-key="round"
          class="ios-table"
        >
          <!-- Header with Player Names -->
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th class="text-center"></q-th>
              <q-th
                v-for="player in players"
                :key="player"
                class="text-center"
                :class="{ 'bg-primary ': isWinningPlayer(player) }"
              >
                <div class="row items-center justify-center">
                  <q-input
                    v-model="players[players.indexOf(player)]"
                    dense
                    borderless
                    class="player-name-edit text-center"
                    :input-class="{
                      'text-white': isWinningPlayer(player),
                    }"
                    @change="updatePlayerName(player, $event)"
                  >
                    <template v-slot:append>
                      <q-btn
                        flat
                        round
                        dense
                        icon="close"
                        size="sm"
                        @click.stop="removePlayer(player)"
                      >
                        <q-tooltip>Remove Player</q-tooltip>
                      </q-btn>
                    </template>
                  </q-input>
                </div>
              </q-th>
            </q-tr>
          </template>

          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td class="text-center">
                <div class="row items-center justify-center">
                  <q-btn
                    flat
                    round
                    dense
                    icon="close"
                    size="sm"
                    @click.stop="confirmRemoveRound(props.row.round)"
                    class="q-ml-xs"
                    color="negative"
                  >
                    <q-tooltip>Remove Round</q-tooltip>
                  </q-btn>
                  Round {{ props.row.round }}
                  <q-btn
                    flat
                    round
                    dense
                    :icon="
                      props.row.closedRoundWithJoker
                        ? 'theater_comedy'
                        : 'theater_comedy'
                    "
                    size="sm"
                    @click="toggleJoker(props.row)"
                    class="q-ml-xs"
                    :color="props.row.closedRoundWithJoker ? 'purple' : 'grey'"
                  >
                    <q-tooltip>
                      {{
                        props.row.closedRoundWithJoker
                          ? "Joker Used"
                          : "Use Joker"
                      }}
                    </q-tooltip>
                  </q-btn>
                </div>
              </q-td>
              <q-td
                v-for="player in players"
                :key="player"
                class="text-center"
                :class="{
                  'bg-positive-1': isHighestInRound(props.row, player),
                  'joker-active': props.row.closedRoundWithJoker,
                  'closer-active': props.row.closer === player,
                }"
              >
                <div
                  class="row items-center justify-center q-gutter-x-sm text-center"
                >
                  <q-input
                    v-model.number="props.row.scores[player]"
                    type="number"
                    dense
                    outlined
                    class="score-input"
                    @change="saveState"
                    :input-class="[
                      props.row.scores[player] < 0
                        ? 'text-negative'
                        : props.row.scores[player] > 0
                          ? 'text-positive'
                          : '',
                      props.row.closedRoundWithJoker ? 'text-weight-bold' : '',
                    ]"
                  />
                  <q-btn
                    flat
                    round
                    dense
                    size="sm"
                    icon="content_copy"
                    :color="
                      props.row.hasDisplayCard === player ? 'teal' : 'grey'
                    "
                    @click="toggleHasDisplayCard(props.row, player)"
                  >
                    <q-tooltip>
                      {{
                        props.row.hasDisplayCard === player
                          ? "Unmark as having display card"
                          : "Mark as having display card"
                      }}
                    </q-tooltip>
                  </q-btn>

                  <q-btn
                    flat
                    round
                    dense
                    size="sm"
                    :icon="
                      props.row.closer === player ? 'stars' : 'star_outline'
                    "
                    :color="props.row.closer === player ? 'amber' : 'grey'"
                    @click="toggleCloser(props.row, player)"
                    style="margin-left: 0px !important"
                  >
                    <q-tooltip>
                      {{
                        props.row.closer === player
                          ? "Unmark as closer"
                          : "Mark as closer"
                      }}
                    </q-tooltip>
                  </q-btn>
                </div>
              </q-td>
            </q-tr>
          </template>
          <template v-slot:bottom-row>
            <q-tr class="totals-row">
              <q-td class="text-center text-weight-medium">Total</q-td>
              <q-td
                v-for="player in players"
                :key="`total-${player}`"
                class="text-center text-weight-medium"
                :class="{ 'text-primary': isWinningPlayer(player) }"
              >
                {{ calculateTotal(player) }}
              </q-td>
            </q-tr>
          </template>
        </q-table>

        <q-card-actions align="center" class="q-py-md">
          <q-btn
            unelevated
            color="primary"
            icon="add"
            label="Add Round"
            @click="addRound"
            class="ios-button q-mr-sm"
          />
          <q-btn
            unelevated
            color="red-12"
            icon="done_all"
            label="End Game"
            @click="confirmEndGame"
            class="ios-button"
            :disable="!players.length || !rounds.length"
          />
        </q-card-actions>
      </q-card>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="column items-center justify-center full-height"
      style="min-height: 50vh"
    >
      <q-icon name="groups" size="4rem" color="grey-4" />
      <div class="text-h6 text-grey-6 q-mt-md text-weight-medium">
        Add players to begin
      </div>
    </div>

    <!-- Dialogs -->
    <q-dialog v-model="showHistory" maximized>
      <q-card class="history-dialog">
        <!-- Header -->
        <q-card-section class="history-header">
          <div class="row items-center justify-between q-px-sm">
            <div class="text-h6 text-weight-medium">Game History</div>
            <q-btn v-close-popup flat round dense icon="close" color="grey-7" />
          </div>
        </q-card-section>

        <!-- Content -->
        <q-card-section class="history-content">
          <template v-if="gameHistory.length">
            <div
              v-for="game in gameHistory"
              :key="game.id"
              class="history-item q-mb-md"
            >
              <!-- Game Header -->
              <div class="game-header q-pa-md">
                <div class="row items-center justify-between">
                  <div>
                    <div class="text-subtitle1 text-weight-medium">
                      {{ formatDate(game.date) }}
                    </div>
                    <div class="text-caption text-grey-7 q-mt-xs">
                      {{ game.players.length }} players ·
                      {{ game.rounds.length }} rounds
                    </div>
                  </div>
                  <q-btn flat round dense icon="chevron_right" color="grey-6" />
                </div>
              </div>

              <!-- Game Summary -->
              <div class="game-summary q-px-md q-pb-md q-pt-sm">
                <div class="row q-col-gutter-sm">
                  <div
                    v-for="(score, player) in game.finalScores"
                    :key="player"
                    class="col-6 col-sm-4"
                  >
                    <div class="score-card">
                      <div class="row items-center no-wrap q-pa-sm">
                        <q-avatar
                          color="primary"
                          text-color="white"
                          size="32px"
                          class="q-mr-sm"
                        >
                          {{ player.charAt(0) }}
                        </q-avatar>
                        <div>
                          <div class="text-subtitle2 text-weight-medium">
                            {{ player }}
                          </div>
                          <div
                            :class="{
                              'text-positive text-weight-medium': score > 0,
                              'text-negative': score < 0,
                              'text-grey': score == 0,
                            }"
                          >
                            {{ score }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- Empty State -->
          <div
            v-else
            class="column items-center justify-center full-height q-pa-xl"
          >
            <q-icon name="history" size="64px" color="grey-4" />
            <div class="text-h6 text-grey-7 q-mt-md">No Game History</div>
            <div class="text-caption text-grey-6 q-mt-sm">
              Complete a game to see it here
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Stats Dialog -->
    <q-dialog v-model="showStats">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Game Statistics</div>
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12" v-for="player in players" :key="player">
              <q-linear-progress
                :value="getPlayerProgress(player)"
                :color="getPlayerColor(player)"
                style="height: 20px"
              >
                <div class="absolute-full flex flex-center">
                  <q-badge color="white" text-color="primary">
                    {{ player }}: {{ calculateTotal(player) }}
                  </q-badge>
                </div>
              </q-linear-progress>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- New Game Confirmation -->
    <q-dialog v-model="showNewGameConfirm">
      <q-card>
        <q-card-section>
          <div class="text-h6">Start New Game?</div>
        </q-card-section>

        <q-card-section>
          Current game will be archived. Continue?
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn
            flat
            label="Confirm"
            color="positive"
            @click="startNewGame"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="showInfo">
      <q-card style="min-width: 350px; max-width: 600px">
        <q-card-section class="row items-center">
          <div class="text-h6">RummiScore Features Guide</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="text-subtitle2 q-mb-md">Game Controls</div>
          <div class="q-mb-lg">
            <div
              v-for="(control, index) in gameControls"
              :key="index"
              class="feature-item q-mb-md"
            >
              <div class="row no-wrap items-start">
                <q-icon
                  :name="control.icon"
                  :color="control.color"
                  size="sm"
                  class="q-mt-xs q-mr-md"
                />
                <div class="feature-content">
                  <div class="text-weight-medium">{{ control.title }}</div>
                  <div class="text-caption text-grey-7">
                    {{ control.description }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <q-separator class="q-my-md" />

          <div class="text-subtitle2 q-mb-md">Round Actions</div>
          <div>
            <div
              v-for="(action, index) in roundActions"
              :key="index"
              class="feature-item q-mb-md"
            >
              <div class="row no-wrap items-start">
                <q-icon
                  :name="action.icon"
                  :color="action.color"
                  size="sm"
                  class="q-mt-xs q-mr-md"
                />
                <div class="feature-content">
                  <div class="text-weight-medium">{{ action.title }}</div>
                  <div class="text-caption text-grey-7">
                    {{ action.description }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Got it" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { date, useQuasar } from "quasar";

// Core state variables
const $q = useQuasar();
const players = ref([]);
const rounds = ref([]);
const newPlayer = ref("");
const showHistory = ref(false);
const showNewGameConfirm = ref(false);
const showStats = ref(false);
const gameHistory = ref([]);
const loading = ref(false);
const currentGameStartTime = ref(null);

// Table columns computed property
const tableColumns = computed(() => {
  const columns = [
    {
      name: "round",
      label: "Round",
      field: "round",
      align: "center",
    },
  ];

  players.value.forEach((player) => {
    columns.push({
      name: player,
      label: player.toUpperCase(),
      field: (row) => row.scores[player],
      align: "center",
    });
  });

  return columns;
});

const quickStats = computed(() => [
  {
    label: "Current Leader",
    value: currentLeader.value,
  },
  {
    label: "Highest Round Score",
    value:
      highestScoreWithPlayer.value.score === 0
        ? "No scores"
        : `${highestScoreWithPlayer.value.player} (${highestScoreWithPlayer.value.score})`,
  },
  {
    label: "Total Rounds",
    value: rounds.value.length,
  },
]);
// Computed properties for stats
const currentLeader = computed(() => {
  if (!players.value.length) return "No players";
  const totals = players.value.map((player) => ({
    player,
    total: calculateTotal(player),
  }));
  const leader = totals.reduce((a, b) => (a.total > b.total ? a : b));
  return `${leader.player} (${leader.total})`;
});

const highestScoreWithPlayer = computed(() => {
  if (!rounds.value.length) return { score: 0, player: "No players" };

  let highestScore = -Infinity;
  let playerWithHighest = "";

  rounds.value.forEach((round) => {
    Object.entries(round.scores).forEach(([player, score]) => {
      if (score > highestScore) {
        highestScore = score;
        playerWithHighest = player;
      }
    });
  });

  return {
    score: highestScore,
    player: playerWithHighest,
  };
});

const timeElapsed = computed(() => {
  if (!currentGameStartTime.value) return "";
  return date.formatDate(currentGameStartTime.value, "MMM D, YYYY [at] h:mm A");
});

// Player management methods
const addPlayer = () => {
  const trimmedName = newPlayer.value.trim();

  if (!trimmedName) {
    $q.notify({
      message: "Please enter a valid name",
      color: "warning",
    });
    return;
  }

  const capitalizedName = trimmedName.toUpperCase();

  if (
    players.value.some((player) => player.toUpperCase() === capitalizedName)
  ) {
    $q.notify({
      message: "Player already exists",
      color: "warning",
    });
    return;
  }

  if (trimmedName.length > 20) {
    $q.notify({
      message: "Name is too long",
      color: "warning",
    });
    return;
  }

  players.value.push(capitalizedName);
  if (rounds.value.length === 0) {
    addRound();
  } else {
    rounds.value.forEach((round) => {
      round.scores[capitalizedName] = 0;
    });
  }
  newPlayer.value = "";
  saveState();
  saveToHistory(`Added player: ${capitalizedName}`);
  $q.notify({
    message: "Player added successfully",
    color: "positive",
  });
};

const updatePlayerName = (oldName, newName) => {
  const index = players.value.indexOf(oldName);
  if (index !== -1) {
    const capitalizedNewName = newName.trim().toUpperCase();

    if (!nameExists) {
      players.value[index] = capitalizedNewName;
      rounds.value.forEach((round) => {
        round.scores[capitalizedNewName] = round.scores[oldName];
        delete round.scores[oldName];
      });
      saveState();
      saveToHistory(`Renamed player: ${oldName} to ${capitalizedNewName}`);
    }
  }
};

const removePlayer = (player) => {
  if (players.value.length <= 1) {
    // Show confirmation dialog before resetting the game
    $q.dialog({
      title: "Reset Game",
      message: "Removing the last player will reset the game. Continue?",
      cancel: true,
      persistent: true,
    }).onOk(() => {
      // Reset the game
      players.value = players.value.filter((p) => p !== player);
      rounds.value.forEach((round) => {
        delete round.scores[player];
      });
      saveState();
      saveToHistory(`Removed player: ${player}`);
    });
    return;
  }

  // Original logic for removing a player when there are multiple players
  $q.dialog({
    title: "Confirm Removal",
    message: `Are you sure you want to remove ${player}?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    players.value = players.value.filter((p) => p !== player);
    rounds.value.forEach((round) => {
      delete round.scores[player];
    });
    saveState();
    $q.notify({
      message: "Player removed",
      color: "warning",
    });
  });
};

// Round management methods
const addRound = () => {
  const scores = {};
  players.value.forEach((player) => {
    scores[player] = 0;
  });
  rounds.value.push({
    round: rounds.value.length + 1,
    scores,
    closedRoundWithJoker: false,
    closer: null,
    hasDisplayCard: null,
  });
  saveState();
  saveToHistory("Added new round");
};
const toggleHasDisplayCard = (round, player) => {
  // If this player already has the display card, remove it
  if (round.hasDisplayCard === player) {
    round.scores[player] -= 50;
    round.hasDisplayCard = null;

    saveState();
    saveToHistory(
      `Unmarked ${player} as having display card (-50) for round ${round.round}`,
    );

    $q.notify({
      message: `${player} unmarked as having display card (-50 points)`,
      color: "warning",
      icon: "playing_cards",
    });
    return;
  }

  // If another player already has the display card, show warning
  if (round.hasDisplayCard) {
    $q.notify({
      message: `${round.hasDisplayCard} already has the display card`,
      color: "warning",
      icon: "warning",
    });
    return;
  }

  // Assign display card to this player
  round.scores[player] += 50;
  round.hasDisplayCard = player;

  saveState();
  saveToHistory(
    `Marked ${player} as having display card (+50) for round ${round.round}`,
  );

  $q.notify({
    message: `${player} marked as having display card (+50 points)`,
    color: "positive",
    icon: "playing_cards",
  });
};
const toggleCloser = (round, player) => {
  // If this player is already the closer, remove closer status
  if (round.closer === player) {
    round.scores[player] -= 50;
    round.closer = null;

    saveState();
    saveToHistory(
      `Unmarked ${player} as closer (-50) for round ${round.round}`,
    );

    $q.notify({
      message: `${player} unmarked as closer (-50 points)`,
      color: "warning",
      icon: "star_outline",
    });
    return;
  }

  // If another player is already the closer, show warning
  if (round.closer) {
    $q.notify({
      message: `${round.closer} is already the closer`,
      color: "warning",
      icon: "warning",
    });
    return;
  }

  // Assign closer status to this player
  round.scores[player] += 50;
  round.closer = player;

  saveState();
  saveToHistory(`Marked ${player} as closer (+50) for round ${round.round}`);

  $q.notify({
    message: `${player} marked as closer (+50 points)`,
    color: "positive",
    icon: "stars",
  });
};
const confirmRemoveRound = (roundNum) => {
  $q.dialog({
    title: "Remove Round",
    message: `Are you sure you want to remove round ${roundNum}?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    removeRound(roundNum);
    $q.notify({
      message: "Round removed",
      color: "warning",
    });
  });
};

const removeRound = (roundNum) => {
  rounds.value = rounds.value.filter((r) => r.round !== roundNum);
  rounds.value.forEach((round, index) => {
    round.round = index + 1;
  });

  if (rounds.value.length === 0 && players.value.length > 0) {
    addRound();
  }

  saveState();
  saveToHistory(`Removed round ${roundNum}`);
};
const toggleJoker = (round) => {
  if (!round.closer) {
    $q.notify({
      message: "Please mark the closer before applying joker",
      color: "warning",
    });
    return;
  }

  if (round.closedRoundWithJoker) {
    // Revert to original scores
    if (round.originalScores) {
      Object.keys(round.scores).forEach((player) => {
        round.scores[player] = round.originalScores[player];
      });
    }
    round.closedRoundWithJoker = false;
  } else {
    // Store original scores before applying joker effect
    round.originalScores = { ...round.scores };

    // Process scores based on marked closer
    Object.keys(round.scores).forEach((player) => {
      const currentScore = round.scores[player];
      if (player === round.closer) {
        // Closer gets double positive points
        round.scores[player] = currentScore * 2;
      } else {
        // Everyone else gets their points doubled and made negative
        round.scores[player] = Math.abs(currentScore) * -2;
      }
    });

    round.closedRoundWithJoker = true;

    $q.notify({
      message: "Joker applied! Closer doubled, others doubled negative.",
      color: "purple",
      icon: "casino",
    });
  }
  saveState();
  saveToHistory(
    `${round.closedRoundWithJoker ? "Applied" : "Removed"} joker for round ${round.round}`,
  );
};

// Score calculation and styling methods
const calculateTotal = (player) => {
  return rounds.value.reduce(
    (sum, round) => sum + (round.scores[player] || 0),
    0,
  );
};

const getPlayerColor = (player) => {
  const colors = ["primary", "secondary", "accent", "positive", "info"];
  return colors[players.value.indexOf(player) % colors.length];
};

const isHighestInRound = (round, player) => {
  const scores = Object.values(round.scores);
  return round.scores[player] === Math.max(...scores);
};

const isWinningPlayer = (player) => {
  const total = calculateTotal(player);
  return total === Math.max(...players.value.map((p) => calculateTotal(p)));
};

const getPlayerProgress = (player) => {
  const maxTotal = Math.max(...players.value.map((p) => calculateTotal(p)));
  return maxTotal ? calculateTotal(player) / maxTotal : 0;
};

// Game management methods
const confirmNewGame = () => {
  if (players.value.length && rounds.value.length) {
    showNewGameConfirm.value = true;
  } else {
    startNewGame();
  }
};

const startNewGame = () => {
  loading.value = true;
  setTimeout(() => {
    if (players.value.length && rounds.value.length) {
      const finalScores = {};
      players.value.forEach((player) => {
        finalScores[player] = calculateTotal(player);
      });

      gameHistory.value.push({
        id: gameHistory.value.length + 1,
        date: new Date().toISOString(),
        finalScores,
        players: [...players.value],
        rounds: [...rounds.value],
      });
    }

    players.value = [];
    rounds.value = [];
    currentGameStartTime.value = new Date();
    // Add first round automatically if there are players
    if (players.value.length > 0) {
      addRound();
    }
    saveState();
    loading.value = false;
    $q.notify({
      message: "New game started",
      color: "positive",
    });
  }, 500);
};
// Add these to your existing methods
const confirmEndGame = () => {
  $q.dialog({
    title: "End Game",
    message:
      "Are you sure you want to end this game? It will be saved to history.",
    cancel: true,
    persistent: true,
    ok: {
      label: "End Game",
      color: "red-12",
    },
  }).onOk(() => {
    endGame();
  });
};

const endGame = () => {
  loading.value = true;
  setTimeout(() => {
    // Save current game to history
    const finalScores = {};
    const currentPlayers = [...players.value]; // Store current players
    players.value.forEach((player) => {
      finalScores[player] = calculateTotal(player);
    });

    gameHistory.value.unshift({
      id: Date.now(),
      date: new Date().toISOString(),
      finalScores,
      players: [...players.value],
      rounds: [...rounds.value],
      duration: Date.now() - currentGameStartTime.value,
    });

    // Find the winner
    const winner = Object.entries(finalScores).reduce((a, b) =>
      a[1] > b[1] ? a : b,
    );

    // Reset game but keep players
    rounds.value = []; // Clear rounds
    currentGameStartTime.value = new Date(); // Reset start time
    players.value = currentPlayers; // Restore players

    // Add first round for the new game
    addRound();

    saveState();
    loading.value = false;

    // Show success notification with winner
    $q.notify({
      message: `Game ended! ${winner[0]} won with ${winner[1]} points! New game started with same players.`,
      color: "secondary",
      icon: "emoji_events",
      timeout: 3000,
      position: "top",
    });
  }, 500);
};

// Utility methods
const formatDate = (dateStr) => {
  return date.formatDate(dateStr, "MMMM D, YYYY");
};

// State management methods
const saveState = () => {
  localStorage.setItem(
    "rummiState",
    JSON.stringify({
      players: players.value,
      rounds: rounds.value,
      gameHistory: gameHistory.value,
      currentGameStartTime: currentGameStartTime.value,
    }),
  );
};

const loadState = () => {
  try {
    const state = JSON.parse(localStorage.getItem("rummiState"));
    if (state) {
      players.value = state.players || [];
      rounds.value = state.rounds || [];
      gameHistory.value = state.gameHistory || [];
      currentGameStartTime.value = state.currentGameStartTime || new Date();
    }
  } catch (error) {
    console.error("Error loading state:", error);
    $q.notify({
      message: "Error loading saved game",
      color: "negative",
    });
  }
};

// Lifecycle hooks
onMounted(() => {
  loadState();
  if (!currentGameStartTime.value) {
    currentGameStartTime.value = new Date();
  }
  // Initialize history with current state
  saveToHistory();
});

// Load history state on mount
onMounted(() => {
  try {
    const savedHistory = JSON.parse(localStorage.getItem("rummiStateHistory"));
    if (savedHistory) {
      stateHistory.value = savedHistory.states;
      currentStateIndex.value = savedHistory.currentIndex;
    }
  } catch (error) {
    console.error("Error loading history:", error);
  }
});

// Add keyboard shortcuts
onMounted(() => {
  window.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "z") {
      if (e.shiftKey) {
        e.preventDefault();
        redo();
      } else {
        e.preventDefault();
        undo();
      }
    }
  });
});

// Watchers
watch(
  [players, rounds, gameHistory],
  () => {
    saveState();
  },
  { deep: true },
);
// Add these with your other refs
const stateHistory = ref([]);
const currentStateIndex = ref(-1);
const maxHistorySize = 100; // Maximum number of states to keep

// Improved saveToHistory function
const saveToHistory = (action = "") => {
  try {
    // Check if this is a score update or a different action
    const isScoreUpdate = action === "Updated scores";
    const previousState = stateHistory.value[currentStateIndex.value];

    // Don't save if it's just a score update that matches the previous state
    if (isScoreUpdate && previousState) {
      const currentScores = JSON.stringify(rounds.value);
      const previousScores = JSON.stringify(previousState.rounds);
      if (currentScores === previousScores) {
        return;
      }
    }

    // Remove any future states if we're not at the end
    if (currentStateIndex.value < stateHistory.value.length - 1) {
      stateHistory.value = stateHistory.value.slice(
        0,
        currentStateIndex.value + 1,
      );
    }

    // Create deep copy of current state
    const currentState = {
      players: [...players.value],
      rounds: JSON.parse(JSON.stringify(rounds.value)),
      gameHistory: [...gameHistory.value],
      currentGameStartTime: currentGameStartTime.value,
      action,
      timestamp: Date.now(),
    };

    // Add new state
    stateHistory.value.push(currentState);
    currentStateIndex.value++;

    // Limit history size
    if (stateHistory.value.length > maxHistorySize) {
      stateHistory.value.shift();
      currentStateIndex.value--;
    }

    // Save to localStorage
    localStorage.setItem(
      "rummiStateHistory",
      JSON.stringify({
        states: stateHistory.value,
        currentIndex: currentStateIndex.value,
      }),
    );
  } catch (error) {
    console.error("Error saving history:", error);
  }
};

// Improved undo function
// Update the undo function's notification
const undo = () => {
  if (!canUndo.value) return;

  try {
    const currentState = stateHistory.value[currentStateIndex.value];
    currentStateIndex.value--;
    const previousState = stateHistory.value[currentStateIndex.value];

    // Apply previous state
    players.value = [...previousState.players];
    rounds.value = JSON.parse(JSON.stringify(previousState.rounds));
    gameHistory.value = [...previousState.gameHistory];
    currentGameStartTime.value = previousState.currentGameStartTime;

    saveState();

    // Show notification with the action we just undid
    const timeDiff = Date.now() - currentState.timestamp;
    const timeAgo = formatTimeAgo(timeDiff);

    $q.notify({
      message: `Undid: ${currentState.action || "last action"} (${timeAgo})`,
      color: "info",
      icon: "undo",
      timeout: 2000,
      position: "bottom",
    });
  } catch (error) {
    console.error("Error during undo:", error);
    $q.notify({
      message: "Error during undo operation",
      color: "negative",
    });
  }
};

// Update the redo function's notification similarly
const redo = () => {
  if (!canRedo.value) return;

  try {
    currentStateIndex.value++;
    const nextState = stateHistory.value[currentStateIndex.value];

    // Apply next state
    players.value = [...nextState.players];
    rounds.value = JSON.parse(JSON.stringify(nextState.rounds));
    gameHistory.value = [...nextState.gameHistory];
    currentGameStartTime.value = nextState.currentGameStartTime;

    saveState();

    // Show notification with the action we just redid
    const timeDiff = Date.now() - nextState.timestamp;
    const timeAgo = formatTimeAgo(timeDiff);

    $q.notify({
      message: `Redid: ${nextState.action || "next action"} (${timeAgo})`,
      color: "info",
      icon: "redo",
      timeout: 2000,
      position: "bottom",
    });
  } catch (error) {
    console.error("Error during redo:", error);
    $q.notify({
      message: "Error during redo operation",
      color: "negative",
    });
  }
};
// Add these helper methods
const getUndoActionText = () => {
  if (!canUndo.value) return "Nothing to undo";
  // Get the current state instead of previous state
  const currentState = stateHistory.value[currentStateIndex.value];
  const timeDiff = Date.now() - currentState.timestamp;
  const action = currentState.action || "action";
  return `Undo ${action} (${formatTimeAgo(timeDiff)})`;
};

const getRedoActionText = () => {
  if (!canRedo.value) return "Nothing to redo";
  const nextState = stateHistory.value[currentStateIndex.value + 1];
  const timeDiff = Date.now() - nextState.timestamp;
  const action = nextState.action || "action";
  return `Redo ${action} (${formatTimeAgo(timeDiff)})`;
};
const undoTooltip = computed(() => {
  if (!canUndo.value) return "Nothing to undo";
  return getUndoActionText();
});

const redoTooltip = computed(() => {
  if (!canRedo.value) return "Nothing to redo";
  return getRedoActionText();
});

// Helper function to format time differences
const formatTimeAgo = (ms) => {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

watch(
  rounds,
  (newRounds, oldRounds) => {
    if (JSON.stringify(newRounds) !== JSON.stringify(oldRounds)) {
      // Only save if the change wasn't from another action
      if (!stateHistory.value[currentStateIndex.value]?.action) {
        saveToHistory("Updated scores");
      }
    }
  },
  { deep: true },
);

// Computed properties for button states
const canUndo = computed(() => currentStateIndex.value > 0);
const canRedo = computed(
  () => currentStateIndex.value < stateHistory.value.length - 1,
);
// Add these to your refs
const showInfo = ref(false);

// Add these constants for the info dialog
const gameControls = [
  {
    icon: "analytics",
    color: "primary",
    title: "Statistics",
    description: "View current game statistics and player rankings",
  },
  {
    icon: "history",
    color: "primary",
    title: "Game History",
    description: "Access previous games and their results",
  },
  {
    icon: "add",
    color: "primary",
    title: "New Game",
    description: "Start a new game (current game will be archived)",
  },
  {
    icon: "undo",
    color: "primary",
    title: "Undo",
    description: "Undo the last action (Ctrl/Cmd + Z)",
  },
  {
    icon: "redo",
    color: "primary",
    title: "Redo",
    description: "Redo the previously undone action (Ctrl/Cmd + Shift + Z)",
  },
];

const roundActions = [
  {
    icon: "theater_comedy",
    color: "purple",
    title: "Closed with Joker Round",
    description: "Double points for closer, double negative for others",
  },
  {
    icon: "stars",
    color: "amber",
    title: "Round Closer",
    description: "Mark player who closed the round (+50 points)",
  },
  {
    icon: "content_copy",
    color: "teal",
    title: "Got Display Card",
    description: "Mark player who got the display card (+50 points)",
  },
  {
    icon: "close",
    color: "negative",
    title: "Remove Round",
    description: "Delete the current round",
  },
];
</script>

<style scoped>
.header-section {
  background: transparent;
}

.stats-card {
  background: rgb(236, 245, 255);
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.ios-input {
  border-radius: 10px;
  background: #f5f5f5;
}

.ios-input :deep(.q-field__control) {
  height: 44px;
}

.ios-button {
  border-radius: 10px;
  height: 44px;
}

.ios-table {
  border-radius: 16px;
  background: white;
}

.ios-table :deep(.q-table__container) {
  border-radius: 16px;
  overflow: hidden;
}

.ios-table :deep(.q-table thead tr) {
  background: #f8f8f8;
}

.ios-table :deep(.q-table th) {
  font-weight: 500;
  padding: 12px 8px;
}

.ios-table :deep(.q-table td) {
  padding: 8px;
}

.totals-row {
  background: #f8f8f8;
  border-top: 2px solid #eee;
}

.totals-row td {
  font-size: 1.1em;
  padding: 16px 8px !important;
  font-weight: bold;
}

.player-name-edit {
  min-width: 120px;
  text-align: center;
}

.player-name-edit :deep(.q-field__native) {
  text-align: center;
  font-weight: 700;
  color: inherit;
  text-transform: uppercase;
}

.score-input {
  width: 90px;
  margin: 0 auto;
}

.score-input :deep(.q-field__control) {
  background: #f5f5f5;
  border-radius: 8px;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .score-input {
    width: 70px;
  }

  .player-name-edit {
    min-width: 80px;
  }

  .ios-table :deep(.q-table td),
  .ios-table :deep(.q-table th) {
    padding: 6px 4px;
  }
}
/* Add to your existing <style> section */
.round-delete-btn {
  opacity: 0.7;
  transition: opacity 0.2s;
}

.round-delete-btn:hover {
  opacity: 1;
}

/* Make the delete button red on hover */
.round-delete-btn:hover :deep(.q-icon) {
  color: #ff4444;
}
.joker-active {
  background: rgba(156, 39, 176, 0.1);
}

.joker-icon {
  transition: all 0.3s ease;
}

.joker-icon:hover {
  transform: rotate(180deg);
}
.history-dialog {
  background: #f7f7f7;
}

.history-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 2;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.history-content {
  height: calc(100vh - 70px);
  overflow-y: auto;
  padding: 16px !important;
}

.history-item {
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: transform 0.2s ease;
}

.history-item:active {
  transform: scale(0.99);
}

.game-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.score-card {
  background: #f8f8f8;
  border-radius: 12px;
  transition: background-color 0.2s ease;
}

.score-card:active {
  background: #f0f0f0;
}

/* iOS-style momentum scrolling */
.history-content {
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}

/* Hide scrollbar for cleaner look */
.history-content::-webkit-scrollbar {
  display: none;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .history-content {
    padding: 12px !important;
  }

  .history-item {
    border-radius: 12px;
  }

  .score-card {
    border-radius: 10px;
  }
}
.has-display-card-active {
  background: rgba(0, 150, 136, 0.1);
}
.feature-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.05);
}

.feature-description {
  flex: 1;
}
</style>
