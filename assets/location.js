var map;
document.addEventListener('DOMContentLoaded', function() {
    navigator.geolocation.getCurrentPosition(successGps, failGps);
});

function successGps(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const container = document.getElementById("map");
    let options = {
        center: new kakao.maps.LatLng(lat, lng),
        level: 3,
    };

    map = new kakao.maps.Map(container, options);

    document.querySelectorAll('.nav-link').forEach(item => {
        item.addEventListener('click', handleItemClick);
    });
}

function failGps() {
    console.log("Geolocation Failed");
    // 위치 정보를 가져오지 못했을 때 지도의 초기 위치를 정할 필요가 있음
}

function handleItemClick(event) {
    event.preventDefault();
    var keyword = event.target.innerText;
    searchPlaces(keyword);
}

function searchPlaces(keyword) {
    var places = new kakao.maps.services.Places();
    places.keywordSearch(keyword, function(data, status, pagination) {
        if (status === kakao.maps.services.Status.OK) {
            displayMarkers(data);
        } else {
            console.error('Search failed or no results found:', status);
        }
    });
}

function displayMarkers(places) {
    for (var i = 0; i < Math.min(5, places.length); i++) {
        var place = places[i];
        var marker = new kakao.maps.Marker({
            map: map,
            position: new kakao.maps.LatLng(place.y, place.x)
        });
    }
}
