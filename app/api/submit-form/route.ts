import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
  try {
    // Parse the JSON body
    const { formId, data } = await request.json();

    if (!formId || !data) {
      return new Response(
        JSON.stringify({ error: 'formId and data are required' }),
        { status: 400 }
      );
    }

    console.log('Received submission:', { formId, data });

    // Check if the form exists
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('id')
      .eq('id', formId)
      .single();

    if (formError || !form) {
      console.error('Form not found or error:', formError);
      return new Response(JSON.stringify({ error: 'Form not found' }), {
        status: 404,
      });
    }

    // Insert the response into the `responses` table
    const { data: response, error: insertError } = await supabase
      .from('survey_responses')
      .insert([{ form_id: formId, data }])
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting response:', insertError);
      return new Response(
        JSON.stringify({ error: 'Error saving response' }),
        { status: 500 }
      );
    }

    // Return the inserted response
    return new Response(JSON.stringify(response), { status: 201 });
  } catch (error) {
    console.error('Handler error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
}
