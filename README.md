# MAPA BUS - Controle de Embarque

Um mini-app Next.js para controle prático de embarque de passageiros em ônibus, com sincronização em tempo real e visualização em mapa de assentos.

## 🚀 Como usar

1.  **Configuração do Supabase:**
    - Crie um projeto no [Supabase](https://supabase.com/).
    - Execute o script SQL localizado em `supabase/schema.sql` no Editor SQL do seu projeto.
    - Habilite o Realtime para a tabela `passageiros` (já incluído no script).
2.  **Variáveis de Ambiente:**
    - Renomeie `.env.example` para `.env.local`.
    - Preencha com sua `URL` e `ANON_KEY` do Supabase.
3.  **Execução:**
    - Instale as dependências: `npm install`
    - Rode o projeto: `npm run dev`
4.  **Fluxo:**
    - Acesse `/admin`.
    - Defina um título e suba seu arquivo `passageiros.csv`.
    - Formato do CSV esperado: `nome, assento, localidade`.
    - Compartilhe o link gerado com o controlador.

## ✨ Funcionalidades

- **Dashboard Admin:** Criação de viagens via planilha.
- **Link Público:** Acesso rápido sem necessidade de login para os controladores (via UUID seguro).
- **Mapa de Assentos:** Visualização 2D do ônibus (2-Corredor-2) com cores por localidade.
- **Filtros Inteligentes:** Busque passageiros por nome ou filtre por ponto de embarque.
- **Sincronização Realtime:** Vários aparelhos podem controlar o mesmo embarque simultaneamente.

## 🛠 Tech Stack

- Next.js 14
- Supabase (Database & Realtime)
- Tailwind CSS
- Lucide React (Ícones)
- Papaparse (CSV Parsing)
