import Feature from 'ol/Feature';
import Coordinate from 'ol/coordinate';
import { LineString, Point } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Polyline from 'ol/format/Polyline';
import Extent from 'ol/extent';

import Map from '@/components/src/Map/Map';
import Place from '@/components/src/Map/Place/Place';
import Route from '@/components/src/Map/Route/Route';
import PathLayer from '@/components/src/Map/Route/RouteLayer/PathLayer';
import TextLayer from '@/components/src/Map/Route/RouteLayer/TextLayer';

import { 
    SupabasePlaceInfo,
    SupabaseSection,
    SupabaseSection_Ref,
    SupabaseRoute,
    SupabaseRoute_Ref,
    AddRouteJSON,
  } from '@/api/types';
interface RouteDict {
    [key: number]: Route;
}

export default class RouteLayer {
    private map         : Map;
    private pathLayer   : PathLayer = new PathLayer();
    private textLayer   : TextLayer = new TextLayer();
    private places      : Array<Place> = [];
    private routes      : Array<Route> = [];
    private routeDict   : RouteDict = {};
    private routeSourcePlace   : Place | undefined = undefined;
    private routeDestPlace     : Place | undefined = undefined;
    private extent             : Extent.Extent = [0, 0, 0, 0];

    private name         : string = '';
    private email        : string = '';
    private initialWater : number = 2;
    private initialFood  : number = 3;
    private is_public       : boolean = true;
    private tripPlanToggle  : boolean = true;
    private urlSlug         : string  = "";
    private saved           : boolean = false;
    private editing         : boolean = true;

    public getRoutes        = () : Array<Route> => { return this.routes; }

    public getInitialWater  = () : number => { return this.initialWater; }
    public getInitialFood   = () : number => { return this.initialFood; }
    public getName          = () : string => { return this.name; }
    public getUrlSlug       = () : string => { return this.urlSlug; }
    public getExtent        = () : Extent.Extent => { return this.extent; }
    public getEmail         = () : string => { return this.email; }

    public getSaved         = () : boolean => { return this.saved; }
    public setSaved         = (saved : boolean) : void => { this.saved = saved; }

    public getEditing       = () : boolean => { return this.editing; }
    public setEditing       = (editing : boolean) : void => { this.editing = editing; }

    public setInitialWater  = ( initialWater    : number )  : void => { this.initialWater    = initialWater; }
    public setInitialFood   = ( initialFood     : number )  : void => { this.initialFood     = initialFood; }
    public setName          = ( name            : string )  : void => { this.name            = name; }
    public setPublic        = ( is_public       : boolean ) : void => { this.is_public       = is_public; }
    public setUrlSlug       = ( urlSlug         : string )  : void => { this.urlSlug         = urlSlug; }
    public setExtent        = ( extent : Extent.Extent )    : void => { this.extent          = extent; }
    public setEmail         = ( email           : string )  : void => { this.email           = email; }

    public reset            = () : void => {
        this.name           = '';
        this.initialWater   = 2;
        this.initialFood    = 3;
        this.is_public      = true;
        this.urlSlug        = "";
    }

    public setRouteSourcePlace  = ( place   : Place | undefined )  : void => { 
        this.routeSourcePlace   = place; 
    }
    public setRouteDestPlace  = ( place   : Place | undefined )  : void => { 
        this.routeDestPlace     = place;
    }

    constructor(map : Map){
        this.map = map;
    }

