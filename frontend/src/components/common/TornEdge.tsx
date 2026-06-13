import React, { useMemo } from 'react';
import { View, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useAppSettings } from '../../context/AppContext';

interface Props {
  color: string;
  borderColor?: string;
  style?: any;
}

export const TornEdge = React.memo(function TornEdge({ color, borderColor, style }: Props) {
  const { theme } = useAppSettings();
  const screenWidth = Dimensions.get('window').width;
  const width = screenWidth + 24;
  const steps = 50;

  // Memoize path generation to prevent running loops on every frame of drawer animation
  const { shadowPath, fiberPath, sheetPath } = useMemo(() => {
    const generateTornPath = (heightOffset: number, noiseAmp: number) => {
      let d = `M -12 ${heightOffset}`;
      for (let i = 0; i <= steps; i++) {
        const x = -12 + (i / steps) * width;
        
        // Multi-frequency wave synthesis
        const baseWave = Math.sin((i / steps) * Math.PI * 4) * 3.8;
        const medWave = Math.sin((i / steps) * Math.PI * 13) * 1.6;
        const highWave = Math.sin(i * 1.95) * 0.75 + Math.cos(i * 3.4) * 0.45;
        
        const jitter = (i % 3 === 0 ? 0.35 : i % 3 === 1 ? -0.35 : 0);
        const y = heightOffset + baseWave + medWave + highWave * noiseAmp + jitter;
        d += ` L ${x} ${y}`;
      }
      d += ` L ${width} 24 L -12 24 Z`;
      return d;
    };

    return {
      shadowPath: generateTornPath(8.0, 1.25),
      fiberPath: generateTornPath(10.0, 1.0),
      sheetPath: generateTornPath(12.2, 0.7),
    };
  }, [width]);

  const fiberColor = theme === 'dark' ? '#4E496B' : '#FFFFFF';

  return (
    <View style={[{ height: 24, width: width, overflow: 'hidden' }, style]} pointerEvents="none">
      <Svg width={width} height={24} viewBox={`0 0 ${width} 24`}>
        {borderColor && <Path d={shadowPath} fill={borderColor} />}
        <Path d={fiberPath} fill={fiberColor} />
        <Path d={sheetPath} fill={color} />
      </Svg>
    </View>
  );
});
