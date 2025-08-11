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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTabStore } from '../state/tabStore';
import { TabDocument, TabProject } from '../types/tablature';

const DashboardScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { 
    projects, 
    recentTabs, 
    currentTab, 
    createTab, 
    createProject, 
    setCurrentTab, 
    setCurrentProject,
    uiMode 
  } = useTabStore();
  
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showNewTabModal, setShowNewTabModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newTabTitle, setNewTabTitle] = useState('');
  const [newTabArtist, setNewTabArtist] = useState('');

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      const project = createProject(newProjectName.trim(), newProjectDescription.trim());
      setShowNewProjectModal(false);
      setNewProjectName('');
      setNewProjectDescription('');
      navigation.navigate('ProjectDetail', { projectId: project.id });
    }
  };

  const handleCreateTab = () => {
    if (newTabTitle.trim()) {
      const tab = createTab(newTabTitle.trim(), newTabArtist.trim());
      setShowNewTabModal(false);
      setNewTabTitle('');
      setNewTabArtist('');
      navigation.navigate('Editor');
    }
  };

  const handleOpenTab = (tab: TabDocument) => {
    setCurrentTab(tab);
    navigation.navigate('Editor');
  };

  const handleOpenProject = (project: TabProject) => {
    setCurrentProject(project);
    navigation.navigate('ProjectDetail', { projectId: project.id });
  };

  const QuickActionCard = ({ title, icon, onPress, color = '#3B82F6' }: any) => (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex-1 mx-1"
      style={{ backgroundColor: 'white' }}
    >
      <View className="items-center">
        <View 
          className="w-12 h-12 rounded-full items-center justify-center mb-2"
          style={{ backgroundColor: `${color}20` }}
        >
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <Text className="text-sm font-medium text-gray-800 text-center">{title}</Text>
      </View>
    </Pressable>
  );

  const TabCard = ({ tab, onPress }: { tab: TabDocument; onPress: () => void }) => (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-3"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-800 mb-1">{tab.title}</Text>
          {tab.artist && (
            <Text className="text-sm text-gray-500 mb-2">by {tab.artist}</Text>
          )}
          <View className="flex-row items-center">
            <View className="bg-blue-100 rounded-full px-2 py-1 mr-2">
              <Text className="text-xs text-blue-800 font-medium">
                {tab.metadata.difficulty}
              </Text>
            </View>
            <Text className="text-xs text-gray-400">
              {tab.metadata.bpm} BPM
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </View>
    </Pressable>
  );

  const ProjectCard = ({ project, onPress }: { project: TabProject; onPress: () => void }) => (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-3"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-800 mb-1">{project.name}</Text>
          {project.description && (
            <Text className="text-sm text-gray-500 mb-2">{project.description}</Text>
          )}
          <Text className="text-xs text-gray-400">
            {project.tabs.length} tab{project.tabs.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </View>
    </Pressable>
  );

  const CreateModal = ({ visible, onClose, title, children }: any) => (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-white">
        <View className="p-4 border-b border-gray-200">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-gray-800">{title}</Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </Pressable>
          </View>
        </View>
        <View className="flex-1 p-4">{children}</View>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-6 py-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-2xl font-bold text-gray-900">Gitaurr</Text>
            <View className="flex-row items-center">
              <View className="bg-blue-100 rounded-full px-3 py-1">
                <Text className="text-xs text-blue-800 font-medium">
                  {uiMode.mode === 'beginner' ? 'Beginner' : 'Advanced'}
                </Text>
              </View>
            </View>
          </View>
          <Text className="text-gray-600">Create, edit, and share guitar tablature</Text>
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Quick Actions</Text>
          <View className="flex-row">
            <QuickActionCard
              title="New Tab"
              icon="add-circle"
              onPress={() => setShowNewTabModal(true)}
              color="#10B981"
            />
            <QuickActionCard
              title="New Project"
              icon="folder"
              onPress={() => setShowNewProjectModal(true)}
              color="#3B82F6"
            />
            <QuickActionCard
              title="Techniques"
              icon="school"
              onPress={() => navigation.navigate('TechniqueLibrary')}
              color="#8B5CF6"
            />
          </View>
        </View>

        {/* Continue Working */}
        {currentTab && (
          <View className="px-6 mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-3">Continue Working</Text>
            <TabCard tab={currentTab} onPress={() => handleOpenTab(currentTab)} />
          </View>
        )}

        {/* Recent Tabs */}
        {recentTabs.length > 0 && (
          <View className="px-6 mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-3">Recent Tabs</Text>
            {recentTabs.slice(0, 3).map((tab) => (
              <TabCard key={tab.id} tab={tab} onPress={() => handleOpenTab(tab)} />
            ))}
          </View>
        )}

        {/* Recent Projects */}
        {projects.length > 0 && (
          <View className="px-6 mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-3">Projects</Text>
            {projects.slice(0, 3).map((project) => (
              <ProjectCard key={project.id} project={project} onPress={() => handleOpenProject(project)} />
            ))}
          </View>
        )}

        {/* Empty State */}
        {projects.length === 0 && recentTabs.length === 0 && (
          <View className="px-6 py-12 items-center">
            <Ionicons name="musical-notes" size={64} color="#9CA3AF" />
            <Text className="text-xl font-semibold text-gray-600 mt-4 mb-2">
              Welcome to Gitaurr!
            </Text>
            <Text className="text-gray-500 text-center mb-6">
              Start by creating your first tab or project to begin composing guitar tablature.
            </Text>
            <Pressable
              onPress={() => setShowNewTabModal(true)}
              className="bg-blue-600 rounded-lg px-6 py-3"
            >
              <Text className="text-white font-medium">Create Your First Tab</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* New Tab Modal */}
      <CreateModal
        visible={showNewTabModal}
        onClose={() => setShowNewTabModal(false)}
        title="Create New Tab"
      >
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
              className=
"flex-1 bg-blue-600 rounded-lg py-3 items-center"
              disabled={!newTabTitle.trim()}
            >
              <Text className="text-white font-medium">Create</Text>
            </Pressable>
          </View>
        </View>
      </CreateModal>

      {/* New Project Modal */}
      <CreateModal
        visible={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        title="Create New Project"
      >
        <View className="space-y-4">
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">Name *</Text>
            <TextInput
              value={newProjectName}
              onChangeText={setNewProjectName}
              placeholder="Enter project name"
              className="border border-gray-300 rounded-lg px-3 py-2 text-base"
              autoFocus
            />
          </View>
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">Description</Text>
            <TextInput
              value={newProjectDescription}
              onChangeText={setNewProjectDescription}
              placeholder="Enter project description"
              className="border border-gray-300 rounded-lg px-3 py-2 text-base"
              multiline
              numberOfLines={3}
            />
          </View>
          <View className="flex-row space-x-3 pt-4">
            <Pressable
              onPress={() => setShowNewProjectModal(false)}
              className="flex-1 bg-gray-200 rounded-lg py-3 items-center"
            >
              <Text className="text-gray-700 font-medium">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleCreateProject}
              className="flex-1 bg-blue-600 rounded-lg py-3 items-center"
              disabled={!newProjectName.trim()}
            >
              <Text className="text-white font-medium">Create</Text>
            </Pressable>
          </View>
        </View>
      </CreateModal>
    </SafeAreaView>
  );
};

export default DashboardScreen;
 
