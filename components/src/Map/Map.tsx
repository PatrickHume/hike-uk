import 'ol/ol.css';

import React from 'react';

import OLMap from 'ol/Map';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import { ObjectEvent } from 'ol/Object';
import View from 'ol/View';
import Coordinate from 'ol/coordinate';
import Extent from 'ol/extent';
import { Layer, WebGLPoints } from 'ol/layer';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import { transform, transformExtent } from 'ol/proj';
import { XYZ } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import Polyline from 'ol/format/Polyline';
import { Geometry, LineString, Point } from 'ol/geom';
import {easeOut} from 'ol/easing';

import Place from '@/components/src/Map/Place/Place';
import { AddRouteJSON, SupabaseRoute, SupabasePlace, SupabasePlaceInfo, SupabasePlaceInfo_Ref } from '@/api/types';
import PlaceLayer from '@/components/src/Map/Place/PlaceLayer/PlaceLayer';
import Route from '@/components/src/Map/Route/Route';
import RouteLayer from '@/components/src/Map/Route/RouteLayer/RouteLayer';

export enum MenuState {
    main,
    view,
    edit,
    routes,
  }

// const callGetFeaturesById = (featureIds: Array<string>) : 
//     Promise<{
//         data: any;
//     }> => {
//     return new Promise<{ data: any }>((resolve) => {
//     $.ajax({
//         url: `/api/getFeatures`,
//         dataType: 'json',
//         type: 'POST',
//         contentType: 'application/json',
//         async: true,
//         crossDomain: true,
//         data: JSON.stringify(featureIds),
//     })
//         .done(function (result) {
//         resolve({ data: result });
//         })
//         .fail(function (error) {
//         resolve({ data: null });
//         });
//     });
// };

export default class Map {
    // the openlayers map object
    private map         : OLMap;
    private zoom        : number = 0;
    private resolution  : number = 0;

    // layer objects
    private placeLayer      : PlaceLayer;
    private routeLayer      : RouteLayer;

    // mouse state
    private mouseCoords     : Coordinate.Coordinate = [0, 0];
    private mousePosition   : Coordinate.Coordinate = [0, 0];

    private highlightedPlace    : Place | undefined = undefined;

    private mode        : string = "draw";
    private snapping    : boolean = true;

    private height      : number;
    private width       : number;

    // private cycleLayer : TileLayer<XYZ> = new TileLayer({
    //     visible: true,
    //     source: new XYZ({
    //         url: 'https://dev.{a-c}.tile.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png'
    //     })
    // });
    private satelliteLayer : TileLayer<XYZ> = new TileLayer({
        visible: true,
        source: new XYZ({
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        })
    });

    private setInfoPos     : React.Dispatch<React.SetStateAction<number[]>>;
    private setInfo        : React.Dispatch<React.SetStateAction<{
        [key: string]: any;
    } | undefined>>;
    private setInfoVisible : React.Dispatch<React.SetStateAction<boolean>>;
    private setSleeping    : React.Dispatch<React.SetStateAction<boolean>>;
    public  setTripPlan    : React.Dispatch<React.SetStateAction<boolean>>;
    public  setMenuState   : React.Dispatch<React.SetStateAction<MenuState>>;

    public getRouteLayer = () : RouteLayer => {
        return this.routeLayer;
    }

    public exportSupabaseRoute = () : SupabaseRoute => {
        console.log('Map: 📤 Exporting supabase route.');
        return this.routeLayer.exportSupabaseRoute();
    }

    public exportAddRouteJSON = () : AddRouteJSON => {
        // this is the supabase route,
        // we want to remove any duplicate data in the message we send
        const addRouteJSON = this.routeLayer.exportAddRouteJSON();
        return addRouteJSON;
    }

    public clear = () : void => {
        this.placeLayer.removeType('route_marker');
        this.placeLayer.resetPlaces();
        this.routeLayer.removeRoutes();

        this.routeLayer.reset();

        // set the source place to the last place in the array
        this.routeLayer.setRouteSourcePlace(    undefined );
        this.routeLayer.setRouteDestPlace(      undefined );

        // remove distance markers
        // this.routeLayer.renderRoutePlan();

        // make it so we are viewing a saved layer
        this.routeLayer.setSaved(false);
        this.routeLayer.setEditing(true);
    }

