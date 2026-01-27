const fs = require('fs');
const path = require('path');

// NBA Teams (30 teams)
const nbaTeams = [
  'Atlanta Hawks', 'Boston Celtics', 'Brooklyn Nets', 'Charlotte Hornets',
  'Chicago Bulls', 'Cleveland Cavaliers', 'Dallas Mavericks', 'Denver Nuggets',
  'Detroit Pistons', 'Golden State Warriors', 'Houston Rockets', 'Indiana Pacers',
  'Los Angeles Clippers', 'Los Angeles Lakers', 'Memphis Grizzlies', 'Miami Heat',
  'Milwaukee Bucks', 'Minnesota Timberwolves', 'New Orleans Pelicans', 'New York Knicks',
  'Oklahoma City Thunder', 'Orlando Magic', 'Philadelphia 76ers', 'Phoenix Suns',
  'Portland Trail Blazers', 'Sacramento Kings', 'San Antonio Spurs', 'Toronto Raptors',
  'Utah Jazz', 'Washington Wizards'
];

// NHL Teams (32 teams)
const nhlTeams = [
  'Anaheim Ducks', 'Arizona Coyotes', 'Boston Bruins', 'Buffalo Sabres',
  'Calgary Flames', 'Carolina Hurricanes', 'Chicago Blackhawks', 'Colorado Avalanche',
  'Columbus Blue Jackets', 'Dallas Stars', 'Detroit Red Wings', 'Edmonton Oilers',
  'Florida Panthers', 'Los Angeles Kings', 'Minnesota Wild', 'Montreal Canadiens',
  'Nashville Predators', 'New Jersey Devils', 'New York Islanders', 'New York Rangers',
  'Ottawa Senators', 'Philadelphia Flyers', 'Pittsburgh Penguins', 'San Jose Sharks',
  'Seattle Kraken', 'St. Louis Blues', 'Tampa Bay Lightning', 'Toronto Maple Leafs',
  'Vancouver Canucks', 'Vegas Golden Knights', 'Washington Capitals', 'Winnipeg Jets'
];

// Player names
const firstNames = [
  'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph',
  'Thomas', 'Charles', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Donald',
  'Mark', 'Paul', 'Steven', 'Andrew', 'Kenneth', 'Joshua', 'Kevin', 'Brian',
  'George', 'Edward', 'Ronald', 'Timothy', 'Jason', 'Jeffrey', 'Ryan', 'Jacob',
  'Gary', 'Nicholas', 'Eric', 'Jonathan', 'Stephen', 'Larry', 'Justin', 'Scott',
  'Brandon', 'Benjamin', 'Samuel', 'Gregory', 'Frank', 'Alexander', 'Raymond',
  'Patrick', 'Jack', 'Dennis', 'Jerry', 'Tyler', 'Aaron', 'Jose', 'Henry',
  'Adam', 'Douglas', 'Nathan', 'Peter', 'Zachary', 'Kyle', 'Walter', 'Harold',
  'Jeremy', 'Ethan', 'Carl', 'Keith', 'Roger', 'Gerald', 'Christian', 'Terry',
  'Sean', 'Arthur', 'Austin', 'Noah', 'Lawrence', 'Jesse', 'Joe', 'Bryan',
  'Billy', 'Jordan', 'Albert', 'Dylan', 'Bruce', 'Willie', 'Gabriel', 'Alan',
  'Juan', 'Logan', 'Wayne', 'Ralph', 'Roy', 'Eugene', 'Randy', 'Vincent'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson',
  'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin',
  'Thompson', 'Garcia', 'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis',
  'Lee', 'Walker', 'Hall', 'Allen', 'Young', 'Hernandez', 'King', 'Wright',
  'Lopez', 'Hill', 'Scott', 'Green', 'Adams', 'Baker', 'Gonzalez', 'Nelson',
  'Carter', 'Mitchell', 'Perez', 'Roberts', 'Turner', 'Phillips', 'Campbell',
  'Parker', 'Evans', 'Edwards', 'Collins', 'Stewart', 'Sanchez', 'Morris',
  'Rogers', 'Reed', 'Cook', 'Morgan', 'Bell', 'Murphy', 'Bailey', 'Rivera',
  'Cooper', 'Richardson', 'Cox', 'Howard', 'Ward', 'Torres', 'Peterson', 'Gray',
  'Ramirez', 'James', 'Watson', 'Brooks', 'Kelly', 'Sanders', 'Price', 'Bennett',
  'Wood', 'Barnes', 'Ross', 'Henderson', 'Coleman', 'Jenkins', 'Perry', 'Powell'
];

