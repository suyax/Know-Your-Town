//Model
//Global variables---model
//Model-initial Model
var Data = {
  categories: ['All', 'Highest Review', 'Most Popular'],
  yelp_url: "https://api.yelp.com/v2/search",
  count: 0,
  map: undefined,
  items: [],
  markers: [],
  currentAddress: {
    lat: 37.5592899,
    lng: -122.26525659999999,
    location: "Foster City Blvd, Foster City, CA 94404, USA "
  },
  icon: "images/Hotel.svg",
  style: [{
    featureType: "all",
    stylers: [{
      saturation: -60
    }]
  }, {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{
      hue: "#00ffee"
    }, {
      saturation: 10
    }]
  }, {
    featureType: "poi.business",
    elementType: "labels",
    stylers: [{
      visibility: "off"
    }]
  }]
};

//init Google error handling
var googleMapErrorHandling = function() {
  if (typeof google !== 'object' || typeof google.map !== 'object') {
    $('#map').text("Failed To Get Google Map Resources :(");
  }
};

//initial  view
function init() {
  initMap();
  ko.applyBindings(new UpdateYelpViewModel(map));
}

function createMap() {
  map = new google.maps.Map($('#map')[0], {
    center: Data.currentAddress,
    zoom: 12,
    styles: Data.style
  });
}
//initial map
function initMap() {
  googleMapErrorHandling();
  createMap();
  center = new google.maps.Marker({
    map: map,
    anchorPoint: new google.maps.Point(0, 0)
  });

  google.maps.event.addDomListener(window, "resize", function() {
    var center = map.getCenter();
    google.maps.event.trigger(map, "resize");
    map.setCenter(center);
  });
}

function Item(business) {
  this.name = ko.observable(business.name);
  this.url = ko.observable(business.url);
  this.rate = ko.observable(business.rating);
  this.rateImg = ko.observable(business.rating_img_url);
  this.image = ko.observable(business.image_url);
  this.review = ko.observable(business.review_count);
  this.ll = ko.observable({
    lat: business.location.coordinate.latitude,
    lng: business.location.coordinate.longitude
  });
  this.text = ko.observable(business.snippet_text);
}

