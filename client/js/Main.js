//Model
//Global variables---model
//Model-initial Model
var Data = {
    categories:{
      Review:{
        name:"Review",
        length:[]
      }, Popular:{
        name:"Popular",
        length:[]
      }, Distance:{
        name:"Distance",
        length:[]
      }, All:{
        name:"All",
        length:[]
      }
    },
    category: {name: "All", items:[]},
    yelp_url: "https://api.yelp.com/v2/search",
    count : 0,
    items: [],
    markers: [],
    currentAddress : {
        lat: 40.75,
        lng:  -111.8833,
        location: "Salt+Lake+City"
    },
    icon: "images/Hotel.svg",
};

//init Google error handling
var googleMapErrorHandling = function() {
    if (typeof google || typeof google.map) {
        $('#map').text("Failed To Get Google Map Resources :(");
    }
}();

var parameters = {
    oauth_consumer_key: "7rqoAa2v6JN6e-OxrS6fHQ",
    oauth_token: "omTVpsVs_FzVgxLbGPXqeZVrlB8oDcoS",
    oauth_signature_method: 'HMAC-SHA1',
    oauth_version: '1.0',
    callback: 'cb',
    location: Data.currentAddress.location,
    cll: Data.currentAddress.lat + ',' + Data.currentAddress.lng,
    limit: 20,
    sort: "0",
    category_filter: $('#selectCategory').val() ||Data.category
};

//Model-update Model

