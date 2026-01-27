const fs = require('fs');
const path = require('path');

// Comprehensive stat categories for all sports
const statCategories = {
  NFL: {
    passing: [
      'passingYards', 'passingTDs', 'interceptions', 'completion', 'passerRating', 
      'qbr', 'passingAttempts', 'completions', 'yardsPerAttempt', 'sacks', 
      'sackYards', 'gameWinningDrives', 'fourthQuarterComebacks', 'airYards',
      'completedAirYards', 'intendedAirYards', 'passerRatingUnderPressure',
      'blitzCompletion', 'cleanPocketCompletion', 'deepBallCompletion',
      'redZoneCompletion', 'thirdDownCompletion', 'clutchCompletion',
      'playActionCompletion', 'noHuddleCompletion', 'playoffPasserRating'
    ],
    rushing: [
      'rushingYards', 'rushingTDs', 'rushingAttempts', 'yardsPerCarry', 'fumbles',
      'rushingFirstDowns', 'brokenTackles', 'yardsAfterContact', 'elusiveRating',
      'breakawayRuns', 'redZoneRushing', 'goalLineCarries', 'clutchRushingYards',
      'outsideRuns', 'insideRuns', 'gapRuns', 'successRate', 'explosiveRuns',
      'negativeRuns', 'rushGrade', 'visionGrade', 'powerGrade', 'speedGrade'
    ],
    receiving: [
      'receptions', 'receivingYards', 'receivingTDs', 'targets', 'yardsPerReception',
      'yardsAfterCatch', 'receivingFirstDowns', 'drops', 'catchableTargets',
      'catchRate', 'contestedCatches', 'separation', 'routeParticipation',
      'deepTargets', 'slotTargets', 'redZoneTargets', 'yardsPerRouteRun',
      'targetShare', 'airYardsShare', 'dominanceRating', 'clutchReceptions',
      'bigPlayReceptions', 'brokenTacklesAfterCatch', 'releaseGrade',
      'handsGrade', 'routeRunningGrade'
    ],
    defense: [
      'tackles', 'soloTackles', 'assistedTackles', 'sacks', 'sackYards',
      'tacklesForLoss', 'qbHits', 'pressures', 'hurries', 'qbKnockdowns',
      'interceptions', 'passesDefended', 'forcedFumbles', 'fumbleRecoveries',
      'safeties', 'defensiveTDs', 'missedTackles', 'tackleEfficiency',
      'runStopPercentage', 'passRushWinRate', 'coverageSnaps',
      'yardsAllowedInCoverage', 'completionAllowed', 'qbRatingAllowed',
      'blitzRate', 'runDefenseGrade', 'passRushGrade', 'coverageGrade',
      'clutchStops', 'gameChangingPlays'
    ],
    specialTeams: [
      'fieldGoals', 'fieldGoalPercentage', 'extraPoints', 'puntingYards',
      'puntAverage', 'netPuntAverage', 'puntsInside20', 'touchbacks',
      'kickoffReturns', 'puntReturns', 'returnYards', 'returnTDs',
      'fairCatches', 'specialTeamsTackles', 'blockedKicks', 'onsideKicks',
      'clutchKicks', 'gameWinningFieldGoals', 'pressureKicks', 'windAdjustedAccuracy'
    ],
    advanced: [
      'epa', 'wpa', 'cp', 'successRate', 'defenseAdjustedValueOverAverage',
      'quarterbackAdjustedNetYardsPerAttempt', 'expectedPointsAdded',
      'winProbabilityAdded', 'completionProbability', 'airYardsToSticks',
      'passBlockWinRate', 'runBlockWinRate', 'receiverSeparation',
      'quarterbackTimeToThrow', 'passRushWinRate', 'runStopWinRate',
      'coverageSnapRate', 'targetedReceiverRating', 'defensiveHavocRate'
    ],
    subjective: [
      'leadership', 'clutchFactor', 'footballIQ', 'durability', 'consistency',
      'intangibles', 'workEthic', 'teamPlayer', 'competitiveness', 'poise',
      'vision', 'decisionMaking', 'pocketPresence', 'ballSecurity',
      'playRecognition', 'instincts', 'physicality', 'versatility',
      'bigGamePerformance', 'comebackAbility'
    ],
    fantasy: [
      'fantasyPoints', 'fantasyPointsPerGame', 'consistencyRating',
      'boomGames', 'bustGames', 'fantasyValueOverReplacement',
      'projectedPoints', 'upside', 'floor', 'weeklyVolatility',
      'playoffScheduleDifficulty', 'weatherImpact', 'matchupAdvantage'
    ]
  },
  
  NBA: {
    scoring: [
      'points', 'pointsPerGame', 'fieldGoalPercentage', 'freeThrowPercentage',
      'threePointPercentage', 'effectiveFieldGoalPercentage', 'trueShootingPercentage',
      'fieldGoalAttempts', 'fieldGoalsMade', 'freeThrowAttempts', 'freeThrowsMade',
      'threePointAttempts', 'threePointersMade', 'pointsInPaint', 'fastBreakPoints',
      'secondChancePoints', 'pointsOffTurnovers', 'clutchPoints', 'scoringEfficiency',
      'shotDistribution', 'shotQuality', 'contestedShotPercentage', 'openShotPercentage',
      'isolationScoring', 'pickAndRollScoring', 'postUpScoring', 'spotUpScoring',
      'offScreenScoring', 'handoffScoring', 'cutScoring', 'putbacks'
    ],
    playmaking: [
      'assists', 'assistsPerGame', 'assistToTurnoverRatio', 'potentialAssists',
      'secondaryAssists', 'hockeyAssists', 'passAccuracy', 'assistPointsCreated',
      'driveAssists', 'pickAndRollAssists', 'postAssists', 'skipPasses',
      'courtVision', 'passingCreativity', 'decisionMakingSpeed', 'transitionPassing',
      'halfCourtPassing', 'clutchAssists', 'assistPercentage', 'turnovers',
      'badPassTurnovers', 'lostBallTurnovers', 'offensiveFouls', 'passingLanes'
    ],
    rebounding: [
      'rebounds', 'reboundsPerGame', 'offensiveRebounds', 'defensiveRebounds',
      'reboundPercentage', 'contestedRebounds', 'uncontestedRebounds',
      'boxOuts', 'reboundChances', 'reboundEfficiency', 'putbackAttempts',
      'reboundPositioning', 'reboundTiming', 'reboundStrength',
      'offensiveReboundImpact', 'defensiveReboundImpact', 'teamReboundPercentage'
    ],
    defense: [
      'steals', 'blocks', 'deflections', 'chargesDrawn', 'defensiveStops',
      'defensiveRating', 'defensiveWinShares', 'defensiveBoxPlusMinus',
      'opponentFieldGoalPercentage', 'opponentThreePointPercentage',
      'onBallDefense', 'offBallDefense', 'helpDefense', 'pickAndRollDefense',
      'postDefense', 'isolationDefense', 'closeOuts', 'contestRate',
      'rimProtection', 'defensiveVersatility', 'defensiveCommunication',
      'defensiveAwareness', 'transitionDefense', 'clutchDefense'
    ],
    advanced: [
      'playerEfficiencyRating', 'winShares', 'winSharesPer48',
      'valueOverReplacementPlayer', 'boxPlusMinus', 'plusMinus',
      'netRating', 'offensiveRating', 'usageRate', 'pace',
      'offensiveLoad', 'clutchNetRating', 'catchAndShoot',
      'pullUpShooting', 'drives', 'touches', 'timeOfPossession',
      'averageShotDistance', 'shotClockUsage', 'spacingImpact',
      'gravityRating', 'screenAssists', 'screenAssistPoints',
      'hustleStats', 'looseBallsRecovered', 'distanceTraveled',
      'speedAverage', 'impactMetrics', 'LEBRON', 'RAPTOR', 'EPM'
    ],
    subjective: [
      'basketballIQ', 'clutchFactor', 'leadership', 'durability',
      'versatility', 'motor', 'competitiveness', 'confidence',
      'poise', 'focus', 'resilience', 'adaptability', 'creativity',
      'instincts', 'courtVision', 'handles', 'footwork',
      'shootingForm', 'defensiveStance', 'transitionSpeed',
      'postMoves', 'finishingAbility', 'shotSelection',
      'teamChemistry', 'coachability', 'bigMomentPerformer'
    ],
    fantasy: [
      'fantasyPoints', 'fantasyPointsPerGame', 'doubleDoubles',
      'tripleDoubles', 'fantasyValue', 'consistencyScore',
      'volatilityIndex', 'scheduleDifficulty', 'restDaysImpact',
      'backToBackPerformance', 'homeRoadSplit', 'matchupRating',
      'injuryRisk', 'minutesProjection', 'usageProjection',
      'categoryImpact', 'rosterConstructionValue', 'tradeValue',
      'keeperValue', 'dynastyValue', 'playoffSchedule'
    ],
    analytics: [
      'shotCharts', 'heatMaps', 'defensiveMatchupData',
      'onOffCourtImpact', 'lineupData', 'clutchPerformance',
      'playTypeEfficiency', 'timeScoreSituations', 'momentumMetrics',
      'pressureSituations', 'fatigueMetrics', 'travelImpact',
      'elevationImpact', 'timeZoneImpact', 'rivalryPerformance',
      'primetimePerformance', 'playoffExperience', 'championshipPedigree'
    ]
  },
  
  NHL: {
    scoring: [
      'goals', 'assists', 'points', 'plusMinus', 'powerPlayGoals',
      'powerPlayPoints', 'shortHandedGoals', 'gameWinningGoals',
      'overtimeGoals', 'shootoutGoals', 'shotsOnGoal', 'shootingPercentage',
      'shotAttempts', 'scoringChances', 'highDangerChances', 'expectedGoals',
      'goalsAboveExpected', 'shotQuality', 'reboundGoals', 'tipGoals',
      'wrapAroundGoals', 'breakawayGoals', 'oneTimerGoals', 'clutchGoals',
      'emptyNetGoals', 'shotLocations', 'shotAngles', 'releaseSpeed',
      'accuracy', 'finishingAbility', 'playmakingVision'
    ],
    playmaking: [
      'primaryAssists', 'secondaryAssists', 'assistQuality',
      'passCompletion', 'passingLanes', 'transitionPasses',
      'zoneEntries', 'zoneExits', 'breakoutPasses', 'saucerPasses',
      'crossIcePasses', 'noLookPasses', 'passingCreativity',
      'decisionMaking', 'hockeySense', 'anticipation', 'vision',
      'playmakingUnderPressure', 'clutchAssists', 'playoffAssists'
    ],
    physical: [
      'hits', 'blockedShots', 'penaltyMinutes', 'faceoffWins',
      'faceoffPercentage', 'takeaways', 'giveaways', 'boardBattles',
      'netFrontPresence', 'physicality', 'aggressiveness', 'strength',
      'balance', 'endurance', 'recovery', 'durability', 'grit',
      'toughness', 'willingnessToBattle', 'puckProtection',
      'forecheckPressure', 'backcheckEffort', 'gapControl'
    ],
    defense: [
      'defensiveZoneStarts', 'defensiveZoneCoverage', 'shotSuppression',
      'scoringChancesAgainst', 'highDangerChancesAgainst', 'expectedGoalsAgainst',
      'goalsAgainst', 'defensiveResponsibility', 'positioning',
      'stickChecking', 'bodyChecking', 'angling', 'gapControl',
      'transitionDefense', 'penaltyKillTime', 'shotBlocks',
      'clearingAttempts', 'zoneClearance', 'defensiveAwareness',
      'communication', 'leadershipOnIce', 'clutchDefensivePlays'
    ],
    goalie: [
      'savePercentage', 'goalsAgainstAverage', 'highDangerSavePercentage',
      'lowDangerSavePercentage', 'fiveHoleSavePercentage', 'gloveSavePercentage',
      'blockerSavePercentage', 'reboundControl', 'puckHandling',
      'positioning', 'angles', 'depthControl', 'creaseMovement',
      'recoverySpeed', 'postToPostSpeed', 'butterflyEfficiency',
      'screenVisibility', 'deflectionReads', 'breakawaySaves',
      'penaltyShotSaves', 'shootoutSaves', 'clutchSaves',
      'gameSavingStops', 'steals', 'qualityStarts', 'reallyBadStarts',
      'goalsSavedAboveExpected', 'goalsSavedAboveAverage'
    ],
    advanced: [
      'corsiForPercentage', 'fenwickForPercentage', 'pdo',
      'expectedGoalsPercentage', 'scoringChancesPercentage',
      'highDangerChancesPercentage', 'zoneStarts', 'qualityOfCompetition',
      'qualityOfTeammates', 'timeOnIce', 'shiftsPerGame', 'shiftLength',
      'onIceSavePercentage', 'onIceShootingPercentage', 'onIceGoalsFor',
      'onIceGoalsAgainst', 'winsAboveReplacement', 'goalsAboveReplacement',
      'pointsAboveReplacement', 'playerImpact', 'isolatedImpact',
      'microstats', 'transitionMetrics', 'offensiveZoneTime',
      'defensiveZoneTime', 'neutralZoneTime', 'puckPossessionTime'
    ],
    subjective: [
      'hockeyIQ', 'clutchFactor', 'leadership', 'competeLevel',
      'poise', 'confidence', 'resilience', 'adaptability',
      'creativity', 'instincts', 'vision', 'handEyeCoordination',
      'skatingAbility', 'edgeWork', 'acceleration', 'topSpeed',
      'agility', 'balance', 'strengthOnPuck', 'battleLevel',
      'teamFirstMentality', 'coachability', 'professionalism',
      'bigGamePerformer', 'playoffPerformer', 'championshipExperience'
    ],
    fantasy: [
      'fantasyPoints', 'fantasyPointsPerGame', 'shutouts',
      'goalScorerBonus', 'assistBonus', 'powerPlayPoints',
      'shortHandedPoints', 'gameWinningGoals', 'shotsOnGoal',
      'hits', 'blocks', 'faceoffWins', 'plusMinus',
      'penaltyMinutes', 'consistencyRating', 'volatility',
      'scheduleStrength', 'backToBackPerformance',
      'homeRoadSplits', 'matchupAdvantage', 'lineChemistry',
      'powerPlayTime', 'penaltyKillTime', 'injuryRisk',
      'minutesProjection', 'keeperValue', 'dynastyValue'
    ],
    analytics: [
      'shotHeatMaps', 'passingNetworks', 'zoneEntryData',
      'zoneExitData', 'forecheckingData', 'backcheckingData',
      'puckRecoveryData', 'turnoverData', 'giveawayLocations',
      'takeawayLocations', 'defensiveZoneCoverageMaps',
      'offensiveZoneSetup', 'neutralZoneTrapEfficiency',
      'transitionSpeed', 'puckPossessionMetrics', 'cycleGameMetrics',
      'rushGameMetrics', 'specialTeamsEfficiency', 'clutchMetrics',
      'momentumMetrics', 'fatigueMetrics', 'travelMetrics'
    ]
  },
  
  MLB: {
    batting: [
      'battingAverage', 'onBasePercentage', 'sluggingPercentage', 'ops',
      'woba', 'wrcPlus', 'homeRuns', 'runsBattedIn', 'runs', 'stolenBases',
      'hits', 'doubles', 'triples', 'walks', 'strikeouts', 'intentionalWalks',
      'hitByPitch', 'sacrificeFlies', 'sacrificeBunts', 'groundIntoDoublePlays',
      'extraBaseHits', 'totalBases', 'isolatedPower', 'battingAverageOnBallsInPlay',
      'hardHitPercentage', 'barrelPercentage', 'exitVelocity', 'launchAngle',
      'sprayChart', 'pullPercentage', 'oppositeFieldPercentage', 'clutchHitting',
      'runnersInScoringPosition', 'twoOutRbi', 'lateInningPressure',
      'walkOffHits', 'gameWinningRbi', 'qualityAtBats', 'plateDiscipline',
      'chaseRate', 'contactRate', 'swingStrikeRate', 'firstPitchSwing',
      'twoStrikeHitting', 'pinchHitting', 'leadoffHitting', 'cleanupHitting'
    ],
    pitching: [
      'earnedRunAverage', 'whip', 'wins', 'losses', 'saves', 'holds',
      'blownSaves', 'inningsPitched', 'strikeouts', 'walks', 'hitsAllowed',
      'homeRunsAllowed', 'completeGames', 'shutouts', 'qualityStarts',
      'noHitters', 'perfectGames', 'eraPlus', 'fip', 'xfip', 'siera',
      'strikeoutPercentage', 'walkPercentage', 'homeRunPercentage',
      'strikeoutToWalkRatio', 'battingAverageAgainst', 'onBasePercentageAgainst',
      'sluggingPercentageAgainst', 'opsAgainst', 'wobaAgainst',
      'leftOnBasePercentage', 'groundBallPercentage', 'flyBallPercentage',
      'lineDrivePercentage', 'popUpPercentage', 'swingingStrikePercentage',
      'calledStrikePercentage', 'firstPitchStrikePercentage',
      'pitchVelocity', 'pitchMovement', 'spinRate', 'releasePoint',
      'pitchMix', 'fastballUsage', 'breakingBallUsage', 'offspeedUsage',
      'clutchPitching', 'highLeverageSituations', 'basesLoadedSituations',
      'bullpenPerformance', 'starterPerformance', 'openerPerformance'
    ],
    fielding: [
      'fieldingPercentage', 'errors', 'putouts', 'assists', 'doublePlays',
      'triplePlays', 'defensiveRunsSaved', 'ultimateZoneRating',
      'outsAboveAverage', 'armStrength', 'armAccuracy', 'throwingAccuracy',
      'range', 'reactionTime', 'firstStep', 'footwork', 'gloveWork',
      'transferSpeed', 'taggingAbility', 'blockingAbility',
      'framing', 'pitchFramingRuns', 'catcherEra', 'stolenBaseAttemptsAgainst',
      'caughtStealingPercentage', 'popTime', 'infieldRange', 'outfieldRange',
      'jump', 'routeEfficiency', 'wallPlay', 'divingCatches',
      'overTheShoulderCatches', 'situationalFielding', 'clutchDefense'
    ],
    baserunning: [
      'stolenBases', 'caughtStealing', 'stolenBasePercentage',
      'baserunningRuns', 'ultimateBaseRunning', 'extraBasesTaken',
      'firstToThird', 'secondToHome', 'firstToHome', 'taggingUp',
      'sacrificeBunts', 'squeezePlays', 'delayedSteals', 'doubleSteals',
      'pickoffEscapes', 'rundownEscapes', 'speedScore', 'homeToFirstTime',
      'firstToSecondTime', 'secondToThirdTime', 'thirdToHomeTime',
      'jump', 'instincts', 'aggressiveness', 'smartBaserunning'
    ],
    advanced: [
      'war', 'offensiveWar', 'defensiveWar', 'pitchingWar',
      'baserunningWar', 'replacementLevel', 'leverageIndex',
      'winProbabilityAdded', 'contextNeutralWins', 'clutch',
      'baseRuns', 'expectedBattingAverage', 'expectedSlugging',
      'expectedwOBA', 'expectedERA', 'expectedFIP', 'pitchValues',
      'pitchArsenalScore', 'pitchQuality', 'battedBallProfile',
      'sprayChartAnalysis', 'zoneProfile', 'hotColdZones',
      'platoonSplits', 'homeRoadSplits', 'dayNightSplits',
      'stadiumFactors', 'weatherImpact', 'altitudeImpact'
    ],
    subjective: [
      'baseballIQ', 'clutchFactor', 'leadership', 'durability',
      'consistency', 'makeup', 'workEthic', 'teamPlayer',
      'competitiveness', 'poise', 'focus', 'resilience',
      'adaptability', 'instincts', 'vision', 'handEyeCoordination',
      'athleticism', 'rawPower', 'batSpeed', 'pitchRecognition',
      'plateVision', 'twoStrikeApproach', 'situationalHitting',
      'pitchExecution', 'gameCalling', 'fieldGeneral', 'clubhousePresence',
      'mentorship', 'professionalism', 'bigGamePerformer'
    ],
    fantasy: [
      'fantasyPoints', 'fantasyPointsPerGame', 'categoryImpact',
      'rotoValue', 'pointsLeagueValue', 'headToHeadValue',
      'consistencyScore', 'volatilityIndex', 'scheduleStrength',
      'ballparkFactors', 'weatherFactors', 'platoonAdvantage',
      'lineupProtection', 'positionEligibility', 'injuryRisk',
      'playingTimeProjection', 'prospectStatus', 'keeperValue',
      'dynastyValue', 'tradeValue', 'waiverWirePriority',
      'streamingCandidate', 'playoffSchedule', 'championshipWeek'
    ],
    analytics: [
      'sabermetrics', 'advancedScoutingReports', 'sprayChartData',
      'pitchTrackingData', 'hitTrackingData', 'defensiveShifts',
      'shiftEffectiveness', 'launchAngleAdjustments', 'exitVelocityTrends',
      'pitchUsageTrends', 'battedBallProfileTrends', 'plateDisciplineTrends',
      'clutchPerformanceData', 'pressureSituations', 'lateAndClose',
      'extraInningsPerformance', 'interleaguePerformance',
      'divisionalPerformance', 'rivalryPerformance', 'playoffAtmosphere',
      'championshipExperience', 'legacyMetrics', 'historicalComparisons'
    ]
  }
};

