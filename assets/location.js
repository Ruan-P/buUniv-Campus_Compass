// 전역 변수 선언
var map;
var currentLat, currentLng; // 현재 위치의 위도와 경도

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

  addEventListenersToItems();
}

function failGps() {
  console.log("Geolocation Failed");
}

function addEventListenersToItems() {
  const items = document.querySelectorAll('.nav-link');
  items.forEach(item => {
    item.addEventListener('click', function(event) {
      event.preventDefault();
      searchAndDisplay(item.textContent.trim());
    });
  });
}

function searchAndDisplay(keyword) {
  var ps = new kakao.maps.services.Places(); 
  var placesOption = {
    location: new kakao.maps.LatLng(currentLat, currentLng) // 현재 위치 기준 검색
  };
  ps.keywordSearch(keyword, function(data, status, pagination) {
    if (status === kakao.maps.services.Status.OK) {
      var bounds = new kakao.maps.LatLngBounds();
      for (var i = 0; i < data.length && i < 5; i++) {
        displayMarker(data[i], bounds);    
      }
      map.setBounds(bounds);
    } else {
      console.log("검색 결과가 없습니다");
    }
  }, placesOption);
}

function displayMarker(place, bounds) {
  var marker = new kakao.maps.Marker({
    map: map,
    position: new kakao.maps.LatLng(place.y, place.x) 
  });

  var infowindow = new kakao.maps.InfoWindow({zIndex:1});
  kakao.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent('<div style="padding:5px;font-size:12px;">' + place.place_name + '</div>');
    infowindow.open(map, marker);
  });

  bounds.extend(new kakao.maps.LatLng(place.y, place.x));
}
