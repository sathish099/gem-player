import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Line, Polygon } from "react-native-svg";

const ChessBoardOverlay = ({ uciMove }) => {
  if (!uciMove) return null;

  // Convert UCI e.g. "e2e4" to grid coordinates (0-7)
  const getCoords = (square) => {
    const files = "abcdefgh";
    const x = files.indexOf(square[0]);
    const y = 8 - parseInt(square[1]);
    return { x, y };
  };

  const from = getCoords(uciMove.substring(0, 2));
  const to = getCoords(uciMove.substring(2, 4));

  // Convert to percentage (0-100)
  const x1 = from.x * 12.5 + 6.25;
  const y1 = from.y * 12.5 + 6.25;
  const x2 = to.x * 12.5 + 6.25;
  const y2 = to.y * 12.5 + 6.25;

  return (
    <View style={StyleSheet.absoluteFill}>
      <Svg height="100%" width="100%" viewBox="0 0 100 100">
        <Line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="rgba(0, 255, 0, 0.8)"
          strokeWidth="2"
        />
        {/* Arrow head */}
        <Polygon
          points={`${x2},${y2 - 2} ${x2 - 2},${y2 + 2} ${x2 + 2},${y2 + 2}`}
          fill="rgba(0, 255, 0, 0.8)"
          transform={`rotate(${(Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI + 90}, ${x2}, ${y2})`}
        />
      </Svg>
    </View>
  );
};

export default ChessBoardOverlay;
