import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  TextInput,
  Modal,
  Platform,
  Alert,
  Linking
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logAnalyticsEvent, logScreenView } from '../services/firebase';
import { useAppNavigation } from '../navigation/NavigationHelper';
import SearchBar from '../components/SearchBar';
import { useSearch } from '../providers/SearchProvider';
import apiService from '../services/api'; // Import the updated API service
import Purchases from '../utils/RevenueCatConfig'; // CHANGED: Import from centralized config

const { width } = Dimensions.get('window');

// ============ KALSHI MARKET ANALYTICS BOX ============
const KalshiAnalyticsBox = ({ marketData, setMarketData }) => {
  const [showAnalyticsBox, setShowAnalyticsBox] = useState(false);

  const marketHighlights = [
    { icon: 'trending-up', label: 'Weekly Volume', value: marketData.weeklyVolume, color: '#8b5cf6' },
    { icon: 'pie-chart', label: 'Market Share', value: marketData.marketShare, color: '#10b981' },
    { icon: 'american-football', label: 'Sports Volume', value: marketData.sportsPercentage, color: '#ef4444' },
    { icon: 'trophy', label: 'Record Day', value: marketData.recordDay, color: '#f59e0b' },
  ];

  if (!showAnalyticsBox) {
    return (
      <TouchableOpacity 
        style={[kalshiAnalyticsStyles.floatingButton, {backgroundColor: '#8b5cf6'}]}
        onPress={() => {
          setShowAnalyticsBox(true);
          logAnalyticsEvent('kalshi_analytics_opened');
        }}
      >
        <LinearGradient
          colors={['#8b5cf6', '#7c3aed']}
          style={kalshiAnalyticsStyles.floatingButtonGradient}
        >
          <Ionicons name="stats-chart" size={20} color="white" />
          <Text style={kalshiAnalyticsStyles.floatingButtonText}>Market Stats</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[kalshiAnalyticsStyles.container, {backgroundColor: '#1e293b'}]}>
      <LinearGradient
        colors={['#1e293b', '#0f172a']}
        style={kalshiAnalyticsStyles.gradient}
      >
        <View style={kalshiAnalyticsStyles.header}>
          <View style={kalshiAnalyticsStyles.headerLeft}>
            <Ionicons name="shield-checkmark" size={24} color="#8b5cf6" />
            <Text style={kalshiAnalyticsStyles.title}>Kalshi Market Intelligence</Text>
          </View>
          <TouchableOpacity 
            style={kalshiAnalyticsStyles.iconButton}
            onPress={() => setShowAnalyticsBox(false)}
          >
            <Ionicons name="close" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>

        <View style={kalshiAnalyticsStyles.regulatoryBadge}>
          <Ionicons name="balance-scale" size={16} color="#3b82f6" />
          <Text style={kalshiAnalyticsStyles.regulatoryText}>
            CFTC-Regulated • Legal in 50 States
          </Text>
        </View>

        <View style={kalshiAnalyticsStyles.highlightsGrid}>
          {marketHighlights.map((item, index) => (
            <View key={index} style={kalshiAnalyticsStyles.highlightItem}>
              <View style={[kalshiAnalyticsStyles.highlightIcon, {backgroundColor: `${item.color}20`}]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={kalshiAnalyticsStyles.highlightValue}>{item.value}</Text>
              <Text style={kalshiAnalyticsStyles.highlightLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={kalshiAnalyticsStyles.legalNote}>
          <Ionicons name="information-circle" size={14} color="#64748b" />
          <Text style={kalshiAnalyticsStyles.legalNoteText}>
            Kalshi holds 66.4% of prediction market share as a CFTC-designated contract market[citation:2]
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const kalshiAnalyticsStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: width * 0.9,
    maxWidth: 400,
    height: 280,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    padding: 16,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
  },
  floatingButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
  },
  floatingButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
    backgroundColor: 'transparent',
  },
  iconButton: {
    padding: 4,
    backgroundColor: 'transparent',
  },
  regulatoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#3b82f640',
  },
  regulatoryText: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
    backgroundColor: 'transparent',
  },
  highlightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  highlightItem: {
    alignItems: 'center',
    width: '48%',
    marginBottom: 15,
    backgroundColor: 'transparent',
  },
  highlightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  highlightValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  highlightLabel: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  legalNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 8,
  },
  legalNoteText: {
    fontSize: 12,
    color: '#94a3b8',
    flex: 1,
    marginLeft: 8,
    lineHeight: 16,
    backgroundColor: 'transparent',
  },
});

