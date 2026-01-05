
import React, { useMemo, useState } from 'react';
import { ServiceRecord } from '../types';

interface Props {
  fullSongList: string[];
  history: ServiceRecord[];
}

interface GroupDefinition {
  name: string;
  min: number;
  max: number;
}

const CATEGORIES: GroupDefinition[] = [
  { name: "CLAMOR", min: 0, max: 56 },
  { name: "INVOCAÇÃO E COMUNHÃO", min: 57, max: 96 },
  { name: "DEDICAÇÃO", min: 97, max: 200 },
  { name: "MORTE, RESSURREIÇÃO E SALVAÇÃO", min: 201, max: 294 },
  { name: "CONSOLO E ENCORAJAMENTO", min: 295, max: 385 },
  { name: "SANTIFICAÇÃO E DERRAMAMENTO DO E.S.", min: 386, max: 477 },
  { name: "VOLTA DE JESUS E ETERNIDADE", min: 478, max: 571 },
  { name: "LOUVOR", min: 572, max: 649 },
  { name: "SALMOS DE LOUVOR", min: 650, max: 665 },
  { name: "GRUPO DE LOUVOR", min: 666, max: 730 },
  { name: "CORINHOS", min: 731, max: 794 },
];

const UnplayedList: React.FC<Props> = ({ fullSongList, history }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isPrincipaisExpanded, setIsPrincipaisExpanded] = useState(true);
  const [isCiasExpanded, setIsCiasExpanded] = useState(true);
  const [expandedSubCats, setExpandedSubCats] = useState<Record<string, boolean>>(
    CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat.name]: true }), {})
  );

  const extractNumber = (song: string): number | null => {
    const match = song.match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  };

  const toggleSubCat = (name: string) => {
    setExpandedSubCats(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const { groupedMain, ciasUnplayed } = useMemo(() => {
    const playedSongsSet = new Set<string>();
    history.forEach(record => {
      record.songs.forEach(song => playedSongsSet.add(song));
    });

    const cias: string[] = [];
    const mainGroups: Record<string, string[]> = {};
    CATEGORIES.forEach(cat => mainGroups[cat.name] = []);
    const extraMain: string[] = []; // Para hinos numerados fora dos intervalos ou sem número

    fullSongList.forEach(song => {
      if (!playedSongsSet.has(song)) {
        const isSearchMatch = song.toLowerCase().includes(searchTerm.toLowerCase());
        if (isSearchMatch) {
          if (song.startsWith('(CIAS)')) {
            cias.push(song);
          } else {
            const num = extractNumber(song);
            let added = false;
            if (num !== null) {
              for (const cat of CATEGORIES) {
                if (num >= cat.min && num <= cat.max) {
                  mainGroups[cat.name].push(song);
                  added = true;
                  break;
                }
              }
            }
            if (!added) extraMain.push(song);
          }
        }
      }
    });

    return { groupedMain: mainGroups, ciasUnplayed: cias, extraMain };
  }, [fullSongList, history, searchTerm]);

  const totalMainUnplayed = Object.values(groupedMain).reduce((acc, curr) => acc + curr.length, 0);

  return (
    <div className="space-y-6 animate-fadeIn pb-10 flex flex-col h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-1">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span className="material-icons text-indigo-600">assignment_late</span>
            Louvores Restantes
          </h2>
          <p className="text-[10px] text-slate-500 font-black mt-1 uppercase tracking-[0.15em]">
            Hinos que ainda não constam no histórico
          </p>
        </div>
        
        <div className="relative w-full md:w-80">
          <span className="material-icons absolute left-4 top-1/2 -translate-y-1-2 text-slate-400 text-sm">search</span>
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar por nome ou número..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none shadow-sm text-sm font-semibold"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* Coluna Principais */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col">
          <button 
            onClick={() => setIsPrincipaisExpanded(!isPrincipaisExpanded)}
            className="w-full p-6 flex justify-between items-center bg-slate-50/50 hover:bg-slate-100/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className={`material-icons text-indigo-500 transition-transform duration-300 ${isPrincipaisExpanded ? '' : '-rotate-90'}`}>
                keyboard_arrow_down
              </span>
              <h3 className="font-black text-slate-700 uppercase tracking-widest text-xs flex items-center gap-2">
                Principais
                <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full text-[10px]">{totalMainUnplayed}</span>
              </h3>
            </div>
          </button>

          {isPrincipaisExpanded && (
            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar bg-white">
              {CATEGORIES.map(cat => (
                <div key={cat.name} className="border border-slate-100 rounded-[1.5rem] overflow-hidden">
                  <button 
                    onClick={() => toggleSubCat(cat.name)}
                    className="w-full px-5 py-3.5 flex justify-between items-center bg-slate-50/30 hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-[10px] font-black text-slate-500 tracking-wider text-left pr-4">
                      {cat.name} ({groupedMain[cat.name].length})
                    </span>
                    <span className="material-icons text-slate-300 text-sm">
                      {expandedSubCats[cat.name] ? 'remove' : 'add'}
                    </span>
                  </button>
                  
                  {expandedSubCats[cat.name] && (
                    <div className="p-3 grid gap-2">
                      {groupedMain[cat.name].length > 0 ? (
                        groupedMain[cat.name].map((song, i) => (
                          <div key={i} className="p-3 bg-slate-50/50 rounded-xl text-xs font-bold text-slate-600 border border-transparent hover:border-indigo-100 hover:bg-white transition-all">
                            {song}
                          </div>
                        ))
                      ) : (
                        <p className="text-[10px] text-slate-300 italic text-center py-2 uppercase font-bold">Todos cantados!</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Coluna CIAS */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col">
          <button 
            onClick={() => setIsCiasExpanded(!isCiasExpanded)}
            className="w-full p-6 flex justify-between items-center bg-indigo-50/30 hover:bg-indigo-100/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className={`material-icons text-indigo-500 transition-transform duration-300 ${isCiasExpanded ? '' : '-rotate-90'}`}>
                keyboard_arrow_down
              </span>
              <h3 className="font-black text-indigo-700 uppercase tracking-widest text-xs flex items-center gap-2">
                CIAS
                <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-[10px]">{ciasUnplayed.length}</span>
              </h3>
            </div>
          </button>

          {isCiasExpanded && (
            <div className="p-4 max-h-[70vh] overflow-y-auto custom-scrollbar space-y-2 bg-white">
              {ciasUnplayed.length > 0 ? (
                ciasUnplayed.map((song, i) => (
                  <div key={i} className="p-4 bg-indigo-50/20 rounded-2xl border border-transparent hover:border-indigo-200 hover:bg-white transition-all group">
                    <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-700">{song}</span>
                  </div>
                ))
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-slate-300">
                  <span className="material-icons text-4xl mb-2 opacity-20">check_circle</span>
                  <p className="text-[10px] font-black uppercase">Nenhum hino CIAS restante</p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default UnplayedList;
