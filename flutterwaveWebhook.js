// flutterwaveWebhook.ts
import { serve } from 'https://deno.land/x/supabase_edge_functions@v0.6.0/mod.ts';
import { createClient } from 'https://deno.land/x/supabase@1.0.0/mod.ts';

serve(async (req) => {
  if (req.method === 'POST') {
    const data = await req.json();

    if (data.event === 'charge.completed' && data.data.status === 'successful') {
      const {
        tx_ref,
        flw_ref,
        amount,
        currency,
        charged_amount,
        app_fee,
        merchant_fee,
        processor_response,
        auth_model,
        ip,
        narration,
        payment_type,
        created_at,
        customer,
        card,
      } = data.data;

      // Create Supabase client
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );

      // Insert payment data into flutterwave_payment table
      const { error } = await supabase.from('flutterwave_payment').insert([
        {
          tx_ref,
          flw_ref,
          amount,
          currency,
          charged_amount,
          app_fee,
          merchant_fee,
          processor_response,
          auth_model,
          ip,
          narration,
          status: data.data.status,
          payment_type,
          created_at: new Date(created_at),
          email: customer.email,
          name: customer.name,
          phone_number: customer.phone_number,
          card_first_6digits: card.first_6digits,
          card_last_4digits: card.last_4digits,
          card_issuer: card.issuer,
          card_country: card.country,
          card_type: card.type,
          card_expiry: card.expiry,
        },
      ]);

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
      }

      return new Response(JSON.stringify({ message: 'Payment data inserted successfully!' }), { status: 200 });
    }

    return new Response(JSON.stringify({ message: 'Event not processed.' }), { status: 200 });
  }

  return new Response(JSON.stringify({ message: 'Invalid method.' }), { status: 405 });
});