// ============ KALSHI CONTRACT EXPLAINER ============
const KalshiContractExplainer = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={explainerStyles.container}>
      <TouchableOpacity 
        style={explainerStyles.header}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={explainerStyles.headerLeft}>
          <Ionicons name="school" size={20} color="#8b5cf6" />
          <Text style={explainerStyles.title}>How Kalshi Contracts Work</Text>
        </View>
        <Ionicons 
          name={expanded ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color="#8b5cf6" 
        />
      </TouchableOpacity>

      {expanded && (
        <View style={explainerStyles.content}>
          <View style={explainerStyles.step}>
            <View style={explainerStyles.stepNumber}>
              <Text style={explainerStyles.stepNumberText}>1</Text>
            </View>
            <View style={explainerStyles.stepContent}>
              <Text style={explainerStyles.stepTitle}>Binary Contracts</Text>
              <Text style={explainerStyles.stepDescription}>
                Buy "Yes" or "No" contracts on event outcomes. Prices range from $0.01 to $0.99[citation:6]
              </Text>
            </View>
          </View>

          <View style={explainerStyles.step}>
            <View style={explainerStyles.stepNumber}>
              <Text style={explainerStyles.stepNumberText}>2</Text>
            </View>
            <View style={explainerStyles.stepContent}>
              <Text style={explainerStyles.stepTitle}>Market Pricing</Text>
              <Text style={explainerStyles.stepDescription}>
                Contract price reflects market-implied probability. $0.75 = 75% chance of "Yes"[citation:6]
              </Text>
            </View>
          </View>

          <View style={explainerStyles.step}>
            <View style={explainerStyles.stepNumber}>
              <Text style={explainerStyles.stepNumberText}>3</Text>
            </View>
            <View style={explainerStyles.stepContent}>
              <Text style={explainerStyles.stepTitle}>Payout & Risk</Text>
              <Text style={explainerStyles.stepDescription}>
                Win = $1.00 per contract. Maximum loss = purchase price[citation:6]
              </Text>
            </View>
          </View>

          <View style={explainerStyles.step}>
            <View style={explainerStyles.stepNumber}>
              <Text style={explainerStyles.stepNumberText}>4</Text>
            </View>
            <View style={explainerStyles.stepContent}>
              <Text style={explainerStyles.stepTitle}>Trade Anytime</Text>
              <Text style={explainerStyles.stepDescription}>
                Sell contracts before event settlement. No house edge - peer-to-peer trading[citation:6]
              </Text>
            </View>
          </View>

          <View style={explainerStyles.legalDisclaimer}>
            <Ionicons name="warning" size={14} color="#f59e0b" />
            <Text style={explainerStyles.disclaimerText}>
              Regulated by CFTC as financial contracts, not sports betting[citation:3]. NCAA has raised concerns about college sports markets[citation:1]
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const explainerStyles = StyleSheet.create({
  container: {
    backgroundColor: '#1e293b',
    borderRadius: 15,
    marginHorizontal: 16,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f1f5f9',
    marginLeft: 10,
  },
  content: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  step: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 13,
    color: '#cbd5e1',
    lineHeight: 18,
  },
  legalDisclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#f59e0b',
    flex: 1,
    marginLeft: 8,
    lineHeight: 16,
  },
});

// ============ KALSHI NEWS COMPONENT ============
const KalshiNewsFeed = ({ newsItems }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    { id: 'All', name: 'All News', icon: 'newspaper' },
    { id: 'Sports', name: 'Sports', icon: 'american-football' },
    { id: 'Politics', name: 'Politics', icon: 'flag' },
    { id: 'Economics', name: 'Economics', icon: 'cash' },
    { id: 'Legal', name: 'Legal', icon: 'balance-scale' },
  ];

  const filteredNews = selectedCategory === 'All' 
    ? newsItems 
    : newsItems.filter(item => item.category === selectedCategory);

  const renderNewsItem = ({ item }) => (
    <TouchableOpacity 
      style={newsStyles.newsItem}
      onPress={() => Linking.openURL(item.url).catch(err => 
        Alert.alert('Error', 'Could not open link')
      )}
    >
      <View style={newsStyles.newsHeader}>
        <View style={[
          newsStyles.categoryBadge,
          { backgroundColor: getCategoryColor(item.category) }
        ]}>
          <Text style={newsStyles.categoryText}>{item.category}</Text>
        </View>
        <Text style={newsStyles.timestamp}>{item.timestamp}</Text>
      </View>
      <Text style={newsStyles.newsTitle}>{item.title}</Text>
      <Text style={newsStyles.newsSummary}>{item.summary}</Text>
      <View style={newsStyles.newsFooter}>
        <Ionicons name="open-outline" size={14} color="#8b5cf6" />
        <Text style={newsStyles.readMore}>Read source</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={newsStyles.container}>
      <View style={newsStyles.header}>
        <Text style={newsStyles.sectionTitle}>📰 Kalshi Market News</Text>
        <Text style={newsStyles.sectionSubtitle}>Regulatory updates & market insights</Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={newsStyles.categoryScroll}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              newsStyles.categoryButton,
              selectedCategory === category.id && newsStyles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Ionicons 
              name={category.icon} 
              size={16} 
              color={selectedCategory === category.id ? '#8b5cf6' : '#94a3b8'} 
            />
            <Text style={[
              newsStyles.categoryButtonText,
              selectedCategory === category.id && newsStyles.categoryButtonTextActive
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredNews}
        renderItem={renderNewsItem}
        keyExtractor={item => item.id}
        scrollEnabled={false}
        contentContainerStyle={newsStyles.newsList}
      />
    </View>
  );
};

const getCategoryColor = (category) => {
  switch(category) {
    case 'Sports': return '#ef444420';
    case 'Politics': return '#3b82f620';
    case 'Economics': return '#10b98120';
    case 'Legal': return '#f59e0b20';
    default: return '#6b728020';
  }
};

const newsStyles = StyleSheet.create({
  container: {
    backgroundColor: '#1e293b',
    borderRadius: 15,
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  header: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f1f5f9',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  categoryScroll: {
    marginBottom: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  categoryButtonActive: {
    backgroundColor: '#8b5cf620',
    borderColor: '#8b5cf640',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#94a3b8',
    marginLeft: 6,
  },
  categoryButtonTextActive: {
    color: '#8b5cf6',
    fontWeight: '600',
  },
  newsList: {
    paddingBottom: 5,
  },
  newsItem: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
    color: '#94a3b8',
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: 8,
    lineHeight: 22,
  },
  newsSummary: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 20,
    marginBottom: 12,
  },
  newsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readMore: {
    fontSize: 13,
    color: '#8b5cf6',
    marginLeft: 6,
    fontWeight: '500',
  },
});

