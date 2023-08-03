import React              from 'react';
import Button             from '@mui/material/Button';
import { SupabaseRoute }  from '@/api/types';
import Map                from '@/components/src/Map/Map';

const buttonStyle : React.CSSProperties = {
  backgroundColor: '#F5F5F5',
  borderRadius: '10px',
  height: 'auto',
  width: '100%',
  zIndex: '4',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center', // Aligns items vertically centered}}>
  textTransform: 'none'
};
interface LabelProps {
  map         : React.MutableRefObject<Map | undefined>;
  name        : string;
  distance    : number;
  trip        : SupabaseRoute;
}
/*
TripLabel gives a user a brief overview of a trip and, when clicked, loads that trip to view.
*/
const TripLabel: React.FC<LabelProps> = ({map, name = "", distance = 0, trip}) => {
  // The triplabel is implemented as a material ui button.
  return (
    <div className="px-4 pb-2">
      <Button variant="text" className="py-2 px-4 max-w-6xl mx-auto"
      onClick={() => {
        // When clicked, set the url slug and import the relevant trip to the map.
        if( map.current === undefined ) return;
        const newUrl = `/?route=${trip.url_slug}`;
        window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
        map.current.importSupabaseRoute(trip);
      }}
      style={buttonStyle}>
          {/* Show route info... */}
          <div  className="text-black font-semibold italic" style={{display : 'inline-block'}} >{name !== "" ? name : "Unnamed Route"}</div>
          <div  className="px-2" ></div>
          <div  className="text-black text-sm italic" style={{display : 'inline-block'}} > {distance.toFixed(1)}km </div> 
      </Button>
    </div>
  );
};

TripLabel.displayName = 'TripLabel';
export default TripLabel;
