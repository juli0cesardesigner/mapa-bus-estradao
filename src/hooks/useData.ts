'use client';

import React from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { generateLocationColors } from '@/utils/csv-parser';

export function useData() {
  const [mode, setMode] = React.useState<'supabase' | 'demo'>('demo');

  React.useEffect(() => {
    if (isSupabaseConfigured) {
      setMode('supabase');
    } else {
      console.warn('Supabase não configurado. Entrando em Modo Simulação (LocalStorage).');
    }
  }, []);

  const getTrips = async () => {
    if (mode === 'supabase') {
      const { data } = await supabase
        .from('viagens')
        .select('*, passageiros(count)')
        .order('created_at', { ascending: false });
      return data || [];
    } else {
      const demoTrips = JSON.parse(localStorage.getItem('demo_trips') || '[]');
      return demoTrips;
    }
  };

  const createTrip = async (title: string, passengers: any[]) => {
    const tripId = crypto.randomUUID();
    
    // Função para gerar slug amigável
    const slugify = (text: string) => {
      return text
        .toString()
        .toLowerCase()
        .trim()
        .normalize('NFD') // Remove acentos
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    };

    const slug = slugify(title);
    
    // Encontrar todas as localidades únicas
    const uniqueLocations = Array.from(new Set(passengers.map(p => p.localidade || 'Geral')));
    
    // Gerar mapa de cores usando a utilidade (garantindo cores diferentes)
    const colorMap = generateLocationColors(uniqueLocations);
    
    // Atribuir cores aos passageiros
    const passengersWithColors = passengers.map(p => {
      const loc = p.localidade || 'Geral';
      return {
        ...p,
        localidade: loc,
        cor_hex: colorMap[loc] || '#3B82F6',
        id: p.id || crypto.randomUUID()
      };
    });

    if (mode === 'supabase') {
      const { data: trip } = await supabase
        .from('viagens')
        .insert([{ id: tripId, slug, titulo: title }])
        .select()
        .single();
      
      const passengersWithTrip = passengersWithColors.map(p => ({ ...p, viagem_id: trip.id }));
      await supabase.from('passageiros').insert(passengersWithTrip);
      return trip;
    } else {
      const newTrip = {
        id: tripId,
        slug,
        titulo: title,
        created_at: new Date().toISOString(),
        passageiros: [{ count: passengers.length }]
      };
      
      const currentTrips = JSON.parse(localStorage.getItem('demo_trips') || '[]');
      localStorage.setItem('demo_trips', JSON.stringify([newTrip, ...currentTrips]));
      localStorage.setItem(`demo_passengers_${slug}`, JSON.stringify(passengersWithColors));
      return newTrip;
    }
  };

  const getBoardingData = async (slug: string) => {
    if (mode === 'supabase') {
      const { data: trip } = await supabase.from('viagens').select('*').eq('slug', slug).single();
      if (!trip) return { trip: null, passengers: [] };
      const { data: passengers } = await supabase.from('passageiros').select('*').eq('viagem_id', trip.id).order('assento', { ascending: true });
      return { trip, passengers: passengers || [] };
    } else {
      const trips = JSON.parse(localStorage.getItem('demo_trips') || '[]');
      const trip = trips.find((t: any) => t.slug === slug);
      const passengers = JSON.parse(localStorage.getItem(`demo_passengers_${slug}`) || '[]');
      return { trip, passengers };
    }
  };

  const updatePassenger = async (slug: string, id: string, status: boolean) => {
    if (mode === 'supabase') {
      await supabase.from('passageiros').update({ embarcado: status }).eq('id', id);
    } else {
      const passengers = JSON.parse(localStorage.getItem(`demo_passengers_${slug}`) || '[]');
      const updated = passengers.map((p: any) => p.id === id ? { ...p, embarcado: status } : p);
      localStorage.setItem(`demo_passengers_${slug}`, JSON.stringify(updated));
    }
  };

  const upsertPassenger = async (slug: string, passenger: any) => {
    // Garantir cor se for um novo local
    let passengerToSave = { 
      ...passenger,
      nome: passenger.nome.toUpperCase().trim(),
      localidade: passenger.localidade.toUpperCase().trim()
    };
    
    if (!passenger.cor_hex) {
      const { passengers } = await getBoardingData(slug);
      const locations = Array.from(new Set([...passengers.map((p: any) => (p.localidade || '').toUpperCase().trim()), passengerToSave.localidade]));
      const colors = generateLocationColors(locations);
      passengerToSave.cor_hex = colors[passengerToSave.localidade] || '#3B82F6';
    }

    if (mode === 'supabase') {
      if (passenger.id) {
        // Update
        const { error } = await supabase.from('passageiros').update(passengerToSave).eq('id', passenger.id);
        if (error) throw error;
      } else {
        // Insert
        const { data: trip } = await supabase.from('viagens').select('id').eq('slug', slug).single();
        if (!trip) throw new Error('Viagem não encontrada');
        const { error } = await supabase.from('passageiros').insert([{ ...passengerToSave, viagem_id: trip.id }]);
        if (error) throw error;
      }
    } else {
      const passengers = JSON.parse(localStorage.getItem(`demo_passengers_${slug}`) || '[]');
      let updated;
      if (passenger.id) {
        updated = passengers.map((p: any) => p.id === passenger.id ? { ...p, ...passengerToSave } : p);
      } else {
        updated = [...passengers, { ...passengerToSave, id: crypto.randomUUID(), embarcado: false }];
      }
      localStorage.setItem(`demo_passengers_${slug}`, JSON.stringify(updated));
    }
  };

  const deletePassenger = async (slug: string, id: string) => {
    if (mode === 'supabase') {
      const { error } = await supabase.from('passageiros').delete().eq('id', id);
      if (error) throw error;
    } else {
      const passengers = JSON.parse(localStorage.getItem(`demo_passengers_${slug}`) || '[]');
      const filtered = passengers.filter((p: any) => p.id !== id);
      localStorage.setItem(`demo_passengers_${slug}`, JSON.stringify(filtered));
    }
  };

  const deleteTrip = async (id: string, slug: string) => {
    if (mode === 'supabase') {
      const { error } = await supabase.from('viagens').delete().eq('id', id);
      if (error) throw error;
    } else {
      const trips = JSON.parse(localStorage.getItem('demo_trips') || '[]');
      const updatedTrips = trips.filter((t: any) => t.id !== id);
      localStorage.setItem('demo_trips', JSON.stringify(updatedTrips));
      localStorage.removeItem(`demo_passengers_${slug}`);
    }
  };

  return { 
    mode, 
    getTrips, 
    getBoardingData, 
    updatePassenger, 
    createTrip, 
    upsertPassenger, 
    deletePassenger,
    deleteTrip
  };
}
