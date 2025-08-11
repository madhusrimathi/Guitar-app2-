import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTabStore } from '../state/tabStore';

const SettingsScreen = ({ navigation }: any) => {
  const { settings, updateSettings, toggleUIMode, uiMode } = useTabStore();
  
  const SettingRow = ({ 
    title, 
    subtitle, 
    icon, 
    onPress, 
    rightElement, 
    showChevron = true 
  }: any) => (
    <Pressable
      onPress={onPress}
      className="bg-white px-4 py-4 border-b border-gray-100 flex-row items-center"
    >
      <View className="w-8 h-8 bg-blue-100 rounded-lg items-center justify-center mr-3">
        <Ionicons name={icon} size={20} color="#3B82F6" />
      </View>
      <View className="flex-1">
        <Text className="text-base font-medium text-gray-800">{title}</Text>
        {subtitle && (
          <Text className="text-sm text-gray-500 mt-1">{subtitle}</Text>
        )}
      </View>
      {rightElement}
      {showChevron && !rightElement && (
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      )}
    </Pressable>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <Text className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">
      {title}
    </Text>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <Text className="text-xl font-bold text-gray-900">Settings</Text>
      </View>

      <ScrollView className="flex-1">
        {/* Interface */}
        <SectionHeader title="Interface" />
        <View className="bg-white">
          <SettingRow
            title="UI Mode"
            subtitle={`Currently in ${uiMode.mode} mode`}
            icon="layers-outline"
            onPress={toggleUIMode}
            rightElement={
              <View className="bg-blue-100 rounded-full px-3 py-1">
                <Text className="text-xs text-blue-800 font-medium">
                  {uiMode.mode === 'beginner' ? 'Beginner' : 'Advanced'}
                </Text>
              </View>
            }
            showChevron={false}
          />
          <SettingRow
            title="Show Advanced Tools"
            subtitle="Display advanced editing features"
            icon="construct-outline"
            rightElement={
              <Switch
                value={uiMode.showAdvancedTools}
                onValueChange={(value) => {
                  // This would update the UI mode settings
                }}
                trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                thumbColor="#FFFFFF"
              />
            }
            showChevron={false}
          />
          <SettingRow
            title="Show Techniques Panel"
            subtitle="Display guitar technique shortcuts"
            icon="musical-notes-outline"
            rightElement={
              <Switch
                value={uiMode.showTechniques}
                onValueChange={(value) => {
                  // This would update the UI mode settings
                }}
                trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                thumbColor="#FFFFFF"
              />
            }
            showChevron={false}
          />
        </View>

        {/* Default Settings */}
        <SectionHeader title="Defaults" />
        <View className="bg-white">
          <SettingRow
            title="Default Tuning"
            subtitle="Standard (E A D G B E)"
            icon="tune"
            onPress={() => {
              Alert.alert('Default Tuning', 'Tuning customization coming soon!');
            }}
          />
          <SettingRow
            title="Default Tempo"
            subtitle={`${settings.playbackSettings.defaultTempo} BPM`}
            icon="speedometer-outline"
            onPress={() => {
              Alert.alert('Default Tempo', 'Tempo customization coming soon!');
            }}
          />
          <SettingRow
            title="Auto-save"
            subtitle="Automatically save changes"
            icon="save-outline"
            rightElement={
              <Switch
                value={settings.autoSave}
                onValueChange={(value) => {
                  updateSettings({ autoSave: value });
                }}
                trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                thumbColor="#FFFFFF"
              />
            }
            showChevron={false}
          />
        </View>

        {/* Export Settings */}
        <SectionHeader title="Export" />
        <View className="bg-white">
          <SettingRow
            title="Default Export Format"
            subtitle={settings.exportSettings.defaultFormat.toUpperCase()}
            icon="download-outline"
            onPress={() => {
              Alert.alert('Export Format', 'Format customization coming soon!');
            }}
          />
          <SettingRow
            title="Include Techniques"
            subtitle="Export playing technique annotations"
            icon="code-outline"
            rightElement={
              <Switch
                value={settings.exportSettings.includeTechniques}
                onValueChange={(value) => {
                  updateSettings({
                    exportSettings: {
                      ...settings.exportSettings,
                      includeTechniques: value
                    }
                  });
                }}
                trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                thumbColor="#FFFFFF"
              />
            }
            showChevron={false}
          />
        </View>

        {/* App Info */}
        <SectionHeader title="About" />
        <View className="bg-white">
          <SettingRow
            title="Guitar Technique Library"
            subtitle="Learn guitar playing techniques"
            icon="school-outline"
            onPress={() => navigation.navigate('TechniqueLibrary')}
          />
          <SettingRow
            title="App Version"
            subtitle="Gitaurr v1.0.0"
            icon="information-circle-outline"
            rightElement={null}
            showChevron={false}
          />
        </View>

        {/* Footer */}
        <View className="p-6 items-center">
          <Text className="text-sm text-gray-500 text-center">
            Built with ❤️ for guitar players
          </Text>
          <Text className="text-xs text-gray-400 text-center mt-2">
            Create, edit, and share guitar tablature
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
 
