import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch relevant data from ticket_analysis
    const { data: tickets, error } = await supabase
      .from('ticket_analysis')
      .select('summary, issue, common_issue, category, subcategory, link, responsible_department_justification');

    if (error) throw error;

    // Format the context for OpenAI
    const context = tickets.map(ticket => ({
      summary: ticket.summary,
      issue: ticket.issue,
      common_issue: ticket.common_issue,
      category: ticket.category,
      subcategory: ticket.subcategory,
      link: ticket.link,
      justification: ticket.responsible_department_justification
    }));

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant analyzing ticket data. Use the following context to provide insights and answer questions accurately. Format your responses in clear, concise markdown.
            
            When analyzing data, focus on:
            1. Identifying patterns in issues and categories
            2. Highlighting common problems and their solutions
            3. Providing relevant links when available
            4. Explaining department justifications when relevant
            
            Always be concise and factual.`
          },
          {
            role: 'user',
            content: `Context: ${JSON.stringify(context)}\n\nQuestion: ${query}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const result = await response.json();
    const answer = result.choices[0].message.content;

    return new Response(
      JSON.stringify({ answer }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});