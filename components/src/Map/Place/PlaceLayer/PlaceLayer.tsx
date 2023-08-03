import * as $ from "jquery";

import Feature from 'ol/Feature';
import Coordinate from 'ol/coordinate';
import Extent from 'ol/extent';
import geom, { Point } from 'ol/geom';
import { WebGLPoints } from 'ol/layer';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

import Map from '@/components/src/Map/Map';
import Place from '@/components/src/Map/Place/Place';
import SVGPlaceLayer from '@/components/src/Map/Place/PlaceLayer/SVGPlaceLayer';
import WebGLPlaceLayer from '@/components/src/Map/Place/PlaceLayer/WebGLPlaceLayer';

import getPlaces    from '@/components/api/getPlaces';
import getPlaceById from '@/components/api/getPlaceById';

interface PlaceDict {
    [key: number]: Place;
}

export default class PlaceLayer {
    private map             : Map;
    private svgLayer        : SVGPlaceLayer;
    private webGLLayer      : WebGLPlaceLayer;
    private attached        : boolean   = true;
    private disabled        : boolean   = false;
    private scale           : number    = 12;
    private places          : Array<Place> = [];
    private placeDict       : PlaceDict = {};
    private localPlaceDict  : PlaceDict = {};
    private visiblePlaces   : Array<string> = [];

    public getPlaceById = (id : number) : Place | undefined => {
        // return place if in dict
        if(id in this.placeDict) return this.placeDict[id];
        // return undefined if not in dict
        return undefined;
    }

    public removeNotInExtent = (extent : Extent.Extent) : void => {
        var featuresInExtent  : Feature<geom.Geometry>[] = this.svgLayer.getFeaturesInExtent(extent);
        for(var place of this.places){
            if(place.getSelected() || featuresInExtent.includes(place.getFeature())) continue;
            this.removePlace(place);
        }
    }

    public addPlacesInExtent = (extent : Extent.Extent) : void => {
        // get the bounds of the map view
        const types = this.visiblePlaces;
        getPlaces(types, extent).then(({ data } : { data : any }) => {
            if(data === null){
                console.error(`Failed to retrieve data for types "${types}"`);
                return;
            }
            // Append results to features array
            for (const element of (data as Array<any>)) {
                this.addPlace(new Place(
                    element['type'],
                    element['name'],
                    element['id'],
                    [ element['lon'], element['lat']],
                    element['info']
                ));
            }
        });
    }

    public addPlaceById = (id : number) : void => {
        // get the bounds of the map view
        getPlaceById(id).then(({ data } : { data : any }) => {
            if(data === null){
                console.error(`Failed to retrieve data for id "${id}"`);
                return;
            }
            // Append results to features array
            for (const element of (data as Array<any>)) {
                this.addPlace(new Place(
                    element['type'],
                    element['name'],
                    element['id'],
                    [ element['lon'], element['lat']],
                    element['info']
                ));
            }
        });
    }

    public isMouseNear = ( mouseCoords : Coordinate.Coordinate, place : Place ) : boolean => {
        const coords    = place.getCoordinates();
        const distance  = Math.sqrt(Math.pow(mouseCoords[0] - coords[0], 2) + Math.pow(mouseCoords[1] - coords[1], 2));
        const scale     = 0.156 * Math.pow(this.map.getZoom(), 2) * this.map.getResolution();
        const radius    = place.getScale() * scale;
        const inLowerRight          = (coords[0] < mouseCoords[0]) && (coords[1] > mouseCoords[1]);
        const insideRadius          = distance <= radius;
        const insideLargerRadius    = distance <= radius + 2.0 * scale;
        // in order to prevent the info from disappearing before the mouse reaches it,
        // we must check for a larger radius in the bottom right corner    
        return ( insideRadius || ( inLowerRight && insideLargerRadius ) );
    }

    public getHoveredPlace = (mouseCoords : Coordinate.Coordinate) : Place | undefined => {
        for(var place of this.places){
            if(!place.getVisible()) continue;
            const coords = place.getCoordinates();
            const distance = Math.sqrt(Math.pow(mouseCoords[0] - coords[0], 2) + Math.pow(mouseCoords[1] - coords[1], 2));
            const radius = 0.156*place.getScale()*Math.pow(this.map.getZoom(), 2) * this.map.getResolution();
            const insideRadius          = distance <= radius;
            if( insideRadius ) return place;
        }
        return undefined;
    }

    public getLayers = () : Array<VectorLayer<VectorSource> | WebGLPoints<VectorSource<Point>>> => {
        return [...[this.svgLayer.getLayer(), ...this.webGLLayer.getLayers()]];
    }
    
    constructor(map : Map){
        this.map        = map;
        this.svgLayer   = new SVGPlaceLayer(map);
        this.webGLLayer = new WebGLPlaceLayer();
    }

    public setVisible = (visiblePlaces : Array<string>) : void => {
        this.visiblePlaces = visiblePlaces;
        for(var place of this.places){
            if( place.getSelected() ) continue;
            place.setVisible(this.visiblePlaces.includes(place.getType()));
        }
    }

    public addPlace = (place : Place) : Place => {
        const id = place.getId();
        if(id === undefined) {
            const local_id = place.getLocalId();
            if(local_id in this.localPlaceDict) return this.localPlaceDict[local_id];
            this.localPlaceDict[local_id] = place;
        }else{
            if(id in this.placeDict) return this.placeDict[id];
            this.placeDict[id] = place;
        }
        this.places.push(place);
        this.svgLayer.addPlace(place);
        this.webGLLayer.addPlace(place);
        return place;
    }

    public removePlace = (place : Place) : void => {
        const id        = place.getId();
        const local_id  = place.getLocalId();
        let found_place : Place;

        if(id === undefined) {
            if(!(local_id in this.localPlaceDict)) return;
            found_place = this.localPlaceDict[local_id];
        }else{
            if(!(id in this.placeDict)) return;
            found_place = this.placeDict[id];
        }

        var index = this.places.indexOf(found_place);
        if (index !== -1) {
            this.places.splice(index, 1);
        }   
        this.svgLayer.removePlace(  found_place);
        this.webGLLayer.removePlace(found_place);

        if(id === undefined) {
            delete this.localPlaceDict[local_id];
        }else{
            delete this.placeDict[id];
        }
    }

    // clear any attribs on places and remove user created places
    public removeType = (type : string) : void => {
        for(const place of this.places){
            if(place.getType() === type) this.removePlace(place);
        }
    }

    // clear any attribs on places and remove user created places
    public resetPlaces = () : void => {
        for(const place of this.places){
            place.reset();
        }
    }

    public removePlaces = () : void => {
        this.localPlaceDict = {};
        this.placeDict = {};
        this.places = [];
        this.svgLayer.removePlaces();
        this.webGLLayer.removePlaces();
    }
}
