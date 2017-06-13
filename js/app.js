var searchBox = document.getElementById('search');
var dataArray = [];
var restaurantList = [];
var markersArray = [];
var map, infoWindow;


// Constructor to collect desired data from Google Places API
function RestaurantInfo(placeID, location, name, rating, price, photo) {
  this.placeID = placeID;
  this.location = location;
  this.name = name;
  this.rating = rating;
  this.price = price;
  this.photo = photo;
}

// Text input functionality
// Clear placeholder on focus
searchBox.addEventListener('focus', function(event) {
  event.target.setAttribute('placeholder', '');
});
searchBox.addEventListener('blur', function(event) {
  event.target.setAttribute('placeholder', 'e.g. Taqueria');
});
// Initialize search on enter key
searchBox.addEventListener('keyup', function(event) {
  event.preventDefault();
  if (event.keyCode == 13) {
    var userQuery = this.value;
    this.value = '';
    dataArray = [];
    restaurantList = [];
    clearMarkers();
    phpCall(userQuery, '');
  }
});

// Send Google Places API endpoint to script.php
// Recieve JSON data
// jQuery to make AJAX call clean and simple
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

  //Parse JSON data
  var results = JSON.parse(data);
  var pageToken = results.next_page_token;
  results = results.results;
  
  //Push results from each page into master array
  dataArray.push.apply(dataArray, results);
  console.log(results, dataArray);

  //Call PHP/API again if extra pages exist
  if (pageToken) {
    setTimeout(function() {
      phpCall(keyword, pageToken);
    }, 1500); // Need delay to allow additional pages to generate
  } else {
    //Once data from all pages is received, create array of objects for each location
    for (var i = 0; i < dataArray.length; i++) {
      restaurantList[i] = new RestaurantInfo(dataArray[i].place_id, dataArray[i].geometry.location,
        dataArray[i].name, dataArray[i].rating, dataArray[i].price_level);
      if (dataArray[i].photos) {
        restaurantList[i].RestaurantInfo = dataArray[i].photos[0].html_attributions[0];
      }
    }
    for (var i = 0; i < restaurantList.length; i++) {
      //Create marker for each location
      createMarker(restaurantList[i]);
    }
  }
}

// Google Maps API
function initMap() {
  var center = new google.maps.LatLng(43.656758, -70.256169);

  map = new google.maps.Map(document.getElementById('map-container'), {
    center: center,
    zoom: 17,
    disableDefaultUI: true
  });

  infoWindow = new google.maps.InfoWindow();
}

function createMarker(place) {
  var location = place.location;
  var marker = new google.maps.Marker({
    map: map,
    position: location
  });

  markersArray.push(marker); //Add markers to array to allow them to be cleared

  //Open info window when marker is clicked
  google.maps.event.addListener(marker, 'click', function() {
    infoWindow.setContent(place.name);
    infoWindow.open(map, this);
  });
}

function clearMarkers() {
  for (var i = 0; i < markersArray.length; i++ ) {
    markersArray[i].setMap(null);
  }
  markersArray = [];
}
