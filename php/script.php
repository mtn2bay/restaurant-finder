<?php

  // Recieve API endpoint from app.js
  $url = $_POST['url'];

  // Request JSON data from Google Places API
  $response = file_get_contents($url);

  // Return JSON data to app.js
  echo $response;

?>
