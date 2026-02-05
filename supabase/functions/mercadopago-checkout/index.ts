import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
    if (!accessToken) {
      console.error('MERCADOPAGO_ACCESS_TOKEN not configured')
      return new Response(
        JSON.stringify({ error: 'Mercado Pago não configurado' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { action, data } = await req.json()
    console.log(`Processing action: ${action}`, data)

    switch (action) {
      case 'test-connection': {
        // Test connection with Mercado Pago API
        const response = await fetch('https://api.mercadopago.com/v1/payment_methods', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          }
        })

        if (response.ok) {
          return new Response(
            JSON.stringify({ success: true, message: 'Conexão bem-sucedida' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } else {
          const error = await response.text()
          console.error('Mercado Pago connection test failed:', error)
          return new Response(
            JSON.stringify({ success: false, error: 'Credenciais inválidas' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }

      case 'create-subscription': {
        // Create a subscription preference for recurring payments
        const { plano_id, empresa_id, email, empresa_nome } = data

        // Get plan details
        const { data: plano, error: planoError } = await supabase
          .from('planos')
          .select('*')
          .eq('id', plano_id)
          .single()

        if (planoError || !plano) {
          console.error('Plano not found:', planoError)
          return new Response(
            JSON.stringify({ error: 'Plano não encontrado' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Create preference for subscription
        const preference = {
          reason: `Assinatura ${plano.nome} - ${empresa_nome}`,
          auto_recurring: {
            frequency: 1,
            frequency_type: 'months',
            transaction_amount: plano.preco,
            currency_id: 'BRL',
          },
          back_url: `${req.headers.get('origin')}/dashboard`,
          payer_email: email,
          external_reference: JSON.stringify({ empresa_id, plano_id }),
        }

        const mpResponse = await fetch('https://api.mercadopago.com/preapproval', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(preference),
        })

        const mpData = await mpResponse.json()
        console.log('Mercado Pago subscription response:', mpData)

        if (!mpResponse.ok) {
          console.error('Mercado Pago subscription error:', mpData)
          return new Response(
            JSON.stringify({ error: 'Erro ao criar assinatura', details: mpData }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            init_point: mpData.init_point,
            subscription_id: mpData.id 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'create-payment': {
        // Create one-time payment preference
        const { plano_id, empresa_id, email, empresa_nome, annual } = data

        const { data: plano, error: planoError } = await supabase
          .from('planos')
          .select('*')
          .eq('id', plano_id)
          .single()

        if (planoError || !plano) {
          return new Response(
            JSON.stringify({ error: 'Plano não encontrado' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Calculate price (with annual discount if applicable)
        let amount = plano.preco
        if (annual) {
          amount = plano.preco * 12 * 0.8 // 20% discount for annual
        }

        const preference = {
          items: [{
            title: `${plano.nome} - ${empresa_nome}`,
            quantity: 1,
            unit_price: amount,
            currency_id: 'BRL',
          }],
          payer: { email },
          back_urls: {
            success: `${req.headers.get('origin')}/dashboard?payment=success`,
            failure: `${req.headers.get('origin')}/dashboard?payment=failure`,
            pending: `${req.headers.get('origin')}/dashboard?payment=pending`,
          },
          auto_return: 'approved',
          external_reference: JSON.stringify({ empresa_id, plano_id, annual }),
          notification_url: `${supabaseUrl}/functions/v1/mercadopago-webhook`,
        }

        const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(preference),
        })

        const mpData = await mpResponse.json()

        if (!mpResponse.ok) {
          console.error('Mercado Pago payment error:', mpData)
          return new Response(
            JSON.stringify({ error: 'Erro ao criar pagamento' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            init_point: mpData.init_point,
            preference_id: mpData.id 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Ação não suportada' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
