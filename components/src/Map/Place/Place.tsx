
import Feature from 'ol/Feature';
import Coordinate from 'ol/coordinate';
import { Point } from 'ol/geom';
import { fromLonLat } from 'ol/proj';
import addPlace from '@/components/api/addPlace';
import { red, lightGreen, grey, teal, orange, brown } from '@mui/material/colors';
const colourRed         = red[500];
const colourLightGreen  = lightGreen[500];
const colourGrey        = grey[500];
const colourTurquoise   = teal[500];
const colourOrange      = orange[500];
const colourBrown       = brown[500];
const colourBlack       = '#000000'

import { 
    SupabasePlace,
    SupabasePlaceInfo,
  } from '@/api/types';
export interface PlaceSVGStyle {
  type: string;
  icon: any;
  color: string;
}

export const TypeColourMap: Record<string, string> = {
  'bothy'           : colourRed,
  'campsite'        : colourLightGreen,
  'cave'            : colourGrey,
  'train_station'   : colourTurquoise,
  'supermarket'     : colourOrange,
  'pub'             : colourBrown,
  'route_marker'    : colourBlack,
};

export const TypeScaleMap: Record<string, number> = {
  'bothy'           : 0.5,
  'campsite'        : 0.5,
  'cave'            : 0.5,
  'train_station'   : 0.5,
  'supermarket'     : 0.5,
  'pub'             : 0.5,
  'route_marker'    : 0.2,
};

const convertColor = (color: string) : [number, number, number] | null => {
    const regex = /^#([A-Fa-f0-9]{6})$/;
    const match = color.match(regex);
  
    if (match) {
      const hex = match[1];
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
  
      return [r, g, b];
    }
    return null;
  }

export default class Place {
    static lastId = 0;
    
    static generateUniqueId() {
        Place.lastId++;
        return Place.lastId;
    }

    private name        : string = 'unnamed feature';
    private type        : string = '';
    private id          : number | undefined = undefined;
    private local_id    : number;
    private feature     : Feature<Point>;
    private lonLat      : Coordinate.Coordinate;
    private coordinates : Coordinate.Coordinate;
    private scale       : number;
    private selected    : boolean = false;
    private highlighted : boolean = false;
    private visible     : boolean = true;
    private exists      : boolean = true; // Place is not yet in supabase db
    private info        : any;
    private colour      : string;

    private sleeping       : boolean = false;
    private restockWater   : number | undefined = undefined;
    private restockFood    : number | undefined = undefined;
    private notes          : string = "";

    public importPlaceInfoResponse = (info : SupabasePlaceInfo) : void => {
        this.setSleeping(       info.sleeping);
        this.setRestockFood(    info.restock_food);
        this.setRestockWater(   info.restock_water);
        this.setNotes(          info.notes);
    }

    public getRestockWater  = ()    : number | undefined => {
        return this.restockWater;
    }
    public getRestockFood   = ()    : number | undefined  => {
        return this.restockFood;
    }
    public getNotes         = ()    : string => {
        return this.notes;
    }

    public getName = ()         : string => {
        return this.name;
    }
    public getSelected = ()     : boolean => {
        return this.selected;
    }
    public gethighlighted = ()  : boolean => {
        return this.highlighted;
    }
    public getSleeping = ()     : boolean => {
        return this.sleeping;
    }
    public getVisible = ()      : boolean => {
        return this.visible;
    }
    public getLocal = ()        : boolean => {
        return this.exists;
    }
    public getScale = ()        : number => {
        return this.scale;
    };
    public getId = ()           : number | undefined => {
        return this.id;
    };
    public getLocalId = ()      : number => {
        return this.local_id;
    };
    public getInfo = ()         : any => {
        return this.info;
    };
    public getColour = ()       : string => {
        return this.colour;
    };
    public getFeature = ()      : Feature<Point> => {
        return this.feature;
    };
    public getLonLat = ()       : Coordinate.Coordinate => {
        return this.lonLat;
    };
    public getCoordinates = ()  : Coordinate.Coordinate => {
        return this.coordinates;
    };
    public getType = ()         : string => {
        return this.type;
    };

