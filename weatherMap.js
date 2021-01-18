$(document).ready(function (){

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    let count = 0;

    const moon = "<i class=\"fas fa-moon\"></i>";
    const sun = "<i class=\"fas fa-sun\"></i>";
    const header = $("#header");
    const card = $(".weatherCard");

    const lightModeMap = "mapbox://styles/mapbox/streets-v11";
    const darkModeMap = "mapbox://styles/mapbox/dark-v10";

    const input = $("#search");

    let latLon = [-98.43, 29.42];
    let weatherArea = document.getElementById("weatherArea");
    let body = document.querySelector("body");

    function getWeather(lng, lat){
        fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&exclude=hourly,minutely&units=imperial&appid=${openWeatherApi}`).then( r => {
            r.json().then(data => {
                $("#weatherArea").html(fullForecast(data.daily, data));
                $("#time").text(clockTime(data.daily[0].dt));
                getLocation({lng:lng, lat:lat});
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
        zoom: 8
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
                    <p class="content">Feels like : ${data.temp.day} ˚</p>
                    <p class="content">Weather : ${cap(data.weather[0].description)}</p>
                    <p class="content">Wind speed : ${data.wind_speed} mph</p>
                    <p class="content">Wind direction : ${windDir(data.wind_deg)}</p>
                    <p class="content">High : ${data.temp.max}˚</p>
                    <p class="content">Min : ${data.temp.min}˚</p>
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
            $("#darkLight").html(moon);
            lightModeStyle();
            map = new mapboxgl.Map({
                container: 'map',
                style: lightModeMap,
                center: latLon,
                zoom: 8
            });
        } else {
            $("#darkLight").html(sun);
            darkModeStyle();
            map = new mapboxgl.Map({
                container: 'map',
                style: darkModeMap,
                center: latLon,
                zoom: 8
            });
        }
        marker = new mapboxgl.Marker(initialMarker)
            .setLngLat(latLon)
            .addTo(map)
        marker.on("dragend", updateMarker);
    });


    function lightModeStyle(){
        console.log("switch to light mode");
        header.css({
            "backgroundColor":"white"
        });
        card.css({
            "backgroundColor":"white"
        });
    }
    function darkModeStyle(){
        console.log("switch to dark mode");
        header.css({
            "backgroundColor": "#1e0f0f"
        });
        card.css({
            "backgroundColor":"#1e0f0f"
        });

    }


    $("#weatherDisplay").on("change", () => {
        let choice = $("#weatherDisplay").val();
        if(choice === "current"){

        } else if(choice === "daily"){

        } else if(choice === "hourly"){

        }
    });

    function callSearch(input){
        geocode(input, mapboxToken).then(r => {
            latLon = r;
            marker.setLngLat(r);
            mapFly(latLon);
            getWeather(r[0], r[1]);
        });
    }

    $("#searchSubmit").on("click", () => {
        if(input.val().length > 0) callSearch(input.val());
    });
    window.addEventListener("keydown", (e) => {
        if(e.key === "Enter" && input.val().length > 0) callSearch(input.val());
    });

    function mapFly(coords){
        map.flyTo({
           center: coords,
           zoom: 10,
           speed: 0.6,
           curve: 3
        });
    }











    function getLocation(obj){
        reverseGeocode(obj, mapboxToken).then(r => {
            $("#currentAddress").text(r);
        });
    }



    function getImage(condition){
        switch (condition){
            case "Clear":
                body.style.backgroundImage = "url('img/sun.jpg')";
                body.style.backgroundColor = "#48aff2";
                weatherArea.style.color = "#4fb286";
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
                weatherArea.style.color = "#342f2f";
                break;
        }
    }

    function geocode(search, token) {
        const baseUrl = 'https://api.mapbox.com';
        const endPoint = '/geocoding/v5/mapbox.places/';
        return fetch(baseUrl + endPoint + encodeURIComponent(search) + '.json' + "?" + 'access_token=' + token)
            .then(function(res) {
                return res.json();
            }).then(function(data) {
                return data.features[0].center;
            });
    }

    function reverseGeocode(coordinates, token) {
        const baseUrl = 'https://api.mapbox.com';
        const endPoint = '/geocoding/v5/mapbox.places/';
        return fetch(baseUrl + endPoint + coordinates.lng + "," + coordinates.lat + '.json' + "?" + 'access_token=' + token)
            .then(function(res) {
                return res.json();
            })
            .then(function(data) {
                return data.features[1].place_name;
            });
    }

    const cap = (string) =>{let sArr = string.split(" ");if(sArr.length > 1) {return sArr[0].charAt(0).toUpperCase() + sArr[0].substring(1) + " " + sArr[1].charAt(0).toUpperCase() + sArr[1].substring(1);}return sArr[0].charAt(0).toUpperCase() + sArr[0].substring(1);}
    const windDir = (d) =>{d += 22.5;if (d < 0) d = 360 - Math.abs(d) % 360; else d = d % 360;let w = parseInt(d / 45);return `${directions[w]}`;}
    const clockTime = (unix) =>{let date = new Date(unix * 1000);let hours = date.getHours();let minutes = "0" + date.getMinutes();let seconds = "0" + date.getSeconds();return `${hours}:${minutes.substr(-2)}:${seconds.substr(-2)}`;}
    const weekDay = (unix) =>{let d = new Date(unix * 1000);let day = d.getDay();return `${days[day]}`;}
    const timeConverter = (unix) =>{let d = new Date(unix * 1000);let year = d.getFullYear();let month = d.getMonth();let m = months[month];let day = d.getDate();return `${day} ${m} ${year}`;}
});