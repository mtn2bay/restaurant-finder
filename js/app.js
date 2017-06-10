function initMap() {
  var loc = {lat: 43.657134, lng: -70.259530};
  var map = new google.maps.Map(document.getElementById('map-container'), {
    zoom: 14,
    center: loc
  });
}
