import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(
  request: Request,
  { params }: { params: { surveyId: string } }
) {
  const { surveyId } = await params;

  try {
    const { data: survey, error } = await supabase
      .from('surveys')
      .select(`
        *,
        sections (
          *,
          questions (
            *,
            options (
              *
            )
          )
        )
      `)
      .eq('id', surveyId)
      // Order sections by 'ordering'
      .order('ordering', { ascending: true, foreignTable: 'sections' })
      // Order questions within sections
      .order('ordering', { ascending: true, foreignTable: 'sections.questions' })
      // Order options within questions
      .order('ordering', { ascending: true, foreignTable: 'sections.questions.options' })
      .single();

    if (error || !survey) {
      return new Response(JSON.stringify({ error: 'Survey not found' }), {
        status: 404,
      });
    }
    
    console.log('Survey:', survey);
    return new Response(JSON.stringify(survey), { status: 200 });
  } catch (error) {
    console.error('Error fetching survey:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
    });
  }
}
