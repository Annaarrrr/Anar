import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useAppSettings } from '../../context/AppContext';

export function NotebookBackground() {
  const { colors, theme } = useAppSettings();
  const { height, width } = Dimensions.get('window');

  // Spacing for lines (32px matches general Cairo font lineHeights nicely)
  const LINE_HEIGHT = 32;
  const numLines = Math.ceil(height / LINE_HEIGHT);

  if (theme === 'dark') {
    // Chalkboard grid theme
    return (
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.bg, overflow: 'hidden' }]} pointerEvents="none">
        {/* Horizontal grid lines */}
        {Array.from({ length: numLines }).map((_, i) => (
          <View
            key={`h-${i}`}
            style={{
              position: 'absolute',
              top: i * LINE_HEIGHT,
              left: 0,
              right: 0,
              height: 1,
              backgroundColor: '#1E1B2D', // faint chalk-grid color
              opacity: 0.7,
            }}
          />
        ))}
        {/* Vertical grid lines */}
        {Array.from({ length: Math.ceil(width / LINE_HEIGHT) }).map((_, i) => (
          <View
            key={`v-${i}`}
            style={{
              position: 'absolute',
              left: i * LINE_HEIGHT,
              top: 0,
              bottom: 0,
              width: 1,
              backgroundColor: '#1E1B2D', // faint chalk-grid color
              opacity: 0.7,
            }}
          />
        ))}
      </View>
    );
  }

  // Light theme: classic ruled notebook paper with left red margin line
  return (
    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.bg, overflow: 'hidden' }]} pointerEvents="none">
      {/* Horizontal ruled notebook lines */}
      {Array.from({ length: numLines }).map((_, i) => (
        <View
          key={`h-${i}`}
          style={{
            position: 'absolute',
            top: i * LINE_HEIGHT + 24, // offset slightly
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: '#E6DFD5', // soft paper folding/lining lines
            opacity: 0.5,
          }}
        />
      ))}
      {/* Left red margin line */}
      <View
        style={{
          position: 'absolute',
          left: 48,
          top: 0,
          bottom: 0,
          width: 1.5,
          backgroundColor: '#FFA2A2', // faint pink/red notebook margin line
          opacity: 0.7,
        }}
      />
    </View>
  );
}
