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
const getTrip = async (req: Request, res: Response): Promise<Response> => {
  try {
    // only allow post requests
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
    // check request body
    const requestBody = req.body;
    const { url_slug } = requestBody;
    if ( url_slug === undefined ) {
      return res.status(400).json({ error: 'Missing parameter(s) in request body' });
    }
    // get trip
    const { data: trip, error: trip_error } = await supabase
    .from('trips')
    .select('*, user_uuid(email), sections(*, place_source_info(*, place(*)), place_dest_info(*, place(*)))')
    .eq('url_slug', url_slug)
    .limit(1)
    .single()
    console.log(trip);
    // check for error
    if (trip_error) {
      throw new Error(trip_error.message);
    }
    // check user if trip not public
    if(trip?.is_public === false){
      // check user is valid
      const token: string | string[] | undefined = req.headers.token;
      if (token === undefined) return res.status(400).json({ error: 'Token is missing' });
      const { data: user, error: user_error } = await supabase.auth.api.getUser(token as string);
      if (user_error || user === null) return res.status(401).json({ error: user_error?.message ?? 'unknown error' });
      // if trip doesn't belong to user, return error
      if(trip?.user_uid !== user?.id) return res.status(403).json({ error: 'You dont have permission to view this route' });
    }
    // get sections

    // return trip
    return res.status(200).json(trip);

    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default getTrip;