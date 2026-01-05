
import React, { useRef } from 'react';
import { ServiceRecord } from '../types';

interface Props {
  history: ServiceRecord[];
  customSongs: string[];
  onRestore: (history: ServiceRecord[], customSongs: string[]) => void;
}

const BackupRestore: React.FC<Props> = ({ history, customSongs, onRestore }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackup = () => {
    if (history.length === 0 && customSongs.length === 0) {
      alert("Não há dados para exportar.");
      return;
    }
    const dataStr = JSON.stringify({ history, customSongs }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_igreja_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json && Array.isArray(json.history)) {
          if (window.confirm("Isso substituirá seus dados atuais. Continuar?")) {
            onRestore(json.history, json.customSongs || []);
          }
        } else {
          alert("Arquivo inválido.");
        }
      } catch (err) {
        alert("Erro ao ler o arquivo.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-2">
        <span className="material-icons text-indigo-600">settings</span>
        Opções e Segurança
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button onClick={handleBackup} className="flex flex-col items-center justify-center p-6 border-2 border-indigo-100 rounded-2xl hover:bg-indigo-50 transition group">
          <span className="material-icons text-4xl text-indigo-600 mb-2 group-hover:scale-110 transition">download</span>
          <span className="font-bold text-indigo-800 text-sm">Fazer Backup</span>
          <span className="text-[10px] text-gray-400 mt-1 uppercase font-black">Salvar no Celular</span>
        </button>

        <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center p-6 border-2 border-green-100 rounded-2xl hover:bg-green-50 transition group">
          <span className="material-icons text-4xl text-green-600 mb-2 group-hover:scale-110 transition">upload</span>
          <span className="font-bold text-green-800 text-sm">Restaurar Dados</span>
          <span className="text-[10px] text-gray-400 mt-1 uppercase font-black">Abrir Arquivo</span>
        </button>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
      </div>

      <div className="mt-8 bg-gray-50 p-6 rounded-2xl border border-gray-100">
        <h4 className="text-xs font-black text-gray-400 uppercase mb-4 tracking-widest">Estado do Sistema</h4>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Cultos no Histórico</span>
            <span className="bg-white px-3 py-1 rounded-full text-indigo-600 font-black text-xs border border-indigo-100">{history.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Hinos Personalizados</span>
            <span className="bg-white px-3 py-1 rounded-full text-indigo-600 font-black text-xs border border-indigo-100">{customSongs.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Armazenamento</span>
            <span className="flex items-center gap-1 text-green-600 font-black text-xs uppercase">
              <span className="material-icons text-xs">verified_user</span> Local Ativo
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupRestore;
