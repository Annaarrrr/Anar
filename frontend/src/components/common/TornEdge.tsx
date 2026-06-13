import React from 'react';
import { View, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useAppSettings } from '../../context/AppContext';

interface Props {
  color: string;
  borderColor?: string;
  style?: any;
}

export function TornEdge({ color, borderColor, style }: Props) {
  const { theme } = useAppSettings();
  const screenWidth = Dimensions.get('window').width;
  
  // Extend slightly beyond screen boundaries to avoid side seams
  const width = screenWidth + 24;

  // 150 segments across the screen width provides excellent resolution for micro-fibers
  const steps = 150;
  
  // Generate a deterministic, realistic torn path using multi-frequency wave interference
  const generateTornPath = (heightOffset: number, noiseAmp: number) => {
    let d = `M -12 ${heightOffset}`;
    for (let i = 0; i <= steps; i++) {
      const x = -12 + (i / steps) * width;
      
      // Multi-frequency wave synthesis
      // 1. Low frequency (overall wave structure)
      const baseWave = Math.sin((i / steps) * Math.PI * 4) * 3.8;
      // 2. Medium frequency (medium tears and bumps)
      const medWave = Math.sin((i / steps) * Math.PI * 13) * 1.6;
      // 3. High frequency (fine paper-cut teeth)
      const highWave = Math.sin(i * 1.95) * 0.75 + Math.cos(i * 3.4) * 0.45;
      
      // Fine micro-jitter to represent individual paper fibers
      const jitter = (i % 3 === 0 ? 0.35 : i % 3 === 1 ? -0.35 : 0);
      
      const y = heightOffset + baseWave + medWave + highWave * noiseAmp + jitter;
      d += ` L ${x} ${y}`;
    }
    // Close the path at the BOTTOM edge of the SVG frame (y = 24)
    d += ` L ${width} 24 L -12 24 Z`;
    return d;
  };

  // Generate paths for three overlapping layers (filling down to y=24):
  // 1. Shadow/backing border (extends highest up, lowest heightOffset = 8.0)
  const shadowPath = generateTornPath(8.0, 1.25);
  
  // 2. White fibrous paper core pulp layer (middle, heightOffset = 10.0)
  const fiberColor = theme === 'dark' ? '#4E496B' : '#FFFFFF'; // light slate pulp in dark mode, pure white in light mode
  const fiberPath = generateTornPath(10.0, 1.0);
  
  // 3. Main front sheet layer (lowest peak, highest heightOffset = 12.2)
  const sheetPath = generateTornPath(12.2, 0.7);

  return (
    <View style={[{ height: 24, width: width, overflow: 'hidden' }, style]} pointerEvents="none">
      <Svg width={width} height={24} viewBox={`0 0 ${width} 24`}>
        {/* Shadow Backing Outline */}
        {borderColor && <Path d={shadowPath} fill={borderColor} />}
        {/* White Fibrous Inner Pulp Core */}
        <Path d={fiberPath} fill={fiberColor} />
        {/* Main Front Paper Page Face */}
        <Path d={sheetPath} fill={color} />
      </Svg>
    </View>
  );
}
