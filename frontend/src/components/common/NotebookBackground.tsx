import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useAppSettings } from '../../context/AppContext';

export const NotebookBackground = React.memo(function NotebookBackground() {
  const { colors, theme } = useAppSettings();
  const { height, width } = Dimensions.get('window');

  // Spacing for lines (32px matches general Cairo font lineHeights nicely)
  const LINE_HEIGHT = 32;
  const numLines = Math.ceil(height / LINE_HEIGHT);
  const numVertLines = Math.ceil(width / LINE_HEIGHT);

  // Generate combined path data for drawing all grid lines in a single native call
  const { pathD, vertPathD } = useMemo(() => {
    let hD = '';
    for (let i = 0; i < numLines; i++) {
      const y = theme === 'dark' ? i * LINE_HEIGHT : i * LINE_HEIGHT + 24;
      hD += ` M 0 ${y} L ${width} ${y}`;
    }

    let vD = '';
    if (theme === 'dark') {
      for (let i = 0; i < numVertLines; i++) {
        const x = i * LINE_HEIGHT;
        vD += ` M ${x} 0 L ${x} ${height}`;
      }
    }

    return { pathD: hD, vertPathD: vD };
  }, [height, width, theme]);

  if (theme === 'dark') {
    // Chalkboard grid theme
    return (
      <View
        style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.bg }]}
        pointerEvents="none"
        renderToHardwareTextureAndroid={true}
      >
        <Svg width={width} height={height} style={StyleSheet.absoluteFillObject}>
          {/* Draw all horizontal and vertical grid lines as a single combined path */}
          <Path
            d={`${pathD} ${vertPathD}`}
            fill="none"
            stroke="#1E1B2D" // Faint chalkboard grid line
            strokeWidth={1}
            opacity={0.7}
          />
        </Svg>
      </View>
    );
  }

  // Light theme: classic ruled notebook paper
  return (
    <View
      style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.bg }]}
      pointerEvents="none"
      renderToHardwareTextureAndroid={true}
    >
      <Svg width={width} height={height} style={StyleSheet.absoluteFillObject}>
        {/* Draw all ruled page lines as a single path */}
        <Path
          d={pathD}
          fill="none"
          stroke="#E6DFD5" // Soft ruled notebook line color
          strokeWidth={1}
          opacity={0.5}
        />
        {/* Left red notebook margin line */}
        <Path
          d={`M 48 0 L 48 ${height}`}
          fill="none"
          stroke="#FFA2A2" // Ruled margin line
          strokeWidth={1.5}
          opacity={0.7}
        />
      </Svg>
    </View>
  );
});
