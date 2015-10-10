	// initial map view when loading
	function initMap() {
		var myHotel = {lat: 40.665911, lng: -111.513906};
		var  map = new google.maps.Map(document.getElementById('map'), {
			center: myHotel,
			zoom: 14
		});
		var hotelImg = 'images/Hotel.svg';
		var marker = new google.maps.Marker({
			position: myHotel,
			map: map,
			icon: hotelImg,
			animation: google.maps.Animation.DROP,
			title: 'Hotel Stay - Jupiter Inn #8'
		});

		map.addListener('center_changed', function(){
			// 5 seconds after the center of the map has changed go back to initial center
			window.setTimeout(function(){
				map.panTo(marker.getPosition());
			},5000);
		});

		marker.addListener('click', toggleBounce);

		function toggleBounce() {
			if (marker.getAnimation() !== null) {
				marker.setAnimation(null);
			} else {
			map.setZoom(18);
			marker.setAnimation(google.maps.Animation.BOUNCE);
			}
		}

		/*function drop() {
		  clearMarkers();
		  for (var i = 0; i < neighborhoods.length; i++) {
		    addMarkerWithTimeout(neighborhoods[i], i * 200);
		  }
		};

		function addMarkerWithTimeout(position, timeout) {
		  window.setTimeout(function() {
		    markers.push(new google.maps.Marker({
		      position: position,
		      map: map,
		      animation: google.maps.Animation.DROP
		    }));
		  }, timeout);
		};

		function clearMarkers() {
		  for (var i = 0; i < markers.length; i++) {
		    markers[i].setMap(null);
		  }
		  markers = [];
		};*/
	}