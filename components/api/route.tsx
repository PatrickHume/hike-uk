import * as $ from "jquery";
/*

Call the routing api

body should be a JSON with a pair of coordinates e.g.

body = {
    "coordinates": [
    [0.0, 0.0],
    [0.0, 0.0]
    ]
};

*/
const route = (body : any) => {
    return new Promise((resolve) => { 
        var result = $.ajax({
            url: `/api/route`,
            dataType: 'json',
            type: 'POST',
            contentType: 'application/json',
            async: true,
            crossDomain: true,
            data: JSON.stringify(body),
        }).done(function() {
            console.log( "send success" );
        }).fail(function(error : any) {
            console.log("error", error);
        }).always(function() {
            console.log( "complete" );
            resolve(result.responseJSON);
        });
    });
  }

export default route;