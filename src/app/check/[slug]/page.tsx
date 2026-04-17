'use client';

import React from 'react';
import { useData } from '@/hooks/useData';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { BusMap } from '@/components/BusMap';
import { Map as MapIcon, List, Users, CheckCircle2, Info } from 'lucide-react';
import { generateLocationColors } from '@/utils/csv-parser';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function CheckPage({ params }: { params: { slug: string } }) {
  const [trip, setTrip] = React.useState<any>(null);
  const [passengers, setPassengers] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [view, setView] = React.useState<'list' | 'map'>('list');
  const [selectedLocation, setSelectedLocation] = React.useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [editingPassenger, setEditingPassenger] = React.useState<any>(null);
  const dataLayer = useData();

  React.useEffect(() => {
    fetchData();

    if (isSupabaseConfigured) {
      const channel = supabase
        .channel(`boarding-${params.slug}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'passageiros' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setPassengers((current) => [...current, payload.new].sort((a, b) => a.assento - b.assento));
            } else if (payload.eventType === 'UPDATE') {
              setPassengers((current) => 
                current.map((p) => (p.id === payload.new.id ? { ...p, ...payload.new } : p))
              );
            } else if (payload.eventType === 'DELETE') {
              setPassengers((current) => current.filter((p) => p.id !== payload.old.id));
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [params.slug, dataLayer.mode]);

  const fetchData = async () => {
    setIsLoading(true);
    const { trip, passengers } = await dataLayer.getBoardingData(params.slug);
    setTrip(trip);
    setPassengers(passengers);
    setIsLoading(false);
  };

  const toggleBoarding = async (id: string, status: boolean) => {
    setPassengers(current => 
      current.map(p => p.id === id ? { ...p, embarcado: status } : p)
    );
    await dataLayer.updatePassenger(params.slug, id, status);
  };

  const handleSavePassenger = async (formData: any) => {
    try {
      await dataLayer.upsertPassenger(params.slug, formData);
      setIsEditModalOpen(false);
      setEditingPassenger(null);
      if (!isSupabaseConfigured) fetchData(); // Fallback para demo mode sem realtime
    } catch (error) {
      console.error('Erro ao salvar passageiro:', error);
      alert('Erro ao salvar passageiro. Verifique os dados.');
    }
  };

  const handleDeletePassenger = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este passageiro?')) {
      try {
        await dataLayer.deletePassenger(params.slug, id);
        setIsEditModalOpen(false);
        setEditingPassenger(null);
        if (!isSupabaseConfigured) fetchData(); // Fallback para demo mode sem realtime
      } catch (error) {
        console.error('Erro ao excluir:', error);
      }
    }
  };

  const locationColors = React.useMemo(() => {
    const locations = Array.from(new Set(passengers.map(p => (p.localidade || 'Geral').toUpperCase().trim())));
    const generatedColors = generateLocationColors(locations);
    
    const colors: Record<string, string> = {};
    locations.forEach(loc => {
      const existingColor = passengers.find(p => (p.localidade || 'Geral').toUpperCase().trim() === loc)?.cor_hex;
      colors[loc] = existingColor || generatedColors[loc] || '#3B82F6';
    });
    return colors;
  }, [passengers]);

  const locations = Array.from(new Set(passengers.map(p => (p.localidade || 'Geral').toUpperCase().trim())));
  
  const filteredPassengers = passengers.filter(p => {
    return !selectedLocation || (p.localidade || 'Geral').toUpperCase().trim() === selectedLocation;
  });

  const boardedCount = passengers.filter(p => p.embarcado).length;
  const progressPercent = passengers.length > 0 ? (boardedCount / passengers.length) * 100 : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(37,99,235,0.2)]"></div>
        <p className="text-zinc-500 font-black text-[10px] tracking-[0.2em] uppercase">Carregando Viagem...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white p-6 text-center">
        <div className="space-y-4">
          <h1 className="text-2xl font-black tracking-tighter uppercase underline decoration-red-600 underline-offset-8">Viagem não encontrada</h1>
          <p className="text-zinc-500 text-sm max-w-xs mx-auto">O link pode estar expirado ou incorreto. Por favor, verifique com o administrador.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20 font-sans">
      {/* Header Fixo com Progresso - Centralizado */}
      <header className="sticky top-0 z-30 bg-black/90 backdrop-blur-2xl border-b border-zinc-900 px-6 py-5">
        <div className="max-w-xl mx-auto space-y-6 text-center">
          <h1 className="font-black text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-600 uppercase">
            {trip.titulo}
          </h1>
          
          <div className="flex justify-between items-center gap-4">
            <div className="flex-1 space-y-4 max-w-sm">
              <div className="flex justify-between items-end">
                <div className="flex flex-col items-start gap-1">
                  <span className="text-[20px] font-black leading-none flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    {boardedCount} / {passengers.length}
                  </span>
                  <span className="text-[9px] font-black text-zinc-600 tracking-[0.2em] uppercase">Passageiros</span>
                </div>
                <div className="flex flex-col items-end gap-1 text-right">
                  <span className="text-2xl font-black text-white drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                    {Math.round(progressPercent)}%
                  </span>
                  <span className="text-[9px] font-black text-blue-500 tracking-[0.2em] uppercase">Embarque</span>
                </div>
              </div>
              
              <div className="h-4 bg-zinc-900 rounded-full overflow-hidden border border-white/5 shadow-inner p-[1px]">
                <div 
                  className="h-full bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-400 transition-all duration-1000 ease-out relative rounded-full"
                  style={{ 
                    width: `${progressPercent}%`,
                    boxShadow: '0 0 20px rgba(59,130,246,0.4)'
                  }}
                >
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-white/20 blur-[1px]" />
                  {progressPercent > 0 && (
                     <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[pulse_1s_infinite]" />
                  )}
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                setEditingPassenger(null);
                setIsEditModalOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-500 p-4 rounded-2xl shadow-[0_10px_20px_rgba(37,99,235,0.3)] transition-all active:scale-95 group"
            >
              <Users className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
              <span className="text-[8px] font-black block mt-1 uppercase tracking-tighter">Novo</span>
            </button>
          </div>
        </div>
      </header>
      
      {!isSupabaseConfigured && (
        <div className="max-w-xl mx-auto mt-6 px-4 flex justify-center">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-4 text-amber-500 shadow-2xl backdrop-blur-md max-w-md">
            <div className="bg-amber-500/20 p-2 rounded-xl">
              <Info className="w-5 h-5 shrink-0" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[11px] font-black uppercase tracking-wider">Modo Simulação</p>
              <p className="text-[10px] text-amber-500/70 font-medium leading-tight">
                Dados salvos localmente neste aparelho.
              </p>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-xl mx-auto p-6 space-y-10">
        {/* Seletor de Visualização Proeminente */}
        <div className="flex bg-zinc-900/50 p-1.5 rounded-[2rem] border border-zinc-800/50 shadow-2xl backdrop-blur-sm">
          <button 
            onClick={() => setView('list')}
            className={cn(
              "flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.8rem] font-black text-xs tracking-[0.15em] transition-all duration-300",
              view === 'list' 
                ? "bg-white text-black shadow-2xl scale-[1.02]" 
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <List className="w-5 h-5" />
            LISTA
          </button>
          <button 
            onClick={() => setView('map')}
            className={cn(
              "flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.8rem] font-black text-xs tracking-[0.15em] transition-all duration-300",
              view === 'map' 
                ? "bg-white text-black shadow-2xl scale-[1.02]" 
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <MapIcon className="w-5 h-5" />
            MAPA
          </button>
        </div>

        {/* Filtros de Localidade - Largura Total */}
        <div className="space-y-4">
          <p className="text-[10px] font-black text-zinc-600 tracking-[0.3em] uppercase ml-2">
            Filtrar Local
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              onClick={() => setSelectedLocation(null)}
              className={cn(
                "py-3.5 rounded-2xl text-[10px] font-black border transition-all uppercase tracking-[0.2em] w-full",
                selectedLocation === null 
                  ? "bg-blue-600 text-white border-transparent shadow-[0_10px_20px_rgba(37,99,235,0.3)]" 
                  : "bg-zinc-900/50 text-zinc-500 border-zinc-800 hover:border-zinc-700"
              )}
            >
              TODOS
            </button>
            {locations.map((loc) => {
              const color = locationColors[loc] || '#3B82F6';
              const isSelected = selectedLocation === loc;
              return (
                <button
                  key={loc}
                  onClick={() => setSelectedLocation(loc)}
                  className={cn(
                    "py-3.5 rounded-2xl text-[10px] font-black border transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-2 w-full",
                    isSelected 
                      ? "text-white border-transparent shadow-xl scale-105" 
                      : "bg-zinc-900 text-zinc-500 border-zinc-800"
                  )}
                  style={{ 
                    backgroundColor: isSelected ? color : undefined,
                    boxShadow: isSelected ? `0 10px 25px ${color}44` : undefined
                  }}
                >
                  <div className={cn("w-1.5 h-1.5 rounded-full", isSelected ? "bg-white" : "")} 
                       style={{ backgroundColor: !isSelected ? color : undefined }} />
                  <span className="truncate max-w-[80px]">{loc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {!isSupabaseConfigured && (
          <div className="w-full">
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-4 rounded-2xl flex items-center gap-4 transition-all hover:bg-amber-500/15">
              <div className="bg-amber-500/20 p-2 rounded-xl">
                <Info className="w-5 h-5 shrink-0" />
              </div>
              <p className="text-[11px] font-medium leading-tight">
                <span className="font-black block mb-0.5">MODO SIMULAÇÃO ATIVO</span>
                Dados locais. As mudanças no seu aparelho não afetarão outros usuários.
              </p>
            </div>
          </div>
        )}

        {/* Conteúdo Principal */}
        {view === 'list' ? (
          <div className="space-y-8">
            {/* Helper para rótulo de piso */}
            {(() => {
              const getFloorLabel = (seat: number) => {
                if (seat >= 51) return { label: 'PISO INF', color: 'bg-blue-600/20 text-blue-500' };
                return { label: 'PISO SUP', color: 'bg-zinc-800 text-zinc-400' };
              };

              const sortFn = (a: any, b: any) => {
                if (selectedLocation) {
                  return a.nome.localeCompare(b.nome);
                }
                return a.assento - b.assento;
              };

              const waiting = filteredPassengers.filter(p => !p.embarcado).sort(sortFn);
              const boarded = filteredPassengers.filter(p => p.embarcado).sort(sortFn);

              return (
                <>
                  {/* Seção Não Embarcados */}
                  {waiting.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 px-2">
                        <div className="w-1 h-3 bg-blue-600 rounded-full" />
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Aguardando Embarque</p>
                      </div>
                      {waiting.map(p => {
                        const color = locationColors[p.localidade] || '#3B82F6';
                        const floor = getFloorLabel(p.assento);
                        return (
                          <div
                            key={p.id}
                            className="w-full flex items-center gap-4 p-4 rounded-2xl border bg-[#1A1A1A] border-zinc-800 shadow-2xl transition-all text-left group relative overflow-hidden"
                          >
                            <button
                              onClick={() => toggleBoarding(p.id, !p.embarcado)}
                              className="flex flex-1 items-center gap-4 min-w-0"
                            >
                              <div className="flex flex-col items-center gap-1.5 shrink-0">
                                <div 
                                  className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg text-white transition-transform group-hover:scale-110"
                                  style={{ 
                                    backgroundColor: color,
                                    boxShadow: `0 0 15px ${color}33`,
                                  }}
                                >
                                  {p.assento}
                                </div>
                                <span className={cn("text-[7px] font-black px-1.5 py-0.5 rounded-full tracking-tighter", floor.color)}>
                                  {floor.label}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-black text-base truncate text-white uppercase">{p.nome}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{p.localidade}</p>
                                </div>
                              </div>
                            </button>
                            
                            <button 
                              onClick={() => {
                                setEditingPassenger(p);
                                setIsEditModalOpen(true);
                              }}
                              className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center hover:bg-zinc-700 transition-colors z-10"
                            >
                              <List className="w-4 h-4 text-zinc-400" />
                            </button>
                            
                            <div className="w-6 h-6 rounded-full border-2 border-zinc-800 flex items-center justify-center shrink-0 ml-2">
                              <div className="w-1 h-1 rounded-full bg-zinc-700" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Seção Embarcados */}
                  {boarded.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 px-2">
                        <div className="w-1 h-3 bg-zinc-700 rounded-full" />
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Embarcados</p>
                      </div>
                      {boarded.map(p => {
                        const color = locationColors[p.localidade] || '#3B82F6';
                        const floor = getFloorLabel(p.assento);
                        return (
                          <div
                            key={p.id}
                            className="w-full flex items-center gap-4 p-4 rounded-2xl border bg-zinc-900/40 border-zinc-800/50 transition-all text-left group"
                          >
                            <button
                              onClick={() => toggleBoarding(p.id, !p.embarcado)}
                              className="flex flex-1 items-center gap-4 min-w-0"
                            >
                              <div className="flex flex-col items-center gap-1.5 shrink-0 opacity-50">
                                <div 
                                  className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg text-zinc-500 bg-zinc-800/50"
                                >
                                  {p.assento}
                                </div>
                                <span className={cn("text-[7px] font-black px-1.5 py-0.5 rounded-full tracking-tighter", floor.color)}>
                                  {floor.label}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-black text-base truncate text-zinc-500 uppercase">{p.nome}</p>
                                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">{p.localidade}</p>
                              </div>
                            </button>

                            <button 
                              onClick={() => {
                                setEditingPassenger(p);
                                setIsEditModalOpen(true);
                              }}
                              className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 transition-colors z-10"
                            >
                              <List className="w-4 h-4 text-zinc-600" />
                            </button>

                            <div className="flex flex-col items-end shrink-0 gap-1 ml-2">
                              <span className="text-[8px] font-black text-blue-500 uppercase tracking-tight">CONFIRMADO</span>
                              <div className="bg-blue-600/20 p-1 rounded-full">
                                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              );
            })()}

            {filteredPassengers.length === 0 && (
              <div className="py-20 text-center text-zinc-500 text-sm">
                Nenhum passageiro encontrado com esses filtros.
              </div>
            )}
          </div>
        ) : (
          <BusMap 
            passengers={passengers} 
            locationColors={locationColors}
            onToggleBoarding={toggleBoarding} 
          />
        )}
      </main>

      {/* Modal de Edição/Criação */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-xl bg-black/80">
          <div className="bg-[#111111] border border-zinc-800 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-zinc-900 flex justify-between items-center bg-gradient-to-r from-blue-600/10 to-transparent">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight">
                  {editingPassenger ? 'Editar Passageiro' : 'Novo Passageiro'}
                </h2>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-1">Configurações de Embarque</p>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 transition-all text-zinc-500 hover:text-white"
              >
                ×
              </button>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleSavePassenger({
                  id: editingPassenger?.id,
                  nome: formData.get('nome'),
                  assento: parseInt(formData.get('assento') as string),
                  localidade: formData.get('localidade'),
                });
              }}
              className="p-8 space-y-6 overflow-y-auto"
            >
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Nome Completo</label>
                <input 
                  name="nome"
                  required
                  defaultValue={editingPassenger?.nome}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-blue-600 transition-all placeholder:text-zinc-700"
                  placeholder="EX: JOÃO DA SILVA"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Nº Assento</label>
                  <input 
                    name="assento"
                    type="number"
                    required
                    min="1"
                    max="62"
                    defaultValue={editingPassenger?.assento}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-blue-600 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Localidade</label>
                  <input 
                    name="localidade"
                    required
                    defaultValue={editingPassenger?.localidade}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-blue-600 transition-all list-none"
                    placeholder="EX: COLATINA"
                    list="locations-list"
                  />
                  <datalist id="locations-list">
                    {locations.map(loc => <option key={loc} value={loc} />)}
                  </datalist>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                {editingPassenger && (
                  <button
                    type="button"
                    onClick={() => handleDeletePassenger(editingPassenger.id)}
                    className="px-6 py-4 rounded-2xl border border-red-500/30 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-500/10 transition-all active:scale-95"
                  >
                    Excluir
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 bg-white text-black py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-[0_10px_20px_rgba(255,255,255,0.1)] hover:scale-[1.02] transition-all active:scale-95"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
