  $(document).ready(function initiAutocomplete() {
      var map = new google.maps.Map($('#map')[0], {
          zoom: 3,
          center: center,
          mapTypeId: google.maps.MapTypeId.ROADMAP
      });
      var infowindow = new google.maps.InfoWindow();

      var marker, i;

      for (i = 0; i < locations.length; i++) {
          marker = new google.maps.Marker({
              position: new google.maps.LatLng(locations[i][1], locations[i][2]),
              map: map
          });

          google.maps.event.addListener(marker, 'click', (function(marker, i) {
              return function() {
                  infowindow.setContent(locations[i][0]);
                  infowindow.open(map, marker);
              }
          })(marker, i));
      }
  });