function init(){initMap(),ko.applyBindings(new ViewModel(map))}function initMap(){createMap(),center=new google.maps.Marker({map:map,anchorPoint:new google.maps.Point(0,0)}),google.maps.event.addDomListener(window,"resize",function(){var e=map.getCenter();google.maps.event.trigger(map,"resize"),map.setCenter(e)})}function googleMapErrorHandling(){"object"==typeof google&&"object"==typeof google.map||$("#map").text("Failed To Get Google Map Resources :(")}function createMap(){map=new google.maps.Map($("#map")[0],{center:Data.currentAddress,zoom:Data.zoom.large,styles:Data.mapStyle})}function ViewModel(e){function t(t){o(i.markers());var a=new google.maps.LatLngBounds;_.each(t,function(t){var o=new google.maps.Marker({position:t.ll(),map:i.googleMap,animation:google.maps.Animation.DROP,title:t.name()});o.info=new google.maps.InfoWindow({content:"<DIV><H4>"+t.name()+'</H4><IMG ID="info-image" BORDER="0" ALIGN="Left" SRC="'+t.image()+'"></IMG><DIV ID="info-text">'+t.text()+"</DIV></DIV>",maxWidth:260}),google.maps.event.addListener(o,"click",function(t){return function(){null!==t.getAnimation()?t.setAnimation(null):(e.setZoom(Data.zoom.small),e.setCenter(t.getPosition()),t.setAnimation(google.maps.Animation.BOUNCE),t.info.open(e,t)),$("#navbar").attr("aria-expanded","false").removeClass("in")}}(o)),i.markers.push(o),a.extend(o.getPosition())}),i.googleMap.fitBounds(a)}function o(e){_.each(e,function(e){e.setMap(null)}),i.markers.removeAll()}function a(){i.FullAddress(""),i.Lat(""),i.Lon("")}function n(e,t){var o={oauth_consumer_key:"7rqoAa2v6JN6e-OxrS6fHQ",oauth_token:"omTVpsVs_FzVgxLbGPXqeZVrlB8oDcoS",oauth_signature_method:"HMAC-SHA1",oauth_version:"1.0",callback:"cb",location:e,limit:20,offset:parseInt(20*Data.count)},a=(20*Data.count).toString();o.offset=a,Data.count++;var n=Math.floor(1e12*Math.random()).toString();o.oauth_nonce=n;var r=Math.floor(Date.now()/1e3);o.oauth_timestamp=r;var s=oauthSignature.generate("GET",t,o,"YOoYY4UHe1D3tEixMbExUtBqptI","G2Hd_VDIroxB_PyvV4i4XHoMZNk");return o.oauth_signature=s,$.ajax({url:t,data:o,cache:!0,dataType:"jsonp"})}function r(e){var t=$.map(e,function(e){return new s(e)});i.items(t)}function s(e){this.name=ko.observable(e.name),this.url=ko.observable(e.url),this.rate=ko.observable(e.rating),this.rateImg=ko.observable(e.rating_img_url),this.image=ko.observable(e.image_url),this.review=ko.observable(e.review_count),this.ll=ko.observable({lat:e.location.coordinate.latitude,lng:e.location.coordinate.longitude}),this.text=ko.observable(e.snippet_text)}var i=this;i.inputName=ko.observable(""),i.FullAddress=ko.observable(Data.currentAddress.location),i.Street=ko.observable("s"),i.Suburb=ko.observable("c"),i.State=ko.observable("r"),i.Lat=ko.observable(Data.currentAddress.lat),i.Lon=ko.observable(Data.currentAddress.lng),i.googleMap=e,availableCategories=Data.categories,i.category=ko.observable(Data.categories[0]),i.items=ko.observableArray(Data.items),i.markers=ko.observableArray(Data.markers),i.select=ko.computed(function(){var o=i.items();return i.category()===Data.categories[1]?o=i.items().sort(function(e,t){return e.rate()==t.rate()?0:e.rate()>t.rate()?-1:1}).slice(0,5):i.category()===Data.categories[2]?o=i.items().sort(function(e,t){return e.review()===t.review()?0:e.review()>t.review()?-1:1}).slice(0,5):i.inputName().length>0&&(o=_.filter(o,function(e){return e.name().split(" ").join("").toLowerCase().search(i.inputName().toLowerCase())+1}),0===i.markers().length&&(e.setCenter({lat:parseFloat(i.Lat()),lng:parseFloat(i.Lon())}),e.setZoom(Data.zoom.small))),t(o),o}),i.openInfo=function(t){$("#map").toggleClass("col-xs-12 col-xs-0"),$("#left").toggleClass("col-xs-0 col-xs-12"),_.each(i.markers(),function(o){t.name()===o.getTitle()&&(e.setZoom(Data.zoom.small),e.setCenter(o.getPosition()),o.setAnimation(google.maps.Animation.BOUNCE),o.info.open(e,o))})},ko.bindingHandlers.addressAutocomplete={init:function(t,o,n){var r=o(),s=n(),i={types:["geocode"]};ko.utils.extend(i,s.autocompleteOptions);var l=new google.maps.places.Autocomplete(t,i);l.bindTo("bounds",e),google.maps.event.addListener(l,"place_changed",function(){if(a(),result=l.getPlace(),r(result.formatted_address),!result.geometry)return void window.alert("can not find this place");result.geometry.viewport?e.fitBounds(result.geometry.viewport):e.setCenter(result.geometry.location),center.setIcon({url:result.icon,size:new google.maps.Size(71,71),origin:new google.maps.Point(0,0),anchor:new google.maps.Point(0,-39),scaledSize:new google.maps.Size(35,35)}),center.setPosition(result.geometry.location),center.setVisible(!0),result.geometry&&(s.lat(result.geometry.location.lat()),s.lon(result.geometry.location.lng()));var t=_(result.address_components).groupBy(function(e){return e.types[0]});_.each(_.keys(t),function(e){s.hasOwnProperty(e)&&s[e](t[e][0].short_name)})})},update:function(e,t,o){i.FullAddress()&&i.Lat()&&i.Lon()&&(n(i.FullAddress(),Data.yelp_url).done(function(e,t,o){return 200===o.status?void r(e.businesses):void 0}).fail(function(){$("#yelp-list").text("fail to load yelp Resources")}),ko.bindingHandlers.value.update(e,t))}}}var Data={categories:["All","Highest Review","Most Popular"],yelp_url:"https://api.dyelp.com/v2/search",count:0,items:[],markers:[],currentAddress:{lat:37.5592899,lng:-122.26525659999999,location:"Foster City Blvd, Foster City, CA 94404, USA "},icon:"images/Hotel.svg",zoom:{small:15,large:12},mapStyle:[{featureType:"all",stylers:[{saturation:-80}]},{featureType:"road.arterial",elementType:"geometry",stylers:[{hue:"#00ffee"},{saturation:60}]},{featureType:"poi.business",elementType:"labels",stylers:[{visibility:"off"}]}]};googleMapErrorHandling();var mq=window.matchMedia("(min-width: 768px)");mq.matches?$("#switch-view").on("click",function(e){e.preventDefault(),$("#left").toggleClass("col-xs-4 col-xs-0"),$("#toggle-text").text("Map View")}):$("#switch-view").on("click",function(e){e.preventDefault(),$("#navbar").attr("aria-expanded","false").toggleClass("in"),$("#left").toggleClass("col-xs-4 col-xs-0"),"Map View"!==$("#switch-view").text()?$("#switch-view").text("Map View"):$("#switch-view").text("List View")});