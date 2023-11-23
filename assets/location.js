var map;
var currentLat, currentLng;
var markers = [];
var currentInfowindow = null;
var searchResults = [];

function createCurrentLocationMarker(lat, lng) {
    var markerOptions = {
        map: map,
        position: new kakao.maps.LatLng(lat, lng),
        image: new kakao.maps.MarkerImage('http://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png', new kakao.maps.Size(64, 69), { offset: new kakao.maps.Point(27, 69) })
    };
    if (currentLocationMarker) {
        currentLocationMarker.setPosition(markerOptions.position);
    } else {
        currentLocationMarker = new kakao.maps.Marker(markerOptions);
    }
}

navigator.geolocation.getCurrentPosition(successGps, failGps);

function successGps(position) {
    currentLat = position.coords.latitude;
    currentLng = position.coords.longitude;
    initializeMap(currentLat, currentLng);
    addEventListenersToItems();
}

function failGps() {
    console.log("Geolocation Failed. Using default location.");
    initializeMap(36.840661737281, 127.18197560107);
    addEventListenersToItems();
}

function initializeMap(lat, lng) {
    var container = document.getElementById("map");
    var options = {
        center: new kakao.maps.LatLng(lat, lng),
        level: 3
    };
    map = new kakao.maps.Map(container, options);
    createCurrentLocationMarker(lat, lng);
}

function addEventListenersToItems() {
    var items = document.querySelectorAll(".keyword");
    items.forEach(function(item) {
        item.removeEventListener("click", keywordClickHandler);
        item.addEventListener("click", keywordClickHandler);
    });
}

function keywordClickHandler(event) {
    event.preventDefault();
    removeMarkers();
    closeInfowindow();
    searchAndDisplay(event.target.textContent.trim());
}

function searchAndDisplay(keyword) {
    var ps = new kakao.maps.services.Places();
    ps.keywordSearch(keyword, function(data, status) {
        if (status === kakao.maps.services.Status.OK) {
            var bounds = new kakao.maps.LatLngBounds();
            searchResults = data;
            searchResults.forEach(function(place) {
                displayMarker(place, bounds);
            });
            map.setBounds(bounds);
            displayPlacesInfo(searchResults);
        } else {
            console.log("검색 결과가 없습니다");
        }
    }, { location: new kakao.maps.LatLng(currentLat, currentLng) });
}

function displayPlacesInfo(places) {
    var listEl = document.getElementById('search-results');
    listEl.innerHTML = '';
    places.forEach(function(place) {
        var placeEl = document.createElement('div');
        placeEl.className = 'd-flex p-2 location_list';
        placeEl.textContent = place.place_name;
        listEl.appendChild(placeEl);
        placeEl.addEventListener('click', function() {
            openInfowindowAtMarker(place.marker);
        });
    });
}

function displayMarker(place, bounds) {
    var marker = new kakao.maps.Marker({
        map: map,
        position: new kakao.maps.LatLng(place.y, place.x)
    });
    var infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });
    kakao.maps.event.addListener(marker, "click", function() {
        if (currentInfowindow === infowindow) {
            infowindow.close();
            currentInfowindow = null;
        } else {
            if (currentInfowindow) {
                currentInfowindow.close();
            }
            infowindow.setContent('<div style="padding:5px;font-size:12px;">' + place.place_name + '</div>');
            infowindow.open(map, marker);
            currentInfowindow = infowindow;
        }
    });
    place.marker = marker;
    bounds.extend(new kakao.maps.LatLng(place.y, place.x));
}

function openInfowindowAtMarker(marker) {
    if (marker) {
        kakao.maps.event.trigger(marker, 'click');
    }
}

function removeMarkers() {
    markers.forEach(function(marker) {
        marker.setMap(null);
    });
    markers = [];
}

function closeInfowindow() {
    if (currentInfowindow) {
        currentInfowindow.close();
    }
    currentInfowindow = null;
}

var startY, startHeight;
document.getElementById('resizer').addEventListener('mousedown', function(e) {
    startY = e.clientY;
    startHeight = parseInt(document.defaultView.getComputedStyle(document.getElementById('search-results-container')).height, 10);
    document.documentElement.addEventListener('mousemove', doDrag, false);
    document.documentElement.addEventListener('mouseup', stopDrag, false);
});

function doDrag(e) {
    var newHeight = startHeight + e.clientY - startY;
    document.getElementById('search-results-container').style.height = newHeight + 'px';
}

function stopDrag(e) {
    document.documentElement.removeEventListener('mousemove', doDrag, false);
    document.documentElement.removeEventListener('mouseup', stopDrag, false);
}