// Generate comprehensive stat leaders with advanced metrics
function generateStatLeaders(playersData) {
  const statLeaders = {
    NFL: {},
    NBA: {},
    MLB: {},
    NHL: {}
  };
  
  // Process each sport
  Object.keys(playersData).forEach(sport => {
    const players = playersData[sport] || [];
    
    console.log(`Generating advanced stats for ${sport}...`);
    
    // Add advanced analytics to each player
    players.forEach(player => {
      if (!player.advancedStats) player.advancedStats = {};
      if (!player.subjectiveStats) player.subjectiveStats = {};
      if (!player.analytics) player.analytics = {};
      
      // Generate sport-specific advanced stats
      generateAdvancedStatsForPlayer(player, sport);
    });
    
    // Process each stat category
    if (statCategories[sport]) {
      Object.keys(statCategories[sport]).forEach(category => {
        const categoryStats = statCategories[sport][category];
        
        categoryStats.forEach(stat => {
          // For each stat, create leaderboard
          const leaders = generateLeadersForStat(players, stat, category, sport);
          
          if (leaders.length > 0) {
            if (!statLeaders[sport][category]) {
              statLeaders[sport][category] = {};
            }
            statLeaders[sport][category][stat] = leaders;
          }
        });
      });
    }
  });
  
  return statLeaders;
}

