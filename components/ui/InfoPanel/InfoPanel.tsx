import React, { ReactNode, useEffect, useRef, useState, MutableRefObject } from 'react';
import Map          from '@/components/src/Map/Map';
import InfoPlace    from '@/components/ui/InfoPanel/InfoPlace';
/*
UI Components
*/
import { styled } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import ToggleButton from '@mui/material/ToggleButton';
import ButtonGrid from '@/components/ui/ButtonGrid/ButtonGrid';
import ShortLink from '@/components/ui/ShortLink/ShortLink';
import Tooltip from '@mui/material/Tooltip';
/*
Icons
*/
import BothyIcon from '@mui/icons-material/GiteRounded';
import BnbIcon from '@mui/icons-material/HotelRounded';
import GroceryIcon from '@mui/icons-material/LocalGroceryStoreRounded';
import PetrolIcon from '@mui/icons-material/LocalGasStationRounded';
import FoodIcon from '@mui/icons-material/BakeryDining';
import WaterIcon from '@mui/icons-material/WineBar';
import DrawIcon from '@mui/icons-material/Draw';
import ClearIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import PubIcon from '@mui/icons-material/SportsBar';
import TentIcon from '@mui/icons-material/Style';
import CaveIcon from '@mui/icons-material/Terrain';
import ShowerIcon from '@mui/icons-material/Shower';
import TrainIcon from '@mui/icons-material/Train';
import FireIcon from '@mui/icons-material/LocalFireDepartment';
import StormIcon from '@mui/icons-material/Thunderstorm';
/*
Day properties
*/
interface InfoPanelProps {
    map             : MutableRefObject<Map | undefined>;
    info            : {
        [key: string]: any;
    } | undefined;
    infoPos         : Array<number>;
    infoVisible     : boolean;
    sleeping        : boolean;
    updateSleeping  : React.Dispatch<React.SetStateAction<boolean>>;
}
// make toggle button small and circular
const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
    borderRadius: '50%',
    border: 'none',
    width: '30px',
    height: '30px',
    padding: '0',
}));
/*
Create map
*/
const InfoPanel: React.FC<InfoPanelProps> = ({map, info=undefined, infoPos, infoVisible, sleeping, updateSleeping}) => {
    
    if(!infoVisible || info === undefined ) return null;

    return (
        <div
        className="p-2"
        style={{
            left: `${infoPos[0]}px` || "0",
            top: `${infoPos[1]}px` || "0",
            position: "absolute",
            height: 'auto',
            width: 'auto',
            zIndex: '3',
            pointerEvents: 'none',
        }}
        >
            <div
                className="px-2 bg-white py-2"
                style={{
                borderRadius: '25px',
                zIndex: '4',
                width: 'auto',
                height: 'auto',
                pointerEvents: 'auto',
                }}
            >
                
                {info['map_category'] === 'route_marker'    && <InfoPlace defaultName={'route_marker'}                            map={map} info={info} sleeping={sleeping} updateSleeping={updateSleeping}/>}
                {info['map_category'] === 'bothy'           && <InfoPlace defaultName={'Unnamed Bothy'}         Icon={BothyIcon}  map={map} info={info} sleeping={sleeping} updateSleeping={updateSleeping}/>}
                {info['map_category'] === 'campsite'        && <InfoPlace defaultName={'Unnamed Campsite'}      Icon={TentIcon}   map={map} info={info} sleeping={sleeping} updateSleeping={updateSleeping}/>}
                {info['map_category'] === 'cave'            && <InfoPlace defaultName={'Unnamed Cave'}          Icon={CaveIcon}   map={map} info={info} sleeping={sleeping} updateSleeping={updateSleeping}/>}
                {info['map_category'] === 'train_station'   && <InfoPlace defaultName={'Unnamed Station'}       Icon={TrainIcon}  map={map} info={info}/>}
                {info['map_category'] === 'supermarket'     && <InfoPlace defaultName={'Unnamed Supermarket'}   Icon={GroceryIcon}map={map} info={info}/>}
                {info['map_category'] === 'pub'             && <InfoPlace defaultName={'Unnamed Pub'}           Icon={PubIcon}    map={map} info={info}/>}
                {info['map_category'] === 'petrol'          && <InfoPlace defaultName={'Unnamed Petrol Station'}Icon={PetrolIcon} map={map} info={info}/>}

            </div>
        </div>
    );
    };

    InfoPanel.displayName = 'InfoPanel';
    export default InfoPanel;


