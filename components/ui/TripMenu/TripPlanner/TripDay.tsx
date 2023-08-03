import React, { ReactNode } from 'react';
import Chip                 from '@mui/material/Chip';
import FoodIcon             from '@mui/icons-material/BakeryDining';
import WaterIcon            from '@mui/icons-material/WineBar';

const outerStyle : React.CSSProperties = {
  backgroundColor: '#F5F5F5',
  borderRadius: '10px',
  height: 'auto',
  zIndex: '4'
};
const innerStyle : React.CSSProperties = {
  backgroundColor: '#F5F5F5',
  borderRadius: '10px',
  height: 'auto',
  zIndex: '4',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

interface DayProps {
  number      :   number;
  distance    : number;
  foodAmount  : number;
  waterAmount : number;
  children    : ReactNode;
}
// Map quantity to colour.
const amountToColour = (amount : number) => {
  if(amount <= 0)       return 'error';
  else if(amount <= 1)  return 'warning';
  else                  return 'success';
};
/*
TripDay contains all the events and stats for a day in the trip planner.
*/
const TripDay: React.FC<DayProps> = ({number = 1, distance = 0, foodAmount = 0, waterAmount = 0, children=undefined}) => {
  return (
    <div className="px-4">
      <div className="p-2 max-w-6xl mx-auto my-4" style={outerStyle}>
      <div className="text-black">
        
        <div className="p-2 max-w-6xl mx-auto" style={innerStyle}>   
          {/* Show day number and distance. */}
          <div>
            <div  className="font-semibold italic" style={{display : 'inline-block'}} >Day {number} </div>
            <div  className="ml-1 text-sm italic" style={{display : 'inline-block'}} > - {distance == 0 ? '?' : distance.toFixed(1)}km </div>
          </div>

          {/* Show current food and water as icons. */}
          <div>
            <Chip icon={<FoodIcon />}   className="font-semibold mx-1" color={amountToColour(foodAmount)}  size="small" label={Math.max(foodAmount,  0)} /> 
            <Chip icon={<WaterIcon />}  className="font-semibold mx-1" color={amountToColour(waterAmount)} size="small" label={Math.max(waterAmount, 0)} />
          </div>
        </div>  

        {/* Display events */}
        {children}
      </div>
    </div>
  </div>
  );
};

TripDay.displayName = 'TripDay';
export default TripDay;
