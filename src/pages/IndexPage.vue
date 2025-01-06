<template>
  <q-page class="q-pa-md">
    <!-- Header Section with Stats -->
    <div class="header-section q-mb-lg">
      <div class="row items-center justify-between q-pb-md">
        <div>
          <h4 class="text-h4 q-my-none text-weight-medium">
            {{ t("app.title") }}
          </h4>
          <p class="text-subtitle2 text-grey-7" v-if="currentGameStartTime">
            {{
              t("app.subtitle", {
                date: formatDate(currentGameStartTime),
                time: formatTime(currentGameStartTime),
              })
            }}
          </p>
        </div>
        <div class="row q-gutter-sm">
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

          <q-btn-group flat>
            <q-btn
              flat
              :label="currentLanguage"
              icon="language"
              color="primary"
              class="text-weight-medium"
              style="letter-spacing: 0.5px"
            >
              <q-menu
                class="language-menu"
                transition-show="jump-down"
                transition-hide="jump-up"
              >
                <q-list
                  padding
                  class="rounded-borders"
                  style="
                    min-width: 150px;
                    background: rgba(255, 255, 255, 0.95);
                  "
                >
                  <q-item
                    v-for="(lang, index) in languages"
                    :key="index"
                    clickable
                    v-close-popup
                    @click="changeLanguage(lang.code)"
                    :active="currentLanguage === lang.code.toUpperCase()"
                    class="language-item q-py-md"
                  >
                    <q-item-section>
                      <div class="row items-center justify-between">
                        <span class="text-subtitle1">{{ lang.name }}</span>
                        <q-icon
                          v-if="currentLanguage === lang.code.toUpperCase()"
                          name="check"
                          color="primary"
                          size="sm"
                        />
                      </div>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-btn-group>

          <q-btn
            flat
            round
            icon="help_outline"
            @click="showInfo = true"
            color="primary"
          />
        </div>
      </div>

      <!-- Player Management -->
      <div class="player-section q-mb-lg">
        <q-card flat class="bg-white">
          <q-card-section>
            <q-input
              v-model="newPlayer"
              :placeholder="t('players.addPlayer')"
              outlined
              @keyup.enter="addPlayer"
              :rules="[
                (val) => val.trim().length <= 20 || t('players.nameTooLong'),
                (val) =>
                  !players.some(
                    (player) =>
                      player.toUpperCase() === val.trim().toUpperCase(),
                  ) || t('players.playerExists'),
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

      <!-- Quick Stats -->
      <div class="row q-col-gutter-md" v-if="players.length">
        <div
          class="col-12 col-sm-4"
          v-for="(stat, index) in quickStats"
          :key="index"
        >
          <q-card flat class="stats-card">
            <q-card-section>
              <div class="text-subtitle2 text-grey-7">
                {{ t(`stats.${stat.key}`) }}
              </div>
              <div class="text-h5 text-weight-medium q-mt-sm text-uppercase">
                {{ stat.value }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Score Table -->
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
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th class="text-center"></q-th>
              <q-th
                v-for="player in players"
                :key="player"
                class="text-center"
                :class="{ 'bg-primary': isWinningPlayer(player) }"
              >
                <div
                  class="row items-center justify-center q-gutter-x-sm player-name-container"
                >
                  <div class="player-name-wrapper">
                    <template v-if="editingPlayerName !== player">
                      <div
                        :class="{ 'text-white': isWinningPlayer(player) }"
                        class="player-name-display"
                        @click="startEditing(player)"
                      >
                        {{ player }}
                      </div>
                    </template>
                    <q-input
                      v-else
                      v-model="tempPlayerName"
                      dense
                      borderless
                      color="deep-orange-4"
                      class="player-name-edit"
                      :input-class="[
                        'player-name-input',
                        {
                          'text-white':
                            isWinningPlayer(player) &&
                            editingPlayerName !== player,
                        },
                      ]"
                      @blur="handleNameBlur(player)"
                      @keyup.enter="handleNameSubmit(player)"
                      autofocus
                    />
                  </div>
                  <q-btn
                    flat
                    round
                    dense
                    icon="close"
                    size="sm"
                    @click.stop="removePlayer(player)"
                    :class="{ 'text-white': isWinningPlayer(player) }"
                  >
                    <q-tooltip>{{ t("players.removePlayer") }}</q-tooltip>
                  </q-btn>
                </div>
              </q-th>
            </q-tr>
          </template>
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td class="text-center">
                <!-- Round number and actions -->
                <div
                  class="row items-center justify-center no-wrap q-gutter-x-xs"
                >
                  <q-btn
                    flat
                    round
                    dense
                    icon="close"
                    size="sm"
                    @click.stop="confirmRemoveRound(props.row.round)"
                    color="negative"
                  >
                    <q-tooltip>{{ t("game.removeRound") }}</q-tooltip>
                  </q-btn>
                  <div class="text-light text-grey-9">
                    {{ t("game.round") }}
                    <span class="round-number">{{ props.row.round }}</span>
                  </div>
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
                    :color="props.row.closedRoundWithJoker ? 'purple' : 'grey'"
                  >
                    <q-tooltip>
                      {{
                        props.row.closedRoundWithJoker
                          ? t("features.joker.jokerUsed")
                          : t("features.joker.useJoker")
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
                <div class="column items-center q-gutter-y-xs">
                  <!-- Score Input -->
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

                  <!-- Action Buttons -->
                  <div class="row justify-center q-gutter-x-xs">
                    <q-btn
                      flat
                      round
                      dense
                      size="sm"
                      icon="block"
                      :color="
                        isDidNotComeOut(props.row, player) ? 'red' : 'grey'
                      "
                      @click="toggleDidNotComeOut(props.row, player)"
                    >
                      <q-tooltip>
                        {{
                          isDidNotComeOut(props.row, player)
                            ? t("features.didNotComeOut.unmark")
                            : t("features.didNotComeOut.markAs")
                        }}
                      </q-tooltip>
                    </q-btn>
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
                            ? t("features.displayCard.unmark")
                            : t("features.displayCard.markAs")
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
                    >
                      <q-tooltip>
                        {{
                          props.row.closer === player
                            ? t("features.closer.unmark")
                            : t("features.closer.markAs")
                        }}
                      </q-tooltip>
                    </q-btn>
                  </div>
                </div>
              </q-td>
            </q-tr>
          </template>
          <template v-slot:bottom-row>
            <q-tr class="totals-row">
              <q-td class="text-center text-weight-medium">{{
                t("game.total")
              }}</q-td>
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
            :label="t('game.addRound')"
            @click="addRound"
            class="ios-button q-mr-sm"
          />
          <q-btn
            unelevated
            color="red-12"
            icon="done_all"
            :label="t('game.endGame')"
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
      <q-icon :name="t('app.emptyState.icon')" size="4rem" color="grey-4" />
      <div class="text-h6 text-grey-6 q-mt-md text-weight-medium">
        {{ t("app.emptyState.title") }}
      </div>
    </div>

    <!-- Dialogs -->
    <q-dialog v-model="showHistory" maximized>
      <q-card class="history-dialog">
        <q-card-section class="history-header">
          <div class="row items-center justify-between q-px-sm">
            <div class="text-h6 text-weight-medium">
              {{ t("history.title") }}
            </div>
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
                      {{ t("history.players", { count: game.players.length }) }}
                      ·
                      {{ t("history.rounds", { count: game.rounds.length }) }}
                    </div>
                  </div>
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
            <div class="text-h6 text-grey-7 q-mt-md">
              {{ t("history.noHistory") }}
            </div>
            <div class="text-caption text-grey-6 q-mt-sm">
              {{ t("history.noHistoryDesc") }}
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Stats Dialog -->
    <q-dialog v-model="showStats">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ t("stats.title") }}</div>
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
                    {{
                      t("stats.playerProgress", {
                        player,
                        score: calculateTotal(player),
                      })
                    }}
                  </q-badge>
                </div>
              </q-linear-progress>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            :label="t('actions.close')"
            color="primary"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- New Game Confirmation -->
    <q-dialog v-model="showNewGameConfirm">
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ t("game.startNewGame") }}</div>
        </q-card-section>

        <q-card-section>
          {{ t("game.confirmNewGame") }}
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            :label="t('actions.cancel')"
            color="primary"
            v-close-popup
          />
          <q-btn
            flat
            :label="t('actions.confirm')"
            color="positive"
            @click="startNewGame"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Info Dialog -->
    <q-dialog v-model="showInfo">
      <q-card style="min-width: 350px; max-width: 600px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ t("info.title") }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="text-subtitle2 q-mb-md">
            {{ t("info.gameControls") }}
          </div>
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
                  <div class="text-weight-medium">
                    {{ control.title }}
                  </div>
                  <div class="text-caption text-grey-7">
                    {{ control.description }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <q-separator class="q-my-md" />

          <div class="text-subtitle2 q-mb-md">
            {{ t("info.roundActions") }}
          </div>
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
                  <div class="text-weight-medium">
                    {{ action.title }}
                  </div>
                  <div class="text-caption text-grey-7">
                    {{ action.description }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            :label="t('actions.gotIt')"
            color="primary"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <div class="powered-by-footer q-pa-sm text-center q-pb-md">
      <span class="text-grey-7 text-caption">
        Powered by
        <a
          href="https://vidmardata.se"
          target="_blank"
          rel="noopener noreferrer"
          class="text-primary text-weight-medium"
        >
          Vidmar Data Integration
        </a>
      </span>
    </div>
  </q-page>
</template>
<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { date, useQuasar, Notify } from "quasar";
import { useI18n } from "vue-i18n";

Notify.setDefaults({
  position: "top",
});

const { t, locale } = useI18n();
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
const editingPlayerName = ref(null);
const tempPlayerName = ref("");
const stateHistory = ref([]);
const currentStateIndex = ref(-1);
const maxHistorySize = 100;

const currentLanguage = computed(() =>
  locale.value.substring(0, 2).toUpperCase(),
);
const languages = [
  { code: "sv-SE", name: "Svenska" },
  { code: "no-NO", name: "Norsk" },
  { code: "en-US", name: "English" },
];

const changeLanguage = (lang) => {
  locale.value = lang;
  localStorage.setItem("preferredLanguage", lang);
  $q.notify({
    message: t("language.changed"),
    color: "positive",
    icon: "language",
  });
};

const tableColumns = computed(() => {
  const columns = [
    {
      name: "round",
      label: t("game.round"),
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

// Computed properties for stats
const quickStats = computed(() => [
  {
    key: "currentLeader",
    value: currentLeader.value,
  },
  {
    key: "highestRoundScore",
    value:
      highestScoreWithPlayer.value.score === 0
        ? t("stats.noScores")
        : `${highestScoreWithPlayer.value.player} (${highestScoreWithPlayer.value.score})`,
  },
  {
    key: "totalRounds",
    value: rounds.value.length,
  },
]);

const currentLeader = computed(() => {
  if (!players.value.length) return t("stats.noPlayers");
  const totals = players.value.map((player) => ({
    player,
    total: calculateTotal(player),
  }));
  const leader = totals.reduce((a, b) => (a.total > b.total ? a : b));
  return `${leader.player} (${leader.total})`;
});

const highestScoreWithPlayer = computed(() => {
  if (!rounds.value.length) return { score: 0, player: t("stats.noPlayers") };

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
const isWinningPlayer = (player) => {
  if (!players.value.length) return false;

  const playerTotal = calculateTotal(player);
  const highestScore = players.value.reduce((highest, currentPlayer) => {
    const currentScore = calculateTotal(currentPlayer);
    return currentScore > highest ? currentScore : highest;
  }, -Infinity);

  return playerTotal === highestScore && playerTotal !== 0;
};
const isHighestInRound = (round, player) => {
  if (!round || !round.scores) return false;

  const playerScore = round.scores[player];
  const highestScore = Math.max(...Object.values(round.scores));

  return playerScore === highestScore && playerScore > 0;
};

// Player management methods
const addPlayer = () => {
  const trimmedName = newPlayer.value.trim();

  if (!trimmedName) {
    $q.notify({
      message: t("players.invalidName"),
      color: "warning",
    });
    return;
  }

  const capitalizedName = trimmedName.toUpperCase();

  if (
    players.value.some((player) => player.toUpperCase() === capitalizedName)
  ) {
    $q.notify({
      message: t("players.playerExists"),
      color: "warning",
    });
    return;
  }

  if (trimmedName.length > 20) {
    $q.notify({
      message: t("players.nameTooLong"),
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
  saveToHistory(t("players.playerAdded", { player: capitalizedName }));
  $q.notify({
    message: t("players.playerAdded"),
    color: "positive",
  });
};

const startEditing = (player) => {
  editingPlayerName.value = player;
  tempPlayerName.value = player;
};

const handleNameBlur = (player) => {
  if (editingPlayerName.value === player) {
    editingPlayerName.value = null;
    tempPlayerName.value = "";
  }
};

const handleNameSubmit = (oldName) => {
  const newName = tempPlayerName.value.trim();

  if (!newName) {
    $q.notify({
      message: t("players.invalidName"),
      color: "warning",
    });
    return;
  }

  if (newName.length > 20) {
    $q.notify({
      message: t("players.nameTooLong"),
      color: "warning",
    });
    return;
  }

  // Check if name already exists (excluding the current player)
  if (
    players.value.some(
      (player) =>
        player !== oldName && player.toUpperCase() === newName.toUpperCase(),
    )
  ) {
    $q.notify({
      message: t("players.playerExists"),
      color: "warning",
    });
    return;
  }

  // If the name is different, update it
  if (newName.toUpperCase() !== oldName.toUpperCase()) {
    updatePlayerName(oldName, newName.toUpperCase());
  }

  // Reset editing state
  editingPlayerName.value = null;
  tempPlayerName.value = "";
};

const updatePlayerName = (oldName, newName) => {
  // Update player name in rounds
  rounds.value.forEach((round) => {
    if (round.scores[oldName] !== undefined) {
      round.scores[newName] = round.scores[oldName];
      delete round.scores[oldName];
    }

    if (round.closer === oldName) {
      round.closer = newName;
    }

    if (round.hasDisplayCard === oldName) {
      round.hasDisplayCard = newName;
    }

    if (round.didNotComeOut) {
      const index = round.didNotComeOut.indexOf(oldName);
      if (index !== -1) {
        round.didNotComeOut[index] = newName;
      }
    }
  });

  const playerIndex = players.value.indexOf(oldName);
  if (playerIndex !== -1) {
    players.value[playerIndex] = newName;
  }

  saveState();
  saveToHistory(
    t("players.nameUpdated", {
      oldName,
      newName,
    }),
  );

  $q.notify({
    message: t("players.nameUpdated", {
      oldName,
      newName,
    }),
    color: "positive",
    icon: "edit",
    timeout: 2000,
  });
};
const toggleJoker = (round) => {
  if (!round.closer) {
    $q.notify({
      message: t("features.joker.needCloser"),
      color: "warning",
    });
    return;
  }

  if (round.closedRoundWithJoker) {
    if (round.originalScores) {
      Object.keys(round.scores).forEach((player) => {
        round.scores[player] = round.originalScores[player];
      });
    }
    round.closedRoundWithJoker = false;
  } else {
    round.originalScores = { ...round.scores };
    Object.keys(round.scores).forEach((player) => {
      const currentScore = round.scores[player];
      if (player === round.closer) {
        round.scores[player] = currentScore * 2;
      } else {
        round.scores[player] = Math.abs(currentScore) * -2;
      }
    });

    round.closedRoundWithJoker = true;

    $q.notify({
      message: t("features.joker.applied"),
      color: "purple",
      icon: "casino",
    });
  }
  saveState();
  saveToHistory(
    round.closedRoundWithJoker
      ? t("features.joker.jokerUsed")
      : t("features.joker.useJoker"),
  );
};
const removePlayer = (player) => {
  if (players.value.length <= 1) {
    $q.dialog({
      title: t("players.resetGame"),
      message: t("players.resetGameConfirm"),
      cancel: true,
      persistent: true,
    }).onOk(() => {
      players.value = players.value.filter((p) => p !== player);
      rounds.value.forEach((round) => {
        delete round.scores[player];
      });
      saveState();
      saveToHistory(t("players.playerRemoved", { player }));
    });
    return;
  }

  $q.dialog({
    title: t("players.removePlayer"),
    message: t("players.confirmRemove", { player }),
    cancel: true,
    persistent: true,
  }).onOk(() => {
    players.value = players.value.filter((p) => p !== player);
    rounds.value.forEach((round) => {
      delete round.scores[player];
    });
    saveState();
    $q.notify({
      message: t("players.playerRemoved"),
      color: "warning",
    });
  });
};
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
    didNotComeOut: [],
  });
  saveState();
  saveToHistory(t("game.addRound"));
};

const isDidNotComeOut = (round, player) => {
  return round.didNotComeOut?.includes(player) || false;
};

const toggleDidNotComeOut = (round, player) => {
  if (!round.didNotComeOut) {
    round.didNotComeOut = [];
  }

  const hasDisplayCard = round.hasDisplayCard === player;
  const displayCardBonus = hasDisplayCard ? 50 : 0;

  if (isDidNotComeOut(round, player)) {
    // Undo: Remove player from didNotComeOut and set score to 0 (or 50 if has display card)
    round.didNotComeOut = round.didNotComeOut.filter((p) => p !== player);
    round.scores[player] = displayCardBonus;

    saveState();
    $q.notify({
      message: t("features.didNotComeOut.unmarked", { player }),
      color: "warning",
      icon: "block",
    });
  } else {
    // Mark as did not come out: Set score to -200 (or -150 if has display card)
    round.didNotComeOut.push(player);
    round.scores[player] = -200 + displayCardBonus;

    saveState();
    $q.notify({
      message: t("features.didNotComeOut.marked", { player }),
      color: "negative",
      icon: "block",
    });
  }
};
const toggleHasDisplayCard = (round, player) => {
  const currentScore = round.scores[player] || 0;
  const pointAdjustment = 50;

  if (round.hasDisplayCard === player) {
    round.scores[player] -= pointAdjustment;
    round.hasDisplayCard = null;

    saveState();
    $q.notify({
      message: t("features.displayCard.cardUnmarked", { player }),
      color: "warning",
      icon: "playing_cards",
    });
    return;
  }

  if (round.hasDisplayCard) {
    $q.notify({
      message: t("features.displayCard.alreadyHas", {
        player: round.hasDisplayCard,
      }),
      color: "warning",
      icon: "warning",
    });
    return;
  }

  round.scores[player] += pointAdjustment;
  round.hasDisplayCard = player;

  saveState();
  $q.notify({
    message: t("features.displayCard.cardMarked", { player }),
    color: "positive",
    icon: "playing_cards",
  });
};

const toggleCloser = (round, player) => {
  if (round.closer === player) {
    round.scores[player] -= 50;
    round.closer = null;

    saveState();
    saveToHistory(t("features.closer.closerUnmarked", { player }));

    $q.notify({
      message: t("features.closer.closerUnmarked", { player }),
      color: "warning",
      icon: "star_outline",
    });
    return;
  }

  if (round.closer) {
    $q.notify({
      message: t("features.closer.alreadyCloser", { player: round.closer }),
      color: "warning",
      icon: "warning",
    });
    return;
  }

  round.scores[player] += 50;
  round.closer = player;

  saveState();
  saveToHistory(t("features.closer.closerMarked", { player }));

  $q.notify({
    message: t("features.closer.closerMarked", { player }),
    color: "positive",
    icon: "stars",
  });
};

const confirmRemoveRound = (roundNum) => {
  $q.dialog({
    title: t("game.removeRound"),
    message: t("game.confirmRemoveRound", { round: roundNum }),
    cancel: true,
    persistent: true,
  }).onOk(() => {
    removeRound(roundNum);
    $q.notify({
      message: t("game.roundRemoved"),
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
  saveToHistory(t("game.roundRemoved"));
};

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
    if (players.value.length > 0) {
      addRound();
    }
    saveState();
    loading.value = false;
    $q.notify({
      message: t("game.gameStarted"),
      color: "positive",
    });
  }, 500);
};

const confirmEndGame = () => {
  $q.dialog({
    title: t("game.endGame"),
    message: t("game.confirmEndGame"),
    cancel: true,
    persistent: true,
    ok: {
      label: t("game.endGame"),
      color: "red-12",
    },
  }).onOk(() => {
    endGame();
  });
};

const endGame = () => {
  loading.value = true;
  setTimeout(() => {
    const finalScores = {};
    const currentPlayers = [...players.value];
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

    const winner = Object.entries(finalScores).reduce((a, b) =>
      a[1] > b[1] ? a : b,
    );

    rounds.value = [];
    currentGameStartTime.value = new Date();
    players.value = currentPlayers;

    addRound();

    saveState();
    loading.value = false;

    $q.notify({
      message: t("game.gameEnded", {
        winner: winner[0],
        points: winner[1],
      }),
      color: "secondary",
      icon: "emoji_events",
      timeout: 3000,
      position: "top",
    });
  }, 500);
};

// Helper functions for timestamps
const getCurrentStateTimestamp = () => {
  if (
    currentStateIndex.value >= 0 &&
    currentStateIndex.value < stateHistory.value.length
  ) {
    return stateHistory.value[currentStateIndex.value].timestamp;
  }
  return Date.now();
};

const getNextStateTimestamp = () => {
  if (currentStateIndex.value + 1 < stateHistory.value.length) {
    return stateHistory.value[currentStateIndex.value + 1].timestamp;
  }
  return Date.now();
};

const formatDate = (dateStr) => {
  return date.formatDate(dateStr, "MMMM D, YYYY");
};

const formatTime = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "numeric",
  });
};

const formatTimeAgo = (timestamp) => {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);

  if (seconds < 60) return t("time.justNow");
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return t("time.minutesAgo", { minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("time.hoursAgo", { hours });
  return t("time.daysAgo", { days: Math.floor(hours / 24) });
};

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
      message: t("errors.loadingState"),
      color: "negative",
    });
  }
};

const saveToHistory = (action = "") => {
  try {
    const isScoreUpdate = action === t("actions.updateScores");
    const previousState = stateHistory.value[currentStateIndex.value];

    if (isScoreUpdate && previousState) {
      const currentScores = JSON.stringify(rounds.value);
      const previousScores = JSON.stringify(previousState.rounds);
      if (currentScores === previousScores) {
        return;
      }
    }

    if (currentStateIndex.value < stateHistory.value.length - 1) {
      stateHistory.value = stateHistory.value.slice(
        0,
        currentStateIndex.value + 1,
      );
    }

    const currentState = {
      players: [...players.value],
      rounds: JSON.parse(JSON.stringify(rounds.value)),
      gameHistory: [...gameHistory.value],
      currentGameStartTime: currentGameStartTime.value,
      action,
      timestamp: Date.now(), // Ensure timestamp is always set
    };

    stateHistory.value.push(currentState);
    currentStateIndex.value++;

    if (stateHistory.value.length > maxHistorySize) {
      stateHistory.value.shift();
      currentStateIndex.value--;
    }

    localStorage.setItem(
      "rummiStateHistory",
      JSON.stringify({
        states: stateHistory.value,
        currentIndex: currentStateIndex.value,
      }),
    );
  } catch (error) {
    console.error("Error saving history:", error);
    $q.notify({
      message: t("errors.savingHistory"),
      color: "negative",
    });
  }
};
const undo = () => {
  if (!canUndo.value) return;

  try {
    const currentState = stateHistory.value[currentStateIndex.value];
    currentStateIndex.value--;
    const previousState = stateHistory.value[currentStateIndex.value];

    players.value = [...previousState.players];
    rounds.value = JSON.parse(JSON.stringify(previousState.rounds));
    gameHistory.value = [...previousState.gameHistory];
    currentGameStartTime.value = previousState.currentGameStartTime;

    saveState();

    $q.notify({
      message: t("actions.undoAction", {
        action: currentState.action || t("actions.lastAction"),
        time: formatTimeAgo(currentState.timestamp),
      }),
      color: "info",
      icon: "undo",
      timeout: 2000,
      position: "bottom",
    });
  } catch (error) {
    console.error("Error during undo:", error);
    $q.notify({
      message: t("errors.undoOperation"),
      color: "negative",
    });
  }
};

// Update the redo function notification
const redo = () => {
  if (!canRedo.value) return;

  try {
    currentStateIndex.value++;
    const nextState = stateHistory.value[currentStateIndex.value];

    players.value = [...nextState.players];
    rounds.value = JSON.parse(JSON.stringify(nextState.rounds));
    gameHistory.value = [...nextState.gameHistory];
    currentGameStartTime.value = nextState.currentGameStartTime;

    saveState();

    $q.notify({
      message: t("actions.redoAction", {
        action: nextState.action || t("actions.nextAction"),
        time: formatTimeAgo(nextState.timestamp),
      }),
      color: "info",
      icon: "redo",
      timeout: 2000,
      position: "bottom",
    });
  } catch (error) {
    console.error("Error during redo:", error);
    $q.notify({
      message: t("errors.redoOperation"),
      color: "negative",
    });
  }
};

const getUndoActionText = () => {
  if (!canUndo.value) return t("actions.nothingToUndo");
  const currentState = stateHistory.value[currentStateIndex.value];
  return currentState.action || t("actions.lastAction");
};

const getRedoActionText = () => {
  if (!canRedo.value) return t("actions.nothingToRedo");
  const nextState = stateHistory.value[currentStateIndex.value + 1];
  return nextState.action || t("actions.nextAction");
};

const undoTooltip = computed(() => {
  if (!canUndo.value) return t("actions.nothingToUndo");
  const timestamp = getCurrentStateTimestamp();
  return t("actions.undoAction", {
    action: getUndoActionText(),
    time: formatTimeAgo(timestamp),
  });
});

const redoTooltip = computed(() => {
  if (!canRedo.value) return t("actions.nothingToRedo");
  const timestamp = getNextStateTimestamp();
  return t("actions.redoAction", {
    action: getRedoActionText(),
    time: formatTimeAgo(timestamp),
  });
});

// Game controls info

const gameControls = computed(() => [
  {
    icon: "history",
    color: "primary",
    title: t("info.controls.gameHistory.title"),
    description: t("info.controls.gameHistory.description"),
  },
  {
    icon: "add",
    color: "primary",
    title: t("info.controls.newGame.title"),
    description: t("info.controls.newGame.description"),
  },
  {
    icon: "undo",
    color: "primary",
    title: t("info.controls.undo.title"),
    description: t("info.controls.undo.description"),
  },
  {
    icon: "redo",
    color: "primary",
    title: t("info.controls.redo.title"),
    description: t("info.controls.redo.description"),
  },
  {
    icon: "language",
    color: "primary",
    title: t("info.controls.language.title"),
    description: t("info.controls.language.description"),
  },
]);

const roundActions = computed(() => [
  {
    icon: "close",
    color: "negative",
    title: t("info.actions.removeRound.title"),
    description: t("info.actions.removeRound.description"),
  },
  {
    icon: "theater_comedy",
    color: "purple",
    title: t("info.actions.joker.title"),
    description: t("info.actions.joker.description"),
  },
  {
    icon: "block",
    color: "red",
    title: t("info.actions.didNotComeOut.title"),
    description: t("info.actions.didNotComeOut.description"),
  },
  {
    icon: "content_copy",
    color: "teal",
    title: t("info.actions.displayCard.title"),
    description: t("info.actions.displayCard.description"),
  },
  {
    icon: "stars",
    color: "amber",
    title: t("info.actions.closer.title"),
    description: t("info.actions.closer.description"),
  },
]);

// Watchers and lifecycle hooks
watch(
  [players, rounds, gameHistory],
  () => {
    saveState();
  },
  { deep: true },
);

watch(
  rounds,
  (newRounds, oldRounds) => {
    if (JSON.stringify(newRounds) !== JSON.stringify(oldRounds)) {
      if (!stateHistory.value[currentStateIndex.value]?.action) {
        saveToHistory(t("actions.updateScores"));
      }
    }
  },
  { deep: true },
);

onMounted(() => {
  loadState();
  if (!currentGameStartTime.value) {
    currentGameStartTime.value = new Date();
  }
  saveToHistory();
  const savedLanguage = localStorage.getItem("preferredLanguage") || "sv";
  locale.value = savedLanguage;
});

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

// Computed properties for button states
const canUndo = computed(() => currentStateIndex.value > 0);
const canRedo = computed(
  () => currentStateIndex.value < stateHistory.value.length - 1,
);
const showInfo = ref(false);
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

.ios-button {
  border-radius: 10px;
  height: 44px;
}

.ios-table {
  border-radius: 16px;
  background: white;
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
  width: 70px;
  margin: 0;
}

.score-input :deep(.q-field__control) {
  height: 32px;
  padding: 0 !important;
}

.score-input :deep(.q-field__native) {
  font-size: 0.9em;
  text-align: center;
}

.q-btn.q-btn--dense {
  min-height: 24px;
  width: 24px;
}

@media (max-width: 600px) {
  .score-input {
    width: 60px;
  }

  .q-btn.q-btn--dense {
    padding: 0 2px;
    min-height: 20px;
    width: 20px;
  }

  .q-btn.q-btn--dense .q-icon {
    font-size: 16px;
  }
}

.ios-table :deep(.q-table td),
.ios-table :deep(.q-table th) {
  padding: 8px 4px;
}

.row.no-wrap {
  flex-wrap: nowrap !important;
}

.q-gutter-x-xs > * {
  margin-left: 2px !important;
  margin-right: 2px !important;
}
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
.round-delete-btn {
  opacity: 0.7;
  transition: opacity 0.2s;
}

.round-delete-btn:hover {
  opacity: 1;
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

.history-content {
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}

.history-content::-webkit-scrollbar {
  display: none;
}

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
.language-menu {
  border-radius: 13px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.language-item {
  min-height: 40px;

  &:hover {
    background: rgba(0, 0, 0, 0.03);
  }

  &.q-item--active {
    background: transparent;
    color: inherit;
  }
}
.player-name-container {
  padding: 4px;
}

.player-name-wrapper {
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.player-name-display {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
  font-weight: 500;
  cursor: pointer;
}

.player-name-edit {
  height: 100%;
}

.player-name-edit :deep(.q-field__native) {
  text-align: center;
  font-weight: 500;
  color: inherit;
  text-transform: uppercase;
  height: 32px;
}

.player-name-edit :deep(.q-field__control) {
  height: 32px;
}

/* Remove default input styling */
.player-name-edit :deep(.q-field__control:before),
.player-name-edit :deep(.q-field__control:after) {
  display: none;
}
.powered-by-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  z-index: 1000;
}

.powered-by-footer a {
  text-decoration: none;
  transition: color 0.2s ease;
}

.powered-by-footer a:hover {
  color: var(--q-primary-darkened);
}

.q-page {
  padding-bottom: 50px !important;
}
</style>
