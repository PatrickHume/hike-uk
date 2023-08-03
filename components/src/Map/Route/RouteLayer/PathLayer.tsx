
import { Geometry } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Stroke, Style } from 'ol/style';

import Route from '@/components/src/Map/Route/Route';

const colourBlack       = '#000000'

export default class PathLayer {
    private source      : VectorSource<Geometry>;
    private pathLayer   : VectorLayer<VectorSource<Geometry>>;
    private style       : Style = new Style({
        stroke: new Stroke({
            color: colourBlack,
            width: 3
        })
    });

    public update = () => {
        this.pathLayer.changed();
    }

    public addRoute = ( route : Route ) : void => {
        this.source.addFeature(route.getRouteFeature());
    };

    public removeRoute = ( route : Route ) : void => {
        this.source.removeFeature(route.getRouteFeature());
    };

    public getLayer = () : VectorLayer<VectorSource> => {
        return this.pathLayer;
    }

    public removeRoutes = () : void => {
        this.source.clear();
    }

    constructor(){
        this.source = new VectorSource();
        this.pathLayer = new VectorLayer({
            source: this.source,
            style: this.style,
        });
    }
}
