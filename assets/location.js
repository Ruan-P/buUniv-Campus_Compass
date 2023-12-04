// 전역 변수 선언
var map; // 지도 객체
var currentLat, currentLng; // 현재 위치의 위도와 경도
var markers = []; // 마커를 저장할 배열
var currentInfowindow = null; // 현재 열린 인포윈도우
var currentLocationMarker; // 현재 위치 마커
var searchResults = []; // 검색된 장소의 결과를 저장할 배열
var markerIndices = []; // 마커의 인덱스를 저장할 배열


function createCurrentLocationMarker(lat, lng) {
  if (currentLocationMarker) {
    currentLocationMarker.setPosition(new kakao.maps.LatLng(lat, lng));
  } else {
    currentLocationMarker = new kakao.maps.Marker({
      map: map,
      position: new kakao.maps.LatLng(lat, lng),
      // 현재 위치 마커에 대한 스타일링 (예: 다른 색상이나 아이콘)
      image: new kakao.maps.MarkerImage(
        // 마커 이미지 URL 및 사이즈 설정
        'http://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png',
        new kakao.maps.Size(64, 69),
        {
          offset: new kakao.maps.Point(27, 69),
        }
      )
    });
  }
}




// 현재 위치 정보 가져오기
navigator.geolocation.getCurrentPosition(successGps, failGps);

// GPS 정보 가져오기 성공 시 호출되는 함수
function successGps(position) {
  currentLat = position.coords.latitude; // 현재 위치의 위도
  currentLng = position.coords.longitude; // 현재 위치의 경도

  // 지도 생성
  const container = document.getElementById("map"); // 지도를 표시할 HTML 요소
  const options = {
    center: new kakao.maps.LatLng(currentLat, currentLng), // 지도의 중심 좌표 설정
    level: 3, // 지도의 확대 레벨 설정
  };
  map = new kakao.maps.Map(container, options); // 지도 객체 생성
  // 현재 위치 마커 생성
  createCurrentLocationMarker(currentLat, currentLng);

  addEventListenersToItems(); // 네비게이션 메뉴 아이템에 이벤트 리스너 추가
}

// GPS 정보 가져오기 실패 시 호출되는 함수
function failGps() {
  console.log("Geolocation Failed. Using default location.");

  // 위치 권한이 허용되지 않았을 때 천안 백석대학교의 좌표로 지도 초기화
  const defaultLat = 36.839261737281;
  const defaultLng = 127.18357560107;

  // 지도 생성
  const container = document.getElementById("map");
  const options = {
    center: new kakao.maps.LatLng(defaultLat, defaultLng), // 지도의 중심 좌표 설정
    level: 3, // 지도의 확대 레벨 설정
  };
  map = new kakao.maps.Map(container, options); // 지도 객체 생성

  // 백석대학교 진리관 위치에 마커 생성
  createCurrentLocationMarker(defaultLat, defaultLng);

  addEventListenersToItems(); // 네비게이션 메뉴 아이템에 이벤트 리스너 추가
}


// 네비게이션 메뉴 아이템에 이벤트 리스너 추가
function addEventListenersToItems() {
  const items = document.querySelectorAll(".keyword"); // 네비게이션 메뉴 아이템들을 선택
  items.forEach((item) => {
    item.removeEventListener("click", keywordClickHandler); // 기존 이벤트 리스너 제거
    item.addEventListener("click", keywordClickHandler); // 새 이벤트 리스너 추가
  });
}

function keywordClickHandler(event) {
  event.preventDefault(); // 기본 동작 방지
  console.log("클릭된 키워드: ", event.target.textContent.trim()); // 클릭 이벤트 로그
  removeMarkers(); // 모든 마커 제거
  closeInfowindow(); // 인포 윈도우 닫기
  searchAndDisplay(event.target.textContent.trim()); // 키워드로 장소 검색 및 마커 표시
}


// 키워드 설정
function mapKeyword(originalKeyword) {
  const keywordMap = {
    카페: "카페",
    병원: "병원",
    세탁방: "세탁",
    편의점: "편의점"
  };
  return keywordMap[originalKeyword] || originalKeyword;// 매핑된 키워드가 없는 경우 원래 키워드 사용
}

// 현재 위치 재설정
function resetCurrentLocation() {
  navigator.geolocation.getCurrentPosition(function(position) {
    currentLat = position.coords.latitude;
    currentLng = position.coords.longitude;
    map.setCenter(new kakao.maps.LatLng(currentLat, currentLng));
    // 현재 위치 마커 업데이트
    createCurrentLocationMarker(currentLat, currentLng);
  }, function() {
    console.log("현재 위치 재설정 실패");
  });
}

