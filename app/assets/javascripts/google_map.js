 /*!
  NZQuake (c) Copyright Greg Smith
*/

var map;
var user_coordinates; 

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
    console.log('geo success!');
    user_coordinates = pos.coords;
    
    console.log('Your current position is:');
    console.log('Latitude : ' + user_coordinates.latitude);
    console.log('Longitude: ' + user_coordinates.longitude);
    console.log('More or less ' + user_coordinates.accuracy + ' meters.');
    setupMap(user_coordinates.latitude, user_coordinates.longitude, 13, true);
    
    console.log('Obtaining initial markers');
    
    obtain_markers(5000);
};

function geolocation_success_add_markers(pos) {

    geolocation_success(pos);
    console.log('adding listener for markers');
    // this will get the markers right away and 1 second after the center is changed
    google.maps.event.addListener(map, 'center_changed',
				  function() {	
				      console.log('Center changed');
				      window.setTimeout(function() { console.log('Obtaining markers'); obtain_markers(5000);  }, 1000);
				  }); 
};

function geolocation_error(err) {
  user_coordinates = new google.maps.LatLng(39.3, -76.616);
  console.warn('ERROR(' + err.code + '): ' + err.message); 
};

function createEventMarker(eventLatlng) {
    return new google.maps.Marker({position: eventLatlng, map: map});
}

function add_marker(lat,lng) {
    var latlng = new google.maps.LatLng(lat,lng);
    add_marker_latlng(latlng);
}

function add_marker_latlng(latlng) {
    var marker = createEventMarker(latlng);
    marker.setAnimation(google.maps.Animation.DROP);
    $('#map_canvas').gmap({'center': marker});
}

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
    //obtain_markers(5000);
};

//var center = map.getCenter();
// TODO: only get markers if above zoom level 7 (or so)
//var zoom = getZoom();

/* to do an HTTP get using jQuery
$.get(
    "somepage.php",
    {paramOne : 1, paramX : 'abc'},
    receive_json_markers(data)
    );
*/

function receive_json_markers(data) {
    console.log('Data length: ' + data.length);

    for ( i = 0; i < data.length; i++ ) {
	var latlng = new google.maps.LatLng(data[ i ].latitude, data[ i ].longitude);
	var infoWindow = new google.maps.InfoWindow();
	var marker = new google.maps.Marker({
            map: map,
            icon: 'http://mobilemap.herokuapp.com/assets/green_marker_32.png',
            position: latlng,
            title: data[ i ].text,
            html: '<div class="info-window"> ' + data[ i ].text + ' </div>'
	});
	google.maps.event.addListener(marker, 'click', function() {
            infoWindow.setContent(this.html); 
            infoWindow.setOptions({maxWidth: 800});
            infoWindow.open(map, this);
	});
    }
}
function obtain_markers(max) {
    center = map.getCenter();
    console.log('Map center: ' + center);
    $.get(
	'http://mobilemap.herokuapp.com/events.json',
	//'http://localhost:3000/events.json',
	{center_latitude : center.latitude, center_longitude : center.longitude, num_events : max, box_size : 2},
	function(data) { receive_json_markers(data); }
    );// http get to the REST server's API
}


// call this on the main page to not be confused with any other maps  
// google.maps.event.addListener(map, 'center_changed',obtain_markers(1000));

// TODO: on the 'create new' page, we should put a cross hairs marker, and
// we should get it's position when the 'form' is submitted. 

//"http://mobilemap.herokuapp.com/events",
//


var track = setInterval(function(){find_position; },15000);

function find_position() {
    navigator.geolocation.getCurrentPosition(geolocation_success_add_markers, geolocation_error, geolocation_options);
}

function stop_tracking()
{
  clearInterval(track);
}