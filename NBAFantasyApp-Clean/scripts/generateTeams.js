const fs = require('fs');
const path = require('path');

// Team data for all sports
const allTeams = {
  NFL: [
    { name: 'Arizona Cardinals', city: 'Glendale', state: 'AZ', conference: 'NFC', division: 'West' },
    { name: 'Atlanta Falcons', city: 'Atlanta', state: 'GA', conference: 'NFC', division: 'South' },
    { name: 'Baltimore Ravens', city: 'Baltimore', state: 'MD', conference: 'AFC', division: 'North' },
    { name: 'Buffalo Bills', city: 'Orchard Park', state: 'NY', conference: 'AFC', division: 'East' },
    { name: 'Carolina Panthers', city: 'Charlotte', state: 'NC', conference: 'NFC', division: 'South' },
    { name: 'Chicago Bears', city: 'Chicago', state: 'IL', conference: 'NFC', division: 'North' },
    { name: 'Cincinnati Bengals', city: 'Cincinnati', state: 'OH', conference: 'AFC', division: 'North' },
    { name: 'Cleveland Browns', city: 'Cleveland', state: 'OH', conference: 'AFC', division: 'North' },
    { name: 'Dallas Cowboys', city: 'Arlington', state: 'TX', conference: 'NFC', division: 'East' },
    { name: 'Denver Broncos', city: 'Denver', state: 'CO', conference: 'AFC', division: 'West' },
    { name: 'Detroit Lions', city: 'Detroit', state: 'MI', conference: 'NFC', division: 'North' },
    { name: 'Green Bay Packers', city: 'Green Bay', state: 'WI', conference: 'NFC', division: 'North' },
    { name: 'Houston Texans', city: 'Houston', state: 'TX', conference: 'AFC', division: 'South' },
    { name: 'Indianapolis Colts', city: 'Indianapolis', state: 'IN', conference: 'AFC', division: 'South' },
    { name: 'Jacksonville Jaguars', city: 'Jacksonville', state: 'FL', conference: 'AFC', division: 'South' },
    { name: 'Kansas City Chiefs', city: 'Kansas City', state: 'MO', conference: 'AFC', division: 'West' },
    { name: 'Las Vegas Raiders', city: 'Paradise', state: 'NV', conference: 'AFC', division: 'West' },
    { name: 'Los Angeles Chargers', city: 'Inglewood', state: 'CA', conference: 'AFC', division: 'West' },
    { name: 'Los Angeles Rams', city: 'Inglewood', state: 'CA', conference: 'NFC', division: 'West' },
    { name: 'Miami Dolphins', city: 'Miami Gardens', state: 'FL', conference: 'AFC', division: 'East' },
    { name: 'Minnesota Vikings', city: 'Minneapolis', state: 'MN', conference: 'NFC', division: 'North' },
    { name: 'New England Patriots', city: 'Foxborough', state: 'MA', conference: 'AFC', division: 'East' },
    { name: 'New Orleans Saints', city: 'New Orleans', state: 'LA', conference: 'NFC', division: 'South' },
    { name: 'New York Giants', city: 'East Rutherford', state: 'NJ', conference: 'NFC', division: 'East' },
    { name: 'New York Jets', city: 'East Rutherford', state: 'NJ', conference: 'AFC', division: 'East' },
    { name: 'Philadelphia Eagles', city: 'Philadelphia', state: 'PA', conference: 'NFC', division: 'East' },
    { name: 'Pittsburgh Steelers', city: 'Pittsburgh', state: 'PA', conference: 'AFC', division: 'North' },
    { name: 'San Francisco 49ers', city: 'Santa Clara', state: 'CA', conference: 'NFC', division: 'West' },
    { name: 'Seattle Seahawks', city: 'Seattle', state: 'WA', conference: 'NFC', division: 'West' },
    { name: 'Tampa Bay Buccaneers', city: 'Tampa', state: 'FL', conference: 'NFC', division: 'South' },
    { name: 'Tennessee Titans', city: 'Nashville', state: 'TN', conference: 'AFC', division: 'South' },
    { name: 'Washington Commanders', city: 'Landover', state: 'MD', conference: 'NFC', division: 'East' }
  ],
  
  NBA: [
    { name: 'Atlanta Hawks', city: 'Atlanta', state: 'GA', conference: 'Eastern', division: 'Southeast' },
    { name: 'Boston Celtics', city: 'Boston', state: 'MA', conference: 'Eastern', division: 'Atlantic' },
    { name: 'Brooklyn Nets', city: 'Brooklyn', state: 'NY', conference: 'Eastern', division: 'Atlantic' },
    { name: 'Charlotte Hornets', city: 'Charlotte', state: 'NC', conference: 'Eastern', division: 'Southeast' },
    { name: 'Chicago Bulls', city: 'Chicago', state: 'IL', conference: 'Eastern', division: 'Central' },
    { name: 'Cleveland Cavaliers', city: 'Cleveland', state: 'OH', conference: 'Eastern', division: 'Central' },
    { name: 'Dallas Mavericks', city: 'Dallas', state: 'TX', conference: 'Western', division: 'Southwest' },
    { name: 'Denver Nuggets', city: 'Denver', state: 'CO', conference: 'Western', division: 'Northwest' },
    { name: 'Detroit Pistons', city: 'Detroit', state: 'MI', conference: 'Eastern', division: 'Central' },
    { name: 'Golden State Warriors', city: 'San Francisco', state: 'CA', conference: 'Western', division: 'Pacific' },
    { name: 'Houston Rockets', city: 'Houston', state: 'TX', conference: 'Western', division: 'Southwest' },
    { name: 'Indiana Pacers', city: 'Indianapolis', state: 'IN', conference: 'Eastern', division: 'Central' },
    { name: 'Los Angeles Clippers', city: 'Los Angeles', state: 'CA', conference: 'Western', division: 'Pacific' },
    { name: 'Los Angeles Lakers', city: 'Los Angeles', state: 'CA', conference: 'Western', division: 'Pacific' },
    { name: 'Memphis Grizzlies', city: 'Memphis', state: 'TN', conference: 'Western', division: 'Southwest' },
    { name: 'Miami Heat', city: 'Miami', state: 'FL', conference: 'Eastern', division: 'Southeast' },
    { name: 'Milwaukee Bucks', city: 'Milwaukee', state: 'WI', conference: 'Eastern', division: 'Central' },
    { name: 'Minnesota Timberwolves', city: 'Minneapolis', state: 'MN', conference: 'Western', division: 'Northwest' },
    { name: 'New Orleans Pelicans', city: 'New Orleans', state: 'LA', conference: 'Western', division: 'Southwest' },
    { name: 'New York Knicks', city: 'New York', state: 'NY', conference: 'Eastern', division: 'Atlantic' },
    { name: 'Oklahoma City Thunder', city: 'Oklahoma City', state: 'OK', conference: 'Western', division: 'Northwest' },
    { name: 'Orlando Magic', city: 'Orlando', state: 'FL', conference: 'Eastern', division: 'Southeast' },
    { name: 'Philadelphia 76ers', city: 'Philadelphia', state: 'PA', conference: 'Eastern', division: 'Atlantic' },
    { name: 'Phoenix Suns', city: 'Phoenix', state: 'AZ', conference: 'Western', division: 'Pacific' },
    { name: 'Portland Trail Blazers', city: 'Portland', state: 'OR', conference: 'Western', division: 'Northwest' },
    { name: 'Sacramento Kings', city: 'Sacramento', state: 'CA', conference: 'Western', division: 'Pacific' },
    { name: 'San Antonio Spurs', city: 'San Antonio', state: 'TX', conference: 'Western', division: 'Southwest' },
    { name: 'Toronto Raptors', city: 'Toronto', state: 'ON', conference: 'Eastern', division: 'Atlantic' },
    { name: 'Utah Jazz', city: 'Salt Lake City', state: 'UT', conference: 'Western', division: 'Northwest' },
    { name: 'Washington Wizards', city: 'Washington', state: 'DC', conference: 'Eastern', division: 'Southeast' }
  ],
  
  MLB: [
    { name: 'Arizona Diamondbacks', city: 'Phoenix', state: 'AZ', conference: 'National', division: 'West' },
    { name: 'Atlanta Braves', city: 'Atlanta', state: 'GA', conference: 'National', division: 'East' },
    { name: 'Baltimore Orioles', city: 'Baltimore', state: 'MD', conference: 'American', division: 'East' },
    { name: 'Boston Red Sox', city: 'Boston', state: 'MA', conference: 'American', division: 'East' },
    { name: 'Chicago Cubs', city: 'Chicago', state: 'IL', conference: 'National', division: 'Central' },
    { name: 'Chicago White Sox', city: 'Chicago', state: 'IL', conference: 'American', division: 'Central' },
    { name: 'Cincinnati Reds', city: 'Cincinnati', state: 'OH', conference: 'National', division: 'Central' },
    { name: 'Cleveland Guardians', city: 'Cleveland', state: 'OH', conference: 'American', division: 'Central' },
    { name: 'Colorado Rockies', city: 'Denver', state: 'CO', conference: 'National', division: 'West' },
    { name: 'Detroit Tigers', city: 'Detroit', state: 'MI', conference: 'American', division: 'Central' },
    { name: 'Houston Astros', city: 'Houston', state: 'TX', conference: 'American', division: 'West' },
    { name: 'Kansas City Royals', city: 'Kansas City', state: 'MO', conference: 'American', division: 'Central' },
    { name: 'Los Angeles Angels', city: 'Anaheim', state: 'CA', conference: 'American', division: 'West' },
    { name: 'Los Angeles Dodgers', city: 'Los Angeles', state: 'CA', conference: 'National', division: 'West' },
    { name: 'Miami Marlins', city: 'Miami', state: 'FL', conference: 'National', division: 'East' },
    { name: 'Milwaukee Brewers', city: 'Milwaukee', state: 'WI', conference: 'National', division: 'Central' },
    { name: 'Minnesota Twins', city: 'Minneapolis', state: 'MN', conference: 'American', division: 'Central' },
    { name: 'New York Mets', city: 'New York', state: 'NY', conference: 'National', division: 'East' },
    { name: 'New York Yankees', city: 'New York', state: 'NY', conference: 'American', division: 'East' },
    { name: 'Oakland Athletics', city: 'Oakland', state: 'CA', conference: 'American', division: 'West' },
    { name: 'Philadelphia Phillies', city: 'Philadelphia', state: 'PA', conference: 'National', division: 'East' },
    { name: 'Pittsburgh Pirates', city: 'Pittsburgh', state: 'PA', conference: 'National', division: 'Central' },
    { name: 'San Diego Padres', city: 'San Diego', state: 'CA', conference: 'National', division: 'West' },
    { name: 'San Francisco Giants', city: 'San Francisco', state: 'CA', conference: 'National', division: 'West' },
    { name: 'Seattle Mariners', city: 'Seattle', state: 'WA', conference: 'American', division: 'West' },
    { name: 'St. Louis Cardinals', city: 'St. Louis', state: 'MO', conference: 'National', division: 'Central' },
    { name: 'Tampa Bay Rays', city: 'St. Petersburg', state: 'FL', conference: 'American', division: 'East' },
    { name: 'Texas Rangers', city: 'Arlington', state: 'TX', conference: 'American', division: 'West' },
    { name: 'Toronto Blue Jays', city: 'Toronto', state: 'ON', conference: 'American', division: 'East' },
    { name: 'Washington Nationals', city: 'Washington', state: 'DC', conference: 'National', division: 'East' }
  ],
  
  NHL: [
    { name: 'Anaheim Ducks', city: 'Anaheim', state: 'CA', conference: 'Western', division: 'Pacific' },
    { name: 'Arizona Coyotes', city: 'Tempe', state: 'AZ', conference: 'Western', division: 'Central' },
    { name: 'Boston Bruins', city: 'Boston', state: 'MA', conference: 'Eastern', division: 'Atlantic' },
    { name: 'Buffalo Sabres', city: 'Buffalo', state: 'NY', conference: 'Eastern', division: 'Atlantic' },
    { name: 'Calgary Flames', city: 'Calgary', state: 'AB', conference: 'Western', division: 'Pacific' },
    { name: 'Carolina Hurricanes', city: 'Raleigh', state: 'NC', conference: 'Eastern', division: 'Metropolitan' },
    { name: 'Chicago Blackhawks', city: 'Chicago', state: 'IL', conference: 'Western', division: 'Central' },
    { name: 'Colorado Avalanche', city: 'Denver', state: 'CO', conference: 'Western', division: 'Central' },
    { name: 'Columbus Blue Jackets', city: 'Columbus', state: 'OH', conference: 'Eastern', division: 'Metropolitan' },
    { name: 'Dallas Stars', city: 'Dallas', state: 'TX', conference: 'Western', division: 'Central' },
    { name: 'Detroit Red Wings', city: 'Detroit', state: 'MI', conference: 'Eastern', division: 'Atlantic' },
    { name: 'Edmonton Oilers', city: 'Edmonton', state: 'AB', conference: 'Western', division: 'Pacific' },
    { name: 'Florida Panthers', city: 'Sunrise', state: 'FL', conference: 'Eastern', division: 'Atlantic' },
    { name: 'Los Angeles Kings', city: 'Los Angeles', state: 'CA', conference: 'Western', division: 'Pacific' },
    { name: 'Minnesota Wild', city: 'St. Paul', state: 'MN', conference: 'Western', division: 'Central' },
    { name: 'Montreal Canadiens', city: 'Montreal', state: 'QC', conference: 'Eastern', division: 'Atlantic' },
    { name: 'Nashville Predators', city: 'Nashville', state: 'TN', conference: 'Western', division: 'Central' },
    { name: 'New Jersey Devils', city: 'Newark', state: 'NJ', conference: 'Eastern', division: 'Metropolitan' },
    { name: 'New York Islanders', city: 'Elmont', state: 'NY', conference: 'Eastern', division: 'Metropolitan' },
    { name: 'New York Rangers', city: 'New York', state: 'NY', conference: 'Eastern', division: 'Metropolitan' },
    { name: 'Ottawa Senators', city: 'Ottawa', state: 'ON', conference: 'Eastern', division: 'Atlantic' },
    { name: 'Philadelphia Flyers', city: 'Philadelphia', state: 'PA', conference: 'Eastern', division: 'Metropolitan' },
    { name: 'Pittsburgh Penguins', city: 'Pittsburgh', state: 'PA', conference: 'Eastern', division: 'Metropolitan' },
    { name: 'San Jose Sharks', city: 'San Jose', state: 'CA', conference: 'Western', division: 'Pacific' },
    { name: 'Seattle Kraken', city: 'Seattle', state: 'WA', conference: 'Western', division: 'Pacific' },
    { name: 'St. Louis Blues', city: 'St. Louis', state: 'MO', conference: 'Western', division: 'Central' },
    { name: 'Tampa Bay Lightning', city: 'Tampa', state: 'FL', conference: 'Eastern', division: 'Atlantic' },
    { name: 'Toronto Maple Leafs', city: 'Toronto', state: 'ON', conference: 'Eastern', division: 'Atlantic' },
    { name: 'Vancouver Canucks', city: 'Vancouver', state: 'BC', conference: 'Western', division: 'Pacific' },
    { name: 'Vegas Golden Knights', city: 'Paradise', state: 'NV', conference: 'Western', division: 'Pacific' },
    { name: 'Washington Capitals', city: 'Washington', state: 'DC', conference: 'Eastern', division: 'Metropolitan' },
    { name: 'Winnipeg Jets', city: 'Winnipeg', state: 'MB', conference: 'Western', division: 'Central' }
  ]
};

