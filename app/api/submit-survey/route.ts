import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
  try {
    const { surveyId, responses } = await request.json();

    if (!surveyId || !responses) {
      return new Response(
        JSON.stringify({ error: 'surveyId and responses are required' }),
        { status: 400 }
      );
    }

    // Extract all question IDs from the responses
    const questionIds = Object.keys(responses);

    // Fetch question texts and types based on question IDs
    const { data: questions, error: fetchQuestionsError } = await supabase
      .from('questions')
      .select('id, text, type')
      .in('id', questionIds);

    if (fetchQuestionsError || !questions) {
      console.error('Error fetching questions:', fetchQuestionsError);
      return new Response(
        JSON.stringify({ error: 'Error fetching question data' }),
        { status: 500 }
      );
    }

    // Create a map of question IDs to question data
    const questionMap = questions.reduce((acc: any, question: any) => {
      acc[question.id] = {
        text: question.text,
        type: question.type,
      };
      return acc;
    }, {});

    // Construct the enhanced response data
    const enhancedResponses = Object.entries(responses).reduce(
      (acc: any, [questionId, answer]) => {
        acc[questionId] = {
          questionText: questionMap[questionId]?.text || 'Question text not found',
          questionType: questionMap[questionId]?.type || 'Type not found',
          answer,
        };
        return acc;
      },
      {}
    );

    // Prepare the data to insert
    const responseData = {
      survey_id: surveyId,
      data: enhancedResponses, // Store the enhanced responses with question texts and types
    };

    // Insert a new survey response with data
    const { data: response, error: insertResponseError } = await supabase
      .from('survey_responses')
      .insert([responseData])
      .select()
      .single();

    if (insertResponseError || !response) {
      console.error('Error inserting response:', insertResponseError);
      return new Response(
        JSON.stringify({ error: 'Error saving response' }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify({ success: true }), { status: 201 });
  } catch (error) {
    console.error('Handler error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
}