function generateAdvancedStatsForPlayer(player, sport) {
  // Generate advanced analytics based on sport
  switch(sport) {
    case 'NFL':
      generateNFLAdvancedStats(player);
      generateNFLSubjectiveStats(player);
      generateNFLAnalytics(player);
      break;
    case 'NBA':
      generateNBAAdvancedStats(player);
      generateNBASubjectiveStats(player);
      generateNBAAnalytics(player);
      break;
    case 'NHL':
      generateNHLAdvancedStats(player);
      generateNHLSubjectiveStats(player);
      generateNHLAnalytics(player);
      break;
    case 'MLB':
      generateMLBAdvancedStats(player);
      generateMLBSubjectiveStats(player);
      generateMLBAnalytics(player);
      break;
  }
}

// NFL Advanced Stats
function generateNFLAdvancedStats(player) {
  if (!player.stats) return;
  
  const stats = player.stats;
  const adv = player.advancedStats;
  
  // Expected Points Added (EPA)
  adv.epa = (Math.random() * 100 - 20).toFixed(1);
  
  // Win Probability Added (WPA)
  adv.wpa = (Math.random() * 1.5 - 0.5).toFixed(2);
  
  // Success Rate
  adv.successRate = (Math.random() * 30 + 45).toFixed(1) + '%';
  
  // Defense-Adjusted Value Over Average (DVOA)
  adv.dvoa = (Math.random() * 40 - 10).toFixed(1) + '%';
  
  // Pass Block Win Rate for linemen
  if (['OL', 'OT', 'OG', 'C'].some(pos => player.position.includes(pos))) {
    adv.passBlockWinRate = (Math.random() * 20 + 75).toFixed(1) + '%';
    adv.runBlockWinRate = (Math.random() * 20 + 75).toFixed(1) + '%';
  }
  
  // Pass Rush Win Rate for defensive players
  if (['DE', 'DT', 'EDGE', 'OLB'].some(pos => player.position.includes(pos))) {
    adv.passRushWinRate = (Math.random() * 30 + 40).toFixed(1) + '%';
    adv.pressures = Math.floor(Math.random() * 30 + 10);
    adv.hurries = Math.floor(Math.random() * 20 + 5);
  }
  
  // Coverage metrics for defensive backs
  if (['CB', 'S', 'FS', 'SS', 'DB'].some(pos => player.position.includes(pos))) {
    adv.coverageSnaps = Math.floor(Math.random() * 500 + 200);
    adv.targetedReceiverRating = (Math.random() * 50 + 60).toFixed(1);
    adv.completionAllowed = Math.floor(Math.random() * 40 + 20);
    adv.yardsAllowed = Math.floor(Math.random() * 500 + 200);
  }
  
  // Quarterback specific metrics
  if (player.position === 'QB') {
    adv.airYardsToSticks = (Math.random() * 2 - 1).toFixed(1);
    adv.completionProbability = (Math.random() * 20 + 60).toFixed(1) + '%';
    adv.timeToThrow = (Math.random() * 1 + 2.5).toFixed(2) + 's';
    adv.blitzCompletion = (Math.random() * 20 + 55).toFixed(1) + '%';
    adv.cleanPocketCompletion = (Math.random() * 15 + 65).toFixed(1) + '%';
    adv.deepBallCompletion = (Math.random() * 25 + 35).toFixed(1) + '%';
    adv.redZoneCompletion = (Math.random() * 20 + 55).toFixed(1) + '%';
  }
  
  // Receiver specific metrics
  if (['WR', 'TE'].includes(player.position)) {
    adv.separation = (Math.random() * 2 + 1.5).toFixed(2) + ' yards';
    adv.yardsPerRouteRun = (Math.random() * 2 + 1.2).toFixed(2);
    adv.targetShare = (Math.random() * 20 + 15).toFixed(1) + '%';
    adv.airYardsShare = (Math.random() * 20 + 15).toFixed(1) + '%';
    adv.contestedCatchRate = (Math.random() * 30 + 40).toFixed(1) + '%';
  }
  
  // Running back specific metrics
  if (player.position === 'RB') {
    adv.elusiveRating = Math.floor(Math.random() * 100);
    adv.yardsAfterContact = Math.floor((stats.rushingYards || 0) * 0.4);
    adv.brokenTackles = Math.floor(Math.random() * 20 + 10);
    adv.successRate = (Math.random() * 20 + 45).toFixed(1) + '%';
    adv.explosiveRunRate = (Math.random() * 15 + 5).toFixed(1) + '%';
  }
}

