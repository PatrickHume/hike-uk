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
EventWalk properties
*/
interface EventProps {
  source  : Place;
  dest    : Place;
  distance: number;
}
/*
Walking event
*/
const EventWalk: React.FC<EventProps> = ({source, dest, distance = 0}) => {
  return (
  <Event>   
    • Walk from <Link href="#">{source.getName()}</Link> to <Link href="#">{dest.getName()}</Link> <Chip className="mx-2" size="small" label={`${distance == 0 ? '?' : distance.toFixed(1)}km`} />
  </Event>
  );
};

EventWalk.displayName = 'EventWalk';
export default EventWalk;
