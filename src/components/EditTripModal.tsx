'use client';

import React from 'react';
import { X, Loader2, Plus, MapPin, Save } from 'lucide-react';

interface EditTripModalProps {
  trip: {
    id: string;
    titulo: string;
    capacidade: number;
    locais_embarque: string[];
  };
  onClose: () => void;
  onSave: (updates: { titulo: string; capacidade: number; locais_embarque: string[] }) => Promise<void>;
}

export const EditTripModal: React.FC<EditTripModalProps> = ({ trip, onClose, onSave }) => {
  const [title, setTitle] = React.useState(trip.titulo);
  const [capacity, setCapacity] = React.useState(trip.capacidade);
  const [locationInput, setLocationInput] = React.useState('');
  const [boardingLocations, setBoardingLocations] = React.useState<string[]>(trip.locais_embarque || []);
  const [isSaving, setIsSaving] = React.useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        titulo: title,
        capacidade: capacity,
        locais_embarque: boardingLocations
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Capacidade (Assentos)</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                min="1"
                max="100"
                required
              />
            </div>
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
            
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
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
