var defaultData = {
  center: {
    lat: 40.665911,
    lng: -111.513906,
    location: "Park+City"},
  img: "images/Hotel.svg",
  term: "inn",
  category: "hotels",
  yelp_url: "https://api.yelp.com/v2/search"
};
//Model
//Global variables---model
var items = [];
var markers = [];
var currentAddress = {};
//Model-initial Model
//Model-initial Model yelp
var $keyword = $('#keyword');
var $yelpElem = $('#yelpElem');
var $selectCategory = $('#selectCategory');
var googleMapErrorHandling = function() {
  if (typeof google || typeof google.map) {
    $('#map').text("Failed To Get Google Map Resources :(");
  }}();
var nonce = Math.floor(Math.random() * 1e12).toString();
var parameters = {
  oauth_consumer_key: "7rqoAa2v6JN6e-OxrS6fHQ",
  oauth_token: "jTINSkrHtlq0Vw8eRrYyK1SFrXmLWUnt",
  oauth_nonce: nonce,
  oauth_timestamp: Math.floor(Date.now()/1000),
  oauth_signature_method: 'HMAC-SHA1',
  oauth_version: '1.0',
  callback: 'cb',
  location: currentAddress.location || defaultData.center.location,
  cll: currentAddress.lat + ','+ currentAddress.lng || defaultData.center.lat + ',' + defaultData.center.lng,
  limit: 10,
  category_filter: dataValidater($selectCategory.val(),"category")
};

function dataValidater(data,item){
  var validData = defaultData[item];
  if (data !== undefined && data.length > 0){
    validData = data;
  }
  return validData;
}

var encodedSignature = oauthSignature.generate('GET', defaultData.yelp_url, parameters,
    "YOoYY4UHe1D3tEixMbExUtBqptI", "0H8fIAhkGp_z9M09IIfQxmvZoIk");

parameters.oauth_signature = encodedSignature;

//Model-update Model

//controller
//Item prototype to setup receving data
function Item(bizname, bizurl, bizrate, bizimg, bizreview, bizll){
  this.name = bizname;
  this.url = bizurl;
  this.rate = bizrate;
  this.img = bizimg;
  this.review = bizreview;
  this.ll = bizll;
}
//get data from yelp and pass to view
function fetchData(){
  return $.ajax({
    url: defaultData.yelp_url,
    data: parameters,
    cache: true,
    dataType: "jsonp",
    });
  }

fetchData().done(function(response, status, body) {
  if (body.status === 200) {
    _.each(response.businesses, function(business){
      var bizname = business.name;
      var bizurl =  business.url;
      var bizrate = business.rating_img_url;
      var bizimg = business.image_url;
      var bizreview = business.review_count;
      var bizlat = business.location.coordinate.latitude;
      var bizlng = business.location.coordinate.longitude;
      var bizll =  {lat: bizlat, lng: bizlng};
      items.push( new Item(bizname, bizurl, bizrate, bizimg, bizreview, bizll));
    });
  initList(items);
  }
}).fail(function(){
  $yelpElem.text("Failed To Get Yelp Resources :(");
});

//controller-initial
function addMarker(item, index, map) {
  window.setTimeout(function() {
  var marker = new google.maps.Marker({
      position: item.ll,
      map: map,
      animation: google.maps.Animation.DROP,
      title: item.name,
    });

    markers.push(marker);

  marker.info = new google.maps.InfoWindow({
    content: '<><IMG BORDER="0" ALIGN="Left" SRC="' + item.img +'">'
  });

  google.maps.event.addListener(marker,'click', (function(marker){
    return   function toggleBounce() {
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
function deleteMarkers() {
  markers.forEach(function(marker) {
    marker.setMap(null);
  });
  markers = [];
}
//controller- update

//view
//initial map view
function init() {
  //styleArray defines Google map style
  var styleArray = [
      {
        featureType: "all",
        stylers: [
         { saturation: -80 }
        ]
      },{
        featureType: "road.arterial",
        elementType: "geometry",
        stylers: [
          { hue: "#00ffee" },
          { saturation: 50 }
        ]
      },{
        featureType: "poi.business",
        elementType: "labels",
        stylers: [
          { visibility: "off" }
        ]
      }
    ];
  var map = new google.maps.Map($('#map')[0], {
    center: defaultData.center,
    zoom: 10,
    styles: styleArray
  });

  //Create the search box and link it to the UI element
  var input = $('#pac-input')[0];
  var autoComplete = new google.maps.places.Autocomplete(input);
  autoComplete.bindTo('bounds', map);

  var center = new google.maps.Marker({
    map: map,
    anchorPoint: new google.maps.Point(0, -29)
  });
  autoComplete.addListener('place_changed', function() {
    center.setVisible(false);
    var place = autoComplete.getPlace();
    if (!place.geometry) {
      window.alert("find not find this place");
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
      anchor: new google.maps.Point(17, 34),
      scaledSize: new google.maps.Size(35, 35)
    }));
    center.setPosition(place.geometry.location);
    center.setVisible(true);

    var address = defaultData.location;
    if (place.address_components) {
      address = [
        (place.address_components[0] && place.address_components[0].short_name || ''),
        (place.address_components[1] && place.address_components[1].short_name || ''),
        (place.address_components[2] && place.address_components[2].short_name || '')
      ].join(' ');
    }

    currentAddress.lat = map.getCenter().lat();
    currentAddress.lng = map.getCenter().lng();
    currentAddress.location = place.address_components[0].short_name.split(' ').join('+');

    console.log(currentAddress.location);
  //clear out the old markers.
    deleteMarkers();
//addMarker to map view
    initMarkers(map);//call iniMarkers to make markers on map
  });
  // 5 seconds after the center of the map has changed go back to initial center
  map.addListener('center_changed', function(){
    window.setTimeout( function() {
      map.setCenter(currentAddress);
      map.setZoom(12);
    }, 20000);
  });
}

function initMarkers(map) {
  _.each(items, function(item, index){
    addMarker(item, index, map);
  });
}

//initial list view
function initList(items){
  $yelpElem.innerHTML="";
  items.forEach(function(item){
    var yelplist = '<a href="' + item.url + '">' + item.name + '    </a><img src="' + item.rate + '"</img><span>    ' + item.review + '</span><br><img src="' + item.img + '"</img>' ;
    $("<li/>",{
      html: yelplist
    }).appendTo($yelpElem);
  });
}
//initial navi view
var ViewModel = function(keyword){
  this.keyword = ko.observable(keyword);
  //optionValues : ["Hotels", "Food", "Shopping","Buses"],
  //selectedOptionValue : ko.observable("Hotels"),
};

ko.applyBindings(new ViewModel(defaultData.term));
