'use client';

import React from 'react';
import { Upload, X, Loader2, Plus, MapPin } from 'lucide-react';
import { parseCSV, parseRawText, generateLocationColors, type PassengerData } from '@/utils/csv-parser';

interface ImportFormProps {
  onImport: (title: string, data: any[], boardingLocations: string[], capacity: number, tem_dois_andares: boolean) => Promise<void>;
}

export const ImportForm: React.FC<ImportFormProps> = ({ onImport }) => {
  const [title, setTitle] = React.useState('');
  const [file, setFile] = React.useState<File | null>(null);
  const [capacity, setCapacity] = React.useState(46);
  const [locationInput, setLocationInput] = React.useState('');
  const [boardingLocations, setBoardingLocations] = React.useState<string[]>([]);
  const [hasTwoFloors, setHasTwoFloors] = React.useState(true);
  const [isUploading, setIsUploading] = React.useState(false);
  const [rawText, setRawText] = React.useState('');

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
      if (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.txt')) {
        setFile(droppedFile);
      } else {
        alert('Por favor, selecione apenas arquivos .csv ou .txt');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    setIsUploading(true);
    try {
      let processedData: any[] = [];
      let currentBoardingLocations: string[] = [];
      
      if (file) {
        if (file.name.endsWith('.csv')) {
          processedData = await parseCSV(file);
        } else {
          const text = await file.text();
          processedData = parseRawText(text);
        }
      } else if (rawText.trim()) {
        processedData = parseRawText(rawText);
      }

      if (processedData.length > 0) {
        const locations = processedData.map(p => p.localidade);
        const allLocations = Array.from(new Set([...boardingLocations, ...locations.map(l => l.toUpperCase().trim())]));
        const colors = generateLocationColors(allLocations);

        processedData = processedData.map(p => ({
          ...p,
          cor_hex: colors[p.localidade.toUpperCase().trim()] || '#3B82F6',
          embarcado: false
        }));
        
        // Atualizar locais se necessário
        setBoardingLocations(allLocations);
        // Se não houver locais de embarque cadastrados e detectamos alguns, usamos eles
        currentBoardingLocations = allLocations;
      } else if (boardingLocations.length === 0) {
        // Fallback se não houver nada
        currentBoardingLocations = ['GERAL'];
      } else {
        currentBoardingLocations = boardingLocations;
      }

      await onImport(title, processedData, currentBoardingLocations, capacity, hasTwoFloors);
      setTitle('');
      setFile(null);
      setBoardingLocations([]);
      setRawText('');
      setCapacity(46);
      setHasTwoFloors(true);
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
        <div className="flex flex-col justify-end pb-1">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input 
                type="checkbox" 
                checked={hasTwoFloors} 
                onChange={(e) => setHasTwoFloors(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-zinc-800 rounded-full peer peer-checked:bg-blue-600 transition-all"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-zinc-400 rounded-full peer-checked:translate-x-6 peer-checked:bg-white transition-all"></div>
            </div>
            <span className="text-sm font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">Ônibus 2 Andares</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-2">Locais de Embarque (Opcional)</label>
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
        <label className="block text-sm font-medium text-zinc-400 mb-2">Importar Lista (CSV, TXT ou Colar)</label>
        
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="Cole sua lista aqui...&#10;Ex:&#10;01 - João Silva - Centro&#10;02 - Maria Oliveira - Dutra"
          className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none mb-4 resize-none font-mono"
        />

        <div 
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="flex justify-center px-6 pt-5 pb-6 border-2 border-zinc-800 border-dashed rounded-2xl group-hover:border-zinc-700 transition-colors cursor-pointer"
        >
          <div className="space-y-1 text-center">
            <Upload className="mx-auto h-8 w-8 text-zinc-500 group-hover:text-zinc-400 transition-colors" />
            <div className="flex text-xs text-zinc-400 justify-center">
              <label className="relative cursor-pointer rounded-md font-medium text-blue-500 hover:text-blue-400">
                <span>Upload CSV/TXT</span>
                <input type="file" className="sr-only" accept=".csv,.txt" onChange={handleFileChange} />
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
