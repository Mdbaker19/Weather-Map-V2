$(document).ready(function (){

    let latLon = [-98.43, 29.42];
    let weatherArea = document.getElementById("weatherArea");

    function getWeather(lng, lat){
        fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&exclude=hourly,minutely&units=imperial&appid=${openWeatherApi}`).then( r => {
            r.json().then(data => {
                $("#weatherArea").html(fullForecast(data.daily));
                getImage(data.daily[0].weather[0].main);
                console.log(data.daily);
            });
        });
    }

    getWeather(latLon[0], latLon[1]);


    mapboxgl.accessToken = mapboxToken;
    const map = new mapboxgl.Map({
        container: 'map',
        style: "mapbox://styles/mapbox/dark-v10",
        center: [-98.43, 29.42],
        zoom: 9
    });



    let initialMarker = {
        draggable: true,
        color: "#FF8552"
    }

    let marker = new mapboxgl.Marker(initialMarker)
        .setLngLat(latLon)
        .addTo(map)

    marker.on("dragend", updateMarker);

    function updateMarker(){
        const coord = marker.getLngLat();
        const position = {
            lat: coord.lat,
            lng: coord.lng
        };
        getWeather(position.lng, position.lat);
    }

    let geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        minLength: 1,
        marker: false
    });

    geocoder.on("result", function(e){
        latLon[0] = e.result.center[0];
        latLon[1] = e.result.center[1];
        marker.setLngLat(latLon);
        getWeather(latLon[0], latLon[1]);
    });

    map.addControl(geocoder);




    function render(data){
        return `<div class="weatherCard">
                    <p class="content">Feels like : ${data.temp.day}</p>
                    <p class="content">Weather : ${cap(data.weather[0].description)}</p>
                    <p class="content">Wind speed : ${data.wind_speed}</p>
                    <p class="content">High : ${data.temp.max}</p>
                    <p class="content">Min : ${data.temp.min}</p>
                    <p class="content">Humidity : ${data.humidity}</p>
                </div>`;
    }

    function fullForecast(arr){
        let html = "";
        for(let i = 0; i < arr.length; i++){
            html += render(arr[i]);
        }
        return html;
    }

    function getImage(condition){
        switch (condition){
            case "Clear":
                weatherArea.style.backgroundImage = "url('img/sun.jpg')";
                weatherArea.style.color = "white";
                break;
            case "Clouds":
                weatherArea.style.backgroundImage = "url('img/cloudy.jpg')";
                weatherArea.style.color = "white";
                break;
            case "Rain":
                weatherArea.style.backgroundImage = "url('img/rainy.jpg')";
                weatherArea.style.color = "white";
                break;
            case "Snow":
                weatherArea.style.backgroundImage = "url('img/snow.jpg')";
                weatherArea.style.color = "white";
                break;
        }
    }

    function cap(string){
        let sArr = string.split(" ");
        if(sArr.length > 1) {
            return sArr[0].charAt(0).toUpperCase() + sArr[0].substring(1) + " " + sArr[1].charAt(0).toUpperCase() + sArr[1].substring(1);
        }
        return sArr[0].charAt(0).toUpperCase() + sArr[0].substring(1);
    }

});