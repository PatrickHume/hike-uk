import Place from '@/components/src/Map/Place/Place';
import { Point } from 'ol/geom';
import { WebGLPoints } from 'ol/layer';
import VectorSource from 'ol/source/Vector';

const colourBlack       = '#000000'
const colourWhite       = '#FFFFFF'

export default class WebGLPlaceLayer {

    private source          : VectorSource<Point>;
    private mainLayer       : WebGLPoints<VectorSource<Point>>;
    private highlightLayer  : WebGLPoints<VectorSource<Point>>;
    private flagLayer       : WebGLPoints<VectorSource<Point>>;

    public addPlace = (place : Place) : void => {
        this.source.addFeature(place.getFeature());
    }

    public removePlace = (place : Place) : void => {
        this.source.removeFeature(place.getFeature());
    }
    
    public removePlaces = () : void => {
        this.source.clear();
    }

    public getLayers = () : Array<WebGLPoints<VectorSource<Point>>> => {
        return [this.mainLayer, this.highlightLayer, this.flagLayer];
    }

    constructor(){
        this.source = new VectorSource<Point>;

        this.mainLayer = new WebGLPoints({
            source: this.source,
            opacity: 1,
            style: {
                symbol: {
                symbolType: 'circle',
                // https://openlayers.org/en/latest/examples/webgl-points-layer.html
                size:
                    ['*', [
                    "interpolate",
                    [
                    "exponential",
                    2
                    ],
                    [
                    "zoom"
                    ],
                    2,
                    1,
                    28,
                    256
                ],
                    [
                    "get",
                    "scale"
                    ],
                ],
                color: [
                "case",
    
                [
                    "==",
                    [
                    "get",
                    "selected"
                    ],
                    "yes",
                ],
                    ['color', ['get', 'red'], ['get', 'green'], ['get', 'blue']],
    
                [
                    "==",
                    [
                    "get",
                    "highlighted"
                    ],
                    "yes",
                ],
                    colourWhite,
                    ['color', ['get', 'red'], ['get', 'green'], ['get', 'blue']],
                ],
                opacity: [
                    'case', 
                    [
                        "==",
                        [
                        "get",
                        "visible"
                        ],
                        "no",
                    ],
                    0.0,
                    1.0
                    ]
                }
            }
        });
        this.mainLayer.setZIndex(2);
        // Make WebGL points layer
        this.highlightLayer = new WebGLPoints({
        source: this.source,
        opacity: 1,
        style: {
            symbol: {
            symbolType: 'circle',
            // https://openlayers.org/en/latest/examples/webgl-points-layer.html
            size:
                ['*', [
                "interpolate",
                [
                "exponential",
                2
                ],
                [
                "zoom"
                ],
                2,
                1,
                28,
                256
            ],
            ['+',
                [
                "get",
                "scale"
                ],
                0.2
            ]
        ],
            color: [
            'case', 
            [
                "==",
                [
                "get",
                "selected"
                ],
                "yes",
            ],
            colourBlack,
            [
                "==",
                [
                "get",
                "highlighted"
                ],
                "yes",
            ],
            ['color', ['get', 'red'], ['get', 'green'], ['get', 'blue']],
            colourWhite,
            ],
            opacity: [
                'case', 
                [
                    "==",
                    [
                    "get",
                    "visible"
                    ],
                    "no",
                ],
                0.0,
                1.0
                ]}
        }
        });
        this.highlightLayer.setZIndex(1);
        // Make WebGL points layer
        this.flagLayer = new WebGLPoints({
            source: this.source,
            opacity: 1,
            style: {
                symbol: {
                symbolType: 'square',
                // https://openlayers.org/en/latest/examples/webgl-points-layer.html
                size:
                [
                    "array",
                    ['*', [
                        "interpolate",
                        [
                        "exponential",
                        2
                        ],
                        [
                        "zoom"
                        ],
                        2,
                        1,
                        28,
                        256
                    ],
                    ['+',
                            [
                            "get",
                            "scale"
                            ],
                            0.2
                    ],
                    0.2
                    ],
                    ['*', [
                        "interpolate",
                        [
                        "exponential",
                        2
                        ],
                        [
                        "zoom"
                        ],
                        2,
                        1,
                        28,
                        256
                    ],
                    ['+',
                            [
                            "get",
                            "scale"
                            ],
                            0.2
                    ]
                    ]
                ], 
                offset : [
                    "array",
                    0,
                    ['*', [
                        "interpolate",
                        [
                        "exponential",
                        2
                        ],
                        [
                        "zoom"
                        ],
                        2,
                        1,
                        28,
                        256
                    ],

                    [
                    "get",
                    "scale"
                    ],

                    0.5
                    
                    ]
                ],
                color: [
                'case', 
                [
                    "==",
                    [
                    "get",
                    "selected"
                    ],
                    "yes",
                ],
                colourBlack,
                [
                    "==",
                    [
                    "get",
                    "highlighted"
                    ],
                    "yes",
                ],
                ['color', ['get', 'red'], ['get', 'green'], ['get', 'blue']],
                colourWhite,
                ],
                opacity: [
                    'case', 
                    [
                        "==",
                        [
                        "get",
                        "visible"
                        ],
                        "no",
                    ],
                    0.0,
                    [
                        "==",
                        [
                        "get",
                        "sleeping"
                        ],
                        "yes",
                    ],
                    1.0,
                    0.0,
                    ]
                }
            }
            });
        this.flagLayer.setZIndex(0);

    }

}
