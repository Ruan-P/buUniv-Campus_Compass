var map;
var currentLat, currentLng;
var markers = [];
var currentInfowindow = null; 
var currentLocationMarker; 
var searchResults = []; 
var markerIndices = []; 

function createCurrentLocationMarker(lat, lng) {
  if (currentLocationMarker) {
    currentLocationMarker.setPosition(new kakao.maps.LatLng(lat, lng));
  } else {
    currentLocationMarker = new kakao.maps.Marker({
      map: map,
      position: new kakao.maps.LatLng(lat, lng),
      image: new kakao.maps.MarkerImage(
        "https://cdn4.iconfinder.com/data/icons/small-n-flat/24/map-marker-512.png",
        new kakao.maps.Size(64, 64),
        {
          offset: new kakao.maps.Point(27, 69),
        },
      ),
    });
  }
}

navigator.geolocation.getCurrentPosition(successGps, failGps);

function successGps(position) {
  currentLat = position.coords.latitude; 
  currentLng = position.coords.longitude; 

  const container = document.getElementById("map"); 
  const options = {
    center: new kakao.maps.LatLng(currentLat, currentLng), 
    level: 3, 
  };
  map = new kakao.maps.Map(container, options); 
  createCurrentLocationMarker(currentLat, currentLng);
  addEventListenersToItems(); 

  map.setZoomable(false);
  map.setLevel(3); 

  var zoomControl = new kakao.maps.ZoomControl();
  map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT); 
}

function failGps() {
  console.log("Geolocation Failed. Using default location.");

  const defaultLat = 36.839261737281;
  const defaultLng = 127.18357560107;

  // 지도 생성
  const container = document.getElementById("map");
  const options = {
    center: new kakao.maps.LatLng(defaultLat, defaultLng), 
    level: 3, 
  };
  map = new kakao.maps.Map(container, options); 

  createCurrentLocationMarker(defaultLat, defaultLng);
  addEventListenersToItems();

  map.setZoomable(false);
  map.setLevel(3); 

  var zoomControl = new kakao.maps.ZoomControl();
  map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT); 
}

function addEventListenersToItems() {
  const items = document.querySelectorAll(".keyword");
  items.forEach((item) => {
    item.removeEventListener("click", keywordClickHandler);
    item.addEventListener("click", keywordClickHandler);
  });
}

function keywordClickHandler(event) {
  event.preventDefault();
  console.log("클릭된 키워드: ", event.target.textContent.trim());
  removeMarkers();
  closeInfowindow();
  searchAndDisplay(event.target.textContent.trim());
  navbarActiveSwitch();
}

function navbarActiveSwitch() {
  const navLinks = [
    document.getElementById("NavLink-1"),
    document.getElementById("NavLink-2"),
    document.getElementById("NavLink-3"),
    document.getElementById("NavLink-4"),
  ];

  navLinks.forEach((navItem, index) => {
    navItem.addEventListener("click", () => {
      if (!navItem.classList.contains("active")) {
        navItem.classList.add("active");

        navLinks.forEach((otherNavItem, otherIndex) => {
          if (otherIndex !== index) {
            otherNavItem.classList.remove('active');
          }
        });
      }
    });
  });
}

function mapKeyword(originalKeyword) {
  const keywordMap = {
    카페: "카페",
    병원: "병원",
    세탁방: "세탁",
    편의점: "편의점",
  };
  return keywordMap[originalKeyword] || originalKeyword;
}

function searchAndDisplay(keyword) {
  console.log("검색 시작: ", keyword);

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        currentLat = position.coords.latitude;
        currentLng = position.coords.longitude;
        searchingStart(keyword, currentLat, currentLng);
      },
      function () {
        console.log("위치 권한이 허용되지 않았습니다. 기본 위치를 사용합니다.");
        const defaultLat = 36.839261737281;
        const defaultLng = 127.18357560107;
        searchingStart(keyword, defaultLat, defaultLng);
      },
    );
  } else {
    console.log("위치 기능이 지원되지 않습니다. 기본 위치를 사용합니다.");
    const defaultLat = 36.839261737281;
    const defaultLng = 127.18357560107;
    searchingStart(keyword, defaultLat, defaultLng);
  }
}

