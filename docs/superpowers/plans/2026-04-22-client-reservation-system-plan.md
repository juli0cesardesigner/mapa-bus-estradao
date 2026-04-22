# Plano de Implementação: Sistema de Reserva pelo Cliente

Este plano detalha os passos para implementar a funcionalidade de reserva de assentos por parte do cliente no sistema MAPA BUS.

## Passo 1: Atualização do Banco de Dados (Supabase)
- [ ] Executar migration para adicionar `locais_embarque` e `capacidade` na tabela `viagens`.
- [ ] Executar migration para adicionar `telefone` e `cpf` na tabela `passageiros`.
- [ ] Adicionar constraint UNIQUE composta `(viagem_id, assento)` na tabela `passageiros` para evitar reserva dupla.

## Passo 2: Atualização do Hook de Dados (`useData.ts`)
- [ ] Atualizar `createTrip` para suportar `locais_embarque` e `capacidade`.
- [ ] Atualizar `getBoardingData` para retornar os novos campos dos passageiros.
- [ ] Criar função `reserveSeat` para o cliente (com validações de campos).

## Passo 3: Painel Administrativo (`/admin`)
- [ ] Atualizar formulário de criação de viagem para incluir input de múltiplos locais de embarque.
- [ ] Atualizar a tabela de passageiros para exibir colunas de Telefone, CPF e Local de Embarque.
- [ ] Adicionar botão para copiar "Link de Reserva".

## Passo 4: Interface do Cliente (`/[slug]/reservar`)
- [ ] Criar a nova página e layout responsivo.
- [ ] Implementar o componente `SeatPicker` visual.
- [ ] Implementar o formulário de cadastro com máscaras (react-text-mask ou similar).
- [ ] Implementar o seletor de localidade de embarque com destaque visual.
- [ ] Criar modal de confirmação final.

## Passo 5: Testes e Validação
- [ ] Testar reserva simultânea (concorrência).
- [ ] Validar formato de CPF e Telefone.
- [ ] Verificar sincronização Realtime entre Admin e Cliente.
