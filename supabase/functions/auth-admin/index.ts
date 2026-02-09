import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';
import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, username, password } = await req.json();
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (action === 'login') {
      // Verify admin credentials
      const { data: admin, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !admin) {
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify password (using bcrypt)
      const validPassword = await bcrypt.compare(password, admin.password_hash);
      
      if (!validPassword) {
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Return admin data (without password hash)
      return new Response(
        JSON.stringify({
          admin: {
            id: admin.id,
            username: admin.username,
            name: admin.name
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'register') {
      // Hash password
      const passwordHash = await bcrypt.hash(password);

      // Create new admin
      const { data: newAdmin, error } = await supabase
        .from('admin_users')
        .insert([{
          username,
          password_hash: passwordHash,
          name: username
        }])
        .select()
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message || 'Registration failed' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          admin: {
            id: newAdmin.id,
            username: newAdmin.username,
            name: newAdmin.name
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Admin Auth Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Authentication failed' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
