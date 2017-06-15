var searchBox = document.getElementById('search');
var markersArray = [];
var map, infoWindow;


// Constructor to collect desired data from Google Places API
function RestaurantInfo(placeID, location, name, rating, price, photo) {
  this.placeID = placeID;
  this.location = location;
  this.name = name;
  this.rating = rating;
  this.price = price;
}


// Text input functionality
// Clear placeholder on focus
searchBox.addEventListener('focus', function(event) {
  event.target.setAttribute('placeholder', '');
});
searchBox.addEventListener('blur', function(event) {
  event.target.setAttribute('placeholder', 'e.g. Taqueria');
});
// Initialize search and clear old results on enter key
searchBox.addEventListener('keyup', function(event) {
  event.preventDefault();
  if (event.keyCode == 13) {
    var userQuery = this.value;
    this.value = '';
    loadData.results = [];
    loadData.restaurantList = [];
    clearMarkers();
    getPlaces(userQuery);
  }
});


// Send Google Places API endpoint to script.php
// Recieve JSON data
// jQuery to make AJAX call clean and simple
function getPlaces(keyword) {
  var url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=43.656758,-70.256169&radius=1200&type=restaurant&keyword='
    + keyword + '&key=AIzaSyDordTGObTW8WRPHFTrCGwLo3PUlorSszs';

  $.ajax({
    url: "php/script.php",
    type: "POST",
    data: ({url: url}),
    success: function(data) {
      if (data) {
        loadData(data);
      } else {
        alert('No Results');
      }
    }
  })
}

function loadData(data) {
  this.restaurantList = [];
  this.results = JSON.parse(data); //Parse JSON data into object
  results = results.results;

  for (let result of results) {
    restaurantList.push(new RestaurantInfo(result.place_id, result.geometry.location,
      result.name, result.rating, result.price_level));
  }

  for (let place of restaurantList) {
    //Create marker for each location
    createMarker(place);
  }
}

// Google Maps API
function initMap() {
  var center = new google.maps.LatLng(43.656758, -70.256169);

  map = new google.maps.Map(document.getElementById('map-container'), {
    center: center,
    zoom: 16,
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

  var contentString = '<div>' + place.name + '</div>' +
    '<span id="no-link" name="' + place.placeID + '">MORE INFO</span>';

  //Open info window when marker is clicked
  google.maps.event.addListener(marker, 'click', function() {
    infoWindow.setContent(contentString);
    infoWindow.open(map, this);
    document.getElementById('no-link').addEventListener('click', function() {
      var placeID = this.getAttribute('name');
      getDetails(placeID);
    })
  })

}

function clearMarkers() {
  for (let marker of markersArray) {
    marker.setMap(null);
  }
  markersArray = [];
}

function getDetails(placeID) {
  var url = 'https://maps.googleapis.com/maps/api/place/details/json?placeid='
    + placeID + '&key=AIzaSyDordTGObTW8WRPHFTrCGwLo3PUlorSszs';

  $.ajax({
    url: "php/script.php",
    type: "POST",
    data: ({url: url}),
    success: function(data) {
      if (data) {
        showDetails(data)
      } else {
        alert('No Results');
      }
    }
  })
}

function showDetails(data) {
  this.results = JSON.parse(data);
  results = results.result;
  console.log(results);

  var detailDisplay = document.createElement('div');
  detailDisplay.setAttribute('id', 'place-details');
  var detailContent = document.createTextNode(results);
  var content = document.getElementById('content');

  detailDisplay.appendChild(detailContent);
  content.appendChild(detailDisplay);
}
