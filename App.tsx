import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import TabEditor from './components/TabEditor';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <TabEditor />
    </SafeAreaView>
  );
}
