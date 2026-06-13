import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Polygon } from 'react-native-svg';
import { useAppSettings } from '../../context/AppContext';

interface Props {
  size?: number;
  color?: string; // Card background color
  backgroundColor?: string; // Outer screen background color
  style?: any;
}

export const CornerFold = React.memo(function CornerFold({ size = 16, color, backgroundColor, style }: Props) {
  const { colors, theme } = useAppSettings();
  const cardColor = color || colors.surface;
  
  // Choose screen background color based on theme
  const bgColor = backgroundColor || colors.bg;

  // Under-fold shadow color (darker shade of the card background)
  const foldColor = theme === 'dark' ? '#2A2640' : '#E0DCD3';

  return (
    <View style={[styles.container, { width: size, height: size }, style]} pointerEvents="none">
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Outer background backing triangle (fills cut area with screen's background color) */}
        <Polygon points={`0,0 ${size},0 ${size},${size}`} fill={bgColor} />
        
        {/* Folded paper flap */}
        <Polygon points={`0,0 0,${size} ${size},${size}`} fill={foldColor} />
        
        {/* Sketch border line along the fold */}
        <Path
          d={`M 0 0 L 0 ${size} L ${size} ${size}`}
          fill="none"
          stroke={colors.border}
          strokeWidth={1.5}
        />
      </Svg>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -2.5,
    right: -2.5,
    zIndex: 5,
  },
});
