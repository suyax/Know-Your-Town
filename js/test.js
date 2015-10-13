var $yelpElem = $('#yelpElem');
var yelp_url = "http://api.yelp.com/v2/search";
var yelpRequestTimeout = setTimeout(function(){
    $yelpElem.text("failed to get yelp resources");
}, 8000);
var $keyword = $('#keyword').val();
var $selectCategory =$('#selectCategory').val();
$keyword = 'resturant';
$selectCategory = 'food';

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
  term: $keyword,
  limit: 10,
  category_filter: $selectCategory
};

var encodedSignature = oauthSignature.generate('GET', yelp_url, parameters,
    "YOoYY4UHe1D3tEixMbExUtBqptI", "0H8fIAhkGp_z9M09IIfQxmvZoIk");
parameters.oauth_signature = encodedSignature;


$.ajax({
    url: yelp_url,
    data: parameters,
    cache: true,
    dataType: "jsonp",

    //jsonp: "callback",
    success: function( response ) {
      console.log(response);
      $.each(response.businesses, function(business){
        var bizname = response.businesses[business].name;
        var bizurl =  response.businesses[business].url;
        var bizrate = response.businesses[business].rating_img_url;
        var bizimg = response.businesses[business].image_url;
        var bizreview = response.businesses[business].review_count;
        var yelp = '<a href="' + bizurl + '">' + bizname +'    </a><img src="' + bizrate + '"</img><span>    ' + bizreview + '</span><br><img src="' + bizimg + '"</img>' ;
        $("<li/>",{
          html: yelp
        }).appendTo($yelpElem);
      })
      clearTimeout(yelpRequestTimeout);
    }
});