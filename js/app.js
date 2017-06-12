
// Text input functionality
var searchBox = document.getElementById('search');

searchBox.addEventListener('focus', function(event) {
  event.target.setAttribute('placeholder', '');
});
searchBox.addEventListener('blur', function(event) {
  event.target.setAttribute('placeholder', 'e.g. Taqueria');
});

searchBox.addEventListener('keyup', function(event) {
  event.preventDefault();
  if (event.keyCode == 13) {
    userQuery = this.value;
    this.value = '';
    phpCall(userQuery);
    activateMarkers = true;
  }
});


// AJAX call for PHP script
function phpCall(keyword) {
  var url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=43.656758,-70.256169&radius=1200&type=restaurant&keyword=' + keyword + '&key=AIzaSyDordTGObTW8WRPHFTrCGwLo3PUlorSszs';

	$.ajax({
		url: "php/script.php",
		type: "POST",
		data: ({url: url}),
		success: function(data) {
      var results = JSON.parse(data);
      console.log(results);
    }
	})
}


// Google Maps API
var searchBox = document.getElementById("search");
var map, service, infoWindow, userQuery;

function initMap() {
  var center = new google.maps.LatLng(43.656758, -70.256169);

  map = new google.maps.Map(document.getElementById('map-container'), {
    center: center,
    zoom: 17,
    disableDefaultUI: true
  });

  var request = {
    location: center,
    radius: 8000,
    types: ['restaurant']
  };

  infoWindow = new google.maps.InfoWindow();

  // service = new google.maps.places.PlacesService(map);
  // service.nearbySearch(request, callback);
}

function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      var place = results[i]
      createMarker(results[i]);
    }
  }
}

function createMarker(place) {
  var placeloc = place.geometry.location;
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });

  google.maps.event.addListener(marker, 'click', function() {
    infoWindow.setContent(place.name);
    infoWindow.open(map, this);
  });
}
