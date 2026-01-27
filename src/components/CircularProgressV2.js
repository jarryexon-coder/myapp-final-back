// src/components/CircularProgressV2.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ProgressBar from 'react-native-animated-progress';

export default function CircularProgressV2({ 
  size = 60, 
  progress = 0, 
  color = '#8b5cf6', 
  text = '', 
  textStyle = {},
  thickness = 4,
  showPercentage = false
}) {
  const progressValue = Math.max(0, Math.min(1, progress));
  const displayText = text || (showPercentage ? `${Math.round(progressValue * 100)}%` : '');
  
  return (
    <View style={styles.container}>
      <View style={[styles.circle, { 
        width: size, 
        height: size,
        borderWidth: thickness,
        borderColor: '#e5e7eb',
      }]}>
        {/* Progress indicator using ProgressBar in a circle */}
        <View style={styles.progressContainer}>
          <ProgressBar
            progress={progressValue}
            height={thickness}
            backgroundColor="transparent"
            progressColor={color}
            animated={true}
            borderRadius={thickness / 2}
            style={{ width: size - thickness * 2 }}
          />
        </View>
      </View>
      
      {displayText && (
        <View style={[styles.textContainer, { width: size, height: size }]}>
          <Text style={[styles.text, textStyle, { fontSize: size / 4 }]}>
            {displayText}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circle: {
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    transform: [{ rotate: '-90deg' }],
    width: '100%',
    alignItems: 'center',
  },
  textContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: 'bold',
    color: '#1f2937',
  },
});
