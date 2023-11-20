navigator.geolocation.getCurrentPosition(successGps, failGps); // kakao geolocation 사용 고려 필요

function successGps(position) {
  const lat = position.coords.latitude; // 경도
  const lng = position.coords.longitude; // 위도
  const accuracy = Math.floor(position.coords.accuracy); // 정확성 필요성 검증 필요

  const container = document.getElementById("map");
  let options = {
    center: new kakao.maps.LatLng(lat, lng),
    level: 3,
  };
  let map = new kakao.maps.Map(container, options);
}

function failGps() {
  console.log("Geolocation Failed");
}
