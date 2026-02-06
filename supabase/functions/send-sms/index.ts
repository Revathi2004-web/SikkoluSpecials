import { corsHeaders } from '../_shared/cors.ts';

const FAST2SMS_API_KEY = Deno.env.get('FAST2SMS_API_KEY');

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { phone, message, type } = await req.json();

    if (!phone || !message) {
      return new Response(
        JSON.stringify({ error: 'Phone and message are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format phone number (remove +91 if present, Fast2SMS expects 10 digits)
    const formattedPhone = phone.replace(/^\+91/, '').replace(/\D/g, '');

    if (formattedPhone.length !== 10) {
      return new Response(
        JSON.stringify({ error: 'Invalid phone number format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send SMS via Fast2SMS
    const smsResponse = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': FAST2SMS_API_KEY || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'q',
        message: message,
        language: 'english',
        flash: 0,
        numbers: formattedPhone,
      }),
    });

    const smsData = await smsResponse.json();

    if (!smsResponse.ok || !smsData.return) {
      console.error('Fast2SMS Error:', smsData);
      return new Response(
        JSON.stringify({ error: 'Failed to send SMS', details: smsData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`SMS sent to ${formattedPhone} (Type: ${type})`);

    return new Response(
      JSON.stringify({ success: true, messageId: smsData.message_id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('SMS Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to send SMS' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
