import * as $ from "jquery";

const getTrips = (token: string | null) => {
    return new Promise((resolve) => { 
      var result = $.ajax({
        url: '/api/getTrips',
        dataType: 'json',
        type: 'GET',
        contentType: 'application/json',
        async: true,
        crossDomain: true,
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

export default getTrips;