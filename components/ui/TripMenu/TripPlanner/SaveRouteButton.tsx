import { AddRouteJSON, SupabaseRoute }  from '@/api/types';
import addTrip                          from '@/components/api/addTrip';
import Map                              from '@/components/src/Map/Map';
import MenuDialog                       from '@/components/ui/TripMenu/MenuDialog';
import DoneIcon                         from '@mui/icons-material/Done';
import ErrorIcon                        from '@mui/icons-material/PriorityHigh';
import SaveIcon                         from '@mui/icons-material/Save';
import Button, { ButtonProps }          from '@mui/material/Button';
import CircularProgress                 from '@mui/material/CircularProgress';
import { Auth }                         from '@supabase/ui';
import React, { useState }              from 'react';
import { AUTOSAVED_TRIP_KEY, SAVED_TRIPS_KEY, VIEWING_TRIP_KEY } from '@/components/src/Constants/SessionKeys';

interface CustomButtonProps extends ButtonProps {
  map           : React.MutableRefObject<Map | undefined>;
  updateUrlSlug : React.Dispatch<React.SetStateAction<string>>;

  initialText : string;
  progressText  : string;
  completeText   : string;
  errorText   : string;
}

// States relating to the save route button icon
enum ProgressState {
  initial,
  progress,
  complete,
  error,
}

// Match progress state to icon
const getIcon : (progressState : ProgressState) => JSX.Element = (progressState : ProgressState) => {
  switch (progressState) {
    case ProgressState.initial :  return <SaveIcon/>;
    case ProgressState.progress : return <CircularProgress size={20}/>;
    case ProgressState.complete : return <DoneIcon/>;
  }
  return <ErrorIcon/>;
}

// Upsert a route to the local storage
const upsertInStorage = (urlSlugToUpsert : string, route : SupabaseRoute) : void => {
  // Get the local trips to upsert into
  const savedTripsStr = sessionStorage.getItem(SAVED_TRIPS_KEY);
  // Return if failed
  if (savedTripsStr === null) {
    console.log('SaveRouteButton: 🛑 Error, saved trips is null.');
    return;
  }
  // Attempt upsert
  try {
    // Get saved trips as json
    const savedTrips = JSON.parse(savedTripsStr) as Array<SupabaseRoute>;
    // Find the index of the trip to update
    const indexToUpdate = savedTrips.findIndex((trip) => trip.url_slug === urlSlugToUpsert);

    // If an old copy of the trip is in local trips, then update the trip.
    if (indexToUpdate !== -1) {
      savedTrips[indexToUpdate] = route;
      console.log(`SaveRouteButton: 📦 Updated route in local storage. (url: ${urlSlugToUpsert})`);
    } 
    // Otherwise, insert the route into the saved trips.
    else { 
      savedTrips.push(route);
      console.log(`SaveRouteButton: 📦 Inserted route into local storage. (url: ${urlSlugToUpsert})`);
    }
    // Convert the array back to a string and write to local storage
    const updatedSavedTripsStr : string = JSON.stringify(savedTrips);
    sessionStorage.setItem(SAVED_TRIPS_KEY, updatedSavedTripsStr);
  } catch (error) {
    console.log('SaveRouteButton: 🛑 An error occurred while processing local trips:', error);
  }
}

const CustomButton: React.FC<CustomButtonProps> = ({ 
  map, 
  updateUrlSlug, 
  initialText, 
  progressText,
  completeText,
  errorText,
  ...props }) => {

  // This is the state of the save button. This determines which icon it shows.
  const [buttonState, updateButtonState] = useState<ProgressState>(ProgressState.initial);
  // Get the user to check for sign in.
  const { user, session } = Auth.useUser()

  /* This is the state of the dialog box which appears when users attempt 
  to save a route prior to signing in. */
  const [open, setOpen] = React.useState(false);
  // Handle open and proceed on the dialog box.
  const handleProceed = () => { setOpen(false); }
  const handleClose = () => { setOpen(false); };

  // Handle click of the save route button
  const handleClick = () => {
    if( map.current === undefined ) return;

    // If user is not signed in, save route locally and open warning dialog.
    if( session === null ){
      // (Saving the route locally allows the user to come back to it after signing in.)
      const supabaseRoute   : SupabaseRoute = map.current.exportSupabaseRoute();
      sessionStorage.setItem(AUTOSAVED_TRIP_KEY, JSON.stringify(supabaseRoute));
      // Open the dialog.
      setOpen(true);
      return;
    }

    // Update the save state to show a spinning progress wheel while the route is saved.
    updateButtonState(ProgressState.progress);

    // Get mapping objects to save the route both locally and to the database.
    const addRouteJSON      : AddRouteJSON    = map.current.exportAddRouteJSON();
    const supabaseRoute     : SupabaseRoute   = map.current.exportSupabaseRoute();

    // Send a call the addTrip api.
    console.log(`SaveRouteButton: 📡 Saving route to database...`);
    addTrip(session.access_token, addRouteJSON).then((result: any) => {

      // If successful
      if(result){
        console.log(`SaveRouteButton: 🛰 Route saved to database successfully. (url: ${result.url_slug})`);
        // Provide route with generated url for upserting.
        const routeWithURL : SupabaseRoute = {
          ...supabaseRoute,
          url_slug: result.url_slug
        };
        // Upsert in local storage to match database.
        upsertInStorage(result.url_slug, routeWithURL);
        
        // Clear local storage.
        sessionStorage.setItem(VIEWING_TRIP_KEY, JSON.stringify(routeWithURL));
        sessionStorage.removeItem(AUTOSAVED_TRIP_KEY);
        // Update trip url.
        map.current?.getRouteLayer().setUrlSlug(result.url_slug);
        updateUrlSlug(result.url_slug);
        // Record route as saved
        map.current?.getRouteLayer().setSaved(true);
        // Update spinning save icon
        updateButtonState(ProgressState.complete);

        // Update browser url to reflect route.
        const newUrl = `/?route=${result.url_slug}`;
        window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
      }else{
        console.log('SaveRouteButton: 🛑 An error occurred while saving to the database.');
        updateButtonState(ProgressState.error);
      }
    });
  };

  // Match progress state to text.
  let text: string = errorText;
  switch (buttonState) {
    case ProgressState.initial : {
      text = initialText;
      break;
    }
    case ProgressState.progress : {
      text = progressText;
      break;
    }
    case ProgressState.complete : {
      text = completeText;
      break;
    }
  }

  return (
    <>
      <Button 
        endIcon={getIcon(buttonState)} 
        onClick={handleClick} 
        disabled={
          map.current?.getRouteLayer().getSaved() === true || 
          buttonState === ProgressState.complete} 
        {...props}
      >
        <div className="text-sm px-1 font-semibold">{text}</div>
      </Button>
      <MenuDialog
      open={open}
      handleClose={handleClose} 
      title={<>Sign in to save your route.</>} 
      text ={<>You are not signed in, sign in or create an account to save your route.</>} 
    >
      <Button autoFocus onClick={handleClose}>
        <div className="font-semibold text-sm">
          Back
        </div>
      </Button>
      <Button onClick={handleProceed} href="/signin" autoFocus>
        <div className="font-semibold text-sm">
          Sign In
        </div>
      </Button>
    </MenuDialog>
  </>
  );
};

export default CustomButton;