// ============ GENERATE COUNTER HOOK ============
const useKalshiGenerateCounter = () => {
  const [remainingGenerations, setRemainingGenerations] = useState(1);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [purchasedGenerations, setPurchasedGenerations] = useState(0);

  useEffect(() => {
    loadGenerateCounter();
  }, []);

  const loadGenerateCounter = async () => {
    try {
      const today = new Date().toDateString();
      const lastDate = await AsyncStorage.getItem('@kalshi_generate_last_date');
      const purchased = parseInt(await AsyncStorage.getItem('@kalshi_purchased_generations') || '0');
      
      let remaining = 1;
      
      if (lastDate === today) {
        const storedCount = await AsyncStorage.getItem('@kalshi_generate_remaining');
        remaining = parseInt(storedCount) || 1;
      } else {
        await AsyncStorage.setItem('@kalshi_generate_last_date', today);
        await AsyncStorage.setItem('@kalshi_generate_remaining', '1');
      }
      
      const customerInfo = await Purchases.getCustomerInfo();
      if (customerInfo.entitlements.active?.kalshi_premium_access) {
        setHasPremiumAccess(true);
      }
      
      setRemainingGenerations(remaining);
      setPurchasedGenerations(purchased);
    } catch (error) {
      console.error('Error loading Kalshi generate counter:', error);
    }
  };
  
  const useGeneration = async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      if (customerInfo.entitlements.active?.kalshi_premium_access) {
        setHasPremiumAccess(true);
        return { 
          allowed: true, 
          reason: 'premium_access',
          message: 'Premium: Unlimited Kalshi predictions!',
          remaining: -1
        };
      }
      
      const today = new Date().toDateString();
      const lastDate = await AsyncStorage.getItem('@kalshi_generate_last_date');
      let remaining = 1;
      
      if (lastDate !== today) {
        await AsyncStorage.setItem('@kalshi_generate_last_date', today);
        await AsyncStorage.setItem('@kalshi_generate_remaining', '1');
        remaining = 1;
      } else {
        const storedCount = await AsyncStorage.getItem('@kalshi_generate_remaining');
        remaining = parseInt(storedCount) || 1;
      }
      
      if (remaining > 0) {
        remaining--;
        await AsyncStorage.setItem('@kalshi_generate_remaining', remaining.toString());
        setRemainingGenerations(remaining);
        
        return { 
          allowed: true, 
          remaining,
          reason: 'free',
          message: `Kalshi prediction generated! ${remaining} free left today.`
        };
      } else if (purchasedGenerations > 0) {
        const newPurchased = purchasedGenerations - 1;
        await AsyncStorage.setItem('@kalshi_purchased_generations', newPurchased.toString());
        setPurchasedGenerations(newPurchased);
        
        return { 
          allowed: true, 
          purchased: newPurchased,
          reason: 'purchased',
          message: `Using purchased prediction. ${newPurchased} remaining.`
        };
      } else {
        return { 
          allowed: false, 
          remaining: 0,
          purchased: 0,
          reason: 'limit_reached',
          message: 'Daily limit reached. Purchase more predictions.'
        };
      }
    } catch (error) {
      console.error('Error checking Kalshi generate counter:', error);
      return { 
        allowed: false, 
        reason: 'error',
        message: 'Error checking generation availability.'
      };
    }
  };
  
  const purchaseGenerations = async (count, price) => {
    try {
      const { customerInfo } = await Purchases.purchaseProduct(`kalshi_predictions_${count}`);
      if (customerInfo.entitlements.active?.kalshi_predictions_access) {
        const newTotal = purchasedGenerations + count;
        await AsyncStorage.setItem('@kalshi_purchased_generations', newTotal.toString());
        setPurchasedGenerations(newTotal);
        return { 
          success: true, 
          message: `Purchased ${count} Kalshi predictions!`,
          newTotal 
        };
      }
      return { success: false, message: 'Purchase failed.' };
    } catch (error) {
      if (!error.userCancelled) {
        return { success: false, message: 'Purchase failed. Please try again.' };
      }
      return { success: false, message: 'Purchase cancelled.' };
    }
  };
  
  const resetCounter = async () => {
    try {
      const today = new Date().toDateString();
      await AsyncStorage.setItem('@kalshi_generate_last_date', today);
      await AsyncStorage.setItem('@kalshi_generate_remaining', '1');
      setRemainingGenerations(1);
    } catch (error) {
      console.error('Error resetting Kalshi counter:', error);
    }
  };
  
  return { 
    remainingGenerations, 
    purchasedGenerations,
    hasPremiumAccess,
    useGeneration, 
    purchaseGenerations,
    resetCounter 
  };
};

