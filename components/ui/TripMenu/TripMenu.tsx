import { SupabaseRoute }              from '@/api/types';
import getTrips                       from '@/components/api/getTrips';
import Map, { MenuState }             from '@/components/src/Map/Map';
import MenuDialog                     from '@/components/ui/TripMenu/MenuDialog';
import TripList                       from '@/components/ui/TripMenu/TripList/TripList';
import TripPlanner                    from '@/components/ui/TripMenu/TripPlanner/TripPlanner';
import AddIcon                        from '@mui/icons-material/Add';
import ArrowBackIcon                  from '@mui/icons-material/ArrowBack';
import MenuIcon                       from '@mui/icons-material/Menu';
import Button                         from '@mui/material/Button';
import IconButton                     from '@mui/material/IconButton';
import ListItemIcon                   from '@mui/material/ListItemIcon';
import ListItemText                   from '@mui/material/ListItemText';
import MenuItem                       from '@mui/material/MenuItem';
import MenuList                       from '@mui/material/MenuList';
import { Auth }                       from '@supabase/ui';
import React, { useEffect, useState } from 'react';
import { 
  AUTOSAVED_TRIP_KEY, 
  SAVED_TRIPS_KEY, 
  VIEWING_TRIP_KEY } 
  from '@/components/src/Constants/SessionKeys';

// Styling for the trip menu
const outerTripStyle = (height : string) : React.CSSProperties => {
  const style : React.CSSProperties = {
    position: "absolute",
    height: height,
    width: 'auto',
    zIndex: '4',
    pointerEvents: 'none',
  };
  return style
};
const innerTripStyle : React.CSSProperties = {
  borderRadius: '10px',
  height: 'auto',
  width:  'auto',
  minWidth:  '300px',
  maxHeight: '100%',
  zIndex: '4',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  pointerEvents: 'auto',
};

// The trip object properties
interface TripProps {
  map             : React.MutableRefObject<Map | undefined>;
  menuState       : MenuState;
  updateMenuState : React.Dispatch<React.SetStateAction<MenuState>>;
  tripPlan        : boolean;
  height          : string;
}

// Get the correct text for the submenu title based on the state
const getTitleText = (menuState : MenuState) : string => {
  switch (menuState) {
    case MenuState.view : {
      return "View Route";
    }
    case MenuState.edit : {
      return "Edit Route";
    }
    case MenuState.routes : {
      return "My Routes";
    }
    default : {
      return "";
    }
  }
  return "";
}

