import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const { action, phone, password, name, email } = await req.json();

    if (action === 'register') {
      // Hash password (simple hash for demo - use bcrypt in production)
      const passwordHash = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(password + 'SIKKOLU_SALT')
      );
      const passwordHashHex = Array.from(new Uint8Array(passwordHash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Check if phone already exists
      const { data: existing } = await supabaseAdmin
        .from('customers')
        .select('id')
        .eq('phone', phone)
        .single();

      if (existing) {
        return new Response(
          JSON.stringify({ error: 'Phone number already registered' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create customer
      const { data: customer, error } = await supabaseAdmin
        .from('customers')
        .insert([{ phone, password_hash: passwordHashHex, name, email }])
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, customer: { id: customer.id, phone: customer.phone, name: customer.name } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'login') {
      // Hash provided password
      const passwordHash = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(password + 'SIKKOLU_SALT')
      );
      const passwordHashHex = Array.from(new Uint8Array(passwordHash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Find customer
      const { data: customer, error } = await supabaseAdmin
        .from('customers')
        .select('*')
        .eq('phone', phone)
        .eq('password_hash', passwordHashHex)
        .single();

      if (error || !customer) {
        return new Response(
          JSON.stringify({ error: 'Invalid phone or password' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, customer: { id: customer.id, phone: customer.phone, name: customer.name, email: customer.email } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error: any) {
    console.error('Auth Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Authentication failed' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
