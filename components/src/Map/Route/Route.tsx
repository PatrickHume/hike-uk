
import Map from '@/components/src/Map/Map';
import * as $ from "jquery";
/*
Open Layers Mapping
*/
import Feature from 'ol/Feature';
import Coordinate from 'ol/coordinate';
import Polyline from 'ol/format/Polyline';
import { Geometry, LineString, Point } from 'ol/geom';
import { transform } from 'ol/proj';

import Place from '@/components/src/Map/Place/Place';
import RouteLayer from '@/components/src/Map/Route/RouteLayer/RouteLayer';
import route from '@/components/api/route';

const distBetween = (point_a : Coordinate.Coordinate, point_b : Coordinate.Coordinate) : number => {
    let lon1 = point_a[0];
    let lat1 = point_a[1];
    let lon2 = point_b[0];
    let lat2 = point_b[1];
    
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180; // φ, λ in radians
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;
  
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
    const d = R * c * 0.001; // in km
    return d;
}

export default class Route {
    static lastId = 0;
    
    static generateUniqueId() {
        Place.lastId++;
        return Place.lastId;
    }

    private routeLayer      : RouteLayer;
    private enhanced        : boolean = false;
    private routeGeom       : LineString;
    private routeFeature    : Feature<Geometry>;
    private midPointFeature : Feature<Point>;
    private source          : Place;
    private dest            : Place;
    private id              : number;
    private distance        : number = 0;
    
    public getEnhanced          = () : boolean  => { return this.enhanced; }
    public getDistance          = () : number   => { return this.distance; }
    public getSource            = () : Place    => { return this.source; }
    public getDest              = () : Place    => { return this.dest; }
    public getId                = () : number   => { return this.id; }
    public getRouteFeature      = () : Feature<Geometry>    => { return this.routeFeature; }
    public getMidpointFeature   = () : Feature<Point>       => { return this.midPointFeature; }
    public getCoordinates       = () : Array<Coordinate.Coordinate> => { return this.routeGeom.getCoordinates(); } 
    public getGeom              = () : LineString                   => { return this.routeGeom; } 

    public setDistance  = (distance : number) : void  => { 
        this.distance = distance;
        this.routeFeature.set(      'distance', this.distance);
        this.midPointFeature.set(   'distance', this.distance);
    }

    constructor(map: Map, routeLayer: RouteLayer, source : Place, dest : Place, routeGeom? : LineString, distance? : number){
        this.id = Route.generateUniqueId();
        this.routeLayer = routeLayer;
        this.source     = source;
        this.dest       = dest;
        if(distance !== undefined) {
            this.distance = distance;
            this.enhanced = true;
        }
        else {
            this.distance = distBetween(this.source.getLonLat(), this.dest.getLonLat());
        }

        if( routeGeom !== undefined ) this.routeGeom = routeGeom;
        else this.routeGeom          = new LineString([this.source.getCoordinates(), this.dest.getCoordinates()]);

        this.routeFeature       = new Feature<Geometry>({geometry: this.routeGeom});
        this.midPointFeature    = new Feature<Point>({geometry: new Point( this.routeGeom.getCoordinateAt(0.5) )});
        this.setDistance(this.distance);

        if(!map.getSnapping() || routeGeom !== undefined) return;
        this.enhance();
    }

    // this makes an api call to detail the route
    public enhance(){
        // return if already enhanced
        if(this.enhanced) return;
        // project coordinates to meet openrouteservice api format
        const sourceCoords : [number, number] = transform(this.source.getCoordinates(), 'EPSG:3857', 'EPSG:4326') as [number, number];
        const destCoords   : [number, number] = transform(this.dest.getCoordinates(),   'EPSG:3857', 'EPSG:4326') as [number, number];
        // construct query
        const body = {
            "coordinates": [
            [...sourceCoords],
            [...destCoords]
            ]
        };
        // call query
        route(body).then((result: any) => {
            // get the distance and decode the polyline
            const encodedPolyline   : string | undefined = result?.routes[0]?.geometry;
            const distance          : number | undefined = result?.routes[0]?.summary?.distance * 0.001;
            // check nothing is undefined
            if (distance === undefined || encodedPolyline === undefined || this.source === undefined || this.dest === undefined) return;
            // decode the polyline
            const format = new Polyline();
            this.routeGeom = format.readGeometry(encodedPolyline, {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857'
            }) as LineString;
            // create route feature
            this.routeFeature.setGeometry(this.routeGeom);
            this.distance = distance;
            this.setDistance(this.distance);
            // update enhanced status
            this.enhanced = true;
            // re-render now changed
            this.routeLayer.renderRoutePlan();
        });
    }
}