//controller
//Item prototype to setup receiving data
function Itemlize (bizname, bizurl, bizrate, bizimg, bizreview, bizll, biztext) {
  this.name = bizname;
  this.url = bizurl;
  this.rate = bizrate;
  this.img = bizimg;
  this.review = bizreview;
  this.ll = bizll;
  this.text = biztext;
}
//get data from yelp and pass to view
function fetchData (parameters, url) {
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

function successCallback(businesses) {
    Data.items = [];
    _.each(businesses, function(business) {
        var bizname = business.name;
        var bizurl = business.url;
        var bizrate = business.rating_img_url;
        var bizimg = business.image_url;
        var bizreview = business.review_count;
        var bizlat = business.location.coordinate.latitude;
        var bizlng = business.location.coordinate.longitude;
        var bizll = {
            lat: bizlat,
            lng: bizlng
        };
        var biztext = business.snippet_text;
        var biz = business.is_closed;
        Data.items.push(new Itemlize(bizname, bizurl, bizrate, bizimg, bizreview, bizll, biztext. bizopen));
    });
    //initList(Data.items);
}

//controller-initial
function addMarker (item, index, map) {
  window.setTimeout (function () {
    var marker = new google.maps.Marker({
      position: item.ll,
      map: map,
      animation: google.maps.Animation.DROP,
      title: item.name,
    });

    Data.markers.push(marker);

    marker.info = new google.maps.InfoWindow ({
      content: '<DIV><H4>'+item.name+'</H4><IMG ID="info-image" BORDER="0" ALIGN="Left" SRC="' + item.img + '"></IMG><DIV ID="info-text">'+item.text+'</DIV></DIV>',
      maxWidth: 260
    });

    google.maps.event.addListener (marker, 'click', (function (marker) {
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
  }, index * 50);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers () {
  _.each(Data.markers, function(marker) {
    marker.setMap(null);
  });
  Data.markers = [];
}

//view
//initial map view
function initMap() {
  //styleArray defines Google map style
  var styleArray = [{
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
  }];
  var map = new google.maps.Map($('#map')[0], {
    center: Data.currentAddress,
    zoom: 10,
    styles: styleArray
  });
  var markerImage = new google.maps.MarkerImage(Data.icon,
    new google.maps.Size(71, 71),
    new google.maps.Point(0, 0),
    new google.maps.Point(0, 0),
    new google.maps.Size(35, 35));
  var marker = new google.maps.Marker({
    map:map,
    position: map.getCenter(),
    icon: markerImage
  });

  //Create the search box and link it to the UI element
  var input = $('#pac-input')[0];
  var autoComplete = new google.maps.places.Autocomplete(input);
  autoComplete.bindTo('bounds', map);

  center = new google.maps.Marker({
    map: map,
    anchorPoint: new google.maps.Point(0, -29)
  });

  autoComplete.addListener('place_changed', function() {
    center.setVisible(false);
    var place = autoComplete.getPlace();
    if (!place.geometry) {
      window.alert("can not find this place");
      return;
    }
    // If the place has a geometry, the present it on map;
    if (place.geometry.viewport) {
       map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
    }
    center.setIcon(({
      url: place.icon,
      size: new google.maps.Size(71, 71),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(0, -29),
      scaledSize: new google.maps.Size(35, 35)
    }));
    center.setPosition(place.geometry.location);
    center.setVisible(true);

    var address = Data.currentAddress.location;
    if (place.address_components) {
      address = [
        (place.address_components[0] && place.address_components[0].short_name || ''),
        (place.address_components[1] && place.address_components[1].short_name || ''),
        (place.address_components[2] && place.address_components[2].short_name || '')
      ].join(' ');
    }

    Data.currentAddress.lat = map.getCenter().lat();
    Data.currentAddress.lng = map.getCenter().lng();
    Data.currentAddress.location = place.address_components[0].short_name.split(' ').join('+');
    parameters.location = Data.currentAddress.location;
    parameters.cll = Data.currentAddress.lat.toString().slice(0,6) + ',' + Data.currentAddress.lng.toString().slice(0,6);

    //clear out the old markers.
    deleteMarkers();

    //addMarker to map view
    fetchData (parameters, Data.yelp_url).done (function (response, status, body) {
        if (body.status === 200) {
            successCallback(response.businesses);
            return;
        }}).done(function(response){
            initMarkers(map, Data.items); //call iniMarkers to make markers on map
        }).fail (function () {
      $('#yelpElm').text('fail to load yelp Resources');});
  });
  // 20 seconds after the center of the map has changed go back to initial center
  map.addListener('center_changed', function() {
    window.setTimeout(function() {
      map.setCenter({
        lat: Data.currentAddress.lat,
        lng: Data.currentAddress.lng
      });
      map.setZoom(12);
    }, 20000);
  });

  google.maps.event.addDomListener(window, 'load', initMap);
  google.maps.event.addDomListener(window, "resize", function() {
    var center = map.getCenter();
    google.maps.event.trigger(map, "resize");
    map.setCenter(center);
  });
}

function initMarkers(map, items) {
  _.each(Data.items, function(item, index) {
      console.log("initMarker", item, index)
    addMarker(item,  index, map);
  });
}

//initial list view
function initList (items) {
  _.each(items, function (item) {
    var yelplist = '<a href="' + item.url + '">' + item.name + '    </a><img src="' + item.rate + '"</img><span>    ' + item.review + '</span><br><img src="' + item.img + '"</img>';
    $("<li/>", {
      html: yelplist
    }).appendTo($('#yelpElem'));
  });
}

function CategorySelectionViewModel() {
  this.availableCategories = [
    {name:Data.categories.Review.name},
    {name:Data.categories.Popular.name},
    {name:Data.categories.Distance.name},
    {name:Data.categories.All.name},
  ];
  this.category = ko.observable();
}

ko.applyBindings(new CategorySelectionViewModel(), $('#select')[0]);

function UpdateCategoryViewModel() {
  var self = this;
  self.items = ko.observableArray([]);

  self.ChangeCategory = function() {
    self.items.removeAll();
    _.each(category.items, function(item) {
      slef.items.push({
        name: item.name,
        url: item.url,
        rate: item.rate,
        review: item.review,
        img: item.img
      })
    })
  }

}

ko.applyBindings(new UpdateCategoryViewModel(), $('#yelpElem')[0]);