function generateNFLSubjectiveStats(player) {
  const sub = player.subjectiveStats;
  
  // Subjective ratings (1-10 scale)
  sub.leadership = Math.floor(Math.random() * 3 + 7); // 7-10
  sub.clutchFactor = Math.floor(Math.random() * 4 + 6); // 6-10
  sub.footballIQ = Math.floor(Math.random() * 3 + 7); // 7-10
  sub.durability = Math.floor(Math.random() * 3 + 7); // 7-10
  sub.consistency = Math.floor(Math.random() * 3 + 6); // 6-9
  sub.intangibles = Math.floor(Math.random() * 3 + 7); // 7-10
  sub.workEthic = Math.floor(Math.random() * 3 + 7); // 7-10
  sub.teamPlayer = Math.floor(Math.random() * 3 + 7); // 7-10
  sub.competitiveness = Math.floor(Math.random() * 3 + 7); // 7-10
  sub.poise = Math.floor(Math.random() * 3 + 6); // 6-9
  
  // Position-specific subjective stats
  if (player.position === 'QB') {
    sub.pocketPresence = Math.floor(Math.random() * 3 + 7);
    sub.decisionMaking = Math.floor(Math.random() * 3 + 7);
    sub.vision = Math.floor(Math.random() * 3 + 7);
    sub.ballSecurity = Math.floor(Math.random() * 3 + 7);
    sub.playRecognition = Math.floor(Math.random() * 3 + 7);
  }
  
  if (['WR', 'TE'].includes(player.position)) {
    sub.routeRunning = Math.floor(Math.random() * 3 + 7);
    sub.hands = Math.floor(Math.random() * 3 + 7);
    sub.bodyControl = Math.floor(Math.random() * 3 + 7);
    sub.contestedCatchAbility = Math.floor(Math.random() * 3 + 7);
  }
  
  if (player.position === 'RB') {
    sub.vision = Math.floor(Math.random() * 3 + 7);
    sub.patience = Math.floor(Math.random() * 3 + 6);
    sub.burst = Math.floor(Math.random() * 3 + 7);
    sub.contactBalance = Math.floor(Math.random() * 3 + 7);
  }
}

function generateNFLAnalytics(player) {
  const analytics = player.analytics;
  
  // Predictive analytics
  analytics.nextGameProjection = {
    points: (Math.random() * 20 + 10).toFixed(1),
    yards: Math.floor(Math.random() * 100 + 150),
    touchdowns: Math.floor(Math.random() * 3 + 0.5),
    fantasyPoints: (Math.random() * 15 + 10).toFixed(1)
  };
  
  // Trend analytics
  analytics.trends = {
    last5Games: generateTrendData(5),
    seasonTrend: Math.random() > 0.5 ? 'improving' : 'stable',
    homeRoadSplit: {
      home: { avg: (Math.random() * 5 + 12).toFixed(1) },
      road: { avg: (Math.random() * 5 + 10).toFixed(1) }
    },
    divisionalPerformance: (Math.random() * 10 + 5).toFixed(1),
    primeTimePerformance: (Math.random() * 5 + 8).toFixed(1)
  };
  
  // Impact analytics
  analytics.impactMetrics = {
    teamWinRateWithPlayer: (Math.random() * 30 + 50).toFixed(1) + '%',
    teamPointsPerGameWithPlayer: (Math.random() * 7 + 24).toFixed(1),
    teamPointsPerGameWithoutPlayer: (Math.random() * 7 + 20).toFixed(1),
    clutchMoments: Math.floor(Math.random() * 10 + 5),
    gameWinningDrives: Math.floor(Math.random() * 5 + 1)
  };
}

// NBA Advanced Stats
function generateNBAAdvancedStats(player) {
  if (!player.stats) return;
  
  const stats = player.stats;
  const adv = player.advancedStats;
  
  // Advanced metrics
  adv.playerEfficiencyRating = (Math.random() * 15 + 15).toFixed(1);
  adv.winShares = (Math.random() * 5 + 3).toFixed(1);
  adv.winSharesPer48 = (Math.random() * 0.15 + 0.1).toFixed(3);
  adv.valueOverReplacementPlayer = (Math.random() * 3 + 1).toFixed(1);
  adv.boxPlusMinus = (Math.random() * 5 + 2).toFixed(1);
  adv.plusMinus = (Math.random() * 10 - 2).toFixed(1);
  adv.netRating = (Math.random() * 15 - 2).toFixed(1);
  adv.usageRate = (Math.random() * 15 + 15).toFixed(1) + '%';
  
  // Shooting analytics
  adv.effectiveFieldGoalPercentage = (Math.random() * 0.15 + 0.45).toFixed(3);
  adv.trueShootingPercentage = (Math.random() * 0.1 + 0.5).toFixed(3);
  adv.shotQuality = (Math.random() * 10 + 45).toFixed(1);
  adv.contestedShotPercentage = (Math.random() * 15 + 35).toFixed(1) + '%';
  adv.openShotPercentage = (Math.random() * 15 + 45).toFixed(1) + '%';
  
  // Play type efficiency
  adv.isolationEfficiency = (Math.random() * 0.3 + 0.9).toFixed(2) + ' PPP';
  adv.pickAndRollEfficiency = (Math.random() * 0.3 + 0.95).toFixed(2) + ' PPP';
  adv.postUpEfficiency = (Math.random() * 0.3 + 0.85).toFixed(2) + ' PPP';
  adv.spotUpEfficiency = (Math.random() * 0.3 + 1.05).toFixed(2) + ' PPP';
  adv.transitionEfficiency = (Math.random() * 0.4 + 1.1).toFixed(2) + ' PPP';
  
  // Defensive analytics
  adv.defensiveRating = (Math.random() * 10 + 105).toFixed(1);
  adv.defensiveWinShares = (Math.random() * 2 + 1).toFixed(1);
  adv.defensiveBoxPlusMinus = (Math.random() * 3 - 0.5).toFixed(1);
  adv.deflectionRate = Math.floor(Math.random() * 4 + 2) + '/game';
  adv.contestRate = (Math.random() * 15 + 40).toFixed(1) + '%';
  adv.rimProtection = (Math.random() * 10 + 50).toFixed(1) + '%';
  
  // Modern analytics
  adv.LEBRON = (Math.random() * 3 + 1).toFixed(1);
  adv.RAPTOR = (Math.random() * 4 + 1).toFixed(1);
  adv.EPM = (Math.random() * 3 + 1).toFixed(1);
  adv.gravityRating = (Math.random() * 10 + 60).toFixed(1);
  adv.spacingImpact = (Math.random() * 0.5 + 2).toFixed(2);
}

