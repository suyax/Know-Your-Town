var mq = window.matchMedia("(min-width:580px)");

if (mq.matches) {
    $('#trig').on('click', function(event) {
        event.preventDefault();
        $('#map').toggleClass('col-xs-12 col-xs-8');
        $('#left').toggleClass('col-xs-0 col-xs-4');
        $('#toggle-text').text('Map View');

    });
} else {
    $('#trig').on('click', function(event) {
        event.preventDefault();
        $('#map').toggleClass('col-xs-12 col-xs-0');
        $('#left').toggleClass('col-xs-0 col-xs-12');
        $('#trig').text() !== "Map View" ? $('#trig').text('Map View') : $('#trig').text('List View');
    });
}