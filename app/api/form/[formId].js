import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req, res) {
  const { formId } = req.query;
    console.log('formId:', formId);
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data: form, error } = await supabase
      .from('forms')
      .select('*')
      .eq('id', formId)
      .single();

    if (error) throw error;

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    return res.status(200).json(form);
  } catch (error) {
    console.error('Error fetching form:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
