var mq = window.matchMedia("(min-width: 768px)");

if (mq.matches) {
  $('#switch-view').on('click', function(event) {
    event.preventDefault();
    $('#left').toggleClass('col-xs-4 col-xs-0');
    $('#toggle-text').text('Map View');

  });
} else {
  $('#switch-view').on('click', function(event) {
    console.log($('#switch-view').text())
    event.preventDefault();
    $("#navbar").attr("aria-expanded","false").toggleClass("in");
    if ($('#switch-view').text() === "List View"){
      $('#switch-view').text('Map View');
      $('#left').toggleClass('col-xs-0 col-xs-4');
    } else {
      $('#switch-view').text('List View'); $('#left').toggleClass('col-xs-4 col-xs-0')
    }
  });
}