    public exportAddRouteJSON = () : AddRouteJSON => {

        // make array of place info for us to reference
        const placeInfos    : Array<SupabasePlaceInfo> = [];
        const placeInfoIds  : Array<number> = [];
        // create sections
        const sections : Array<SupabaseSection_Ref> = [];
        let totalDistance = 0;
        let index = 0;
        // loop over routes and append
        for( const route of this.routes ){
            // decode the polyline
            const format = new Polyline();
            const encodedGeometry = format.writeGeometry(route.getGeom(), {
                dataProjection      : 'EPSG:4326',
                featureProjection   : 'EPSG:3857',
            });
            const distance = route.getDistance();
            totalDistance += distance;

            const source    = route.getSource();
            const dest      = route.getDest();
            const notes : Array<string> = [];
            if( source.getSleeping() ) notes.push('sleep');


            // source place indexing
            const   sourcePlaceInfo = source.getSupabasePlaceInfo();
            const   sourcePlaceLocalId = source.getLocalId();
            var     sourcePlaceInfoIndex;
            if(!placeInfoIds.includes(sourcePlaceLocalId)){
                placeInfoIds.push(sourcePlaceLocalId);
                placeInfos.push(sourcePlaceInfo);
            }
            sourcePlaceInfoIndex = placeInfoIds.indexOf(sourcePlaceLocalId);
            // dest place indexing
            const   destPlaceInfo = dest.getSupabasePlaceInfo();
            const   destPlaceLocalId = dest.getLocalId();
            var     destPlaceInfoIndex;
            if(!placeInfoIds.includes(destPlaceLocalId)){
                placeInfoIds.push(destPlaceLocalId);
                placeInfos.push(destPlaceInfo);
            }
            destPlaceInfoIndex = placeInfoIds.indexOf(destPlaceLocalId);

            // create section
            const section : SupabaseSection_Ref = {
                trip_url_slug       : undefined,
                id                  : undefined,
                index               : index,
                place_source_info   : sourcePlaceInfoIndex,
                place_dest_info     : destPlaceInfoIndex,
                polyline            : encodedGeometry,
                distance            : distance,
            };

            index++;

            sections.push(section);
        }
        const route : SupabaseRoute_Ref
         = {
            url_slug        : this.urlSlug,
            name            : this.name,            // route name
            sections        : sections,             // sections
            distance        : totalDistance,        // total route distance in km
            initial_food    : this.initialFood,     // initial food
            initial_water   : this.initialWater,    // initial water
            is_public       : this.is_public,       // is trip visible to other users
        };
        const result : AddRouteJSON = {
            placeInfo       : placeInfos,           // unique place infos referenced in sections
            route           : route,
        };
        return result;
    }

    public exportSupabaseRoute = () : SupabaseRoute => {
        const sections : Array<SupabaseSection> = [];
        let totalDistance = 0;
        let index = 0;
        // loop over routes and append
        for( const route of this.routes ){
            // decode the polyline
            const format = new Polyline();
            const encodedGeometry = format.writeGeometry(route.getGeom(), {
                dataProjection      : 'EPSG:4326',
                featureProjection   : 'EPSG:3857',
            });
            const distance = route.getDistance();
            totalDistance += distance;

            const source    = route.getSource();
            const dest      = route.getDest();
            const notes : Array<string> = [];
            if( source.getSleeping() ) notes.push('sleep');

            // create section
            const section : SupabaseSection = {
                id                  : undefined,
                index               : index,
                place_source_info   : source.getSupabasePlaceInfo(),
                place_dest_info     : dest.getSupabasePlaceInfo(),
                polyline            : encodedGeometry,
                distance            : distance,
            };

            index++;

            sections.push(section);
        }
        const result : SupabaseRoute
         = {
            url_slug        : this.urlSlug,
            name            : this.name,
            sections        : sections,
            distance        : totalDistance,
            initial_food    : this.initialFood,
            initial_water   : this.initialWater,
            is_public       : this.is_public,
        };
        return result;
    }

    public getLayers = () : Array<VectorLayer<VectorSource>> => {
        return [...[this.pathLayer.getLayer(), this.textLayer.getLayer()]];
    }

    public addRoute = (route : Route) : void => {
        if(route.getId() in this.routeDict) return;
        this.routeDict[route.getId()] = route;
        this.routes.push(route);
        this.pathLayer.addRoute(route);
    }

    public replaceRoute = (route : Route, replacementRoute : Route) : void => {
        if(!(route.getId() in this.routeDict)) return;
        if(replacementRoute.getId() in this.routeDict) return;
        var index = this.routes.indexOf(route);

        this.routes[index] = replacementRoute;
        this.pathLayer.addRoute(replacementRoute);
        this.textLayer.addRoute(replacementRoute);
        this.routeDict[replacementRoute.getId()] = replacementRoute;
        
        this.pathLayer.removeRoute(route);
        delete this.routeDict[route.getId()];
    }

    public removeRoute = (route : Route) : void => {
        if(!(route.getId() in this.routeDict)) return;
        var index = this.routes.indexOf(route);
        if (index !== -1) {
            this.routes.splice(index, 1);
        }        
        this.pathLayer.removeRoute(route);
        delete this.routeDict[route.getId()];
    }

    public removeRoutes = () : void => {
        this.routeDict = {};
        this.routes = [];
        this.pathLayer.removeRoutes();
        this.textLayer.removeRoutes();
    }

    public update = () => {
        this.pathLayer.update();
        this.textLayer.update();
    }

