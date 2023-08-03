"use client"

import React, { useEffect, useRef, useState } from 'react';
/*
Open Layers Mapping
*/
import { SupabaseRoute } from '@/api/types';
import 'ol/ol.css';
/* Place */
import Map from '@/components/src/Map/Map';
import InfoPanel from '@/components/ui/InfoPanel/InfoPanel';
import TripMenu from '@/components/ui/TripMenu/TripMenu';
/*
UI Components
*/
import ButtonGrid from '@/components/ui/ButtonGrid/ButtonGrid';
import ToggleButtonWithTooltip from '@/components/ui/ToggleButtonWithTooltip/ToggleButtonWithTooltip';
/*
Icons
*/
import ClearIcon from '@mui/icons-material/Delete';
import DrawIcon from '@mui/icons-material/Draw';
import BothyIcon from '@mui/icons-material/GiteRounded';
import HikingIcon from '@mui/icons-material/Hiking';
import BnbIcon from '@mui/icons-material/HotelRounded';
import InfoIcon from '@mui/icons-material/Info';
import PetrolIcon from '@mui/icons-material/LocalGasStationRounded';
import GroceryIcon from '@mui/icons-material/LocalGroceryStoreRounded';
import PanIcon from '@mui/icons-material/OpenWith';
import WorldIcon from '@mui/icons-material/Public';
import RouteIcon from '@mui/icons-material/Route';
import ShowerIcon from '@mui/icons-material/Shower';
import PubIcon from '@mui/icons-material/SportsBar';
import TentIcon from '@mui/icons-material/Style';
import CaveIcon from '@mui/icons-material/Terrain';
import TrainIcon from '@mui/icons-material/Train';
/*
Data 
*/
// import pubs_data            from '@/api/pubs_data.json';
/*
Colours
*/
import { brown, grey, lightGreen, orange, red, teal } from '@mui/material/colors';
const colourRed         = red[500];
const colourLightGreen  = lightGreen[500];
const colourGrey        = grey[500];
const colourTurquoise   = teal[500];
const colourOrange      = orange[500];
const colourBrown       = brown[500];

import { MenuState } from '@/components/src/Map/Map';

import getTrip from '@/components/api/getTrip';
import { Auth } from '@supabase/ui';
import { usePathname, useSearchParams } from 'next/navigation';

import { AUTOSAVED_TRIP_KEY, VIEWING_TRIP_KEY } from '@/components/src/Constants/SessionKeys';

/*
Map properties
*/
interface MapProps {
  width: string;
  height: string;
}