/*
TripMenu is the window which allows users to view and interact with trips.
*/
const TripMenu: React.FC<TripProps> = ({map, menuState, updateMenuState, tripPlan, height}) => {
  // loadedTrips is an array of trips owned by the user.
  // The user's trips are either loaded from session storage or from the getTrips api.
  const [loadedTrips, updateLoadedTrips] = useState<Array<SupabaseRoute> | undefined | null>(undefined);
  // The session is required to notify the user if they are not logged in.
  const { user, session } = Auth.useUser();
  // A dialog box is shown if the user attempts to exit the editing state without saving.
  const [showingDialog, updateShowingDialog] = React.useState(false);

  // Load trips
  useEffect(() => {
    // If user not signed in, skip searching for trips
    if(session === null) {
      console.log('TripMenu: (No user signed in.)');
      return;
    }
  
    // Load trips from session storage
    console.log('TripMenu: 📦 Checking local storage for trips...');
    const savedTrips = sessionStorage.getItem(SAVED_TRIPS_KEY);
    if (savedTrips) {
      // If trips are valid, move them into the tripList.
      const trips = JSON.parse(savedTrips);
      updateLoadedTrips(trips);
      console.log('TripMenu: 📦 User trips retrieved locally!');
      return;
    }

    // Trips are not valid, so...
    // If signed in, request routes
    console.log('TripMenu: No local trips found...');
    if(session !== null) {
      console.log('TripMenu: 📡 Calling api for user trips...');
      getTrips(session.access_token)
        .then((trips: any) => {
          if (trips !== undefined) {
            console.log('TripMenu: 🛰 User trips retrieved from api!');
            // if result is valid, save trips locally and move them into the trip list.
            sessionStorage.setItem(SAVED_TRIPS_KEY, JSON.stringify(trips));
            updateLoadedTrips(trips);
          } else {
            console.log('TripMenu: 🛑 Api request for trips failed (trips undefined).');
            // otherwise, clear trip list.
            updateLoadedTrips(null);
          }
        })
        .catch((error) => {
          // catch and display errors
          console.log('TripMenu: 🛑 Api request for trips failed (trips undefined).', error);
          updateLoadedTrips(null);
        })
    }
  }, []);

  // Functionality for the menu back button
  const navigateBack = () : void => {
    // Reset browser url, as no longer viewing a route
    const newUrl = `/`;
    window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
    // Clear local trip storage
    sessionStorage.removeItem(VIEWING_TRIP_KEY);
    sessionStorage.removeItem(AUTOSAVED_TRIP_KEY);
    // Reset the map
    map.current?.clear();
    // Navigate to main menu
    updateMenuState(MenuState.main);
  }

  // Boolean test used to trigger the popup warning on naviagate back
  const hasUnsavedChanges = () : boolean => {
    if(map.current === undefined) return false;
    const routeLayer = map.current.getRouteLayer();
    // Route is saved, show no warning
    if(routeLayer.getSaved() === true) return false;
    // If not editing, show no warning
    if(menuState !== MenuState.edit) return false;
    // If route is empty, show no warning
    if(routeLayer.getName() === "" && routeLayer.getRoutes().length === 0) return false;
    // Otherwise, route has unsaved changes
    return true;
  }

  // Handle the user pressing the back button
  const handleBack = () : void => {
    // If unsaved changes exist, show the dialog box
    if(hasUnsavedChanges()){
      updateShowingDialog(true);
      return;
    }
    // Otherwise navigate back
    navigateBack();
  }

  return (
    <>
    {/* The popup box used to prevent users from accidentally exiting with unsaved changes */}
      <MenuDialog
        open        ={ showingDialog }
        handleClose ={ () => { updateShowingDialog(false); } } 
        title       ={ <>Are you sure?</> } 
        text        ={ <>You have unsaved changes to your route.</> } 
      >
        <Button autoFocus onClick={() => { updateShowingDialog(false); }}>
          <div className="font-semibold text-sm">
            Cancel
          </div>
        </Button>
        <Button onClick={ () => { updateShowingDialog(false); navigateBack(); } } autoFocus>
          <div className="font-semibold text-sm">
            Discard Changes
          </div>
        </Button>
      </MenuDialog>

    {/* The main trip menu */}
      <div className="p-2" style={outerTripStyle(height)}>
        <div className="bg-white py-0" style={innerTripStyle}>

        {menuState !== MenuState.main ? (
          <div> {/* If in some submenu, display a title */}

            {/* Provide a back button */}
            <div className="p-2" style={{display : 'inline-block'}}>
              <IconButton onClick={() => {handleBack();}}>
                <ArrowBackIcon fontSize="small" className="text-black" />
              </IconButton>
            </div>
            {/* Display menu title text */}
            <div className="" style={{display : 'inline-block'}}>
              <div className="text-black font-semibold">{ getTitleText(menuState) }</div>
            </div>

          </div>
        ) 
        :
        (
        <MenuList> {/* If in the main menu, list all the submenus */}

        {/* Create Route Button */}
          <MenuItem onClick={() => {
            // Navigate to edit or view state depending on the currently loaded map.
            updateMenuState(map.current?.getRouteLayer().getEditing() ? MenuState.edit : MenuState.view);
          }}>
            {/* Decorate with a plus icon */}
            <ListItemIcon>
              <AddIcon fontSize="small" className="text-black" />
            </ListItemIcon>
            {/* Text Label */}
            <ListItemText>
              <div className="text-black font-semibold py-0" style={{display : 'inline-block'}}>
                Create Route
              </div>
            </ListItemText>
          </MenuItem>

        {/* View My Routes Button */}
          <MenuItem onClick={() => {
            // Reset map and navigate to routes submenu on click.
            sessionStorage.removeItem(VIEWING_TRIP_KEY);
            sessionStorage.removeItem(AUTOSAVED_TRIP_KEY);
            map.current?.clear();
            updateMenuState(MenuState.routes);
          }}>
            {/* Decorate with menu icon */}
            <ListItemIcon>
              <MenuIcon className="text-black" fontSize="small" />
            </ListItemIcon>
            {/* Text Label */}
            <ListItemText>
              <div className="text-black font-semibold py-0" style={{display : 'inline-block'}}>
                View Routes
              </div>
            </ListItemText>
          </MenuItem>

        </MenuList>
        )}

        {/* If state is view or edit, provide the trip planner */}
        {(menuState === MenuState.view || menuState === MenuState.edit) && map.current !== undefined && (
          <TripPlanner map={map} menuState={ menuState }/>
        )}

        {/* If state is routes, provide with an interactable list of the user's routes */}
        {menuState === MenuState.routes && (
          <TripList map={map} loadedTrips={loadedTrips} updateLoadedTrips={updateLoadedTrips}/>
        )}

      </div>
    </div>
  </>
  );
};

TripMenu.displayName = 'TripMenu';
export default TripMenu;
