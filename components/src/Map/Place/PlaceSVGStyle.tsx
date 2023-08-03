import { Icon, Style } from 'ol/style';
import ReactDOMServer from 'react-dom/server';
import { TypeColourMap } from '@/components/src/Map/Place/Place';
const colourBlack       = '#000000'
const colourWhite       = '#FFFFFF'

/*
Convert icon to svg data
*/
const getIconPath = (IconComponent: React.ComponentType<any>): string => {
    const iconString = ReactDOMServer.renderToString(<IconComponent />);
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(iconString, 'image/svg+xml');
    const iconPath = svgDoc.querySelector('path')?.getAttribute('d') as string;
    return iconPath;
}

export default class SVGPlaceLayer {
    private selectedStyle     : Style;
    private highlightedStyle  : Style;
    private defaultStyle      : Style;

    public getSelectedStyle = () : Style => {
        return this.selectedStyle;
    }
    public getHighlightedStyle = () : Style => {
        return this.highlightedStyle;
    }
    public getDefaultStyle = () : Style => {
        return this.defaultStyle;
    }
    
    constructor(type : string, icon : React.ComponentType<any>){

        const colour = TypeColourMap[type] ?? colourBlack;
        // Make SVG icons layer
        const w = 35;
        const r = w/2;
        const n = -(w-24)/2;
        const d = 24;
        // Convert icon to SVG
        const svgData = getIconPath(icon);
        // Apply ciruclar background to SVG
        const svgInitial = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${n} ${n} ${w} ${w}" height="${d.toFixed(2)}" width="${d.toFixed(2)}">
        <circle cx="12" cy="12" r="${r}" fill=colourBlack />
        <path fill=colourWhite d="${svgData}"></path>
        </svg>`

        let svg;
        let svgSrc;
            
        svg = svgInitial.replace(colourBlack, colour).replace(colourWhite, colourBlack);
        svgSrc = 'data:image/svg+xml;base64,' + window.btoa(svg);
        this.selectedStyle = new Style({
            image: new Icon({
                src: svgSrc, 
            })
        });

        svg = svgInitial.replace(colourWhite, colour).replace(colourBlack, colourWhite);
        svgSrc = 'data:image/svg+xml;base64,' + window.btoa(svg);
        this.highlightedStyle = new Style({
            image: new Icon({
                src: svgSrc,
            })
        });

        svg = svgInitial.replace(colourBlack, colour);
        svgSrc = 'data:image/svg+xml;base64,' + window.btoa(svg);
        this.defaultStyle = new Style({
            image: new Icon({
                src: svgSrc,
            })
        });
    }
}