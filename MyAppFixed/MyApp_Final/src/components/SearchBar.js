import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Keyboard,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import debounce from 'lodash.debounce';

const SearchBar = ({
  placeholder = "Search...",
  onSearch,
  onClear,
  autoFocus = false,
  style = {},
  searchHistory = [],
  showHistory = true,
  onSelectFromHistory,
  onClose,
  initialValue = ''
}) => {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const searchInputRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Debounced search function
  const debouncedSearch = debounce((text) => {
    if (onSearch) {
      onSearch(text);
    }
  }, 300);

  useEffect(() => {
    setSearchQuery(initialValue);
  }, [initialValue]);

  const handleTextChange = (text) => {
    setSearchQuery(text);
    debouncedSearch(text);
    
    if (text.length > 0) {
      setShowSearchHistory(true);
    } else {
      setShowSearchHistory(false);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setShowSearchHistory(false);
    if (onClear) {
      onClear();
    }
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (searchQuery.length > 0 && showHistory) {
      setShowSearchHistory(true);
    }
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay hiding history to allow selection
    setTimeout(() => {
      setShowSearchHistory(false);
    }, 200);
  };

  const handleSubmit = () => {
    Keyboard.dismiss();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleHistorySelect = (item) => {
    setSearchQuery(item);
    if (onSelectFromHistory) {
      onSelectFromHistory(item);
    }
    setShowSearchHistory(false);
    Keyboard.dismiss();
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      handleClear();
      Keyboard.dismiss();
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={[
        styles.searchContainer,
        isFocused && styles.searchContainerFocused
      ]}>
        <Ionicons 
          name="search" 
          size={20} 
          color={isFocused ? "#007AFF" : "#666"} 
          style={styles.searchIcon}
        />
        
        <TextInput
          ref={searchInputRef}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleTextChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus={autoFocus}
          clearButtonMode="never"
        />
        
        {searchQuery.length > 0 ? (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={18} color="#999" />
          </TouchableOpacity>
        ) : null}
        
        {onClose && (
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={22} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Search History Dropdown */}
      {showSearchHistory && searchHistory.length > 0 && showHistory && (
        <Animated.View 
          style={[styles.historyDropdown, { opacity: fadeAnim }]}
        >
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Recent Searches</Text>
            <TouchableOpacity onPress={() => setShowSearchHistory(false)}>
              <Ionicons name="close" size={16} color="#666" />
            </TouchableOpacity>
          </View>
          {searchHistory.slice(0, 5).map((item, index) => (
            <TouchableOpacity
              key={`${item}-${index}`}
              style={styles.historyItem}
              onPress={() => handleHistorySelect(item)}
            >
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.historyText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}
    </View>
  );
};

// Add this import at the top
import { Text } from 'react-native';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 100,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchContainerFocused: {
    borderColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  historyDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 1000,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyTitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  historyText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
});

export default SearchBar;
