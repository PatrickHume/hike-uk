import React, { ReactNode, useEffect, useRef, useState } from 'react';
/* Event */
import Event from '@/components/ui/Event/Event';
/* Place */
import Place from '@/components/src/Map/Place/Place';
/*
UI Components
*/
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
/*
EventRestock properties
*/
interface EventProps {
  place : Place;
  verb? : string;
  item  : string;
}
/*
Restocking event for users to plan the purchase food from stores
*/
const EventRestock: React.FC<EventProps> = ({place, verb='Restock', item}) => {
  // this is an odd way of doing it.. but works for now
  var initialQuantity : number = 0;
  switch (item) {
    case 'food'   : {
      initialQuantity = place.getRestockFood() ?? 0;
      break;
    }
    case 'water'  : {
      initialQuantity = place.getRestockWater() ?? 0;
      break;
    }
    default       : {
      console.log(`EventRestock: 🛑 Error, restock type ${item} not found`);
      break;
    }
  }
  const [quantity, updateQuantity] = useState<number>(initialQuantity);
  // update the place attributes on interacting with the interface
  const handleRestockChange = (event : any) => {
    const value = parseInt(event.target.value);
    updateQuantity(value);
    // this is an odd way of doing it.. but works for now
    switch (item) {
      case 'food' : {
        place.setRestockFood(quantity);
        break;
      }
      case 'water' : {
        place.setRestockWater(quantity);
        break;
      }
      default : {
        console.log(`EventRestock: 🛑 Error, restock type ${item} not found`);
        break;
      }
    }
  };

  return (
  <Event>   
    • {verb} <input min="0" max="9" type="number" defaultValue={quantity} onChange={handleRestockChange} style={{
        width:'30px',
        textAlign: 'center',
        outline: 'none',
      }}>
    </input> days of {item} at <Link href="#">{place.getName()}</Link>  </Event>
  );
};

EventRestock.displayName = 'EventRestock';
export default EventRestock;
