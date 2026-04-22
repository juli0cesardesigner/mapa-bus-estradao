# Spec: Sistema de Reserva de Assentos pelo Cliente

## 1. Visão Geral
Adicionar uma funcionalidade ao sistema "MAPA BUS" que permita que o próprio passageiro escolha seu assento e realize seu cadastro via um link público. O foco principal é a validação rigorosa do local de embarque e a captura de dados de identificação (Telefone e CPF).

## 2. Requisitos do Sistema

### 2.1. Funcionalidades do Cliente
- **Visualização do Mapa**: Mapa interativo do ônibus mostrando assentos livres e ocupados.
- **Seleção de Assento**: Clique para selecionar um assento disponível.
- **Cadastro**: Formulário com Nome, Telefone (máscara), CPF (máscara) e Localidade de Embarque.
- **Validação de Embarque**: Escolha obrigatória de localidade a partir de uma lista pré-definida pelo Admin.
- **Confirmação Visual**: Modal de confirmação gigante com resumo da reserva antes da finalização.

### 2.2. Funcionalidades do Admin
- **Configuração de Viagem**: Campo para definir a lista de locais de embarque permitidos.
- **Gestão de Capacidade**: Definir o número total de assentos do ônibus.
- **Acompanhamento**: Visualizar os novos dados (Telefone, CPF, Local) na lista de embarque em tempo real.

## 3. Arquitetura Técnica

### 3.1. Banco de Dados (Supabase)
- **Tabela `viagens`**:
    - Adicionar `locais_embarque` (JSONB) - Armazena array de strings com os nomes dos locais.
    - Adicionar `capacidade` (INTEGER) - Padrão 46.
- **Tabela `passageiros`**:
    - Adicionar `telefone` (TEXT).
    - Adicionar `cpf` (TEXT).
    - *Nota*: Manter Realtime ativo para refletir reservas instantaneamente.

### 3.2. Rotas
- `/[slug]/reservar`: Página pública para o cliente.

### 3.3. Componentes UI
- `SeatMap`: Renderização visual do ônibus.
- `ReservationForm`: Formulário com validação Zod e máscaras.
- `LocationPicker`: Seletor estilizado para "zero margem de dúvidas".

## 4. Fluxo do Usuário (Cliente)
1. Acessa `/[slug]/reservar`.
2. Seleciona um assento livre no mapa.
3. Preenche Nome, Telefone e CPF.
4. Seleciona o Local de Embarque no dropdown.
5. Visualiza confirmação em tela cheia com dados destacados.
6. Clica em "Confirmar Reserva".
7. Recebe mensagem de sucesso e o assento é bloqueado no sistema.

## 5. Plano de Implementação (Resumo)
1. **Fase 1**: Atualização do Schema SQL no Supabase.
2. **Fase 2**: Atualização do hook `useData.ts` para suportar os novos campos e consultas.
3. **Fase 3**: Criação da nova rota e componentes de interface do cliente.
4. **Fase 4**: Atualização do painel administrativo para configuração de locais e visualização dos dados.
