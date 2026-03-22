// ============================================================
// March Madness Bracket App
// ============================================================

const STORAGE_KEY = 'march_madness_brackets';
const ACTUAL_KEY = 'march_madness_actual';

let state = {
  brackets: {},       // { id: { name, picks, createdAt } }
  actual: null,       // { picks }  — the "truth" bracket
  currentBracket: null,
  currentView: 'bracket', // 'bracket' | 'leaderboard'
};

// ---- Bootstrap ----
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  renderNav();
  renderToolbar();
  renderBracketView();
  renderLeaderboard();
  showView(state.currentView);
});

// ---- Persistence ----
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state.brackets = JSON.parse(raw);
    const actual = localStorage.getItem(ACTUAL_KEY);
    if (actual) state.actual = JSON.parse(actual);
  } catch (e) {
    console.error('Failed to load state', e);
  }

  // Select first bracket if available
  const ids = Object.keys(state.brackets);
  if (ids.length > 0) state.currentBracket = ids[0];
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.brackets));
  if (state.actual) localStorage.setItem(ACTUAL_KEY, JSON.stringify(state.actual));
}

// ---- Navigation ----
function renderNav() {
  document.getElementById('nav-bracket').addEventListener('click', () => showView('bracket'));
  document.getElementById('nav-leaderboard').addEventListener('click', () => showView('leaderboard'));
}

function showView(view) {
  state.currentView = view;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(`view-${view}`).classList.add('active');
  document.querySelectorAll('.nav-tabs button').forEach(b => b.classList.remove('active'));
  document.getElementById(`nav-${view}`).classList.add('active');

  if (view === 'leaderboard') renderLeaderboard();
  if (view === 'bracket') refreshBracketView();
}

// ---- Toolbar ----
function renderToolbar() {
  const sel = document.getElementById('bracket-select');
  const newBtn = document.getElementById('btn-new');
  const delBtn = document.getElementById('btn-delete');
  const actualBtn = document.getElementById('btn-actual');
  const resetBtn = document.getElementById('btn-reset');

  // Populate selector
  populateBracketSelect();

  sel.addEventListener('change', () => {
    const val = sel.value;
    if (val === '__actual__') {
      state.currentBracket = '__actual__';
    } else {
      state.currentBracket = val || null;
    }
    refreshBracketView();
  });

  newBtn.addEventListener('click', showNewBracketModal);
  delBtn.addEventListener('click', deleteCurrentBracket);
  actualBtn.addEventListener('click', () => {
    if (!state.actual) {
      state.actual = { picks: {} };
      saveState();
    }
    state.currentBracket = '__actual__';
    populateBracketSelect();
    refreshBracketView();
  });
  resetBtn.addEventListener('click', resetCurrentBracket);
}

function populateBracketSelect() {
  const sel = document.getElementById('bracket-select');
  sel.innerHTML = '';

  if (Object.keys(state.brackets).length === 0 && !state.actual) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'No brackets — create one!';
    sel.appendChild(opt);
    return;
  }

  for (const [id, b] of Object.entries(state.brackets)) {
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = b.name;
    if (id === state.currentBracket) opt.selected = true;
    sel.appendChild(opt);
  }

  if (state.actual) {
    const opt = document.createElement('option');
    opt.value = '__actual__';
    opt.textContent = '📊 Actual Results';
    if (state.currentBracket === '__actual__') opt.selected = true;
    sel.appendChild(opt);
  }
}

// ---- Modal ----
function showNewBracketModal() {
  const overlay = document.getElementById('modal-overlay');
  const input = document.getElementById('modal-input');
  overlay.classList.add('active');
  input.value = '';
  input.focus();

  document.getElementById('modal-create').onclick = () => {
    const name = input.value.trim();
    if (!name) return;
    createBracket(name);
    overlay.classList.remove('active');
  };
  document.getElementById('modal-cancel').onclick = () => {
    overlay.classList.remove('active');
  };
  input.onkeydown = (e) => {
    if (e.key === 'Enter') document.getElementById('modal-create').click();
    if (e.key === 'Escape') overlay.classList.remove('active');
  };
}

function createBracket(name) {
  const id = 'b_' + Date.now();
  state.brackets[id] = { name, picks: {}, createdAt: new Date().toISOString() };
  state.currentBracket = id;
  saveState();
  populateBracketSelect();
  refreshBracketView();
  toast(`Bracket "${name}" created!`);
}