// Stadium/arena data
const stadiums = {
  NFL: [
    'Arrowhead Stadium', 'AT&T Stadium', 'Allegiant Stadium', 'Bank of America Stadium',
    'Caesars Superdome', 'Empower Field at Mile High', 'FedExField', 'Ford Field',
    'Gillette Stadium', 'Hard Rock Stadium', 'Heinz Field', 'Lambeau Field',
    'Levi\'s Stadium', 'Lincoln Financial Field', 'Lucas Oil Stadium',
    'M&T Bank Stadium', 'Mercedes-Benz Stadium', 'MetLife Stadium',
    'NRG Stadium', 'Nissan Stadium', 'Paul Brown Stadium', 'Paycor Stadium',
    'Raymond James Stadium', 'SoFi Stadium', 'Soldier Field', 'State Farm Stadium',
    'TIAA Bank Field', 'U.S. Bank Stadium'
  ],
  NBA: [
    'Crypto.com Arena', 'Chase Center', 'Madison Square Garden', 'TD Garden',
    'American Airlines Center', 'Ball Arena', 'Capital One Arena',
    'FedExForum', 'Fiserv Forum', 'Footprint Center', 'FTX Arena',
    'Gainbridge Fieldhouse', 'Golden 1 Center', 'Little Caesars Arena',
    'Moda Center', 'Paycom Center', 'Rocket Mortgage FieldHouse',
    'Smoothie King Center', 'Spectrum Center', 'State Farm Arena',
    'Target Center', 'Toyota Center', 'United Center', 'Wells Fargo Center'
  ],
  MLB: [
    'Angel Stadium', 'Busch Stadium', 'Citi Field', 'Citizens Bank Park',
    'Comerica Park', 'Coors Field', 'Dodger Stadium', 'Fenway Park',
    'Globe Life Field', 'Great American Ball Park', 'Guaranteed Rate Field',
    'Kauffman Stadium', 'LoanDepot Park', 'Minute Maid Park', 'Nationals Park',
    'Oracle Park', 'Oriole Park at Camden Yards', 'Petco Park',
    'PNC Park', 'Progressive Field', 'Rogers Centre', 'T-Mobile Park',
    'Target Field', 'Tropicana Field', 'Truist Park', 'Wrigley Field',
    'Yankee Stadium'
  ],
  NHL: [
    'Amalie Arena', 'Ball Arena', 'Bell Centre', 'Bridgestone Arena',
    'Canadian Tire Centre', 'Capital One Arena', 'Enterprise Center',
    'FLA Live Arena', 'Gila River Arena', 'Honda Center', 'Little Caesars Arena',
    'Madison Square Garden', 'Nationwide Arena', 'PPG Paints Arena',
    'Prudential Center', 'Rogers Arena', 'Rogers Place', 'SAP Center',
    'Scotiabank Arena', 'Scotiabank Saddledome', 'T-Mobile Arena',
    'TD Garden', 'United Center', 'UBS Arena', 'Wells Fargo Center',
    'Xcel Energy Center'
  ]
};

