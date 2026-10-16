'use client';

import React from 'react';
import { Upload, X, Loader2, Plus, MapPin } from 'lucide-react';
import { parseCSV, parseRawText, generateLocationColors, type PassengerData } from '@/utils/csv-parser';

interface ImportFormProps {
  onImport: (
    title: string, 
    data: any[], 
    boardingLocations: string[], 
    capacity: number, 
    tem_dois_andares: boolean,
    assentos_superior: number,
    assentos_inferior: number
  ) => Promise<void>;
}

export const ImportForm: React.FC<ImportFormProps> = ({ onImport }) => {
  const [title, setTitle] = React.useState('');
  const [file, setFile] = React.useState<File | null>(null);
  const [hasTwoFloors, setHasTwoFloors] = React.useState(true);
  const [superiorSeats, setSuperiorSeats] = React.useState(48);
  const [inferiorSeats, setInferiorSeats] = React.useState(12);
  const [capacity, setCapacity] = React.useState(60);
  const [locationInput, setLocationInput] = React.useState('');
  const [boardingLocations, setBoardingLocations] = React.useState<string[]>([]);
  const [historicalLocations, setHistoricalLocations] = React.useState<string[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const [rawText, setRawText] = React.useState('');

  // Sincronizar capacidade quando mudar assentos dos andares
  React.useEffect(() => {
    if (hasTwoFloors) {
      setCapacity(superiorSeats + inferiorSeats);
    }
  }, [hasTwoFloors, superiorSeats, inferiorSeats]);

  React.useEffect(() => {
    const saved = localStorage.getItem('mapabus_historical_locations');
    if (saved) {
      try {
        setHistoricalLocations(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing historical locations', e);
      }
    }
  }, []);

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
      if (!historicalLocations.includes(loc)) {
        const newHist = [...historicalLocations, loc];
        setHistoricalLocations(newHist);
        localStorage.setItem('mapabus_historical_locations', JSON.stringify(newHist));
      }
      setLocationInput('');
    }
  };

  const removeLocation = (loc: string) => {
    setBoardingLocations(boardingLocations.filter(l => l !== loc));
  };

  const removeHistoricalLocation = (loc: string) => {
    const newHist = historicalLocations.filter(l => l !== loc);
    setHistoricalLocations(newHist);
    localStorage.setItem('mapabus_historical_locations', JSON.stringify(newHist));
  };

  const addFromHistory = (loc: string) => {
    if (!boardingLocations.includes(loc)) {
      setBoardingLocations([...boardingLocations, loc]);
    }
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

        let currentSeat = 1;
        const usedSeats = new Set<number>();
        
        processedData = processedData.map(p => {
          let seat = p.assento;
          if (!seat || seat === 0 || usedSeats.has(seat)) {
            // Auto-assign next available seat
            while (usedSeats.has(currentSeat)) {
              currentSeat++;
            }
            seat = currentSeat;
            currentSeat++;
          }
          usedSeats.add(seat);
          
          return {
            ...p,
            assento: seat,
            cor_hex: colors[p.localidade.toUpperCase().trim()] || '#3B82F6',
            embarcado: false
          };
        });
        
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

      await onImport(
        title, 
        processedData, 
        currentBoardingLocations, 
        capacity, 
        hasTwoFloors, 
        hasTwoFloors ? superiorSeats : capacity, 
        hasTwoFloors ? inferiorSeats : 0
      );
      setTitle('');
      setFile(null);
      setBoardingLocations([]);
      setRawText('');
      setCapacity(60);
      setSuperiorSeats(48);
      setInferiorSeats(12);
      setHasTwoFloors(true);
    } catch (error: any) {
      console.error('Erro ao criar viagem:', error);
      alert('Erro ao processar: ' + (error.message || JSON.stringify(error)));
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

      {/* Tipo de Ônibus & Andares */}
      <div className="bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-zinc-300">Estrutura do Veículo</span>
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
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 group-hover:text-zinc-200 transition-colors">
              {hasTwoFloors ? 'Ônibus 2 Andares (DD)' : 'Ônibus Convencional (1 Andar)'}
            </span>
          </label>
        </div>

        {hasTwoFloors ? (
          <div className="space-y-4 pt-3 border-t border-zinc-800/60">
            {/* Linha 1: Piso Superior */}
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-white block">
                    Piso Superior
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    Informe a poltrona final do piso superior (inicia na 01 até a poltrona informada):
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-500">01 até</span>
                    <input
                      type="number"
                      value={superiorSeats}
                      onChange={(e) => setSuperiorSeats(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-24 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-center font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      min="1"
                      max="100"
                      required
                    />
                  </div>
                  <span className="text-xs font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-2 rounded-xl whitespace-nowrap">
                    Assentos: 01 a {String(superiorSeats).padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>

            {/* Linha 2: Piso Inferior */}
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-white block">
                    Piso Inferior
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    Quantidade de poltronas no piso inferior (iniciando automaticamente após a última do piso superior):
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-500">Qtd:</span>
                    <input
                      type="number"
                      value={inferiorSeats}
                      onChange={(e) => setInferiorSeats(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-24 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-center font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      min="1"
                      max="60"
                      required
                    />
                  </div>
                  <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl whitespace-nowrap">
                    Assentos: {String(superiorSeats + 1).padStart(2, '0')} a {String(superiorSeats + inferiorSeats).padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>

            {/* Linha 3: Resumo Capacidade Total */}
            <div className="flex items-center justify-between bg-zinc-950/70 border border-zinc-800 rounded-2xl px-5 py-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Capacidade Total do Ônibus (DD)
              </span>
              <span className="text-sm font-black text-blue-400">
                {capacity} poltronas ({superiorSeats} no superior + {inferiorSeats} no inferior)
              </span>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Capacidade Total (Assentos)</label>
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value) || 46)}
              className="w-full max-w-xs bg-zinc-900 border border-zinc-700/60 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
              min="1"
              max="100"
              required
            />
          </div>
        )}
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
        
        <div className="flex flex-wrap gap-2 mb-4">
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

        {historicalLocations.length > 0 && (
          <div className="bg-zinc-950/50 border border-zinc-800/50 rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Locais Anteriores (Clique para adicionar)</p>
            <div className="flex flex-wrap gap-2">
              {historicalLocations.filter(loc => !boardingLocations.includes(loc)).map((loc) => (
                <span key={loc} className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-zinc-800 hover:text-zinc-300 transition-colors cursor-pointer group">
                  <span onClick={() => addFromHistory(loc)} className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" />
                    {loc}
                  </span>
                  <button type="button" onClick={(e) => { e.stopPropagation(); removeHistoricalLocation(loc); }} className="hover:text-red-400 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" title="Remover do histórico">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {historicalLocations.filter(loc => !boardingLocations.includes(loc)).length === 0 && (
                <p className="text-xs text-zinc-600 italic">Todos os locais do histórico já foram adicionados.</p>
              )}
            </div>
          </div>
        )}
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
