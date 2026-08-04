import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === "AQUI_TU_SUPABASE_URL") {
  console.warn(
    "Faltan las credenciales de Supabase. Asegúrate de configurar el archivo .env.local con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY."
  );
}

// Creamos un único cliente global (Singleton) para reutilizar la conexión en toda la app
export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');
