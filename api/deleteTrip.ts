import { Request, Response } from 'express';
import { createClient, SupabaseClientOptions } from '@supabase/supabase-js';
import { 
  AddRouteJSON,
  SupabasePlaceInfo,
  SupabasePlaceInfo_Ref,
  DeleteRouteJSON,
} from './types';

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

export const _deleteTrip = async (user: any, res: Response, url_slug : string) : Promise<Response> => {

    if(url_slug === "") throw new Error('error, url_slug not specified');
    
    // check if url slug already exists with user
    const { data: delete_trip_data, error: delete_trip_error } = await supabase
    .from('trips')
    .delete()
    .eq('url_slug', url_slug)
    .eq('user_uuid', user.id);

    // check for error
    if (delete_trip_error) throw new Error(delete_trip_error.message);

    return res.status(200).json({ status: 'Success' });
}

// Example of how to verify and get user data server-side.
const deleteTrip = async (req: Request, res: Response): Promise<Response> => {
  try {
    
    // only allow post requests
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    // check request body
    const requestBody = req.body;
    const deleteRouteJSON = requestBody as DeleteRouteJSON;
    if ( deleteRouteJSON === undefined ) {
      return res.status(400).json({ error: 'Missing parameter(s) in request body' });
    }

    // check user is valid
    const token: string | string[] | undefined = req.headers.token;
    if ( token === undefined ) return res.status(400).json({ error: 'Token is missing' });
    const { data: user, error: user_error } = await supabase.auth.api.getUser(token as string);
    if (user_error || user === null || user?.id === null) return res.status(401).json({ error: user_error?.message ?? 'unknown error' });

    // if url slug is present
    const url_slug = deleteRouteJSON.url_slug;

    const result = await _deleteTrip(user, res, url_slug);
    return result;

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default deleteTrip;