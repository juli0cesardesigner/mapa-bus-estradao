'use client';

import React from 'react';
import { X, Loader2, Plus, MapPin, Save } from 'lucide-react';

interface EditTripModalProps {
  trip: {
    id: string;
    titulo: string;
    capacidade: number;
    locais_embarque: string[];
    tem_dois_andares: boolean;
    assentos_superior?: number;
    assentos_inferior?: number;
  };
  onClose: () => void;
  onSave: (updates: { 
    titulo: string; 
    capacidade: number; 
    locais_embarque: string[]; 
    tem_dois_andares: boolean;
    assentos_superior?: number;
    assentos_inferior?: number;
  }) => Promise<void>;
}

export const EditTripModal: React.FC<EditTripModalProps> = ({ trip, onClose, onSave }) => {
  const [title, setTitle] = React.useState(trip.titulo);
  const [hasTwoFloors, setHasTwoFloors] = React.useState(trip.tem_dois_andares ?? true);
  const [superiorSeats, setSuperiorSeats] = React.useState(trip.assentos_superior || 44);
  const [inferiorSeats, setInferiorSeats] = React.useState(trip.assentos_inferior || 12);
  const [capacity, setCapacity] = React.useState(trip.capacidade || 56);
  const [locationInput, setLocationInput] = React.useState('');
  const [boardingLocations, setBoardingLocations] = React.useState<string[]>(trip.locais_embarque || []);
  const [historicalLocations, setHistoricalLocations] = React.useState<string[]>([]);
  const [isSaving, setIsSaving] = React.useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        titulo: title,
        capacidade: capacity,
        locais_embarque: boardingLocations,
        tem_dois_andares: hasTwoFloors,
        assentos_superior: hasTwoFloors ? superiorSeats : capacity,
        assentos_inferior: hasTwoFloors ? inferiorSeats : 0
      });
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      alert('Erro ao salvar alterações.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-xl bg-zinc-900 rounded-[2.5rem] border border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Editar Viagem</h2>
            <p className="text-xs text-zinc-500 mt-1">Ajuste os parâmetros logísticos da viagem</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
            <X className="w-6 h-6 text-zinc-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Título da Viagem</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
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
            <label className="block text-sm font-medium text-zinc-400 mb-2">Locais de Embarque</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLocation())}
                placeholder="Adicionar local..."
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <button
                type="button"
                onClick={handleAddLocation}
                className="bg-zinc-800 p-2 rounded-xl hover:bg-zinc-700 transition-all"
              >
                <Plus className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1 mb-4">
              {boardingLocations.map((loc) => (
                <span key={loc} className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 px-3 py-1.5 rounded-lg text-xs font-bold">
                  <MapPin className="w-3 h-3" />
                  {loc}
                  <button type="button" onClick={() => removeLocation(loc)} className="hover:text-white ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
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

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-zinc-800 text-white rounded-xl py-4 font-bold hover:bg-zinc-700 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-[2] bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl py-4 font-bold hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
