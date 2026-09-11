const searchForm = document.querySelector("#searchForm");
const cityInput = document.querySelector("#cityInput");
const statusMessage = document.querySelector("#statusMessage");
const locationBtn = document.querySelector("#locationBtn");
const unitToggle = document.querySelector("#unitToggle");
const recentCities = document.querySelector("#recentCities");
const weatherScene = document.querySelector("#weatherScene");
const sourcePill = document.querySelector("#sourcePill");

const cityName = document.querySelector("#cityName");
const localTime = document.querySelector("#localTime");
const tempValue = document.querySelector("#tempValue");
const conditionValue = document.querySelector("#conditionValue");
const feelsValue = document.querySelector("#feelsValue");
const rangeValue = document.querySelector("#rangeValue");

const windValue = document.querySelector("#windValue");
const windNote = document.querySelector("#windNote");
const humidityValue = document.querySelector("#humidityValue");
const humidityNote = document.querySelector("#humidityNote");
const rainValue = document.querySelector("#rainValue");
const rainNote = document.querySelector("#rainNote");
const pressureValue = document.querySelector("#pressureValue");
const pressureNote = document.querySelector("#pressureNote");

const tempChart = document.querySelector("#tempChart");
const hourlyList = document.querySelector("#hourlyList");
const comfortTitle = document.querySelector("#comfortTitle");
const comfortText = document.querySelector("#comfortText");
const tipList = document.querySelector("#tipList");
const forecastGrid = document.querySelector("#forecastGrid");

const appState = {
  unit: "c",
  weather: null,
  recent: JSON.parse(localStorage.getItem("recentWeatherCities") || "[]")
};

const weatherCodes = {
  0: ["Clear sky", "clear"],
  1: ["Mainly clear", "clear"],
  2: ["Partly cloudy", "cloudy"],
  3: ["Cloudy", "cloudy"],
  45: ["Fog", "foggy"],
  48: ["Rime fog", "foggy"],
  51: ["Light drizzle", "rainy"],
  53: ["Drizzle", "rainy"],
  55: ["Heavy drizzle", "rainy"],
  56: ["Freezing drizzle", "rainy"],
  57: ["Freezing drizzle", "rainy"],
  61: ["Light rain", "rainy"],
  63: ["Rain", "rainy"],
  65: ["Heavy rain", "rainy"],
  66: ["Freezing rain", "rainy"],
  67: ["Freezing rain", "rainy"],
  71: ["Light snow", "snowy"],
  73: ["Snow", "snowy"],
  75: ["Heavy snow", "snowy"],
  77: ["Snow grains", "snowy"],
  80: ["Rain showers", "rainy"],
  81: ["Rain showers", "rainy"],
  82: ["Heavy showers", "rainy"],
  85: ["Snow showers", "snowy"],
  86: ["Heavy snow showers", "snowy"],
  95: ["Thunderstorm", "stormy"],
  96: ["Thunderstorm hail", "stormy"],
  99: ["Thunderstorm hail", "stormy"]
};

const demoWeather = {
  source: "demo",
  place: {
    name: "Cleveland",
    admin1: "Ohio",
    country: "United States",
    timezone: "America/New_York"
  },
  current: {
    time: new Date().toISOString(),
    temperature_2m: 22,
    apparent_temperature: 23,
    relative_humidity_2m: 56,
    precipitation: 0,
    weather_code: 2,
    cloud_cover: 48,
    wind_speed_10m: 14,
    wind_direction_10m: 230,
    pressure_msl: 1015,
    is_day: 1
  },
  hourly: {
    time: Array.from({ length: 12 }, (_, index) => new Date(Date.now() + index * 3600000).toISOString()),
    temperature_2m: [22, 23, 24, 25, 26, 25, 24, 23, 22, 21, 20, 20],
    apparent_temperature: [23, 24, 25, 26, 27, 26, 25, 24, 22, 21, 20, 20],
    precipitation_probability: [8, 8, 10, 12, 18, 24, 20, 18, 15, 12, 10, 8],
    weather_code: [2, 2, 1, 1, 2, 3, 3, 2, 1, 1, 0, 0],
    wind_speed_10m: [12, 14, 16, 18, 18, 16, 15, 12, 10, 9, 8, 8],
    relative_humidity_2m: [56, 54, 52, 50, 49, 51, 54, 57, 62, 66, 68, 70]
  },
  daily: {
    time: Array.from({ length: 7 }, (_, index) => new Date(Date.now() + index * 86400000).toISOString().slice(0, 10)),
    weather_code: [2, 1, 61, 3, 0, 2, 1],
    temperature_2m_max: [26, 28, 23, 24, 27, 26, 25],
    temperature_2m_min: [17, 18, 16, 15, 17, 18, 17],
    precipitation_probability_max: [18, 12, 68, 28, 8, 20, 14],
    wind_speed_10m_max: [18, 16, 24, 19, 13, 17, 16],
    sunrise: [],
    sunset: []
  }
};

