var mq = window.matchMedia("(min-width: 768px)");

if (mq.matches) {
  $('#switch-view').on('click', function(event) {
    event.preventDefault();
    $('#left').toggleClass('col-xs-4 col-xs-0');
    $('#toggle-text').text('Map View');

  });
} else {
  $('#switch-view').on('click', function(event) {
    event.preventDefault();
    $("#navbar").attr("aria-expanded","false").toggleClass("in");
    $('#left').toggleClass('col-xs-4 col-xs-0');
    $('#switch-view').text() !== "Map View" ? $('#switch-view').text('Map View'): $('#switch-view').text('List View');
  });

}
