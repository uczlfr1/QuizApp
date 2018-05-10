// load the map
var mymap = L.map('mapid').setView([51.505, -0.09], 13);
// load the tiles
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
maxZoom: 18,
attribution: 'Map data &copy; <ahref="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>,' +
'Imagery © <a href="http://mapbox.com">Mapbox</a>',
id: 'mapbox.streets'
}).addTo(mymap);

// create a custom popup
var popup = L.popup();
// create an event detector to wait for the user's click event and then use the popup to show them where they clicked
// note that you don't need to do any complicated maths to convert screen coordinates to real world coordiantes - the Leaflet API does this for you
function onMapClick(e) {
popup
.setLatLng(e.latlng)
.setContent("You clicked the map at " + e.latlng.toString())
.openOn(mymap);
}
// now add the click event detector to the map
mymap.on('click', onMapClick);

//track location, calculate distance and show popup
function trackLocation() {
 if (navigator.geolocation) {
	 navigator.geolocation.watchPosition(showPosition);
	 } else {
		 document.getElementById('showLocation').innerHTML = "Geolocation is not supported by this browser.";} // track location
     navigator.geolocation.watchPosition(getDistanceFromPoint); // for calculating distance
}

// show current position as a circle with coordiantes in a popup
function showPosition(position) {
 document.getElementById('showLocation').innerHTML = "Latitude: " + position.coords.latitude +"<br>Longitude: " + position.coords.longitude;
 L.circle([position.coords.latitude, position.coords.longitude], 5, {color: 'blue', fillColor: '#f03', fillOpacity: 0.5}
	     ).addTo(mymap).bindPopup(position.coords.latitude.toString()+","+position.coords.longitude.toString()+"<br />I am here.").openPopup();
}

// extract data from url of database
function getJSON(url) {
        var data ;
        var xmlHttp ;
        data  = '' ;
        xmlHttp = new XMLHttpRequest();
        if(xmlHttp != null)
            {xmlHttp.open( "GET", url, false );
             xmlHttp.send( null );
             data = xmlHttp.responseText;}
           return data ;
}

// a loop to calculate distances between current location and locations in database
function getDistanceFromPoint(position) {
var geoJSONString = getJSON('http://developer.cege.ucl.ac.uk:30270/getGeoJSON/postgresql/geom');
var geoJSON = JSON.parse(geoJSONString); // convert to geoJSON (object)
for(var i = 0; i < geoJSON[0].features.length; i++) {  // a loop to process all data
      var feature = geoJSON[0].features[i];
          for (component in feature){
	          if (component =="geometry"){
	        	    for (geometry in feature[component]){
		    	             var lng=feature[component][geometry][0];
				             var lat=feature[component][geometry][1];                             
                             var distance = calculateDistance(position.coords.latitude, position.coords.longitude, lat,lng, 'K');
                                 document.getElementById('showDistance').innerHTML = "Distance: " + distance;
                                       if (distance<0.4){ // setting popup distance 
	                                           L.marker([lat, lng]).addTo(mymap).bindPopup("<b>Not far</b>").openPopup();
											            Quiz(i); //here show related question
														}
                                               }
                              }
                     }
           }
}


// code adapted from https://www.htmlgoodies.com/beyond/javascript/calculate-the-distance-between-two-points-inyour-web-apps.html
function calculateDistance(lat1, lon1, lat2, lon2, unit) {
 var radlat1 = Math.PI * lat1/180;
 var radlat2 = Math.PI * lat2/180;
 var radlon1 = Math.PI * lon1/180;
 var radlon2 = Math.PI * lon2/180;
 var theta = lon1-lon2;
 var radtheta = Math.PI * theta/180;
 var subAngle = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
 subAngle = Math.acos(subAngle);
 subAngle = subAngle * 180/Math.PI; // convert the degree value returned by acos back to degrees from radians
 dist = (subAngle/360) * 2 * Math.PI * 3956; // ((subtended angle in degrees)/360) * 2 * pi * radius )
// where radius of the earth is 3956 miles
 if (unit=="K") { dist = dist * 1.609344 ;} // convert miles to km
 if (unit=="N") { dist = dist * 0.8684 ;} // convert miles to nautical miles
 return dist;
 }

// show question and choices of answers by replacing the content in the sidebar
function Quiz(i) {
var geoJSONString = getJSON('http://developer.cege.ucl.ac.uk:30270/getGeoJSON/postgresql/geom');
var geoJSON = JSON.parse(geoJSONString);
    document.getElementById("question").innerHTML =geoJSON[0].features[i].properties.question;
    document.getElementById("answer1").innerHTML =geoJSON[0].features[i].properties.answer1;
    document.getElementById("answer2").innerHTML =geoJSON[0].features[i].properties.answer2;
    document.getElementById("answer3").innerHTML =geoJSON[0].features[i].properties.answer3;
    document.getElementById("answer4").innerHTML =geoJSON[0].features[i].properties.answer4;
}
	
var client;
//Use document.getElementById to get the first bit of text data from the form
function startDataUpload() {
// now get the radio button values
alert ("start data upload");
if (document.getElementById("option1").checked) {
postString=postString+"&answerlist=option1";
}
if (document.getElementById("option2").checked) {
postString=postString+"&answerlist=option2";
}	
if (document.getElementById("option3").checked) {
postString=postString+"&answerlist=option3";
}
if (document.getElementById("option4").checked) {
postString=postString+"&answerlist=option4";
}	
processData(postString);}
	
function processData(postString) {
client = new XMLHttpRequest();
client.open('POST','http://developer.cege.ucl.ac.uk:30270/uploadQuizData',true);
client.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
client.onreadystatechange = dataUploaded;
client.send(postString);

}
// create the code to wait for the response from the data server, and process the response once it is received

function dataUploaded() {
// this function listens out for the server to say that the data is ready - i.e. has state 4
if (client.readyState == 4) {
// change the DIV to show the response
document.getElementById("dataUploadResult").innerHTML = client.responseText;
}
}

