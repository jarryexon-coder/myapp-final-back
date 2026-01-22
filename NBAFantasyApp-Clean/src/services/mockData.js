// src/services/mockData.js - Enhanced Mock Data Service with Kalshi Markets, NBA & NHL
export const mockDataService = {
  getNBAGames() {
    const teams = [
      { id: 1, name: 'Lakers', city: 'Los Angeles', conference: 'West', wins: 32, losses: 25, color: '#552583', secondaryColor: '#FDB927' },
      { id: 2, name: 'Warriors', city: 'Golden State', conference: 'West', wins: 28, losses: 26, color: '#1D428A', secondaryColor: '#FFC72C' },
      { id: 3, name: 'Celtics', city: 'Boston', conference: 'East', wins: 45, losses: 12, color: '#007A33', secondaryColor: '#BA9653' },
      { id: 4, name: 'Bucks', city: 'Milwaukee', conference: 'East', wins: 40, losses: 17, color: '#00471B', secondaryColor: '#EEE1C6' },
      { id: 5, name: 'Nuggets', city: 'Denver', conference: 'West', wins: 38, losses: 19, color: '#0E2240', secondaryColor: '#FEC524' },
      { id: 6, name: 'Suns', city: 'Phoenix', conference: 'West', wins: 33, losses: 22, color: '#1D1160', secondaryColor: '#E56020' },
      { id: 7, name: 'Knicks', city: 'New York', conference: 'East', wins: 35, losses: 23, color: '#006BB6', secondaryColor: '#F58426' },
      { id: 8, name: 'Heat', city: 'Miami', conference: 'East', wins: 30, losses: 25, color: '#98002E', secondaryColor: '#F9A01B' },
      { id: 9, name: 'Clippers', city: 'LA Clippers', conference: 'West', wins: 37, losses: 18, color: '#C8102E', secondaryColor: '#1D428A' },
      { id: 10, name: '76ers', city: 'Philadelphia', conference: 'East', wins: 33, losses: 22, color: '#006BB6', secondaryColor: '#ED174C' },
      { id: 11, name: 'Mavericks', city: 'Dallas', conference: 'West', wins: 34, losses: 23, color: '#00538C', secondaryColor: '#002B5E' },
      { id: 12, name: 'Cavaliers', city: 'Cleveland', conference: 'East', wins: 36, losses: 19, color: '#860038', secondaryColor: '#041E42' }
    ];

    const games = [];
    const today = new Date();
    
    // Generate 8 realistic games with more variety
    for (let i = 0; i < 8; i++) {
      const homeIdx = i % teams.length;
      const awayIdx = (i + 3) % teams.length;
      const gameDate = new Date(today);
      gameDate.setDate(today.getDate() + i);
      
      const homeScore = Math.floor(Math.random() * 120) + 85;
      const awayScore = Math.floor(Math.random() * 120) + 85;
      const isLive = i === 0;
      const isCompleted = i > 4;
      const isOvertime = isCompleted && Math.random() > 0.7;
      const margin = Math.abs(homeScore - awayScore);
      
      games.push({
        id: `mock-nba-${i + 1}`,
        gameId: `0022400${1000 + i}`,
        homeTeam: teams[homeIdx],
        awayTeam: teams[awayIdx],
        homeScore: isCompleted ? homeScore : null,
        awayScore: isCompleted ? awayScore : null,
        status: isLive ? 'Live' : (isCompleted ? 'Final' : 'Scheduled'),
        period: isLive ? 'Q4 5:32' : (isCompleted ? (isOvertime ? 'OT' : 'Final') : ''),
        time: `${7 + (i % 4)}:${30 + (i * 10) % 30} PM ET`,
        date: gameDate.toISOString().split('T')[0],
        broadcast: ['TNT', 'ESPN', 'ABC', 'NBA TV'][i % 4],
        arena: `${teams[homeIdx].city} Arena`,
        seriesText: i === 0 ? 'Rivals Clash' : 'Regular Season',
        attendance: Math.floor(Math.random() * 15000) + 15000,
        leadChanges: Math.floor(Math.random() * 12) + 8,
        margin: margin,
        isNationalTV: i % 2 === 0,
        isOvertime: isOvertime,
        highlights: [
          `${teams[homeIdx].name} went on a ${Math.floor(Math.random() * 10) + 5}-0 run`,
          `${teams[awayIdx].name} shooting ${Math.floor(Math.random() * 20) + 40}% from 3`,
          `${Math.floor(Math.random() * 10) + 5} ties in the game`
        ]
      });
    }
    
    return {
      success: true,
      games,
      lastUpdated: new Date().toISOString(),
      season: '2023-24',
      totalGames: games.length,
      note: 'Using mock data - NBA endpoints not available'
    };
  },

  getNBAStandings() {
    const divisions = {
      'Atlantic': ['Celtics', 'Knicks', '76ers', 'Nets', 'Raptors'],
      'Central': ['Bucks', 'Cavaliers', 'Pacers', 'Bulls', 'Pistons'],
      'Southeast': ['Heat', 'Magic', 'Hawks', 'Hornets', 'Wizards'],
      'Northwest': ['Nuggets', 'Timberwolves', 'Thunder', 'Jazz', 'Trail Blazers'],
      'Pacific': ['Lakers', 'Suns', 'Warriors', 'Kings', 'Clippers'],
      'Southwest': ['Mavericks', 'Pelicans', 'Rockets', 'Grizzlies', 'Spurs']
    };

    const standings = [];
    
    Object.entries(divisions).forEach(([division, teams]) => {
      teams.forEach((team, index) => {
        const wins = 45 - (index * 5) + Math.floor(Math.random() * 5);
        const losses = 82 - wins;
        const pointsFor = Math.floor(Math.random() * 8000) + 8000;
        const pointsAgainst = pointsFor - Math.floor(Math.random() * 200) + 100;
        
        standings.push({
          team,
          division,
          wins,
          losses,
          winPercentage: (wins / (wins + losses)).toFixed(3),
          gamesBehind: index * 2.5,
          last10: `${7 - index} - ${3 + index}`,
          streak: index % 2 === 0 ? 'W3' : 'L2',
          homeRecord: `${Math.floor(wins * 0.55)} - ${Math.floor(losses * 0.45)}`,
          awayRecord: `${Math.floor(wins * 0.45)} - ${Math.floor(losses * 0.55)}`,
          pointsFor,
          pointsAgainst,
          pointDifferential: pointsFor - pointsAgainst,
          offensiveRating: (Math.random() * 10 + 110).toFixed(1),
          defensiveRating: (Math.random() * 10 + 105).toFixed(1),
          netRating: (Math.random() * 5 + 2.5).toFixed(1)
        });
      });
    });

    return {
      success: true,
      standings: standings.sort((a, b) => b.winPercentage - a.winPercentage),
      lastUpdated: new Date().toISOString(),
      playoffPicture: {
        east: standings.filter(s => s.division === 'Atlantic' || s.division === 'Central' || s.division === 'Southeast').slice(0, 8),
        west: standings.filter(s => s.division === 'Northwest' || s.division === 'Pacific' || s.division === 'Southwest').slice(0, 8)
      }
    };
  },

  getNBAPlayerStats(playerName = 'LeBron James') {
    const players = {
      'LeBron James': { 
        team: 'Lakers', 
        number: 23,
        position: 'SF',
        age: 39,
        points: 25.3, 
        rebounds: 7.9, 
        assists: 8.2, 
        games: 55,
        fgPercentage: 52.3,
        threePercentage: 40.5,
        ftPercentage: 75.2,
        steals: 1.2,
        blocks: 0.7,
        turnovers: 3.4,
        plusMinus: 5.2
      },
      'Stephen Curry': { 
        team: 'Warriors', 
        number: 30,
        position: 'PG',
        age: 36,
        points: 27.5, 
        rebounds: 4.3, 
        assists: 5.0, 
        games: 53,
        fgPercentage: 45.8,
        threePercentage: 42.3,
        ftPercentage: 92.1,
        steals: 0.8,
        blocks: 0.3,
        turnovers: 2.8,
        plusMinus: 3.8
      },
      'Nikola Jokic': { 
        team: 'Nuggets', 
        number: 15,
        position: 'C',
        age: 29,
        points: 26.1, 
        rebounds: 12.3, 
        assists: 9.0, 
        games: 58,
        fgPercentage: 58.3,
        threePercentage: 35.1,
        ftPercentage: 82.4,
        steals: 1.2,
        blocks: 0.9,
        turnovers: 3.1,
        plusMinus: 12.5
      },
      'Luka Doncic': { 
        team: 'Mavericks', 
        number: 77,
        position: 'PG',
        age: 25,
        points: 34.2, 
        rebounds: 8.8, 
        assists: 9.5, 
        games: 52,
        fgPercentage: 48.9,
        threePercentage: 38.2,
        ftPercentage: 78.3,
        steals: 1.4,
        blocks: 0.5,
        turnovers: 4.1,
        plusMinus: 4.8
      },
      'Giannis Antetokounmpo': { 
        team: 'Bucks', 
        number: 34,
        position: 'PF',
        age: 29,
        points: 30.8, 
        rebounds: 11.2, 
        assists: 6.4, 
        games: 56,
        fgPercentage: 61.2,
        threePercentage: 28.5,
        ftPercentage: 67.3,
        steals: 1.3,
        blocks: 1.1,
        turnovers: 3.7,
        plusMinus: 8.7
      },
      'Jayson Tatum': { 
        team: 'Celtics', 
        number: 0,
        position: 'SF',
        age: 26,
        points: 27.1, 
        rebounds: 8.6, 
        assists: 4.8, 
        games: 57,
        fgPercentage: 47.5,
        threePercentage: 37.6,
        ftPercentage: 83.2,
        steals: 1.0,
        blocks: 0.6,
        turnovers: 2.6,
        plusMinus: 10.8
      },
      'Kevin Durant': { 
        team: 'Suns', 
        number: 35,
        position: 'SF',
        age: 35,
        points: 28.2, 
        rebounds: 6.6, 
        assists: 5.7, 
        games: 50,
        fgPercentage: 52.8,
        threePercentage: 41.3,
        ftPercentage: 87.5,
        steals: 0.9,
        blocks: 1.2,
        turnovers: 3.1,
        plusMinus: 5.5
      }
    };

    const player = players[playerName] || players['LeBron James'];
    
    return {
      success: true,
      player: {
        name: playerName,
        team: player.team,
        number: player.number,
        position: player.position,
        age: player.age,
        stats: player,
        lastGame: {
          points: Math.floor(player.points + Math.random() * 10),
          rebounds: Math.floor(player.rebounds + Math.random() * 3),
          assists: Math.floor(player.assists + Math.random() * 3),
          steals: Math.floor(player.steals + Math.random() * 2),
          blocks: Math.floor(player.blocks + Math.random() * 2),
          fg: `${Math.floor(Math.random() * 15) + 8}/${Math.floor(Math.random() * 25) + 15}`,
          three: `${Math.floor(Math.random() * 8) + 2}/${Math.floor(Math.random() * 12) + 6}`,
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0]
        },
        seasonHigh: {
          points: Math.floor(player.points * 1.3),
          rebounds: Math.floor(player.rebounds * 1.4),
          assists: Math.floor(player.assists * 1.2),
          steals: Math.floor(player.steals * 2),
          blocks: Math.floor(player.blocks * 2)
        },
        advancedStats: {
          per: (Math.random() * 5 + 25).toFixed(1),
          winShares: (Math.random() * 5 + 8).toFixed(1),
          vorp: (Math.random() * 2 + 4).toFixed(1),
          usageRate: (Math.random() * 10 + 25).toFixed(1),
          trueShooting: (Math.random() * 10 + 55).toFixed(1)
        }
      }
    };
  },

  // NEW: NHL Games Mock Data
  getNHLGames() {
    const teams = [
      { id: 1, name: 'Bruins', city: 'Boston', conference: 'East', wins: 38, losses: 14, color: '#FFB81C' },
      { id: 2, name: 'Maple Leafs', city: 'Toronto', conference: 'East', wins: 35, losses: 17, color: '#00205B' },
      { id: 3, name: 'Rangers', city: 'New York', conference: 'East', wins: 40, losses: 18, color: '#0038A8' },
      { id: 4, name: 'Penguins', city: 'Pittsburgh', conference: 'East', wins: 30, losses: 25, color: '#FCB514' },
      { id: 5, name: 'Golden Knights', city: 'Vegas', conference: 'West', wins: 37, losses: 19, color: '#B4975A' },
      { id: 6, name: 'Oilers', city: 'Edmonton', conference: 'West', wins: 41, losses: 15, color: '#FF4C00' },
      { id: 7, name: 'Avalanche', city: 'Colorado', conference: 'West', wins: 39, losses: 20, color: '#6F263D' },
      { id: 8, name: 'Canucks', city: 'Vancouver', conference: 'West', wins: 42, losses: 17, color: '#00843D' },
      { id: 9, name: 'Lightning', city: 'Tampa Bay', conference: 'East', wins: 34, losses: 24, color: '#002868' },
      { id: 10, name: 'Capitals', city: 'Washington', conference: 'East', wins: 29, losses: 26, color: '#C8102E' },
      { id: 11, name: 'Flames', city: 'Calgary', conference: 'West', wins: 31, losses: 28, color: '#C8102E' },
      { id: 12, name: 'Stars', city: 'Dallas', conference: 'West', wins: 38, losses: 19, color: '#006847' }
    ];

    const games = [];
    const today = new Date();
    
    // Generate 6 NHL games
    for (let i = 0; i < 6; i++) {
      const homeIdx = i % teams.length;
      const awayIdx = (i + 4) % teams.length;
      const gameDate = new Date(today);
      gameDate.setDate(today.getDate() + i);
      
      const homeScore = Math.floor(Math.random() * 5) + 1;
      const awayScore = Math.floor(Math.random() * 5) + 1;
      const isLive = i === 1;
      const isCompleted = i > 3;
      const isOvertime = isCompleted && Math.random() > 0.6;
      const isShootout = isOvertime && Math.random() > 0.5;
      
      games.push({
        id: `mock-nhl-${i + 1}`,
        gameId: `2023020${1000 + i}`,
        homeTeam: teams[homeIdx],
        awayTeam: teams[awayIdx],
        homeScore: isCompleted ? homeScore : null,
        awayScore: isCompleted ? awayScore : null,
        status: isLive ? 'Live' : (isCompleted ? 'Final' : 'Scheduled'),
        period: isLive ? '3rd 12:45' : (isCompleted ? (isOvertime ? (isShootout ? 'SO' : 'OT') : 'Final') : ''),
        time: `${7 + (i % 4)}:00 PM ET`,
        date: gameDate.toISOString().split('T')[0],
        broadcast: ['ESPN', 'TNT', 'NHL Network', 'SN'][i % 4],
        arena: `${teams[homeIdx].city} Arena`,
        seriesText: i === 0 ? 'Original Six Matchup' : 'Regular Season',
        attendance: Math.floor(Math.random() * 18000) + 16000,
        shots: {
          home: Math.floor(Math.random() * 35) + 25,
          away: Math.floor(Math.random() * 35) + 25
        },
        powerPlays: {
          home: `${Math.floor(Math.random() * 4)}/${Math.floor(Math.random() * 5) + 1}`,
          away: `${Math.floor(Math.random() * 4)}/${Math.floor(Math.random() * 5) + 1}`
        },
        isNationalTV: i % 3 === 0,
        isOvertime: isOvertime,
        isShootout: isShootout
      });
    }
    
    return {
      success: true,
      games,
      lastUpdated: new Date().toISOString(),
      season: '2023-24',
      totalGames: games.length,
      note: 'Using mock data - NHL endpoints not available'
    };
  },

  // NEW: NHL Standings Mock Data
  getNHLStandings() {
    const divisions = {
      'Atlantic': ['Bruins', 'Maple Leafs', 'Lightning', 'Panthers', 'Red Wings', 'Sabres', 'Senators', 'Canadiens'],
      'Metropolitan': ['Rangers', 'Hurricanes', 'Devils', 'Islanders', 'Penguins', 'Capitals', 'Flyers', 'Blue Jackets'],
      'Central': ['Stars', 'Avalanche', 'Jets', 'Predators', 'Blues', 'Wild', 'Coyotes', 'Blackhawks'],
      'Pacific': ['Canucks', 'Golden Knights', 'Oilers', 'Kings', 'Flames', 'Kraken', 'Ducks', 'Sharks']
    };

    const standings = [];
    
    Object.entries(divisions).forEach(([division, teams]) => {
      teams.forEach((team, index) => {
        const wins = 40 - (index * 3) + Math.floor(Math.random() * 5);
        const losses = 82 - wins - Math.floor(Math.random() * 10);
        const otLosses = Math.floor(Math.random() * 10);
        const points = (wins * 2) + otLosses;
        
        standings.push({
          team,
          division,
          wins,
          losses,
          otLosses,
          points,
          gamesPlayed: wins + losses + otLosses,
          pointsPercentage: (points / ((wins + losses + otLosses) * 2)).toFixed(3),
          row: wins - Math.floor(Math.random() * 5), // Regulation/Overtime Wins
          goalsFor: Math.floor(Math.random() * 200) + 180,
          goalsAgainst: Math.floor(Math.random() * 200) + 160,
          goalDifferential: Math.floor(Math.random() * 40) + 20,
          homeRecord: `${Math.floor(wins * 0.55)}-${Math.floor(losses * 0.3)}-${Math.floor(otLosses * 0.15)}`,
          awayRecord: `${Math.floor(wins * 0.45)}-${Math.floor(losses * 0.7)}-${Math.floor(otLosses * 0.85)}`,
          last10: `${7 - (index % 3)}-${2 + (index % 3)}-${1}`,
          streak: index % 2 === 0 ? 'W4' : 'L2',
          powerPlay: `${Math.floor(Math.random() * 10) + 20}.${Math.floor(Math.random() * 9)}%`,
          penaltyKill: `${Math.floor(Math.random() * 10) + 75}.${Math.floor(Math.random() * 9)}%`
        });
      });
    });

    return {
      success: true,
      standings: standings.sort((a, b) => b.points - a.points),
      lastUpdated: new Date().toISOString(),
      playoffPicture: {
        east: standings.filter(s => s.division === 'Atlantic' || s.division === 'Metropolitan').slice(0, 8),
        west: standings.filter(s => s.division === 'Central' || s.division === 'Pacific').slice(0, 8)
      }
    };
  },

  // NEW: NHL Player Stats Mock Data
  getNHLPlayerStats(playerName = 'Connor McDavid') {
    const players = {
      'Connor McDavid': { 
        team: 'Oilers', 
        number: 97,
        position: 'C',
        age: 27,
        goals: 44, 
        assists: 78, 
        points: 122, 
        games: 65,
        plusMinus: 28,
        pim: 22,
        shots: 285,
        shootingPercentage: 15.4,
        timeOnIce: '22:15',
        faceoffPercentage: 52.3,
        hits: 67,
        blocks: 45
      },
      'Nathan MacKinnon': { 
        team: 'Avalanche', 
        number: 29,
        position: 'C',
        age: 28,
        goals: 38, 
        assists: 70, 
        points: 108, 
        games: 68,
        plusMinus: 32,
        pim: 45,
        shots: 318,
        shootingPercentage: 11.9,
        timeOnIce: '23:10',
        faceoffPercentage: 48.7,
        hits: 98,
        blocks: 52
      },
      'Auston Matthews': { 
        team: 'Maple Leafs', 
        number: 34,
        position: 'C',
        age: 26,
        goals: 58, 
        assists: 35, 
        points: 93, 
        games: 70,
        plusMinus: 25,
        pim: 18,
        shots: 355,
        shootingPercentage: 16.3,
        timeOnIce: '21:30',
        faceoffPercentage: 54.2,
        hits: 78,
        blocks: 60
      },
      'Nikita Kucherov': { 
        team: 'Lightning', 
        number: 86,
        position: 'RW',
        age: 30,
        goals: 42, 
        assists: 85, 
        points: 127, 
        games: 69,
        plusMinus: 15,
        pim: 32,
        shots: 265,
        shootingPercentage: 15.8,
        timeOnIce: '21:45',
        faceoffPercentage: 0,
        hits: 42,
        blocks: 38
      },
      'David Pastrnak': { 
        team: 'Bruins', 
        number: 88,
        position: 'RW',
        age: 27,
        goals: 46, 
        assists: 52, 
        points: 98, 
        games: 71,
        plusMinus: 22,
        pim: 40,
        shots: 332,
        shootingPercentage: 13.9,
        timeOnIce: '20:15',
        faceoffPercentage: 0,
        hits: 55,
        blocks: 28
      },
      'Cale Makar': { 
        team: 'Avalanche', 
        number: 8,
        position: 'D',
        age: 25,
        goals: 18, 
        assists: 62, 
        points: 80, 
        games: 65,
        plusMinus: 35,
        pim: 28,
        shots: 195,
        shootingPercentage: 9.2,
        timeOnIce: '25:30',
        faceoffPercentage: 0,
        hits: 85,
        blocks: 120
      },
      'Leon Draisaitl': { 
        team: 'Oilers', 
        number: 29,
        position: 'C',
        age: 28,
        goals: 36, 
        assists: 68, 
        points: 104, 
        games: 70,
        plusMinus: 24,
        pim: 52,
        shots: 245,
        shootingPercentage: 14.7,
        timeOnIce: '22:45',
        faceoffPercentage: 55.8,
        hits: 92,
        blocks: 38
      }
    };

    const player = players[playerName] || players['Connor McDavid'];
    
    return {
      success: true,
      player: {
        name: playerName,
        team: player.team,
        number: player.number,
        position: player.position,
        age: player.age,
        stats: player,
        lastGame: {
          goals: Math.floor(Math.random() * 3),
          assists: Math.floor(Math.random() * 3),
          points: Math.floor(Math.random() * 4),
          plusMinus: Math.floor(Math.random() * 5) - 2,
          timeOnIce: `${Math.floor(Math.random() * 5) + 18}:${Math.floor(Math.random() * 60)}`,
          shots: Math.floor(Math.random() * 6) + 2,
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0]
        },
        seasonHigh: {
          goals: Math.floor(player.goals / player.games * 1.5),
          assists: Math.floor(player.assists / player.games * 1.5),
          points: Math.floor(player.points / player.games * 1.5)
        },
        advancedStats: {
          corsiPercentage: (Math.random() * 15 + 52).toFixed(1),
          fenwickPercentage: (Math.random() * 15 + 53).toFixed(1),
          pdo: (Math.random() * 10 + 98).toFixed(1),
          ixG: (Math.random() * 5 + 25).toFixed(1),
          onIceShootingPercentage: (Math.random() * 3 + 9).toFixed(1)
        }
      }
    };
  },

  // KALSHI MARKETS DATA from File 1
  getKalshiMarkets() {
    const kalshiMarkets = [
      {
        id: '1',
        question: 'Will Chiefs win Super Bowl LXI?',
        category: 'Sports',
        yesPrice: '0.68',
        noPrice: '0.32',
        volume: '$4.2M',
        confidence: 85,
        edge: '+3.2%',
        analysis: 'Market underrating Chiefs defense. Current price implies 68% probability, true probability estimated at 71.2%.',
        expires: 'Feb 9, 2026',
        lastTradeTime: '2 minutes ago',
        marketId: 'CHIEFS-SB-LXI-2026'
      },
      {
        id: '2',
        question: 'Will Fed cut rates before June 2026?',
        category: 'Economics',
        yesPrice: '0.42',
        noPrice: '0.58',
        volume: '$2.8M',
        confidence: 72,
        edge: '+5.8%',
        analysis: 'Inflation data suggests earlier cuts. Market sentiment lags recent CPI reports.',
        expires: 'May 30, 2026',
        lastTradeTime: '15 minutes ago',
        marketId: 'FED-RATE-CUT-JUNE-2026'
      },
      {
        id: '3',
        question: 'Will Democrats control Senate after 2026?',
        category: 'Politics',
        yesPrice: '0.55',
        noPrice: '0.45',
        volume: '$3.5M',
        confidence: 68,
        edge: '+4.1%',
        analysis: 'Current polling vs. market pricing shows 4.1% edge. Key races in GA, PA undervalued.',
        expires: 'Nov 5, 2026',
        lastTradeTime: '1 hour ago',
        marketId: 'SENATE-DEMS-2026'
      },
      {
        id: '4',
        question: 'Will Celtics win NBA Finals 2025?',
        category: 'Sports',
        yesPrice: '0.38',
        noPrice: '0.62',
        volume: '$1.8M',
        confidence: 65,
        edge: '+2.5%',
        analysis: 'Celtics roster depth undervalued. Jayson Tatum MVP season potential not priced in.',
        expires: 'Jun 15, 2025',
        lastTradeTime: '45 minutes ago',
        marketId: 'CELTICS-NBA-2025'
      },
      {
        id: '5',
        question: 'Will S&P 500 close above 6,000 in 2025?',
        category: 'Economics',
        yesPrice: '0.28',
        noPrice: '0.72',
        volume: '$5.1M',
        confidence: 58,
        edge: '+1.8%',
        analysis: 'AI boom driving tech earnings higher. Market under-pricing growth potential.',
        expires: 'Dec 31, 2025',
        lastTradeTime: '30 minutes ago',
        marketId: 'SP500-6000-2025'
      },
      {
        id: '6',
        question: 'Will Tesla deliver 3M+ vehicles in 2025?',
        category: 'Business',
        yesPrice: '0.61',
        noPrice: '0.39',
        volume: '$1.2M',
        confidence: 74,
        edge: '+3.8%',
        analysis: 'Cybertruck ramp-up and Model 2 launch not fully priced into market.',
        expires: 'Jan 31, 2026',
        lastTradeTime: '1 hour ago',
        marketId: 'TESLA-3M-2025'
      },
      {
        id: '7',
        question: 'Will Oilers win Stanley Cup 2025?',
        category: 'Sports',
        yesPrice: '0.22',
        noPrice: '0.78',
        volume: '$850K',
        confidence: 70,
        edge: '+5.2%',
        analysis: 'McDavid-Draisaitl duo undervalued. Western Conference weaker than priced.',
        expires: 'Jun 15, 2025',
        lastTradeTime: '2 hours ago',
        marketId: 'OILERS-STANLEY-CUP-2025'
      },
      {
        id: '8',
        question: 'Will Bitcoin reach $100K before 2026?',
        category: 'Crypto',
        yesPrice: '0.45',
        noPrice: '0.55',
        volume: '$3.2M',
        confidence: 62,
        edge: '+2.9%',
        analysis: 'Halving event and ETF inflows not fully priced. Historical patterns suggest breakout.',
        expires: 'Jan 1, 2026',
        lastTradeTime: '20 minutes ago',
        marketId: 'BITCOIN-100K-2026'
      }
    ];
    
    return {
      success: true,
      markets: kalshiMarkets,
      totalVolume: '$21.85M',
      lastUpdated: new Date().toISOString(),
      platformStats: {
        weeklyVolume: '$2.0B',
        marketShare: '66.4%',
        sportsPercentage: '91.1%',
        topMarket: 'NFL Combos',
        recordDay: '$466M'
      }
    };
  },

  // Get sports predictions for various sports
  getSportsPredictions(sport = 'NBA') {
    const predictions = {
      'NBA': [
        {
          id: 'nba-1',
          game: 'Lakers vs Warriors',
          prediction: 'Lakers win by 4-8 points',
          confidence: 72,
          edge: '+3.5%',
          reasoning: 'LeBron James playing at MVP level. Warriors struggling on the road.',
          bettingPick: 'Lakers -5.5',
          value: 'Good'
        },
        {
          id: 'nba-2',
          game: 'Celtics vs Bucks',
          prediction: 'Bucks cover spread',
          confidence: 68,
          edge: '+2.8%',
          reasoning: 'Giannis matchup advantage. Celtics missing key defender.',
          bettingPick: 'Bucks +3.5',
          value: 'Excellent'
        }
      ],
      'NFL': [
        {
          id: 'nfl-1',
          game: 'Chiefs vs Ravens',
          prediction: 'Under 47.5 points',
          confidence: 75,
          edge: '+4.2%',
          reasoning: 'Both defenses elite. Weather conditions favor low scoring.',
          bettingPick: 'Under 47.5',
          value: 'Good'
        }
      ],
      'NHL': [
        {
          id: 'nhl-1',
          game: 'Oilers vs Avalanche',
          prediction: 'Oilers ML',
          confidence: 71,
          edge: '+3.8%',
          reasoning: 'McDavid hot streak. Avalanche goalie questionable.',
          bettingPick: 'Oilers -120',
          value: 'Good'
        }
      ]
    };
    
    return {
      success: true,
      sport: sport,
      predictions: predictions[sport] || predictions['NBA'],
      lastUpdated: new Date().toISOString(),
      modelAccuracy: {
        'NBA': '63.2%',
        'NFL': '58.7%',
        'NHL': '61.5%',
        'MLB': '59.8%'
      }[sport] || '60.0%'
    };
  }
};

export default mockDataService;

// Also export individual functions for convenience
export const getNBAGames = () => mockDataService.getNBAGames();
export const getNBAStandings = () => mockDataService.getNBAStandings();
export const getNBAPlayerStats = (playerName) => mockDataService.getNBAPlayerStats(playerName);
export const getNHLGames = () => mockDataService.getNHLGames();
export const getNHLStandings = () => mockDataService.getNHLStandings();
export const getNHLPlayerStats = (playerName) => mockDataService.getNHLPlayerStats(playerName);
export const getKalshiMarkets = () => mockDataService.getKalshiMarkets();
export const getSportsPredictions = (sport) => mockDataService.getSportsPredictions(sport);
