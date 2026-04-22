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
    if (isSupabaseConfigured) {
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

  const createTrip = async (title: string, passengers: any[], boardingLocations: string[] = [], capacity: number = 46) => {
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

    if (isSupabaseConfigured) {
      const { data: trip, error: tripError } = await supabase
        .from('viagens')
        .insert([{ 
          id: tripId, 
          slug, 
          titulo: title, 
          locais_embarque: boardingLocations,
          capacidade: capacity 
        }])
        .select()
        .single();
      
      if (tripError) {
        console.error('Erro ao criar viagem:', tripError);
        throw tripError;
      }

      if (!trip) throw new Error('Falha ao obter dados da viagem criada');

      const passengersWithTrip = passengersWithColors.map(p => ({ ...p, viagem_id: trip.id }));
      const { error: passError } = await supabase.from('passageiros').insert(passengersWithTrip);
      
      if (passError) {
        console.error('Erro ao inserir passageiros:', passError);
        // Tentar limpar a viagem se os passageiros falharem
        await supabase.from('viagens').delete().eq('id', trip.id);
        throw passError;
      }

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
    const cleanSlug = slug.trim().toLowerCase();
    
    if (isSupabaseConfigured) {
      try {
        const { data: trip, error: tripError } = await supabase
          .from('viagens')
          .select('*')
          .eq('slug', cleanSlug)
          .maybeSingle();

        if (tripError) {
          console.error('Erro Supabase (viagem):', tripError);
          return { trip: null, passengers: [] };
        }

        if (!trip) {
          console.warn('Nenhuma viagem encontrada para o slug:', cleanSlug);
          return { trip: null, passengers: [] };
        }

        const { data: passengers, error: passError } = await supabase
          .from('passageiros')
          .select('*')
          .eq('viagem_id', trip.id)
          .order('assento', { ascending: true });

        if (passError) {
          console.error('Erro Supabase (passageiros):', passError);
        }

        return { 
          trip, 
          passengers: passengers || [],
          boardingLocations: trip.locais_embarque || [],
          capacity: trip.capacidade || 46
        };
      } catch (err) {
        console.error('Erro fatal em getBoardingData:', err);
        return { trip: null, passengers: [] };
      }
    } else {
      const trips = JSON.parse(localStorage.getItem('demo_trips') || '[]');
      const trip = trips.find((t: any) => t.slug === cleanSlug);
      const passengers = JSON.parse(localStorage.getItem(`demo_passengers_${cleanSlug}`) || '[]');
      return { trip, passengers };
    }
  };

  const updatePassenger = async (slug: string, id: string, status: boolean) => {
    if (isSupabaseConfigured) {
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

    // Adicionar campos extras se existirem
    if (passenger.telefone) passengerToSave.telefone = passenger.telefone;
    if (passenger.cpf) passengerToSave.cpf = passenger.cpf;

    if (isSupabaseConfigured) {
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
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('passageiros').delete().eq('id', id);
      if (error) throw error;
    } else {
      const passengers = JSON.parse(localStorage.getItem(`demo_passengers_${slug}`) || '[]');
      const filtered = passengers.filter((p: any) => p.id !== id);
      localStorage.setItem(`demo_passengers_${slug}`, JSON.stringify(filtered));
    }
  };

  const deleteTrip = async (id: string, slug: string) => {
    if (isSupabaseConfigured) {
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
    deleteTrip,
    reserveSeat: async (slug: string, passenger: any) => {
      if (!isSupabaseConfigured) throw new Error('Supabase não configurado');
      
      // 1. Validar se o assento já está ocupado
      const { data: trip } = await supabase.from('viagens').select('id').eq('slug', slug).single();
      if (!trip) throw new Error('Viagem não encontrada');

      const { data: existing } = await supabase
        .from('passageiros')
        .select('id')
        .eq('viagem_id', trip.id)
        .eq('assento', passenger.assento)
        .single();

      if (existing) throw new Error('Este assento já foi reservado por outra pessoa.');

      // 2. Tentar inserir (a constraint unique_viagem_assento garante no banco)
      const passengerToSave = {
        ...passenger,
        viagem_id: trip.id,
        nome: passenger.nome.toUpperCase().trim(),
        localidade: passenger.localidade.toUpperCase().trim(),
        embarcado: false
      };

      // Gerar cor para o local
      const { passengers } = await getBoardingData(slug);
      const locations = Array.from(new Set([...passengers.map((p: any) => (p.localidade || '').toUpperCase().trim()), passengerToSave.localidade]));
      const colors = generateLocationColors(locations);
      passengerToSave.cor_hex = colors[passengerToSave.localidade] || '#3B82F6';

      const { error } = await supabase.from('passageiros').insert([passengerToSave]);
      if (error) {
        if (error.code === '23505') throw new Error('Este assento acabou de ser ocupado. Por favor, escolha outro.');
        throw error;
      }
    }
  };
}
