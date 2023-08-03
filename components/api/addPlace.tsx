import * as $ from "jquery";

const addPlace = (token: string | null, body: any) => {
    return new Promise((resolve) => { 
      var result = $.ajax({
        url: '/api/addPlace',
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

export default addPlace;