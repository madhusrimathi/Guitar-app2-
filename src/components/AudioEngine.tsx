import React, { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { useTabStore } from '../state/tabStore';

// Simple audio engine for basic playback and metronome
export class SimpleAudioEngine {
  private sound: Audio.Sound | null = null;
  private metronomeSound: Audio.Sound | null = null;
  private intervalId: NodeJS.Timeout | null = null;
  
  private onPlaybackUpdate?: (position: { measure: number; beat: number }) => void;

  constructor() {
    this.initializeAudio();
  }

  private async initializeAudio() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Audio initialization error:', error);
    }
  }

  async playMetronome(tempo: number, onBeat?: () => void) {
    try {
      // Create a simple metronome tick using Audio
      const interval = 60000 / tempo; // Convert BPM to milliseconds
      
      if (this.intervalId) {
        clearInterval(this.intervalId);
      }

      this.intervalId = setInterval(() => {
        // Simple beep sound simulation - in a real app you'd load actual audio files
        onBeat?.();
      }, interval);
      
    } catch (error) {
      console.error('Metronome error:', error);
    }
  }

  stopMetronome() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async playTab(tabData: any, tempo: number) {
    try {
      // This is a simplified version - in a real app you'd:
      // 1. Convert tab data to audio samples
      // 2. Use a proper audio synthesis library
      // 3. Handle multiple strings and techniques
      
      console.log('Playing tab with tempo:', tempo);
      
      // For now, just play a metronome-like sound for each note
      const notePositions = tabData.sections[0]?.measures[0]?.notes || [];
      
      for (const note of notePositions) {
        // Simulate playing each note with timing
        setTimeout(() => {
          this.playNote(note);
        }, note.position * (60000 / tempo));
      }
      
    } catch (error) {
      console.error('Tab playback error:', error);
    }
  }

  private playNote(note: any) {
    // In a real implementation, this would:
    // 1. Generate or play audio for specific fret/string combinations
    // 2. Apply techniques like bends, slides, etc.
    // 3. Use proper guitar tone synthesis
    
    console.log(`Playing note: String ${note.string + 1}, Fret ${note.fret}`);
  }

  setPlaybackUpdateCallback(callback: (position: { measure: number; beat: number }) => void) {
    this.onPlaybackUpdate = callback;
  }

  dispose() {
    this.stopMetronome();
    if (this.sound) {
      this.sound.unloadAsync();
    }
    if (this.metronomeSound) {
      this.metronomeSound.unloadAsync();
    }
  }
}

// React component to manage audio engine
const AudioEngine: React.FC = () => {
  const audioEngineRef = useRef<SimpleAudioEngine | null>(null);
  const { playback, updatePlayback, currentTab } = useTabStore();

  useEffect(() => {
    audioEngineRef.current = new SimpleAudioEngine();
    
    return () => {
      audioEngineRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    const engine = audioEngineRef.current;
    if (!engine) return;

    if (playback.isPlaying && currentTab) {
      // Start playback
      engine.playTab(currentTab, playback.tempo);
      
      // Start metronome if needed
      engine.playMetronome(playback.tempo, () => {
        // Update beat position
        updatePlayback({
          currentBeat: (playback.currentBeat + 1) % 4
        });
      });
    } else {
      // Stop playback
      engine.stopMetronome();
    }

    return () => {
      engine.stopMetronome();
    };
  }, [playback.isPlaying, playback.tempo, currentTab]);

  // This component doesn't render anything - it just manages audio
  return null;
};

export default AudioEngine;