function deleteCurrentBracket() {
  if (!state.currentBracket) return;
  if (state.currentBracket === '__actual__') {
    if (!confirm('Delete actual results? This cannot be undone.')) return;
    state.actual = null;
    localStorage.removeItem(ACTUAL_KEY);
    state.currentBracket = Object.keys(state.brackets)[0] || null;
  } else {
    const b = state.brackets[state.currentBracket];
    if (!b) return;
    if (!confirm(`Delete bracket "${b.name}"?`)) return;
    delete state.brackets[state.currentBracket];
    const ids = Object.keys(state.brackets);
    state.currentBracket = ids.length > 0 ? ids[0] : null;
  }
  saveState();
  populateBracketSelect();
  refreshBracketView();
}

function resetCurrentBracket() {
  if (!state.currentBracket) return;
  const isActual = state.currentBracket === '__actual__';
  const target = isActual ? state.actual : state.brackets[state.currentBracket];
  if (!target) return;
  if (!confirm(`Reset all picks in ${isActual ? 'Actual Results' : '"' + target.name + '"'}?`)) return;
  target.picks = {};
  saveState();
  refreshBracketView();
  toast('Bracket reset!');
}

// ---- Build Initial Matchup Keys ----
// Each game is identified by a key: region_round_game
// e.g., "South_0_0" = South region, round 0 (R64), game 0

function getInitialTeams(region) {
  return TOURNAMENT_TEAMS[region]; // 16 teams in seed-order matchup pairs
}

function getGameKey(region, round, game) {
  return `${region}_${round}_${game}`;
}

// For Final Four: use "FF_4_0", "FF_4_1" (semifinals), "FF_5_0" (final)
function getFFKey(round, game) {
  return `FF_${round}_${game}`;
}

// Determine what team is in a slot (recursively)
function getTeamInSlot(picks, region, round, slot) {
  if (round === 0) {
    // Round of 64 — the slot maps directly to the team list
    const teams = getInitialTeams(region);
    return teams[slot] || null;
  }
  // This slot was filled by a pick from the previous round
  const key = getGameKey(region, round - 1, slot);
  const picked = picks[key];
  if (!picked) return null;
  return picked;
}

function getFFTeamInSlot(picks, round, slot) {
  if (round === 4) {
    // Final Four slots: region winners
    // slot 0: South vs West winner (South=top, West=bottom of left semifinal)
    // slot 1: East vs Midwest
    const regionMap = [
      ['South', 'West'],
      ['East', 'Midwest'],
    ];
    const pair = regionMap[Math.floor(slot / 2)];
    const regionIdx = slot % 2;
    const region = pair[regionIdx];
    // Region winner is the winner of that region's last round (round 3, game 0)
    const key = getGameKey(region, 3, 0);
    return picks[key] || null;
  }
  // Championship slot — winner of a Final Four semifinal
  const key = getFFKey(round - 1, slot);
  return picks[key] || null;
}

// ---- Cascade: clear downstream picks when a pick changes ----
function clearDownstream(picks, region, round, game) {
  const gamesPerRound = [8, 4, 2, 1];
  // Clear picks in subsequent rounds that depended on this game's winner
  const currentWinner = picks[getGameKey(region, round, game)];
  if (!currentWinner) return;

  for (let r = round + 1; r < 4; r++) {
    for (let g = 0; g < gamesPerRound[r]; g++) {
      const key = getGameKey(region, r, g);
      if (picks[key] && picks[key].name === currentWinner.name) {
        delete picks[key];
        clearDownstreamFF(picks, currentWinner);
      }
    }
  }

  // Also check Final Four / Championship
  clearDownstreamFF(picks, currentWinner);
}

function clearDownstreamFF(picks, team) {
  if (!team) return;
  for (let g = 0; g < 2; g++) {
    const key = getFFKey(4, g);
    if (picks[key] && picks[key].name === team.name) {
      delete picks[key];
      // Also clear championship if it had this team
      const champKey = getFFKey(5, 0);
      if (picks[champKey] && picks[champKey].name === team.name) {
        delete picks[champKey];
      }
    }
  }
  const champKey = getFFKey(5, 0);
  if (picks[champKey] && picks[champKey].name === team.name) {
    delete picks[champKey];
  }
}

// ---- Render Bracket ----
function refreshBracketView() {
  renderBracketView();
}

