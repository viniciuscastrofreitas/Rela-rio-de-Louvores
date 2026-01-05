
import React, { useState, useMemo } from 'react';
import { ServiceRecord } from '../types';

interface Props {
  history: ServiceRecord[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

const HistoryList: React.FC<Props> = ({ history, onDelete, onClearAll }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);

  const filteredHistory = useMemo(() => {
    // Ordenamos por data decrescente (mais recente primeiro)
    // Usamos localeCompare porque o formato YYYY-MM-DD é perfeitamente ordenável dessa forma
    const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date));
    
    if (!searchTerm.trim()) return sorted;
    const search = searchTerm.toLowerCase();
    return sorted.filter(record => 
      record.date.includes(search) || 
      record.description?.toLowerCase().includes(search) ||
      record.songs.some(song => song.toLowerCase().includes(search))
    );
  }, [history, searchTerm]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const shareRecord = (record: ServiceRecord) => {
    const dateFormatted = new Date(record.date + 'T12:00:00').toLocaleDateString('pt-BR');
    let message = `*Relatório de Culto (${record.description}) - ${dateFormatted}*\n\n*Hinos:*\n`;
    record.songs.forEach((song, i) => message += `${i + 1}. ${song}\n`);
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-10 text-center animate-fadeIn">
        <span className="material-icons text-6xl text-gray-300 mb-4">history_toggle_off</span>
        <h2 className="text-2xl font-semibold text-gray-700">Histórico Vazio</h2>
        <p className="text-gray-500 mt-2">Os cultos salvos aparecerão aqui.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span className="material-icons text-indigo-600">history</span>
          Histórico
        </h2>
        <button 
          onClick={() => setShowClearAllConfirm(true)}
          className="text-red-500 text-xs font-black uppercase hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
        >
          Limpar Tudo
        </button>
      </div>

      <div className="relative">
        <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar data, louvor ou período..."
          className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
        />
      </div>

      <div className="grid gap-4">
        {filteredHistory.map((record) => (
          <div key={record.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 animate-fadeIn">
            <div className="bg-indigo-50 px-5 py-3 flex justify-between items-center border-b border-indigo-100">
              <div className="flex flex-col">
                <span className="text-indigo-900 font-bold">{formatDate(record.date)}</span>
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{record.description || 'Culto'}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => shareRecord(record)} className="p-2 text-green-600 bg-white rounded-lg shadow-sm border border-green-100" title="Compartilhar">
                  <span className="material-icons text-xl">share</span>
                </button>
                <button onClick={() => setItemToDelete(record.id)} className="p-2 text-red-500 bg-white rounded-lg shadow-sm border border-red-100" title="Excluir">
                  <span className="material-icons text-xl">delete</span>
                </button>
              </div>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
              {record.songs.map((song, i) => (
                <div key={i} className="flex items-center gap-2 py-1 text-sm border-b border-gray-50 last:border-0">
                  <span className="text-indigo-300 font-black">{i + 1}</span>
                  <span className="text-gray-700 truncate">{song}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modals */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[150] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-scaleUp text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-icons text-4xl">delete</span>
            </div>
            <h3 className="text-xl font-bold">Apagar Registro?</h3>
            <p className="text-gray-500 mt-2 mb-6">Esta ação removerá este culto do histórico permanentemente.</p>
            <div className="flex gap-3">
              <button onClick={() => setItemToDelete(null)} className="flex-1 py-3 bg-gray-100 font-bold rounded-xl">Não</button>
              <button onClick={() => { onDelete(itemToDelete); setItemToDelete(null); }} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg">Sim, Apagar</button>
            </div>
          </div>
        </div>
      )}

      {showClearAllConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[150] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-scaleUp text-center border-t-8 border-red-600">
            <span className="material-icons text-6xl text-red-600 mb-2">warning</span>
            <h3 className="text-2xl font-black text-red-600 uppercase">Apagar Tudo?</h3>
            <p className="text-gray-600 mt-3 font-medium">Isso removerá <b>TODO</b> o seu histórico.</p>
            <div className="mt-8 flex flex-col gap-3">
              <button onClick={() => { onClearAll(); setShowClearAllConfirm(false); }} className="w-full py-4 bg-red-600 text-white font-black rounded-xl">APAGAR TUDO AGORA</button>
              <button onClick={() => setShowClearAllConfirm(false)} className="w-full py-3 bg-gray-100 font-bold rounded-xl">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryList;
