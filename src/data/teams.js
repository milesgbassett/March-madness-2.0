export const REGIONS = ["East", "West", "South", "Midwest"];

export const ROUND_NAMES = [
  "Round of 64",
  "Round of 32",
  "Sweet 16",
  "Elite 8",
  "Final Four",
  "Championship",
];

export const ROUND_SCORES = [10, 20, 40, 80, 160, 320];

// Standard NCAA bracket seed pairing order within a region
// This ensures 1v16, 8v9, 5v12, 4v13, 6v11, 3v14, 7v10, 2v15
export const SEED_ORDER = [1, 16, 8, 9, 5, 12, 4, 13, 6, 11, 3, 14, 7, 10, 2, 15];

// 2025 Tournament Teams (placeholder names - update with real teams)
export const TEAMS = {
  East: [
    { seed: 1, name: "Duke", region: "East" },
    { seed: 2, name: "Alabama", region: "East" },
    { seed: 3, name: "Wisconsin", region: "East" },
    { seed: 4, name: "Arizona", region: "East" },
    { seed: 5, name: "Oregon", region: "East" },
    { seed: 6, name: "BYU", region: "East" },
    { seed: 7, name: "St. Mary's", region: "East" },
    { seed: 8, name: "Mississippi St", region: "East" },
    { seed: 9, name: "Baylor", region: "East" },
    { seed: 10, name: "Vanderbilt", region: "East" },
    { seed: 11, name: "VCU", region: "East" },
    { seed: 12, name: "Liberty", region: "East" },
    { seed: 13, name: "Akron", region: "East" },
    { seed: 14, name: "Lipscomb", region: "East" },
    { seed: 15, name: "Robert Morris", region: "East" },
    { seed: 16, name: "Am. University", region: "East" },
  ],
  West: [
    { seed: 1, name: "Florida", region: "West" },
    { seed: 2, name: "St. John's", region: "West" },
    { seed: 3, name: "Texas Tech", region: "West" },
    { seed: 4, name: "Maryland", region: "West" },
    { seed: 5, name: "Memphis", region: "West" },
    { seed: 6, name: "Missouri", region: "West" },
    { seed: 7, name: "Kansas", region: "West" },
    { seed: 8, name: "UConn", region: "West" },
    { seed: 9, name: "Oklahoma", region: "West" },
    { seed: 10, name: "Arkansas", region: "West" },
    { seed: 11, name: "Drake", region: "West" },
    { seed: 12, name: "UC San Diego", region: "West" },
    { seed: 13, name: "Yale", region: "West" },
    { seed: 14, name: "Wofford", region: "West" },
    { seed: 15, name: "Omaha", region: "West" },
    { seed: 16, name: "Norfolk St", region: "West" },
  ],
  South: [
    { seed: 1, name: "Auburn", region: "South" },
    { seed: 2, name: "Michigan St", region: "South" },
    { seed: 3, name: "Iowa St", region: "South" },
    { seed: 4, name: "Texas A&M", region: "South" },
    { seed: 5, name: "Michigan", region: "South" },
    { seed: 6, name: "Ole Miss", region: "South" },
    { seed: 7, name: "Marquette", region: "South" },
    { seed: 8, name: "Louisville", region: "South" },
    { seed: 9, name: "Creighton", region: "South" },
    { seed: 10, name: "New Mexico", region: "South" },
    { seed: 11, name: "San Diego St", region: "South" },
    { seed: 12, name: "UC Irvine", region: "South" },
    { seed: 13, name: "Vermont", region: "South" },
    { seed: 14, name: "Troy", region: "South" },
    { seed: 15, name: "Bryant", region: "South" },
    { seed: 16, name: "AL St/SF St", region: "South" },
  ],
  Midwest: [
    { seed: 1, name: "Houston", region: "Midwest" },
    { seed: 2, name: "Tennessee", region: "Midwest" },
    { seed: 3, name: "Kentucky", region: "Midwest" },
    { seed: 4, name: "Purdue", region: "Midwest" },
    { seed: 5, name: "Clemson", region: "Midwest" },
    { seed: 6, name: "Illinois", region: "Midwest" },
    { seed: 7, name: "UCLA", region: "Midwest" },
    { seed: 8, name: "Gonzaga", region: "Midwest" },
    { seed: 9, name: "Georgia", region: "Midwest" },
    { seed: 10, name: "Utah St", region: "Midwest" },
    { seed: 11, name: "Texas", region: "Midwest" },
    { seed: 12, name: "McNeese", region: "Midwest" },
    { seed: 13, name: "High Point", region: "Midwest" },
    { seed: 14, name: "Colgate", region: "Midwest" },
    { seed: 15, name: "Omaha", region: "Midwest" },
    { seed: 16, name: "SIUE", region: "Midwest" },
  ],
};

// Generate initial round 1 matchups in correct bracket order
export function getInitialMatchups() {
  const matchups = [];
  for (const region of REGIONS) {
    const regionTeams = TEAMS[region];
    for (let i = 0; i < SEED_ORDER.length; i += 2) {
      const team1 = regionTeams.find((t) => t.seed === SEED_ORDER[i]);
      const team2 = regionTeams.find((t) => t.seed === SEED_ORDER[i + 1]);
      matchups.push([team1, team2]);
    }
  }
  return matchups;
}