function renderBracketView() {
  const container = document.getElementById('view-bracket');
  const bracketArea = document.getElementById('bracket-area');
  if (!bracketArea) return;
  bracketArea.innerHTML = '';

  if (!state.currentBracket) {
    bracketArea.innerHTML = '<div class="no-results-msg">Create a bracket to get started!</div>';
    updateScoreDisplay(null);
    return;
  }

  const isActual = state.currentBracket === '__actual__';
  const bracket = isActual ? state.actual : state.brackets[state.currentBracket];
  if (!bracket) {
    bracketArea.innerHTML = '<div class="no-results-msg">Bracket not found.</div>';
    return;
  }

  const picks = bracket.picks;
  const editable = true; // All brackets are editable
  const actualPicks = state.actual ? state.actual.picks : null;
  const showGrading = !isActual && actualPicks;

  // Build full bracket layout
  const fullBracket = document.createElement('div');
  fullBracket.className = 'full-bracket';

  // Left side: South (top-left), East (bottom-left)
  const leftRegions = ['South', 'East'];
  // Right side: West (top-right), Midwest (bottom-right)
  const rightRegions = ['West', 'Midwest'];

  leftRegions.forEach((region, i) => {
    const rb = buildRegionBracket(region, picks, editable, false, showGrading, actualPicks);
    rb.style.gridColumn = '1';
    rb.style.gridRow = String(i + 1);
    fullBracket.appendChild(rb);
  });

  rightRegions.forEach((region, i) => {
    const rb = buildRegionBracket(region, picks, editable, true, showGrading, actualPicks);
    rb.style.gridColumn = '3';
    rb.style.gridRow = String(i + 1);
    fullBracket.appendChild(rb);
  });

  // Center column: Final Four + Championship
  const center = document.createElement('div');
  center.className = 'center-column';
  center.appendChild(buildFinalFour(picks, editable, showGrading, actualPicks));
  fullBracket.appendChild(center);

  bracketArea.appendChild(fullBracket);

  // Update score
  if (showGrading) {
    const score = calculateScore(picks, actualPicks);
    updateScoreDisplay(score);
  } else {
    updateScoreDisplay(null);
  }
}

function buildRegionBracket(region, picks, editable, reversed, showGrading, actualPicks) {
  const wrapper = document.createElement('div');
  wrapper.className = `region-bracket${reversed ? ' right' : ''}`;

  const label = document.createElement('div');
  label.className = 'region-label';
  label.textContent = region;
  wrapper.appendChild(label);

  const bracket = document.createElement('div');
  bracket.className = 'bracket';

  // 4 rounds within each region (R64=8 games, R32=4, S16=2, E8=1)
  const gamesPerRound = [8, 4, 2, 1];
  const roundNames = ['R64', 'R32', 'S16', 'E8'];
  const roundPoints = [10, 20, 40, 80];

  for (let r = 0; r < 4; r++) {
    const round = document.createElement('div');
    round.className = 'round';

    const rh = document.createElement('div');
    rh.className = 'round-header';
    rh.textContent = roundNames[r];
    round.appendChild(rh);

    const rp = document.createElement('div');
    rp.className = 'round-points';
    rp.textContent = `${roundPoints[r]} pts`;
    round.appendChild(rp);

    for (let g = 0; g < gamesPerRound[r]; g++) {
      const matchup = document.createElement('div');
      matchup.className = 'matchup';

      // Two team slots
      for (let s = 0; s < 2; s++) {
        const slotIdx = g * 2 + s;
        const team = getTeamInSlot(picks, region, r, slotIdx);
        const slot = createTeamSlot(team, () => {
          if (!editable || !team) return;
          const key = getGameKey(region, r, g);
          // Clear downstream if changing pick
          if (picks[key] && picks[key].name !== team.name) {
            clearDownstream(picks, region, r, g);
          }
          picks[key] = { ...team };
          saveState();
          refreshBracketView();
        });

        // Check if this team is the current pick for this game
        const key = getGameKey(region, r, g);
        const currentPick = picks[key];
        if (currentPick && team && currentPick.name === team.name) {
          slot.classList.add('winner');
        }

        // Grading
        if (showGrading && currentPick && team && currentPick.name === team.name) {
          const actualPick = actualPicks[key];
          if (actualPick) {
            if (actualPick.name === currentPick.name) {
              slot.classList.add('correct');
            } else {
              slot.classList.add('incorrect');
            }
          }
        }

        if (!editable) slot.classList.add('locked');
        matchup.appendChild(slot);
      }

      round.appendChild(matchup);
    }

    bracket.appendChild(round);
  }

  wrapper.appendChild(bracket);
  return wrapper;
}

