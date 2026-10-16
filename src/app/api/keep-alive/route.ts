import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Executa uma query leve no banco para gerar atividade e impedir pausa
  const { data, error } = await supabase
    .from('viagens')
    .select('id')
    .limit(1);

  if (error) {
    return NextResponse.json({ 
      status: 'error', 
      message: error.message,
      timestamp: new Date().toISOString() 
    }, { status: 500 });
  }

  return NextResponse.json({ 
    status: 'ok', 
    message: 'Supabase acordado com sucesso!',
    timestamp: new Date().toISOString() 
  });
}
