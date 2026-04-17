# Plano de Implementação: Mini-App de Controle de Embarque

Este plano detalha os passos para construir o sistema de boarding control usando Next.js, Supabase e Tailwind CSS.

## Fase 1: Setup e Infraestrutura
### Etapa 1.1: Inicialização do Projeto
- [ ] Criar projeto Next.js: `npx create-next-app@latest . --typescript --tailwind --eslint`.
- [ ] Instalar dependências do Supabase: `@supabase/supabase-js`, `@supabase/auth-helpers-nextjs`.
- [ ] Instalar bibliotecas auxiliares: `lucide-react` (ícones), `papaparse` (CSV), `clsx`, `tailwind-merge`.

### Etapa 1.2: Configuração do Supabase
- [ ] Criar projeto no Supabase Console.
- [ ] Executar script SQL para criar as tabelas `viagens` e `passageiros` (incluindo RLS - Row Level Security).
- [ ] Habilitar **Realtime** nas tabelas para permitir a sincronização instantânea.
- [ ] Configurar variáveis de ambiente no `.env.local`.

## Fase 2: Backend e Lógica de Dados
### Etapa 2.1: Sistema de Importação (CSV)
- [ ] Criar utilitário de parse de CSV com `papaparse`.
- [ ] Implementar lógica para gerar cores hexadecimais aleatórias (ou de uma paleta fixa) para cada `localidade` única.
- [ ] Criar rota de API para salvar os dados da viagem e passageiros em lote (bulk insert).

### Etapa 2.2: Autenticação Administrativa
- [ ] Configurar middleware do Supabase para proteger as rotas `/admin`.
- [ ] Criar página de Login simples.

## Fase 3: Frontend - Painel do Administrador
### Etapa 3.1: Dashboard de Viagens
- [ ] Listagem de viagens ativas.
- [ ] Modal de "Nova Viagem" com upload de arquivo.
- [ ] Visualização simplificada de estatísticas por viagem.

## Fase 4: Frontend - Página de Embarque (Pública)
### Etapa 4.1: Interface da Lista
- [ ] Renderizar lista de passageiros.
- [ ] Implementar busca por nome (client-side).
- [ ] Implementar filtro por localidade (Chips coloridos).
- [ ] Conectar ao canal de Realtime do Supabase para ouvir mudanças no status `embarcado`.

### Etapa 4.2: Mapa Visual do Ônibus
- [ ] Criar componente `BusMap` que renderiza a grade 2-Aisle-2.
- [ ] Mapear os assentos (1-44+) para as posições na grade.
- [ ] Adicionar estados visuais: ocupado (cor da localidade), embarcado (check mark/fade).

## Fase 5: Polimento e Deploy
### Etapa 5.1: UX e Feedback
- [ ] Adicionar animações de transição suave com `framer-motion` (opcional).
- [ ] Feedback visual instantâneo ao clicar em um passageiro (Optimistic UI).
- [ ] Validação de erro caso o CSV esteja mal formatado.

### Etapa 5.2: Deploy
- [ ] Deploy na Vercel.
- [ ] Teste final com 2 celulares simulando embarque simultâneo.