    public importSupabaseRoute = ( routeJSON : SupabaseRoute ) : void => {
        console.log('Map: 📥 Importing supabase route.');

        this.routeLayer.setRouteSourcePlace(    undefined );
        this.routeLayer.setRouteDestPlace(      undefined );

        this.placeLayer.removeType('route_marker');
        this.placeLayer.resetPlaces();
        this.routeLayer.removeRoutes();

        this.routeLayer.setInitialFood(     routeJSON.initial_food);
        this.routeLayer.setInitialWater(    routeJSON.initial_water);
        this.routeLayer.setName(            routeJSON.name);
        this.routeLayer.setUrlSlug(         routeJSON.url_slug);
        this.routeLayer.setEmail(           routeJSON?.user_uuid?.email ?? "");

        let foundSourcePlace    : Place | undefined = undefined;
        let foundDestPlace      : Place | undefined = undefined;

        routeJSON.sections.sort((a, b) => (a.index > b.index) ? 1 : -1);

        for(const section of routeJSON.sections){
            // get source and dest ids of section places
            const sourceInfo   = section.place_source_info;
            const destInfo     = section.place_dest_info;
            const source    = sourceInfo.place;
            const dest      = destInfo.place;
            const sourcePlace = new Place(
                source.type,
                source.name,
                source.id,
                [ source.lon, source.lat],
                source.info
            );
            const destPlace = new Place(
                dest.type,
                dest.name,
                dest.id,
                [ dest.lon, dest.lat],
                dest.info
            );
            // read polyline and add route
            const format = new Polyline();
            const geometry = format.readGeometry(section.polyline, {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857'
            }) as LineString;
            const distance = section.distance;
            // add places and routes, get existing routes and places if they are present...
            foundSourcePlace  = this.placeLayer.addPlace(sourcePlace);
            foundDestPlace    = this.placeLayer.addPlace(destPlace);
            // add source to route layer
            this.routeLayer.addPlaceWithoutRoute(foundSourcePlace);
            // highlight places
            foundSourcePlace.setSelected(true);
            foundDestPlace.setSelected(true);
            // add sleep state
            foundSourcePlace.importPlaceInfoResponse(sourceInfo);
            foundDestPlace.importPlaceInfoResponse(destInfo);
            // create route from points
            this.routeLayer.addRoute( new Route(this, this.routeLayer, foundSourcePlace, foundDestPlace, geometry, distance) );
        }

        // add dest to route layer
        if( foundDestPlace !== undefined ) this.routeLayer.addPlaceWithoutRoute( foundDestPlace );

        // set the source place to the last place in the array
        this.routeLayer.setRouteSourcePlace( foundDestPlace );
        this.routeLayer.setRouteDestPlace( undefined );

        // add distance markers
        this.routeLayer.renderRoutePlan();

        if(routeJSON.url_slug === ""){
            this.setMenuState(MenuState.edit);
            this.routeLayer.setSaved(false);
            this.routeLayer.setEditing(true);
        }else{
            this.setMenuState(MenuState.view);
            this.routeLayer.setSaved(true);
            this.routeLayer.setEditing(false);
        }

        // fit map to route after rendered
        const fitAfterRender: ReturnType<typeof setTimeout> = setTimeout(() => { this.fitToRoute() }, 50);
    }

    public fitToRoute = () : void => {
        // fit view to extent
        this.routeLayer.updateExtent();
        const extent = this.routeLayer.getExtent();
        this.map.getView().fit(
            extent, 
            { 
                size        : this.map.getSize(), 
                duration    : 2000, 
                padding     : [this.width * 0.05, this.width * 0.05, this.width * 0.05, this.width * 0.45],
                easing      : easeOut
            }
        );
    }

    public getExtent = () : Extent.Extent => {
        return this.map.getView().calculateExtent(this.map.getSize());
    }

    public getTransformedExtent = () : Extent.Extent => {
        const extent : Extent.Extent = this.map.getView().calculateExtent(this.map.getSize());
        return transformExtent(extent, 'EPSG:3857', 'EPSG:4326');
    }

    public getZoom = () : number => {
        return this.zoom;
    }

    public getResolution = () : number => {
        return this.resolution;
    }

