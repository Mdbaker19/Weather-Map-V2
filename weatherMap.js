$(document).ready(function (){

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    let count = 0;

    const moon = "<i class=\"fas fa-moon\"></i>";

    const lightModeMap = "mapbox://styles/mapbox/streets-v11";
    const darkModeMap = "mapbox://styles/mapbox/dark-v10";

    let latLon = [-98.43, 29.42];
    let weatherArea = document.getElementById("weatherArea");
    let body = document.querySelector("body");

    function getWeather(lng, lat){
        fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&exclude=hourly,minutely&units=imperial&appid=${openWeatherApi}`).then( r => {
            r.json().then(data => {
                $("#weatherArea").html(fullForecast(data.daily, data));
                getImage(data.daily[0].weather[0].main);
                console.log(data);
            });
        });
    }

    getWeather(latLon[0], latLon[1]);

    mapboxgl.accessToken = mapboxToken;
    let map = new mapboxgl.Map({
        container: 'map',
        style: darkModeMap,
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
        latLon = [position.lng, position.lat];
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




    function render(data, parentDataSet){
        return `<div class="weatherCard">
                    <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="icon">
                    <p class="weekday">${weekDay(data.dt)}</p>
                    <p class="head">${timeConverter(data.dt + parentDataSet.timezone_offset)}</p>
                    <p class="content">Feels like : ${data.temp.day}</p>
                    <p class="content">Weather : ${cap(data.weather[0].description)}</p>
                    <p class="content">Wind speed : ${data.wind_speed}</p>
                    <p class="content">Wind direction : ${windDir(data.wind_deg)}</p>
                    <p class="content">High : ${data.temp.max}</p>
                    <p class="content">Min : ${data.temp.min}</p>
                    <p class="content">Humidity : ${data.humidity}</p>
                </div>`;
    }

    function fullForecast(arr, obj){
        let html = "";
        for(let i = 0; i < arr.length; i++){
            html += render(arr[i], obj);
        }
        return html;
    }


    $("#darkLight").on("click", () => {
        count++;
        if(count % 2 === 1) {
            lightModeStyle();
            map = new mapboxgl.Map({
                container: 'map',
                style: lightModeMap,
                center: latLon,
                zoom: 9
            });
        } else {
            darkModeStyle();
            map = new mapboxgl.Map({
                container: 'map',
                style: darkModeMap,
                center: latLon,
                zoom: 9
            });
        }
        marker = new mapboxgl.Marker(initialMarker)
            .setLngLat(latLon)
            .addTo(map)
        marker.on("dragend", updateMarker);
    });


    function lightModeStyle(){

    }
    function darkModeStyle(){

    }




















    function getImage(condition){
        switch (condition){
            case "Clear":
                body.style.backgroundImage = "url('img/sun.jpg')";
                body.style.backgroundColor = "#48aff2";
                weatherArea.style.color = "white";
                break;
            case "Clouds":
                body.style.backgroundImage = "url('img/cloudy.jpg')";
                body.style.backgroundColor = "rgb(111 121 130)";
                weatherArea.style.color = "white";
                break;
            case "Rain":
                body.style.backgroundImage = "url('img/rainy.jpg')";
                body.style.backgroundColor = "rgb(63 90 142)";
                weatherArea.style.color = "white";
                break;
            case "Snow":
                body.style.backgroundImage = "url('img/snow.jpg')";
                body.style.backgroundColor = "rgb(242 243 246)";
                weatherArea.style.color = "white";
                break;
        }
    }

    const cap = (string) =>{let sArr = string.split(" ");if(sArr.length > 1) {return sArr[0].charAt(0).toUpperCase() + sArr[0].substring(1) + " " + sArr[1].charAt(0).toUpperCase() + sArr[1].substring(1);}return sArr[0].charAt(0).toUpperCase() + sArr[0].substring(1);}
    const windDir = (d) =>{d += 22.5;if (d < 0) d = 360 - Math.abs(d) % 360; else d = d % 360;let w = parseInt(d / 45);return `${directions[w]}`;}
    const clockTime = (unix) =>{let date = new Date(unix * 1000);let hours = date.getHours();let minutes = "0" + date.getMinutes();let seconds = "0" + date.getSeconds();return `${hours}:${minutes.substr(-2)}:${seconds.substr(-2)}`;}
    const weekDay = (unix) =>{let d = new Date(unix * 1000);let day = d.getDay();return `${days[day]}`;}
    const timeConverter = (unix) =>{let d = new Date(unix * 1000);let year = d.getFullYear();let month = d.getMonth();let m = months[month];let day = d.getDate();return `${day} ${m} ${year}`;}
});