function buildFinalFour(picks, editable, showGrading, actualPicks) {
  const container = document.createElement('div');
  container.className = 'final-four-section';

  // Final Four header
  const ffLabel = document.createElement('div');
  ffLabel.className = 'region-label';
  ffLabel.textContent = 'Final Four';
  container.appendChild(ffLabel);

  // Two semifinal matchups
  const semis = document.createElement('div');
  semis.style.display = 'flex';
  semis.style.flexDirection = 'column';
  semis.style.gap = '12px';
  semis.style.minWidth = '180px';

  for (let g = 0; g < 2; g++) {
    const matchup = document.createElement('div');
    matchup.className = 'matchup';

    for (let s = 0; s < 2; s++) {
      const slotIdx = g * 2 + s;
      const team = getFFTeamInSlot(picks, 4, slotIdx);
      const slot = createTeamSlot(team, () => {
        if (!editable || !team) return;
        const key = getFFKey(4, g);
        // Clear championship if changing FF pick
        if (picks[key] && picks[key].name !== team.name) {
          const champKey = getFFKey(5, 0);
          if (picks[champKey] && picks[champKey].name === picks[key].name) {
            delete picks[champKey];
          }
        }
        picks[key] = { ...team };
        saveState();
        refreshBracketView();
      });

      const key = getFFKey(4, g);
      const currentPick = picks[key];
      if (currentPick && team && currentPick.name === team.name) {
        slot.classList.add('winner');
      }

      if (showGrading && currentPick && team && currentPick.name === team.name) {
        const actualPick = actualPicks[key];
        if (actualPick) {
          if (actualPick.name === currentPick.name) {
            slot.classList.add('correct');
          } else {
            slot.classList.add('incorrect');
          }
        }
      }

      if (!editable) slot.classList.add('locked');
      matchup.appendChild(slot);
    }

    semis.appendChild(matchup);
  }

  container.appendChild(semis);

  // Championship
  const champLabel = document.createElement('div');
  champLabel.className = 'round-header';
  champLabel.textContent = 'Championship';
  container.appendChild(champLabel);

  const champMatchup = document.createElement('div');
  champMatchup.className = 'matchup';

  for (let s = 0; s < 2; s++) {
    const team = getFFTeamInSlot(picks, 5, s);
    const slot = createTeamSlot(team, () => {
      if (!editable || !team) return;
      const key = getFFKey(5, 0);
      picks[key] = { ...team };
      saveState();
      refreshBracketView();
    });

    const key = getFFKey(5, 0);
    const currentPick = picks[key];
    if (currentPick && team && currentPick.name === team.name) {
      slot.classList.add('winner');
    }

    if (showGrading && currentPick && team && currentPick.name === team.name) {
      const actualPick = actualPicks[key];
      if (actualPick) {
        if (actualPick.name === currentPick.name) {
          slot.classList.add('correct');
        } else {
          slot.classList.add('incorrect');
        }
      }
    }

    if (!editable) slot.classList.add('locked');
    champMatchup.appendChild(slot);
  }

  container.appendChild(champMatchup);

  // Champion display
  const champBox = document.createElement('div');
  champBox.className = 'champion-box';
  const champTitle = document.createElement('h3');
  champTitle.textContent = 'Champion';
  champBox.appendChild(champTitle);
  const champName = document.createElement('div');
  champName.className = 'champion-name';
  const winner = picks[getFFKey(5, 0)];
  champName.textContent = winner ? `(${winner.seed}) ${winner.name}` : '—';
  champBox.appendChild(champName);
  container.appendChild(champBox);

  return container;
}

function createTeamSlot(team, onClick) {
  const slot = document.createElement('div');
  slot.className = 'team-slot';

  if (!team) {
    slot.classList.add('empty');
    slot.innerHTML = '<span class="team-name">—</span>';
    return slot;
  }

  const seedSpan = document.createElement('span');
  seedSpan.className = 'seed';
  seedSpan.textContent = team.seed;

  const nameSpan = document.createElement('span');
  nameSpan.className = 'team-name';
  nameSpan.textContent = team.name;

  slot.appendChild(seedSpan);
  slot.appendChild(nameSpan);
  slot.addEventListener('click', onClick);

  return slot;
}

