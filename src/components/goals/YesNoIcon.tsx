import React from 'react';
import Svg, { Circle } from 'react-native-svg';

const YesNoIcon = ({ size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <Circle cx="7" cy="7" r="6.75" fill="#E9492A" stroke="black" strokeWidth="0.5" />
    <Circle cx="7" cy="7" r="5" fill="white" stroke="black" strokeWidth="0.5" />
  </Svg>
);

export default YesNoIcon; 