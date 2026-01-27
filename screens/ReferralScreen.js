import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ReferralScreen = () => {
  const [referralCode, setReferralCode] = useState('ABCDEF');

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Join me on Sports Analytics! Use my code ${referralCode} for a special offer!`,
        title: 'Share Sports Analytics'
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Refer Friends</Text>
        <Text style={styles.subtitle}>Earn rewards for every friend who joins</Text>
      </View>

      <View style={styles.codeCard}>
        <Text style={styles.codeLabel}>Your Referral Code</Text>
        <Text style={styles.code}>{referralCode}</Text>
      </View>

      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <Ionicons name="share-social" size={24} color="white" />
        <Text style={styles.shareButtonText}>Share Referral Link</Text>
      </TouchableOpacity>

      <View style={styles.rewardsSection}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        
        <View style={styles.stepCard}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Share Your Code</Text>
            <Text style={styles.stepDescription}>Share your unique referral code with friends</Text>
          </View>
        </View>
        
        <View style={styles.stepCard}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Friend Subscribes</Text>
            <Text style={styles.stepDescription}>Your friend signs up and purchases premium</Text>
          </View>
        </View>
        
        <View style={styles.stepCard}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>3</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Get Rewarded</Text>
            <Text style={styles.stepDescription}>Receive 7 days of free Premium Access</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 30,
    backgroundColor: '#8b5cf6',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginTop: 10,
    opacity: 0.9,
  },
  codeCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  codeLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 10,
  },
  code: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1e293b',
    letterSpacing: 3,
  },
  shareButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
    marginHorizontal: 20,
    borderRadius: 15,
    marginBottom: 30,
  },
  shareButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  rewardsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 5,
  },
  stepDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
});

export default ReferralScreen;