// NBA-specific names (star players to include)
const nbaStarFirstNames = ['LeBron', 'Stephen', 'Kevin', 'Giannis', 'Luka', 'Jayson', 'Ja', 'Trae', 'Devin', 'Donovan'];
const nbaStarLastNames = ['James', 'Curry', 'Durant', 'Antetokounmpo', 'Doncic', 'Tatum', 'Morant', 'Young', 'Booker', 'Mitchell'];

// NHL-specific names
const nhlStarFirstNames = ['Connor', 'Nathan', 'Auston', 'Leon', 'Cale', 'Jack', 'Kirill', 'Artemi', 'David', 'Mikko'];
const nhlStarLastNames = ['McDavid', 'MacKinnon', 'Matthews', 'Draisaitl', 'Makar', 'Hughes', 'Kaprizov', 'Panarin', 'Pastrnak', 'Rantanen'];

// NBA positions
const nbaPositions = ['PG', 'SG', 'SF', 'PF', 'C'];

// NHL positions
const nhlPositions = ['C', 'LW', 'RW', 'D', 'G'];

// ========== NBA PLAYER GENERATION ==========
function generateNBAPlayers() {
  const players = [];
  let playerId = 1000; // Start NBA IDs at 1000
  
  nbaTeams.forEach((team, teamIndex) => {
    console.log(`Generating NBA players for ${team}...`);
    
    // Generate 10 players per team
    for (let i = 0; i < 10; i++) {
      // First 3 players are stars (with star names)
      let firstName, lastName;
      
      if (i < 3) {
        // Star player
        firstName = nbaStarFirstNames[(teamIndex * 3 + i) % nbaStarFirstNames.length];
        lastName = nbaStarLastNames[(teamIndex * 3 + i) % nbaStarLastNames.length];
      } else {
        // Regular player
        firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      }
      
      const position = nbaPositions[i % nbaPositions.length];
      const player = generateBasketballPlayer(playerId++, firstName, lastName, position, team, i < 3);
      players.push(player);
    }
  });
  
  console.log(`Generated ${players.length} NBA players`);
  return players;
}

function generateBasketballPlayer(id, firstName, lastName, position, team, isStar = false) {
  const age = isStar ? Math.floor(Math.random() * 10) + 25 : Math.floor(Math.random() * 8) + 20;
  const height = generateNBAHeight(position);
  const weight = generateNBAWeight(position, height);
  const number = Math.floor(Math.random() * 99) + 1;
  
  // Stats based on position and star status
  const stats = generateNBAStats(position, isStar);
  
  return {
    id,
    name: `${firstName} ${lastName}`,
    team,
    position,
    number,
    age,
    height,
    weight: `${weight} lbs`,
    college: ['Duke', 'Kentucky', 'UCLA', 'North Carolina', 'Kansas', 'Michigan', 'Texas', 'Arizona'][Math.floor(Math.random() * 8)],
    experience: `${age - 19 > 0 ? age - 19 : 1} years`,
    status: 'Active',
    stats,
    trend: isStar ? 'up' : (Math.random() > 0.5 ? 'up' : 'down'),
    fantasyPoints: calculateNBAFantasyPoints(stats),
    fantasyRank: isStar ? Math.floor(Math.random() * 30) + 1 : Math.floor(Math.random() * 200) + 50,
    salary: isStar ? `$${(Math.random() * 30 + 25).toFixed(1)}M` : `$${(Math.random() * 20 + 5).toFixed(1)}M`,
    contract: `${Math.floor(Math.random() * 4) + 1} years`,
    contractValue: isStar ? `$${Math.floor(Math.random() * 150 + 100)}M` : `$${Math.floor(Math.random() * 80 + 20)}M`,
    highlights: isStar ? 
      ['All-Star', 'MVP candidate', 'Franchise player'] : 
      ['Key contributor', 'Sixth man', 'Defensive specialist'],
    isPremium: isStar || Math.random() > 0.7,
    injuryStatus: Math.random() > 0.9 ? 'Day-to-day' : 'Healthy',
    social: {
      twitter: `@${firstName.charAt(0)}${lastName}`.toLowerCase(),
      instagram: `@${firstName}${lastName}`.toLowerCase()
    }
  };
}

