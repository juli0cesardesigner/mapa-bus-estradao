# Spec: Mini-App de Controle de Embarque (Bus Boarding Control)

**Data:** 2026-04-17  
**Status:** Draft  
**Autor:** Antigravity

## 1. Visão Geral
Um sistema simplificado onde um administrador importa uma planilha de passageiros e gera um link compartilhavel para controladores em campo. O app permite o registro de embarque manual através de uma lista ou de um mapa visual do ônibus, com sincronização em tempo real entre dispositivos.

## 2. Arquitetura e Tecnologias
- **Frontend/Backend:** Next.js (App Router) na Vercel.
- **Banco de Dados:** Supabase (PostgreSQL).
- **Tempo Real:** Supabase Realtime (Cdc/Broadcast) para sincronização da lista.
- **Autenticação:** Supabase Auth (apenas para o painel de administração).
- **Estilização:** Tailwind CSS (Mobile-first).

## 3. Modelo de Dados

### Tabela `viagens` (Trips)
| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Identificador interno. |
| `slug` | UUID | Usado na URL pública (ex: `/embarque/[slug]`). |
| `titulo` | String | Nome da viagem (ex: Excursão Lapinha). |
| `created_at` | Timestamp | Data de criação. |
| `admin_id` | UUID | Referência ao usuário que criou a viagem. |

### Tabela `passageiros` (Passengers)
| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Identificador interno. |
| `viagem_id` | UUID (FK) | Referência à tabela viagens. |
| `nome` | String | Nome do passageiro. |
| `assento` | Integer | Número do assento (1 a N). |
| `localidade` | String | Local de embarque (usado para filtros e cores). |
| `cor_hex` | String | Cor gerada automaticamente para a localidade. |
| `embarcado` | Boolean | Status do embarque (Default: false). |
| `updated_at` | Timestamp | Atualizado sempre que o status muda. |

## 4. Funcionalidades Principais

### 4.1. Painel do Administrador (Privado)
- **Login:** Autenticação via Supabase.
- **Upload de CSV:**
    - Parse do arquivo (Nome, Assento, Localidade).
    - Atribuição automática de cores para cada localidade única.
- **Gestão de Links:** Gerar link público e botão para resetar status.

### 4.2. Página de Embarque (Pública via Link)
- **Modo Lista:**
    - Barra de busca por nome.
    - Filtro por localidade (Chips coloridos).
    - Clique no card alterna `embarcado` (Sim/Não).
- **Modo Mapa (Ônibus):**
    - Grid visual representando o ônibus.
    - Layout: Assento - Assento | Corredor | Assento - Assento.
    - Assentos identificados por número e cor da localidade.
    - Interação visual: Assentos embarcados ficam desbotados (Checkmark).

## 5. Fluxo de Usuário
1. Admin carrega planilha `viagem.csv`.
2. App salva passageiros e define cores (ex: "Centro" = Azul, "Dutra" = Laranja).
3. Admin envia o link `mapabus.vercel.app/check/[slug]` para o controlador.
4. Controlador abre no celular, filtra pela localidade do ponto atual.
5. Controlador marca passageiros conforme entram.
6. Painel do Admin mostra o progresso total (ex: 20/46 embarcados).

## 6. Considerações de UX/UI
- **Feedback Tátil:** Vibração leve ao marcar embarque (se suportado pelo browser).
- **Modo Escuro:** Design premium com cores vibrantes para status e localidades.
- **Performance:** Uso de `Optimistic Updates` no React para que o clique pareça instantâneo antes mesmo do DB confirmar.

## 7. Critérios de Sucesso
- Importação de planilha de 50 pessoas em menos de 5 segundos.
- Atualização em tempo real entre dois celulares diferentes em menos de 1 segundo.
- Mapa de ônibus intuitivo que corresponda à numeração da planilha.