    private mouseInteraction = () : void => {
        // if we are plotting a route
        if (this.mode === 'draw'){

            /*
            ---- when selection is empty ----
            if an empty space is clicked, create and select a path node
            if a place is clicked, select the place

            ---- when selection is not empty ----
            if an empty space is clicked, route selection to that point
            if another place is clicked, route selection to that place

            we are always working with two features, the source and destination features.
            */

            // if placing node, switch to create view
            this.setMenuState(MenuState.edit);
            // make it so we are viewing a saved layer
            this.routeLayer.setSaved(false);
            this.routeLayer.setEditing(true);

            // if we are hovering over a place, toggle its selection on click
            if(this.highlightedPlace !== undefined){
                // selecting a place
                if(!this.highlightedPlace.getSelected()){
                    this.highlightedPlace.setSelected(true);
                }else{
                    return;
                }
            }
            // we are hovering over a blank space, create a place on click
            else{
                const routeMarkerPlace = new Place(
                    'route_marker', 
                    'Route Marker', 
                    undefined, 
                    this.mousePosition
                );
                const info = routeMarkerPlace.getInfo();
                info['name'] = 'Route Marker';
                routeMarkerPlace.setInfo(info);
                routeMarkerPlace.setSelected(true);
                // add it to the map and select it
                const place = this.placeLayer.addPlace(routeMarkerPlace);
                this.highlightedPlace = place;
            }

            // otherwise we have clicked on some other part of the map
            this.routeLayer.addPlace(this.highlightedPlace);
            return;

        }else if(this.mode === 'remove'){

            // if removing node, switch to create view
            this.setMenuState(MenuState.edit);
            // make it so we are viewing a saved layer
            this.routeLayer.setSaved(false);
            this.routeLayer.setEditing(true);

            // deselecting a place
            if(this.highlightedPlace !== undefined){
                if(this.highlightedPlace.getSelected()){
                    this.highlightedPlace.setSelected(false);
                    this.routeLayer.removePlace(this.highlightedPlace);
                    if(this.highlightedPlace.getType() === 'route_marker'){
                        this.placeLayer.removePlace(this.highlightedPlace);
                    }
                    this.highlightedPlace = undefined;
                    this.setInfoVisible(false);
                }else{
                    return;
                }
            }
        }
    }

    private handleClick = (mapBrowserEvent : MapBrowserEvent<MouseEvent>) : void => {
        this.mouseCoords = mapBrowserEvent.coordinate;
        this.mousePosition = transform(this.mouseCoords, 'EPSG:3857', 'EPSG:4326');

        this.mouseInteraction();
        this.routeLayer.update();
    };

    private handleMoveStart = () : void => {
    };

    private handleMoveEnd = () : void => {
        // update the visible features
        this.placeLayer.removeNotInExtent(this.getExtent());
        this.placeLayer.addPlacesInExtent(this.getTransformedExtent());
    };

    private handleChangeResolution = (objectEvent: ObjectEvent) : void => {
        // Update view and resolution attributes
        const view = this.map.getView();
        const initialZoom: number | undefined = view.getZoom?.();
        const initialResolution: number | undefined = view.getResolution?.();
        if (initialZoom === undefined || initialResolution === undefined) {
          return;
        }
        this.resolution = initialResolution;
        this.zoom = initialZoom;

        if(this.highlightedPlace === undefined){
            return
        }

        var pixel = this.map.getPixelFromCoordinate(this.highlightedPlace.getCoordinates());
        this.setInfoPos(pixel);
    }

    private handlePointerMove = (mapBrowserEvent : MapBrowserEvent<MouseEvent>) : void => {
        this.mouseCoords = mapBrowserEvent.coordinate;
        this.mousePosition = transform(this.mouseCoords, 'EPSG:3857', 'EPSG:4326');

        // check if mouse over feature
        const hoveredPlace      : Place | undefined = this.placeLayer.getHoveredPlace( this.mouseCoords );

        // if mouse moves from nothing to nothing, skip
        if( hoveredPlace === undefined && this.highlightedPlace === undefined ) return;

        // if mouse moves from something to nothing, clear something and return
        if( this.highlightedPlace !== undefined && hoveredPlace === undefined ) {
            // ensure that leaving mouse is not near highlighted place
            const isNearHighlighted : boolean = this.placeLayer.isMouseNear( this.mouseCoords, this.highlightedPlace );
            if( isNearHighlighted ) return;
            // if mouse is actually leaving, clear highlighted place
            this.highlightedPlace.setHighlighted(false);
            this.highlightedPlace = undefined;
            this.setInfoVisible(false);
            return;
        }

        // if mouse moves from something to something else, clear something and carry on
        if( this.highlightedPlace !== undefined && hoveredPlace !== this.highlightedPlace ) {
            this.highlightedPlace.setHighlighted(false);
            this.highlightedPlace = undefined;
            this.setInfoVisible(false);
        }

        // if mouse entered nothing, skip
        if( hoveredPlace === undefined ) return;

        // if mouse entered same place, skip
        if( hoveredPlace === this.highlightedPlace ) return;

        // if mouse entered something new, update the new thing
        this.highlightedPlace = hoveredPlace;
        this.highlightedPlace.setHighlighted(true);
        var pixel = this.map.getPixelFromCoordinate(this.highlightedPlace.getCoordinates());

        const info = this.highlightedPlace.getInfo();
        this.setInfo(info);
        this.setSleeping(info['sleeping']);
        this.setInfoPos(pixel);
        this.setInfoVisible(true);
        return;
    }

