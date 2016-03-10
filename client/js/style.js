var mq = window.matchMedia("(min-width: 768px)");

if (mq.matches) {

  $('#switch-view').on('click', function(event) {
      event.preventDefault();
    $('#map').toggleClass('col-xs-12 col-xs-8');
    $('#left').toggleClass('col-xs-0 col-xs-4');
    $('#toggle-text').text('Map View');

  });
} else {
  $('#switch-view').on('click', function(event) {
    event.preventDefault();
    $("#navbar").attr("aria-expanded","false").toggleClass("in");
    $('#map').toggleClass('col-xs-12 col-xs-0');
    $('#left').toggleClass('col-xs-0 col-xs-12');
    $('#switch-view').text() !== "Map View" ? $('#switch-view').text('Map View'): $('#switch-view').text('List View');
  });

}
