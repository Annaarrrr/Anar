import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useAppSettings } from '../../context/AppContext';

interface Props {
  text?: string;
  textColor?: string;
  highlightColor?: string;
  style?: any;
  textStyle?: any;
  children?: React.ReactNode;
}

export const HighlighterBadge = React.memo(function HighlighterBadge({ text, textColor, highlightColor, style, textStyle, children }: Props) {
  const { colors, theme } = useAppSettings();
  const [size, setSize] = useState({ width: 0, height: 0 });

  const strokeColor = highlightColor || (theme === 'dark' ? colors.accentAlt : '#FFE600');
  const txtColor = textColor || colors.textPrimary;

  const onLayout = (e: any) => {
    setSize({
      width: Math.ceil(e.nativeEvent.layout.width),
      height: Math.ceil(e.nativeEvent.layout.height),
    });
  };

  const renderBackground = () => {
    if (size.width === 0 || size.height === 0) return null;

    const w = size.width;
    const h = size.height;

    if (theme === 'dark') {
      // Chalk theme: draw a sketchy chalk loop outline around the text
      // We draw an oval with slight hand-drawn offset overlapping lines
      const path1 = `M 4 ${h / 2} C 4 2, ${w - 4} 2, ${w - 4} ${h / 2} C ${w - 4} ${h - 2}, 4 ${h - 2}, 4 ${h / 2}`;
      const path2 = `M 2 ${h / 2 + 1} C 6 4, ${w - 2} 1, ${w - 6} ${h / 2 - 1} C ${w - 2} ${h - 4}, 2 ${h - 1}, 2 ${h / 2 + 1}`;
      
      return (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          <Svg width={w} height={h}>
            <Path
              d={path1}
              fill="none"
              stroke={strokeColor}
              strokeWidth={1.5}
              opacity={0.65}
            />
            <Path
              d={path2}
              fill="none"
              stroke={strokeColor}
              strokeWidth={1}
              opacity={0.45}
            />
          </Svg>
        </View>
      );
    } else {
      // Light theme: Felt-tip highlighter stroke (thick translucent background)
      const path = `M 4 ${h / 2 + 1} Q ${w / 2} ${h / 2 - 1.5}, ${w - 4} ${h / 2 + 0.5}`;
      return (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          <Svg width={w} height={h}>
            <Path
              d={path}
              fill="none"
              stroke={strokeColor}
              strokeWidth={h * 0.75} // thick marker stroke filling most of the height
              strokeLinecap="round"
              opacity={0.4} // translucent highlighter ink
            />
          </Svg>
        </View>
      );
    }
  };

  return (
    <View
      onLayout={onLayout}
      style={[
        {
          position: 'relative',
          paddingHorizontal: 10,
          paddingVertical: 4,
          justifyContent: 'center',
          alignItems: 'center',
        },
        style,
      ]}
    >
      {renderBackground()}
      {children ? children : (
        <Text
          style={[
            {
              fontSize: 10,
              fontFamily: 'Cairo_700Bold',
              color: txtColor,
            },
            textStyle,
          ]}
        >
          {text}
        </Text>
      )}
    </View>
  );
});
