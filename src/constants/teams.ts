import { Team, RegionName } from '../types';

// Standard NCAA bracket matchup order by seed
export const SEED_MATCHUP_ORDER: [number, number][] = [
  [1, 16], [8, 9], [5, 12], [4, 13],
  [6, 11], [3, 14], [7, 10], [2, 15],
];

// 2026 placeholder teams - edit these with real teams when the bracket is announced
const makeTeams = (region: RegionName, names: string[]): Team[] =>
  names.map((name, i) => ({ seed: i + 1, name, region }));

export const TOURNAMENT_TEAMS: Record<RegionName, Team[]> = {
  East: makeTeams('East', [
    'Duke', 'Alabama', 'Wisconsin', 'Arizona',
    'Oregon', 'St. Mary\'s', 'Nevada', 'Mississippi St.',
    'Memphis', 'Boise St.', 'VCU', 'Liberty',
    'Vermont', 'Colgate', 'Robert Morris', 'American',
  ]),
  West: makeTeams('West', [
    'Houston', 'Tennessee', 'Kentucky', 'Purdue',
    'Clemson', 'Illinois', 'UCLA', 'Gonzaga',
    'TCU', 'Arkansas', 'Drake', 'Grand Canyon',
    'UNC Asheville', 'Montana St.', 'Prairie View', 'N.C. Central',
  ]),
  South: makeTeams('South', [
    'Kansas', 'Auburn', 'Baylor', 'Marquette',
    'San Diego St.', 'BYU', 'Dayton', 'Florida',
    'Northwestern', 'Penn St.', 'New Mexico', 'McNeese',
    'Kent St.', 'Oakland', 'Howard', 'Stetson',
  ]),
  Midwest: makeTeams('Midwest', [
    'UConn', 'Iowa St.', 'Creighton', 'North Carolina',
    'Texas', 'Michigan St.', 'Colorado St.', 'FAU',
    'Xavier', 'Texas A&M', 'NC State', 'James Madison',
    'Samford', 'Grambling', 'Montana', 'Wagner',
  ]),
};

export const REGIONS: RegionName[] = ['East', 'West', 'South', 'Midwest'];