    // toggles sleeping from the info menu
    public updateSleeping = (sleeping : boolean) : void => {
        if (this.highlightedPlace === undefined) return;
        this.highlightedPlace.setSleeping(sleeping);
        this.routeLayer.renderRoutePlan();
    }

    public addLayers = (layers : Array<VectorLayer<VectorSource>> | Array<VectorLayer<VectorSource> | WebGLPoints<VectorSource<Point>>>) : void => {
        for(var layer of layers){
            this.map.addLayer(layer);
        }
    }

    constructor(
        element : HTMLDivElement, 
        // callbacks to interact with the map
        callbacks: {
            setInfoPos     : React.Dispatch<React.SetStateAction<number[]>>;
            setInfo        : React.Dispatch<React.SetStateAction<{
                [key: string]: any;
            } | undefined>>;
            setInfoVisible : React.Dispatch<React.SetStateAction<boolean>>;
            setSleeping    : React.Dispatch<React.SetStateAction<boolean>>;
            setTripPlan    : React.Dispatch<React.SetStateAction<boolean>>;
            setMenuState   : React.Dispatch<React.SetStateAction<MenuState>>;
        }){

        this.width  = element.offsetWidth;
        this.height = element.offsetHeight;

        this.placeLayer     = new PlaceLayer(this);
        this.routeLayer     = new RouteLayer(this);

        this.setInfoPos     = callbacks.setInfoPos;
        this.setInfo        = callbacks.setInfo;
        this.setInfoVisible = callbacks.setInfoVisible;
        this.setSleeping    = callbacks.setSleeping;
        this.setTripPlan    = callbacks.setTripPlan;
        this.setMenuState   = callbacks.setMenuState;

        // create the OpenLayers Map
        this.map = new OLMap({
            target: element,
            layers: [
                // new TileLayer({
                //     source:     new OSM(),
                // }),
                new TileLayer({
                    source:     new XYZ({
                        url: 'https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png'
                    })
                }),
                //this.cycleLayer,
                this.satelliteLayer,
            ],
            view: new View({
                center:     transform([-3.6067, 57.0607], 'EPSG:4326', 'EPSG:3857'),
                zoom:       10,
            }),
            controls: [],
        });

        this.addLayers(this.placeLayer.getLayers());
        this.addLayers(this.routeLayer.getLayers());

        this.resolution = this.map.getView()?.getResolution()   || 0;
        this.zoom       = this.map.getView()?.getZoom()         || 0;
        
        this.map.getView().on('change:resolution',  this.handleChangeResolution);
        this.map.on('movestart',    this.handleMoveStart);
        this.map.on('moveend',      this.handleMoveEnd);
        this.map.on('pointermove',  this.handlePointerMove);
        this.map.on('click',        this.handleClick);

        this.placeLayer.addPlacesInExtent(this.getTransformedExtent());
    }

    public setVisible = (visiblePlaces : Array<string>) : void => {
        this.placeLayer.setVisible(visiblePlaces);
        this.placeLayer.addPlacesInExtent(this.getTransformedExtent());
    }

    public setMode = (selectedMode : string) : void => {
        if(selectedMode === null){
            this.mode = "none";
            return;
        }
        this.mode = selectedMode;
    }

    public setSnapping = (snap : string) : void => {
        this.snapping = snap === 'snap';
    }

    public getSnapping = () : boolean => {
        return this.snapping;
    }

    public setLayer = (selectedLayer : string) : void => {
        //this.cycleLayer.setVisible(selectedLayer === 'cycle');
        this.satelliteLayer.setVisible(selectedLayer === 'satellite');
    }
    
    destroy () {
        this.map.setTarget(undefined);
    }
  
}