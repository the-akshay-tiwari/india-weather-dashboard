let weatherData = {};
let weatherCodeData = {};

const loaderContainer = document.querySelector(".loader-container");

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

districtSelect.addEventListener("change", async () => {
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

  loaderContainer.style.display = "flex";

  try {
    await fetchWeather(currDistLat, currDistLong);
    await fetchHourlyWeather(currDistLat, currDistLong);
    await fetchWeeklyWeather(currDistLat, currDistLong);
    loc.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${selectedDistrict.district}`;
  } catch (err) {
    alert(err.message);
  } finally {
    // console.log(selectedDistrict);
    loaderContainer.style.display = "none";
  }
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
  let data;
  try {
    let response = await fetch(urlCurrent);
    data = await response.json();
    // console.log(data);
  } catch (err) {
    alert(err.message);
  }

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

  let code = data.current.weather_code;

  if (code == 0) {
    document.body.setAttribute("class", "sunny-bg");
  } else if (code >= 1 && code <= 3) {
    document.body.setAttribute("class", "cloudy-bg");
  } else if (code == 45 || code == 48) {
    document.body.setAttribute("class", "fog-bg");
  } else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    document.body.setAttribute("class", "rain-bg");
  } else if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    document.body.setAttribute("class", "winter-bg");
  } else if (code >= 95) {
    document.body.setAttribute("class", "thunder-bg");
  }
}

const forecast = document.querySelector(".forecast");

async function fetchHourlyWeather(lat, long) {
  let urlHourly = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`;
  let data;

  try {
    let response = await fetch(urlHourly);
    data = await response.json();
    // console.log(data);
  } catch (err) {
    alert(err.message);
  }

  let forecastTimeArr = data.hourly;
  // console.log(forecastTimeArr.temperature_2m);

  forecast.innerHTML = "";

  for (let i = 0; i <= 12; i++) {
    let card = document.createElement("div");
    card.setAttribute("class", "item");
    card.innerHTML = `<div class="time">${forecastTimeArr.time[i].split("T")[1]}</div>
                     <div class="icon">${weatherCodeData[forecastTimeArr.weather_code[i]].icon}</div>
                     <div class="t">${forecastTimeArr.temperature_2m[i]}°C</div>`;

    forecast.appendChild(card);
  }
}

const weeklyContainer = document.querySelector(".weekly-container");
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const days2 = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const month = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "June",
  "July",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
];
const rise_set_time = document.querySelector(".rise-set-time");
const loc = document.querySelector(".loc");

async function fetchWeeklyWeather(lat, long) {
  let urlWeekly = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`;
  let data;

  try {
    let response = await fetch(urlWeekly);
    data = await response.json();
    // console.log(data.daily);
  } catch (err) {
    alert(err.message);
  }

  rise_set_time.innerHTML = `Sunrise ${new Date(
    data.daily.sunrise[0],
  ).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })} <hr> Sunset ${new Date(data.daily.sunset[0]).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;

  weeklyContainer.innerHTML = "";

  for (let i = 0; i < 7; i++) {
    let dailyCard = document.createElement("div");
    dailyCard.innerHTML = "";
    dailyCard.setAttribute("class", "daily-card");
    dailyCard.innerHTML = `<p class="day">${days[new Date(data.daily.time[i].split("T")[0]).getDay()]}</p>

  <div class="daily-icon">${weatherCodeData[data.daily.weather_code[i]].icon}</div>

  <div class="daily-temp"><span>${data.daily.temperature_2m_max[i]}°</span> / <span>${data.daily.temperature_2m_min[i]}°</span></div>`;

    weeklyContainer.appendChild(dailyCard);
  }

  let date_day = document.querySelector(".date-day");
  let date = new Date(data.daily.time[0].split("T")[0]);
  date_day.innerText = `${days2[date.getDay()]}, ${date.getDate()} ${month[date.getMonth()]}, ${date.getFullYear()}`;
  // console.log(date.getDate());
}

const locationBtn = document.querySelector(".location");
locationBtn.addEventListener("click", async () => {
  await navigator.geolocation.getCurrentPosition(
    (pos) => {
      let lat = pos.coords.latitude;
      let long = pos.coords.longitude;

      currLocationWeather(lat, long);
      locationUpdate(lat, long);
    },
    (err) => {
      // console.log(err);
      alert(err.message);
    },
  );
});

async function locationUpdate(lat, long) {
  let url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${long}`;
  try {
    let res = await fetch(url);
    let data = await res.json();
    // console.log(data.address);
    loc.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${data.address.city_district},${data.address.state}`;
  } catch (err) {
    alert(err.message);
  }
  
}

async function currLocationWeather(lat, long) {
  loaderContainer.style.display = "flex";

  try {
    await fetchWeather(lat, long);
    await fetchHourlyWeather(lat, long);
    await fetchWeeklyWeather(lat, long);
  } catch (err) {
    alert(err.message);
  } finally {
    loaderContainer.style.display = "none";
  }
}
