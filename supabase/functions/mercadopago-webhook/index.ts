import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
    if (!accessToken) {
      console.error('MERCADOPAGO_ACCESS_TOKEN not configured')
      return new Response('Configuration error', { status: 500 })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const body = await req.json()
    console.log('Webhook received:', JSON.stringify(body))

    const { type, data } = body

    if (type === 'payment') {
      // Fetch payment details from Mercado Pago
      const paymentResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${data.id}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      )

      const payment = await paymentResponse.json()
      console.log('Payment details:', JSON.stringify(payment))

      if (payment.status === 'approved') {
        // Parse external reference
        let externalRef: { empresa_id: string; plano_id: string; annual?: boolean }
        try {
          externalRef = JSON.parse(payment.external_reference || '{}')
        } catch {
          console.error('Invalid external_reference:', payment.external_reference)
          return new Response('OK', { status: 200 })
        }

        const { empresa_id, plano_id, annual } = externalRef

        if (empresa_id && plano_id) {
          // Create payment record
          const { error: pagamentoError } = await supabase
            .from('pagamentos')
            .insert({
              empresa_id,
              valor: payment.transaction_amount,
              status: 'pago',
              data_pagamento: new Date().toISOString().split('T')[0],
              data_vencimento: new Date().toISOString().split('T')[0],
              metodo_pagamento: 'mercado_pago',
              referencia: payment.id.toString(),
              observacoes: `Pagamento via Mercado Pago - ${annual ? 'Anual' : 'Mensal'}`,
            })

          if (pagamentoError) {
            console.error('Error creating payment record:', pagamentoError)
          }

          // Create or update contract
          const { error: contratoError } = await supabase
            .rpc('criar_contrato_plano', {
              p_empresa_id: empresa_id,
              p_plano_id: plano_id,
            })

          if (contratoError) {
            console.error('Error creating contract:', contratoError)
          }

          // Unblock company if blocked
          await supabase
            .from('empresas')
            .update({
              bloqueada: false,
              motivo_bloqueio: null,
              data_bloqueio: null,
              is_demo: false, // Convert from demo to paid
            })
            .eq('id', empresa_id)

          console.log(`Payment processed successfully for empresa ${empresa_id}`)
        }
      } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
        // Log rejected payment
        console.log(`Payment ${data.id} was ${payment.status}`)
      }
    }

    return new Response('OK', { status: 200, headers: corsHeaders })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Error', { status: 500, headers: corsHeaders })
  }
})
