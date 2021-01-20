$(document).ready(function (){
    const cap = (string) =>{
        let sArr = string.split(" ");if(sArr.length > 1) {
            return sArr[0].charAt(0).toUpperCase() + sArr[0].substring(1) + " " + sArr[1].charAt(0).toUpperCase() + sArr[1].substring(1);}return sArr[0].charAt(0).toUpperCase() + sArr[0].substring(1);
    }
    const windDir = (d) =>{
        d += 22.5;if (d < 0) d = 360 - Math.abs(d) % 360; else d = d % 360;
        let w = parseInt(d / 45);return `${directions[w]}`;
    }
    const clockTime = (unix) =>{
        let date = new Date(unix * 1000);
        let hours = date.getHours();
        let minutes = "0" + date.getMinutes();
        let seconds = "0" + date.getSeconds();
        if(twelveHR && hours > 12) {
            hours = date.getHours() - 12;
            return `${hours} : ${minutes.substr(-2)} : ${seconds.substr(-2)} p.m.`;
        } else {
            hours = date.getHours();
            return `${hours} : ${minutes.substr(-2)} : ${seconds.substr(-2)}`;
        }
    }
    const weatherTime = (unix) =>{
        let date = new Date(unix * 1000);
        let hours = date.getHours();
        if(twelveHR && hours > 12){
            hours = date.getHours() - 12;
            hours += " pm";
        }else if(hours === 0 && !twelveHR){
            hours = "24 : 00";
        } else if(hours === 0 && twelveHR){
            hours = "12 : 00";
        } else {
            hours += " : 00";
        }
        return `${hours}`
    }
    const weekDay = (unix) =>{
        let d = new Date(unix * 1000);
        let day = d.getDay();return `${days[day]}`;
    }
    const timeConverter = (unix) =>{
        let d = new Date(unix * 1000);
        let year = d.getFullYear();
        let month = d.getMonth();
        let m = months[month];
        let day = d.getDate();
        return `${day} ${m} ${year}`;
    }
    const meterToMile = (meter) => {
        return meter * .000621371;
    }
    const geocode = (search, token) => {
        const baseUrl = 'https://api.mapbox.com';const endPoint = '/geocoding/v5/mapbox.places/';return fetch(baseUrl + endPoint + encodeURIComponent(search) + '.json' + "?" + 'access_token=' + token).then(function(res) {return res.json();}).then(function(data) {return data.features[0].center;});}
    const reverseGeocode = (coordinates, token) => {
        const baseUrl = 'https://api.mapbox.com';const endPoint = '/geocoding/v5/mapbox.places/';return fetch(baseUrl + endPoint + coordinates.lng + "," + coordinates.lat + '.json' + "?" + 'access_token=' + token).then(function(res) {return res.json();}).then(function(data) {return data.features[1].place_name;});}

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const baseOffset = 21600;
    let count = 0;
    let cache = {};
    const doc = $("body");

    const moon = "<i class=\"fas fa-moon\"></i>";
    const sun = "<i class=\"fas fa-sun\"></i>";
    const header = $("#header");
    const card = document.getElementsByClassName("weatherCard");

    const lightModeMap = "mapbox://styles/mapbox/streets-v11";
    const darkModeMap = "mapbox://styles/mapbox/dark-v10";

    const input = $("#search");

    let latLon = [-98.43, 29.42];
    let weatherArea = document.getElementById("weatherArea");
    let body = document.querySelector("body");

    let twelveHR = false;
    let hourCycle = 0;
    $("#hourChange").on("click", () => {
        hourCycle++;
        if(hourCycle % 2 === 1) {
            $("#hourChange").text("24HR");
            twelveHR = true;
        } else {
            $("#hourChange").text("12HR");
            twelveHR = false;
        }
        $("#time").text(clockTime(cache.current.dt + cache.timezone_offset + baseOffset));
        $("#fullOnly3Hour").html(everyThreeHours(cache.hourly));
    });

    function getWeather(lng, lat){
        fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&exclude=minutely&units=imperial&appid=${openWeatherApi}`).then( r => {
            r.json().then(data => {
                $("#weatherArea").html(fullForecast(data.daily, data));
                $("#fullOnly3Hour").html(everyThreeHours(data.hourly));
                displayOtherInfo(data, lng, lat);
                cache = data;
                console.log(data);
            });
        });
    }

    function everyThreeHours(arr){
        let html = "";
        let count = 0;
        for(let i = 0; i < arr.length; i++){
                html += threeHourTempRender(arr[i]);
                i+=2;
                count++;
            if(count > 4){
                break;
            }
        }
        return html;
    }

    function threeHourTempRender(obj){
        return `<div id="threeHour">
                    <p class="three dark smallWeather" id="threeHourTime">${weatherTime(obj.dt).substring(0, 7)}  </p>
                    <p class="three" id="threeHourTemp">${obj.temp} ˚</p>
                </div>`
    }

    function displayOtherInfo(data, lng, lat){
        $("#currWeatherArea").html(currentWeatherOnly(data.current, data));
        getLocation({lng:lng, lat:lat});
        getImage(data.current.weather[0].main);
        $("#time").text(clockTime(data.current.dt + data.timezone_offset + baseOffset));
        $("#todayDate").html(todaysDate(data.current, data));
    }

    function todaysDate (currObj, obj){
        return `<div id="dateInfo">
                    <p class="weekday large">${weekDay(currObj.dt)}</p>
                    <p class="head large">${timeConverter(currObj.dt + obj.timezone_offset)}</p>
                </div>`;
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
        color: "#4fb286"
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

    function currentWeatherOnly(currObj){
        return `<div class="weatherCardCopy" id="singleCurrCard">
                    <div id="weatherData">
                        <div id="mainInfo">
                            <img src="http://openweathermap.org/img/wn/${currObj.weather[0].icon}.png" alt="icon" id="singleIcon">
                            <p class="largeTemp">${currObj.feels_like} ˚</p>
                        </div>
                        <div id="extraInfo">
                            <div id="extraOne" class="extra">
                                <p class="content">Weather : ${cap(currObj.weather[0].description)}</p>
                                <p class="content">Sunrise : ${clockTime(currObj.sunrise)}</p>
                                <p class="content">Sunset : ${clockTime(currObj.sunset)}</p>
                                <p class="content">Dew Point : ${currObj.dew_point}</p>
                                <p class="content">Wind speed : ${currObj.wind_speed} mph</p>
                            </div>
                            <div id="extraTwo" class="extra">
                                <p class="content">Wind direction : ${windDir(currObj.wind_deg)}</p>
                                <p class="content">High : ${currObj.temp}˚</p>
                                <p class="content">Humidity : ${currObj.humidity} %</p>
                                <p class="content">Pressure : ${currObj.pressure} hPa</p>
                                <p class="content">Visibility : ${meterToMile(currObj.visibility).toFixed(1)} mi</p>
                                <p class="content">UVI : ${currObj.uvi}</p>
                            </div>
                        </div>
                    </div>
                </div>`;
    }

    function render(data, parentDataSet){
        return `<div class="weatherCard flip-card" id="card">
                    <div class="flip-card-inner">
                        <div class="flip-card-front">
                            <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="icon">
                            <p class="frontData weekday">${weekDay(data.dt)}</p>
                            <p class="frontData head">${timeConverter(data.dt + parentDataSet.timezone_offset)}</p>
                            <p class="frontData">${data.temp.max}˚ / ${data.temp.min}˚</p>
                        </div>
                        <div class="flip-card-back">
                            <p class="content">${cap(data.weather[0].description)}</p>
                            <p class="content">Feels like : ${data.temp.day} ˚</p>
                            <p class="content">Wind : ${data.wind_speed} mph ${windDir(data.wind_deg)}</p>
                            <p class="content">UVI : ${data.uvi}</p>
                            <p class="content">Dew Point : ${data.dew_point}</p>
                            <p class="content">Humidity : ${data.humidity}</p>
                            <p class="content">Pressure : ${data.pressure} hPa</p>
                        </div>
                    </div>
                </div>`;
    }

    function fullForecast(arr, obj){
        let html = "";
        for(let i = 1; i < arr.length; i++){
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
        header.removeClass("dark");
        header.addClass("light");
        for(let i = 0; i < card.length; i++){
            card[i].style.backgroundColor = "#898686"
            card[i].style.color = "#1a221f"
        }
        $(".smallWeather").removeClass("dark");
        $(".smallWeather").addClass("light");
    }
    function darkModeStyle(){
        header.removeClass("light");
        header.addClass("dark");
        for(let i = 0; i < card.length; i++){
            card[i].style.backgroundColor = "#1e0f0f"
            card[i].style.color = "#4fb286"
        }
        $(".smallWeather").addClass("dark");
        $(".smallWeather").removeClass("light");
    }

    function callSearch(input){
        geocode(input, mapboxToken).then(r => {
            latLon = r;
            marker.setLngLat(r);
            mapFly(latLon);
            getWeather(latLon[0], latLon[1]);
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

// NEED TO FINISH:
    /*
    *
    *  MAP DARK MODE MAYBE JUST DO CURRENT MAPBOXGL.MAP.STYLE CHANGE (?)
    *
    *  COULD MEMOIZE WITH A CACHE
    *
    *  HAVE THE HOURLY FORECAST START FROM THE CURRENT HOUR ON WARD ( GET DATE() AND COMPARE DT GET THAT INDEX AND RENDER FROM THERE ON )
    *
    *  IF CURRENT TIME AFTER CURRENT SUNSET THEN NIGHT MODE (?)
    *
    * */

    doc.on("mouseenter", ".weatherCard", function (){
        const currCard = $(this).children()[0];
        const classes = currCard.classList;
        classes.add("flip");
    });

    doc.on("mouseleave", ".weatherCard", function (){
        const currCard = $(this).children()[0];
        const classes = currCard.classList;
        classes.remove("flip");
    });

    function getLocation(obj){
        reverseGeocode(obj, mapboxToken).then(r => {
            $("#currentAddress").text(r);
        });
    }

    function getImage(condition){
        switch (condition){
            case "Clear":
                body.style.backgroundImage = "url('img/sun.jpg')";
                weatherArea.style.color = "#4fb286";
                break;
            case "Clouds":
            case "Mist":
                body.style.backgroundImage = "url('img/cloudy.jpg')";
                weatherArea.style.color = "white";
                $("#singleCurrCard").css("color", "black");
                break;
            case "Rain":
                body.style.backgroundImage = "url('img/rainy.jpg')";
                weatherArea.style.color = "white";
                break;
            case "Snow":
                body.style.backgroundImage = "url('img/snow.jpg')";
                weatherArea.style.color = "rgb(247 247 247)";
                break;
        }
    }
});