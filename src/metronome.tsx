import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTabStore } from '../state/tabStore';

interface MetronomeProps {
  isVisible: boolean;
  onToggleVisibility: () => void;
}

const Metronome: React.FC<MetronomeProps> = ({ isVisible, onToggleVisibility }) => {
  const { playback, updatePlayback } = useTabStore();
  const [beatAnimation] = useState(new Animated.Value(1));
  const [currentBeat, setCurrentBeat] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (playback.isPlaying) {
      const beatInterval = 60000 / playback.tempo; // Convert BPM to milliseconds
      
      interval = setInterval(() => {
        setCurrentBeat((prev) => {
          const next = (prev + 1) % 4;
          
          // Animate beat indicator
          Animated.sequence([
            Animated.timing(beatAnimation, {
              toValue: 1.3,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(beatAnimation, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }),
          ]).start();
          
          return next;
        });
      }, beatInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [playback.isPlaying, playback.tempo, beatAnimation]);

  const adjustTempo = (change: number) => {
    const newTempo = Math.max(60, Math.min(200, playback.tempo + change));
    updatePlayback({ tempo: newTempo });
  };

  const togglePlayback = () => {
    updatePlayback({ isPlaying: !playback.isPlaying });
    if (!playback.isPlaying) {
      setCurrentBeat(0);
    }
  };

  if (!isVisible) {
    return (
      <Pressable
        onPress={onToggleVisibility}
        className="absolute bottom-20 right-4 w-14 h-14 bg-blue-600 rounded-full items-center justify-center shadow-lg"
      >
        <Ionicons name="musical-notes" size={24} color="white" />
      </Pressable>
    );
  }

  return (
    <View className="absolute bottom-20 right-4 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 min-w-64">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold text-gray-800">Metronome</Text>
        <Pressable onPress={onToggleVisibility}>
          <Ionicons name="close" size={20} color="#6B7280" />
        </Pressable>
      </View>

      {/* Tempo Display */}
      <View className="items-center mb-4">
        <Text className="text-3xl font-bold text-blue-600 mb-1">
          {playback.tempo}
        </Text>
        <Text className="text-sm text-gray-500">BPM</Text>
      </View>

      {/* Tempo Controls */}
      <View className="flex-row items-center justify-center mb-4">
        <Pressable
          onPress={() => adjustTempo(-5)}
          className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
        >
          <Ionicons name="remove" size={20} color="#374151" />
        </Pressable>
        
        <View className="flex-row mx-4">
          <Pressable
            onPress={() => adjustTempo(-1)}
            className="px-3 py-1 bg-gray-50 rounded-lg mr-1"
          >
            <Text className="text-sm text-gray-600">-1</Text>
          </Pressable>
          <Pressable
            onPress={() => adjustTempo(1)}
            className="px-3 py-1 bg-gray-50 rounded-lg"
          >
            <Text className="text-sm text-gray-600">+1</Text>
          </Pressable>
        </View>
        
        <Pressable
          onPress={() => adjustTempo(5)}
          className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
        >
          <Ionicons name="add" size={20} color="#374151" />
        </Pressable>
      </View>

      {/* Beat Indicator */}
      <View className="flex-row items-center justify-center mb-4">
        {[0, 1, 2, 3].map((beat) => (
          <Animated.View
            key={beat}
            className={`w-3 h-3 rounded-full mx-1 ${
              currentBeat === beat ? 'bg-blue-600' : 'bg-gray-300'
            }`}
            style={{
              transform: [
                {
                  scale: currentBeat === beat ? beatAnimation : 1,
                }
              ],
            }}
          />
        ))}
      </View>

      {/* Play/Pause Button */}
      <Pressable
        onPress={togglePlayback}
        className={`w-full py-3 rounded-lg items-center ${
          playback.isPlaying ? 'bg-red-600' : 'bg-green-600'
        }`}
      >
        <View className="flex-row items-center">
          <Ionicons
            name={playback.isPlaying ? 'pause' : 'play'}
            size={20}
            color="white"
          />
          <Text className="text-white font-medium ml-2">
            {playback.isPlaying ? 'Stop' : 'Start'}
          </Text>
        </View>
      </Pressable>

      {/* Quick Tempo Presets */}
      <View className="flex-row justify-between mt-3">
        {[60, 80, 100, 120, 140].map((tempo) => (
          <Pressable
            key={tempo}
            onPress={() => updatePlayback({ tempo })}
            className={`px-2 py-1 rounded ${
              playback.tempo === tempo ? 'bg-blue-100' : 'bg-gray-50'
            }`}
          >
            <Text className={`text-xs font-medium ${
              playback.tempo === tempo ? 'text-blue-700' : 'text-gray-600'
            }`}>
              {tempo}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

export default Metronome;
 
