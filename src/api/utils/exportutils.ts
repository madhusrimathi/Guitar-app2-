import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { TabDocument } from '../types/tablature';

export interface ExportOptions {
  format: 'txt' | 'json' | 'csv';
  includeTechniques: boolean;
  includeMetadata: boolean;
}

export class TabExporter {
  static async exportToText(tab: TabDocument, options: ExportOptions): Promise<string> {
    const lines: string[] = [];
    
    // Header
    lines.push(`${tab.title}${tab.artist ? ` - ${tab.artist}` : ''}`);
    lines.push('='.repeat(50));
    lines.push('');
    
    if (options.includeMetadata) {
      lines.push(`Tuning: ${tab.tuning.join(' ')}`);
      if (tab.capo > 0) lines.push(`Capo: ${tab.capo}`);
      lines.push(`Tempo: ${tab.metadata.bpm} BPM`);
      lines.push(`Difficulty: ${tab.metadata.difficulty}`);
      if (tab.metadata.genre) lines.push(`Genre: ${tab.metadata.genre}`);
      lines.push('');
    }
    
    // Tablature for each section
    for (const section of tab.sections) {
      if (section.name) {
        lines.push(`[${section.name}]`);
        lines.push('');
      }
      
      for (const measure of section.measures) {
        lines.push(`Measure ${measure.barNumber}:`);
        
        // Create tablature lines for each string
        const stringLines: string[][] = Array(6).fill(null).map(() => []);
        const stringNames = ['e', 'B', 'G', 'D', 'A', 'E']; // High to low
        
        // Initialize with dashes
        const measureLength = 16; // 16 positions per measure
        for (let i = 0; i < 6; i++) {
          for (let j = 0; j < measureLength; j++) {
            stringLines[i].push('-');
          }
        }
        
        // Place notes
        for (const note of measure.notes) {
          const position = Math.floor(note.position * measureLength);
          if (position < measureLength) {
            const fretStr = note.fret.toString().padStart(2, '-');
            stringLines[note.string][position] = fretStr;
            
            // Add technique symbols if enabled
            if (options.includeTechniques && note.techniques.length > 0) {
              const techniqueSymbols = note.techniques.map(t => t.symbol).join('');
              if (position + 1 < measureLength) {
                stringLines[note.string][position + 1] = techniqueSymbols;
              }
            }
          }
        }
        
        // Output the tablature lines
        for (let i = 0; i < 6; i++) {
          lines.push(`${stringNames[i]}|${stringLines[i].join('')}|`);
        }
        lines.push('');
      }
    }
    
    // Footer
    if (options.includeMetadata) {
      lines.push('');
      lines.push(`Created with Gitaurr on ${new Date(tab.createdAt).toLocaleDateString()}`);
    }
    
    return lines.join('\n');
  }
  
  static async exportToJSON(tab: TabDocument): Promise<string> {
    return JSON.stringify(tab, null, 2);
  }
  
  static async exportToCSV(tab: TabDocument): Promise<string> {
    const rows: string[] = [];
    
    // Header
    rows.push('Section,Measure,String,Fret,Position,Duration,Techniques');
    
    // Data
    for (const section of tab.sections) {
      for (const measure of section.measures) {
        for (const note of measure.notes) {
          const techniques = note.techniques.map(t => t.symbol).join(';');
          rows.push([
            section.name,
            measure.barNumber,
            note.string + 1, // Convert to 1-based
            note.fret,
            note.position,
            note.duration,
            techniques
          ].join(','));
        }
      }
    }
    
    return rows.join('\n');
  }
  
  static async exportAndShare(tab: TabDocument, options: ExportOptions): Promise<void> {
    try {
      let content: string;
      let fileName: string;
      
      switch (options.format) {
        case 'txt':
          content = await this.exportToText(tab, options);
          fileName = `${tab.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
          break;
        case 'json':
          content = await this.exportToJSON(tab);
          fileName = `${tab.title.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
          break;
        case 'csv':
          content = await this.exportToCSV(tab);
          fileName = `${tab.title.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
          break;
        default:
          throw new Error('Unsupported export format');
      }
      
      const fileUri = FileSystem.documentDirectory + fileName;
      await FileSystem.writeAsStringAsync(fileUri, content);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          dialogTitle: `Share ${tab.title}`,
          mimeType: this.getMimeType(options.format),
        });
      } else {
        throw new Error('Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  }
  
  private static getMimeType(format: string): string {
    switch (format) {
      case 'txt': return 'text/plain';
      case 'json': return 'application/json';
      case 'csv': return 'text/csv';
      default: return 'text/plain';
    }
  }
}

// Simple MIDI-like data structure for future MIDI export
export interface MidiNote {
  note: number; // MIDI note number
  velocity: number;
  start: number; // Time in ticks
  duration: number; // Duration in ticks
}

export class MidiExporter {
  static convertTabToMidi(tab: TabDocument): MidiNote[] {
    const midiNotes: MidiNote[] = [];
    const ticksPerBeat = 480; // Standard MIDI ticks per beat
    
    // Standard guitar tuning MIDI notes (low to high)
    const stringMidiNotes = [40, 45, 50, 55, 59, 64]; // E A D G B E
    
    for (const section of tab.sections) {
      for (const measure of section.measures) {
        for (const note of measure.notes) {
          const midiNote = stringMidiNotes[5 - note.string] + note.fret; // Convert string index
          const startTime = note.position * ticksPerBeat * 4; // 4 beats per measure
          const duration = note.duration * ticksPerBeat;
          
          midiNotes.push({
            note: midiNote,
            velocity: note.velocity || 100,
            start: startTime,
            duration: duration,
          });
        }
      }
    }
    
    return midiNotes;
  }
}
