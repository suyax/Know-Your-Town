/*Main logic: contains init logic for loading google map and yelp api, also
handles input update that triggers list and map view update */

//Data: defines default data object for initial loading
var Data = {
  categories: ['All', 'Highest Review', 'Most Popular'],
  yelp_url: "https://api.yelp.com/v2/search",
  count: 0,
  items: [],
  markers: [],
  currentAddress: {
    lat: 37.5592899,
    lng: -122.26525659999999,
    location: "Foster City Blvd, Foster City, CA 94404, USA "
  },
  icon: "images/Hotel.svg",
  zoom: {
    small: 15,
    large: 12,
  },
  mapStyle: [{
    featureType: "all",
    stylers: [{
      saturation: -80
    }]
  }, {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{
      hue: "#00ffee"
    }, {
      saturation: 60
    }]
  }, {
    featureType: "poi.business",
    elementType: "labels",
    stylers: [{
      visibility: "off"
    }]
  }]
};

//initial function passed as callback, when Google API finished loading in HTML
// this function will be trigger
function init() {
  initMap();
  ko.applyBindings(new ViewModel(map));
}

//initials Google map on page load called by init function: handles Google API
//cannot be load correctly error, creates map and enables map to resize
//according to window size change
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

//Google map API error handling: called by initMap function
var googleMapErrorHandling = function() {
  if (typeof google !== 'object' || typeof google.map !== 'object') {
    $('#map').text("Failed To Get Google Map Resources :(");
  }
};

//creactMap function: called by initMap function, creates google map with
//default info
function createMap() {
  map = new google.maps.Map($('#map')[0], {
    center: Data.currentAddress,
    zoom: Data.zoom.large,
    styles: Data.mapStyle
  });
}

// ViewModel: include ko.bind logic, pass in map as param,
function ViewModel(map) {
  /*data*/
  var self = this;
  self.inputName = ko.observable('');
  self.FullAddress = ko.observable(Data.currentAddress.location);
  self.Street = ko.observable('s');
  self.Suburb = ko.observable('c');
  self.State = ko.observable('r');
  self.Lat = ko.observable(Data.currentAddress.lat);
  self.Lon = ko.observable(Data.currentAddress.lng);
  self.googleMap = map;
  availableCategories = Data.categories;
  self.category = ko.observable(Data.categories[0]);
  self.items = ko.observableArray(Data.items);
  self.markers = ko.observableArray(Data.markers);
  self.select = ko.computed(function() {
    var result = self.items();
    if (self.category() === Data.categories[1]) {
      result = self.items().sort(function(a, b) {
        return a.rate() == b.rate() ? 0 : (a.rate() > b.rate() ? -1 : 1);
      }).slice(0, 5);
    } else if (self.category() === Data.categories[2]) {
      result = self.items().sort(function(a, b) {
        return a.review() === b.review() ? 0 : (a.review() > b.review() ? -1 : 1);
      }).slice(0, 5);
    } else {
      result = self.items();
    }
    if (self.inputName().length > 0) {
        result = _.filter(result, function(item) {
          return item.name().split(' ').join('').toLowerCase().search(self.inputName().toLowerCase())+1;
        })
      updateMarker(result);
      if (self.markers().length === 0) {
        map.setCenter({lat: parseFloat(self.Lat()), lng: parseFloat(self.Lon())});
        map.setZoom(Data.zoom.small);
    }
      return result;
  });
  self.openInfo = function(place) {
    $('#map').toggleClass('col-xs-12 col-xs-0');
    $('#left').toggleClass('col-xs-0 col-xs-12');
       _.each(self.markers(), function(marker) {
        if (place.name() === marker.getTitle()) {
          map.setZoom(Data.zoom.small);
          map.setCenter(marker.getPosition());
          marker.setAnimation(google.maps.Animation.BOUNCE);
          marker.info.open(map, marker);
        }
      });
     };

  /*operations*/
  //ko custom biding for address auto complete
  ko.bindingHandlers.addressAutocomplete = {
    init: function(element, valueAccessor, allBindingsAccessor) {
      var value = valueAccessor(), allBindings = allBindingsAccessor();
      var options = {
        types: ['geocode']
      };
      ko.utils.extend(options, allBindings.autocompleteOptions);

      var autocomplete = new google.maps.places.Autocomplete(element, options);
      autocomplete.bindTo('bounds', map);

      google.maps.event.addListener(autocomplete, 'place_changed', function() {
        deleteAddress();
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
          anchor: new google.maps.Point(0, -39),
          scaledSize: new google.maps.Size(35, 35)
        }));
        center.setPosition(result.geometry.location);
        center.setVisible(true);
        if (result.geometry) {
          allBindings.lat(result.geometry.location.lat());
          allBindings.lon(result.geometry.location.lng());
        }

        // administrative_area_level_1, posatl_code etc. Reference Google Places API documentation
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
          $('#yelp-list').text('fail to load yelp Resources');
        });
        ko.bindingHandlers.value.update(element, valueAccessor);
      }
    }
  };

  //update marker: called by self.select compute, delete old markers and add new
  function updateMarker(places) {
    deleteMarkers(self.markers());
    var bounds = new google.maps.LatLngBounds();
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
            map.setZoom(Data.zoom.small);
            map.setCenter(marker.getPosition());
            marker.setAnimation(google.maps.Animation.BOUNCE);
            marker.info.open(map, marker);
          }
            $("#navbar").attr("aria-expanded","false").removeClass("in");
        };
      })(marker));
      self.markers.push(marker);
      bounds.extend(marker.getPosition());
      });
    self.googleMap.fitBounds(bounds);
  }

  // Deletes all markers in the array by removing references to them.
  function deleteMarkers(places) {
    _.each(places, function(place) {
      place.setMap(null);
    });
    self.markers.removeAll();
  }

  function deleteAddress() {
    self.FullAddress('');
    self.Lat('');
    self.Lon('');
  }

  //fetch data function: get data from yelp and pass to viewModel on success,
  //take params: currentAddress, url
  function fetchData(currentAddress, url) {
    var parameters = {
      oauth_consumer_key: "7rqoAa2v6JN6e-OxrS6fHQ",
      oauth_token: "omTVpsVs_FzVgxLbGPXqeZVrlB8oDcoS",
      oauth_signature_method: 'HMAC-SHA1',
      oauth_version: '1.0',
      callback: 'cb',
      location: currentAddress,
      limit: 20,
      offset: parseInt(Data.count* 20)
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

  //successCallback function: load json data and convert it to item instance, then populate self item
  function successCallback(businesses) {
    var mappedBusiness = $.map(businesses, function(business) {
      return new Item(business);
    });
    self.items(mappedBusiness);
  }

  //Item class, take in data and make it organized
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
}