/*
Create map
*/
const OpenLayersMap: React.FC<MapProps> = ({ width, height }) => {

  const searchParams = useSearchParams();
  const url_slug = searchParams.get('route');

  const { user, session } = Auth.useUser();
  const slugRoute = useRef<SupabaseRoute | undefined>(undefined);

  const pathname = usePathname();

  const [menuState, updateMenuState] = useState<MenuState>(MenuState.main);

  const default_selection = ['bothy'];
  const default_snap_selection = 'snap';
  const default_mode_selection = 'draw';
  const default_layer_selection = 'default';
  // ref to the html element
  const mapElement = useRef<HTMLDivElement>(null);
  // map object
  const map        = useRef<Map | undefined>(undefined);

  // info states for details about each point of interest
  const [ infoPos, updateInfoPos ]          = useState<Array<number>>([0,0]);
  const [ info, updateInfo ]                = useState< { [key: string]: any } | undefined>();
  const [ infoVisible, updateInfoVisible ]  = useState<boolean>(false);
  const [ sleeping, updateSleeping ]        = useState<boolean>(false);
  const [ tripPlan, updateTripPlan ]        = useState<boolean>(false);

  // Create map
  useEffect(() => {
    // If html element exists, Create map
    if (mapElement.current && map.current === undefined) {
      map.current = new Map(mapElement.current, {
        // Pass the updateInfo function as a callback to the map object
        setInfoPos      : updateInfoPos,
        setInfo         : updateInfo,
        setInfoVisible  : updateInfoVisible,
        setSleeping     : updateSleeping,
        setTripPlan     : updateTripPlan,
        setMenuState    : updateMenuState,
      });

      // map.current.drawPoints('bothy',         bothies_data,        BothyIcon,  colourRed,        0.5, 12);
      // map.current.drawPoints('campsite',      campsites_data,      TentIcon,   colourLightGreen, 0.5, 12);
      // map.current.drawPoints('cave',          caves_data,          CaveIcon,   colourGrey,       0.5, 12);
      // map.current.drawPoints('train_station', train_stations_data, TrainIcon,  colourTurquoise,  0.5, 12);
      // map.current.drawPoints('supermarket',       supermarkets_data,   GroceryIcon,colourOrange,     0.5, 12);
      // map.current.drawPoints('pub',           pubs_data,           PubIcon,    colourBrown,      0.5, 12);
      // map.current.drawRoutes('bothy',    bothies_routes_data, '#000000',  0.5, 12);

      map.current.setVisible(default_selection);
      map.current.setMode(default_mode_selection);
      map.current.setSnapping(default_snap_selection);
      map.current.setLayer(default_layer_selection);

      // if no slug present, clear sessionStorage and proceed
      if(url_slug === null){ 
        sessionStorage.removeItem(VIEWING_TRIP_KEY); 
        // check if the user is already editing a route
        const autoSavedTripJSON = sessionStorage.getItem(AUTOSAVED_TRIP_KEY);
        if( autoSavedTripJSON === null ) return; //             do nothing if no route found
        const autoSavedTrip = JSON.parse(autoSavedTripJSON); // otherwise load route
        slugRoute.current = autoSavedTrip as SupabaseRoute;
        map.current?.importSupabaseRoute(slugRoute.current);
        return; 
      }
      // if slug present, check storage
      const stringRoute = sessionStorage.getItem(VIEWING_TRIP_KEY);
  
      // if result is valid, check it is corrent.
      if (stringRoute) { 
        // get local trip
        const localTrip = JSON.parse(stringRoute);
        // if local trip is valid then proceed
        if ( localTrip?.url_slug === url_slug ) {
          console.log('OpenLayersMap: 📦 Route retrieved locally!');
          slugRoute.current = localTrip as SupabaseRoute;
          map.current?.importSupabaseRoute(slugRoute.current);
          return;
        }
      }
      // if result is valid but outdated, then fetch new from api
      sessionStorage.removeItem(VIEWING_TRIP_KEY);
      getTrip(session?.access_token ?? undefined, url_slug)
      .then((JSONroute: any) => {
        // if result is valid, save to local storage
        if (JSONroute) {
          slugRoute.current = JSONroute as SupabaseRoute;
          console.log('OpenLayersMap: 🛰 Route retrieved from database!');
          map.current?.importSupabaseRoute(slugRoute.current);
          sessionStorage.setItem(VIEWING_TRIP_KEY, JSON.stringify(JSONroute));
          return; // proceed
        }
        // otherwise, report error
        else {
          console.log('OpenLayersMap: 🛑 Error, route is invalid.');
          return;
        }
      })
      .catch((error) => {
        console.log('OpenLayersMap: 🛑 Error, requesting route threw error.', error);
      })
    }
  }, []);

  // Show selected icons
  const setVisible = (selected : Array<string>) => {
    if(map.current === undefined){
      return;
    }
    map.current.setVisible(selected);
  }

  // Set mode
  const setMode = (selected : string) => {
    if(map.current === undefined){
      return;
    }
    map.current.setMode(selected);
  }

  // Set mode
  const setSnapping = (snap : string) => {
    if(map.current === undefined){
      return;
    }
    map.current.setSnapping(snap);
  }

  // Set layer
  const setLayer = (selected : string) => {
    if(map.current === undefined){
      return;
    }
    map.current.setLayer(selected);
  }
  
  return (
    <div style={{ position: 'relative', width, height }}>
      
      <TripMenu map={map} menuState={menuState} updateMenuState={updateMenuState} tripPlan={tripPlan} height={height}/>

      <div className='bg-white' style={{ position: "absolute" , top: 0, left: 0, width, height }} />

      <div ref={mapElement} style={{ top: 0, left: 0, width, height }} />

      {/* Display info about hovered icon. */}
      <InfoPanel map={map} info={info} infoPos={infoPos} infoVisible={infoVisible} sleeping={sleeping} updateSleeping={updateSleeping}/>

      <div style={{ position:'absolute', top: 10, right: 10}}>
      <div className="ml-2"  style={{ display:'inline-block'}}>
        <ButtonGrid func={setLayer} defaults={default_layer_selection} exclusive enforced viewSize='large' >
          <ToggleButtonWithTooltip tooltipText="Hiking map"     value="default"     aria-label='HikingIcon' ><HikingIcon/></ToggleButtonWithTooltip>
          {/* <ToggleButtonWithTooltip tooltipText="Cycling map"    value="cycle"       aria-label='BikeIcon'><BikeIcon/></ToggleButtonWithTooltip> */}
          <ToggleButtonWithTooltip tooltipText="Satellite map"  value="satellite"   aria-label='WorldIcon'><WorldIcon/></ToggleButtonWithTooltip>
        </ButtonGrid>
      </div>
      <div className="ml-2"  style={{ display:'inline-block'}}>
        <ButtonGrid func={setSnapping} defaults={default_snap_selection} exclusive viewSize='large'>
          <ToggleButtonWithTooltip tooltipText="Snap to map"    value="snap"        aria-label='RouteIcon'><RouteIcon/></ToggleButtonWithTooltip>
        </ButtonGrid>
      </div>
      <div className="ml-2"  style={{ display:'inline-block'}}>
        <ButtonGrid func={setMode} defaults={default_mode_selection} exclusive enforced viewSize='large'>
          <ToggleButtonWithTooltip tooltipText="Move view"              value="pan"     aria-label='PanIcon' ><PanIcon/></ToggleButtonWithTooltip>
          <ToggleButtonWithTooltip tooltipText="Create route"           value="draw"    aria-label='DrawIcon' ><DrawIcon/></ToggleButtonWithTooltip>
          <ToggleButtonWithTooltip tooltipText="Delete route"           value="remove"  aria-label='ClearIcon' ><ClearIcon/></ToggleButtonWithTooltip>
          <ToggleButtonWithTooltip tooltipText=""             disabled  value="info" aria-label='InfoIcon' ><InfoIcon/></ToggleButtonWithTooltip>
        </ButtonGrid>
      </div>
      </div>

      <ButtonGrid func={setVisible} defaults={default_selection} viewSize='medium' style={{ position:'absolute', bottom: 10, right: 10}}>
        <ToggleButtonWithTooltip tooltipText="Bothies"          value="bothy"         aria-label='Bothies'><BothyIcon/></ToggleButtonWithTooltip>
        <ToggleButtonWithTooltip tooltipText="Campsites"        value="campsite"      aria-label='Campsites'><TentIcon/></ToggleButtonWithTooltip>
        <ToggleButtonWithTooltip tooltipText="Caves"            value="cave"          aria-label='Caves'><CaveIcon/></ToggleButtonWithTooltip>
        <ToggleButtonWithTooltip tooltipText="Supermarkets"     value="supermarket"       aria-label='Groceries'><GroceryIcon/></ToggleButtonWithTooltip>
        <ToggleButtonWithTooltip tooltipText="Pubs"             value="pub"           aria-label='Pubs'><PubIcon/></ToggleButtonWithTooltip>
        <ToggleButtonWithTooltip tooltipText="Petrol Stations"  value="petrol"       aria-label='Petrol Stations'><PetrolIcon/></ToggleButtonWithTooltip>
        <ToggleButtonWithTooltip tooltipText="Campsite showers" value="shower"       disabled aria-label='Showers'><ShowerIcon/></ToggleButtonWithTooltip>
        <ToggleButtonWithTooltip tooltipText="BnBs"             value="bnbs"         disabled aria-label='BnBs'><BnbIcon/></ToggleButtonWithTooltip>
        <ToggleButtonWithTooltip tooltipText="Train Station"    value="train_station" aria-label='Trains'><TrainIcon/></ToggleButtonWithTooltip>
      </ButtonGrid>

    </div>
  );
};

OpenLayersMap.displayName = 'OpenLayersMap';
export default OpenLayersMap;
