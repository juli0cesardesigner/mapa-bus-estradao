'use client';

import React from 'react';
import { Upload, X, Loader2, Plus, MapPin } from 'lucide-react';
import { parseCSV, generateLocationColors, type PassengerData } from '@/utils/csv-parser';

interface ImportFormProps {
  onImport: (title: string, data: any[], boardingLocations: string[], capacity: number) => Promise<void>;
}

export const ImportForm: React.FC<ImportFormProps> = ({ onImport }) => {
  const [title, setTitle] = React.useState('');
  const [file, setFile] = React.useState<File | null>(null);
  const [capacity, setCapacity] = React.useState(46);
  const [locationInput, setLocationInput] = React.useState('');
  const [boardingLocations, setBoardingLocations] = React.useState<string[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAddLocation = () => {
    if (locationInput.trim()) {
      const loc = locationInput.trim().toUpperCase();
      if (!boardingLocations.includes(loc)) {
        setBoardingLocations([...boardingLocations, loc]);
      }
      setLocationInput('');
    }
  };

  const removeLocation = (loc: string) => {
    setBoardingLocations(boardingLocations.filter(l => l !== loc));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
      } else {
        alert('Por favor, selecione apenas arquivos .csv');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    if (boardingLocations.length === 0) {
      alert('Por favor, adicione pelo menos um local de embarque.');
      return;
    }

    setIsUploading(true);
    try {
      let processedData: any[] = [];
      
      if (file) {
        const rawData = await parseCSV(file);
        if (rawData && rawData.length > 0) {
          const locations = rawData.map(p => p.localidade);
          // Adicionar locais do CSV aos locais de embarque se não existirem
          const allLocations = Array.from(new Set([...boardingLocations, ...locations.map(l => l.toUpperCase())]));
          const colors = generateLocationColors(allLocations);

          processedData = rawData.map(p => ({
            ...p,
            cor_hex: colors[p.localidade.toUpperCase()] || '#3B82F6',
            embarcado: false
          }));
          
          // Atualizar locais se necessário
          setBoardingLocations(allLocations);
        }
      }

      await onImport(title, processedData, boardingLocations, capacity);
      setTitle('');
      setFile(null);
      setBoardingLocations([]);
      setCapacity(46);
    } catch (error: any) {
      console.error('Erro ao criar viagem:', error);
      alert(error.message || 'Erro ao processar a viagem. Verifique os dados.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900 p-8 rounded-3xl border border-zinc-800 shadow-2xl">
      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-2">Título da Viagem</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Excursão Lapinha - Grupo A"
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">Capacidade (Assentos)</label>
          <input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(parseInt(e.target.value))}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            min="1"
            max="100"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-2">Locais de Embarque (Zero Dúvidas)</label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLocation())}
            placeholder="Adicionar local..."
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
          />
          <button
            type="button"
            onClick={handleAddLocation}
            className="bg-blue-600 p-2 rounded-xl hover:bg-blue-500 transition-all"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {boardingLocations.map((loc) => (
            <span key={loc} className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 px-3 py-1.5 rounded-lg text-xs font-bold animate-in fade-in zoom-in duration-300">
              <MapPin className="w-3 h-3" />
              {loc}
              <button type="button" onClick={() => removeLocation(loc)} className="hover:text-white ml-1">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {boardingLocations.length === 0 && (
            <p className="text-xs text-zinc-600 italic">Nenhum local adicionado ainda.</p>
          )}
        </div>
      </div>

      <div className="relative group">
        <label className="block text-sm font-medium text-zinc-400 mb-2">Importar Lista Pronta (Opcional - CSV)</label>
        <div 
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-zinc-800 border-dashed rounded-2xl group-hover:border-zinc-700 transition-colors cursor-pointer"
        >
          <div className="space-y-1 text-center">
            <Upload className="mx-auto h-8 w-8 text-zinc-500 group-hover:text-zinc-400 transition-colors" />
            <div className="flex text-xs text-zinc-400 justify-center">
              <label className="relative cursor-pointer rounded-md font-medium text-blue-500 hover:text-blue-400">
                <span>Upload CSV</span>
                <input type="file" className="sr-only" accept=".csv" onChange={handleFileChange} />
              </label>
              <p className="pl-1 text-zinc-500">ou arraste e solte</p>
            </div>
          </div>
        </div>
        {file && (
          <div className="mt-4 flex items-center justify-between bg-zinc-950 p-3 rounded-xl border border-zinc-800">
            <span className="text-sm text-zinc-300 truncate max-w-[200px]">{file.name}</span>
            <button type="button" onClick={() => setFile(null)} className="text-zinc-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={!title || isUploading}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl py-4 font-bold hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:hover:shadow-none transition-all flex items-center justify-center gap-2"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Criando Viagem...
          </>
        ) : (
          'Criar Controle de Embarque'
        )}
      </button>
    </form>
  );
};
