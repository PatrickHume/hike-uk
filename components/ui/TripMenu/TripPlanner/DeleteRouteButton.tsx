import MenuDialog                         from '@/components/ui/TripMenu/MenuDialog';
import { useTheme }                       from '@mui/material/styles';
import useMediaQuery                      from '@mui/material/useMediaQuery';
import { DeleteRouteJSON, SupabaseRoute } from '@/api/types';
import deleteTrip                         from '@/components/api/deleteTrip';
import Map, { MenuState }                 from '@/components/src/Map/Map';
import DoneIcon                           from '@mui/icons-material/Done';
import ErrorIcon                          from '@mui/icons-material/PriorityHigh';
import SaveIcon                           from '@mui/icons-material/Save';
import Button, { ButtonProps }            from '@mui/material/Button';
import CircularProgress                   from '@mui/material/CircularProgress';
import { Auth }                           from '@supabase/ui';
import React, { useState }                from 'react';
import { AUTOSAVED_TRIP_KEY, SAVED_TRIPS_KEY, VIEWING_TRIP_KEY } from '@/components/src/Constants/SessionKeys';

// Match progress state to icon
const getIcon : (progressState : ProgressState) => JSX.Element = (progressState : ProgressState) => {
  switch (progressState) {
    case ProgressState.initial :  return <SaveIcon/>;
    case ProgressState.progress : return <CircularProgress size={20}/>;
    case ProgressState.complete : return <DoneIcon/>;
  }
  return <ErrorIcon/>;
}

interface CustomButtonProps extends ButtonProps {
  map           : React.MutableRefObject<Map | undefined>;
  updateUrlSlug : React.Dispatch<React.SetStateAction<string>>;

  initialText : string;
  progressText  : string;
  completeText   : string;
  errorText   : string;
}

// States relating to the delete route button icon
enum ProgressState {
  initial,
  progress,
  complete,
  error,
}

// Delete a route from the local storage
const removeFromStorage = (urlSlugToRemove : string) : void => {
    // Get the local trips to upsert into
    const savedTripsStr = sessionStorage.getItem(SAVED_TRIPS_KEY);
    // Return if failed
    if (savedTripsStr === null) {
      console.log('DeleteRouteButton: 🛑 Error, saved trips is null.');
      return;
    }
    // Look for urlSlug and remove entry 
    try {
      const savedTrips = JSON.parse(savedTripsStr) as Array<SupabaseRoute>;
      const indexToRemove = savedTrips.findIndex((trip) => trip.url_slug === urlSlugToRemove);
      // If trip in array, remove it
      if (indexToRemove !== -1) {
        savedTrips.splice(indexToRemove, 1);
        // Write the resulant array back to local storage
        const updatedSavedTripsStr = JSON.stringify(savedTrips);
        sessionStorage.setItem(SAVED_TRIPS_KEY, updatedSavedTripsStr);
        console.log('DeleteRouteButton: 📦 Trip removed locally.');
      } else {
        console.log('DeleteRouteButton: 🛑 Error, trip not found in local storage.');
      }
    } catch (error) {
      console.log('DeleteRouteButton: 🛑 An error occurred while processing local trips:', error);
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
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    // The state of the delete button.
    const [buttonState, updateButtonState] = useState<ProgressState>(ProgressState.initial);
    // Used to check if user is signed in.
    const { user, session } = Auth.useUser()

    /* This is the state of the dialog box which appears when users attempt 
    to delete a route. */
    const [open, setOpen] = React.useState(false);
    // Handle open and proceed on the dialog box.
    const handleClickOpen = () => { setOpen(true); };
    const handleClose = () => { setOpen(false); }  
    // Handle proceed through dialog
    const handleProceed = () => {
      // Close the dialog
      setOpen(false);
      if( map.current === undefined ) return;

      // Check that the user is signed in
      if( session === null ){
        console.log('DeleteRouteButton: 🛑 Error, cannot delete trip. User not signed in.');
        sessionStorage.removeItem(AUTOSAVED_TRIP_KEY);
        return;
      }
      // Show spinning progress wheel.
      updateButtonState(ProgressState.progress);
      // Get the slug of the current trip.
      const urlSlugToRemove = map.current.getRouteLayer().getUrlSlug();
      // Remove from local storage.
      removeFromStorage(urlSlugToRemove);

      // Make a call to remove the trip from the database.
      console.log(`DeleteRouteButton: 📡 Deleting the route from the database...`);
      const deleteRouteJSON : DeleteRouteJSON  = { url_slug: urlSlugToRemove };
      deleteTrip(session.access_token, deleteRouteJSON).then((result: any) => {
        // If successful, stop viewing the trip
        if(result){
          console.log(`DeleteRouteButton: 🛰 Route deleted from database successfully.`);
          // Clear local storage
          sessionStorage.removeItem(VIEWING_TRIP_KEY);
          // Reset map
          map.current?.clear();
          // Update button icon
          updateButtonState(ProgressState.complete);
          // Navigate to main menu
          map.current?.setMenuState(MenuState.main);
        }else{
          // Otherwise report an error
          console.log('DeleteRouteButton: 🛑 Error, failed to delete trip from database.');
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
    <div>
      <Button 
        variant="outlined" 
        onClick={handleClickOpen} 
        endIcon={getIcon(buttonState)} 
        disabled={map.current?.getRouteLayer().getSaved() !== true} 
        {...props}
      >
      <div className="text-sm px-1 font-semibold">{text}</div>
      </Button>
      <MenuDialog
        open={open}
        handleClose={handleClose} 
        title={<>Are you sure?</>} 
        text ={<>You are about to permanently delete the route <strong><em><q>{map.current?.getRouteLayer().getName() ?? "Unnamed Route"}</q></em></strong></>} 
      >
        <Button autoFocus onClick={handleClose}>
          <div className="font-semibold text-sm">
            Cancel
          </div>
        </Button>
        <Button onClick={handleProceed} autoFocus>
          <div className="font-semibold text-sm">
            Delete Route
          </div>
        </Button>
      </MenuDialog>
    </div>
  );
};

export default CustomButton;
