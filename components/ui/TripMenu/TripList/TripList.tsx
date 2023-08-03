
import Map                              from '@/components/src/Map/Map';
import React, { ReactNode, useEffect }  from 'react';
import { SupabaseRoute }                from '@/api/types';
import { SAVED_TRIPS_KEY }              from '@/components/src/Constants/SessionKeys';
import TripLabel                        from '@/components/ui/TripMenu/TripList/TripLabel';
import { Auth }                         from '@supabase/ui';

// The states of the trip list.
enum State {
  loading,
  trips_found,
  error
}

interface TripProps {
  map               : React.MutableRefObject<Map | undefined>;
  loadedTrips       : Array<SupabaseRoute> | undefined | null;
  updateLoadedTrips : React.Dispatch<React.SetStateAction<SupabaseRoute[] | null | undefined>>;
}

// The TripList displays all of the user's tripLabels.
const TripList: React.FC<TripProps> = ({map, loadedTrips, updateLoadedTrips}) => {

  // Attempt to get local tripLabels on render.
  useEffect(() => {
    const savedTrips = sessionStorage.getItem(SAVED_TRIPS_KEY);
    if (savedTrips) {
      const result = JSON.parse(savedTrips);
      updateLoadedTrips(result);
    }
  }, []);

  // Compile array of trip labels to display to the user.
  let tripLabels : Array<ReactNode> = [];
  // Record the state of the list.
  let state : State = State.loading;
  // Get auth to check if signed in.
  const { user, session } = Auth.useUser();

  // If no trips found, display an error.
  if(loadedTrips === null){
    state = State.error;
  }
  // If loading, display loading message.
  else if (loadedTrips === undefined){
    state = State.loading;
  }
  // Otherwise, display all trip labels
  else{
    for (const trip of loadedTrips) {
      tripLabels.push(
        <TripLabel map={map} name={trip?.name ?? "Unnammed Route"} distance={trip?.distance ?? 0} trip={trip} />
      );
    }
    state = State.trips_found;
  }

  // If the user is not signed in, show a message prompting signin.
  if(session === null) return (<>
    <div className="px-4 pb-4">
      <div className="px-2 text-gray-400" style={{display : 'inline-block'}}><a href="/signin" className="underline">Sign in</a> to view saved routes.</div>
    </div>
  </>);

  // Loading message.
  if(state === State.loading) return (<>
    <div className="px-4 pb-4">
      <div className=" px-2 text-gray-400" style={{display : 'inline-block'}}>Loading routes...</div>
    </div>
  </>);

  // Error message.
  if(state === State.error) return (<>
    <div className="px-4 pb-4">
      <div className=" px-2 text-gray-400" style={{display : 'inline-block'}}>Error: routes could not be requested.</div>
    </div>
  </>);

  // If no errors and user is signed in, display all trip labels.
  if(state === State.trips_found){
    // If no routes found, notify user.
    if(tripLabels.length === 0) return (<>
      <div className="px-4 pb-4">
        <div className=" px-2 text-gray-400" style={{display : 'inline-block'}}>You have no saved routes...</div>
      </div>
    </>);
    // Otherwise show trip labels in scrolling div.
    else return (<>
      <div className='pb-2'
      style={{ height: '100%', overflowY: 'auto' }}>
        {tripLabels}
      </div>
    </>);
  }
  
  return <></>
};

TripList.displayName = 'TripList';
export default TripList;
