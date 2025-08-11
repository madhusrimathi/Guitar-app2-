import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTabStore } from '../state/tabStore';
import { TabDocument } from '../types/tablature';

const ProjectDetailScreen = ({ route, navigation }: any) => {
  const { projectId } = route.params;
  const { 
    projects, 
    setCurrentTab, 
    createTab, 
    addTabToProject,
    deleteTab 
  } = useTabStore();
  
  const [showNewTabModal, setShowNewTabModal] = useState(false);
  const [newTabTitle, setNewTabTitle] = useState('');
  const [newTabArtist, setNewTabArtist] = useState('');

  const project = projects.find(p => p.id === projectId);

  if (!project) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-600">Project not found</Text>
      </SafeAreaView>
    );
  }

  const handleCreateTab = () => {
    if (newTabTitle.trim()) {
      const tab = createTab(newTabTitle.trim(), newTabArtist.trim());
      addTabToProject(projectId, tab);
      setShowNewTabModal(false);
      setNewTabTitle('');
      setNewTabArtist('');
      setCurrentTab(tab);
      navigation.navigate('Editor');
    }
  };

  const handleOpenTab = (tab: TabDocument) => {
    setCurrentTab(tab);
    navigation.navigate('Editor');
  };

  const handleDeleteTab = (tab: TabDocument) => {
    Alert.alert(
      'Delete Tab',
      `Are you sure you want to delete "${tab.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteTab(tab.id) },
      ]
    );
  };

  const TabCard = ({ tab }: { tab: TabDocument }) => (
    <Pressable
      onPress={() => handleOpenTab(tab)}
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-3"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-800 mb-1">{tab.title}</Text>
          {tab.artist && (
            <Text className="text-sm text-gray-500 mb-2">by {tab.artist}</Text>
          )}
          <View className="flex-row items-center mb-2">
            <View className="bg-blue-100 rounded-full px-2 py-1 mr-2">
              <Text className="text-xs text-blue-800 font-medium">
                {tab.metadata.difficulty}
              </Text>
            </View>
            <Text className="text-xs text-gray-400">{tab.metadata.bpm} BPM</Text>
            {tab.metadata.genre && (
              <View className="bg-gray-100 rounded-full px-2 py-1 ml-2">
                <Text className="text-xs text-gray-600">{tab.metadata.genre}</Text>
              </View>
            )}
          </View>
          <Text className="text-xs text-gray-400">
            {tab.sections.reduce((total, section) => total + section.measures.length, 0)} measures
          </Text>
        </View>
        <View className="flex-row items-center">
          <Pressable
            onPress={() => handleDeleteTab(tab)}
            className="p-2 mr-2"
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </Pressable>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center mb-3">
          <Pressable onPress={() => navigation.goBack()} className="mr-3">
            <Ionicons name="chevron-back" size={24} color="#374151" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900">{project.name}</Text>
            {project.description && (
              <Text className="text-sm text-gray-600">{project.description}</Text>
            )}
          </View>
        </View>
        
        {/* Project Stats */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <View className="bg-blue-100 rounded-full px-3 py-1 mr-2">
              <Text className="text-xs text-blue-800 font-medium">
                {project.tabs.length} tab{project.tabs.length !== 1 ? 's' : ''}
              </Text>
            </View>
            <Text className="text-xs text-gray-500">
              Updated {new Date(project.updatedAt).toLocaleDateString()}
            </Text>
          </View>
          
          <Pressable
            onPress={() => setShowNewTabModal(true)}
            className="bg-blue-600 rounded-lg px-4 py-2 flex-row items-center"
          >
            <Ionicons name="add" size={16} color="white" />
            <Text className="text-white font-medium ml-1">Add Tab</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {project.tabs.length > 0 ? (
          project.tabs.map((tab) => (
            <TabCard key={tab.id} tab={tab} />
          ))
        ) : (
          <View className="items-center py-12">
            <Ionicons name="musical-notes-outline" size={64} color="#9CA3AF" />
            <Text className="text-xl font-semibold text-gray-600 mt-4 mb-2">
              No tabs yet
            </Text>
            <Text className="text-gray-500 text-center mb-6">
              Create your first tab to start building this project.
            </Text>
            <Pressable
              onPress={() => setShowNewTabModal(true)}
              className="bg-blue-600 rounded-lg px-6 py-3"
            >
              <Text className="text-white font-medium">Create First Tab</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* New Tab Modal */}
      <Modal
        visible={showNewTabModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNewTabModal(false)}
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="p-4 border-b border-gray-200">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-gray-800">Add New Tab</Text>
              <Pressable onPress={() => setShowNewTabModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </Pressable>
            </View>
          </View>
          
          <View className="flex-1 p-4">
            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Title *</Text>
                <TextInput
                  value={newTabTitle}
                  onChangeText={setNewTabTitle}
                  placeholder="Enter tab title"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-base"
                  autoFocus
                />
              </View>
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Artist</Text>
                <TextInput
                  value={newTabArtist}
                  onChangeText={setNewTabArtist}
                  placeholder="Enter artist name"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-base"
                />
              </View>
              <View className="flex-row space-x-3 pt-4">
                <Pressable
                  onPress={() => setShowNewTabModal(false)}
                  className="flex-1 bg-gray-200 rounded-lg py-3 items-center"
                >
                  <Text className="text-gray-700 font-medium">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleCreateTab}
                  className="flex-1 bg-blue-600 rounded-lg py-3 items-center"
                  disabled={!newTabTitle.trim()}
                >
                  <Text className="text-white font-medium">Create & Edit</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default ProjectDetailScreen;