// Team colors
const teamColors = {
  NFL: [
    ['#97233F', '#000000'], // Cardinals
    ['#A71930', '#000000'], // Falcons
    ['#241773', '#9E7C0C'], // Ravens
    ['#00338D', '#C60C30'], // Bills
    ['#0085CA', '#000000'], // Panthers
    ['#0B162A', '#C83803'], // Bears
    ['#FB4F14', '#000000'], // Bengals
    ['#311D00', '#FF3C00'], // Browns
    ['#041E42', '#869397'], // Cowboys
    ['#FB4F14', '#002244'], // Broncos
    ['#0076B6', '#B0B7BC'], // Lions
    ['#203731', '#FFB612'], // Packers
    ['#03202F', '#A71930'], // Texans
    ['#002C5F', '#A2AAAD'], // Colts
    ['#006778', '#9F792C'], // Jaguars
    ['#E31837', '#FFB81C'], // Chiefs
    ['#000000', '#A5ACAF'], // Raiders
    ['#0080C6', '#FFC20E'], // Chargers
    ['#003594', '#FFA300'], // Rams
    ['#008E97', '#FC4C02'], // Dolphins
    ['#4F2683', '#FFC62F'], // Vikings
    ['#002244', '#C60C30'], // Patriots
    ['#D3BC8D', '#000000'], // Saints
    ['#0B2265', '#A71930'], // Giants
    ['#125740', '#000000'], // Jets
    ['#004C54', '#A5ACAF'], // Eagles
    ['#FFB612', '#101820'], // Steelers
    ['#AA0000', '#B3995D'], // 49ers
    ['#002244', '#69BE28'], // Seahawks
    ['#D50A0A', '#FF7900'], // Buccaneers
    ['#0C2340', '#4B92DB'], // Titans
    ['#5A1414', '#FFB612']  // Commanders
  ],
  // ... similar arrays for NBA, MLB, NHL
};