function getCondition(code) {
  return weatherCodes[code] || ["Changing weather", "cloudy"];
}

function formatTemp(value) {
  const number = appState.unit === "f" ? (value * 9) / 5 + 32 : value;
  return `${Math.round(number)}\u00b0${appState.unit.toUpperCase()}`;
}

function formatSpeed(kph) {
  if (appState.unit === "f") {
    return `${Math.round(kph * 0.621371)} mph`;
  }

  return `${Math.round(kph)} km/h`;
}

function formatPlace(place) {
  return [place.name, place.admin1, place.country].filter(Boolean).join(", ");
}

function formatHour(time) {
  return new Intl.DateTimeFormat([], { hour: "numeric", minute: "2-digit" }).format(new Date(time));
}

function formatDay(dateString) {
  return new Intl.DateTimeFormat([], { weekday: "short" }).format(new Date(`${dateString}T12:00:00`));
}

function setStatus(message) {
  statusMessage.textContent = message;
}

function setLoading(isLoading) {
  searchForm.classList.toggle("is-loading", isLoading);
  searchForm.querySelector("button").disabled = isLoading;
}

function updateRecent(city) {
  const next = [city, ...appState.recent.filter((item) => item.toLowerCase() !== city.toLowerCase())].slice(0, 5);
  appState.recent = next;
  localStorage.setItem("recentWeatherCities", JSON.stringify(next));
  renderRecent();
}

function renderRecent() {
  const cities = appState.recent.length ? appState.recent : ["Cleveland", "Delhi", "London"];
  recentCities.innerHTML = cities
    .map((city) => `<button class="chip" type="button" data-city="${city}">${city}</button>`)
    .join("");
}

async function searchCity(city) {
  const endpoint = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error("City search failed.");
  }

  const data = await response.json();

  if (!data.results || !data.results.length) {
    throw new Error("No matching city found.");
  }

  return data.results[0];
}

async function getWeather(place) {
  const params = new URLSearchParams({
    latitude: place.latitude,
    longitude: place.longitude,
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "is_day",
      "precipitation",
      "weather_code",
      "cloud_cover",
      "wind_speed_10m",
      "wind_direction_10m",
      "pressure_msl"
    ].join(","),
    hourly: [
      "temperature_2m",
      "apparent_temperature",
      "precipitation_probability",
      "weather_code",
      "wind_speed_10m",
      "relative_humidity_2m"
    ].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
      "wind_speed_10m_max",
      "sunrise",
      "sunset"
    ].join(","),
    timezone: "auto",
    forecast_days: "7"
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Weather lookup failed.");
  }

  const data = await response.json();

  return {
    source: "live",
    place: { ...place, timezone: data.timezone },
    current: data.current,
    hourly: data.hourly,
    daily: data.daily
  };
}

async function loadCity(city) {
  setLoading(true);
  setStatus(`Looking up ${city}...`);

  try {
    const place = await searchCity(city);
    const weather = await getWeather(place);
    appState.weather = weather;
    updateRecent(place.name);
    renderWeather(weather);
    setStatus(`Updated ${formatPlace(place)}.`);
  } catch (error) {
    appState.weather = demoWeather;
    renderWeather(demoWeather);
    setStatus(`${error.message} Showing polished demo weather instead.`);
  } finally {
    setLoading(false);
  }
}

