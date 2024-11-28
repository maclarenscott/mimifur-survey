import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(
  request: Request,
  context: { params: Promise<{ formId: string }> }
) {
  try {
    // Await the params to resolve
    const { formId } = await context.params;

    console.log('Form ID:', formId);

    // Query the database
    const { data: form, error } = await supabase
      .from('forms')
      .select('*')
      .eq('id', formId)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return new Response(
        JSON.stringify({ error: 'Error fetching form' }),
        { status: 500 }
      );
    }

    if (!form) {
      return new Response(JSON.stringify({ error: 'Form not found' }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(form), { status: 200 });
  } catch (error) {
    console.error('Handler error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
}
