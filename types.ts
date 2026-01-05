
export interface ServiceRecord {
  id: string;
  date: string;
  description: string; // Ex: "Manhã", "Noite", "Especial"
  songs: string[];
}

export interface SongStats {
  song: string;
  count: number;
  lastDate: string | null;
  history: string[];
}

export interface AppData {
  history: ServiceRecord[];
  customSongs?: string[];
}
