'use client';

import React from 'react';
import { useData } from '@/hooks/useData';
import { isSupabaseConfigured } from '@/lib/supabase';
import { ImportForm } from '@/components/ImportForm';
import { EditTripModal } from '@/components/EditTripModal';
import { ClipboardCopy, ExternalLink, Info, Trash2, Settings2 } from 'lucide-react';

export default function AdminPage() {
  const [trips, setTrips] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [editingTrip, setEditingTrip] = React.useState<any>(null);
  const dataLayer = useData();

  React.useEffect(() => {
    fetchTrips();
  }, [dataLayer.mode]);

  const fetchTrips = async () => {
    setIsLoading(true);
    const data = await dataLayer.getTrips();
    setTrips(data);
    setIsLoading(false);
  };

  const handleImport = async (title: string, passengers: any[], boardingLocations: string[], capacity: number) => {
    try {
      await dataLayer.createTrip(title, passengers, boardingLocations, capacity);
      fetchTrips();
    } catch (error: any) {
      console.error('Erro na criação:', error);
      alert('Erro ao criar viagem. Verifique se o nome já existe ou se há problemas de conexão.');
    }
  };

  const generateDemo = async () => {
    const demoData = [
      { assento: 1, nome: "Danieli Imberti", localidade: "LINHARES" },
      { assento: 2, nome: "Luciene Rodrigues da Penha", localidade: "LINHARES" },
      { assento: 3, nome: "Neucy Tavares da Silva", localidade: "SÃO MATEUS" },
      { assento: 4, nome: "Josiane laquine", localidade: "SÃO MATEUS" },
      { assento: 5, nome: "Mariane Severo Estevão", localidade: "SÃO MATEUS" },
      { assento: 6, nome: "Evilly Lara Perini Lacerda", localidade: "SÃO MATEUS" },
      { assento: 7, nome: "Maria Helena Barbosa Esteves", localidade: "SÃO MATEUS" },
      { assento: 8, nome: "Luana Esteves de Almeida", localidade: "SÃO MATEUS" },
      { assento: 9, nome: "Larissa Vitoraci", localidade: "SÃO MATEUS" },
      { assento: 10, nome: "Gabriel Yuri Silva Hakozaki", localidade: "SÃO MATEUS" },
      { assento: 11, nome: "Pollyana Quartezani D'Amorim", localidade: "SÃO MATEUS" },
      { assento: 12, nome: "Mariane Severo Estevão", localidade: "SÃO MATEUS" },
      { assento: 13, nome: "Giulia de Oliveira Pinheiro Bezerra", localidade: "SÃO MATEUS" },
      { assento: 14, nome: "Robson de Souza Bezerra", localidade: "SÃO MATEUS" },
      { assento: 15, nome: "Gabriel Yuri Silva Hakozaki", localidade: "SÃO MATEUS" },
      { assento: 16, nome: "Larissa Vitoraci", localidade: "SÃO MATEUS" },
      { assento: 17, nome: "Helena White Alves de Oliveira", localidade: "LINHARES" },
      { assento: 18, nome: "Patrini Reis de Oliveira", localidade: "LINHARES" },
      { assento: 19, nome: "Ramony Loureiro de Queiroz", localidade: "LINHARES" },
      { assento: 20, nome: "Daniel Himenes Manzoli", localidade: "LINHARES" },
      { assento: 21, nome: "Rafael Coimbra Moraes", localidade: "LINHARES" },
      { assento: 22, nome: "Yasmin Teixeira Rocha", localidade: "LINHARES" },
      { assento: 23, nome: "Amanda Alcantara Herzog", localidade: "LINHARES" },
      { assento: 24, nome: "Michelly Pfeifer de Oliveira Machado", localidade: "LINHARES" },
      { assento: 25, nome: "CRISLAINE BORCHARDT PEREIRA", localidade: "COLATINA" },
      { assento: 26, nome: "Isabel Borchardt Pereira", localidade: "COLATINA" },
      { assento: 27, nome: "Katia Ferreira Silva", localidade: "COLATINA" },
      { assento: 28, nome: "Marcia dos Santos de Abreu", localidade: "VENDA NOVA DO IMIGRANTE" },
      { assento: 29, nome: "Cleidiane Fernandes Martins", localidade: "COLATINA" },
      { assento: 30, nome: "Jenifer Coutinho Salvador", localidade: "COLATINA" },
      { assento: 31, nome: "Gabriel Juliao De Oliveira", localidade: "COLATINA" },
      { assento: 32, nome: "Bianca Forechi Ribeiro", localidade: "COLATINA" },
      { assento: 33, nome: "Leticia Abreu da Fonseca", localidade: "COLATINA" },
      { assento: 34, nome: "Bernardo da Silva Caldonho", localidade: "COLATINA" },
      { assento: 35, nome: "Thamirys Jhenifer Gonçalves Barbosa", localidade: "COLATINA" },
      { assento: 36, nome: "Thaina Wencionek Felicissimo", localidade: "COLATINA" },
      { assento: 37, nome: "Leandro Belatto", localidade: "COLATINA" },
      { assento: 38, nome: "José Lucas Lima", localidade: "COLATINA" },
      { assento: 39, nome: "Andrea Alves de Souza", localidade: "VITORIA" },
      { assento: 40, nome: "João Marcos Souza Hemerly", localidade: "VITORIA" },
      { assento: 41, nome: "Maria Eudaci Firmino Maia", localidade: "VITORIA" },
      { assento: 42, nome: "Andrea de Freitas Ferreira", localidade: "VITORIA" },
      { assento: 43, nome: "Fabricio Assi da Silva", localidade: "VITORIA" },
      { assento: 44, nome: "Raul Silva de Almeida", localidade: "VITORIA" },
      { assento: 51, nome: "Hillery Garcia de Oliveira", localidade: "COLATINA" },
      { assento: 52, nome: "Rennan Rodrigues Strelow", localidade: "COLATINA" },
      { assento: 53, nome: "Julio Cesar Pinto", localidade: "COLATINA" },
      { assento: 54, nome: "Hellen Ferreira", localidade: "COLATINA" },
      { assento: 55, nome: "Maxlon Araujo", localidade: "SÃO MATEUS" },
      { assento: 56, nome: "Alice de Araujo", localidade: "SÃO MATEUS" },
      { assento: 57, nome: "Paulo Lanes", localidade: "SÃO MATEUS" },
      { assento: 58, nome: "Filipe Gaspar", localidade: "SÃO MATEUS" },
      { assento: 59, nome: "Igor Del Orto", localidade: "COLATINA" },
      { assento: 60, nome: "Franciela Baggio", localidade: "SÃO MATEUS" },
      { assento: 61, nome: "Rodrigo de Souza", localidade: "COLATINA" },
      { assento: 62, nome: "Diego Martineli", localidade: "COLATINA" },
    ];
    const boardingLocations = Array.from(new Set(demoData.map(d => d.localidade)));
    await handleImport("LISTA REAL - CSV IMPORTADO", demoData, boardingLocations, 46);
  };

  const copyLink = (slug: string, type: 'map' | 'reserve' = 'map') => {
    const path = type === 'reserve' ? `${slug}/reservar` : slug;
    const link = `${window.location.origin}/${path}`;
    navigator.clipboard.writeText(link);
    alert(`${type === 'reserve' ? 'Link de Reserva' : 'Link do Mapa'} copiado!`);
  };

  const handleUpdateTrip = async (updates: any) => {
    if (!editingTrip) return;
    try {
      await dataLayer.updateTrip(editingTrip.id, updates);
      fetchTrips();
      setEditingTrip(null);
    } catch (error) {
      console.error('Erro ao atualizar viagem:', error);
      alert('Erro ao atualizar parâmetros da viagem.');
    }
  };

  const handleDeleteTrip = async (id: string, slug: string) => {
    if (confirm('ATENÇÃO: Isso excluirá permanentEMENTE esta viagem e todos os dados de passageiros. Continuar?')) {
      try {
        await dataLayer.deleteTrip(id, slug);
        fetchTrips();
      } catch (error) {
        console.error('Erro ao excluir viagem:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {!isSupabaseConfigured && (
        <div className="max-w-6xl mx-auto mb-8 bg-amber-500/10 border border-amber-500/50 rounded-2xl p-4 flex items-center gap-3 text-amber-500">
          <Info className="w-5 h-5" />
          <p className="text-sm font-medium">
            <strong>Modo Simulação Ativo:</strong> As chaves do Supabase não foram encontradas. Os dados serão salvos localmente no seu navegador.
          </p>
        </div>
      )}

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Coluna de Importação */}
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
            Nova Viagem
          </h2>
          <ImportForm onImport={handleImport} />
          
          {!isSupabaseConfigured && (
            <button 
              onClick={generateDemo}
              className="w-full mt-4 bg-zinc-900 border border-zinc-800 text-zinc-400 py-3 rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all"
            >
              Gerar Dados de Exemplo
            </button>
          )}
        </div>

        {/* Coluna de Listagem */}
        <div className="lg:col-span-2 space-y-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
            Viagens Ativas
          </h2>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : trips.length === 0 ? (
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-20 text-center">
              <p className="text-zinc-500">Nenhuma viagem encontrada. Comece importando uma lista!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trips.map((trip) => (
                <div key={trip.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-zinc-700 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg group-hover:text-blue-400 transition-colors">{trip.titulo}</h3>
                      <p className="text-xs text-zinc-500">{new Date(trip.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setEditingTrip(trip)}
                        className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                        title="Editar Parâmetros"
                      >
                        <Settings2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteTrip(trip.id, trip.slug)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                        title="Excluir Viagem"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="bg-zinc-950 px-3 py-1 rounded-full border border-zinc-800 text-[10px] font-bold text-zinc-400">
                        {trip.passageiros[0].count} PASSAGEIROS
                      </div>
                    </div>
                  </div>

                   <div className="flex flex-col gap-2 mt-auto">
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyLink(trip.slug, 'map')}
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-[10px] font-bold hover:bg-zinc-800 flex items-center justify-center gap-2 transition-all"
                      >
                        <ClipboardCopy className="w-3 h-3 text-zinc-500" />
                        LINK MAPA
                      </button>
                      <button
                        onClick={() => copyLink(trip.slug, 'reserve')}
                        className="flex-1 bg-blue-600/10 border border-blue-600/30 text-blue-400 rounded-xl px-3 py-2 text-[10px] font-bold hover:bg-blue-600/20 flex items-center justify-center gap-2 transition-all"
                      >
                        <ClipboardCopy className="w-3 h-3" />
                        LINK RESERVA
                      </button>
                    </div>
                    <a
                      href={`/${trip.slug}`}
                      target="_blank"
                      className="w-full bg-blue-600 rounded-xl px-3 py-2 text-xs font-bold hover:bg-blue-500 flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)]"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      ABRIR PAINEL DE EMBARQUE
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {editingTrip && (
        <EditTripModal 
          trip={editingTrip}
          onClose={() => setEditingTrip(null)}
          onSave={handleUpdateTrip}
        />
      )}
    </div>
  );
}
