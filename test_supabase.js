import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey ? '***' + supabaseAnonKey.slice(-4) : 'missing');

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    try {
        console.log('Testing connection...');
        const { data, error } = await supabase
            .from('magic_link_users')
            .select('count')
            .limit(1);

        if (error) {
            console.error('Supabase error:', error);
        } else {
            console.log('Connection successful, data:', data);
        }
    } catch (err) {
        console.error('Network error:', err.message);
    }
}

testConnection();