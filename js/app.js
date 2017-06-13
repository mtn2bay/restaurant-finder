var dataArray = [];

// Constructor for data from Google Places API
function RestaurantInfo(placeID, location, name, rating, price, photo) {
  this.placeID = placeID;
  this.location = location;
  this.name = name;
  this.rating = rating;
  this.price = price;
  this.photo = photo;
}


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
    var userQuery = this.value;

    this.value = '';
    phpCall(userQuery, '');
    activateMarkers = true;
  }
});

// AJAX call for PHP script
// Recieve and parse data from Google Places API via PHP
// Build an array of objects for each location
function phpCall(keyword, pageToken) {
  var url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=43.656758,-70.256169&radius=1200&type=restaurant&keyword=' + keyword + '&pagetoken=' + pageToken + '&key=AIzaSyDordTGObTW8WRPHFTrCGwLo3PUlorSszs';

	$.ajax({
		url: "php/script.php",
		type: "POST",
		data: ({url: url}),
		success: function(data) {
      loadData(keyword, data);
    }
	})
}


function loadData(keyword, data) {
  var restaurantList = [];
  var results = JSON.parse(data);
  var pageToken = results.next_page_token;
  results = results.results;

  dataArray.push.apply( dataArray, results );

  console.log(pageToken, results, dataArray);

  if (pageToken) {
    setTimeout(function() {
      phpCall(keyword, pageToken);
    }, 1000);
  } else {
    for (var i = 0; i < dataArray.length; i++) {
      restaurantList[i] = new RestaurantInfo(dataArray[i].place_id, dataArray[i].geometry.location,
        dataArray[i].name, dataArray[i].rating, dataArray[i].price_level);
      if (dataArray[i].photos) {
        restaurantList[i].RestaurantInfo = dataArray[i].photos[0].html_attributions[0];
      }
    }
    for (var i = 0; i < restaurantList.length; i++) {
      createMarker(restaurantList[i]);
    }
  }
}


// Google Maps API
var searchBox = document.getElementById("search");
var map, service, infoWindow;

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

}

function createMarker(place) {
  var location = place.location;
  var marker = new google.maps.Marker({
    map: map,
    position: location
  });

  google.maps.event.addListener(marker, 'click', function() {
    infoWindow.setContent(place.name);
    infoWindow.open(map, this);
  });
}
