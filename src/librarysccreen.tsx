import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTabStore } from '../state/tabStore';
import { TabDocument, TabProject } from '../types/tablature';

const LibraryScreen = ({ navigation }: any) => {
  const { 
    projects, 
    recentTabs, 
    setCurrentTab, 
    setCurrentProject,
    deleteTab,
    uiMode 
  } = useTabStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'tabs' | 'projects'>('all');
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'difficulty'>('date');

  // Combine all tabs from all projects for searching
  const allTabs = projects.reduce((acc: TabDocument[], project) => {
    return [...acc, ...project.tabs];
  }, []);

  const filteredContent = React.useMemo(() => {
    let content: (TabDocument | TabProject)[] = [];
    
    if (selectedFilter === 'all') {
      content = [...allTabs, ...projects];
    } else if (selectedFilter === 'tabs') {
      content = allTabs;
    } else {
      content = projects;
    }

    // Filter by search query
    if (searchQuery.trim()) {
      content = content.filter(item => {
        const searchTerm = searchQuery.toLowerCase();
        if ('title' in item) {
          // It's a tab
          return (
            item.title.toLowerCase().includes(searchTerm) ||
            item.artist.toLowerCase().includes(searchTerm) ||
            item.metadata.genre.toLowerCase().includes(searchTerm)
          );
        } else {
          // It's a project
          return (
            item.name.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm)
          );
        }
      });
    }

    // Sort content
    content.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          const nameA = 'title' in a ? a.title : a.name;
          const nameB = 'title' in b ? b.title : b.name;
          return nameA.localeCompare(nameB);
        case 'date':
          const dateA = 'updatedAt' in a ? a.updatedAt : a.updatedAt;
          const dateB = 'updatedAt' in b ? b.updatedAt : b.updatedAt;
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        case 'difficulty':
          // Only applicable to tabs
          if ('metadata' in a && 'metadata' in b) {
            const difficultyOrder = ['beginner', 'intermediate', 'advanced', 'expert'];
            return difficultyOrder.indexOf(a.metadata.difficulty) - difficultyOrder.indexOf(b.metadata.difficulty);
          }
          return 0;
        default:
          return 0;
      }
    });

    return content;
  }, [allTabs, projects, searchQuery, selectedFilter, sortBy]);

  const handleOpenTab = (tab: TabDocument) => {
    setCurrentTab(tab);
    navigation.navigate('Editor');
  };

  const handleOpenProject = (project: TabProject) => {
    setCurrentProject(project);
    navigation.navigate('ProjectDetail', { projectId: project.id });
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
            Updated {new Date(tab.updatedAt).toLocaleDateString()}
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

  const ProjectCard = ({ project }: { project: TabProject }) => (
    <Pressable
      onPress={() => handleOpenProject(project)}
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-3"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Ionicons name="folder" size={20} color="#3B82F6" className="mr-2" />
            <Text className="text-lg font-semibold text-gray-800">{project.name}</Text>
          </View>
          {project.description && (
            <Text className="text-sm text-gray-500 mb-2">{project.description}</Text>
          )}
          <View className="flex-row items-center">
            <Text className="text-xs text-gray-400">
              {project.tabs.length} tab{project.tabs.length !== 1 ? 's' : ''}
            </Text>
            <Text className="text-xs text-gray-400 ml-4">
              Updated {new Date(project.updatedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </View>
    </Pressable>
  );

  const FilterButton = ({ filter, label }: { filter: typeof selectedFilter; label: string }) => (
    <Pressable
      onPress={() => setSelectedFilter(filter)}
      className={`px-4 py-2 rounded-lg mr-2 ${
        selectedFilter === filter ? 'bg-blue-600' : 'bg-gray-100'
      }`}
    >
      <Text className={`text-sm font-medium ${
        selectedFilter === filter ? 'text-white' : 'text-gray-700'
      }`}>
        {label}
      </Text>
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-xl font-bold text-gray-900">Library</Text>
          <Pressable onPress={() => setShowSortModal(true)}>
            <Ionicons name="options-outline" size={24} color="#374151" />
          </Pressable>
        </View>
        
        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-50 rounded-lg px-3 py-2 mb-3">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search tabs and projects..."
            className="flex-1 ml-2 text-base"
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </Pressable>
          )}
        </View>
        
        {/* Filter Buttons */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row">
            <FilterButton filter="all" label="All" />
            <FilterButton filter="tabs" label="Tabs" />
            <FilterButton filter="projects" label="Projects" />
          </View>
        </ScrollView>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {filteredContent.length > 0 ? (
          <>
            {filteredContent.map((item) => {
              if ('title' in item) {
                return <TabCard key={item.id} tab={item} />;
              } else {
                return <ProjectCard key={item.id} project={item} />;
              }
            })}
          </>
        ) : (
          <View className="items-center py-12">
            <Ionicons name="library-outline" size={64} color="#9CA3AF" />
            <Text className="text-xl font-semibold text-gray-600 mt-4 mb-2">
              {searchQuery ? 'No results found' : 'Your library is empty'}
            </Text>
            <Text className="text-gray-500 text-center">
              {searchQuery 
                ? 'Try adjusting your search terms or filters'
                : 'Create your first tab or project to get started'
              }
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSortModal(false)}
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="p-4 border-b border-gray-200">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-gray-800">Sort Options</Text>
              <Pressable onPress={() => setShowSortModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </Pressable>
            </View>
          </View>
     
     
          <View className="p-4">
            {[
              { key: 'date', label: 'Date Modified' },
              { key: 'name', label: 'Name' },
              { key: 'difficulty', label: 'Difficulty (Tabs only)' },
            ].map((option) => (
              <Pressable
                key={option.key}
                onPress={() => {
                  setSortBy(option.key as typeof sortBy);
                  setShowSortModal(false);
                }}
                className="flex-row items-center justify-between py-3 border-b border-gray-100"
              >
                <Text className="text-base text-gray-800">{option.label}</Text>
                {sortBy === option.key && (
                  <Ionicons name="checkmark" size={20} color="#3B82F6" />
                )}
              </Pressable>
            ))}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default LibraryScreen;