function generateNBASubjectiveStats(player) {
  const sub = player.subjectiveStats;
  
  // Subjective ratings (1-10 scale)
  sub.basketballIQ = Math.floor(Math.random() * 3 + 7);
  sub.clutchFactor = Math.floor(Math.random() * 4 + 6);
  sub.leadership = Math.floor(Math.random() * 3 + 7);
  sub.durability = Math.floor(Math.random() * 3 + 7);
  sub.versatility = Math.floor(Math.random() * 4 + 6);
  sub.motor = Math.floor(Math.random() * 3 + 7);
  sub.competitiveness = Math.floor(Math.random() * 3 + 7);
  sub.confidence = Math.floor(Math.random() * 3 + 7);
  sub.poise = Math.floor(Math.random() * 3 + 6);
  sub.focus = Math.floor(Math.random() * 3 + 7);
  
  // Skill-specific subjective stats
  sub.courtVision = Math.floor(Math.random() * 3 + 7);
  sub.handles = Math.floor(Math.random() * 3 + 7);
  sub.footwork = Math.floor(Math.random() * 3 + 7);
  sub.shootingForm = Math.floor(Math.random() * 3 + 7);
  sub.defensiveStance = Math.floor(Math.random() * 3 + 7);
  sub.transitionSpeed = Math.floor(Math.random() * 3 + 7);
  sub.postMoves = Math.floor(Math.random() * 3 + 7);
  sub.finishingAbility = Math.floor(Math.random() * 3 + 7);
  sub.shotSelection = Math.floor(Math.random() * 3 + 7);
  sub.teamChemistry = Math.floor(Math.random() * 3 + 7);
}

function generateNBAAnalytics(player) {
  const analytics = player.analytics;
  
  // Shot chart data
  analytics.shotCharts = {
    rim: {
      attempts: Math.floor(Math.random() * 200 + 100),
      percentage: (Math.random() * 20 + 55).toFixed(1) + '%'
    },
    midRange: {
      attempts: Math.floor(Math.random() * 150 + 50),
      percentage: (Math.random() * 15 + 40).toFixed(1) + '%'
    },
    threePoint: {
      attempts: Math.floor(Math.random() * 300 + 100),
      percentage: (Math.random() * 15 + 35).toFixed(1) + '%'
    },
    cornerThree: {
      attempts: Math.floor(Math.random() * 100 + 30),
      percentage: (Math.random() * 15 + 38).toFixed(1) + '%'
    }
  };
  
  // Lineup analytics
  analytics.lineupData = {
    mostCommonLineup: 'Lineup A',
    netRatingWithBestLineup: (Math.random() * 20 + 10).toFixed(1),
    netRatingWithWorstLineup: (Math.random() * 20 - 10).toFixed(1),
    onCourtImpact: (Math.random() * 10 + 5).toFixed(1),
    offCourtImpact: (Math.random() * 5 - 2.5).toFixed(1)
  };
  
  // Clutch performance
  analytics.clutchPerformance = {
    last5Minutes: {
      points: (Math.random() * 3 + 2).toFixed(1) + '/game',
      fgPercentage: (Math.random() * 20 + 40).toFixed(1) + '%',
      plusMinus: (Math.random() * 10 - 2).toFixed(1)
    },
    gameWinningShots: Math.floor(Math.random() * 5),
    fourthQuarterScoring: (Math.random() * 3 + 5).toFixed(1) + '/game'
  };
  
  // Predictive analytics
  analytics.predictiveMetrics = {
    nextGameProjection: {
      points: (Math.random() * 10 + 15).toFixed(1),
      rebounds: (Math.random() * 5 + 5).toFixed(1),
      assists: (Math.random() * 5 + 3).toFixed(1),
      fantasyPoints: (Math.random() * 15 + 30).toFixed(1)
    },
    restDayImpact: (Math.random() * 5 + 2).toFixed(1) + '% increase',
    backToBackImpact: (Math.random() * 8 - 4).toFixed(1) + '% decrease'
  };
}

// NHL Advanced Stats
function generateNHLAdvancedStats(player) {
  if (!player.stats) return;
  
  const stats = player.stats;
  const adv = player.advancedStats;
  
  // Advanced metrics
  adv.corsiForPercentage = (Math.random() * 20 + 45).toFixed(1) + '%';
  adv.fenwickForPercentage = (Math.random() * 20 + 45).toFixed(1) + '%';
  adv.pdo = (Math.random() * 20 + 97).toFixed(1);
  adv.expectedGoalsPercentage = (Math.random() * 20 + 45).toFixed(1) + '%';
  adv.scoringChancesPercentage = (Math.random() * 20 + 45).toFixed(1) + '%';
  adv.highDangerChancesPercentage = (Math.random() * 20 + 45).toFixed(1) + '%';
  
  // Zone metrics
  adv.zoneStarts = {
    offensive: (Math.random() * 20 + 40).toFixed(1) + '%',
    defensive: (Math.random() * 20 + 40).toFixed(1) + '%',
    neutral: (Math.random() * 20 + 20).toFixed(1) + '%'
  };
  
  // Quality metrics
  adv.qualityOfCompetition = (Math.random() * 2 + 1).toFixed(2);
  adv.qualityOfTeammates = (Math.random() * 2 + 1).toFixed(2);
  
  // Impact metrics
  adv.winsAboveReplacement = (Math.random() * 2 + 1).toFixed(1);
  adv.goalsAboveReplacement = (Math.random() * 5 + 5).toFixed(1);
  adv.pointsAboveReplacement = (Math.random() * 10 + 10).toFixed(1);
  
  // Microstats for forwards
  if (['C', 'LW', 'RW'].includes(player.position)) {
    adv.zoneEntries = Math.floor(Math.random() * 100 + 150);
    adv.zoneEntrySuccess = (Math.random() * 20 + 60).toFixed(1) + '%';
    adv.zoneExits = Math.floor(Math.random() * 100 + 150);
    adv.zoneExitSuccess = (Math.random() * 20 + 60).toFixed(1) + '%';
    adv.cycleSuccess = (Math.random() * 20 + 50).toFixed(1) + '%';
    adv.rushSuccess = (Math.random() * 20 + 40).toFixed(1) + '%';
  }
  
  // Microstats for defensemen
  if (player.position === 'D') {
    adv.breakoutPassSuccess = (Math.random() * 20 + 70).toFixed(1) + '%';
    adv.defensiveZoneRetrievals = Math.floor(Math.random() * 200 + 300);
    adv.retrievalSuccess = (Math.random() * 20 + 75).toFixed(1) + '%';
    adv.gapControl = (Math.random() * 20 + 60).toFixed(1) + '%';
    adv.pinchSuccess = (Math.random() * 30 + 40).toFixed(1) + '%';
  }
  
  // Goaltender specific metrics
  if (player.position === 'G') {
    adv.goalsSavedAboveExpected = (Math.random() * 15 - 5).toFixed(1);
    adv.goalsSavedAboveAverage = (Math.random() * 10 - 5).toFixed(1);
    adv.highDangerSavePercentage = (Math.random() * 10 + 80).toFixed(1) + '%';
    adv.lowDangerSavePercentage = (Math.random() * 5 + 95).toFixed(1) + '%';
    adv.reboundControl = (Math.random() * 20 + 60).toFixed(1) + '%';
    adv.puckHandlingRating = Math.floor(Math.random() * 3 + 7); // 7-10
  }
}

function generateNHLSubjectiveStats(player) {
  const sub = player.subjectiveStats;
  
  // Subjective ratings (1-10 scale)
  sub.hockeyIQ = Math.floor(Math.random() * 3 + 7);
  sub.clutchFactor = Math.floor(Math.random() * 4 + 6);
  sub.leadership = Math.floor(Math.random() * 3 + 7);
  sub.competitiveness = Math.floor(Math.random() * 3 + 7);
  sub.poise = Math.floor(Math.random() * 3 + 6);
  sub.confidence = Math.floor(Math.random() * 3 + 7);
  sub.resilience = Math.floor(Math.random() * 3 + 7);
  sub.adaptability = Math.floor(Math.random() * 3 + 7);
  sub.creativity = Math.floor(Math.random() * 3 + 7);
  sub.instincts = Math.floor(Math.random() * 3 + 7);
  
  // Skill-specific subjective stats
  sub.vision = Math.floor(Math.random() * 3 + 7);
  sub.handEyeCoordination = Math.floor(Math.random() * 3 + 7);
  sub.skatingAbility = Math.floor(Math.random() * 3 + 7);
  sub.edgeWork = Math.floor(Math.random() * 3 + 7);
  sub.acceleration = Math.floor(Math.random() * 3 + 7);
  sub.topSpeed = Math.floor(Math.random() * 3 + 7);
  sub.agility = Math.floor(Math.random() * 3 + 7);
  sub.balance = Math.floor(Math.random() * 3 + 7);
  sub.strengthOnPuck = Math.floor(Math.random() * 3 + 7);
  sub.battleLevel = Math.floor(Math.random() * 3 + 7);
}

