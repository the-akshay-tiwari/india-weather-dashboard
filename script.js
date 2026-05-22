let weatherData = {};
let weatherCodeData = {};

async function loadData() {
  const response = await fetch("./indiaDistricts.json");
  const codeRes = await fetch("./weatherCode.json");

  weatherData = await response.json();
  weatherCodeData = await codeRes.json();
  // console.log(weatherCodeData);

  loadStates();
}

loadData();

// console.log(weatherData);

const stateSelect = document.querySelector(".state");

function loadStates() {
  Object.keys(weatherData).forEach((state) => {
    const option = document.createElement("option");

    option.value = state;
    option.textContent = state;

    stateSelect.appendChild(option);
  });
}

const districtSelect = document.querySelector(".district");

stateSelect.addEventListener("change", () => {
  const selectedState = stateSelect.value;

  const districts = weatherData[selectedState];

  districtSelect.innerHTML = "";

  districts.forEach((district) => {
    const option = document.createElement("option");

    option.value = district.district;

    option.textContent = district.district;

    districtSelect.appendChild(option);
  });
});

districtSelect.addEventListener("change", () => {
  // console.log("district selected");
  // let selectedState=stateSelect.value;
  // let selectedDistrict=districtSelect.value;
  // console.log(weatherData[selectedState]);
  let selectedDistrict = weatherData[stateSelect.value].find((ele) => {
    return ele.district == districtSelect.value;
  });

  // console.log(selectedDistrict);

  let currDistLong = selectedDistrict.lon;
  let currDistLat = selectedDistrict.lat;

  // console.log(currDistLat+" "+currDistLong);

  fetchWeather(currDistLat, currDistLong);
  fetchHourlyWeather(currDistLat, currDistLong);
});

const temp = document.querySelector(".temp");
const humidity = document.querySelector(".humidity");
// humidity.innerText="humid"
// console.log(humidity);

const wind_speed = document.querySelector(".wind_speed");
const weather_text = document.querySelector(".weather_text");
const weatherIcon = document.querySelector(".weatherIcon");

async function fetchWeather(lat, long) {
  let urlCurrent = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`;

  let response = await fetch(urlCurrent);
  let data = await response.json();
  // console.log(data);

  // console.log(data.current.temperature_2m+data.current_units.temperature_2m);
  temp.innerText =
    data.current.temperature_2m + data.current_units.temperature_2m;
  // console.log(data.current.wind_speed_10m+data.current_units.wind_speed_10m);
  wind_speed.innerText =
    data.current.wind_speed_10m + data.current_units.wind_speed_10m;
  // console.log(data.current.relative_humidity_2m+data.current_units.relative_humidity_2m);
  humidity.innerText =
    data.current.relative_humidity_2m + data.current_units.relative_humidity_2m;
  // console.log(weatherCodeData[data.current.weather_code].text);
  weather_text.innerText = weatherCodeData[data.current.weather_code].text;
  weatherIcon.innerText = weatherCodeData[data.current.weather_code].icon;
}

const forecast = document.querySelector(".forecast");

async function fetchHourlyWeather(lat, long) {
  let urlHourly = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`;

  let response = await fetch(urlHourly);
  let data = await response.json();
  console.log(data);

  let forecastTimeArr = data.hourly;
  console.log(forecastTimeArr.temperature_2m);

  forecast.innerHTML = "";

  for (let i = 0; i <= 12; i++) {
    let card = document.createElement("div");
    card.setAttribute("class","item");
    card.innerHTML = `<div class="time">${forecastTimeArr.time[i].split("T")[1]}</div>
                     <div class="icon">${weatherCodeData[forecastTimeArr.weather_code[i]].icon}</div>
                     <div class="t">${forecastTimeArr.temperature_2m[i]}°C</div>`;

    forecast.appendChild(card);
  }

  // forecast.innerHTML+=`<div class="item">
  //                   <div class="time">1PM</div>
  //                   <div class="icon">☀️</div>
  //                   <div class="t">29°</div>
  //                 </div>`;
}

// let stateOpt=document.querySelector(".state");
// console.log(stateOpt);
