import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTabStore } from '../state/tabStore';
import { TabNote, GuitarTechnique, TechniqueType } from '../types/tablature';
import AudioEngine from '../components/AudioEngine';
import Metronome from '../components/Metronome';
import { TabExporter, ExportOptions } from '../utils/exportUtils';

const { width: screenWidth } = Dimensions.get('window');

const EditorScreen = ({ navigation }: any) => {
  const { 
    currentTab, 
    updateTab, 
    createTab, 
    playback, 
    updatePlayback,
    uiMode,
    toggleUIMode 
  } = useTabStore();
  
  const [selectedString, setSelectedString] = useState(0);
  const [selectedFret, setSelectedFret] = useState(0);
  const [showTechniqueModal, setShowTechniqueModal] = useState(false);
  const [selectedTechniques, setSelectedTechniques] = useState<TechniqueType[]>([]);
  const [showPlaybackControls, setShowPlaybackControls] = useState(false);
  const [showMetronome, setShowMetronome] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Initialize a new tab if none exists
  React.useEffect(() => {
    if (!currentTab) {
      createTab('Untitled Tab');
    }
  }, [currentTab, createTab]);

  if (!currentTab) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-600">Loading editor...</Text>
      </SafeAreaView>
    );
  }

  const currentSection = currentTab.sections[0];
  const currentMeasure = currentSection.measures[0];

  const handleAddNote = (string: number, fret: number, position: number) => {
    const newNote: TabNote = {
      id: Math.random().toString(36).substr(2, 9),
      fret,
      string,
      position,
      duration: 1, // quarter note
      techniques: [],
      velocity: 100,
    };

    const updatedMeasure = {
      ...currentMeasure,
      notes: [...currentMeasure.notes, newNote],
    };

    const updatedSection = {
      ...currentSection,
      measures: [updatedMeasure, ...currentSection.measures.slice(1)],
    };

    const updatedTab = {
      ...currentTab,
      sections: [updatedSection, ...currentTab.sections.slice(1)],
      updatedAt: new Date(),
    };

    updateTab(updatedTab);
  };

  const handleRemoveNote = (noteId: string) => {
    const updatedMeasure = {
      ...currentMeasure,
      notes: currentMeasure.notes.filter(note => note.id !== noteId),
    };

    const updatedSection = {
      ...currentSection,
      measures: [updatedMeasure, ...currentSection.measures.slice(1)],
    };

    const updatedTab = {
      ...currentTab,
      sections: [updatedSection, ...currentTab.sections.slice(1)],
      updatedAt: new Date(),
    };

    updateTab(updatedTab);
  };

  const handleExport = async (format: 'txt' | 'json' | 'csv') => {
    try {
      const options: ExportOptions = {
        format,
        includeTechniques: true,
        includeMetadata: true,
      };
      
      await TabExporter.exportAndShare(currentTab, options);
      setShowExportModal(false);
      Alert.alert('Success', `${currentTab.title} exported successfully!`);
    } catch (error) {
      Alert.alert('Export Error', 'Failed to export the tab. Please try again.');
      console.error('Export error:', error);
    }
  };

  const techniques: { type: TechniqueType; symbol: string; name: string }[] = [
    { type: 'palm-mute', symbol: 'PM', name: 'Palm Mute' },
    { type: 'slide-up', symbol: '/', name: 'Slide Up' },
    { type: 'slide-down', symbol: '\\', name: 'Slide Down' },
    { type: 'hammer-on', symbol: 'h', name: 'Hammer On' },
    { type: 'pull-off', symbol: 'p', name: 'Pull Off' },
    { type: 'bend', symbol: 'b', name: 'Bend' },
    { type: 'vibrato', symbol: '~', name: 'Vibrato' },
    { type: 'tap', symbol: 't', name: 'Tap' },
    { type: 'slap', symbol: 'S', name: 'Slap' },
    { type: 'pop', symbol: 'P', name: 'Pop' },
    { type: 'harmonic', symbol: '<>', name: 'Harmonic' },
    { type: 'dead-note', symbol: 'x', name: 'Dead Note' },
  ];

  const TablatureGrid = () => {
    const strings = ['E', 'B', 'G', 'D', 'A', 'E']; // High to low
    const positions = Array.from({ length: 16 }, (_, i) => i); // 16 positions per measure

    return (
      <View className="bg-white rounded-lg p-4 mx-4 mb-4 shadow-sm">
        <Text className="text-lg font-semibold text-gray-800 mb-4">
          {currentTab.title}
        </Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ minWidth: screenWidth * 2 }}>
            {strings.map((stringName, stringIndex) => (
              <View key={stringIndex} className="flex-row items-center mb-2">
                <View className="w-6 mr-2">
                  <Text className="text-sm font-medium text-gray-600">
                    {stringName}
                  </Text>
                </View>
                <View className="flex-1 flex-row">
                  {positions.map((position) => {
                    const notesOnPosition = currentMeasure.notes.filter(
                      note => note.string === stringIndex && Math.floor(note.position * 4) === position
                    );
                    
                    return (
                      <Pressable
                        key={position}
                        onPress={() => {
                          if (notesOnPosition.length > 0) {
                            handleRemoveNote(notesOnPosition[0].id);
                          } else {
                            handleAddNote(stringIndex, selectedFret, position / 4);
                          }
                        }}
                        className="relative"
                        style={{ width: 40, height: 40 }}
                      >
                        {/* String line */}
                        <View 
                          className="absolute top-1/2 left-0 right-0 bg-gray-300"
                          style={{ height: 1, transform: [{ translateY: -0.5 }] }}
                        />
                        
                        {/* Position marker */}
                        <View 
                          className="absolute top-1/2 left-1/2 w-2 h-2 bg-gray-200 rounded-full"
                          style={{ 
                            transform: [{ translateX: -4 }, { translateY: -4 }],
                            opacity: position % 4 === 0 ? 1 : 0.5
                          }}
                        />
                        
                        {/* Note */}
                        {notesOnPosition.length > 0 && (
                          <View className="absolute top-1/2 left-1/2 w-8 h-8 bg-blue-600 rounded-full items-center justify-center"
                            style={{ transform: [{ translateX: -16 }, { translateY: -16 }] }}
                          >
                            <Text className="text-white font-bold text-sm">
                              {notesOnPosition[0].fret}
                            </Text>
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  const FretSelector = () => (
    <View className="bg-white rounded-lg p-4 mx-4 mb-4 shadow-sm">
      <Text className="text-base font-medium text-gray-800 mb-3">Select Fret</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row">
          {Array.from({ length: 25 }, (_, i) => (
            <Pressable
              key={i}
              onPress={() => setSelectedFret(i)}
              className={`w-10 h-10 rounded-lg mr-2 items-center justify-center ${
                selectedFret === i ? 'bg-blue-600' : 'bg-gray-100'
              }`}
            >
              <Text className={`font-medium ${
                selectedFret === i ? 'text-white' : 'text-gray-700'
              }`}>
                {i}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const TechniqueSelector = () => (
    <View className="bg-white rounded-lg p-4 mx-4 mb-4 shadow-sm">
      <Text className="text-base font-medium text-gray-800 mb-3">Techniques</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row">
          {techniques.map((technique) => (
            <Pressable
              key={technique.type}
              onPress={() => {
                setSelectedTechniques(prev => 
                  prev.includes(technique.type)
                    ? prev.filter(t => t !== technique.type)
                    : [...prev, technique.type]
                );
              }}
              className={`px-3 py-2 rounded-lg mr-2 ${
                selectedTechniques.includes(technique.type) 
                  ? 'bg-purple-600' 
                  : 'bg-gray-100'
              }`}
            >
              <Text className={`text-sm font-medium ${
                selectedTechniques.includes(technique.type) 
                  ? 'text-white' 
                  : 'text-gray-700'
              }`}>
                {technique.symbol}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const PlaybackControls = () => (
    <View className="bg-white rounded-lg p-4 mx-4 mb-4 shadow-sm">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => updatePlayback({ isPlaying:
 !playback.isPlaying })}
            className={`w-12 h-12 rounded-full items-center justify-center ${
              playback.isPlaying ? 'bg-red-600' : 'bg-green-600'
            }`}
          >
            <Ionicons 
              name={playback.isPlaying ? 'pause' : 'play'} 
              size={24} 
              color="white" 
            />
          </Pressable>
          <Pressable
            onPress={() => updatePlayback({ currentMeasure: 0, currentBeat: 0 })}
            className="w-12 h-12 rounded-full items-center justify-center bg-gray-300 ml-2"
          >
            <Ionicons name="stop" size={24} color="#374151" />
          </Pressable>
        </View>
        
        <View className="flex-row items-center">
          <Text className="text-sm text-gray-600 mr-2">Tempo:</Text>
          <Text className="text-sm font-medium text-gray-800">{playback.tempo} BPM</Text>
        </View>
        
        <Pressable
          onPress={() => updatePlayback({ isLooping: !playback.isLooping })}
          className={`px-3 py-1 rounded-lg ${
            playback.isLooping ? 'bg-orange-600' : 'bg-gray-200'
          }`}
        >
          <Text className={`text-sm font-medium ${
            playback.isLooping ? 'text-white' : 'text-gray-700'
          }`}>
            Loop
          </Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#374151" />
          </Pressable>
          
          <Text className="text-lg font-semibold text-gray-800">
            {currentTab.title}
          </Text>
          
          <View className="flex-row items-center">
            <Pressable
              onPress={toggleUIMode}
              className="mr-3 px-2 py-1 rounded-lg bg-gray-100"
            >
              <Text className="text-xs font-medium text-gray-600">
                {uiMode.mode === 'beginner' ? 'Beginner' : 'Advanced'}
              </Text>
            </Pressable>
            
            <Pressable
              onPress={() => setShowPlaybackControls(!showPlaybackControls)}
              className="mr-3"
            >
              <Ionicons name="play-circle" size={24} color="#3B82F6" />
            </Pressable>
            
            <Pressable
              onPress={() => setShowMetronome(!showMetronome)}
              className="mr-3"
            >
              <Ionicons name="timer" size={24} color="#8B5CF6" />
            </Pressable>
            
            <Pressable
              onPress={() => setShowExportModal(true)}
            >
              <Ionicons name="share-outline" size={24} color="#10B981" />
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" ref={scrollViewRef}>
        {/* Playback Controls */}
        {showPlaybackControls && <PlaybackControls />}
        
        {/* Tablature Grid */}
        <TablatureGrid />
        
        {/* Fret Selector */}
        <FretSelector />
        
        {/* Technique Selector */}
        {(uiMode.mode === 'advanced' || uiMode.showTechniques) && <TechniqueSelector />}
        
        {/* Instructions */}
        <View className="bg-blue-50 rounded-lg p-4 mx-4 mb-4">
          <Text className="text-sm font-medium text-blue-800 mb-2">
            How to use the editor:
          </Text>
          <Text className="text-sm text-blue-700">
            • Select a fret number and tap on the tablature grid to add notes{'\n'}
            • Tap existing notes to remove them{'\n'}
            • Use technique buttons to add playing techniques{'\n'}
            • Toggle between Beginner and Advanced modes for different feature sets
          </Text>
        </View>
      </ScrollView>

      {/* Audio Engine */}
      <AudioEngine />
      
      {/* Floating Metronome */}
      <Metronome 
        isVisible={showMetronome} 
        onToggleVisibility={() => setShowMetronome(!showMetronome)} 
      />

      {/* Export Modal */}
      <Modal
        visible={showExportModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowExportModal(false)}
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="p-4 border-b border-gray-200">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-gray-800">Export Tab</Text>
              <Pressable onPress={() => setShowExportModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </Pressable>
            </View>
          </View>
          
          <View className="flex-1 p-4">
            <Text className="text-base text-gray-700 mb-6">
              Choose a format to export "{currentTab.title}":
            </Text>
            
            <View className="space-y-3">
              <Pressable
                onPress={() => handleExport('txt')}
                className="bg-blue-50 border border-blue-200 rounded-lg p-4"
              >
                <View className="flex-row items-center">
                  <Ionicons name="document-text" size={24} color="#3B82F6" />
                  <View className="ml-3 flex-1">
                    <Text className="text-lg font-medium text-gray-800">Text (.txt)</Text>
                    <Text className="text-sm text-gray-600">
                      Human-readable tablature format
                    </Text>
                  </View>
                </View>
              </Pressable>
              
              <Pressable
                onPress={() => handleExport('json')}
                className="bg-green-50 border border-green-200 rounded-lg p-4"
              >
                <View className="flex-row items-center">
                  <Ionicons name="code-slash" size={24} color="#10B981" />
                  <View className="ml-3 flex-1">
                    <Text className="text-lg font-medium text-gray-800">JSON (.json)</Text>
                    <Text className="text-sm text-gray-600">
                      Complete data format with all metadata
                    </Text>
                  </View>
                </View>
              </Pressable>
              
              <Pressable
                onPress={() => handleExport('csv')}
                className="bg-purple-50 border border-purple-200 rounded-lg p-4"
              >
                <View className="flex-row items-center">
                  <Ionicons name="grid" size={24} color="#8B5CF6" />
                  <View className="ml-3 flex-1">
                    <Text className="text-lg font-medium text-gray-800">CSV (.csv)</Text>
                    <Text className="text-sm text-gray-600">
                      Spreadsheet format for data analysis
                    </Text>
                  </View>
                </View>
              </Pressable>
            </View>
            
            <View className="bg-yellow-50 rounded-lg p-4 mt-6">
              <Text className="text-sm font-medium text-yellow-800 mb-1">
                📱 Note
              </Text>
              <Text className="text-sm text-yellow-700">
                PDF and MIDI export features are coming soon! For now, you can export 
                as text format and import into other tablature software.
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default EditorScreen;
 