function generateNHLAnalytics(player) {
  const analytics = player.analytics;
  
  // Shot heat maps
  analytics.shotHeatMaps = {
    slot: {
      attempts: Math.floor(Math.random() * 100 + 50),
      percentage: (Math.random() * 20 + 15).toFixed(1) + '%'
    },
    leftCircle: {
      attempts: Math.floor(Math.random() * 80 + 30),
      percentage: (Math.random() * 15 + 10).toFixed(1) + '%'
    },
    rightCircle: {
      attempts: Math.floor(Math.random() * 80 + 30),
      percentage: (Math.random() * 15 + 10).toFixed(1) + '%'
    },
    point: {
      attempts: Math.floor(Math.random() * 60 + 20),
      percentage: (Math.random() * 10 + 5).toFixed(1) + '%'
    }
  };
  
  // Passing networks
  analytics.passingNetworks = {
    primaryAssistPartner: `Player ${Math.floor(Math.random() * 30 + 1)}`,
    secondaryAssistPartner: `Player ${Math.floor(Math.random() * 30 + 1)}`,
    passCompletionsPer60: (Math.random() * 10 + 15).toFixed(1),
    passAccuracy: (Math.random() * 15 + 75).toFixed(1) + '%'
  };
  
  // Zone analytics
  analytics.zoneAnalytics = {
    offensiveZoneTime: (Math.random() * 30 + 40).toFixed(1) + 's/game',
    defensiveZoneTime: (Math.random() * 30 + 30).toFixed(1) + 's/game',
    neutralZoneTime: (Math.random() * 20 + 20).toFixed(1) + 's/game',
    puckPossessionTime: (Math.random() * 20 + 30).toFixed(1) + 's/game'
  };
  
  // Clutch performance
  analytics.clutchPerformance = {
    thirdPeriod: {
      points: (Math.random() * 0.5 + 0.3).toFixed(2) + '/game',
      plusMinus: (Math.random() * 5 - 1).toFixed(1),
      shotPercentage: (Math.random() * 10 + 10).toFixed(1) + '%'
    },
    overtime: {
      goals: Math.floor(Math.random() * 3),
      assists: Math.floor(Math.random() * 5),
      gameWinners: Math.floor(Math.random() * 2)
    },
    playoffPerformance: {
      pointsPerGame: (Math.random() * 0.5 + 0.5).toFixed(2),
      plusMinus: (Math.random() * 3 + 1).toFixed(1)
    }
  };
}

// MLB Advanced Stats
function generateMLBAdvancedStats(player) {
  if (!player.stats) return;
  
  const stats = player.stats;
  const adv = player.advancedStats;
  
  // Batting advanced metrics
  if (stats.batting) {
    adv.woba = (Math.random() * 0.100 + 0.320).toFixed(3);
    adv.wrcPlus = Math.floor(Math.random() * 50 + 100);
    adv.isolatedPower = (Math.random() * 0.100 + 0.180).toFixed(3);
    adv.battingAverageOnBallsInPlay = (Math.random() * 0.100 + 0.290).toFixed(3);
    
    // Statcast metrics
    adv.hardHitPercentage = (Math.random() * 20 + 35).toFixed(1) + '%';
    adv.barrelPercentage = (Math.random() * 10 + 5).toFixed(1) + '%';
    adv.exitVelocity = (Math.random() * 5 + 88).toFixed(1) + ' mph';
    adv.launchAngle = (Math.random() * 10 + 10).toFixed(1) + '°';
    
    // Plate discipline
    adv.chaseRate = (Math.random() * 15 + 25).toFixed(1) + '%';
    adv.contactRate = (Math.random() * 15 + 70).toFixed(1) + '%';
    adv.swingStrikeRate = (Math.random() * 10 + 10).toFixed(1) + '%';
    adv.firstPitchSwing = (Math.random() * 20 + 25).toFixed(1) + '%';
    
    // Spray chart
    adv.sprayChart = {
      pull: (Math.random() * 20 + 35).toFixed(1) + '%',
      center: (Math.random() * 20 + 35).toFixed(1) + '%',
      opposite: (Math.random() * 20 + 20).toFixed(1) + '%'
    };
  }
  
  // Pitching advanced metrics
  if (stats.pitching) {
    adv.eraPlus = Math.floor(Math.random() * 50 + 100);
    adv.fip = (Math.random() * 1.5 + 3.5).toFixed(2);
    adv.xfip = (Math.random() * 1.5 + 3.7).toFixed(2);
    adv.siera = (Math.random() * 1.5 + 3.6).toFixed(2);
    
    // Pitching rates
    adv.strikeoutPercentage = (Math.random() * 10 + 20).toFixed(1) + '%';
    adv.walkPercentage = (Math.random() * 5 + 7).toFixed(1) + '%';
    adv.homeRunPercentage = (Math.random() * 3 + 2.5).toFixed(1) + '%';
    adv.strikeoutToWalkRatio = (Math.random() * 3 + 3).toFixed(2);
    
    // Batted ball profile
    adv.groundBallPercentage = (Math.random() * 30 + 40).toFixed(1) + '%';
    adv.flyBallPercentage = (Math.random() * 30 + 30).toFixed(1) + '%';
    adv.lineDrivePercentage = (Math.random() * 10 + 15).toFixed(1) + '%';
    adv.popUpPercentage = (Math.random() * 5 + 5).toFixed(1) + '%';
    
    // Statcast pitching
    adv.pitchVelocity = {
      fastball: (Math.random() * 5 + 93).toFixed(1) + ' mph',
      breaking: (Math.random() * 5 + 83).toFixed(1) + ' mph',
      offspeed: (Math.random() * 5 + 86).toFixed(1) + ' mph'
    };
    adv.spinRate = {
      fastball: Math.floor(Math.random() * 500 + 2200) + ' rpm',
      breaking: Math.floor(Math.random() * 800 + 2500) + ' rpm'
    };
    
    // Pitch mix
    adv.pitchMix = {
      fastball: (Math.random() * 30 + 50).toFixed(1) + '%',
      breaking: (Math.random() * 20 + 30).toFixed(1) + '%',
      offspeed: (Math.random() * 10 + 15).toFixed(1) + '%'
    };
  }
  
  // Fielding advanced metrics
  if (player.position !== 'P') {
    adv.defensiveRunsSaved = Math.floor(Math.random() * 20 - 5);
    adv.ultimateZoneRating = (Math.random() * 5 - 1).toFixed(1);
    adv.outsAboveAverage = Math.floor(Math.random() * 10 - 2);
    
    // Arm metrics
    adv.armStrength = (Math.random() * 5 + 85).toFixed(1) + ' mph';
    adv.armAccuracy = (Math.random() * 20 + 70).toFixed(1) + '%';
    
    // Range metrics
    adv.range = (Math.random() * 10 + 5).toFixed(1) + ' feet';
    adv.reactionTime = (Math.random() * 0.2 + 0.3).toFixed(2) + 's';
  }
  
  // Baserunning
  adv.baserunningRuns = (Math.random() * 5 - 1).toFixed(1);
  adv.ultimateBaseRunning = (Math.random() * 5 - 1).toFixed(1);
  adv.extraBasesTaken = (Math.random() * 30 + 40).toFixed(1) + '%';
  
  // Overall value
  adv.war = (Math.random() * 4 + 2).toFixed(1);
  adv.offensiveWar = (Math.random() * 3 + 1).toFixed(1);
  adv.defensiveWar = (Math.random() * 2 + 0.5).toFixed(1);
  adv.pitchingWar = stats.pitching ? (Math.random() * 3 + 2).toFixed(1) : 0;
}

function generateMLBSubjectiveStats(player) {
  const sub = player.subjectiveStats;
  
  // Subjective ratings (1-10 scale)
  sub.baseballIQ = Math.floor(Math.random() * 3 + 7);
  sub.clutchFactor = Math.floor(Math.random() * 4 + 6);
  sub.leadership = Math.floor(Math.random() * 3 + 7);
  sub.durability = Math.floor(Math.random() * 3 + 7);
  sub.consistency = Math.floor(Math.random() * 3 + 6);
  sub.makeup = Math.floor(Math.random() * 3 + 7);
  sub.workEthic = Math.floor(Math.random() * 3 + 7);
  sub.teamPlayer = Math.floor(Math.random() * 3 + 7);
  sub.competitiveness = Math.floor(Math.random() * 3 + 7);
  sub.poise = Math.floor(Math.random() * 3 + 6);
  
  // Skill-specific subjective stats
  sub.vision = Math.floor(Math.random() * 3 + 7);
  sub.handEyeCoordination = Math.floor(Math.random() * 3 + 7);
  sub.athleticism = Math.floor(Math.random() * 3 + 7);
  sub.rawPower = Math.floor(Math.random() * 3 + 7);
  sub.batSpeed = Math.floor(Math.random() * 3 + 7);
  sub.pitchRecognition = Math.floor(Math.random() * 3 + 7);
  sub.plateVision = Math.floor(Math.random() * 3 + 7);
  sub.twoStrikeApproach = Math.floor(Math.random() * 3 + 7);
  sub.situationalHitting = Math.floor(Math.random() * 3 + 7);
}

