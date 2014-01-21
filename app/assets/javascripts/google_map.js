 /*!
  NZQuake (c) Copyright Greg Smith
*/

var map;
var user_coordinates; 

function createEventMarker(eventLatlng) {
    return new google.maps.Marker({position: eventLatlng, map: map});
}

function setupMap(lat, lng, mapZoom, showOverviewControl) {
    var mapLatlng = new google.maps.LatLng(lat, lng);
    var myOptions = {
        zoom: mapZoom,
        center: mapLatlng,
        overviewMapControl: showOverviewControl,
        zoomControl: true,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL,
            position: google.maps.ControlPosition.LEFT_TOP

        },
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
}

/*
These three functions are given to navigator.geolocation.getCurrentPosition
so that we know how to handle success, error and to give options
*/
var geolocation_options = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 0
};

function geolocation_success(pos) {
  user_coordinates = pos.coords;

  console.log('Your current position is:');
  console.log('Latitude : ' + user_coordinates.latitude);
  console.log('Longitude: ' + user_coordinates.longitude);
  console.log('More or less ' + user_coordinates.accuracy + ' meters.');
  setupMap(user_coordinates.latitude, user_coordinates.longitude, 13, true);
};

function geolocation_error(err) {
  user_coordinates = new google.maps.LatLng(39.3, -76.616);
  console.warn('ERROR(' + err.code + '): ' + err.message); 
};

function initialize() {
    // need a good default location ...
    setupMap(39.3, -76.616, 13, true);

    // non-blocking, so we set up the map first, then we will move
    // to this location if/when we get a position
    navigator.geolocation.getCurrentPosition(geolocation_success, geolocation_error, geolocation_options);
    //    var eventLatlng = new google.maps.LatLng(39.3, -76.616);
    // var marker = createEventMarker(eventLatlng);
    //marker.setAnimation(google.maps.Animation.DROP);
    // $('#map_canvas').gmap({'center': marker});
};

function track_position(sleep) {
    sleep = typeof sleep !== 'undefined' ? sleep : 15000;
    if(sleep > 0) {
	navigator.geolocation.getCurrentPosition(geolocation_success, geolocation_error, geolocation_options);
	setTimeout(track_position(sleep), sleep); 
    }
}

