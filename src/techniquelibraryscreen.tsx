import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TechniqueType } from '../types/tablature';

interface TechniqueInfo {
  type: TechniqueType;
  symbol: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
}

const techniques: TechniqueInfo[] = [
  {
    type: 'palm-mute',
    symbol: 'PM',
    name: 'Palm Mute',
    description: 'Muting the strings with the palm of your picking hand to create a muffled sound.',
    difficulty: 'beginner',
    instructions: [
      'Rest the side of your picking hand lightly on the strings near the bridge',
      'Pick the strings while maintaining palm contact',
      'Adjust pressure for different muting levels',
      'Practice with power chords first'
    ]
  },
  {
    type: 'hammer-on',
    symbol: 'h',
    name: 'Hammer On',
    description: 'Pressing a string down onto a fret to produce a note without picking.',
    difficulty: 'beginner',
    instructions: [
      'Pick the first note normally',
      'Without picking again, firmly press down on a higher fret',
      'Use enough force to make the second note ring clearly',
      'Start with adjacent frets (5h7) before larger intervals'
    ]
  },
  {
    type: 'pull-off',
    symbol: 'p',
    name: 'Pull Off',
    description: 'Lifting a finger off a fret to sound a lower note without picking.',
    difficulty: 'beginner',
    instructions: [
      'Start with both fingers pressed down on their frets',
      'Pick the higher note',
      'Pull the upper finger off sideways to sound the lower note',
      'Keep the lower finger firmly planted'
    ]
  },
  {
    type: 'slide-up',
    symbol: '/',
    name: 'Slide Up',
    description: 'Sliding from one fret to a higher fret while maintaining string contact.',
    difficulty: 'beginner',
    instructions: [
      'Pick the starting note',
      'Keep pressure on the string and slide to the target fret',
      'Maintain consistent pressure throughout the slide',
      'Practice with chromatic slides first'
    ]
  },
  {
    type: 'slide-down',
    symbol: '\\',
    name: 'Slide Down',
    description: 'Sliding from one fret to a lower fret while maintaining string contact.',
    difficulty: 'beginner',
    instructions: [
      'Pick the starting note',
      'Keep pressure on the string and slide to the target fret',
      'Control the slide speed for musical effect',
      'End with proper finger placement on target fret'
    ]
  },
  {
    type: 'bend',
    symbol: 'b',
    name: 'String Bend',
    description: 'Pushing or pulling a string to raise its pitch.',
    difficulty: 'intermediate',
    instructions: [
      'Use multiple fingers for support when bending',
      'Push strings up toward the ceiling or pull down',
      'Practice bending to exact pitches (half-step, whole-step)',
      'Use your thumb as an anchor point behind the neck'
    ]
  },
  {
    type: 'vibrato',
    symbol: '~',
    name: 'Vibrato',
    description: 'Rapid small bends to add expression and sustain to notes.',
    difficulty: 'intermediate',
    instructions: [
      'Apply slight pressure variations to the string',
      'Use wrist motion for consistent vibrato',
      'Vary speed and width for different effects',
      'Practice with long sustained notes'
    ]
  },
  {
    type: 'tap',
    symbol: 't',
    name: 'Tapping',
    description: 'Using fingers from both hands to fret notes, creating rapid arpeggios.',
    difficulty: 'advanced',
    instructions: [
      'Use picking hand fingers to tap frets firmly',
      'Coordinate with fretting hand for fluid motion',
      'Mute unused strings to avoid noise',
      'Start with simple two-handed exercises'
    ]
  },
  {
    type: 'slap',
    symbol: 'S',
    name: 'Slap',
    description: 'Striking strings with the thumb for percussive attack.',
    difficulty: 'intermediate',
    instructions: [
      'Strike strings with the side of your thumb',
      'Use wrist motion, not arm motion',
      'Mute immediately after striking for staccato effect',
      'Commonly used in funk and bass playing'
    ]
  },
  {
    type: 'pop',
    symbol: 'P',
    name: 'Pop',
    description: 'Pulling strings away from the fretboard and letting them snap back.',
    difficulty: 'intermediate',
    instructions: [
      'Hook your finger under the string',
      'Pull the string away from the fretboard',
      'Release quickly for a snapping sound',
      'Often combined with slap technique'
    ]
  },
  {
    type: 'harmonic',
    symbol: '<>',
    name: 'Natural Harmonic',
    description: 'Lightly touching strings at specific frets to create bell-like tones.',
    difficulty: 'intermediate',
    instructions: [
      'Lightly touch the string directly above the fret wire',
      'Common positions: 12th, 7th, 5th frets',
      'Remove finger immediately after picking',
      'Practice at the 12th fret first (octave harmonic)'
    ]
  },
  {
    type: 'dead-note',
    symbol: 'x',
    name: 'Dead Note/Mute',
    description: 'Muting strings to create percussive sounds without definite pitch.',
    difficulty: 'beginner',
    instructions: [
      'Lightly touch strings without pressing to frets',
      'Pick normally while strings are muted',
      'Creates rhythmic percussive effects',
      'Useful for funky rhythm playing'
    ]
  }
];