function generateNBAHeight(position) {
  const baseHeights = {
    'PG': { min: 72, max: 77 }, // 6'0" - 6'5"
    'SG': { min: 74, max: 79 }, // 6'2" - 6'7"
    'SF': { min: 77, max: 82 }, // 6'5" - 6'10"
    'PF': { min: 79, max: 84 }, // 6'7" - 7'0"
    'C': { min: 81, max: 88 }   // 6'9" - 7'4"
  };
  
  const inches = Math.floor(Math.random() * (baseHeights[position].max - baseHeights[position].min + 1)) + baseHeights[position].min;
  const feet = Math.floor(inches / 12);
  const remainingInches = inches % 12;
  
  return `${feet}'${remainingInches}"`;
}

function generateNBAWeight(position, height) {
  // Convert height to inches for weight calculation
  const match = height.match(/(\d+)'(\d+)"/);
  const feet = parseInt(match[1]);
  const inches = parseInt(match[2]);
  const totalInches = feet * 12 + inches;
  
  // Base weight by position
  const baseWeights = {
    'PG': 185,
    'SG': 200,
    'SF': 215,
    'PF': 230,
    'C': 250
  };
  
  // Adjust for height
  const weightPerInch = 5;
  const baseWeight = baseWeights[position] || 200;
  const weight = baseWeight + (totalInches - 75) * weightPerInch;
  
  // Add some randomness
  return Math.floor(weight + (Math.random() * 40 - 20));
}

function generateNBAStats(position, isStar) {
  const baseStats = {
    season: '2023-24',
    games: Math.floor(Math.random() * 15) + 65, // 65-80 games
    minutes: (Math.random() * 10 + 25).toFixed(1), // 25-35 minutes
  };
  
  // Position-specific stats
  let stats;
  switch(position) {
    case 'PG':
      stats = {
        points: (Math.random() * 12 + (isStar ? 18 : 10)).toFixed(1),
        rebounds: (Math.random() * 4 + (isStar ? 4 : 3)).toFixed(1),
        assists: (Math.random() * 6 + (isStar ? 7 : 4)).toFixed(1),
        steals: (Math.random() * 1.2 + (isStar ? 1.3 : 0.8)).toFixed(1),
        turnovers: (Math.random() * 2 + (isStar ? 2.5 : 1.8)).toFixed(1),
        fgPercentage: (Math.random() * 10 + (isStar ? 45 : 42)).toFixed(1),
        threePercentage: (Math.random() * 15 + (isStar ? 38 : 35)).toFixed(1),
        ftPercentage: (Math.random() * 15 + (isStar ? 85 : 78)).toFixed(1)
      };
      break;
      
    case 'SG':
      stats = {
        points: (Math.random() * 15 + (isStar ? 22 : 12)).toFixed(1),
        rebounds: (Math.random() * 4 + (isStar ? 5 : 3.5)).toFixed(1),
        assists: (Math.random() * 4 + (isStar ? 4 : 2.5)).toFixed(1),
        steals: (Math.random() * 1 + (isStar ? 1.2 : 0.7)).toFixed(1),
        turnovers: (Math.random() * 2 + (isStar ? 2.2 : 1.5)).toFixed(1),
        fgPercentage: (Math.random() * 8 + (isStar ? 46 : 43)).toFixed(1),
        threePercentage: (Math.random() * 12 + (isStar ? 40 : 36)).toFixed(1),
        ftPercentage: (Math.random() * 12 + (isStar ? 87 : 80)).toFixed(1)
      };
      break;
      
    case 'SF':
      stats = {
        points: (Math.random() * 14 + (isStar ? 24 : 14)).toFixed(1),
        rebounds: (Math.random() * 6 + (isStar ? 7 : 4.5)).toFixed(1),
        assists: (Math.random() * 4 + (isStar ? 5 : 3)).toFixed(1),
        steals: (Math.random() * 1.2 + (isStar ? 1.4 : 0.9)).toFixed(1),
        blocks: (Math.random() * 1 + (isStar ? 0.8 : 0.4)).toFixed(1),
        turnovers: (Math.random() * 2 + (isStar ? 2.8 : 1.8)).toFixed(1),
        fgPercentage: (Math.random() * 10 + (isStar ? 48 : 45)).toFixed(1),
        threePercentage: (Math.random() * 10 + (isStar ? 37 : 34)).toFixed(1),
        ftPercentage: (Math.random() * 10 + (isStar ? 82 : 75)).toFixed(1)
      };
      break;
      
    case 'PF':
      stats = {
        points: (Math.random() * 12 + (isStar ? 20 : 12)).toFixed(1),
        rebounds: (Math.random() * 8 + (isStar ? 10 : 6)).toFixed(1),
        assists: (Math.random() * 3 + (isStar ? 3.5 : 2)).toFixed(1),
        blocks: (Math.random() * 1.5 + (isStar ? 1.5 : 0.8)).toFixed(1),
        turnovers: (Math.random() * 2 + (isStar ? 2.2 : 1.5)).toFixed(1),
        fgPercentage: (Math.random() * 12 + (isStar ? 52 : 47)).toFixed(1),
        threePercentage: (Math.random() * 8 + (isStar ? 35 : 32)).toFixed(1),
        ftPercentage: (Math.random() * 8 + (isStar ? 78 : 72)).toFixed(1)
      };
      break;
      
    case 'C':
      stats = {
        points: (Math.random() * 10 + (isStar ? 18 : 10)).toFixed(1),
        rebounds: (Math.random() * 10 + (isStar ? 12 : 8)).toFixed(1),
        assists: (Math.random() * 3 + (isStar ? 3 : 1.5)).toFixed(1),
        blocks: (Math.random() * 2 + (isStar ? 2 : 1)).toFixed(1),
        turnovers: (Math.random() * 2 + (isStar ? 2.5 : 1.8)).toFixed(1),
        fgPercentage: (Math.random() * 15 + (isStar ? 58 : 52)).toFixed(1), // FIXED LINE
        ftPercentage: (Math.random() * 6 + (isStar ? 75 : 68)).toFixed(1)
      };
      break;
      
    default:
      stats = {
        points: (Math.random() * 10 + 10).toFixed(1),
        rebounds: (Math.random() * 5 + 3).toFixed(1),
        assists: (Math.random() * 3 + 2).toFixed(1)
      };
  }
  
  return { ...baseStats, ...stats };
}

function calculateNBAFantasyPoints(stats) {
  // Standard fantasy scoring: PTS=1, REB=1.2, AST=1.5, STL=3, BLK=3, TO=-1
  const points = parseFloat(stats.points) || 0;
  const rebounds = parseFloat(stats.rebounds) || 0;
  const assists = parseFloat(stats.assists) || 0;
  const steals = parseFloat(stats.steals) || 0;
  const blocks = parseFloat(stats.blocks) || 0;
  const turnovers = parseFloat(stats.turnovers) || 0;
  
  return (points + rebounds * 1.2 + assists * 1.5 + steals * 3 + blocks * 3 - turnovers).toFixed(1);
}

// ========== NHL PLAYER GENERATION ==========
function generateNHLPlayers() {
  const players = [];
  let playerId = 2000; // Start NHL IDs at 2000
  
  nhlTeams.forEach((team, teamIndex) => {
    console.log(`Generating NHL players for ${team}...`);
    
    // Generate 10 players per team
    for (let i = 0; i < 10; i++) {
      // First 3 players are stars (with star names)
      let firstName, lastName;
      
      if (i < 3) {
        // Star player
        firstName = nhlStarFirstNames[(teamIndex * 3 + i) % nhlStarFirstNames.length];
        lastName = nhlStarLastNames[(teamIndex * 3 + i) % nhlStarLastNames.length];
      } else {
        // Regular player
        firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      }
      
      const position = nhlPositions[i % nhlPositions.length];
      const player = generateHockeyPlayer(playerId++, firstName, lastName, position, team, i < 3);
      players.push(player);
    }
  });
  
  console.log(`Generated ${players.length} NHL players`);
  return players;
}

function generateHockeyPlayer(id, firstName, lastName, position, team, isStar = false) {
  const age = isStar ? Math.floor(Math.random() * 8) + 24 : Math.floor(Math.random() * 8) + 21;
  const height = generateNHLHeight(position);
  const weight = generateNHLWeight(position);
  const number = Math.floor(Math.random() * 99) + 1;
  
  // Stats based on position and star status
  const stats = generateNHLStats(position, isStar);
  
  return {
    id,
    name: `${firstName} ${lastName}`,
    team,
    position,
    number,
    age,
    height,
    weight: `${weight} lbs`,
    country: ['Canada', 'USA', 'Sweden', 'Finland', 'Russia', 'Czech Republic', 'Slovakia'][Math.floor(Math.random() * 7)],
    experience: `${age - 18 > 0 ? age - 18 : 1} years`,
    status: 'Active',
    stats,
    trend: isStar ? 'up' : (Math.random() > 0.5 ? 'up' : 'down'),
    fantasyPoints: calculateNHLFantasyPoints(stats, position),
    fantasyRank: isStar ? Math.floor(Math.random() * 30) + 1 : Math.floor(Math.random() * 200) + 50,
    salary: isStar ? `$${(Math.random() * 8 + 7).toFixed(1)}M` : `$${(Math.random() * 5 + 2).toFixed(1)}M`,
    contract: `${Math.floor(Math.random() * 4) + 1} years`,
    contractValue: isStar ? `$${Math.floor(Math.random() * 70 + 30)}M` : `$${Math.floor(Math.random() * 20 + 5)}M`,
    highlights: isStar ? 
      ['All-Star', 'MVP candidate', 'Franchise player'] : 
      ['Key contributor', 'Defensive specialist', 'Power play specialist'],
    isPremium: isStar || Math.random() > 0.7,
    injuryStatus: Math.random() > 0.9 ? 'Day-to-day' : 'Healthy',
    social: {
      twitter: `@${firstName.charAt(0)}${lastName}`.toLowerCase(),
      instagram: `@${firstName}${lastName}`.toLowerCase()
    }
  };
}

function generateNHLHeight(position) {
  const baseHeights = {
    'C': { min: 71, max: 76 },   // 5'11" - 6'4"
    'LW': { min: 71, max: 77 },  // 5'11" - 6'5"
    'RW': { min: 71, max: 77 },  // 5'11" - 6'5"
    'D': { min: 72, max: 78 },   // 6'0" - 6'6"
    'G': { min: 73, max: 79 }    // 6'1" - 6'7"
  };
  
  const inches = Math.floor(Math.random() * (baseHeights[position].max - baseHeights[position].min + 1)) + baseHeights[position].min;
  const feet = Math.floor(inches / 12);
  const remainingInches = inches % 12;
  
  return `${feet}'${remainingInches}"`;
}

function generateNHLWeight(position) {
  const baseWeights = {
    'C': 195,
    'LW': 200,
    'RW': 200,
    'D': 210,
    'G': 190
  };
  
  const weight = baseWeights[position] + Math.floor(Math.random() * 40 - 20);
  return Math.max(170, Math.min(250, weight));
}

function generateNHLStats(position, isStar) {
  const baseStats = {
    season: '2023-24',
    games: Math.floor(Math.random() * 10) + 72, // 72-82 games
  };
  
  let stats;
  switch(position) {
    case 'C':
    case 'LW':
    case 'RW':
      // Forward stats
      stats = {
        goals: Math.floor(Math.random() * 20 + (isStar ? 35 : 10)),
        assists: Math.floor(Math.random() * 25 + (isStar ? 45 : 15)),
        points: 0, // Will be calculated
        plusMinus: Math.floor(Math.random() * 40 - 20 + (isStar ? 15 : 0)),
        pim: Math.floor(Math.random() * 40 + (isStar ? 20 : 30)),
        shots: Math.floor(Math.random() * 150 + (isStar ? 250 : 100)),
        shootingPercentage: (Math.random() * 15 + (isStar ? 15 : 10)).toFixed(1),
        powerPlayGoals: Math.floor(Math.random() * 8 + (isStar ? 12 : 3)),
        powerPlayPoints: Math.floor(Math.random() * 15 + (isStar ? 25 : 8)),
        gameWinningGoals: Math.floor(Math.random() * 5 + (isStar ? 8 : 2)),
        hits: Math.floor(Math.random() * 80 + (isStar ? 50 : 100)),
        blockedShots: Math.floor(Math.random() * 40 + (isStar ? 20 : 50))
      };
      stats.points = stats.goals + stats.assists;
      break;
      
    case 'D':
      // Defenseman stats
      stats = {
        goals: Math.floor(Math.random() * 10 + (isStar ? 15 : 5)),
        assists: Math.floor(Math.random() * 25 + (isStar ? 40 : 15)),
        points: 0, // Will be calculated
        plusMinus: Math.floor(Math.random() * 40 - 20 + (isStar ? 10 : 0)),
        pim: Math.floor(Math.random() * 50 + (isStar ? 30 : 40)),
        shots: Math.floor(Math.random() * 120 + (isStar ? 180 : 80)),
        shootingPercentage: (Math.random() * 8 + (isStar ? 7 : 5)).toFixed(1),
        powerPlayGoals: Math.floor(Math.random() * 5 + (isStar ? 8 : 2)),
        powerPlayPoints: Math.floor(Math.random() * 12 + (isStar ? 20 : 6)),
        hits: Math.floor(Math.random() * 120 + (isStar ? 80 : 150)),
        blockedShots: Math.floor(Math.random() * 100 + (isStar ? 150 : 120))
      };
      stats.points = stats.goals + stats.assists;
      break;
      
    case 'G':
      // Goaltender stats
      const wins = Math.floor(Math.random() * 15 + (isStar ? 30 : 15));
      const games = Math.floor(Math.random() * 10 + (isStar ? 55 : 40));
      
      stats = {
        games: games,
        gamesStarted: Math.floor(games * 0.95),
        wins: wins,
        losses: Math.floor(games - wins - Math.floor(Math.random() * 5)),
        otLosses: Math.floor(Math.random() * 8),
        shotsAgainst: Math.floor(Math.random() * 1000 + 1500),
        saves: 0, // Will be calculated
        savePercentage: (Math.random() * 0.03 + (isStar ? 0.92 : 0.90)).toFixed(3),
        goalsAgainstAverage: (Math.random() * 0.8 + (isStar ? 2.3 : 2.8)).toFixed(2),
        shutouts: Math.floor(Math.random() * 5 + (isStar ? 5 : 2))
      };
      stats.saves = Math.floor(stats.shotsAgainst * parseFloat(stats.savePercentage));
      stats.goalsAgainst = stats.shotsAgainst - stats.saves;
      break;
      
    default:
      stats = {
        goals: 0,
        assists: 0,
        points: 0
      };
  }
  
  return { ...baseStats, ...stats };
}

function calculateNHLFantasyPoints(stats, position) {
  let fantasyPoints = 0;
  
  if (position === 'G') {
    // Goaltender scoring: W=4, GA=-1, SV=0.2, SO=4
    fantasyPoints = stats.wins * 4 - stats.goalsAgainst + stats.saves * 0.2 + stats.shutouts * 4;
  } else {
    // Skater scoring: G=3, A=2, +/-=0.5, PIM=0.2, PPP=1, SOG=0.2, HIT=0.2, BLK=0.4
    fantasyPoints = 
      (stats.goals || 0) * 3 +
      (stats.assists || 0) * 2 +
      (stats.plusMinus || 0) * 0.5 +
      (stats.pim || 0) * 0.2 +
      (stats.powerPlayPoints || 0) * 1 +
      (stats.shots || 0) * 0.2 +
      (stats.hits || 0) * 0.2 +
      (stats.blockedShots || 0) * 0.4;
  }
  
  return fantasyPoints.toFixed(1);
}

// ========== NFL PLAYER GENERATION (KEEP YOUR EXISTING) ==========
function generateNFLPlayers() {
  const players = [];
  const nflTeams = [
    'Kansas City Chiefs', 'Buffalo Bills', 'San Francisco 49ers', 'Philadelphia Eagles',
    'Miami Dolphins', 'Baltimore Ravens', 'Dallas Cowboys', 'Detroit Lions',
    'Los Angeles Rams', 'Cincinnati Bengals', 'Green Bay Packers', 'Tampa Bay Buccaneers',
    'Las Vegas Raiders', 'Los Angeles Chargers', 'New England Patriots', 'New York Giants'
  ];
  
  let playerId = 1;
  
  nflTeams.forEach(team => {
    // Generate 12 players per team for NFL
    const positions = ['QB', 'RB', 'WR', 'TE', 'WR', 'RB', 'WR', 'TE', 'QB', 'WR', 'RB', 'TE'];
    
    positions.forEach(position => {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      
      players.push({
        id: playerId++,
        name: `${firstName} ${lastName}`,
        team: team,
        position: position,
        number: Math.floor(Math.random() * 99) + 1,
        age: Math.floor(Math.random() * 12) + 22,
        height: `${6}'${Math.floor(Math.random() * 5)}"`,
        weight: `${Math.floor(Math.random() * 80) + 200} lbs`,
        stats: generateNFLStats(position),
        fantasyPoints: (Math.random() * 200 + 100).toFixed(1),
        salary: `$${(Math.random() * 15 + 2).toFixed(1)}M`,
        isPremium: Math.random() > 0.8
      });
    });
  });
  
  return players;
}

function generateNFLStats(position) {
  const base = { season: 2024, games: 16 };
  
  switch(position) {
    case 'QB':
      return {
        ...base,
        passingYards: Math.floor(Math.random() * 3000) + 3000,
        passingTDs: Math.floor(Math.random() * 30) + 20,
        interceptions: Math.floor(Math.random() * 15) + 5,
        completion: (Math.random() * 15 + 60).toFixed(1),
        passerRating: (Math.random() * 30 + 80).toFixed(1)
      };
    case 'RB':
      return {
        ...base,
        rushingYards: Math.floor(Math.random() * 1000) + 800,
        rushingTDs: Math.floor(Math.random() * 12) + 5,
        receptions: Math.floor(Math.random() * 50) + 20,
        receivingYards: Math.floor(Math.random() * 400) + 200
      };
    case 'WR':
      return {
        ...base,
        receptions: Math.floor(Math.random() * 70) + 50,
        receivingYards: Math.floor(Math.random() * 1000) + 800,
        receivingTDs: Math.floor(Math.random() * 12) + 5
      };
    case 'TE':
      return {
        ...base,
        receptions: Math.floor(Math.random() * 60) + 30,
        receivingYards: Math.floor(Math.random() * 800) + 400,
        receivingTDs: Math.floor(Math.random() * 8) + 3
      };
    default:
      return base;
  }
}

// ========== MLB PLAYER GENERATION ==========
function generateMLBPlayers() {
  const players = [];
  let playerId = 3000;
  
  // Sample MLB teams
  const mlbTeams = [
    'New York Yankees', 'Los Angeles Dodgers', 'Boston Red Sox', 'Chicago Cubs',
    'Houston Astros', 'Atlanta Braves', 'New York Mets', 'St. Louis Cardinals'
  ];
  
  mlbTeams.forEach(team => {
    // Generate 8 players per team
    for (let i = 0; i < 8; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const isStar = i < 2;
      
      players.push({
        id: playerId++,
        name: `${firstName} ${lastName}`,
        team: team,
        position: ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF'][i],
        age: Math.floor(Math.random() * 10) + 23,
        stats: generateMLBStats(isStar),
        fantasyPoints: (Math.random() * 150 + 100).toFixed(1),
        salary: isStar ? `$${(Math.random() * 25 + 15).toFixed(1)}M` : `$${(Math.random() * 10 + 2).toFixed(1)}M`,
        isPremium: isStar
      });
    }
  });
  
  return players;
}

function generateMLBStats(isStar) {
  return {
    season: 2024,
    batting: {
      avg: (Math.random() * 0.100 + (isStar ? 0.280 : 0.250)).toFixed(3),
      hr: Math.floor(Math.random() * 30 + (isStar ? 25 : 10)),
      rbi: Math.floor(Math.random() * 80 + (isStar ? 70 : 40)),
      runs: Math.floor(Math.random() * 70 + (isStar ? 80 : 40)),
      sb: Math.floor(Math.random() * 20 + (isStar ? 15 : 5))
    },
    pitching: isStar ? {
      era: (Math.random() * 1.5 + 2.5).toFixed(2),
      wins: Math.floor(Math.random() * 10 + 12),
      strikeouts: Math.floor(Math.random() * 150 + 150),
      innings: Math.floor(Math.random() * 50 + 150)
    } : undefined
  };
}

// ========== MAIN EXECUTION ==========
function generateAllSportsPlayers() {
  console.log('Generating players for all sports...\n');
  
  // Generate NFL players
  console.log('Generating NFL players...');
  const nflPlayers = generateNFLPlayers();
  
  // Generate NBA players
  console.log('\nGenerating NBA players...');
  const nbaPlayers = generateNBAPlayers();
  
  // Generate NHL players
  console.log('\nGenerating NHL players...');
  const nhlPlayers = generateNHLPlayers();
  
  // Generate MLB players
  console.log('\nGenerating MLB players...');
  const mlbPlayers = generateMLBPlayers();
  
  const allPlayers = {
    NFL: nflPlayers,
    NBA: nbaPlayers,
    NHL: nhlPlayers,
    MLB: mlbPlayers
  };
  
  console.log('\n=== PLAYER GENERATION SUMMARY ===');
  console.log(`NFL: ${nflPlayers.length} players`);
  console.log(`NBA: ${nbaPlayers.length} players (10 per team × 30 teams)`);
  console.log(`NHL: ${nhlPlayers.length} players (10 per team × 32 teams)`);
  console.log(`MLB: ${mlbPlayers.length} players`);
  console.log(`Total: ${nflPlayers.length + nbaPlayers.length + nhlPlayers.length + mlbPlayers.length} players\n`);
  
  return allPlayers;
}

// ========== RUN THE SCRIPT ==========
const players = generateAllSportsPlayers();

// Save to JSON file
const jsonOutputPath = path.join(__dirname, '../src/data/generatedPlayers.json');
fs.writeFileSync(jsonOutputPath, JSON.stringify(players, null, 2));
console.log(`Players saved to: ${jsonOutputPath}`);

// Create JavaScript export file
const jsOutput = `// src/data/players.js - Generated Players Data
export const samplePlayers = ${JSON.stringify(players, null, 2)};

// Helper functions
export const getPlayersBySport = (sport) => {
  return samplePlayers[sport] || [];
};

export const getPlayerById = (id) => {
  for (const sport in samplePlayers) {
    const player = samplePlayers[sport].find(p => p.id === id);
    if (player) return { player, sport };
  }
  return null;
};

export const searchPlayers = (sport, query) => {
  const players = samplePlayers[sport] || [];
  const searchLower = query.toLowerCase();
  
  return players.filter(player => 
    player.name.toLowerCase().includes(searchLower) ||
    player.team.toLowerCase().includes(searchLower) ||
    player.position.toLowerCase().includes(searchLower)
  );
};

export default samplePlayers;`;

const jsOutputPath = path.join(__dirname, '../src/data/players.js');
fs.writeFileSync(jsOutputPath, jsOutput);
console.log(`JavaScript players file saved to: ${jsOutputPath}`);
