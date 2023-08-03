import { Request, Response } from 'express';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and key must be provided.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Example of how to verify and get user data server-side.
const getPlaceById = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const requestBody = req.body;
    const { id } = requestBody;

    if (!id) {
      return res.status(400).json({ error: 'Missing id in request body' });
    }

    const { data, error } = await supabase
      .from('places')
      .select('*')
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default getPlaceById;
