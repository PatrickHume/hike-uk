import { Request, Response } from 'express';
import { createClient, SupabaseClientOptions } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  {
    db: {
      schema: 'custom',
    },
    auth: {
      persistSession: true,
    },
  } as SupabaseClientOptions
);

// Example of how to verify and get user data server-side.
const getTrips = async (req: Request, res: Response): Promise<Response> => {
  try {
    // only allow post requests
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
    // check user is valid
    const token: string | string[] | undefined = req.headers.token;
    if (token === undefined) return res.status(400).json({ error: 'Token is missing' });
    const { data: user, error: user_error } = await supabase.auth.api.getUser(token as string);
    if (user_error || user === null) return res.status(401).json({ error: user_error?.message ?? 'unknown error' });
    // get trips matching user id
    const { data: trips, error: trip_error } = await supabase
    .from('trips')
    .select('*, user_uuid!inner(id, email), sections(*, place_source_info(*, place(*)), place_dest_info(*, place(*)))')
    .eq('user_uuid.id', user?.id);

    // check for error
    if (trip_error) {
      throw new Error(trip_error.message);
    }

    // Filter out the 'id' from the results before sending it to the user
    const sanitizedTrips = trips.map(({ id, ...rest }) => rest);

    // return url slug
    return res.status(200).json(sanitizedTrips);

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default getTrips;