'use client';

import React from 'react';
import { useData } from '@/hooks/useData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { SeatPicker } from '@/components/SeatPicker';
import { maskPhone, maskCPF, validateCPF } from '@/utils/masks';
import { Armchair, MapPin, User, Phone, CreditCard, CheckCircle, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ReservarPage({ params }: { params: { slug: string } }) {
  const [trip, setTrip] = React.useState<any>(null);
  const [passengers, setPassengers] = React.useState<any[]>([]);
  const [boardingLocations, setBoardingLocations] = React.useState<string[]>([]);
  const [capacity, setCapacity] = React.useState(46);
  const [isLoading, setIsLoading] = React.useState(true);
  
  const [selectedSeat, setSelectedSeat] = React.useState<number | null>(null);
  const [isConfirming, setIsConfirming] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const [formData, setFormData] = React.useState({
    nome: '',
    telefone: '',
    cpf: '',
    localidade: ''
  });

  const dataLayer = useData();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await dataLayer.getBoardingData(params.slug);
      setTrip(data.trip);
      setPassengers(data.passengers);
      setBoardingLocations(data.boardingLocations);
      setCapacity(data.capacity);

      if (isSupabaseConfigured && data.trip?.id) {
        const channel = supabase
          .channel(`reservation-${params.slug}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'passageiros', filter: `viagem_id=eq.${data.trip.id}` },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                setPassengers(curr => [...curr, payload.new]);
              } else if (payload.eventType === 'DELETE') {
                setPassengers(curr => curr.filter(p => p.id !== payload.old.id));
              }
            }
          )
          .subscribe();
        return () => { supabase.removeChannel(channel); };
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [params.slug]);

  const handleInputChange = (field: string, value: string) => {
    let maskedValue = value;
    if (field === 'telefone') maskedValue = maskPhone(value);
    if (field === 'cpf') maskedValue = maskCPF(value);
    setFormData(prev => ({ ...prev, [field]: maskedValue }));
  };

  const occupiedSeats = React.useMemo(() => passengers.map(p => p.assento), [passengers]);

  const validateForm = () => {
    if (!formData.nome.trim()) return "Por favor, preencha seu nome completo.";
    if (formData.telefone.length < 14) return "Telefone inválido.";
    if (!validateCPF(formData.cpf)) return "CPF inválido.";
    if (!formData.localidade) return "Por favor, selecione seu local de embarque.";
    if (selectedSeat === null) return "Por favor, selecione um assento no mapa.";
    return null;
  };

  const handleStartConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }
    setIsConfirming(true);
  };

  const handleConfirmReservation = async () => {
    setIsSubmitting(true);
    try {
      await dataLayer.reserveSeat(params.slug, {
        ...formData,
        assento: selectedSeat
      });
      setIsSuccess(true);
    } catch (error: any) {
      alert(error.message || "Erro ao realizar reserva.");
      setIsConfirming(false);
      fetchData(); // Atualizar dados se o erro for de assento ocupado
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-500 font-black text-[10px] tracking-widest uppercase">Carregando Mapa...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white p-6 text-center">
        <div className="space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
          <h1 className="text-2xl font-black uppercase">Viagem não encontrada</h1>
          <p className="text-zinc-500 text-sm max-w-xs mx-auto">Este link de reserva pode estar inválido ou a viagem foi encerrada.</p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="max-w-md w-full bg-zinc-900/50 border border-zinc-800 p-12 rounded-[3rem] space-y-8">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(34,197,94,0.2)]">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">Reserva Realizada!</h1>
            <p className="text-zinc-400 font-medium">Sua poltrona <span className="text-white font-bold text-xl">#{selectedSeat}</span> está garantida.</p>
          </div>
          <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 text-left space-y-3">
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Resumo do Embarque</p>
            <p className="text-white font-bold">{formData.nome.toUpperCase()}</p>
            <div className="flex items-center gap-2 text-blue-400 text-sm font-black">
              <MapPin className="w-4 h-4" />
              {formData.localidade}
            </div>
          </div>
          <p className="text-xs text-zinc-500 italic">Tenha uma ótima viagem com a Estradao!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20 font-sans">
      <header className="sticky top-0 z-30 bg-black/90 backdrop-blur-2xl border-b border-zinc-900 px-6 py-6">
        <div className="max-w-xl mx-auto text-center space-y-1">
          <p className="text-[10px] font-black text-blue-500 tracking-[0.3em] uppercase">Reserva de Assento</p>
          <h1 className="font-black text-2xl tracking-tight uppercase">{trip.titulo}</h1>
        </div>
      </header>

      <main className="max-w-xl mx-auto p-6 space-y-12">
        
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-blue-600 rounded-full" />
            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400">1. Escolha seu Assento</h2>
          </div>
          <SeatPicker 
            occupiedSeats={occupiedSeats} 
            selectedSeat={selectedSeat} 
            onSelect={setSelectedSeat}
            capacity={capacity}
          />
        </section>

        {selectedSeat && (
          <section className="space-y-8 animate-in slide-in-from-bottom-10 duration-500">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-blue-600 rounded-full" />
              <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400">2. Seus Dados</h2>
            </div>

            <form onSubmit={handleStartConfirmation} className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-zinc-500 ml-1">
                  <User className="w-3 h-3" />
                  <label className="text-[10px] font-black uppercase tracking-widest">Nome Completo</label>
                </div>
                <input 
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  required
                  placeholder="COMO ESTÁ NO DOCUMENTO"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-white font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-zinc-500 ml-1">
                    <Phone className="w-3 h-3" />
                    <label className="text-[10px] font-black uppercase tracking-widest">Telefone (WhatsApp)</label>
                  </div>
                  <input 
                    value={formData.telefone}
                    onChange={(e) => handleInputChange('telefone', e.target.value)}
                    required
                    placeholder="(00) 00000-0000"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-white font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-zinc-500 ml-1">
                    <CreditCard className="w-3 h-3" />
                    <label className="text-[10px] font-black uppercase tracking-widest">CPF</label>
                  </div>
                  <input 
                    value={formData.cpf}
                    onChange={(e) => handleInputChange('cpf', e.target.value)}
                    required
                    placeholder="000.000.000-00"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-white font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-4 bg-blue-600/5 p-8 rounded-[2.5rem] border border-blue-500/20">
                <div className="flex items-center gap-3 text-blue-500 mb-2">
                  <MapPin className="w-5 h-5" />
                  <label className="text-xs font-black uppercase tracking-[0.2em]">Onde você vai embarcar?</label>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {boardingLocations.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => handleInputChange('localidade', loc)}
                      className={cn(
                        "w-full p-5 rounded-2xl border-2 text-left transition-all relative group",
                        formData.localidade === loc 
                          ? "bg-blue-600 border-blue-400 shadow-[0_10px_30px_rgba(37,99,235,0.2)]" 
                          : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className={cn("font-black uppercase tracking-tight", formData.localidade === loc ? "text-white" : "text-zinc-400")}>
                          {loc}
                        </span>
                        {formData.localidade === loc && <CheckCircle className="w-6 h-6 text-white" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-white text-black py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                Prosseguir para Confirmação
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </section>
        )}
      </main>

      {/* Modal de Confirmação Gigante */}
      {isConfirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-2xl bg-black/90 animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(37,99,235,0.15)] flex flex-col">
            <div className="p-10 text-center space-y-6">
              <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                <Armchair className="w-10 h-10 text-blue-500" />
              </div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tight">Confirme sua Reserva</h2>
              
              <div className="space-y-4 py-6 border-y border-zinc-800">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Assento Escolhido</span>
                  <span className="text-5xl font-black text-blue-500 tracking-tighter">#{selectedSeat}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Local de Embarque</span>
                  <div className="bg-blue-600/20 text-blue-400 py-3 px-6 rounded-2xl border border-blue-500/30 inline-block mx-auto font-black text-xl uppercase">
                    {formData.localidade}
                  </div>
                </div>
              </div>

              <div className="text-left bg-zinc-950 p-6 rounded-2xl border border-zinc-800 space-y-2">
                <div className="flex justify-between text-[10px] font-black text-zinc-600 uppercase">
                  <span>Passageiro</span>
                  <span>Documento</span>
                </div>
                <div className="flex justify-between font-bold text-sm">
                  <span className="text-white truncate max-w-[200px] uppercase">{formData.nome}</span>
                  <span className="text-zinc-400">{formData.cpf}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-6">
                <button
                  disabled={isSubmitting}
                  onClick={handleConfirmReservation}
                  className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(37,99,235,0.3)] hover:bg-blue-500 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : 'SIM, RESERVAR MEU LUGAR'}
                </button>
                <button
                  disabled={isSubmitting}
                  onClick={() => setIsConfirming(false)}
                  className="w-full bg-transparent text-zinc-500 py-4 font-black text-[10px] uppercase tracking-widest hover:text-white transition-all"
                >
                  VOLTAR E CORRIGIR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
