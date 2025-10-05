// Supabase Edge Function: Airtable güncelleme
// Bu fonksiyon posts tablosunda UPDATE olduğunda tetiklenir

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PostUpdate {
  id: string
  title: string
  content: string
  airtable_record_id: string | null
}

interface AirtableUpdate {
  Name?: string
  Notes?: string
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔄 Airtable güncelleme fonksiyonu tetiklendi')

    // Request body'den post verilerini al
    const postUpdate: PostUpdate = await req.json()
    
    console.log('📝 Güncellenen post:', {
      id: postUpdate.id,
      title: postUpdate.title,
      airtable_record_id: postUpdate.airtable_record_id
    })

    // Eğer airtable_record_id yoksa işlem yapma
    if (!postUpdate.airtable_record_id) {
      console.log('ℹ️ airtable_record_id yok, Airtable güncellemesi atlanıyor')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'airtable_record_id yok, güncelleme atlandı' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Airtable API konfigürasyonu
    const AIRTABLE_API_KEY = Deno.env.get('AIRTABLE_API_KEY')
    const AIRTABLE_BASE_ID = Deno.env.get('AIRTABLE_BASE_ID')
    const AIRTABLE_TABLE_ID = Deno.env.get('AIRTABLE_TABLE_NAME')

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_ID) {
      throw new Error('Airtable API konfigürasyonu eksik')
    }

    // Airtable'a gönderilecek veri
    const airtableUpdate: AirtableUpdate = {}
    
    if (postUpdate.title) {
      airtableUpdate.Name = postUpdate.title
    }
    
    if (postUpdate.content) {
      airtableUpdate.Notes = postUpdate.content
    }

    console.log('📤 Airtable\'a gönderilecek veri:', airtableUpdate)

    // Airtable API'ye PATCH isteği gönder
    const airtableResponse = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}/${postUpdate.airtable_record_id}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: airtableUpdate
        })
      }
    )

    if (!airtableResponse.ok) {
      const errorData = await airtableResponse.text()
      throw new Error(`Airtable API hatası: ${airtableResponse.status} - ${errorData}`)
    }

    const airtableData = await airtableResponse.json()
    
    console.log('✅ Airtable başarıyla güncellendi:', airtableData.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Airtable başarıyla güncellendi',
        data: airtableData
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Airtable güncelleme hatası:', error)
    
    // Hata durumunda rollback yapmıyoruz, sadece logluyoruz
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
