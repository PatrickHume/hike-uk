import { Request, Response } from 'express';
import { createClient, SupabaseClientOptions } from '@supabase/supabase-js';
import { 
  AddRouteJSON,
  SupabasePlaceInfo,
  SupabasePlaceInfo_Ref,
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

export const _addTrip = async (user: any, res: Response, addRouteJSON : AddRouteJSON) : Promise<Response> => {

      // if url slug is present
      const url_slug = addRouteJSON.route.url_slug;
      var   updating_route = false;
      if(url_slug !== ""){

        // check if url slug already exists with user
        const { data: trip_check_data, error: trip_check_error } = await supabase
        .from('trips')
        .select('url_slug, user_uuid')
        .eq('url_slug', url_slug)
        .eq('user_uuid', user.id);

        // check for error
        if (trip_check_error) throw new Error(trip_check_error.message);

        // if no route found, then user is trying to manually create url_slug.
        // return error
        if(trip_check_data.length === 0) throw new Error( `error, user & url_slug pair not found` );

        // mark updating route
        updating_route = true;
      }
  
      // get the place infos
      const placeInfos = addRouteJSON.placeInfo;
      // find place infos which refer to places without ids
      const localPlaceInfos : Array<SupabasePlaceInfo> = [];
      const indexMap : {[key : number] : number} = {};
      var index = -1;
      for(var placeInfo of placeInfos){
        index += 1;
        if( placeInfo.place.id !== undefined ) continue;
        indexMap[localPlaceInfos.length] = index;
        localPlaceInfos.push(placeInfo);
      }
      // localPlaceInfos hold places which we want to add to supabase, then update their ids
      // we need to keep a map of the position in localPlaceInfos to placeInfos, this is indexMap.
  
      const localPlaceArray : Array<any> = [];
      // loop over the places which need adding to supabase
      for(const localPlaceInfo of localPlaceInfos){
        const localPlace = localPlaceInfo.place;
        // add to array to create
        localPlaceArray.push({
          // no id is specified, so supabase will create one
          type: localPlace.type,
          name: localPlace.name,
          lon:  localPlace.lon,
          lat:  localPlace.lat,
          info: localPlace.info,
        });
      }
  
      // add any new places to supabase
      const { data: place_data, error: place_error } = await supabase
      .from('places')
      .insert(localPlaceArray)
      .select('id');
      // check for error
      if (place_error) {
        throw new Error(place_error.message);
      }
  
      // map the old ids to the new ids
      for(var i = 0; i < place_data.length; i++){
        placeInfos[indexMap[i]].place.id = place_data[i].id;
      }
  
      const placeInfo_refs : Array<SupabasePlaceInfo_Ref> = [];
      // map the old ids to the new ids
      for(var placeInfo of placeInfos){
        if(placeInfo.place.id === undefined){
          throw new Error('Error: placeInfo.place.id === undefined');
        }
        const placeInfo_ref : SupabasePlaceInfo_Ref = {
          ...placeInfo,
          place : placeInfo.place.id
        }
        placeInfo_refs.push(placeInfo_ref);
      }
  
      const route = addRouteJSON.route;
  
      // add the place_info to supabase
      const { data: place_info_data, error: place_info_error } = await supabase
      .from('place_info')
      .insert(placeInfo_refs)
      .select('id');
      // check for error
      if (place_info_error) {
        throw new Error(place_info_error.message);
      }
  
      /*
      first create sections, then assemble a trip using the section uuids
      */

      // if we are updating the route, we should delete any old sections before creating new ones
      // if( updating_route ) {
      //   // create trip
      //   const { data: delete_section_data, error: delete_section_error } = await supabase
      //   .from('trips_sections')
      //   .delete()
      //   .eq('trip_url_slug', url_slug);
      //   // check for error
      //   if (delete_section_error) {
      //     throw new Error(delete_section_error.message);
      //   }  
      // }

      const insert_data = [
        { 
          user_uuid       : user.id,
          name            : route.name,
          distance        : route.distance,
          initial_food    : route.initial_food,
          initial_water   : route.initial_water,
          is_public       : route.is_public,
        },
      ];

      let trip_data : any;

      if (updating_route) {
        // update trip
        const { data, error } = await supabase
          .from('trips')
          .update(insert_data)
          .eq('url_slug', url_slug)
          .single();
        // check for error
        if (error) {
          throw new Error(error.message);
        }
        trip_data = data; // Assign the value to trip_data
      } else {
        // create trip
        const { data, error } = await supabase
          .from('trips')
          .insert(insert_data)
          .limit(1)
          .single();
        // check for error
        if (error) {
          throw new Error(error.message);
        }
        trip_data = data; // Assign the value to trip_data
      }

      route.sections.forEach(function(section, index) {
        section.place_source_info = place_info_data[section.place_source_info].id;
        section.place_dest_info   = place_info_data[section.place_dest_info].id;
        section.trip_url_slug     = trip_data.url_slug;
      });
      
      // create sections
      const { data: section_data, error: section_error } = await supabase
      .from('sections')
      .insert(route.sections)
      .select('uuid');
      // check for error
      if (section_error) {
        throw new Error(section_error.message);
      }
      
      // const trip_section_data: any[] = section_data.map((section: any) => {
      //   return {
      //     trip_url_slug: updating_route ? url_slug : trip_data.url_slug,
      //     section_uuid: section.uuid,
      //   };
      // });
  
      // join trips and routes in junction table
      // const { data: junction_data, error: junction_error } = await supabase
      // .from('trips_sections')
      // .insert(trip_section_data)
      // .select();
      // // check for error
      // if (junction_error) {
      //   throw new Error(junction_error.message);
      // }
      // return url slug
      return res.status(200).json(trip_data);
}

// Example of how to verify and get user data server-side.
const addTrip = async (req: Request, res: Response): Promise<Response> => {
  try {
    
    // only allow post requests
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    // check request body
    const requestBody = req.body;
    const addRouteJSON = requestBody as AddRouteJSON;
    if ( addRouteJSON === undefined ) {
      return res.status(400).json({ error: 'Missing parameter(s) in request body' });
    }

    // check user is valid
    const token: string | string[] | undefined = req.headers.token;
    if ( token === undefined ) return res.status(400).json({ error: 'Token is missing' });
    const { data: user, error: user_error } = await supabase.auth.api.getUser(token as string);
    if (user_error || user === null || user?.id === null) return res.status(401).json({ error: user_error?.message ?? 'unknown error' });

    const result = await _addTrip(user, res, addRouteJSON);
    return result;

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default addTrip;
