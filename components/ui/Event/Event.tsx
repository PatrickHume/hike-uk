import React, { ReactNode, useEffect, useRef, useState } from 'react';

/*
Event properties
*/
interface EventProps {
  children: ReactNode;
}
/*
Event - this acts as a template for other events such as walks, sleeps, restocking at shops etc.
events are displayed within each TripDay of TripPlanner.
*/
const Event: React.FC<EventProps> = ({children}) => {
  return (
  <div
  className="p-2 max-w-6xl mx-auto py-0 text-sm"
  style={{
    backgroundColor: '#F5F5F5',
    borderRadius: '10px',
    height: 'auto',
    zIndex: '4'
  }}
  >   
  {children}
  </div>
  );
};

Event.displayName = 'Event';
export default Event;
