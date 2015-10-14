<script type="text/javascript">
  function initialize() {
    var center = new google.maps.LatLng(37.4419, -122.1419);

    var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 3,
      center: center,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    var markers = [];
    for (var i = 0; i < 100; i++) {
      var location = yourData.location[i];
      var latLng = new google.maps.LatLng(location.latitude,
          location.longitude);
      var marker = new google.maps.Marker({
        position: latLng
      });
      markers.push(marker);
    }
    var markerCluster = new MarkerClusterer(map, markers);
  }
  google.maps.event.addDomListener(window, 'load', initialize);
</script>