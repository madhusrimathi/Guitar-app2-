export interface TabNote {
  id: string;
  fret: number;
  string: number; // 0-5 for standard guitar (0 = high E, 5 = low E)
  position: number; // beat position in the measure
  duration: number; // note duration (1 = quarter note, 0.5 = eighth note, etc.)
  techniques: GuitarTechnique[];
  velocity: number; // 0-127 for MIDI-like velocity
}

export interface GuitarTechnique {
  id: string;
  type: TechniqueType;
  symbol: string;
  description: string;
  parameters?: TechniqueParameters;
}

export type TechniqueType = 
  | 'palm-mute'
  | 'slide-up'
  | 'slide-down'
  | 'hammer-on'
  | 'pull-off'
  | 'bend'
  | 'vibrato'
  | 'tap'
  | 'slap'
  | 'pop'
  | 'body-hit'
  | 'harmonic'
  | 'tremolo'
  | 'strum-up'
  | 'strum-down'
  | 'dead-note'
  | 'ghost-note';

export interface TechniqueParameters {
  bendAmount?: number; // for bends (in semitones)
  slideTarget?: number; // for slides (target fret)
  intensity?: number; // 0-100 for various techniques
}

export interface TabMeasure {
  id: string;
  timeSignature: TimeSignature;
  tempo: number;
  notes: TabNote[];
  barNumber: number;
}

export interface TimeSignature {
  numerator: number;
  denominator: number;
}

export interface TabSection {
  id: string;
  name: string;
  measures: TabMeasure[];
  repetitions: number;
}

export interface TabDocument {
  id: string;
  title: string;
  artist: string;
  tuning: string[]; // e.g., ['E', 'A', 'D', 'G', 'B', 'E']
  capo: number;
  sections: TabSection[];
  metadata: TabMetadata;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export interface TabMetadata {
  genre: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  bpm: number;
  key: string;
  description: string;
  tags: string[];
}

export interface TabProject {
  id: string;
  name: string;
  description: string;
  tabs: TabDocument[];
  folderId?: string;
  isPublic: boolean;
  collaborators: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TabFolder {
  id: string;
  name: string;
  parentId?: string;
  projects: TabProject[];
  subfolders: TabFolder[];
  createdAt: Date;
}

export interface PlaybackState {
  isPlaying: boolean;
  currentMeasure: number;
  currentBeat: number;
  tempo: number;
  volume: number;
  isLooping: boolean;
  loopStart?: number;
  loopEnd?: number;
}

export interface UIMode {
  mode: 'beginner' | 'advanced';
  showAdvancedTools: boolean;
  showTechniques: boolean;
  showMidiInfo: boolean;
  compactView: boolean;
}

export interface AppSettings {
  uiMode: UIMode;
  defaultTuning: string[];
  autoSave: boolean;
  playbackSettings: {
    defaultTempo: number;
    defaultVolume: number;
    countInBars: number;
  };
  exportSettings: {
    defaultFormat: 'pdf' | 'midi' | 'musicxml';
    includeTechniques: boolean;
    includeMetadata: boolean;
  };
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  position: {
    measureId: string;
    noteId?: string;
  };
  createdAt: Date;
  replies: Comment[];
}

export interface TabVersion {
  id: string;
  tabId: string;
  version: number;
  changes: string;
  createdAt: Date;
  createdBy: string;
  data: TabDocument;
}
 

