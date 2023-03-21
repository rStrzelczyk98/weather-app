"use strict";
const btn = document.querySelector(".btn");
const input = document.getElementById("text");
input.addEventListener("input", removeError);
btn.addEventListener("click", getWeatherData);

async function getWeatherData() {
  if (input.value.trim() === "") return;
  try {
    const data = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=63220a3a232a4ad9a9883309232003 &q=${input.value
        .toLowerCase()
        .trim()}&days=6&aqi=yes`
    );
    const dataJSON = await data.json();
    if (dataJSON.hasOwnProperty("error")) {
      throw new Error(dataJSON.error.message);
    }
    const weather = handleData(dataJSON);
    displayData(weather);
  } catch (error) {
    dispalyError(error.message);
  } finally {
    input.value = "";
  }
}

function handleData(data) {
  const daysArray = [];
  const { location, current, forecast } = data;
  const today = {
    location: location,
    icon: current.condition.icon,
    air: current.air_quality.pm2_5,
    temp: current.temp_c,
    humidity: current.humidity,
    uv: current.uv,
    wind: current.wind_kph,
    wind_d: current.wind_dir,
    pressure: current.pressure_mb,
    date: current.last_updated,
  };
  forecast.forecastday.forEach((el) => {
    const day = {
      icon: el.day.condition.icon,
      date: el.date_epoch,
      maxTemp: el.day.maxtemp_c,
      minTemp: el.day.mintemp_c,
      humidity: el.day.avghumidity,
    };
    daysArray.push(day);
  });
  return { today: today, forecast: daysArray };
}

function displayData(data) {
  const output = document.querySelector(".content");
  const { today, forecast } = data;
  let str = `<figure class="card">
        <h2>${new Intl.DateTimeFormat("pl-PL", {
          month: "numeric",
          day: "numeric",
        }).format(today.last_updated_epoch)}</h2>
        <header class="card-header">
          <h3>${today.location.name}<span>/${today.location.country}</span></h3>
          <img class="img" src="${today.icon}" alt="" />
        </header>
        <p>Temperature: <span class="data">${today.temp}&deg;C</span></p>
        <p>Index UV: <span class="data">${today.uv}</span></p>
        <p>Humidity: <span class="data">${today.humidity}%</span></p>
        <p>Wind(${today.wind_d}): <span class="data">${
    today.wind
  }km/h</span></p>
        <p>Pressure: <span class="data">${today.pressure}hPa</span></p>
        <p>AQI: <span class="data ${airQuality(today.air).class}">${
    airQuality(today.air).data
  }</span></p>
      </figure>`;

  forecast.forEach(function (el, i) {
    if (i === 0) return;
    const str2 = `<figure class="forecast">
        <h2>${new Intl.DateTimeFormat("default", {
          month: "numeric",
          day: "numeric",
        }).format(new Date(el.date * 1000))}</h2>
        <img src="${el.icon}" alt="">
        <p>${el.maxTemp}\u00B0C / ${el.minTemp}\u00B0C</p>
        <p>${el.humidity}%</p>
        </figure>`;
    str += str2;
  });
  str = `<div class="set">${str}</div>`;
  output.insertAdjacentHTML("afterbegin", str);
}

function airQuality(value) {
  if (value < 12) return { data: "Good", class: "good" };
  if (value >= 12 && value < 55) return { data: "Moderate", class: "moderate" };
  if (value >= 55 && value < 150)
    return { data: "Unhealthy", class: "unhealthy" };
  if (value >= 155 && value < 250)
    return { data: "Very unhealthy", class: "very-unhealthy" };
  if (value >= 250) return { data: "Hazardous", class: "hazardous" };
  return "No data";
}

function dispalyError(msg) {
  const error = document.getElementById("error");
  error.textContent = msg;
}

function removeError() {
  const error = document.getElementById("error");
  error.textContent = "";
}
