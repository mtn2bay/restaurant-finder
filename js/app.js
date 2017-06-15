var searchBox = document.getElementById('search');
var detailDiv = document.getElementById('place-details');
var markersArray = [];
var map, infoWindow;

// Constructor to collect desired data from Google Places API
function PlaceInfo(placeID, location, name) {
  this.placeID = placeID;
  this.location = location;
  this.name = name;
}

// Constructor to collect desired data from Place Details request
function PlaceDetails(name, hours, price, rating, reviews, address, website) {
  this.name = name;
  this.hours = hours;
  this.price = price;
  this.rating = rating;
  this.reviews = reviews;
  this.address = address;
  this.website = website;
}

// Clear input placeholder on focus
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
    loadPlaces.results = [];
    loadPlaces.placesList = [];
    clearMarkers();
    getPlaces(userQuery);
  }
});

// Close details div if user clicks outside
document.addEventListener('click', function(event) {
  var isClick = detailDiv.contains(event.target);
  if (!isClick) {
    if (detailDiv.style.display === 'block') {
      detailDiv.style.display = 'none';
    }
  }
})

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
        loadPlaces(data);
      } else {
        alert('No Results');
      }
    }
  })
}

// Process data from Google Places API
function loadPlaces(data) {
  this.placesList = [];
  this.results = JSON.parse(data);
  results = results.results;

  for (let result of results) {
    placesList.push(new PlaceInfo(result.place_id, result.geometry.location,
      result.name));
  }

  for (let place of placesList) {
    createMarker(place);
  }
}

// Send Place Details request to script.php
// Recieve JSON data
function getDetails(placeID) {
  var url = 'https://maps.googleapis.com/maps/api/place/details/json?placeid='
    + placeID + '&key=AIzaSyDordTGObTW8WRPHFTrCGwLo3PUlorSszs';

  $.ajax({
    url: "php/script.php",
    type: "POST",
    data: ({url: url}),
    success: function(data) {
      if (data) {
        loadDetails(data);
      } else {
        alert('No Results');
      }
    }
  })
}

// Process data from Place Details request
function loadDetails(data) {
  this.results = JSON.parse(data);
  results = results.result;

  var detailsObject = new PlaceDetails(results.name, results.opening_hours.weekday_text,
    results.price_level, results.rating, results.reviews[0].text, results.vicinity, results.website);

  var detailsArray = Object.values(detailsObject);
  printDetails(detailsArray);
}

// Output Place Details results to DOM
function printDetails(detailsArray) {
  document.getElementById('hours').innerHTML = '';

  // Break up array of hours, create container for each day
  for (let day of detailsArray[1]) {
    var placeDay = document.createElement('p');
    var placeHours = document.createTextNode(day);
    placeDay.appendChild(placeHours);
    document.getElementById('hours').appendChild(placeDay);
  }

  document.getElementById('name').innerHTML = detailsArray[0];
  document.getElementById('rating').innerHTML = detailsArray[3];
  document.getElementById('reviews').innerHTML = detailsArray[4];
  document.getElementById('address').innerHTML = detailsArray[5];

  if (typeof detailsArray[2] !== 'undefined') {
    document.getElementById('price').innerHTML = detailsArray[2];
  }
  if (typeof detailsArray[2] !== 'undefined') {
    document.getElementById('website').innerHTML = '<a href="' + detailsArray[6] + '" target="_blank">' + detailsArray[6] + '</a>';
  }
  // Show details div
  if (detailDiv.style.display === 'none') {
    detailDiv.style.display = 'block';
  }
}

// Initialize Google Maps API
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

  markersArray.push(marker); // Add markers to array to allow them to be cleared

  var contentString = '<div>' + place.name + '</div>' +
    '<span id="no-link" placeID="' + place.placeID + '">MORE INFO</span>';

  // Open infoWindow when marker is clicked
  google.maps.event.addListener(marker, 'click', function() {
    infoWindow.setContent(contentString);
    infoWindow.open(map, this);
    // Add 'more info' event listener when infoWindow opens
    document.getElementById('no-link').addEventListener('click', function() {
      var placeID = this.getAttribute('placeID');
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