// 키워드로 장소 검색 및 마커 표시
function searchAndDisplay(keyword) {
  console.log("검색 시작: ", keyword); // 함수 호출 로그

  // 위치 권한이 허용되었는지 확인
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        // 위치 권한이 허용된 경우
        currentLat = position.coords.latitude;
        currentLng = position.coords.longitude;
        검색과정시작(keyword, currentLat, currentLng);
      },
      function () {
        // 위치 권한이 허용되지 않은 경우
        console.log("위치 권한이 허용되지 않았습니다. 기본 위치를 사용합니다.");
        const defaultLat = 36.839261737281;
        const defaultLng = 127.18357560107;
        검색과정시작(keyword, defaultLat, defaultLng);
      }
    );
  } else {
    console.log("위치 기능이 지원되지 않습니다. 기본 위치를 사용합니다.");
    // 위치 기능이 지원되지 않는 경우
    const defaultLat = 36.839261737281;
    const defaultLng = 127.18357560107;
    검색과정시작(keyword, defaultLat, defaultLng);
  }
}

// 위치 정보를 얻은 후 검색 과정을 진행하기 위한 도우미 함수
function 검색과정시작(keyword, currentLat, currentLng) {
  var mappedKeyword = mapKeyword(keyword);
  var ps = new kakao.maps.services.Places();
  var placesOption = {
    location: new kakao.maps.LatLng(currentLat, currentLng),
  };

  // 검색 상태 초기화
  searchResults = [];
  markerIndices = [];

  ps.keywordSearch(
    mappedKeyword,
    function (data, status, pagination) {
      if (status === kakao.maps.services.Status.OK) {
        // 거리 계산 및 정렬
        searchResults = data
          .map(function (place) {
            place.distance = getDistanceFromLatLonInKm(currentLat, currentLng, place.y, place.x);
            return place;
          })
          .sort(function (a, b) {
            return a.distance - b.distance;
          })
          .slice(0, 5); // 상위 5개 결과만 저장

        // 마커 초기화
        markers.forEach(function (marker) {
          marker.setMap(null); // 기존 마커 제거
        });
        markers = [];

        var bounds = new kakao.maps.LatLngBounds();
        searchResults.forEach(function (place) {
          var marker = displayMarker(place, bounds);
          if (marker) {
            place.marker = marker; // 검색 결과 항목에 마커 객체 저장
          }
        });

        map.setBounds(bounds);

        // 리스트 생성
        displayPlacesInfo(searchResults, currentLat, currentLng);

      } else {
        console.log("검색 결과가 없습니다");
      }
    },
    placesOption
  );
}

//함수 선언
function openDirectionsUrl(place) {
  // 상세정보 API활용 URL생성
  var directionsUrl = 'https://map.kakao.com/link/search/' + place.place_name;
  window.open(directionsUrl, '_blank');
}

// 검색된 장소들의 정보를 화면에 표시하는 함수
function displayPlacesInfo(places) {
  var listEl = document.querySelector('.vstack');
  listEl.innerHTML = '';

  places.forEach(function (place, index) {
    var placeEl = document.createElement('div');
    placeEl.className = 'd-flex p-2 location_list';
    placeEl.innerHTML = place.place_name + ' - ' + place.distance.toFixed(1) + 'km' +
      '<button class="directions-btn">상세정보</button>';
    listEl.appendChild(placeEl);

    placeEl.querySelector('.directions-btn').addEventListener('click', function() {
      openDirectionsUrl(place); // 상세정보 바로가기 열기
    });

    placeEl.addEventListener('click', function() {
      openInfowindowAtMarker(place.marker); // 마커 객체로 직접 인포윈도우 열기
    });
  });
}

// 마커의 인포윈도우를 열기
function openInfowindowAtMarker(marker) {
  if (marker) {
    kakao.maps.event.trigger(marker, 'click');
  }
}

// 두 좌표 간의 거리 계산 (킬로미터 단위)
function getDistanceFromLatLonInKm(lat1, lng1, lat2, lng2) {
  var R = 6371; // 지구의 반지름(km)
  var dLat = deg2rad(lat2-lat1);
  var dLon = deg2rad(lng2-lng1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // 거리(km)
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}



// 마커를 표시하는 함수 (인덱스 추가)
function displayMarker(place, bounds) {
  var marker = new kakao.maps.Marker({
    map: map,
    position: new kakao.maps.LatLng(place.y, place.x)
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
      infowindow.setContent('<div style="padding:5px;font-size:12px;">' + place.place_name + '</div>');
      infowindow.open(map, marker);
      currentInfowindow = infowindow;
    }
  });

  if (marker) { // 마커 객체가 유효한지 확인
    markers.push(marker); // 유효한 마커만 배열에 추가
  }

  bounds.extend(new kakao.maps.LatLng(place.y, place.x));
  place.marker = marker; // 검색 결과 항목에 마커 객체 저장
}



// 모든 마커 제거
function removeMarkers() {
  console.log("현재 마커들:", markers); // 현재 마커들을 콘솔에 출력

  for (var i = 0; i < markers.length; i++) {
    if (markers[i]) { // 마커가 존재하는지 확인
      markers[i].setMap(null); // 마커를 지도에서 제거
    }
  }
  markers = []; // 마커 배열 초기화
}


// 현재 열린 인포윈도우 닫기
function closeInfowindow() {
  if (currentInfowindow) {
    // 현재 열린 인포윈도우가 있는 경우
    currentInfowindow.close(); // 인포윈도우 닫기
  }
  currentInfowindow = null; // 현재 열린 인포윈도우 초기화
}