function generateTeams() {
  const generatedTeams = {
    NFL: [],
    NBA: [],
    MLB: [],
    NHL: []
  };
  
  let teamId = 1;
  
  // Generate teams for each sport
  Object.keys(allTeams).forEach(sport => {
    console.log(`Generating ${sport} teams...`);
    
    const sportTeams = allTeams[sport];
    const sportStadiums = stadiums[sport] || [];
    const sportColors = teamColors[sport] || [];
    
    sportTeams.forEach((team, index) => {
      // Generate realistic record
      const wins = Math.floor(Math.random() * 12) + 4; // 4-15 wins
      const losses = 16 - wins; // For NFL
      const ties = sport === 'NFL' ? Math.floor(Math.random() * 2) : 0;
      
      // Generate team stats
      const pointsFor = wins * 25 + Math.floor(Math.random() * 100);
      const pointsAgainst = losses * 20 + Math.floor(Math.random() * 80);
      
      const teamData = {
        id: teamId++,
        name: team.name,
        city: team.city,
        state: team.state,
        abbreviation: team.name.split(' ').pop(), // Last word as abbreviation
        conference: team.conference,
        division: team.division,
        colors: sportColors[index % sportColors.length] || ['#000000', '#FFFFFF'],
        stadium: sportStadiums[index % sportStadiums.length] || `${team.city} Stadium`,
        capacity: Math.floor(Math.random() * 20000) + 60000, // 60k-80k capacity
        coach: `Coach ${['Smith', 'Johnson', 'Williams', 'Jones', 'Brown'][index % 5]}`,
        established: 1900 + Math.floor(Math.random() * 120), // 1900-2020
        championships: Math.floor(Math.random() * 6),
        superBowls: sport === 'NFL' ? Math.floor(Math.random() * 4) : 0,
        players: [], // Will be populated with player IDs
        record: {
          wins,
          losses,
          ties,
          pointsFor,
          pointsAgainst,
          winPercentage: wins / (wins + losses + ties)
        },
        streak: Math.random() > 0.5 ? `${Math.floor(Math.random() * 4) + 1}W` : `${Math.floor(Math.random() * 3) + 1}L`,
        lastGame: `${Math.random() > 0.5 ? 'W' : 'L'} ${Math.floor(Math.random() * 30) + 10}-${Math.floor(Math.random() * 30) + 10}`,
        nextGame: `vs ${sportTeams[(index + 1) % sportTeams.length].name.split(' ').pop()}`,
        social: {
          twitter: `@${team.name.replace(/\s+/g, '')}`,
          website: `https://www.${team.name.toLowerCase().replace(/\s+/g, '')}.com`
        }
      };
      
      generatedTeams[sport].push(teamData);
    });
  });
  
  return generatedTeams;
}

// Main execution
const teams = generateTeams();
console.log(`Generated teams: NFL=${teams.NFL.length}, NBA=${teams.NBA.length}, MLB=${teams.MLB.length}, NHL=${teams.NHL.length}`);

// Save to file
const outputPath = path.join(__dirname, '../src/data/generatedTeams.json');
fs.writeFileSync(outputPath, JSON.stringify(teams, null, 2));
console.log(`Teams saved to: ${outputPath}`);

// Also create a JavaScript export file
const jsOutput = `export const teams = ${JSON.stringify(teams, null, 2)};\n\nexport default teams;`;
const jsOutputPath = path.join(__dirname, '../src/data/teams.js');
fs.writeFileSync(jsOutputPath, jsOutput);
console.log(`JavaScript teams file saved to: ${jsOutputPath}`);
