// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { prompt } from "./prompt.ts"
import { parse } from "https://deno.land/std@0.207.0/yaml/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface Result {
  tag: string;
  text: string;
}

interface YamlResponse {
  results: Result[];
}

function parseYamlResponse(yamlString: string): YamlResponse {
  try {
    // Extract YAML content if it's wrapped in markdown code blocks
    const yamlContent = yamlString.includes("```yaml")
      ? yamlString.split("```yaml")[1].split("```")[0].trim()
      : yamlString.includes("```")
        ? yamlString.split("```")[1].split("```")[0].trim()
        : yamlString;
    
    return parse(yamlContent) as YamlResponse;
  } catch (error) {
    console.error("Error parsing YAML:", error);
    return { results: [] };
  }
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!,
)

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}


async function generateResponse(question: string) {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPEN_ROUTER_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [{ role: "system", content: prompt }, { role: "user", content: question }],
      }),
    });

    const data = await response.json();

    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const { pharse } = await req.json()
  
  // search the database first 
  const { data: history, error: historyError } = await supabase
        .from('History')
        .select('*')
        .eq('question', pharse)

  if (historyError) {
    console.error('Error searching database:', historyError)
    throw new Error(historyError.message)
  }

  if (history.length > 0) {
    return new Response(JSON.stringify(history[0].answers), { headers: { "Content-Type": "application/json", ...corsHeaders } },
    )
  }

  const response = await generateResponse(pharse)

  const yamlResponse = parseYamlResponse(response)

  // save the response to the database
  const { error } = await supabase
        .from('History')
        .insert({
          question: pharse,
          answers: yamlResponse,
        })

  if (error) {
    console.error('Error inserting data:', error)
    throw new Error(error.message)
  }

  return new Response(
    JSON.stringify(yamlResponse),
    { headers: { "Content-Type": "application/json", ...corsHeaders } },
  )
})