function UpdateYelpViewModel(map) {
  // 20 seconds after the center of the map has changed go back to initial center
  map.addListener('center_changed', function() {
    window.setTimeout(function() {
      map.setCenter({
        lat: self.Lat(),
        lng: self.Lon(),
      });
      map.setZoom(12);
    }, 20000);
  });
  /*data*/
  var self = this;
  self.FullAddress = ko.observable(Data.currentAddress.location);
  self.Street = ko.observable('s');
  self.Suburb = ko.observable('c');
  self.State = ko.observable('r');
  self.Lat = ko.observable(Data.currentAddress.lat);
  self.Lon = ko.observable(Data.currentAddress.lng);
  self.googleMap = map;
  availableCategories = Data.categories;
  self.category = ko.observable(Data.categories[0]);
  self.items = ko.observableArray([]);
  self.markers = ko.observableArray([]);
  self.select = ko.computed(function() {
    var result;
    if (self.category() === Data.categories[1]) {
      result = self.items().sort(function(a, b) {
        return a.rate() == b.rate() ? 0 : (a.rate() > b.rate() ? -1 : 1);
      }).slice(0, 5);
    } else if (self.category() === Data.categories[2]) {
      result = self.items().sort(function(a, b) {
        return a.review() === b.review() ? 0 : (a.review() > b.review() ? -1 : 1);
      }).slice(0, 5);
    } else {
      result = self.items().sort(function(a, b) {
        return a.review() === b.review() ? 0 : (a.name() < b.name() ? -1 : 1);
      });
    }
    updateMarker(result);
    return result;
  });

  self.currentAddress = ko.observable(Data.currentAddress);
  self.review = ko.computed(function() {
    return ko.utils.arrayFilter(self.items(), function(item) {
      return item.rate() >= 4.5;
    });
  });

  self.popular = ko.computed(function() {
    return ko.utils.arrayFilter(self.items(), function(item) {
      return item.review() >= 200;
    });
  });

  /*operations*/
  ko.bindingHandlers.addressAutocomplete = {
    init: function(element, valueAccessor, allBindingsAccessor) {
      var value = valueAccessor(),
        allBindings = allBindingsAccessor();

      var options = {
        types: ['geocode']
      };
      ko.utils.extend(options, allBindings.autocompleteOptions);

      var autocomplete = new google.maps.places.Autocomplete(element, options);
      autocomplete.bindTo('bounds', map);

      google.maps.event.addListener(autocomplete, 'place_changed', function() {
        self.FullAddress('');
        self.Lat('');
        self.Lon('');
        result = autocomplete.getPlace();
        value(result.formatted_address);
        if (!result.geometry) {
          window.alert("can not find this place");
          return;
        }
        // If the place has a geometry, the present it on map;
        if (result.geometry.viewport) {
          map.fitBounds(result.geometry.viewport);
        } else {
          map.setCenter(result.geometry.location);
        }
        center.setIcon(({
          url: result.icon,
          size: new google.maps.Size(71, 71),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(0, 0),
          scaledSize: new google.maps.Size(35, 35)
        }));
        center.setPosition(result.geometry.location);
        center.setVisible(true);
        if (result.geometry) {
          allBindings.lat(result.geometry.location.lat());
          allBindings.lon(result.geometry.location.lng());
        }

        // The following section poplutes any bindings that match an address component with a first type that is the same name
        // administrative_area_level_1, posatl_code etc. these can be found in the Google Places API documentation
        var components = _(result.address_components).groupBy(function(c) {
          return c.types[0];
        });
        _.each(_.keys(components), function(key) {
          if (allBindings.hasOwnProperty(key))
            allBindings[key](components[key][0].short_name);
        });
      });
    },
    update: function(element, valueAccessor, allBindingsAccessor) {
      if (self.FullAddress() && self.Lat() && self.Lon()) {
        fetchData(self.FullAddress(), Data.yelp_url).done(function(response, status, body) {
          if (body.status === 200) {
            successCallback(response.businesses);
            return;
          }
        }).fail(function() {
          $('#yelpElem').text('fail to load yelp Resources');
        });
        ko.bindingHandlers.value.update(element, valueAccessor);
      }
    }
  };

  //update marker
  function updateMarker(places) {
    deleteMarkers(self.markers());
    self.markers.removeAll();
    _.each(places, function(place) {
      var marker = new google.maps.Marker({
        position: place.ll(),
        map: self.googleMap,
        animation: google.maps.Animation.DROP,
        title: place.name(),
      });
      marker.info = new google.maps.InfoWindow({
        content: '<DIV><H4>' + place.name() + '</H4><IMG ID="info-image" BORDER="0" ALIGN="Left" SRC="' + place.image() + '"></IMG><DIV ID="info-text">' + place.text() + '</DIV></DIV>',
        maxWidth: 260
      });
      google.maps.event.addListener(marker, 'click', (function(marker) {
        return function toggleBounce() {
          if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
          } else {
            map.setZoom(15);
            map.setCenter(marker.getPosition());
            marker.setAnimation(google.maps.Animation.BOUNCE);
            marker.info.open(map, marker);
          }
        };
      })(marker));
      self.markers.push(marker);
    });
  }

  // Deletes all markers in the array by removing references to them.
  function deleteMarkers(places) {
    _.each(places, function(place) {
      place.setMap(null);
    });
  }

  //get data from yelp and pass to view
  function fetchData(currentAddress, url) {
    var parameters = {
      oauth_consumer_key: "7rqoAa2v6JN6e-OxrS6fHQ",
      oauth_token: "omTVpsVs_FzVgxLbGPXqeZVrlB8oDcoS",
      oauth_signature_method: 'HMAC-SHA1',
      oauth_version: '1.0',
      callback: 'cb',
      location: currentAddress,
      limit: 20,
    };
    var offset = (Data.count * 20).toString();
    parameters.offset = offset;
    Data.count++;
    var nonce = Math.floor(Math.random() * 1e12).toString();
    parameters.oauth_nonce = nonce;
    var timestamp = Math.floor(Date.now() / 1000);
    parameters.oauth_timestamp = timestamp;
    var encodedSignature = oauthSignature.generate('GET', url, parameters,
      "YOoYY4UHe1D3tEixMbExUtBqptI", "G2Hd_VDIroxB_PyvV4i4XHoMZNk");
    parameters.oauth_signature = encodedSignature;
    return $.ajax({
      url: url,
      data: parameters,
      cache: true,
      dataType: "jsonp",
    });
  }

  //load initial search and convert it to item instance, the populate  self item
  function successCallback(businesses) {
    var mappedBusiness = $.map(businesses, function(business) {
      return new Item(business);
    });
    self.items(mappedBusiness);

  }
}