function getHourlyWindow(weather) {
  const now = new Date(weather.current.time).getTime();
  const startIndex = Math.max(
    0,
    weather.hourly.time.findIndex((time) => new Date(time).getTime() >= now) - 1
  );

  return weather.hourly.time.slice(startIndex, startIndex + 12).map((time, offset) => {
    const index = startIndex + offset;
    return {
      time,
      temp: weather.hourly.temperature_2m[index],
      feels: weather.hourly.apparent_temperature[index],
      rain: weather.hourly.precipitation_probability[index],
      code: weather.hourly.weather_code[index],
      wind: weather.hourly.wind_speed_10m[index],
      humidity: weather.hourly.relative_humidity_2m[index]
    };
  });
}

function renderWeather(weather) {
  const [conditionLabel, mood] = getCondition(weather.current.weather_code);
  const dayClass = weather.current.is_day ? "" : " night";
  const todayHigh = weather.daily.temperature_2m_max[0];
  const todayLow = weather.daily.temperature_2m_min[0];
  const rainChance = weather.daily.precipitation_probability_max[0] ?? 0;

  sourcePill.textContent = weather.source === "live" ? "Live" : "Demo";
  sourcePill.classList.toggle("demo", weather.source !== "live");

  cityName.textContent = formatPlace(weather.place);
  localTime.textContent = `Local update ${formatHour(weather.current.time)}`;
  tempValue.textContent = formatTemp(weather.current.temperature_2m);
  conditionValue.textContent = conditionLabel;
  feelsValue.textContent = formatTemp(weather.current.apparent_temperature);
  rangeValue.textContent = `${formatTemp(todayHigh)} / ${formatTemp(todayLow)}`;

  weatherScene.className = `weather-stage ${mood}${dayClass}`;

  windValue.textContent = formatSpeed(weather.current.wind_speed_10m);
  windNote.textContent = getWindNote(weather.current.wind_speed_10m);
  humidityValue.textContent = `${Math.round(weather.current.relative_humidity_2m)}%`;
  humidityNote.textContent = getHumidityNote(weather.current.relative_humidity_2m);
  rainValue.textContent = `${Math.round(rainChance)}%`;
  rainNote.textContent = getRainNote(rainChance);
  pressureValue.textContent = `${Math.round(weather.current.pressure_msl)} hPa`;
  pressureNote.textContent = getPressureNote(weather.current.pressure_msl);

  renderChart(getHourlyWindow(weather));
  renderHourly(getHourlyWindow(weather));
  renderComfort(weather, conditionLabel, rainChance);
  renderForecast(weather);
}

function getWindNote(speed) {
  if (speed >= 35) return "Strong wind. Secure light items before heading out.";
  if (speed >= 20) return "Breezy enough to notice during a walk.";
  return "Light wind. Comfortable for most outdoor plans.";
}

function getHumidityNote(value) {
  if (value >= 75) return "Humid air. It may feel warmer than the number.";
  if (value <= 35) return "Dry air. Keep water nearby if you are outside long.";
  return "Balanced humidity for daily activity.";
}

function getRainNote(value) {
  if (value >= 60) return "Carry rain protection. Showers are likely.";
  if (value >= 30) return "Keep an eye on the sky. Rain is possible.";
  return "Low rain chance for now.";
}

function getPressureNote(value) {
  if (value >= 1022) return "Higher pressure often means calmer weather.";
  if (value <= 1000) return "Lower pressure can bring unsettled conditions.";
  return "Pressure is sitting in a typical range.";
}

function renderChart(hours) {
  const width = 640;
  const height = 240;
  const padding = 34;
  const temps = hours.map((hour) => (appState.unit === "f" ? (hour.temp * 9) / 5 + 32 : hour.temp));
  const min = Math.min(...temps) - 2;
  const max = Math.max(...temps) + 2;
  const xStep = (width - padding * 2) / Math.max(1, temps.length - 1);
  const scaleY = (value) => height - padding - ((value - min) / (max - min || 1)) * (height - padding * 2);
  const points = temps.map((temp, index) => `${padding + index * xStep},${scaleY(temp)}`).join(" ");

  const gridLines = [0.25, 0.5, 0.75]
    .map((ratio) => `<line class="chart-grid" x1="${padding}" x2="${width - padding}" y1="${height * ratio}" y2="${height * ratio}" />`)
    .join("");

  const dots = temps
    .map((temp, index) => `<circle class="chart-dot" cx="${padding + index * xStep}" cy="${scaleY(temp)}" r="5" />`)
    .join("");

  tempChart.innerHTML = `${gridLines}<polyline class="chart-line" points="${points}" />${dots}`;
}

