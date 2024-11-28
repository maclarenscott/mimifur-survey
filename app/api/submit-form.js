import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { formId, data } = req.body;

  if (!formId || !data) {
    return res.status(400).json({ error: 'Form ID and data are required' });
  }

  try {
    // Verify that the form exists
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('id')
      .eq('id', formId)
      .single();

    if (formError) throw formError;

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    // Insert the form response
    const { data: response, error: insertError } = await supabase
      .from('survey_responses')
      .insert([
        {
          form_id: formId,
          data: data,
        },
      ])
      .single();

    if (insertError) throw insertError;

    return res.status(201).json(response);
  } catch (error) {
    console.error('Error submitting form:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
