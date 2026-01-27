// src/components/CircularProgress.js - UPDATED VERSION
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AnimatedProgress from 'react-native-animated-progress';

const CircularProgress = ({ 
  progress = 0, 
  size = 60,
  color = '#3b82f6',
  backgroundColor = '#e5e7eb',
  animated = true,
  showText = false,
  text = '',
  textStyle = {},
  thickness = 6, // Added thickness parameter
  ...props 
}) => {
  // Ensure progress is between 0 and 1
  const progressValue = Math.max(0, Math.min(1, progress));
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Progress circle using AnimatedProgress */}
      <View style={[styles.progressWrapper, { 
        width: size, 
        height: size,
        borderRadius: size / 2,
        backgroundColor,
        borderWidth: thickness,
        borderColor: backgroundColor
      }]}>
        <AnimatedProgress
          progress={progressValue}
          height={thickness}
          backgroundColor="transparent"
          progressColor={color}
          animated={animated}
          borderRadius={thickness / 2}
          style={{ width: size - thickness * 2 }}
          {...props}
        />
      </View>
      
      {/* Text overlay if showText is true OR if text is provided */}
      {(showText || text) && text && (
        <View style={[styles.textContainer, { width: size, height: size }]}>
          <Text style={[styles.text, textStyle, { fontSize: size / 4 }]}>
            {text}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressWrapper: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    transform: [{ rotate: '-90deg' }], // Rotate to make it start from top
  },
  textContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
});

export default CircularProgress;
