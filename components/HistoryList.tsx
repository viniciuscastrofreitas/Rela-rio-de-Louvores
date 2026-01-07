import React, { useState, useMemo } from 'react';
import { ServiceRecord } from '../types';

interface Props {
  history: ServiceRecord[];
  onDelete: (id: string) => void;
  onEdit: (record: ServiceRecord) => void;
  onClearAll: () => void;
}

const HistoryList: React.FC<Props> = ({ history, onDelete, onEdit, onClearAll }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const filteredHistory = useMemo(() => {
    const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date));
    if (!searchTerm.trim()) return sorted;
    const search = searchTerm.toLowerCase();
    return sorted.filter(record => 
      record.date.includes(search) || 
      record.description?.toLowerCase().includes(search) ||
      record.songs.some(song => song.toLowerCase().includes(search))
    );
  }, [history, searchTerm]);

  // Agrupa meses disponíveis para o seletor
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    history.forEach(r => {
      const date = new Date(r.date + 'T12:00:00');
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.add(key);
    });
    return Array.from(months).sort().reverse();
  }, [history]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const getMonthName = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();
  };

  const formatWhatsAppMessage = (records: ServiceRecord[], title: string) => {
    let message = `*${title}*\n*ICM SANTO ANTÔNIO II*\n\n`;
    
    // Ordenar do mais antigo para o mais novo para leitura cronológica no relatório
    const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
    
    sorted.forEach((r) => {
      const dateFormatted = new Date(r.date + 'T12:00:00').toLocaleDateString('pt-BR');
      message += `📅 *${dateFormatted} (${r.description})*\n`;
      r.songs.forEach((song, i) => {
        message += `${i + 1}. ${song}\n`;
      });
      message += `\n`;
    });

    return message;
  };

  const shareIndividual = (record: ServiceRecord) => {
    const text = formatWhatsAppMessage([record], `RELATÓRIO DE CULTO`);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareAll = () => {
    if (history.length === 0) return;
    const text = formatWhatsAppMessage(history, `HISTÓRICO COMPLETO DE LOUVORES`);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareMonth = (monthKey: string) => {
    const filtered = history.filter(r => r.date.startsWith(monthKey));
    const title = `RELATÓRIO MENSAL - ${getMonthName(monthKey)}`;
    const text = formatWhatsAppMessage(filtered, title);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    setShowMonthPicker(false);
  };

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-[2.5rem] shadow-md p-10 text-center animate-fadeIn border border-slate-100">
        <span className="material-icons text-6xl text-slate-200 mb-4">history_toggle_off</span>
        <h2 className="text-2xl font-black text-slate-400">Histórico Vazio</h2>
        <p className="text-slate-400 mt-2 font-medium">Nenhum relatório salvo ainda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Cabeçalho com Ações de Compartilhamento */}
      <div className="flex justify-between items-center px-2">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <span className="material-icons text-indigo-600">history</span>
            Histórico
          </h2>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{history.length} Registros</span>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setShowMonthPicker(true)}
            className="w-12 h-12 bg-white border border-slate-200 rounded-2xl text-indigo-600 shadow-sm flex items-center justify-center active:scale-90 transition-all"
            title="Compartilhar Mês"
          >
            <span className="material-icons">calendar_month</span>
          </button>
          <button 
            onClick={shareAll}
            className="w-12 h-12 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100 flex items-center justify-center active:scale-90 transition-all"
            title="Compartilhar Tudo"
          >
            <span className="material-icons">auto_stories</span>
          </button>
        </div>
      </div>

      <div className="relative group">
        <span className="material-icons absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-all">search</span>
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar data, hino ou culto..."
          className="w-full pl-14 pr-4 py-5 bg-white border border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-indigo-50 outline-none shadow-sm font-semibold transition-all"
        />
      </div>

      <div className="grid gap-4">
        {filteredHistory.map((record) => (
          <div key={record.id} className="bg-white rounded-[2rem] shadow-sm overflow-hidden border border-slate-100 animate-fadeIn group">
            <div className="bg-slate-50/80 px-6 py-4 flex justify-between items-center border-b border-slate-100 group-hover:bg-indigo-50/30 transition-colors">
              <div className="flex flex-col">
                <span className="text-slate-800 font-black text-sm">{formatDate(record.date)}</span>
                <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-0.5">{record.description || 'Culto'}</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => onEdit(record)} 
                  className="w-10 h-10 text-amber-600 bg-white rounded-xl shadow-sm border border-amber-50 flex items-center justify-center hover:bg-amber-50 transition-all"
                  title="Editar"
                >
                  <span className="material-icons text-xl">edit</span>
                </button>
                <button 
                  onClick={() => shareIndividual(record)} 
                  className="w-10 h-10 text-emerald-600 bg-white rounded-xl shadow-sm border border-emerald-50 flex items-center justify-center hover:bg-emerald-50 transition-all"
                >
                  <span className="material-icons text-xl">share</span>
                </button>
                <button 
                  onClick={() => setItemToDelete(record.id)} 
                  className="w-10 h-10 text-rose-500 bg-white rounded-xl shadow-sm border border-rose-50 flex items-center justify-center hover:bg-rose-50 transition-all"
                >
                  <span className="material-icons text-xl">delete_outline</span>
                </button>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
              {record.songs.map((song, i) => (
                <div key={i} className="flex items-center gap-3 py-1.5 border-b border-slate-50 last:border-0 group/item">
                  <span className="text-[10px] font-black text-indigo-300 group-hover/item:text-indigo-500 transition-colors">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-slate-600 font-bold text-xs truncate">{song}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-6 text-center">
        <button 
          onClick={() => setShowClearAllConfirm(true)}
          className="text-rose-400 text-[10px] font-black uppercase tracking-[0.2em] px-6 py-3 rounded-full hover:bg-rose-50 transition"
        >
          Limpar Todo o Histórico
        </button>
      </div>

      {/* Modal Seletor de Mês */}
      {showMonthPicker && (
        <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center z-[200] p-6 backdrop-blur-sm" onClick={() => setShowMonthPicker(false)}>
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-sm overflow-hidden animate-scaleUp" onClick={e => e.stopPropagation()}>
            <div className="px-8 py-6 bg-indigo-950 text-white flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Compartilhar</span>
                <h3 className="text-xl font-black uppercase">Relatório Mensal</h3>
              </div>
              <button onClick={() => setShowMonthPicker(false)} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full">
                <span className="material-icons text-white">close</span>
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="grid gap-3">
                {availableMonths.map(monthKey => (
                  <button 
                    key={monthKey}
                    onClick={() => shareMonth(monthKey)}
                    className="w-full py-4 px-6 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between group hover:bg-indigo-50 hover:border-indigo-100 transition-all active:scale-95"
                  >
                    <span className="font-black text-slate-700 group-hover:text-indigo-900 uppercase text-xs tracking-tight">
                      {getMonthName(monthKey)}
                    </span>
                    <span className="material-icons text-indigo-300 group-hover:text-indigo-600">share</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <button 
                onClick={() => setShowMonthPicker(false)}
                className="w-full py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modals */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center z-[200] p-6 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm p-10 animate-scaleUp text-center">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <span className="material-icons text-4xl">delete_sweep</span>
            </div>
            <h3 className="text-xl font-black text-slate-800">Apagar Registro?</h3>
            <p className="text-slate-400 text-sm mt-2 mb-8 font-medium">Esta ação não poderá ser desfeita no banco de dados local.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => { onDelete(itemToDelete); setItemToDelete(null); }} className="w-full py-4 bg-rose-600 text-white font-black rounded-2xl shadow-lg active:scale-95 transition-all">SIM, APAGAR</button>
              <button onClick={() => setItemToDelete(null)} className="w-full py-3 text-slate-400 font-bold">CANCELAR</button>
            </div>
          </div>
        </div>
      )}

      {showClearAllConfirm && (
        <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center z-[200] p-6 backdrop-blur-sm">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-sm p-10 animate-scaleUp text-center border-t-[12px] border-rose-600">
            <span className="material-icons text-6xl text-rose-600 mb-4">report_problem</span>
            <h3 className="text-2xl font-black text-rose-600 uppercase">Perigo!</h3>
            <p className="text-slate-500 mt-4 font-bold text-sm leading-relaxed">Você está prestes a apagar <b>TODOS OS REGISTROS</b> do histórico. Deseja continuar?</p>
            <div className="mt-10 flex flex-col gap-3">
              <button onClick={() => { onClearAll(); setShowClearAllConfirm(false); }} className="w-full py-5 bg-rose-600 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all">APAGAR TUDO AGORA</button>
              <button onClick={() => setShowClearAllConfirm(false)} className="w-full py-3 text-slate-400 font-bold">CANCELAR</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryList;