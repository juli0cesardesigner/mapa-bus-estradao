# Spec: Fast Import & Relaxed Validation (Modo Rápido)

**Data:** 2026-04-30  
**Status:** Approved  
**Autor:** Antigravity

## 1. Objetivo
Acelerar o processo de criação de viagens permitindo que o usuário apenas cole uma lista de passageiros ou suba um arquivo TXT simples, sem a necessidade de cadastrar manualmente os locais de embarque antecipadamente.

## 2. Mudanças de UX/UI

### 2.1. ImportForm.tsx
- Adicionar um componente `textarea` para entrada de texto em massa (Ctrl+V).
- Expandir o `input[type="file"]` para aceitar `.txt`.
- Remover a validação `if (boardingLocations.length === 0)` que exibe o alerta impeditivo.
- Adicionar um estado visual para mostrar quantos passageiros foram detectados no texto colado/carregado.

## 3. Lógica de Negócio (Parsing)

### 3.1. Novo Utilitário `parseText`
Um novo parser em `utils/csv-parser.ts` (ou novo arquivo) com as seguintes regras:
1. **Quebra de Linha:** Tratar cada linha como um passageiro.
2. **Regex de Extração:** 
   - `Assento`: Opcional. Detectar se a linha começa com dígitos seguidos de um separador (ex: `01 -`, `1.`, `42 `).
   - `Nome`: Obrigatório. O texto restante após o assento.
   - `Localidade`: Opcional. Detectar após um separador final (ex: `- CIDADE`, `; CIDADE`).
3. **Fallback de Localidade:** Se não for detectada, atribuir "GERAL".
4. **Cores:** Gerar cores automaticamente para todas as localidades encontradas (incluindo as detectadas dinamicamente no texto).

## 4. Integração com useData.ts
- O `createTrip` já suporta `boardingLocations` vazios, mas o `ImportForm` passará a lista de localidades únicas extraídas do texto colado para garantir que os filtros funcionem.

## 5. Critérios de Aceitação
- Usuário pode colar `1 - João - Centro` e `Maria - Centro` e o sistema criar 2 passageiros.
- Usuário pode criar viagem sem adicionar nenhum local no campo de tags manual.
- O sistema não deve travar o envio se houver apenas o título e o texto colado.
