//TODO
//send value to server

var userLat;
var userLng;
var hobos;
var map;
var userMarker;
var markers;
const url = "https://brocklum.github.io/dogoodcity2/hobodatabase.json";
var isClicked = false;

var config = {
	apiKey: "AIzaSyC_Z3zw-U0-LZHmQHxp8RfaLmwq567aSt0",
	authDomain: "hackwestern-aeebf.firebaseapp.com",
	databaseURL: "https://hackwestern-aeebf.firebaseio.com",
	projectId: "hackwestern-aeebf",
	storageBucket: "",
	messagingSenderId: "1095184407138"
};
if (!firebase.apps.length) {
	firebase.initializeApp(config);
}

var database = firebase.database();
console.log(database);


//Creates map and places markers on map based on JSON data
function initMap() {
	var coords = {lat: 43.0096, lng: -81.2737};
	map = new google.maps.Map(document.getElementById("map"), {
		zoom: 13,
		center: coords,
		streetViewControl: false
	});
	var request = new XMLHttpRequest();
	request.open('GET', url, true);

	request.onload = function() {
	  if (request.status >= 200 && request.status < 400) {
	    // Success!
	    hobos = JSON.parse(request.responseText);
	    placeMarkers();
	  } else {
	    // We reached our target server, but it returned an error

	  }
};

request.onerror = function() {
  // There was a connection error of some sort
};

request.send();
	
}

function placeMarkers() {
	console.log("Placing markers...");
	markers = new Array(hobos.length);
	var hoboInfo = new Array(hobos.length);
	for (let i = 0; i < hobos.length; i++) {
		markers[i] = new google.maps.Marker({
			position: {lat: hobos[i].lat, lng: hobos[i].long},
			map: map
		});
		
		hoboInfo[i] = new google.maps.InfoWindow({
			content: hobos[i].name
		});
		markers[i].addListener("click", function() {
			hoboInfo[i].open(map, markers[i]);
		});
		
	}
}

//Gets user's current location
function getLoc() {
	if (!isClicked) {
		if (navigator.geolocation) {
			isClicked = true;
			navigator.geolocation.getCurrentPosition(showPosition);
		} else { 
			x.innerHTML = "Geolocation is not supported by this browser.";
		}
	} else {
		swal(
			"Error:",
			"You already clicked the button!",
			"error"
		);
	}

}

function showPosition(position) {
	userLat = position.coords.latitude;
	userLng = position.coords.longitude;
//Place marker on map with user's location
	isClicked = true;
	userMarker = new google.maps.Marker({
		position: {lat: userLat, lng: userLng},
		icon: "img/man.png",
		map: map
	});
	userInfo = new google.maps.InfoWindow({
		content: "Latitude: " + userLat + "<br>Longitude: " + userLng
	});
	userMarker.addListener("click", function() {
		userInfo.open(map, userMarker);
	});
//Display locations that user is near
	var hobosNear = nearMarker();
	document.getElementById("beforeButtons").innerHTML = "Click a button below if you helped at this location!";
	for (var i = 0; i < hobosNear.length; i++) {
		$("#buttons").append("<button value='"+hobosNear[i].name+"'onclick='send(this.value, `Brock`)' class='button is-primary mybtn'>"+hobosNear[i].name+"</button><br>");
	}
}

//Based on user's location, shows whether they are near any of the markers
function nearMarker() {
	var markersNear = [];
	for (let i = 0; i < markers.length; i++) {
		if (Math.abs(userLat-hobos[i].lat) < 0.1 && Math.abs(userLng-hobos[i].long) < 0.1) {
			markersNear.push(hobos[i]);
		}
	}
	return markersNear;
}

//Sends the value clicked to the server
function send(name, username) {
	swal(
		"Success!",
		"Your points have been logged for: " + name,
		"success"
	);
	var points;
	firebase.database().ref(username).once('value')
	.then(function(snapshot) {
		snapshot.forEach(function(childSnapshot) {
			points = childSnapshot.val();
			console.log(points);
		});
	});
	setTimeout(function() {
		if (points == undefined) {
			firebase.database().ref(username).set({
				val: 100
			});		
		} else {
			firebase.database().ref(username).set({
				val: points+100
			});
		}		
	}, 500);


	
}
