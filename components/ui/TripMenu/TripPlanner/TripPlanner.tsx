import Map, { MenuState } from '@/components/src/Map/Map';
import Route              from '@/components/src/Map/Route/Route';
import RouteLayer         from '@/components/src/Map/Route/RouteLayer/RouteLayer';
import BuildIcon          from '@mui/icons-material/Build';
import ShareIcon          from '@mui/icons-material/Share';
import Button             from '@mui/material/Button';
import TextField          from '@mui/material/TextField';
import Tooltip            from '@mui/material/Tooltip';
import React, { ReactNode, useState } from 'react';
import DeleteRouteButton  from '@/components/ui/TripMenu/TripPlanner/DeleteRouteButton';
import EventRestock       from '@/components/ui/Event/EventRestock';
import EventSleep         from '@/components/ui/Event/EventSleep';
import EventWalk          from '@/components/ui/Event/EventWalk';
import SaveRouteButton    from '@/components/ui/TripMenu/TripPlanner/SaveRouteButton';
import TripDay            from '@/components/ui/TripMenu/TripPlanner/TripDay';
import { Auth }           from '@supabase/ui';

const buttonsStyle : React.CSSProperties = {
  height: 'auto',
  zIndex: '4',
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center'
};
interface TripProps {
  map      : React.MutableRefObject<Map | undefined>;
  menuState: MenuState;
}
/*
The Trip Planner is a submenu which allows users 
to view and edit trip data such as title, initial food, initial water, etc.

The Trip Planner also provides users with an overview of the trip as
an array of days, provided by the Map object.

Delete, Edit, Save, and Share buttons are also implemented.
*/
const TripPlanner: React.FC<TripProps> = ({map, menuState}) => { 
  // Get the user email. For the time being, the email is used as a sort of username.
  const { user, session } = Auth.useUser();
  const userEmail = user?.email ?? "";
  // The state of the tooltip, which tells user 
  // that the share link has been copied to the clipboard.
  const [showingToolTip, updateShowingToolTip] = React.useState(false);
  // The routeLayer object of the map is where all data about the trip is stored.
  const routeLayer    : RouteLayer | undefined = map.current?.getRouteLayer();
  // Some constants which may require the component to rerender when changed.
  const [initialFood,   updateInitialFood]  = useState<number>(routeLayer?.getInitialFood()  ?? 0);
  const [initialWater,  updateInitialWater] = useState<number>(routeLayer?.getInitialWater() ?? 0);
  const [name,          updateName]         = useState<string>(routeLayer?.getName()         ?? '');
  const [email,         updateEmail]        = useState<string>(routeLayer?.getEmail()        ?? '');
  const [urlSlug,       updateUrlSlug]      = useState<string>(routeLayer?.getUrlSlug() ?? '');
  if(map.current === undefined || routeLayer === undefined) return <></>; 
  
  // Copies the link of the route to the clipboard.
  const copyLink = () => {
    // If trip url not set, abort.
    if(urlSlug === '') return;
    const link = `${window.location.hostname}?route=${urlSlug}`;
    navigator.clipboard.writeText(link);
  }

  // The array of days in the trip, as html.
  const days      : Array<ReactNode> = [];
  // The array of events in each day (also as html), such as walking, sleeping, restocking, etc.
  var   events    : Array<ReactNode> = [];
  // The array of routes from which to construct the 'days' and 'events' arrays.
  const routes    : Array<Route> = routeLayer.getRoutes();

  // Update the editing status of the map. (Triggered on trip save.)
  const updateEditMode = (state : MenuState) => {
    map.current?.setMenuState(state);
  };

  // Handle initial food input change
  const handleInitialFoodChange = (event : any) => {
    // Update value in html and in map object
    const newValue : number = parseInt(event.target.value);
    routeLayer.setInitialFood(newValue);
    updateInitialFood(newValue);
    map.current?.getRouteLayer().setSaved(false);
  };

  // Handle initial water input change
  const handleInitialWaterChange = (event : any) => {
    // Update value in html and in map object
    const newValue : number = parseInt(event.target.value);
    routeLayer.setInitialWater(newValue)
    updateInitialWater(newValue);
    map.current?.getRouteLayer().setSaved(false);
  };

  // Handle initial water input change
  const handleNameChange = (event : any) => {
    // Update value in html and in map object
    const newValue : string = event.target.value;
    routeLayer.setName(newValue);
    updateName(newValue);
    map.current?.getRouteLayer().setSaved(false);
  }

  // Construct html elements to represent the trip as days of events
  var   dayNumber           = 1;
  var   foodAmount          = initialFood;
  var   restockFoodAmount   = 0;
  var   restockWaterAmount  = 0;
  var   waterAmount         = initialWater;
  var   dailyDistance       = 0;
  var   totalDistance       = 0;

  // For each route
  for (let i = 0; i < routes.length; i++) {
    // Construct walk event from source to dest
    var distance = routes[i]?.getDistance();
    events.push(<EventWalk source={routes[i].getSource()} dest={routes[i].getDest()} distance={distance}/>);
    // Accumulate distance
    dailyDistance += distance;
    totalDistance += distance;

    // If route is a special restock or refill type, provide restock events.
    // These are provided at the destination of a walk.
    const destPlace = routes[i].getDest();
    if(destPlace.getType() === 'supermarket' || destPlace.getType() === 'pub') {

      // Pubs allow for refilling of water only.
      events.push(<EventRestock place={destPlace} verb={'Fill up'}  item={'water'}/>);
      restockWaterAmount += destPlace.getRestockWater() ?? 0;

      // Supermarkets allow for the refilling of both food and water.
      if ( destPlace.getType() === 'supermarket' ) {
        events.push(<EventRestock place={destPlace} verb={'Purchase'} item={'food'}/>);
        restockFoodAmount  += destPlace.getRestockFood()  ?? 0;
      }

    }

    // If we are not sleeping at the destination, we can carry on creating events
    // without needing to create a new day.
    if(!routes[i].getDest().getSleeping()) continue;

    // Otherwise, we can add a sleep event at the destination.
    events.push(<EventSleep place={destPlace}/>);
    // And create a day to wrap up all the events we have created.
    days.push(<TripDay number={dayNumber} distance={dailyDistance} foodAmount={foodAmount} waterAmount={waterAmount}>
      {events}
    </TripDay>);

    // Increment day number, decrement food, accumulate restocks and reset events.
    dayNumber++;
    foodAmount = foodAmount <= 0 ? 0 : foodAmount-1;
    foodAmount += restockFoodAmount;
    restockFoodAmount = 0;
    waterAmount = waterAmount <= 0 ? 0 : waterAmount-1;
    waterAmount += restockWaterAmount;
    restockWaterAmount = 0;
    events = [];
    dailyDistance = 0;
  }

  // If there are events left over, i.e. the last day ended without a sleep, we must create a day to wrap up the remaining events.
  if(events.length !== 0){
    days.push(<TripDay number={dayNumber} distance={dailyDistance} foodAmount={foodAmount} waterAmount={waterAmount}>{events}</TripDay>);
    dayNumber++;
  }

  // The number of days to display.
  const numDays = Math.max(dayNumber-1,0);

  return (
    <>
    <div className="px-4">

      {/* Display the route title and owner. If editing, make the title configurable. */}
      <div className="px-2">
        {menuState === MenuState.edit ? 
          (
            <TextField defaultValue={name} fullWidth id="standard-basic" placeholder="Unnamed Route" variant="standard" className="px-2 text-black font-semibold pb-2 italic" onChange={handleNameChange} style={{display : 'inline-block'}}/>
          ) : (
            <>
              <div className="text-black text-xl font-bold py-0" style={{display : 'inline-block'}}>{name === "" ? "Unnamed Route" : name}</div>
              <div className="text-black text-md py-0 ml-2 text-gray-400 italic" style={{display : 'inline-block'}}>by {email === "" ? userEmail : email}</div>
            </>
          )
        }
      </div>

      <div className="p-2">

        {/* Display the trip stats, such as days, distance, etc. */}
        <div className="text-black font-semibold py-0 italic" style={{display : 'inline-block'}}>Route Stats</div>
        <div  className="text-black text-sm ml-4" style={{display : 'inline-block'}} >Days: <b>{numDays}</b> </div> 
        <div  className="text-black text-sm ml-4" style={{display : 'inline-block'}} >Total Distance: <b>{totalDistance.toFixed(1)}km</b> </div>
        {numDays !== 0 && <div  className="text-black text-sm ml-4" style={{display : 'inline-block'}} >Avg. Distance/Day: <b>{(totalDistance/numDays).toFixed(1)}km</b> </div>}
        
        {/* Provide inputs to adjust the initial food and water.
        If not editing, replace the inputs with regular text. */}
        <div>

            {/* Initial food value. */}
            <div className="text-black text-sm py-0" style={{display : 'inline-block'}} onChange={handleInitialFoodChange}>
              Initial Food: {menuState === MenuState.edit ? (
                <input min="0" max="9" type="number" defaultValue={initialFood} style={{
                width:'30px',
                textAlign: 'center',
                outline: 'none',
              }}>
              </input>
              ) : (
                <div className="text-black font-semibold text-sm p-0" style={{display : 'inline-block'}}>{initialFood}</div>
              )}
            </div>

            {/* Spacer. */}
            <div className="px-2" style={{display : 'inline-block'}}></div>
            
            {/* Initial water value. */}
            <div className="text-black text-sm py-0" style={{display : 'inline-block'}} onChange={handleInitialWaterChange}>
              Initial Water: {menuState === MenuState.edit ? (
                <input min="0" max="9" type="number" defaultValue={initialWater} style={{
                width:'30px',
                textAlign: 'center',
                outline: 'none',
              }}>
              </input>
              ) : (
                <div className="text-black font-semibold text-sm p-0" style={{display : 'inline-block'}}>{initialWater}</div>
              )}
            </div>
            
        </div>
      </div>
    </div>

    {/* If no days found, display prompt to start routing. */}
    {days.length === 0 ? (
      <div className="p-4">
      <div className="text-gray-400 font py-0" style={{display : 'inline-block'}}>Start routing to create some days...</div>
      </div>
    ) : (
    /* 
    Otherwise, display days.
    (Wrapped in a div to make long routes scroll instead of expanding down the screen.) 
    */
      <div style={{ height: '100%', overflowY: 'auto', /* relevant part */}}>
      {days}
      </div>)}

    {/* Display the delete, share, and edit/save buttons */}
    <div className="p-4">
      <div className="max-w-6xl mx-auto" style={buttonsStyle}>   

        {/* If route is saved, display delete route button */}
        {( (email === userEmail || email === "") && urlSlug !== "" ) && (
          <DeleteRouteButton 
                map={map}
                updateUrlSlug={updateUrlSlug} 
                variant       = "outlined"
                initialText   = "Delete"
                progressText  = "Delete"
                completeText  = "Deleted"
                errorText     = "Error"/>
        )}

        {/* Provide a tooltip to notify the user 
        that the link has been copied to the clipboard */}
        <div className="px-2">
        <Tooltip
                PopperProps={{
                  disablePortal: true,
                }}
                onClose={ () => {updateShowingToolTip(false);} }
                open={showingToolTip}
                disableFocusListener
                disableHoverListener
                disableTouchListener
                title="Link copied to clipboard"
              >
          <Button variant="outlined" onClick={() => {updateShowingToolTip(true); copyLink();}} disabled={map.current?.getRouteLayer().getSaved() !== true || urlSlug === ''} startIcon={<ShareIcon/>}><div className="text-sm px-1 font-semibold">Share</div></Button>
        </Tooltip>
        </div>

        {/* If route is saved, display an edit button.
        If Editing, display a save button. */}
        <div className="">
        {menuState === MenuState.edit ? 
          (
        /* The save button writes sends a request to the addTrip api, saving the route
        to the user's account. */
            <SaveRouteButton 
              map={map}
              updateUrlSlug={updateUrlSlug} 
              variant       = "outlined"
              initialText   = "Save"
              progressText  = "Save"
              completeText  = "Saved"
              errorText     = "Error"/>
          ) : (
        
        /* If not editing, provide a button which allows users to enter edit mode.
        If the route belongs to another user, create a copy of the route
        and clear the ownership on the local copy. */
            <Button 
            variant="outlined" 
            onClick={() => {
              // Check if belongs to other user
              if(!(email === userEmail || email === "")){
                // Update name
                const newName = `Copy of ${name}`;
                routeLayer.setName(newName);
                updateName(newName);
                // Clear url
                const newUrl = `/`;
                window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);  
                // Clear url slug
                routeLayer.setUrlSlug('');
                updateUrlSlug('');
                // Set saved false
                map.current?.getRouteLayer().setSaved(false);
              }
              // Switch to edit mode
              updateEditMode(MenuState.edit);
            }}
            // Decorate with build icon.
            startIcon={<BuildIcon/>}>
              <div className="text-sm px-1 font-semibold">
                {email === userEmail || email === "" ? "Edit" : "Edit a copy"}
              </div>
            </Button>
          )
        }
        </div>  
      </div>  
    </div>  

  </>
  );
};

TripPlanner.displayName = 'TripPlanner';
export default TripPlanner;