function generateMLBAnalytics(player) {
  const analytics = player.analytics;
  
  // Spray chart analytics
  analytics.sprayChartData = {
    hotZones: [
      { zone: 'Right Center', avg: (Math.random() * 0.200 + 0.350).toFixed(3) },
      { zone: 'Left Field', avg: (Math.random() * 0.150 + 0.300).toFixed(3) }
    ],
    coldZones: [
      { zone: 'High Inside', avg: (Math.random() * 0.150 + 0.200).toFixed(3) },
      { zone: 'Low Outside', avg: (Math.random() * 0.150 + 0.200).toFixed(3) }
    ],
    powerZones: [
      { zone: 'Middle In', distance: Math.floor(Math.random() * 50 + 400) + ' ft' },
      { zone: 'Right Center', distance: Math.floor(Math.random() * 50 + 410) + ' ft' }
    ]
  };
  
  // Splits analytics
  analytics.splits = {
    home: {
      avg: (Math.random() * 0.050 + 0.280).toFixed(3),
      ops: (Math.random() * 0.150 + 0.800).toFixed(3)
    },
    road: {
      avg: (Math.random() * 0.050 + 0.270).toFixed(3),
      ops: (Math.random() * 0.150 + 0.780).toFixed(3)
    },
    vsLeft: {
      avg: (Math.random() * 0.050 + 0.280).toFixed(3),
      ops: (Math.random() * 0.150 + 0.800).toFixed(3)
    },
    vsRight: {
      avg: (Math.random() * 0.050 + 0.270).toFixed(3),
      ops: (Math.random() * 0.150 + 0.780).toFixed(3)
    }
  };
  
  // Clutch performance
  analytics.clutchPerformance = {
    lateAndClose: {
      avg: (Math.random() * 0.050 + 0.280).toFixed(3),
      ops: (Math.random() * 0.150 + 0.800).toFixed(3)
    },
    runnersInScoringPosition: {
      avg: (Math.random() * 0.050 + 0.290).toFixed(3),
      rbi: Math.floor(Math.random() * 30 + 60)
    },
    twoOuts: {
      avg: (Math.random() * 0.050 + 0.270).toFixed(3),
      rbi: Math.floor(Math.random() * 20 + 40)
    },
    walkOffs: {
      hits: Math.floor(Math.random() * 5 + 1),
      rbi: Math.floor(Math.random() * 10 + 5)
    }
  };
  
  // Predictive analytics
  analytics.predictiveMetrics = {
    nextGameProjection: {
      avg: (Math.random() * 0.050 + 0.280).toFixed(3),
      hits: Math.floor(Math.random() * 2 + 1),
      rbi: Math.floor(Math.random() * 2 + 0.5),
      runs: Math.floor(Math.random() * 2 + 0.5),
      fantasyPoints: (Math.random() * 5 + 8).toFixed(1)
    },
    restDayImpact: (Math.random() * 10 + 5).toFixed(1) + '% improvement',
    dayNightSplit: {
      day: { avg: (Math.random() * 0.050 + 0.270).toFixed(3) },
      night: { avg: (Math.random() * 0.050 + 0.290).toFixed(3) }
    }
  };
}

function generateLeadersForStat(players, stat, category, sport) {
  const leaders = [];
  
  players.forEach(player => {
    let value = null;
    
    // Try to find the stat in various locations
    if (player.stats && player.stats[stat] !== undefined) {
      value = player.stats[stat];
    } else if (player.advancedStats && player.advancedStats[stat] !== undefined) {
      value = player.advancedStats[stat];
    } else if (player.subjectiveStats && player.subjectiveStats[stat] !== undefined) {
      value = player.subjectiveStats[stat];
    } else if (player.analytics && player.analytics[stat] !== undefined) {
      value = player.analytics[stat];
    }
    
    // Parse numeric values from strings
    if (typeof value === 'string') {
      // Extract number from percentage strings
      const percentageMatch = value.match(/([\d.]+)%/);
      if (percentageMatch) {
        value = parseFloat(percentageMatch[1]);
      } else {
        // Try to extract any number
        const numberMatch = value.match(/[\d.]+/);
        if (numberMatch) {
          value = parseFloat(numberMatch[0]);
        }
      }
    }
    
    if (value !== null && typeof value === 'number' && !isNaN(value)) {
      leaders.push({
        playerId: player.id,
        playerName: player.name,
        playerTeam: player.team,
        playerPosition: player.position,
        value: value,
        rank: 0
      });
    }
  });
  
  // Sort and rank
  return leaders
    .sort((a, b) => {
      // For some stats (like ERA in baseball), lower is better
      const lowerIsBetter = [
        'era', 'whip', 'goalsAgainstAverage', 'interceptions',
        'turnovers', 'errors', 'earnedRunAverage', 'fip', 'xfip', 'siera'
      ];
      
      if (lowerIsBetter.includes(stat)) {
        return a.value - b.value;
      }
      return b.value - a.value;
    })
    .slice(0, 10)
    .map((leader, index) => ({
      ...leader,
      rank: index + 1,
      value: formatStatValue(leader.value, stat)
    }));
}

function formatStatValue(value, stat) {
  // Format values appropriately
  if (typeof value !== 'number') return value;
  
  // Percentage stats
  if (stat.includes('Percentage') || stat.includes('Rate') || stat === 'completion') {
    return value.toFixed(1) + '%';
  }
  
  // Decimal stats
  if (stat.includes('Average') || stat.includes('era') || stat.includes('whip')) {
    return value.toFixed(2);
  }
  
  // Money stats (like salary)
  if (stat.includes('Salary') || stat.includes('Value')) {
    return '$' + value.toFixed(1) + 'M';
  }
  
  // Integer stats
  if (Number.isInteger(value) || stat.includes('TDs') || stat.includes('Goals') || 
      stat.includes('HomeRuns') || stat.includes('Points')) {
    return value;
  }
  
  // Default to 1 decimal place
  return value.toFixed(1);
}

function generateTrendData(games) {
  const trends = [];
  let base = Math.random() * 20 + 10;
  
  for (let i = 0; i < games; i++) {
    trends.push({
      game: i + 1,
      value: (base + Math.random() * 5 - 2.5).toFixed(1),
      opponent: `Team ${String.fromCharCode(65 + i)}`,
      result: Math.random() > 0.5 ? 'W' : 'L'
    });
  }
  
  return trends;
}

// Generate comprehensive stat trends
function generateStatTrends() {
  return {
    NFL: {
      'Patrick Mahomes': { 
        passingYards: 'up', 
        touchdowns: 'up', 
        interceptions: 'down',
        completion: 'up',
        passerRating: 'up',
        clutchFactor: 'up',
        leadership: 'up'
      },
      'Christian McCaffrey': { 
        rushingYards: 'up', 
        touchdowns: 'up', 
        fumbles: 'down',
        yardsPerCarry: 'up',
        receivingYards: 'up',
        durability: 'stable',
        versatility: 'up'
      },
      'Justin Jefferson': { 
        receivingYards: 'up', 
        touchdowns: 'up', 
        drops: 'down',
        yardsPerReception: 'up',
        contestedCatches: 'up',
        routeRunning: 'up',
        bigPlayAbility: 'up'
      }
    },
    NBA: {
      'LeBron James': { 
        points: 'stable', 
        assists: 'up', 
        turnovers: 'down',
        efficiency: 'up',
        leadership: 'up',
        clutchPerformance: 'up',
        basketballIQ: 'up'
      },
      'Stephen Curry': { 
        points: 'up', 
        threePercentage: 'up', 
        steals: 'up',
        offBallMovement: 'up',
        gravity: 'up',
        shotCreation: 'up',
        durability: 'stable'
      },
      'Nikola Jokic': { 
        rebounds: 'up', 
        assists: 'up', 
        blocks: 'up',
        passingVision: 'up',
        efficiency: 'up',
        postGame: 'up',
        versatility: 'up'
      }
    },
    MLB: {
      'Shohei Ohtani': { 
        homeRuns: 'up', 
        era: 'down', 
        strikeouts: 'up',
        power: 'up',
        velocity: 'stable',
        twoWayImpact: 'up',
        marketability: 'up'
      },
      'Aaron Judge': { 
        homeRuns: 'up', 
        battingAverage: 'up', 
        rbi: 'up',
        plateDiscipline: 'up',
        powerMetrics: 'up',
        leadership: 'up',
        durability: 'stable'
      },
      'Mookie Betts': { 
        hits: 'up', 
        stolenBases: 'up', 
        fieldingPercentage: 'up',
        versatility: 'up',
        baserunning: 'up',
        clutchHitting: 'up',
        defensiveRange: 'up'
      }
    },
    NHL: {
      'Connor McDavid': { 
        points: 'up', 
        assists: 'up', 
        plusMinus: 'up',
        speed: 'up',
        playmaking: 'up',
        leadership: 'up',
        bigGamePerformance: 'up'
      },
      'Auston Matthews': { 
        goals: 'up', 
        shots: 'up', 
        faceoffPercentage: 'up',
        shotAccuracy: 'up',
        powerPlayImpact: 'up',
        goalScoringInstincts: 'up',
        consistency: 'up'
      },
      'Cale Makar': { 
        assists: 'up', 
        plusMinus: 'up', 
        timeOnIce: 'up',
        skating: 'up',
        offensiveDefenseman: 'up',
        transitionGame: 'up',
        powerPlayQB: 'up'
      }
    }
  };
}

