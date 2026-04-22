'use client';

import React, { useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CheckCircle2, Layers } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Passenger {
  id: string;
  nome: string;
  assento: number;
  localidade: string;
  cor_hex: string;
  embarcado: boolean;
}

interface BusMapProps {
  passengers: Passenger[];
  locationColors: Record<string, string>;
  onToggleBoarding: (id: string, status: boolean) => void;
}

export function BusMap({ passengers, locationColors, onToggleBoarding }: BusMapProps) {
  const [floor, setFloor] = useState<1 | 2>(2); // Piso 2 é o padrão (geralmente mais assentos)

  const passengerMap = React.useMemo(() => {
    const map = new Map();
    passengers.forEach(p => map.set(parseInt(p.assento.toString()), p));
    return map;
  }, [passengers]);

  // Definição de assentos por piso conforme planilha real
  const floor1Seats = Array.from({ length: 14 }, (_, i) => i + 51); // 51-64 no Inferior
  const floor2Seats = Array.from({ length: 44 }, (_, i) => i + 1); // 1-44 no Superior
  
  const currentSeats = floor === 1 ? floor1Seats : floor2Seats;
  const numRows = Math.ceil(currentSeats.length / 4);

  return (
    <div className="flex flex-col items-center py-4 animate-fade-in w-full">
      
      {/* Seletor de Piso - Alinhado com a Largura Total */}
      <div className="flex bg-[#0A0A0A] p-1.5 rounded-2xl mb-8 border border-zinc-900 shadow-2xl w-full">
        <button
          onClick={() => setFloor(2)}
          className={cn(
            "flex-1 flex items-center justify-center gap-3 py-4 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest",
            floor === 2 
              ? "bg-zinc-800 text-white shadow-xl" 
              : "text-zinc-600 hover:text-zinc-400"
          )}
        >
          <Layers className="w-4 h-4" />
          Piso Superior
        </button>
        <button
          onClick={() => setFloor(1)}
          className={cn(
            "flex-1 flex items-center justify-center gap-3 py-4 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest",
            floor === 1 
              ? "bg-blue-600 text-white shadow-[0_10px_20px_rgba(37,99,235,0.3)]" 
              : "text-zinc-600 hover:text-zinc-400"
          )}
        >
          <Layers className="w-4 h-4" />
          Piso Inferior
        </button>
      </div>

      {/* Frente do Ônibus - Largura Total */}
      <div className="w-full h-20 bg-zinc-950 rounded-t-[4rem] border-x border-t border-zinc-900 flex flex-col items-center justify-center mb-0 relative overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
        <div className="opacity-10 mb-2">
          <div className="flex gap-4">
            <div className="w-12 h-1 bg-zinc-700 rounded-full" />
            <div className="w-12 h-1 bg-zinc-700 rounded-full" />
          </div>
        </div>
        <div className="w-32 h-2 bg-zinc-900 rounded-full border border-zinc-800/50" />
      </div>

      {/* Corpo do Ônibus - Grid Distribuído */}
      <div className="w-full bg-[#0D0D0D] border-x border-zinc-900 p-6 relative">
        <div className="grid grid-cols-[1fr_1fr_0.4fr_1fr_1fr] gap-y-6 items-center">
          {Array.from({ length: numRows }).map((_, rowIndex) => {
            const rowStart = rowIndex * 4;
            return (
              <React.Fragment key={rowIndex}>
                {/* Lado Esquerdo */}
                {[0, 1].map((offset) => {
                  const seatNum = currentSeats[rowStart + offset];
                  if (!seatNum) return <div key={offset} />;
                  const p = passengerMap.get(seatNum);
                  const color = p ? (locationColors[p.localidade] || p.cor_hex || '#3B82F6') : undefined;
                  return (
                    <div key={seatNum} className="flex justify-center">
                      <Seat 
                        num={seatNum} 
                        passenger={p} 
                        color={color}
                        onClick={() => p && onToggleBoarding(p.id, !p.embarcado)} 
                      />
                    </div>
                  );
                })}

                {/* Corredor Central */}
                <div className="flex justify-center h-full items-center">
                  <div className="w-[1px] h-full bg-zinc-800/40" />
                </div>

                {/* Lado Direito */}
                {[2, 3].map((offset) => {
                  const seatNum = currentSeats[rowStart + offset];
                  if (!seatNum) return <div key={offset} />;
                  const p = passengerMap.get(seatNum);
                  const color = p ? (locationColors[p.localidade] || p.cor_hex || '#3B82F6') : undefined;
                  return (
                    <div key={seatNum} className="flex justify-center">
                      <Seat 
                        num={seatNum} 
                        passenger={p} 
                        color={color}
                        onClick={() => p && onToggleBoarding(p.id, !p.embarcado)} 
                      />
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Fundo do Ônibus */}
      <div className="w-full h-14 bg-zinc-900 rounded-b-3xl border-x border-b border-zinc-800 shadow-2xl relative flex items-center justify-center">
        <div className="flex gap-2">
          <div className="w-8 h-1 bg-red-900/40 rounded-full" />
          <div className="w-8 h-1 bg-red-900/40 rounded-full" />
        </div>
      </div>

      {/* Legenda Atualizada */}
      <div className="mt-8 flex flex-wrap justify-center gap-6 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">
        <div className="flex items-center gap-2 text-emerald-500">
          <div className="w-3 h-3 rounded-md bg-emerald-600" />
          Livre
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-md bg-zinc-700" />
          Ocupado
        </div>
        <div className="flex items-center gap-2 text-blue-500">
          <CheckCircle2 className="w-3 h-3" />
          Embarcado
        </div>
      </div>
    </div>
  );
}

function Seat({ num, passenger, color, onClick }: { num: number; passenger?: any; color?: string; onClick: () => void }) {
  if (!passenger) {
    return (
      <div className="w-full max-w-[80px] h-16 bg-emerald-950/10 border border-emerald-900/30 rounded-xl flex flex-col items-center justify-center text-[10px] text-emerald-500/50 font-black transition-all">
        {num}
      </div>
    );
  }

  const isBoarded = passenger.embarcado;
  const firstName = passenger.nome.trim().split(' ')[0];

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full max-w-[80px] h-16 rounded-xl flex flex-col items-center justify-center transition-all relative overflow-hidden group border-2",
        isBoarded 
          ? "bg-zinc-900/20 border-zinc-800 text-zinc-700" 
          : "text-white border-transparent shadow-2xl active:scale-95 hover:brightness-110"
      )}
      style={{ 
        backgroundColor: !isBoarded ? color : 'transparent',
        borderColor: isBoarded ? color : 'transparent',
        boxShadow: !isBoarded ? `0 6px 15px ${color}44` : 'none'
      }}
    >
      {/* Brilho interno para assentos coloridos */}
      {!isBoarded && (
        <div className="absolute inset-x-0 top-0 h-[25%] bg-white/20" />
      )}
      
      <div className={cn(
        "relative z-10 flex flex-col items-center leading-none",
        isBoarded && "hidden"
      )}>
        <span className="text-[11px] font-black drop-shadow-md mb-0.5">{num}</span>
        <span className="text-[8px] font-bold uppercase tracking-tighter truncate w-full px-1">{firstName}</span>
      </div>
      
      {isBoarded && (
        <CheckCircle2 
          className="w-5 h-5 animate-in zoom-in-50 duration-300" 
          style={{ color: color }} 
        />
      )}
    </button>
  );
}