function renderHourly(hours) {
  hourlyList.innerHTML = hours
    .slice(0, 6)
    .map(
      (hour) => `
        <div class="hour-chip">
          <span>${formatHour(hour.time)}</span>
          <strong>${formatTemp(hour.temp)}</strong>
        </div>
      `
    )
    .join("");
}

function renderComfort(weather, conditionLabel, rainChance) {
  const current = weather.current;
  const feels = current.apparent_temperature;
  let title = "Easygoing weather";
  let summary = `${conditionLabel} with a feels-like temperature of ${formatTemp(feels)}.`;
  const tips = [];

  if (feels >= 30) {
    title = "Warm day planning";
    tips.push("Choose lighter clothing and hydrate early.");
  } else if (feels <= 5) {
    title = "Cold weather mode";
    tips.push("Layer up before heading out.");
  } else {
    tips.push("Comfortable for routine errands or a short walk.");
  }

  if (rainChance >= 50) {
    tips.push("Keep an umbrella or rain jacket nearby.");
  }

  if (current.wind_speed_10m >= 24) {
    tips.push("Expect wind exposure on open streets.");
  }

  if (current.relative_humidity_2m >= 75) {
    tips.push("Humidity may make movement feel heavier.");
  }

  if (tips.length < 3) {
    tips.push("Check the hourly trend before longer outdoor plans.");
  }

  comfortTitle.textContent = title;
  comfortText.textContent = summary;
  tipList.innerHTML = tips.slice(0, 4).map((tip) => `<div class="tip">${tip}</div>`).join("");
}

function renderForecast(weather) {
  forecastGrid.innerHTML = weather.daily.time
    .map((day, index) => {
      const [label, mood] = getCondition(weather.daily.weather_code[index]);
      const miniClass = mood === "rainy" ? "rain" : mood === "stormy" ? "storm" : mood === "snowy" ? "snow" : mood === "foggy" ? "fog" : "";
      return `
        <article class="forecast-card">
          <span>${index === 0 ? "Today" : formatDay(day)}</span>
          <div class="weather-mini ${miniClass}" aria-hidden="true"></div>
          <h3>${label}</h3>
          <strong>${formatTemp(weather.daily.temperature_2m_max[index])}</strong>
          <p>Low ${formatTemp(weather.daily.temperature_2m_min[index])} | Rain ${Math.round(weather.daily.precipitation_probability_max[index] ?? 0)}%</p>
        </article>
      `;
    })
    .join("");
}

function useLocation() {
  if (!navigator.geolocation) {
    setStatus("Location is not available in this browser.");
    return;
  }

  setStatus("Checking your location...");

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      setLoading(true);
      try {
        const place = {
          name: "Your Location",
          admin1: "",
          country: "",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        const weather = await getWeather(place);
        appState.weather = weather;
        renderWeather(weather);
        setStatus("Weather loaded for your current location.");
      } catch (error) {
        appState.weather = demoWeather;
        renderWeather(demoWeather);
        setStatus(`${error.message} Showing demo weather instead.`);
      } finally {
        setLoading(false);
      }
    },
    () => setStatus("Location permission was not granted.")
  );
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const city = cityInput.value.trim();

  if (!city) {
    setStatus("Type a city name first.");
    return;
  }

  loadCity(city);
});

recentCities.addEventListener("click", (event) => {
  const button = event.target.closest("[data-city]");
  if (!button) return;
  cityInput.value = button.dataset.city;
  loadCity(button.dataset.city);
});

locationBtn.addEventListener("click", useLocation);

unitToggle.addEventListener("click", () => {
  appState.unit = appState.unit === "c" ? "f" : "c";
  unitToggle.querySelector("span").textContent = appState.unit.toUpperCase();

  if (appState.weather) {
    renderWeather(appState.weather);
  }
});

renderRecent();
loadCity(cityInput.value);
