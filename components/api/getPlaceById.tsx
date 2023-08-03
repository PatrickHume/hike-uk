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
const getPlaceById = (id: number) : 
    Promise<{
        data: any;
    }> => {
    const body = {
    id: id
    };
    return new Promise<{ data: any }>((resolve) => {
    $.ajax({
        url: `/api/getPlaceById`,
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

export default getPlaceById;