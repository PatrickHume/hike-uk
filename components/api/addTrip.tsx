import * as $ from "jquery";
import { AddRouteJSON } from "@/api/types";

const addTrip = (token: string | null, body: AddRouteJSON) => {
    return new Promise((resolve) => { 
      var result = $.ajax({
        url: '/api/addTrip',
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

export default addTrip;