
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ServiceRecord, SongStats, ServiceDraft } from '../types';

interface Props {
  onSave: (record: ServiceRecord) => void;
  songStats: Record<string, SongStats>;
  fullSongList: string[];
  onRegisterNewSong: (song: string) => void;
  draft: ServiceDraft;
  setDraft: React.Dispatch<React.SetStateAction<ServiceDraft>>;
}

const ServiceForm: React.FC<Props> = ({ 
  onSave, 
  songStats, 
  fullSongList, 
  onRegisterNewSong,
  draft,
  setDraft
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [infoModalData, setInfoModalData] = useState<{ song: string; type: 'history' | 'count' } | null>(null);
  const [pendingSong, setPendingSong] = useState<{name: string, diff: number, lastDate: string} | null>(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node) && 
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const suggestions = useMemo(() => {
    const search = inputValue.toLowerCase().trim();
    if (!search) return fullSongList.slice(0, 10);

    const priorityStartsWith: string[] = [];
    const ciasStartsWith: string[] = [];
    const priorityContains: string[] = [];
    const ciasContains: string[] = [];

    for (const s of fullSongList) {
      const lowerS = s.toLowerCase();
      const isCIAS = s.startsWith('(CIAS)');
      
      if (lowerS.startsWith(search)) {
        if (isCIAS) ciasStartsWith.push(s);
        else priorityStartsWith.push(s);
      } else if (lowerS.includes(search)) {
        if (isCIAS) ciasContains.push(s);
        else priorityContains.push(s);
      }
      
      if (priorityStartsWith.length + ciasStartsWith.length + priorityContains.length + ciasContains.length >= 40) break;
    }

    return [
      ...priorityStartsWith, 
      ...priorityContains, 
      ...ciasStartsWith, 
      ...ciasContains
    ].slice(0, 15);
  }, [inputValue, fullSongList]);

  const checkAndAddSong = (songName: string) => {
    const name = songName.trim();
    if (!name) return;

    if (!fullSongList.includes(name)) {
      onRegisterNewSong(name);
    }

    const stats = songStats[name];
    if (stats && stats.lastDate) {
      const lastDate = new Date(stats.lastDate + 'T12:00:00');
      const today = new Date();
      today.setHours(12, 0, 0, 0);
      const diffTime = Math.abs(today.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 30) {
        setPendingSong({ name, diff: diffDays, lastDate: stats.lastDate });
        setShowSuggestions(false);
        return;
      }
    }
    executeAdd(name);
  };

  const executeAdd = (name: string) => {
    setDraft(prev => ({
      ...prev,
      songs: [...prev.songs, name]
    }));
    setInputValue('');
    setShowSuggestions(false);
    setPendingSong(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const shareViaWhatsApp = () => {
    const dateFormatted = new Date(draft.date + 'T12:00:00').toLocaleDateString('pt-BR');
    let message = `*Relatório ICM Santo Antônio II - ${dateFormatted}*\n\n*Culto:* ${draft.description}\n\n*Louvores:* \n`;
    draft.songs.forEach((song, i) => {
      message += `${i + 1}. ${song}\n`;
    });
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleFinalSave = () => {
    onSave({ 
      id: crypto.randomUUID(), 
      date: draft.date, 
      description: draft.description, 
      songs: draft.songs 
    });
    setShowSaveConfirm(false);
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-6 md:p-10 animate-fadeIn border border-slate-100">
      <div className="flex flex-col gap-8">
        
        {/* Sessão de Dados do Culto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/80 p-6 rounded-[2rem] border border-slate-100">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block px-1">Data do Culto</label>
            <div className="relative">
              <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400">event</span>
              <input 
                type="date" 
                value={draft.date} 
                onChange={(e) => setDraft(prev => ({ ...prev, date: e.target.value }))} 
                className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 focus:ring-4 focus:ring-indigo-50 outline-none font-bold text-slate-700 shadow-sm transition-all"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block px-1">Período / Culto</label>
            <div className="flex bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm">
              {['Manhã', 'Noite', 'Especial'].map(p => (
                <button 
                  key={p} 
                  onClick={() => setDraft(prev => ({ ...prev, description: p }))} 
                  className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${draft.description === p ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Busca de Louvores */}
        <div className="relative">
          <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3 block px-1">Buscar Louvor na Lista</label>
          <div className="flex gap-3">
            <div className="relative flex-1 group">
              <span className="material-icons absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-all">search</span>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onKeyDown={(e) => e.key === 'Enter' && (suggestions.length > 0 ? checkAndAddSong(suggestions[0]) : checkAndAddSong(inputValue))}
                onChange={(e) => { setInputValue(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full pl-14 pr-4 py-5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-semibold shadow-inner"
                placeholder="Comece a digitar o louvor..."
              />
              {showSuggestions && suggestions.length > 0 && (
                <div ref={suggestionRef} className="absolute z-[110] w-full mt-3 bg-white border border-slate-200 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden animate-scaleUp max-h-80 overflow-y-auto custom-scrollbar">
                  {suggestions.map((s, idx) => (
                    <div
                      key={idx}
                      onMouseDown={(e) => { e.preventDefault(); checkAndAddSong(s); }}
                      className="px-6 py-4 hover:bg-indigo-50 transition border-b border-slate-50 last:border-0 cursor-pointer flex justify-between items-center group"
                    >
                      <span className="text-slate-700 group-hover:text-indigo-700 font-bold text-sm">{s}</span>
                      <span className="material-icons text-slate-300 group-hover:text-indigo-400 text-lg">add_circle</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button 
              onClick={() => checkAndAddSong(inputValue)} 
              className="bg-indigo-600 text-white rounded-[1.5rem] px-6 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-90"
            >
              <span className="material-icons">add</span>
            </button>
          </div>
        </div>

        {/* Lista Selecionada */}
        <div className="space-y-5">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-extrabold text-slate-800 flex items-center gap-3">
              <span className="bg-indigo-600 text-white w-7 h-7 rounded-xl flex items-center justify-center text-[10px] shadow-lg shadow-indigo-100">{draft.songs.length}</span>
              Louvores para o Culto
            </h3>
            {draft.songs.length > 0 && (
              <button onClick={shareViaWhatsApp} className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 px-3 py-1.5 rounded-full transition-all">
                <span className="material-icons text-sm">share</span> WhatsApp
              </button>
            )}
          </div>

          {draft.songs.length === 0 ? (
            <div className="text-center py-16 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-slate-400 flex flex-col items-center">
              <span className="material-icons text-5xl mb-3 opacity-10">library_music</span>
              <p className="font-bold text-sm tracking-tight">Lista vazia. Adicione os louvores acima.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
              {draft.songs.map((song, index) => (
                <div key={index} className="song-card flex flex-col bg-white p-5 rounded-[1.5rem] border border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50 transition-all animate-fadeIn group">
                  <div className="flex items-start gap-4 w-full mb-4">
                    <div className="w-8 h-8 shrink-0 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-black text-indigo-400 border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all mt-0.5">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <span className="font-extrabold text-slate-700 text-sm flex-1 leading-snug pt-1">{song}</span>
                  </div>
                  
                  {/* Container de Ações Centralizado */}
                  <div className="grid grid-cols-3 gap-1 border-t border-slate-50 pt-3">
                    <button 
                      onClick={() => setInfoModalData({ song, type: 'history' })} 
                      className="flex flex-col items-center justify-center gap-1 py-1 text-slate-400 hover:text-indigo-600 transition-all group/btn"
                    >
                      <span className="material-icons text-lg">event_available</span>
                      <span className="text-[8px] font-black uppercase tracking-tighter">Histórico</span>
                    </button>
                    <button 
                      onClick={() => setInfoModalData({ song, type: 'count' })} 
                      className="flex flex-col items-center justify-center gap-1 py-1 text-slate-400 hover:text-emerald-600 transition-all group/btn"
                    >
                      <span className="material-icons text-lg">bar_chart</span>
                      <span className="text-[8px] font-black uppercase tracking-tighter">Frequência</span>
                    </button>
                    <button 
                      onClick={() => setDraft(prev => ({ ...prev, songs: prev.songs.filter((_, i) => i !== index) }))} 
                      className="flex flex-col items-center justify-center gap-1 py-1 text-slate-300 hover:text-rose-600 transition-all group/btn"
                    >
                      <span className="material-icons text-lg">delete_outline</span>
                      <span className="text-[8px] font-black uppercase tracking-tighter">Remover</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => setShowSaveConfirm(true)}
          disabled={draft.songs.length === 0}
          className={`w-full py-6 rounded-[2rem] font-black text-lg tracking-widest shadow-2xl transition-all transform active:scale-[0.97] flex items-center justify-center gap-4 ${draft.songs.length > 0 ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}`}
        >
          <span className="material-icons text-2xl">save</span>
          SALVAR RELATÓRIO DO CULTO
        </button>
      </div>

      {/* Save Confirmation Modal */}
      {showSaveConfirm && (
        <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center z-[200] p-6 backdrop-blur-sm">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-sm p-10 animate-scaleUp text-center">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-icons text-4xl">playlist_add_check</span>
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">Finalizar Registro?</h3>
            <p className="text-slate-500 text-sm mb-6">Confirme a data para salvar este culto:</p>
            
            <div className="mb-8">
              <input 
                type="date" 
                value={draft.date} 
                onChange={(e) => setDraft(prev => ({ ...prev, date: e.target.value }))} 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 focus:ring-4 focus:ring-indigo-50 outline-none font-bold text-center text-indigo-700 shadow-inner"
              />
            </div>

            <div className="flex flex-col gap-3">
              <button onClick={handleFinalSave} className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100">CONFIRMAR E SALVAR</button>
              <button onClick={() => setShowSaveConfirm(false)} className="w-full py-3 text-slate-400 font-bold">CANCELAR</button>
            </div>
          </div>
        </div>
      )}

      {/* Warning Modal (Hino recente) */}
      {pendingSong && (
        <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center z-[200] p-6 backdrop-blur-sm">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-sm p-10 border-t-[12px] border-amber-400 animate-scaleUp text-center">
            <div className="w-24 h-24 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <span className="material-icons text-5xl">warning</span>
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">Louvor Recente</h3>
            <p className="text-slate-500 text-sm mb-6">Este hino foi cantado há pouco tempo:</p>
            <div className="bg-slate-50 p-6 rounded-[2rem] mb-8 border border-slate-100">
              <p className="text-indigo-700 font-extrabold text-lg mb-2">{pendingSong.name}</p>
              <div className="flex items-center justify-center gap-2 text-slate-400">
                 <span className="material-icons text-sm">history</span>
                 <span className="text-[10px] font-black uppercase tracking-widest">HÁ {pendingSong.diff} DIAS ({formatDate(pendingSong.lastDate)})</span>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <button onClick={() => executeAdd(pendingSong.name)} className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all">ADICIONAR ASSIM MESMO</button>
              <button onClick={() => setPendingSong(null)} className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-all">NÃO ADICIONAR</button>
            </div>
          </div>
        </div>
      )}

      {/* Info Modal */}
      {infoModalData && (
        <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center z-[200] p-6 backdrop-blur-sm" onClick={() => setInfoModalData(null)}>
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md p-10 animate-scaleUp" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-8">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] px-1 block">Detalhes do Louvor</span>
                <h3 className="text-xl font-extrabold text-slate-800 leading-tight pr-4">{infoModalData.song}</h3>
              </div>
              <button onClick={() => setInfoModalData(null)} className="bg-slate-100 text-slate-400 w-12 h-12 rounded-full flex items-center justify-center hover:bg-slate-200 transition-all"><span className="material-icons">close</span></button>
            </div>
            
            <div className="py-8 border-y border-slate-100 mb-8">
              {infoModalData.type === 'history' ? (
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Datas que já foi cantado:</p>
                  <div className="max-h-60 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {songStats[infoModalData.song]?.history.length > 0 ? (
                      songStats[infoModalData.song].history.map((d, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <span className="text-slate-700 font-black text-sm">{formatDate(d)}</span>
                          <span className="material-icons text-emerald-500 text-sm">check</span>
                        </div>
                      ))
                    ) : <p className="text-slate-400 italic text-center py-4">Sem registros anteriores.</p>}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="bg-indigo-50 w-32 h-32 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-inner transform rotate-6">
                    <span className="text-6xl font-black text-indigo-600">{songStats[infoModalData.song]?.count || 0}</span>
                  </div>
                  <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Total de registros</p>
                </div>
              )}
            </div>
            
            <button onClick={() => setInfoModalData(null)} className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl shadow-xl">FECHAR</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceForm;
