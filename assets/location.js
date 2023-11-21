// 전역 변수 선언
var map; // 지도 객체
var currentLat, currentLng; // 현재 위치의 위도와 경도
var markers = []; // 마커를 저장할 배열
var currentInfowindow = null; // 현재 열린 인포윈도우

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

  addEventListenersToItems(); // 네비게이션 메뉴 아이템에 이벤트 리스너 추가
}

// GPS 정보 가져오기 실패 시 호출되는 함수
function failGps() {
  console.log("Geolocation Failed");
}

// 네비게이션 메뉴 아이템에 이벤트 리스너 추가
function addEventListenersToItems() {
  const items = document.querySelectorAll('.nav-link'); // 네비게이션 메뉴 아이템들을 선택
  items.forEach(item => {
    item.addEventListener('click', function(event) {
      event.preventDefault(); // 기본 동작 방지
      removeMarkers(); // 모든 마커 제거
      closeInfowindow(); // 인포 윈도우 닫기
      searchAndDisplay(item.textContent.trim()); // 키워드로 장소 검색 및 마커 표시
    });
  });
}

// 키워드 설정
function mapKeyword(originalKeyword) {
  const keywordMap = {
    '카페': '카페',
    '병원': '병원',
    '세탁방': '세탁'
  };
  return keywordMap[originalKeyword] || originalKeyword;// 매핑된 키워드가 없는 경우 원래 키워드 사용
}

// 현재 위치 재설정
function resetCurrentLocation() {
  navigator.geolocation.getCurrentPosition(function(position) {
    currentLat = position.coords.latitude;
    currentLng = position.coords.longitude;
    map.setCenter(new kakao.maps.LatLng(currentLat, currentLng));
  }, function() {
    console.log("현재 위치 재설정 실패");
  });
}


// 키워드로 장소 검색 및 마커 표시
function searchAndDisplay(keyword) {
  var mappedKeyword = mapKeyword(keyword); // 매핑된 키워드 사용
  var ps = new kakao.maps.services.Places(); // 장소 검색 서비스 객체 생성
  var placesOption = {
    location: new kakao.maps.LatLng(currentLat, currentLng) // 검색 위치 설정
  };
  ps.keywordSearch(mappedKeyword, function(data, status, pagination) {
    if (status === kakao.maps.services.Status.OK) { // 검색 결과가 정상적으로 반환된 경우
      var bounds = new kakao.maps.LatLngBounds(); // 검색된 장소들을 포함하는 범위 객체 생성
      for (var i = 0; i < data.length && i < 5; i++) { // 최대 5개의 장소만 표시
        displayMarker(data[i], bounds); // 장소 정보를 받아와 마커를 표시
      }
      map.setBounds(bounds); // 지도의 확대/축소 수준을 장소들이 표시되는 범위에 맞게 조정
    } else {
      console.log("검색 결과가 없습니다");
    }
  }, placesOption);
}

// 장소 정보를 받아와 마커를 표시
function displayMarker(place, bounds) {
  var marker = new kakao.maps.Marker({
    map: map, // 마커를 표시할 지도 객체
    position: new kakao.maps.LatLng(place.y, place.x) // 마커의 위치 설정
  });

  markers.push(marker); // 마커를 배열에 저장

  var infowindow = new kakao.maps.InfoWindow({zIndex:1}); // 인포윈도우 객체 생성
  kakao.maps.event.addListener(marker, 'click', function() {
    if (currentInfowindow === infowindow) { // 이미 열린 인포윈도우를 클릭한 경우
      infowindow.close(); // 인포윈도우 닫기
      currentInfowindow = null;
    } else {
      if (currentInfowindow) { // 다른 인포윈도우가 열려있는 경우
        currentInfowindow.close(); // 현재 열린 인포윈도우 닫기
      }
      infowindow.setContent('<div style="padding:5px;font-size:12px;">' + place.place_name + '</div>'); // 인포윈도우에 장소 이름 표시
      infowindow.open(map, marker); // 인포윈도우 열기
      currentInfowindow = infowindow; // 현재 열린 인포윈도우로 설정
    }
  });

  bounds.extend(new kakao.maps.LatLng(place.y, place.x)); // 검색된 장소들을 포함하는 범위 확장
}

// 모든 마커 제거
function removeMarkers() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null); // 마커를 지도에서 제거
  }
  markers = []; // 마커 배열 초기화
}

// 현재 열린 인포윈도우 닫기
function closeInfowindow() {
  if (currentInfowindow) { // 현재 열린 인포윈도우가 있는 경우
    currentInfowindow.close(); // 인포윈도우 닫기
  }
  currentInfowindow = null; // 현재 열린 인포윈도우 초기화  
}
