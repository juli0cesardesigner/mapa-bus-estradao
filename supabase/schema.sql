-- Tabela de Viagens
CREATE TABLE viagens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE,
  titulo TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  admin_id UUID REFERENCES auth.users(id)
);

-- Tabela de Passageiros
CREATE TABLE passageiros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  viagem_id UUID REFERENCES viagens(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  assento INTEGER NOT NULL,
  localidade TEXT NOT NULL,
  cor_hex TEXT NOT NULL,
  embarcado BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Realtime para a tabela de passageiros
ALTER PUBLICATION supabase_realtime ADD TABLE passageiros;

-- RLS (Row Level Security) - Desabilitado para facilitar o controle público via link
-- Em produção, o ideal é usar o slug como chave de acesso.
ALTER TABLE viagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE passageiros ENABLE ROW LEVEL SECURITY;

-- Política simples: Todos podem ver passageiros se souberem o ID da viagem
CREATE POLICY "Acesso público via ID da viagem" ON passageiros
  FOR ALL TO public
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE POLICY "Acesso público às viagens" ON viagens
  FOR ALL TO public
  USING (TRUE)
  WITH CHECK (TRUE);