    public setSelected = (selected : boolean) : void => {
        this.feature.set('selected', selected ? 'yes' : 'no');
        this.selected = selected;
    }
    public setHighlighted = (highlighted : boolean) : void => {
        this.feature.set('highlighted', highlighted ? 'yes' : 'no');
        this.highlighted = highlighted;
    }
    public setSleeping = (sleeping : boolean) : void => {
        this.info['sleeping'] = sleeping;
        this.feature.set('sleeping', sleeping ? 'yes' : 'no');
        this.sleeping = sleeping;
    }
    public setVisible = (visible : boolean) : void => {
        this.feature.set('visible', visible ? 'yes' : 'no');
        this.visible = visible;
    }
    public setScale = (scale : number) : void => {
        this.feature.set('scale', scale);
        this.scale = scale;
    }
    public setName = (name : string) : void => {
        this.feature.set('name', name);
        this.name = name;
    }
    public setId = (id : number) : void => {
        this.feature.set('id', id);
        this.id = id;
    }
    public setInfo = (info : any) : void => {
        this.feature.set('info', info);
        this.info = info;
    }
    public setColour = (colour : string) : void => {
        this.feature.set('colour', colour);
        this.colour = colour;

        const convertedColor = convertColor(this.colour);
        if(!convertedColor) return; 
        const [red, green, blue] = convertedColor;
        this.feature.set('red',     red);
        this.feature.set('green',   green);
        this.feature.set('blue',    blue);
        
    }
    public setType = (type : string) : void => {
        this.feature.set('type', type);
        this.type = type;
    }
    public setRestockWater  = (restockWater : number | undefined)   : void => {
        this.restockWater = restockWater;
    }
    public setRestockFood   = (restockFood : number | undefined)    : void => {
        this.restockFood = restockFood;
    }
    public setNotes         = (notes : string)    : void => {
        this.notes = notes;
    }

    public getSupabasePlaceInfo = () : SupabasePlaceInfo => {
        const place : SupabasePlace = {
            id      : this.id,
            type    : this.type,
            name    : this.name,
            lon     : this.lonLat[0],
            lat     : this.lonLat[1],
            info    : this.info,
        };
        const placeInfo : SupabasePlaceInfo = {
            place           : place,
            sleeping        : this.sleeping,
            restock_water   : this.restockWater,
            restock_food    : this.restockFood,
            notes           : this.notes,
        }
        return placeInfo
    }

    public reset = (): void => {
        this.setSelected(false);
        this.setHighlighted(false);
        this.setSleeping(false);
        this.setRestockWater(undefined);
        this.setRestockFood(undefined);
        this.setNotes("");
    }

    constructor(
        type        : string,
        name        : string,
        id          : number | undefined,
        lonLat      : Coordinate.Coordinate,
        info        : any       = {},
        scale      ?: number,
        colour     ?: string,
    ){
        this.type           = type;
        this.name           = name;
        this.id             = id;
        this.local_id       = Place.generateUniqueId();
        this.lonLat         = lonLat;
        this.coordinates    = fromLonLat(lonLat);
        this.info           = info;
        this.scale          = scale     ?? (    type in TypeScaleMap     ? TypeScaleMap[type]    : 0.5          );
        this.colour         = colour    ?? (    type in TypeColourMap    ? TypeColourMap[type]   : colourBlack  );
        this.exists         = (id !== undefined);
        
        this.info['map_category'] = type;
        this.info['sleeping']     = false;

        this.feature = new Feature<Point>({
            geometry: new Point( this.coordinates )
        });

        this.setType(           this.type);
        this.setHighlighted(    this.highlighted);
        this.setSelected(       this.selected);
        this.setSleeping(       this.sleeping);
        this.setVisible(        this.visible);
        this.setScale(          this.scale);
        this.setInfo(           this.info);
        this.setColour(         this.colour);
    }
}
