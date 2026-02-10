import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

// Simple password hashing using Web Crypto API
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, phone, password, name, email } = await req.json();
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (action === 'register') {
      // Check if customer already exists
      const { data: existing } = await supabase
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

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create new customer
      const { data: customer, error } = await supabase
        .from('customers')
        .insert([{
          phone,
          password_hash: passwordHash,
          name,
          email
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
          customer: {
            id: customer.id,
            phone: customer.phone,
            name: customer.name,
            email: customer.email
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'login') {
      // Find customer by phone
      const { data: customer, error } = await supabase
        .from('customers')
        .select('*')
        .eq('phone', phone)
        .single();

      if (error || !customer) {
        return new Response(
          JSON.stringify({ error: 'Invalid phone number or password' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify password
      const validPassword = await verifyPassword(password, customer.password_hash);
      
      if (!validPassword) {
        return new Response(
          JSON.stringify({ error: 'Invalid phone number or password' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Return customer data (without password hash)
      return new Response(
        JSON.stringify({
          customer: {
            id: customer.id,
            phone: customer.phone,
            name: customer.name,
            email: customer.email
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
    console.error('Customer Auth Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Authentication failed' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
