import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TabDocument, TabProject, TabFolder, PlaybackState, UIMode, AppSettings } from '../types/tablature';

interface TabState {
  // Current editing state
  currentTab: TabDocument | null;
  currentProject: TabProject | null;
  
  // Library state
  projects: TabProject[];
  folders: TabFolder[];
  recentTabs: TabDocument[];
  
  // UI state
  uiMode: UIMode;
  settings: AppSettings;
  
  // Playback state
  playback: PlaybackState;
  
  // Actions
  setCurrentTab: (tab: TabDocument | null) => void;
  setCurrentProject: (project: TabProject | null) => void;
  updateTab: (tab: TabDocument) => void;
  createTab: (title: string, artist?: string) => TabDocument;
  deleteTab: (tabId: string) => void;
  createProject: (name: string, description?: string) => TabProject;
  addTabToProject: (projectId: string, tab: TabDocument) => void;
  createFolder: (name: string, parentId?: string) => TabFolder;
  toggleUIMode: () => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  updatePlayback: (playback: Partial<PlaybackState>) => void;
  addToRecent: (tab: TabDocument) => void;
}

const defaultUIMode: UIMode = {
  mode: 'beginner',
  showAdvancedTools: false,
  showTechniques: true,
  showMidiInfo: false,
  compactView: false,
};

const defaultSettings: AppSettings = {
  uiMode: defaultUIMode,
  defaultTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
  autoSave: true,
  playbackSettings: {
    defaultTempo: 120,
    defaultVolume: 80,
    countInBars: 1,
  },
  exportSettings: {
    defaultFormat: 'pdf',
    includeTechniques: true,
    includeMetadata: true,
  },
};

const defaultPlayback: PlaybackState = {
  isPlaying: false,
  currentMeasure: 0,
  currentBeat: 0,
  tempo: 120,
  volume: 80,
  isLooping: false,
};

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useTabStore = create<TabState>()(
  persist(
    (set, get) => ({
      currentTab: null,
      currentProject: null,
      projects: [],
      folders: [],
      recentTabs: [],
      uiMode: defaultUIMode,
      settings: defaultSettings,
      playback: defaultPlayback,
      
      setCurrentTab: (tab) => set({ currentTab: tab }),
      
      setCurrentProject: (project) => set({ currentProject: project }),
      
      updateTab: (tab) => {
        const state = get();
        set({
          currentTab: tab,
          projects: state.projects.map(project => ({
            ...project,
            tabs: project.tabs.map(t => t.id === tab.id ? tab : t)
          }))
        });
        get().addToRecent(tab);
      },
      
      createTab: (title, artist = '') => {
        const newTab: TabDocument = {
          id: generateId(),
          title,
          artist,
          tuning: get().settings.defaultTuning,
          capo: 0,
          sections: [{
            id: generateId(),
            name: 'Intro',
            measures: [{
              id: generateId(),
              timeSignature: { numerator: 4, denominator: 4 },
              tempo: 120,
              notes: [],
              barNumber: 1
            }],
            repetitions: 1
          }],
          metadata: {
            genre: '',
            difficulty: 'beginner',
            bpm: 120,
            key: 'C',
            description: '',
            tags: []
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1
        };
        
        set({ currentTab: newTab });
        get().addToRecent(newTab);
        return newTab;
      },
      
      deleteTab: (tabId) => {
        const state = get();
        set({
          projects: state.projects.map(project => ({
            ...project,
            tabs: project.tabs.filter(t => t.id !== tabId)
          })),
          recentTabs: state.recentTabs.filter(t => t.id !== tabId),
          currentTab: state.currentTab?.id === tabId ? null : state.currentTab
        });
      },
      
      createProject: (name, description = '') => {
        const newProject: TabProject = {
          id: generateId(),
          name,
          description,
          tabs: [],
          isPublic: false,
          collaborators: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        set(state => ({
          projects: [...state.projects, newProject],
          currentProject: newProject
        }));
        
        return newProject;
      },
      
      addTabToProject: (projectId, tab) => {
        set(state => ({
          projects: state.projects.map(project => 
            project.id === projectId 
              ? { ...project, tabs: [...project.tabs, tab], updatedAt: new Date() }
              : project
          )
        }));
      },
      
      createFolder: (name, parentId) => {
        const newFolder: TabFolder = {
          id: generateId(),
          name,
          parentId,
          projects: [],
          subfolders: [],
          createdAt: new Date()
        };
        
        set(state => ({
          folders: [...state.folders, newFolder]
        }));
        
        return newFolder;
      },
      
      toggleUIMode: () => {
        set(state => ({
          uiMode: {
            ...state.uiMode,
            mode: state.uiMode.mode === 'beginner' ? 'advanced' : 'beginner',
            showAdvancedTools: state.uiMode.mode === 'beginner',
            showTechniques: true,
            showMidiInfo: state.uiMode.mode === 'beginner',
          }
        }));
      },
      
      updateSettings: (newSettings) => {
        set(state => ({
          settings: { ...state.settings, ...newSettings }
        }));
      },
      
      updatePlayback: (newPlayback) => {
        set(state => ({
          playback: { ...state.playback, ...newPlayback }
        }));
      },
      
      addToRecent: (tab) => {
        set(state => ({
          recentTabs: [
            tab,
            ...state.recentTabs.filter(t => t.id !== tab.id)
          ].slice(0, 10) // Keep only 10 recent tabs
        }));
      },
    }),
    {
      name: 'gitaurr-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        projects: state.projects,
        folders: state.folders,
        recentTabs: state.recentTabs,
        settings: state.settings,
        // Don't persist current editing state and playback state
      }),
    }
  )
);
