import React, { ReactNode, useEffect, useRef, useState, MutableRefObject } from 'react';
import Map          from '@/components/src/Map/Map';
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
import { SvgIconComponent } from "@mui/icons-material";
/*
Day properties
*/
interface InfoPlaceProps {
    defaultName?    : string;
    Icon?           : SvgIconComponent;
    map             : MutableRefObject<Map | undefined>;
    info            : {
        [key: string]: any;
    } | undefined;
    sleeping?       : boolean | undefined;
    updateSleeping? : React.Dispatch<React.SetStateAction<boolean>> | undefined;
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
const InfoPlace: React.FC<InfoPlaceProps> = ({defaultName="Unnamed Place", Icon=undefined, map, info=undefined, sleeping=undefined, updateSleeping=undefined}) => {
    if(info === undefined) return null;
    return (
            <>
            <div>
                {/* Sleep Button */}
                {sleeping !== undefined && updateSleeping !== undefined && (
                    <Tooltip title="Sleep here">
                    <StyledToggleButton
                        value="check"
                        selected={sleeping}
                        onClick={() => {
                        if(map.current === undefined) return;
                        updateSleeping(!sleeping);
                        map.current.updateSleeping(!sleeping);
                        }}
                    >
                        <BnbIcon style={{ fontSize: "18px" }}/>
                    </StyledToggleButton>
                    </Tooltip> )
                }

                {/* Title */}
                {Icon !== undefined && (
                <Chip
                className="text-black text-xs italic font-semibold ml-1"
                label={
                    <>
                    <div className="pr-2" style={{ display: "inline-block" }}>
                    <Icon style={{ fontSize: "18px" }}/>
                    </div>
                    <a
                    href={info['website']}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-black text-xs italic font-semibold ${info['website'] ? 'underline' : ''}`}
                    style={{ display: "inline-block" }}
                    >
                    {info['name'] || defaultName}
                    </a>
                    </>
                }
                />)}
                {Icon === undefined && (
                    <div
                    className={`text-black text-xs italic font-semibold px-1`}
                    style={{ display: "inline-block" }}
                    >
                    {info['name'] || defaultName}
                    </div>  ) 
                }

                {/* Fireplace and storm shelter labels */}
                {(info['fireplace'] === 'yes' || info['fireplace'] === 'stove') && 
                    <div className="pl-1" style={{display : 'inline-block'}}>
                        <Tooltip title="This bothy has a fireplace">
                            <StyledToggleButton
                            value=""
                            selected={true}
                            onClick={() => {}}
                            color="error"
                            >
                            <FireIcon style={{ fontSize: "18px" }}/>
                            </StyledToggleButton>
                        </Tooltip>
                    </div>
                }

                {(info['shelter_type'] === 'weather_shelter' || (info['name'] || "").toLowerCase().includes('refuge')) &&          
                    <div className="pl-1" style={{display : 'inline-block'}}>
                        <Tooltip title="This bothy is listed as an emergency shelter">
                            <StyledToggleButton
                            value=""
                            selected={true}
                            onClick={() => {}}
                            color="info"
                            >
                            <StormIcon style={{ fontSize: "18px" }}/>
                            </StyledToggleButton>
                        </Tooltip>
                    </div>
                }

            </div>
            </>
    );
    };

    InfoPlace.displayName = 'InfoPlace';
    export default InfoPlace;