function searchingStart(keyword, currentLat, currentLng) {
  var mappedKeyword = mapKeyword(keyword);
  var ps = new kakao.maps.services.Places();
  var placesOption = {
    location: new kakao.maps.LatLng(currentLat, currentLng),
  };

  searchResults = [];
  markerIndices = [];

  ps.keywordSearch(
    mappedKeyword,
    function (data, status, pagination) {
      if (status === kakao.maps.services.Status.OK) {
        searchResults = data
          .map(function (place) {
            place.distance = getDistanceFromLatLonInKm(
              currentLat,
              currentLng,
              place.y,
              place.x,
            );
            return place;
          })
          .sort(function (a, b) {
            return a.distance - b.distance;
          })
          .slice(0, 5);

        markers.forEach(function (marker) {
          marker.setMap(null);
        });
        markers = [];

        var bounds = new kakao.maps.LatLngBounds();
        searchResults.forEach(function (place) {
          var marker = displayMarker(place, bounds);
          if (marker) {
            place.marker = marker;
          }
        });

        bounds.extend(new kakao.maps.LatLng(currentLat, currentLng));
        map.setBounds(bounds);

        displayPlacesInfo(searchResults, currentLat, currentLng);
      } else {
        console.log("검색 결과가 없습니다");
      }
    },
    placesOption,
  );
}

function openDirectionsUrl(place) {
  var directionsUrl = 'https://place.map.kakao.com/' + place.id;
  window.open(directionsUrl, '_blank');
}

function displayPlacesInfo(places) {
  var listEl = document.querySelector(".vstack");
  listEl.innerHTML = "";

  places.forEach(function (place, index) {
    var placeEl = document.createElement("div");
    placeEl.className =
      "d-flex flex-column p-2 bg-outline-success mb-2 location";
    placeEl.innerHTML =
      `<h3 class="place_list">` +
      place.place_name +
      " - " +
      place.distance.toFixed(1) +
      "km</h3>" +
      '<button class="btn btn-outline-secondary btn-sm mt-2">상세정보</button>';
    listEl.appendChild(placeEl);

    placeEl.querySelector("button").addEventListener("click", function () {
      openDirectionsUrl(place);
    });

    placeEl.addEventListener("click", function () {
      openInfowindowAtMarker(place.marker);
    });
  });
}

function openInfowindowAtMarker(marker) {
  if (marker) {
    kakao.maps.event.trigger(marker, "click");
  }
}

function getDistanceFromLatLonInKm(lat1, lng1, lat2, lng2) {
  var R = 6371;
  var dLat = deg2rad(lat2 - lat1);
  var dLon = deg2rad(lng2 - lng1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function displayMarker(place, bounds) {
  var marker = new kakao.maps.Marker({
    map: map,
    position: new kakao.maps.LatLng(place.y, place.x),
  });

  var infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });
  kakao.maps.event.addListener(marker, "click", function () {
    if (currentInfowindow === infowindow) {
      infowindow.close();
      currentInfowindow = null;
    } else {
      if (currentInfowindow) {
        currentInfowindow.close();
      }
      infowindow.setContent(
        '<div class="infoWindow">' + place.place_name + "</div>",
      );
      infowindow.open(map, marker);
      currentInfowindow = infowindow;
    }
  });

  if (marker) {
    markers.push(marker);
  }

  bounds.extend(new kakao.maps.LatLng(place.y, place.x));
  place.marker = marker;
}

function removeMarkers() {
  console.log("현재 마커들:", markers);

  for (var i = 0; i < markers.length; i++) {
    if (markers[i]) {
      markers[i].setMap(null);
    }
  }
  markers = [];
}

function closeInfowindow() {
  if (currentInfowindow) {
    currentInfowindow.close();
  }
  currentInfowindow = null;
}
