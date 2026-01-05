
import React, { useMemo, useState } from 'react';
import { ServiceRecord } from '../types';

interface Props {
  fullSongList: string[];
  history: ServiceRecord[];
}

const UnplayedList: React.FC<Props> = ({ fullSongList, history }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const { mainUnplayed, ciasUnplayed } = useMemo(() => {
    // Pegar todos os nomes de louvores que já foram cantados
    const playedSongsSet = new Set<string>();
    history.forEach(record => {
      record.songs.forEach(song => playedSongsSet.add(song));
    });

    const main: string[] = [];
    const cias: string[] = [];

    fullSongList.forEach(song => {
      if (!playedSongsSet.has(song)) {
        const isSearchMatch = song.toLowerCase().includes(searchTerm.toLowerCase());
        if (isSearchMatch) {
          if (song.startsWith('(CIAS)')) {
            cias.push(song);
          } else {
            main.push(song);
          }
        }
      }
    });

    return { mainUnplayed: main, ciasUnplayed: cias };
  }, [fullSongList, history, searchTerm]);

  return (
    <div className="space-y-6 animate-fadeIn pb-10 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-1">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span className="material-icons text-indigo-600">assignment_late</span>
            Louvores Não Cantados
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">
            Exibindo hinos que nunca foram registrados no histórico
          </p>
        </div>
        
        <div className="relative w-full md:w-80">
          <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar hinos restantes..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none shadow-sm text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
        {/* Coluna Louvores Principais */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col h-[65vh] md:h-[75vh]">
          <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 rounded-t-[2rem]">
            <h3 className="font-black text-slate-700 uppercase tracking-widest text-[11px] flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
              Principais ({mainUnplayed.length})
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {mainUnplayed.length > 0 ? (
              <div className="space-y-2">
                {mainUnplayed.map((song, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-indigo-100 hover:bg-white transition-all group">
                    <span className="text-sm font-bold text-slate-600 group-hover:text-indigo-700">{song}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-10 text-center">
                <span className="material-icons text-4xl mb-2 opacity-20">check_circle</span>
                <p className="text-xs font-bold uppercase tracking-tighter">Nenhum hino encontrado</p>
              </div>
            )}
          </div>
        </div>

        {/* Coluna Louvores CIAS */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col h-[65vh] md:h-[75vh]">
          <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-indigo-50/30 rounded-t-[2rem]">
            <h3 className="font-black text-indigo-700 uppercase tracking-widest text-[11px] flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              CIAS ({ciasUnplayed.length})
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {ciasUnplayed.length > 0 ? (
              <div className="space-y-2">
                {ciasUnplayed.map((song, i) => (
                  <div key={i} className="p-4 bg-indigo-50/20 rounded-2xl border border-transparent hover:border-indigo-200 hover:bg-white transition-all group">
                    <span className="text-sm font-bold text-slate-600 group-hover:text-indigo-700">{song}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-10 text-center">
                <span className="material-icons text-4xl mb-2 opacity-20">check_circle</span>
                <p className="text-xs font-bold uppercase tracking-tighter">Nenhum hino (CIAS) encontrado</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnplayedList;
