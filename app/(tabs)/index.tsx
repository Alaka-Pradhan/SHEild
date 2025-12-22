import React from 'react';
import { View } from 'react-native';

export default function TabOneScreen() {
  return <View style={{ flex: 1 }} />;
}

function add(a, b) {
  return a + b;
}
module.exports = add;
export { add };