// ---- Scoring ----
function calculateScore(userPicks, actualPicks) {
  let totalScore = 0;
  let correctPicks = 0;
  let totalPossible = 0;
  let roundBreakdown = [];

  // Region rounds
  const gamesPerRound = [8, 4, 2, 1];
  const roundPoints = [10, 20, 40, 80];

  for (let r = 0; r < 4; r++) {
    let roundCorrect = 0;
    let roundTotal = 0;
    for (const region of REGIONS) {
      for (let g = 0; g < gamesPerRound[r]; g++) {
        const key = getGameKey(region, r, g);
        const actual = actualPicks[key];
        const user = userPicks[key];
        if (actual) {
          roundTotal++;
          if (user && user.name === actual.name) {
            roundCorrect++;
            totalScore += roundPoints[r];
          }
        }
      }
    }
    correctPicks += roundCorrect;
    totalPossible += roundTotal;
    roundBreakdown.push({ round: ROUNDS[r].shortName, correct: roundCorrect, total: roundTotal, points: roundCorrect * roundPoints[r] });
  }

  // Final Four (round 4 = semis, round 5 = final)
  const ffRounds = [
    { round: 4, games: 2, points: 160, name: 'F4' },
    { round: 5, games: 1, points: 320, name: 'CHAMP' },
  ];

  for (const fr of ffRounds) {
    let roundCorrect = 0;
    let roundTotal = 0;
    for (let g = 0; g < fr.games; g++) {
      const key = getFFKey(fr.round, g);
      const actual = actualPicks[key];
      const user = userPicks[key];
      if (actual) {
        roundTotal++;
        if (user && user.name === actual.name) {
          roundCorrect++;
          totalScore += fr.points;
        }
      }
    }
    correctPicks += roundCorrect;
    totalPossible += roundTotal;
    roundBreakdown.push({ round: fr.name, correct: roundCorrect, total: roundTotal, points: roundCorrect * fr.points });
  }

  return { totalScore, correctPicks, totalPossible, roundBreakdown };
}

function updateScoreDisplay(score) {
  const el = document.getElementById('score-display');
  if (!score) {
    el.innerHTML = '';
    return;
  }
  el.innerHTML = `Score: <span class="pts">${score.totalScore}</span> | Correct: ${score.correctPicks}/${score.totalPossible}`;
}

// ---- Leaderboard ----
function renderLeaderboard() {
  const container = document.getElementById('leaderboard-content');
  if (!container) return;
  container.innerHTML = '';

  if (!state.actual || Object.keys(state.brackets).length === 0) {
    container.innerHTML = '<div class="no-results-msg">Add brackets and enter actual results to see the leaderboard.</div>';
    return;
  }

  const actualPicks = state.actual.picks;
  const entries = [];

  for (const [id, b] of Object.entries(state.brackets)) {
    const score = calculateScore(b.picks, actualPicks);
    entries.push({ id, name: b.name, ...score });
  }

  entries.sort((a, b) => b.totalScore - a.totalScore);

  const table = document.createElement('table');
  table.className = 'leaderboard-table';

  // Header
  const thead = document.createElement('thead');
  thead.innerHTML = `<tr>
    <th class="rank">#</th>
    <th>Bracket</th>
    <th>Score</th>
    <th>Correct</th>
    <th>R64</th>
    <th>R32</th>
    <th>S16</th>
    <th>E8</th>
    <th>F4</th>
    <th>Champ</th>
  </tr>`;
  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  entries.forEach((entry, i) => {
    const tr = document.createElement('tr');
    const rb = entry.roundBreakdown;
    tr.innerHTML = `
      <td class="rank">${i + 1}</td>
      <td><span class="bracket-link" data-id="${entry.id}">${entry.name}</span></td>
      <td class="score">${entry.totalScore}</td>
      <td class="correct-picks">${entry.correctPicks}/${entry.totalPossible}</td>
      ${rb.map(r => `<td>${r.correct}/${r.total}</td>`).join('')}
    `;
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  container.appendChild(table);

  // Click to switch to bracket
  container.querySelectorAll('.bracket-link').forEach(link => {
    link.addEventListener('click', () => {
      state.currentBracket = link.dataset.id;
      populateBracketSelect();
      showView('bracket');
    });
  });
}

// ---- Toast ----
function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}