// Generate player archetypes and comps
function generatePlayerComparisons() {
  return {
    NFL: {
      'Patrick Mahomes': ['Aaron Rodgers', 'Brett Favre', 'Dan Marino'],
      'Christian McCaffrey': ['LaDainian Tomlinson', 'Marshall Faulk', 'Roger Craig'],
      'Justin Jefferson': ['Randy Moss', 'Calvin Johnson', 'Julio Jones']
    },
    NBA: {
      'LeBron James': ['Magic Johnson', 'Larry Bird', 'Oscar Robertson'],
      'Stephen Curry': ['Ray Allen', 'Reggie Miller', 'Steve Nash'],
      'Nikola Jokic': ['Arvydas Sabonis', 'Bill Walton', 'Vlade Divac']
    },
    NHL: {
      'Connor McDavid': ['Wayne Gretzky', 'Mario Lemieux', 'Sidney Crosby'],
      'Auston Matthews': ['Steven Stamkos', 'Alex Ovechkin', 'Brett Hull'],
      'Cale Makar': ['Bobby Orr', 'Paul Coffey', 'Erik Karlsson']
    },
    MLB: {
      'Shohei Ohtani': ['Babe Ruth', 'Willie Mays', 'Mike Trout'],
      'Aaron Judge': ['Giancarlo Stanton', 'Mark McGwire', 'Dave Winfield'],
      'Mookie Betts': ['Robinson Cano', 'Dustin Pedroia', 'Andrew McCutchen']
    }
  };
}

// Generate injury analytics
function generateInjuryAnalytics() {
  return {
    NFL: {
      'Christian McCaffrey': { injuryRisk: 'moderate', gamesMissedLast2Years: 12, durabilityScore: 6 },
      'Patrick Mahomes': { injuryRisk: 'low', gamesMissedLast2Years: 2, durabilityScore: 9 },
      'Justin Jefferson': { injuryRisk: 'low', gamesMissedLast2Years: 4, durabilityScore: 8 }
    },
    NBA: {
      'LeBron James': { injuryRisk: 'moderate', gamesMissedLast2Years: 27, durabilityScore: 7 },
      'Stephen Curry': { injuryRisk: 'moderate', gamesMissedLast2Years: 18, durabilityScore: 7 },
      'Nikola Jokic': { injuryRisk: 'low', gamesMissedLast2Years: 8, durabilityScore: 9 }
    },
    NHL: {
      'Connor McDavid': { injuryRisk: 'moderate', gamesMissedLast2Years: 14, durabilityScore: 8 },
      'Auston Matthews': { injuryRisk: 'low', gamesMissedLast2Years: 6, durabilityScore: 9 },
      'Cale Makar': { injuryRisk: 'moderate', gamesMissedLast2Years: 16, durabilityScore: 7 }
    },
    MLB: {
      'Shohei Ohtani': { injuryRisk: 'high', gamesMissedLast2Years: 30, durabilityScore: 6 },
      'Aaron Judge': { injuryRisk: 'moderate', gamesMissedLast2Years: 45, durabilityScore: 6 },
      'Mookie Betts': { injuryRisk: 'low', gamesMissedLast2Years: 12, durabilityScore: 9 }
    }
  };
}

// Generate market value analytics
function generateMarketAnalytics() {
  return {
    NFL: {
      'Patrick Mahomes': { 
        marketValue: '$450M', 
        endorsementValue: '$20M/year',
        socialMediaValue: '$5M/year',
        jerseySalesRank: 1,
        brandPower: 9.8
      }
    },
    NBA: {
      'LeBron James': { 
        marketValue: '$1B', 
        endorsementValue: '$60M/year',
        socialMediaValue: '$30M/year',
        jerseySalesRank: 2,
        brandPower: 10.0
      }
    },
    NHL: {
      'Connor McDavid': { 
        marketValue: '$100M', 
        endorsementValue: '$5M/year',
        socialMediaValue: '$1M/year',
        jerseySalesRank: 1,
        brandPower: 8.5
      }
    },
    MLB: {
      'Shohei Ohtani': { 
        marketValue: '$700M', 
        endorsementValue: '$35M/year',
        socialMediaValue: '$10M/year',
        jerseySalesRank: 1,
        brandPower: 9.5
      }
    }
  };
}

// Main execution
async function main() {
  try {
    // Load generated players
    const playersPath = path.join(__dirname, '../src/data/generatedPlayers.json');
    const playersData = JSON.parse(fs.readFileSync(playersPath, 'utf8'));
    
    console.log('Generating comprehensive stats and analytics...');
    
    // Generate stat leaders with advanced analytics
    const statLeaders = generateStatLeaders(playersData);
    const statTrends = generateStatTrends();
    const playerComparisons = generatePlayerComparisons();
    const injuryAnalytics = generateInjuryAnalytics();
    const marketAnalytics = generateMarketAnalytics();
    
    // Combine all stats data
    const statsData = {
      categories: statCategories,
      leaders: statLeaders,
      trends: statTrends,
      comparisons: playerComparisons,
      injuryAnalytics: injuryAnalytics,
      marketAnalytics: marketAnalytics,
      lastUpdated: new Date().toISOString()
    };
    
    // Save to JSON file
    const jsonOutputPath = path.join(__dirname, '../src/data/generatedStats.json');
    fs.writeFileSync(jsonOutputPath, JSON.stringify(statsData, null, 2));
    console.log(`Comprehensive stats saved to: ${jsonOutputPath}`);
    
    // Create JavaScript export file
    const jsOutput = `// src/data/stats.js - Comprehensive Sports Stats & Analytics
export const statCategories = ${JSON.stringify(statCategories, null, 2)};

export const statTrends = ${JSON.stringify(statTrends, null, 2)};

export const playerComparisons = ${JSON.stringify(playerComparisons, null, 2)};

export const injuryAnalytics = ${JSON.stringify(injuryAnalytics, null, 2)};

export const marketAnalytics = ${JSON.stringify(marketAnalytics, null, 2)};

// Helper functions
export const getStatCategory = (sport, category) => {
  return statCategories[sport]?.[category] || [];
};

export const getStatLeaders = (sport, category, stat) => {
  // This would load from generatedStats.json in a real app
  return [];
};

export const getPlayerTrend = (sport, playerName, stat) => {
  return statTrends[sport]?.[playerName]?.[stat] || 'stable';
};

export default {
  statCategories,
  statTrends,
  playerComparisons,
  injuryAnalytics,
  marketAnalytics,
  getStatCategory,
  getStatLeaders,
  getPlayerTrend
};`;
    
    const jsOutputPath = path.join(__dirname, '../src/data/stats.js');
    fs.writeFileSync(jsOutputPath, jsOutput);
    console.log(`JavaScript stats file saved to: ${jsOutputPath}`);
    
    console.log('\n=== STATS GENERATION SUMMARY ===');
    console.log(`Generated ${Object.keys(statCategories).length} sports categories`);
    console.log(`Includes advanced analytics, subjective metrics, and market data`);
    console.log('Ready for use in your sports analytics app!');
    
  } catch (error) {
    console.error('Error generating stats:', error);
  }
}

main();
