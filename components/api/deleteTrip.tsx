import * as $ from "jquery";
import { DeleteRouteJSON } from "@/api/types";

const deleteTrip = (token: string | null, body: DeleteRouteJSON) => {
    return new Promise((resolve) => { 
      var result = $.ajax({
        url: '/api/deleteTrip',
        dataType: 'json',
        type: 'POST',
        contentType: 'application/json',
        async: true,
        crossDomain: true,
        data: JSON.stringify(body),
        headers: {
          'token': token
        }
      }).done(function() {
        console.log('send success');
      }).fail(function(error) {
        console.log('error', error);
      }).always(function() {
        console.log('complete');
        resolve(result.responseJSON);
      });
    });
  };

export default deleteTrip;