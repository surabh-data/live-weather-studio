# Live Weather Studio

Live Weather Studio is a friendly upgrade of the original Liveweather Python idea. The earlier project
asked for a city and read the current weather aloud. This version turns the same idea into a polished
browser app with animated visuals, forecast cards, city search, unit switching, location support, and
comfort guidance.

## Features

- Live city search with Open-Meteo geocoding and forecast APIs
- No private API key required
- Animated weather scene for clear, cloudy, rainy, stormy, snowy, foggy, and night conditions
- Celsius/Fahrenheit toggle
- Current metrics for wind, humidity, rain chance, pressure, high, low, and feels-like temperature
- Hourly temperature chart and 7-day forecast cards
- Recent city shortcuts saved in the browser
- Graceful demo fallback if network access is unavailable
- Fully static HTML, CSS, and JavaScript for GitHub Pages

## Project Structure

```text
.
+-- index.html
+-- styles.css
+-- script.js
+-- README.md
+-- .nojekyll
```

## Run Locally

Open `index.html` in a browser, or run a small local server:

```bash
python -m http.server 8765
```

Then open `http://localhost:8765`.

## GitHub Pages

1. Create a new GitHub repository, for example `live-weather-studio`.
2. Upload these files to the repository root.
3. Open `Settings > Pages`.
4. Select `Deploy from a branch`.
5. Choose `main` and `/root`.
6. Save.

## Data Source

Weather and geocoding data comes from [Open-Meteo](https://open-meteo.com/).
