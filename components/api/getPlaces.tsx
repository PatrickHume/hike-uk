import * as $ from "jquery";
import Extent from 'ol/extent';
/*

Call the features api

body should be a JSON with a bounding box:

body = {
  "type"  : "bothies",
  "lonMin": -10,
  "lonMax": 100,
  "latMin": 52,
  "latMax": 52.5
};

or without:

body = {
  "type"  : "bothies"
};

*/
const getPlaces = (types: any, extent: Extent.Extent) : 
    Promise<{
        data: any;
    }> => {
    const body = {
    types: types,
    lonMin: extent[0],
    lonMax: extent[2],
    latMin: extent[1],
    latMax: extent[3],
    };
    return new Promise<{ data: any }>((resolve) => {
    $.ajax({
        url: `/api/getPlaces`,
        dataType: 'json',
        type: 'POST',
        contentType: 'application/json',
        async: true,
        crossDomain: true,
        data: JSON.stringify(body),
    })
        .done(function (result) {
        resolve({ data: result });
        })
        .fail(function (error) {
        resolve({ data: null });
        });
    });
};

export default getPlaces;