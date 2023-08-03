
import Feature, { FeatureLike } from 'ol/Feature';
import { Point } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Fill, Stroke, Style, Text } from 'ol/style';

import Route from '@/components/src/Map/Route/Route';

export default class TextLayer {

    private source      : VectorSource<Point>;
    private textLayer   : VectorLayer<VectorSource<Point>>;
    private style       : Style = new Style({
        text: new Text({
            font: '',
            fill: new Fill({
            color: '#fff',
        }),
            stroke: new Stroke({
            color: '#000',
            width: 4,
        }),
        })
    });

    public addRoute = ( route : Route ) : void => {
        this.source.addFeature(route.getMidpointFeature());
    };

    public setFeatures = ( features : Array<Feature<Point>> ) : void => {
        this.source.clear();
        this.source.addFeatures(features);
    };

    public removeRoute = ( route : Route ) : void => {
        this.source.removeFeature(route.getMidpointFeature());
    };

    public update = () => {
        this.textLayer.changed();
    }

    public getLayer = () : VectorLayer<VectorSource> => {
        return this.textLayer;
    }

    public removeRoutes = () : void => {
        this.source.clear();
    }

    constructor(){
        this.source = new VectorSource();
        this.textLayer = new VectorLayer({
            source: this.source,
            style: (feature : FeatureLike, resolution : number) : Style | void => {
                const style = this.style;
                style.getText()
                .setText([
                    `${feature.get('distance')}km`,
                    'italic 11px Calibri,sans-serif',
                ]);
                return style;
            },
            updateWhileInteracting: true,
        });
        this.textLayer.setZIndex(5);
    }
    
}
