import { Request, Response } from 'express';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

enum PlaceType {
  bothy,
  campsite,
  cave,
  supermarket,
  pub,
  petrol_station,
  campsite_shower,
  accomodation,
  train_station,
  other,
  route_marker
};

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and key must be provided.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Example of how to verify and get user data server-side.
const getPlaces = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const requestBody = req.body;
    const { types, lonMin, lonMax, latMin, latMax } = requestBody;

    if (!types) {
      return res.status(400).json({ error: 'Missing types in request body' });
    }

    if (types.length === 0){
      return res.status(200).json([]);
    }

    // const enumTypes = types.map(
    //   (type : string) => {
    //     return (PlaceType as any)[type] as PlaceType;
    //   });

    if (lonMin === undefined && lonMax === undefined && latMin === undefined && latMax === undefined) {
      const { data, error } = await supabase.from('places').select('*').in('type', types);
      if (error) {
        throw new Error(error.message);
      }
      return res.status(200).json(data);
    }

    if (lonMin === undefined || lonMax === undefined || latMin === undefined || latMax === undefined) {
      return res.status(400).json({ error: 'Missing parameter(s) in request body' });
    }

    const { data, error } = await supabase
      .from('places')
      .select('*')
      .in('type', types)
      .gt('lon', lonMin)
      .lt('lon', lonMax)
      .gt('lat', latMin)
      .lt('lat', latMax);

    if (error) {
      throw new Error(error.message);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default getPlaces;
