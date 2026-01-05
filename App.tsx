
import React, { useState, useEffect, useMemo } from 'react';
import { INITIAL_PRAISE_LIST, STORAGE_KEY } from './constants';
import { ServiceRecord, AppData, SongStats } from './types';
import ServiceForm from './components/ServiceForm';
import HistoryList from './components/HistoryList';
import RankingList from './components/RankingList';
import BackupRestore from './components/BackupRestore';
import UnplayedList from './components/UnplayedList';
import { initDB, saveData, loadData } from './db';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'new' | 'history' | 'unplayed' | 'settings'>('new');
  const [history, setHistory] = useState<ServiceRecord[]>([]);
  const [customSongs, setCustomSongs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const setup = async () => {
      try {
        await initDB();
        const data = await loadData();
        if (data) {
          if (data.history) setHistory(data.history);
          if (data.customSongs) setCustomSongs(data.customSongs);
        }
      } catch (e) {
        console.error("Erro ao carregar banco de dados local", e);
      } finally {
        setIsLoading(false);
      }
    };
    setup();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!isLoading) {
      saveData({ history, customSongs });
    }
  }, [history, customSongs, isLoading]);

  const fullSongList = useMemo(() => {
    const combined = [...new Set([...INITIAL_PRAISE_LIST, ...customSongs])];
    return combined.sort((a, b) => {
      const aIsCIAS = a.startsWith('(CIAS)');
      const bIsCIAS = b.startsWith('(CIAS)');
      if (aIsCIAS && !bIsCIAS) return 1;
      if (!aIsCIAS && bIsCIAS) return -1;
      return a.localeCompare(b);
    });
  }, [customSongs]);

  const addServiceRecord = (record: ServiceRecord) => {
    setHistory(prev => [record, ...prev]);
    setActiveTab('history');
  };

  const deleteServiceRecord = (id: string) => {
    setHistory(prev => prev.filter(r => r.id !== id));
  };

  const registerNewSong = (songName: string) => {
    if (!fullSongList.includes(songName)) {
      setCustomSongs(prev => [...prev, songName]);
    }
  };

  const restoreData = (newHistory: ServiceRecord[], newCustomSongs?: string[]) => {
    setHistory(newHistory);
    if (newCustomSongs) setCustomSongs(newCustomSongs);
  };

  const songStats = useMemo(() => {
    const stats: Record<string, SongStats> = {};
    const sortedHistory = [...history].sort((a, b) => b.date.localeCompare(a.date));

    sortedHistory.forEach(record => {
      record.songs.forEach(song => {
        if (!stats[song]) {
          stats[song] = { song, count: 0, lastDate: null, history: [] };
        }
        stats[song].count += 1;
        stats[song].history.push(record.date);
      });
    });

    Object.keys(stats).forEach(song => {
      stats[song].history.sort((a, b) => b.localeCompare(a));
      stats[song].lastDate = stats[song].history[0] || null;
    });

    return stats;
  }, [history]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-indigo-600 flex items-center justify-center p-6 text-center">
        <div className="text-white space-y-4">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-white/20 border-t-white mx-auto"></div>
          <p className="font-bold text-lg tracking-wide uppercase">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 md:pb-0">
      {/* Offline Alert */}
      {isOffline && (
        <div className="bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.2em] py-1.5 text-center flex items-center justify-center gap-2 animate-pulse z-[200]">
          <span className="material-icons text-sm">cloud_off</span>
          Modo Offline Ativado - Dados salvos localmente
        </div>
      )}

      {/* Header */}
      <header className="glass-effect sticky top-0 z-[100] border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-2.5 rounded-2xl shadow-lg shadow-indigo-200 transform rotate-3">
              <span className="material-icons text-white text-2xl">library_music</span>
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 leading-tight">ICM Santo Antônio II</h1>
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-indigo-500 block">Gestão de Louvores</span>
            </div>
          </div>
          
          <nav className="hidden lg:flex bg-slate-100 p-1 rounded-2xl gap-1">
            <button onClick={() => setActiveTab('new')} className={`px-5 py-2.5 rounded-xl text-sm font-bold tab-transition ${activeTab === 'new' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Novo Culto</button>
            <button onClick={() => setActiveTab('history')} className={`px-5 py-2.5 rounded-xl text-sm font-bold tab-transition ${activeTab === 'history' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Histórico</button>
            <button onClick={() => setActiveTab('unplayed')} className={`px-5 py-2.5 rounded-xl text-sm font-bold tab-transition ${activeTab === 'unplayed' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Não Cantados</button>
            <button onClick={() => setActiveTab('settings')} className={`px-5 py-2.5 rounded-xl text-sm font-bold tab-transition ${activeTab === 'settings' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Backup</button>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8">
        <div className="animate-fadeIn">
          {activeTab === 'new' && (
            <div className="max-w-4xl mx-auto space-y-8">
              <ServiceForm 
                onSave={addServiceRecord} 
                songStats={songStats}
                fullSongList={fullSongList}
                onRegisterNewSong={registerNewSong}
              />
              <div className="pt-4">
                <RankingList songStats={songStats} />
              </div>
            </div>
          )}
          
          {activeTab === 'history' && (
            <div className="max-w-4xl mx-auto">
              <HistoryList 
                history={history} 
                onDelete={deleteServiceRecord}
                onClearAll={() => setHistory([])}
              />
            </div>
          )}

          {activeTab === 'unplayed' && (
            <UnplayedList 
              fullSongList={fullSongList}
              history={history}
            />
          )}

          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto">
              <BackupRestore 
                history={history}
                customSongs={customSongs}
                onRestore={restoreData} 
              />
            </div>
          )}
        </div>
      </main>

      {/* Mobile Tab Bar */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] glass-effect border border-slate-200/50 flex justify-around p-3 z-[100] shadow-2xl rounded-3xl">
        <button onClick={() => setActiveTab('new')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'new' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
          <span className="material-icons">{activeTab === 'new' ? 'add_circle' : 'add_circle_outline'}</span>
          <span className="text-[10px] font-black uppercase tracking-tighter">Novo</span>
        </button>
        <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'history' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
          <span className="material-icons">history</span>
          <span className="text-[10px] font-black uppercase tracking-tighter">Histórico</span>
        </button>
        <button onClick={() => setActiveTab('unplayed')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'unplayed' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
          <span className="material-icons">assignment_late</span>
          <span className="text-[10px] font-black uppercase tracking-tighter">Restantes</span>
        </button>
        <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'settings' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
          <span className="material-icons">cloud_download</span>
          <span className="text-[10px] font-black uppercase tracking-tighter">Dados</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
