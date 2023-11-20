navigator.geolocation.getCurrentPosition(successGps, failGps);

function successGps(position) {
  const lat = position.coords.latitude; // 경도
  const lng = position.coords.longitude; // 위도
  const container = document.getElementById("map");
  let options = {
    center: new kakao.maps.LatLng(lat, lng),
    level: 3,
  };
  let map = new kakao.maps.Map(container, options);

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
      searchAndDisplay(item.textContent.trim(), map);
    });
  });
}

function searchAndDisplay(keyword, map) {
  var ps = new kakao.maps.services.Places(); 
  ps.keywordSearch(keyword, function(data, status, pagination) {
    if (status === kakao.maps.services.Status.OK) {
      var bounds = new kakao.maps.LatLngBounds();
      for (var i = 0; i < data.length && i < 5; i++) { // 상위 5개 결과만 표시
        displayMarker(data[i], map, bounds);    
      }
      map.setBounds(bounds);
    } else {
      console.log("검색 결과가 없습니다");
    }
  });
}

function displayMarker(place, map, bounds) {
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
