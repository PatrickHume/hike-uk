import Feature, { FeatureLike } from 'ol/Feature';
import Extent from 'ol/extent';
import { Point } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Style } from 'ol/style';

import Map from '@/components/src/Map/Map';
import Place from '@/components/src/Map/Place/Place';
import PlaceSVGStyle from '@/components/src/Map/Place/PlaceSVGStyle';

import BothyIcon from '@mui/icons-material/GiteRounded';
import GroceryIcon from '@mui/icons-material/LocalGroceryStoreRounded';
import PubIcon from '@mui/icons-material/SportsBar';
import TentIcon from '@mui/icons-material/Style';
import CaveIcon from '@mui/icons-material/Terrain';
import TrainIcon from '@mui/icons-material/Train';

interface StyleDict {
    [key: string]: PlaceSVGStyle;
}

export default class SVGPlaceLayer {
    private map         : Map;
    private source      : VectorSource<Point>;
    private styleDict   : StyleDict = {};
    private SVGLayer    : VectorLayer<VectorSource<Point>>;

    public addPlace = (place : Place) : void => {
        this.source.addFeature(place.getFeature());
    }

    public removePlace = (place : Place) : void => {
        this.source.removeFeature(place.getFeature());
    }

    public removePlaces = () : void => {
        this.source.clear();
    }

    public getFeaturesInExtent = (extent : Extent.Extent) : Array<Feature> => {
        return this.source.getFeaturesInExtent(extent);
    }

    public getLayer = () : VectorLayer<VectorSource> => {
        return this.SVGLayer;
    }

    constructor(map : Map){
        this.map = map;
        this.source = new VectorSource<Point>;
        this.styleDict['bothy']         = new PlaceSVGStyle('bothy',         BothyIcon);
        this.styleDict['campsite']      = new PlaceSVGStyle('campsite',      TentIcon);
        this.styleDict['cave']          = new PlaceSVGStyle('cave',          CaveIcon);
        this.styleDict['train_station'] = new PlaceSVGStyle('train_station', TrainIcon);
        this.styleDict['supermarket']   = new PlaceSVGStyle('supermarket',   GroceryIcon);
        this.styleDict['pub']           = new PlaceSVGStyle('pub',           PubIcon);
        this.SVGLayer = new VectorLayer({
            source: this.source,
            opacity: 1,
            style: (feature : FeatureLike, resolution : number) : Style | void => {
                if(feature.get('visible') === 'no') return;
                const type          : string    = feature.get('type');
                const scale         : number    = feature.get('scale');
                const isHighlighted : boolean   = (feature.get('highlighted') === 'yes');
                const isSelected    : boolean   = (feature.get('selected')    === 'yes');
                const svgStyle      : PlaceSVGStyle | undefined = this.styleDict[type] ?? undefined;
                if ( svgStyle === undefined ) return;

                let style : Style;
                if(isSelected){
                    style = svgStyle.getSelectedStyle();
                }else if(isHighlighted){
                    style = svgStyle.getHighlightedStyle();
                }else{
                    style = svgStyle.getDefaultStyle();
                }

                style.getImage().setScale(scale*0.011*Math.pow(this.map.getZoom(), 2));
                style.getImage().setOpacity(Math.min( Math.max(this.map.getZoom() - 11.0 , 0.0 ), 1.0));
                return style;
            },
            updateWhileInteracting: true,
        });
        this.SVGLayer.setZIndex(3);
    }
    
}
