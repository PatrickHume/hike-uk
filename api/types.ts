export interface SupabasePlaceInfo {
    place: SupabasePlace,
    sleeping: boolean,
    restock_water: number | undefined,
    restock_food: number | undefined,
    notes: string,
}

export interface SupabasePlaceInfo_Ref extends Omit<SupabasePlaceInfo, 'place'> {
    place: number,
}

export interface SupabasePlace {
    id: number | undefined,
    type: string,
    name: string,
    lon: number,
    lat: number,
    info: any,
}

export interface SupabaseSection {
    id: number | undefined,
    index: number,
    place_source_info: SupabasePlaceInfo,
    place_dest_info: SupabasePlaceInfo,
    polyline: string,
    distance: number,
}

export type SupabaseSection_Ref = Omit<SupabaseSection, 'place_source_info' | 'place_dest_info'> & {
    trip_url_slug: string | undefined,
    place_source_info: number,
    place_dest_info: number,
}

export interface SupabaseRoute {
    url_slug: string,
    name: string,
    sections: Array<SupabaseSection>,
    distance: number,
    initial_food: number,
    initial_water: number,
    is_public: boolean,
    user_uuid?: any,
}

export type SupabaseRoute_Ref = Omit<SupabaseRoute, 'sections'> & {
    sections: Array<SupabaseSection_Ref>,
}

export interface AddRouteJSON {
    placeInfo: Array<SupabasePlaceInfo>,
    route: SupabaseRoute_Ref,
}

export interface DeleteRouteJSON {
    url_slug: string,
}
