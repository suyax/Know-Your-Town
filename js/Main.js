
//Model
//Global variables---model
var items=[];
var center = {lat: 40.665911, lng: -111.513906};
var defaultImg = 'images/Hotel.svg';
var markers=[];
var map;
//Model-initial Model 
//Model-initial Model yelp 
var keyword=document.getElementById("keyword").value;
var $yelpElem = $('#yelpElem');
var yelp_url = "http://api.yelp.com/v2/search"; 
var $selectCategory = 'food';
var yelpRequestTimeout = setTimeout(function(){
    $yelpElem.text("failed to get yelp resources");
}, 8000);
var nonce = Math.floor(Math.random() * 1e12).toString();
var parameters = {
  oauth_consumer_key: "7rqoAa2v6JN6e-OxrS6fHQ",
  oauth_token: "jTINSkrHtlq0Vw8eRrYyK1SFrXmLWUnt",
  oauth_nonce: nonce,
  oauth_timestamp: Math.floor(Date.now()/1000),
  oauth_signature_method: 'HMAC-SHA1',
  oauth_version: '1.0',
  callback: 'cb',
  location: 'Park+City',
  cll: '40.665911,-111.513906',
  term: keyword,
  limit: 10,
  //category_filter: $selectCategory
};

var encodedSignature = oauthSignature.generate('GET', yelp_url, parameters,
    "YOoYY4UHe1D3tEixMbExUtBqptI", "0H8fIAhkGp_z9M09IIfQxmvZoIk");
parameters.oauth_signature = encodedSignature;


//Model-update Model
$selectCategory =$('#selectCategory').val();

//controller 
//Item prototype to setup receving data 
function Item(bizname, bizurl, bizrate, bizimg, bizreview, bizll){
  this.name= bizname;
  this.url=bizurl;
  this.rate=bizrate;
  this.img=bizimg;
  this.review=bizreview;
  this.ll=bizll;
};
//get data from yelp and pass to view
$.ajax({
    url: yelp_url,
    data: parameters,
    cache: true,
    dataType: "jsonp",

    //jsonp: "callback",
    success: function( response ) {
      $.each(response.businesses, function(business){
        var bizname = response.businesses[business].name;
        var bizurl =  response.businesses[business].url;
        var bizrate = response.businesses[business].rating_img_url;
        var bizimg = response.businesses[business].image_url;
        var bizreview = response.businesses[business].review_count;
        var bizlat = response.businesses[business].location.coordinate.latitude;
        var bizlng = response.businesses[business].location.coordinate.longitude;
        var bizll =  {lat: bizlat, lng: bizlng};
        items.push( new Item(bizname, bizurl, bizrate, bizimg, bizreview, bizll));
      });
      clearTimeout(yelpRequestTimeout);
      initMap();
      initList(items);
    }
});
//controller-initial 
function addMarker(item,map) {
  var marker = new google.maps.Marker({
      position: item.ll,
      map: map,
      animation: google.maps.Animation.DROP,
      title: item.name

  });

  marker.info = new google.maps.InfoWindow({
    content: '<IMG BORDER="0" ALIGN="Left" SRC="' + item.img +'">'
  })

  google.maps.event.addListener(marker,'click', (function(marker){
    return   function toggleBounce() {
          console.log(marker);
    if (marker.getAnimation() !== null) {
      marker.setAnimation(null);
    } else {
    map.setZoom(18);
    map.setCenter(marker.getPosition());
    marker.setAnimation(google.maps.Animation.BOUNCE);
    marker.info.open(map, marker);
    }
  };
    })(marker));
  
};
//controller- update
//view
//initial map view
function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
    center: center,
    zoom: 12
  });
  initMarkers(map);//call iniMarkers to make markers on map
  map.addListener('center_changed', function(){
    // 5 seconds after the center of the map has changed go back to initial center
    window.setTimeout(function(){
      map.panTo(center);
      map.setZoom(12);
    },8000);
  });//if make center changed go back to original center
};
//addMarker to map view
function initMarkers(map) {
  items.forEach(function(item){
    addMarker(item, map)
  })
};

//initial list view
function initList(items){
  items.forEach(function(item){
    var yelplist = '<a href="' + item.url + '">' + item.name + '    </a><img src="' + item.rate + '"</img><span>    ' + item.review + '</span><br><img src="' + item.img + '"</img>' ;
    $("<li/>",{
      html: yelplist
    }).appendTo($yelpElem);

  })
  
};
//initial navi view
var ViewModel = function(){
  var self = this;
  this.keyword = ko.observable("Hotel")
};

ko.applyBindings(new ViewModel());