// ============ MAIN KALSHI SCREEN ============
export default function KalshiPredictionsScreen() {
  const navigation = useAppNavigation();
  const { searchHistory, addToSearchHistory } = useSearch();
  const generateCounter = useKalshiGenerateCounter();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [kalshiPredictions, setKalshiPredictions] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState('All');
  const [marketData, setMarketData] = useState({
    weeklyVolume: '$2.0B',
    marketShare: '66.4%',
    sportsPercentage: '91.1%',
    topMarket: 'NFL Combos',
    recordDay: '$466M'
  });
  const [useRealApi, setUseRealApi] = useState(false); // Toggle between mock and real API

  // Mock news data with real Kalshi context
  const kalshiNews = [
    {
      id: '1',
      title: 'Kalshi Hits $2B Weekly Volume, Commands 66% Market Share',
      summary: 'Kalshi has become the dominant prediction market platform with $2 billion in weekly volume and 66.4% market share, surpassing competitors through CFTC regulation and Robinhood integration[citation:2].',
      category: 'Economics',
      timestamp: 'Today',
      url: 'https://example.com/kalshi-growth'
    },
    {
      id: '2',
      title: 'NCAA Petitions CFTC to Pause College Sports Markets',
      summary: 'NCAA President Charlie Baker calls for pause on college sports prediction markets until better safeguards are in place, specifically targeting Kalshi\'s markets[citation:1].',
      category: 'Legal',
      timestamp: 'Yesterday',
      url: 'https://example.com/ncaa-kalshi'
    },
    {
      id: '3',
      title: 'Record $466M Daily Volume During NFL Wild Card',
      summary: 'Kalshi processed record volume during NFL playoffs, with "Combos" (peer-to-peer parlays) driving over $100M in weekly volume[citation:2].',
      category: 'Sports',
      timestamp: '2 days ago',
      url: 'https://example.com/nfl-volume'
    },
    {
      id: '4',
      title: 'CFTC Regulation Enables 50-State Access',
      summary: 'As a CFTC-designated contract market, Kalshi operates legally nationwide despite state-level challenges from gaming regulators[citation:3].',
      category: 'Legal',
      timestamp: '3 days ago',
      url: 'https://example.com/cftc-regulation'
    },
    {
      id: '5',
      title: '91% of Kalshi Volume Now Sports-Based',
      summary: 'Platform has transformed from economic indicators to 91.1% sports volume, with NFL, NBA, and NHL contracts driving growth[citation:2].',
      category: 'Sports',
      timestamp: '1 week ago',
      url: 'https://example.com/sports-dominance'
    }
  ];

  // Market categories
  const markets = [
    { id: 'All', name: 'All Markets', icon: 'earth', color: '#8b5cf6' },
    { id: 'Sports', name: 'Sports', icon: 'american-football', color: '#ef4444' },
    { id: 'Politics', name: 'Politics', icon: 'flag', color: '#3b82f6' },
    { id: 'Economics', name: 'Economics', icon: 'cash', color: '#10b981' },
    { id: 'Culture', name: 'Culture', icon: 'film', color: '#f59e0b' },
  ];

  // AI generation prompts
  const kalshiPrompts = [
    "Generate high-probability Kalshi sports contract for tonight",
    "Create CFTC-regulated political prediction for next week",
    "Find undervalued economic indicator contract",
    "Build balanced Kalshi portfolio across markets",
    "Identify mispriced sports derivative with +EV"
  ];

  useEffect(() => {
    logScreenView('KalshiPredictionsScreen');
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    try {
      setLoading(true);
      
      if (useRealApi) {
        // REAL API CALL - Using your backend
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'https://pleasing-determination-production.up.railway.app'}/api/kalshi/markets`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'KALSHI-ACCESS-KEY': 'your-kalshi-access-key-here', // You'll need to store this securely
          },
        });
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        setKalshiPredictions(data.markets || []);
        
        // Update market data if available
        if (data.platformStats) {
          setMarketData(data.platformStats);
        }
      } else {
        // MOCK DATA CALL - Using our updated API service
        const result = await apiService.getKalshiMarkets();
        setKalshiPredictions(result.markets || []);
        
        // Update market data from platformStats
        if (result.platformStats) {
          setMarketData(result.platformStats);
        }
      }
      
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error loading Kalshi predictions:', error);
      
      // Fallback to mock data if real API fails
      try {
        const mockResult = await apiService.getKalshiMarkets();
        setKalshiPredictions(mockResult.markets || []);
        if (mockResult.platformStats) {
          setMarketData(mockResult.platformStats);
        }
      } catch (mockError) {
        console.error('Even mock data failed:', mockError);
      }
      
      setLoading(false);
      setRefreshing(false);
    }
  };

  const generateKalshiPrediction = async (prompt) => {
    if (!prompt.trim()) {
      Alert.alert('Error', 'Please enter a prompt for Kalshi prediction');
      return;
    }

    const result = await generateCounter.useGeneration();
    
    if (result.allowed) {
      setGenerating(true);
      
      logAnalyticsEvent('kalshi_prediction_generated', { prompt });
      
      try {
        let newPrediction;
        
        if (useRealApi) {
          // REAL API CALL for AI prediction
          const response = await apiService.generatePrediction(prompt, 'Kalshi');
          if (response.success) {
            newPrediction = {
              id: `kalshi-${Date.now()}`,
              question: response.prediction.analysis.substring(0, 80),
              category: 'AI Generated',
              yesPrice: '0.65',
              noPrice: '0.35',
              volume: 'AI Analysis',
              confidence: response.prediction.confidence || 78,
              edge: response.prediction.edge || '+4.5%',
              analysis: response.prediction.analysis,
              expires: 'Tomorrow',
              aiGenerated: true,
              generatedFrom: prompt
            };
          } else {
            throw new Error('AI generation failed');
          }
        } else {
          // MOCK AI prediction
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          newPrediction = {
            id: `kalshi-${Date.now()}`,
            question: `AI-Generated: ${prompt.substring(0, 50)}...`,
            category: 'AI Generated',
            yesPrice: '0.65',
            noPrice: '0.35',
            volume: 'AI Analysis',
            confidence: 78,
            edge: '+4.5%',
            analysis: `Generated by AI based on market data analysis: ${prompt}. This analysis considers current market trends, historical data, and probability models.`,
            expires: 'Tomorrow',
            aiGenerated: true,
            generatedFrom: prompt
          };
        }
        
        setKalshiPredictions([newPrediction, ...kalshiPredictions]);
        
        Alert.alert('Success', result.message || 'Prediction generated successfully!');
        
        setGenerating(false);
        setCustomPrompt('');
      } catch (error) {
        console.error('Error generating Kalshi prediction:', error);
        Alert.alert('Error', 'Failed to generate prediction');
        setGenerating(false);
      }
    } else {
      if (result.reason === 'limit_reached') {
        setShowPurchaseModal(true);
      } else {
        Alert.alert('Limit Reached', result.message);
      }
    }
  };

  const handlePlaceTrade = async (marketId, side, amount) => {
    try {
      const price = side === 'yes' ? '0.65' : '0.35'; // Example price
      
      const tradeResult = await apiService.placeKalshiTrade(marketId, side, amount, price);
      
      if (tradeResult.success) {
        Alert.alert('Trade Placed', `Successfully placed ${side} trade for $${amount}`);
        logAnalyticsEvent('kalshi_trade_placed', {
          marketId,
          side,
          amount,
          price
        });
      } else {
        Alert.alert('Trade Failed', 'Unable to place trade at this time');
      }
    } catch (error) {
      console.error('Error placing trade:', error);
      Alert.alert('Error', 'Failed to place trade');
    }
  };

  const renderPredictionCard = ({ item }) => {
    const yesProbability = Math.round(parseFloat(item.yesPrice) * 100);
    
    return (
      <View style={styles.predictionCard}>
        <View style={styles.predictionHeader}>
          <View style={styles.categoryRow}>
            <View style={[
              styles.categoryBadge,
              { backgroundColor: getCategoryColor(item.category) }
            ]}>
              <Text style={[
                styles.categoryText,
                { color: getCategoryTextColor(item.category) }
              ]}>
                {item.category}
              </Text>
            </View>
            {item.aiGenerated && (
              <View style={styles.aiBadge}>
                <Ionicons name="sparkles" size={12} color="#8b5cf6" />
                <Text style={styles.aiText}>AI Generated</Text>
              </View>
            )}
          </View>
          <View style={styles.volumeBadge}>
            <Ionicons name="trending-up" size={12} color="#10b981" />
            <Text style={styles.volumeText}>{item.volume}</Text>
          </View>
        </View>
        
        <Text style={styles.predictionQuestion}>{item.question}</Text>
        
        <View style={styles.priceSection}>
          <View style={styles.priceColumn}>
            <Text style={styles.priceLabel}>YES Price</Text>
            <Text style={styles.yesPrice}>${item.yesPrice}</Text>
            <Text style={styles.priceProbability}>{yesProbability}% probability</Text>
            <TouchableOpacity 
              style={styles.buyButton}
              onPress={() => handlePlaceTrade(item.id, 'yes', 10)}
            >
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={styles.buyButtonGradient}
              >
                <Text style={styles.buyButtonText}>Buy YES</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          
          <View style={styles.priceColumn}>
            <Text style={styles.priceLabel}>NO Price</Text>
            <Text style={styles.noPrice}>${item.noPrice}</Text>
            <Text style={styles.priceProbability}>{100 - yesProbability}% probability</Text>
            <TouchableOpacity 
              style={styles.buyButton}
              onPress={() => handlePlaceTrade(item.id, 'no', 10)}
            >
              <LinearGradient
                colors={['#ef4444', '#dc2626']}
                style={styles.buyButtonGradient}
              >
                <Text style={styles.buyButtonText}>Buy NO</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.analysisBox}>
          <Ionicons name="analytics" size={16} color="#f59e0b" />
          <Text style={styles.analysisText}>{item.analysis}</Text>
        </View>
        
        <View style={styles.predictionFooter}>
          <View style={styles.footerLeft}>
            <Text style={styles.expiryText}>Expires: {item.expires}</Text>
            <View style={styles.edgeBadge}>
              <Text style={styles.edgeText}>{item.edge} edge</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.trackButton}
            onPress={() => {
              logAnalyticsEvent('kalshi_prediction_tracked', {
                question: item.question,
                category: item.category,
                confidence: item.confidence
              });
              Alert.alert('Tracking Started', 'Kalshi prediction added to tracked contracts.');
            }}
          >
            <LinearGradient
              colors={['#8b5cf6', '#7c3aed']}
              style={styles.trackButtonGradient}
            >
              <Ionicons name="bookmark-outline" size={16} color="white" />
              <Text style={styles.trackButtonText}>Track</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const getCategoryTextColor = (category) => {
    switch(category) {
      case 'Sports': return '#ef4444';
      case 'Politics': return '#3b82f6';
      case 'Economics': return '#10b981';
      case 'Culture': return '#f59e0b';
      case 'AI Generated': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const filteredPredictions = selectedMarket === 'All' 
    ? kalshiPredictions 
    : kalshiPredictions.filter(prediction => prediction.category === selectedMarket);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Loading Kalshi Markets...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, {backgroundColor: '#8b5cf6'}]}>
        <LinearGradient
          colors={['#8b5cf6', '#7c3aed']}
          style={[StyleSheet.absoluteFillObject, styles.headerOverlay]}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            
            <View style={styles.headerControls}>
              <TouchableOpacity 
                style={styles.apiToggle}
                onPress={() => setUseRealApi(!useRealApi)}
              >
                <Text style={styles.apiToggleText}>
                  {useRealApi ? '🌐 Live API' : '🤖 Mock Data'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.headerSearchButton}
                onPress={() => setShowSearch(true)}
              >
                <Ionicons name="search-outline" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.headerMain}>
            <View style={styles.headerIcon}>
              <Ionicons name="shield-checkmark" size={32} color="white" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Kalshi Predictions</Text>
              <Text style={styles.headerSubtitle}>CFTC-regulated prediction markets • 50-state legal[citation:3]</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Generation Counter */}
      <View style={styles.counterContainer}>
        <View style={styles.counterHeader}>
          <Ionicons name="flash" size={20} color="#8b5cf6" />
          <Text style={styles.counterTitle}>Daily AI Predictions</Text>
        </View>
        
        <View style={styles.counterContent}>
          {generateCounter.hasPremiumAccess ? (
            <LinearGradient
              colors={['#10b981', '#059669']}
              style={styles.premiumBadge}
            >
              <Ionicons name="infinite" size={20} color="white" />
              <Text style={styles.premiumText}>Premium: Unlimited Kalshi Predictions</Text>
            </LinearGradient>
          ) : (
            <>
              <View style={styles.counterInfo}>
                <Text style={styles.counterLabel}>Free prediction today:</Text>
                <View style={styles.counterDisplay}>
                  <Text style={styles.counterNumber}>{generateCounter.remainingGenerations}</Text>
                  <Text style={styles.counterTotal}>/1</Text>
                </View>
                {generateCounter.purchasedGenerations > 0 && (
                  <View style={styles.purchasedBadge}>
                    <Text style={styles.purchasedText}>
                      +{generateCounter.purchasedGenerations} purchased
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${(generateCounter.remainingGenerations / 1) * 100}%` }
                  ]} 
                />
              </View>
              
              <Text style={styles.counterHint}>
                Resets daily at midnight. Purchase additional predictions below.
              </Text>
            </>
          )}
        </View>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadPredictions}
            colors={['#8b5cf6']}
            tintColor="#8b5cf6"
          />
        }
      >
        {/* Market News Feed */}
        <KalshiNewsFeed newsItems={kalshiNews} />

        {/* Contract Explainer */}
        <KalshiContractExplainer />

        {/* Market Selector */}
        <View style={styles.marketSelector}>
          {markets.map((market) => (
            <TouchableOpacity
              key={market.id}
              style={[
                styles.marketButton,
                selectedMarket === market.id && styles.marketButtonActive,
              ]}
              onPress={() => setSelectedMarket(market.id)}
            >
              {selectedMarket === market.id ? (
                <LinearGradient
                  colors={[market.color, market.color]}
                  style={styles.marketButtonGradient}
                >
                  <Ionicons name={market.icon} size={18} color="#fff" />
                  <Text style={styles.marketButtonTextActive}>{market.name}</Text>
                </LinearGradient>
              ) : (
                <>
                  <Ionicons name={market.icon} size={18} color="#6b7280" />
                  <Text style={styles.marketButtonText}>{market.name}</Text>
                </>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Generate Prediction Section */}
        <View style={styles.generateSection}>
          <View style={styles.generateHeader}>
            <LinearGradient
              colors={['#8b5cf6', '#7c3aed']}
              style={styles.generateTitleGradient}
            >
              <Text style={styles.generateTitle}>🤖 Generate Kalshi Prediction</Text>
            </LinearGradient>
            <Text style={styles.generateSubtitle}>
              AI analyzes CFTC-regulated markets for opportunities[citation:2]
            </Text>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.promptsScroll}
          >
            {kalshiPrompts.map((prompt, index) => (
              <TouchableOpacity
                key={index}
                style={styles.promptChip}
                onPress={() => generateKalshiPrediction(prompt)}
                disabled={generating}
              >
                <LinearGradient
                  colors={['#8b5cf6', '#7c3aed']}
                  style={[styles.promptChipGradient, generating && styles.promptChipDisabled]}
                >
                  <Ionicons name="sparkles" size={14} color="#fff" />
                  <Text style={styles.promptChipText}>{prompt}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <View style={styles.customPromptContainer}>
            <View style={styles.promptInputContainer}>
              <Ionicons name="create" size={20} color="#8b5cf6" />
              <TextInput
                style={styles.promptInput}
                placeholder="Custom prompt for Kalshi market analysis..."
                placeholderTextColor="#94a3b8"
                value={customPrompt}
                onChangeText={setCustomPrompt}
                multiline
                numberOfLines={2}
                editable={!generating}
              />
            </View>
            <TouchableOpacity
              style={[styles.generateButton, (!customPrompt.trim() || generating) && styles.generateButtonDisabled]}
              onPress={() => customPrompt.trim() && generateKalshiPrediction(customPrompt)}
              disabled={!customPrompt.trim() || generating}
            >
              {generating ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <LinearGradient
                  colors={['#8b5cf6', '#7c3aed']}
                  style={styles.generateButtonGradient}
                >
                  <Ionicons name="rocket" size={16} color="white" />
                  <Text style={styles.generateButtonText}>Generate</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Live Kalshi Predictions */}
        <View style={styles.predictionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📊 Live Kalshi Markets</Text>
            <View style={styles.predictionCountBadge}>
              <Text style={styles.predictionCount}>
                {filteredPredictions.length} contracts • {generateCounter.remainingGenerations} free today
              </Text>
            </View>
          </View>
          
          {filteredPredictions.length > 0 ? (
            <FlatList
              data={filteredPredictions}
              renderItem={renderPredictionCard}
              keyExtractor={item => `kalshi-${item.id}`}
              scrollEnabled={false}
              contentContainerStyle={styles.predictionsList}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="trending-up" size={48} color="#8b5cf6" />
              <Text style={styles.emptyText}>No Kalshi predictions found</Text>
              <Text style={styles.emptySubtext}>Try a different market category or generate your first prediction!</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Purchase Modal */}
      <Modal
        transparent={true}
        visible={showPurchaseModal}
        animationType="slide"
        onRequestClose={() => setShowPurchaseModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalOverlay}>
            <View style={[styles.purchaseModalContent, {backgroundColor: '#8b5cf6'}]}>
              <LinearGradient
                colors={['#8b5cf6', '#7c3aed']}
                style={StyleSheet.absoluteFillObject}
              >
                <View style={styles.purchaseModalHeader}>
                  <Ionicons name="card" size={40} color="white" />
                  <Text style={styles.purchaseModalTitle}>Purchase Kalshi Predictions</Text>
                </View>
                
                <View style={styles.purchaseModalBody}>
                  <Text style={styles.purchaseModalText}>
                    Daily free prediction limit reached. Purchase additional Kalshi market analyses:
                  </Text>
                  
                  <View style={styles.purchaseOptions}>
                    {[
                      { count: 3, price: '$2.99', perPrediction: '$0.99' },
                      { count: 10, price: '$7.99', perPrediction: '$0.79', popular: true },
                      { count: 25, price: '$14.99', perPrediction: '$0.59', bestValue: true }
                    ].map((option, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.purchaseOption}
                        onPress={async () => {
                          const result = await generateCounter.purchaseGenerations(option.count, option.price);
                          if (result.success) {
                            setShowPurchaseModal(false);
                            Alert.alert('Success', result.message);
                          } else {
                            Alert.alert('Error', result.message);
                          }
                        }}
                      >
                        <LinearGradient
                          colors={option.bestValue ? ['#10b981', '#059669'] : 
                                 option.popular ? ['#3b82f6', '#2563eb'] : 
                                 ['#8b5cf6', '#7c3aed']}
                          style={styles.purchaseOptionGradient}
                        >
                          {option.popular && (
                            <View style={styles.popularBadge}>
                              <Text style={styles.popularBadgeText}>POPULAR</Text>
                            </View>
                          )}
                          {option.bestValue && (
                            <View style={styles.bestValueBadge}>
                              <Text style={styles.bestValueBadgeText}>BEST VALUE</Text>
                            </View>
                          )}
                          <Text style={styles.purchaseOptionCount}>{option.count} Predictions</Text>
                          <Text style={styles.purchaseOptionPrice}>{option.price}</Text>
                          <Text style={styles.purchaseOptionPer}>{option.perPrediction} each</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    ))}
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.purchaseCancelButton}
                    onPress={() => setShowPurchaseModal(false)}
                  >
                    <Text style={styles.purchaseCancelText}>Not Now</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </View>
        </View>
      </Modal>
      
      <KalshiAnalyticsBox marketData={marketData} setMarketData={setMarketData} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 18,
    color: '#cbd5e1',
    fontWeight: '500',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    overflow: 'hidden',
  },
  headerOverlay: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  apiToggle: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 10,
  },
  apiToggleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSearchButton: {
    padding: 8,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerIcon: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    padding: 15,
    borderRadius: 25,
    marginRight: 15,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    marginTop: 5,
    fontWeight: '500',
  },
  counterContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 15,
    padding: 16,
    margin: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  counterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  counterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginLeft: 10,
  },
  counterContent: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 16,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  premiumText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 10,
  },
  counterInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  counterLabel: {
    fontSize: 14,
    color: '#cbd5e1',
    fontWeight: '600',
  },
  counterDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  counterNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8b5cf6',
  },
  counterTotal: {
    fontSize: 18,
    color: '#64748b',
    marginLeft: 4,
  },
  purchasedBadge: {
    backgroundColor: '#10b98120',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#10b98140',
  },
  purchasedText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: 3,
  },
  counterHint: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  marketSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 16,
    backgroundColor: '#1e293b',
    borderRadius: 15,
    padding: 10,
  },
  marketButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginHorizontal: 4,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#0f172a',
  },
  marketButtonActive: {
    backgroundColor: 'transparent',
  },
  marketButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    width: '100%',
    justifyContent: 'center',
  },
  marketButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    marginLeft: 6,
  },
  marketButtonTextActive: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 6,
  },
  generateSection: {
    backgroundColor: '#1e293b',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  generateHeader: {
    marginBottom: 20,
  },
  generateTitleGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 15,
    marginBottom: 10,
  },
  generateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  generateSubtitle: {
    fontSize: 14,
    color: '#cbd5e1',
    fontWeight: '500',
    textAlign: 'center',
  },
  promptsScroll: {
    marginVertical: 15,
  },
  promptChip: {
    marginRight: 15,
    borderRadius: 20,
  },
  promptChipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
    minWidth: 220,
  },
  promptChipDisabled: {
    opacity: 0.6,
  },
  promptChipText: {
    fontSize: 13,
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  customPromptContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  promptInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 14,
    marginRight: 15,
  },
  promptInput: {
    flex: 1,
    fontSize: 15,
    color: '#f1f5f9',
    marginLeft: 10,
    maxHeight: 60,
    fontWeight: '500',
  },
  generateButton: {
    borderRadius: 15,
    minWidth: 140,
  },
  generateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 15,
    borderRadius: 15,
  },
  generateButtonDisabled: {
    opacity: 0.7,
  },
  generateButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 8,
  },
  predictionsSection: {
    marginHorizontal: 16,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f1f5f9',
  },
  predictionCountBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#334155',
  },
  predictionCount: {
    fontSize: 14,
    color: '#cbd5e1',
    fontWeight: 'bold',
  },
  predictionsList: {
    paddingBottom: 10,
  },
  predictionCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    marginBottom: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  predictionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginRight: 10,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8b5cf620',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#8b5cf640',
  },
  aiText: {
    fontSize: 11,
    color: '#8b5cf6',
    fontWeight: '600',
    marginLeft: 4,
  },
  volumeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b98120',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#10b98140',
  },
  volumeText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
    marginLeft: 4,
  },
  predictionQuestion: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 20,
    lineHeight: 24,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  priceColumn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#334155',
  },
  priceLabel: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 8,
  },
  yesPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 4,
  },
  noPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 4,
  },
  priceProbability: {
    fontSize: 12,
    color: '#cbd5e1',
    marginBottom: 8,
  },
  buyButton: {
    width: '100%',
    borderRadius: 8,
    marginTop: 8,
  },
  buyButtonGradient: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  analysisBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#0f172a',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#334155',
  },
  analysisText: {
    fontSize: 14,
    color: '#cbd5e1',
    flex: 1,
    marginLeft: 10,
    lineHeight: 20,
  },
  predictionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiryText: {
    fontSize: 13,
    color: '#94a3b8',
    marginRight: 12,
  },
  edgeBadge: {
    backgroundColor: '#f59e0b20',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#f59e0b40',
  },
  edgeText: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
  },
  trackButton: {
    borderRadius: 12,
  },
  trackButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  trackButtonText: {
    fontSize: 13,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    borderWidth: 2,
    borderColor: '#334155',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 8,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  purchaseModalContent: {
    borderRadius: 25,
    width: '90%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  purchaseModalHeader: {
    padding: 30,
    alignItems: 'center',
  },
  purchaseModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 15,
    textAlign: 'center',
  },
  purchaseModalBody: {
    backgroundColor: 'white',
    padding: 25,
  },
  purchaseModalText: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  purchaseOptions: {
    marginBottom: 20,
  },
  purchaseOption: {
    marginBottom: 15,
  },
  purchaseOptionGradient: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  bestValueBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: '#10b981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bestValueBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  purchaseOptionCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  purchaseOptionPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  purchaseOptionPer: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  purchaseCancelButton: {
    alignItems: 'center',
    padding: 15,
  },
  purchaseCancelText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
  },
});