    public addPlace = (place : Place) : void => {
        this.places.push(place);

        // if we have an actively selected marker, we want to route from this
        if( this.routeSourcePlace === undefined ){
            this.routeSourcePlace   = place;
        }else if( !this.routeSourcePlace.getSelected() ){
            this.routeSourcePlace   = place;
        }else if( this.routeDestPlace === undefined ){
            this.routeDestPlace     = place;
        }

        if (this.routeSourcePlace === undefined || this.routeDestPlace === undefined) return;

        const route = new Route(this.map, this, this.routeSourcePlace, this.routeDestPlace);
        this.addRoute(route);
        this.renderRoutePlan();
    }

    public addPlaceWithoutRoute = (place : Place) : void => {
        this.places.push(place);
    }

    public removePlace = (place : Place) : void => {

        var index = this.places.indexOf(place);
        if (index !== -1) {
            this.places.splice(index, 1);
        }

        this.handleNodeDeleted();
        this.renderRoutePlan();
    }

    public updateExtent = () : void => {
        // clear all labels and begin annotating route
        var accumulatedLine     : Array<Coordinate.Coordinate>  = [];
        // loop over route plan
        for(const route of this.routes){
            accumulatedLine     = accumulatedLine.concat(route.getCoordinates());
        }
        // get the extent
        var routeGeom : LineString = new LineString(accumulatedLine) as LineString;
        this.setExtent(routeGeom.getExtent());
    }

    public renderRoutePlan = () : void => {
        // clear all labels and begin annotating route
        var midpointFeatures    : Array<Feature<Point>>         = [];
        var accumulatedLine     : Array<Coordinate.Coordinate>  = [];
        var accumulatedDistance : number = 0;
        // loop over route plan
        var counter = 0;
        for(const route of this.routes){
            counter++;

            accumulatedLine     = accumulatedLine.concat(route.getCoordinates());
            accumulatedDistance += route.getDistance();

            const dest : Place = route.getDest();

            if(
                (
                    dest.getType() === 'route_marker' && !dest.getSleeping()
                ) && 
                !(counter === this.routes.length)
            ) continue;

            if(accumulatedLine.length === 0) continue;

            // get the midpoint
            var routeGeom : LineString = new LineString(accumulatedLine) as LineString;
            var midPoint = routeGeom.getCoordinateAt(0.5);

            if(midPoint === null){
                accumulatedLine = []
                accumulatedDistance = 0;
                continue;
            }

            var midpointFeature = new Feature<Point>({
                geometry: new Point( midPoint )
            });

            midpointFeature.set('distance', accumulatedDistance.toFixed(1));
            midpointFeatures.push(midpointFeature);

            accumulatedLine = []
            accumulatedDistance = 0;
            
        }
        this.textLayer.setFeatures(midpointFeatures);

        this.tripPlanToggle = !this.tripPlanToggle;
        this.map.setTripPlan(this.tripPlanToggle);

        this.routeSourcePlace = this.getEndPlace();
        this.routeDestPlace = undefined;
    }

    public empty = () : boolean => {
        return this.routes.length === 0;
    }

    public getEndPlace = () : Place | undefined => {
        if ( this.places.length === 0 ) return undefined;
        return this.places[this.places.length - 1];
    }

    public handleNodeDeleted = () : void => {
        /*
        if a node has been deselected then
        we must traverse through the route to fill in any gaps
        */
        if( this.routes.length === 0 ) return;

        const firstRoute = this.routes[0];

        if( !firstRoute.getSource().getSelected() ){ 
            this.removeRoute(firstRoute);
        }
        
        if( this.routes.length === 0 ) return;

        const lastIndex = this.routes.length - 1;
        const lastRoute = this.routes[lastIndex];

        if( !lastRoute.getDest().getSelected() ){
            this.removeRoute(lastRoute);
        }

        if( this.routes.length === 0 ) return;

        for(var i = this.routes.length - 1; i >= 0; i--){
            const route = this.routes[i];
            if( !route.getDest().getSelected() && !route.getSource().getSelected() ){
                this.removeRoute(route);
            }
        }

        for(var i = this.routes.length - 1; i >= 1; i--){
            const route = this.routes[i];
            const prevRoute = this.routes[i - 1];
            // delete walks which are missing either part
            if( !route.getSource().getSelected() && !prevRoute.getDest().getSelected() ){
                /*
                route between features is asynchronous, so we should pass it the position of the route to create
                we should also raise a flag to prevent any deletion of routes
                */
                const replacementRoute = new Route(this.map, this, prevRoute.getSource(), route.getDest());
                this.replaceRoute(route, replacementRoute);
                this.removeRoute(prevRoute);
            }
        }

    }

}