const TechniqueLibraryScreen = ({ navigation }: any) => {
  const [selectedTechnique, setSelectedTechnique] = useState<TechniqueInfo | null>(null);
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  const filteredTechniques = techniques.filter(tech => 
    filterDifficulty === 'all' || tech.difficulty === filterDifficulty
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const TechniqueCard = ({ technique }: { technique: TechniqueInfo }) => (
    <Pressable
      onPress={() => setSelectedTechnique(technique)}
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-3"
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <View className="flex-row items-center mb-2">
            <View className="bg-blue-600 rounded-lg w-8 h-8 items-center justify-center mr-3">
              <Text className="text-white font-bold text-sm">{technique.symbol}</Text>
            </View>
            <Text className="text-lg font-semibold text-gray-800 flex-1">{technique.name}</Text>
          </View>
          
          <Text className="text-sm text-gray-600 mb-3 leading-relaxed">
            {technique.description}
          </Text>
          
          <View className="flex-row items-center">
            <View className={`rounded-full px-2 py-1 ${getDifficultyColor(technique.difficulty)}`}>
              <Text className="text-xs font-medium capitalize">{technique.difficulty}</Text>
            </View>
          </View>
        </View>
        
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </View>
    </Pressable>
  );

  const FilterButton = ({ 
    filter, 
    label, 
    count 
  }: { 
    filter: typeof filterDifficulty; 
    label: string; 
    count: number;
  }) => (
    <Pressable
      onPress={() => setFilterDifficulty(filter)}
      className={`px-4 py-2 rounded-lg mr-2 flex-row items-center ${
        filterDifficulty === filter ? 'bg-blue-600' : 'bg-gray-100'
      }`}
    >
      <Text className={`text-sm font-medium ${
        filterDifficulty === filter ? 'text-white' : 'text-gray-700'
      }`}>
        {label}
      </Text>
      <View className={`ml-2 px-2 py-0.5 rounded-full ${
        filterDifficulty === filter ? 'bg-blue-500' : 'bg-gray-200'
      }`}>
        <Text className={`text-xs font-medium ${
          filterDifficulty === filter ? 'text-white' : 'text-gray-600'
        }`}>
          {count}
        </Text>
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
            <Text className="text-xl font-bold text-gray-900">Guitar Techniques</Text>
            <Text className="text-sm text-gray-600">Master essential playing techniques</Text>
          </View>
        </View>
        
        {/* Filter Buttons */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row">
            <FilterButton 
              filter="all" 
              label="All" 
              count={techniques.length}
            />
            <FilterButton 
              filter="beginner" 
              label="Beginner" 
              count={techniques.filter(t => t.difficulty === 'beginner').length}
            />
            <FilterButton 
              filter="intermediate" 
              label="Intermediate" 
              count={techniques.filter(t => t.difficulty === 'intermediate').length}
            />
            <FilterButton 
              filter="advanced" 
              label="Advanced" 
              count={techniques.filter(t => t.difficulty === 'advanced').length}
            />
          </View>
        </ScrollView>
      </View>

      <ScrollView class
Name="flex-1 px-4 py-4">
        {filteredTechniques.map((technique) => (
          <TechniqueCard key={technique.type} technique={technique} />
        ))}
      </ScrollView>

      {/* Technique Detail Modal */}
      <Modal
        visible={selectedTechnique !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedTechnique(null)}
      >
        {selectedTechnique && (
          <SafeAreaView className="flex-1 bg-white">
            <View className="p-4 border-b border-gray-200">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="bg-blue-600 rounded-lg w-10 h-10 items-center justify-center mr-3">
                    <Text className="text-white font-bold">{selectedTechnique.symbol}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-xl font-bold text-gray-900">{selectedTechnique.name}</Text>
                    <View className={`self-start rounded-full px-2 py-1 mt-1 ${getDifficultyColor(selectedTechnique.difficulty)}`}>
                      <Text className="text-xs font-medium capitalize">{selectedTechnique.difficulty}</Text>
                    </View>
                  </View>
                </View>
                <Pressable onPress={() => setSelectedTechnique(null)}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </Pressable>
              </View>
            </View>
            
            <ScrollView className="flex-1 p-4">
              <View className="mb-6">
                <Text className="text-lg font-semibold text-gray-800 mb-3">Description</Text>
                <Text className="text-base text-gray-700 leading-relaxed">
                  {selectedTechnique.description}
                </Text>
              </View>
              
              <View>
                <Text className="text-lg font-semibold text-gray-800 mb-3">How to Play</Text>
                {selectedTechnique.instructions.map((instruction, index) => (
                  <View key={index} className="flex-row mb-3">
                    <View className="bg-blue-600 rounded-full w-6 h-6 items-center justify-center mr-3 mt-0.5">
                      <Text className="text-white text-xs font-bold">{index + 1}</Text>
                    </View>
                    <Text className="text-base text-gray-700 flex-1 leading-relaxed">
                      {instruction}
                    </Text>
                  </View>
                ))}
              </View>
              
              <View className="bg-blue-50 rounded-lg p-4 mt-6">
                <Text className="text-sm font-medium text-blue-800 mb-2">
                  💡 Practice Tip
                </Text>
                <Text className="text-sm text-blue-700">
                  Start slowly and focus on clean execution before increasing speed. Use a metronome to maintain consistent timing.
                </Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
};

export default TechniqueLibraryScreen;
