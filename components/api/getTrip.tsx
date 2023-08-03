import * as $ from "jquery";

const callGetTrip = (token: string | undefined, url_slug: string) => {
    return new Promise((resolve) => { 
      var result = $.ajax({
        url: '/api/getTrip',
        dataType: 'json',
        type: 'POST',
        contentType: 'application/json',
        async: true,
        crossDomain: true,
        data: JSON.stringify({url_slug: url_slug}),
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

export default callGetTrip;