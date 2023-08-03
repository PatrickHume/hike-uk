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
EventSleep properties
*/
interface EventProps {
  place : Place;
}
/*
Sleeping event
*/
const EventSleep: React.FC<EventProps> = ({place}) => {
  return (
  <Event>   
    • Sleep at <Link href="#">{place.getName()}</Link>
  </Event>
  );
};

EventSleep.displayName = 'EventSleep';
export default EventSleep;
