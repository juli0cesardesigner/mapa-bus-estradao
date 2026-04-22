'use client';

import React, { useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Layers, User, Check } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Passenger {
  assento: number;
}

interface SeatPickerProps {
  occupiedSeats: number[];
  selectedSeat: number | null;
  onSelect: (seat: number) => void;
  capacity?: number;
}

export function SeatPicker({ occupiedSeats, selectedSeat, onSelect, capacity = 46 }: SeatPickerProps) {
  const [floor, setFloor] = useState<1 | 2>(2);

  // Definição de assentos por piso
  const floor1Seats = Array.from({ length: 14 }, (_, i) => i + 51); // 51-64 no Inferior
  const floor2Seats = Array.from({ length: 44 }, (_, i) => i + 1); // 1-44 no Superior
  
  const currentSeats = (floor === 1 ? floor1Seats : floor2Seats).filter(s => s <= capacity);
  const numRows = Math.ceil(currentSeats.length / 4);

  return (
    <div className="flex flex-col items-center animate-fade-in w-full">
      {/* Seletor de Piso */}
      <div className="flex bg-[#0A0A0A] p-1.5 rounded-2xl mb-8 border border-zinc-900 shadow-2xl w-full max-w-sm">
        <button
          onClick={() => setFloor(2)}
          className={cn(
            "flex-1 flex items-center justify-center gap-3 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest",
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
            "flex-1 flex items-center justify-center gap-3 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest",
            floor === 1 
              ? "bg-blue-600 text-white shadow-xl" 
              : "text-zinc-600 hover:text-zinc-400"
          )}
        >
          <Layers className="w-4 h-4" />
          Piso Inferior
        </button>
      </div>

      {/* Ônibus */}
      <div className="w-full max-w-md bg-[#0D0D0D] border border-zinc-900 rounded-[3rem] p-6 shadow-2xl relative overflow-hidden">
        {/* Cabine */}
        <div className="h-16 border-b border-zinc-900/50 mb-8 flex items-center justify-center">
          <div className="w-20 h-1.5 bg-zinc-900 rounded-full" />
        </div>

        <div className="grid grid-cols-[1fr_1fr_0.4fr_1fr_1fr] gap-y-4 items-center">
          {Array.from({ length: numRows }).map((_, rowIndex) => {
            const rowStart = rowIndex * 4;
            return (
              <React.Fragment key={rowIndex}>
                {[0, 1].map((offset) => {
                  const seatNum = currentSeats[rowStart + offset];
                  if (!seatNum) return <div key={offset} />;
                  const isOccupied = occupiedSeats.includes(seatNum);
                  const isSelected = selectedSeat === seatNum;
                  return (
                    <div key={seatNum} className="flex justify-center">
                      <Seat 
                        num={seatNum} 
                        isOccupied={isOccupied} 
                        isSelected={isSelected}
                        onClick={() => !isOccupied && onSelect(seatNum)} 
                      />
                    </div>
                  );
                })}

                <div className="flex justify-center h-full items-center">
                  <div className="w-[1px] h-full bg-zinc-900" />
                </div>

                {[2, 3].map((offset) => {
                  const seatNum = currentSeats[rowStart + offset];
                  if (!seatNum) return <div key={offset} />;
                  const isOccupied = occupiedSeats.includes(seatNum);
                  const isSelected = selectedSeat === seatNum;
                  return (
                    <div key={seatNum} className="flex justify-center">
                      <Seat 
                        num={seatNum} 
                        isOccupied={isOccupied} 
                        isSelected={isSelected}
                        onClick={() => !isOccupied && onSelect(seatNum)} 
                      />
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Legenda */}
      <div className="mt-8 flex gap-6 text-[9px] font-black uppercase tracking-widest">
        <div className="flex items-center gap-2 text-zinc-600">
          <div className="w-3 h-3 rounded-md bg-zinc-900 border border-zinc-800" />
          Livre
        </div>
        <div className="flex items-center gap-2 text-blue-500">
          <div className="w-3 h-3 rounded-md bg-blue-600" />
          Selecionado
        </div>
        <div className="flex items-center gap-2 text-zinc-800">
          <div className="w-3 h-3 rounded-md bg-zinc-800" />
          Ocupado
        </div>
      </div>
    </div>
  );
}

function Seat({ num, isOccupied, isSelected, onClick }: { num: number; isOccupied: boolean; isSelected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={isOccupied}
      className={cn(
        "w-full max-w-[60px] h-14 rounded-xl flex flex-col items-center justify-center transition-all relative group border-2",
        isOccupied 
          ? "bg-zinc-900/50 border-zinc-900 text-zinc-800 cursor-not-allowed" 
          : isSelected
            ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-110 z-10"
            : "bg-[#111111] border-zinc-800 text-zinc-500 hover:border-zinc-700 active:scale-95"
      )}
    >
      <span className="text-xs font-black">{num}</span>
      {isSelected && <Check className="w-3 h-3 absolute -top-1 -right-1 bg-white text-blue-600 rounded-full p-0.5" />}
      {isOccupied && <User className="w-3 h-3 mt-1 opacity-20" />}
    </button>
  );
}
