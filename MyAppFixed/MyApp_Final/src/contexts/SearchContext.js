import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider');
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const [searchHistory, setSearchHistory] = useState([]);
  const [recentTeams, setRecentTeams] = useState([]);
  const [recentGames, setRecentGames] = useState([]);

  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('search_history');
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
      
      const teams = await AsyncStorage.getItem('recent_teams');
      if (teams) {
        setRecentTeams(JSON.parse(teams));
      }
      
      const games = await AsyncStorage.getItem('recent_games');
      if (games) {
        setRecentGames(JSON.parse(games));
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  };

  const addToSearchHistory = async (query) => {
    if (!query.trim()) return;
    
    const newHistory = [
      query,
      ...searchHistory.filter(item => item !== query)
    ].slice(0, 10); // Keep last 10 searches
    
    setSearchHistory(newHistory);
    
    try {
      await AsyncStorage.setItem('search_history', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  };

  const addRecentTeam = async (team) => {
    const newTeams = [
      team,
      ...recentTeams.filter(t => t.id !== team.id)
    ].slice(0, 5);
    
    setRecentTeams(newTeams);
    
    try {
      await AsyncStorage.setItem('recent_teams', JSON.stringify(newTeams));
    } catch (error) {
      console.error('Error saving recent teams:', error);
    }
  };

  const addRecentGame = async (game) => {
    const newGames = [
      game,
      ...recentGames.filter(g => g.id !== game.id)
    ].slice(0, 5);
    
    setRecentGames(newGames);
    
    try {
      await AsyncStorage.setItem('recent_games', JSON.stringify(newGames));
    } catch (error) {
      console.error('Error saving recent games:', error);
    }
  };

  const clearSearchHistory = async () => {
    setSearchHistory([]);
    try {
      await AsyncStorage.removeItem('search_history');
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  };

  return (
    <SearchContext.Provider value={{
      searchHistory,
      recentTeams,
      recentGames,
      addToSearchHistory,
      addRecentTeam,
      addRecentGame,
      clearSearchHistory,
      loadSearchHistory
    }}>
      {children}
    </SearchContext.Provider>
  );
};
