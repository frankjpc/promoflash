import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Cargar .env.local manualmente para este test de Node
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
for (const k in envConfig) {
  process.env[k] = envConfig[k];
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Probando conexión a Supabase...');
  console.log('URL configurada:', supabaseUrl);
  
  try {
    // Intentamos consultar la tabla stores (debería devolver un array vacío o datos si hay, pero sin error)
    const { data, error } = await supabase.from('stores').select('*').limit(1);
    
    if (error) {
      console.error('❌ Error de conexión o permisos:', error.message);
    } else {
      console.log('✅ Conexión a la BD exitosa. Tabla "stores" responde correctamente.');
      console.log('Datos recibidos:', data);
    }
  } catch (err) {
    console.error('❌ Error inesperado:', err);
  }
}

testConnection();
