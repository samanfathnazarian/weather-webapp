import { byIso } from 'country-code-lookup';
import { countryCodeEmoji } from 'country-code-emoji';
import ts from '@mapbox/timespace';

const cityNameDom = document.querySelector('.city-name');
const countryNameDom = document.querySelector('.country-name');
const dateDom = document.querySelector('.date');

const weatherDescriptionDom = document.querySelector('.weather-description');
const iconDom = document.querySelector('.icon');
const tempDom = document.querySelector('.temp');
const tempHighTextDom = document.querySelector('.temp-high-text');
const tempLowTextDom = document.querySelector('.temp-low-text');

const feelsLikeTempDom = document.querySelector('.feels-like-temp');
const humidityValueDom = document.querySelector('.humidity-value');
const windSpeedValueDom = document.querySelector('.wind-speed-value');

const sunriseValueDom = document.querySelector('.sunrise-value');
const sunsetValueDom = document.querySelector('.sunset-value');
const sunriseUnitDom = document.querySelector('.sunrise-unit');
const sunsetUnitDom = document.querySelector('.sunset-unit');

// const hourlyCard = document.querySelectorAll('.hourly-card');
const hourlyTimeDom = Array.from(document.querySelectorAll('.hourly-time'));
const hourlyImgDom = Array.from(document.querySelectorAll('.hourly-img'));
const hourlyTempDom = Array.from(document.querySelectorAll('.hourly-temp'));

//5-DAY-FORECAST
const fiveDayForecastDayDom = document.querySelectorAll('.five-day-forecast-day');
const fiveDayForecastImgDom = document.querySelectorAll('.five-day-forecast-img');

const fiveDayForecastTempHigh = document.querySelectorAll('.five-day-forecast-temp-high');
const fiveDayForecastTempLow = document.querySelectorAll('.five-day-forecast-temp-low');

//////////////////////////
function getHours(internationalTime) {
  let hours = internationalTime.hours();
  let minutes = internationalTime.minutes();

  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes;
  const strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}

function formatAMPM(date, lat, lng) {
  const internationalTime = ts.getFuzzyLocalTimeFromPoint(date, [lng, lat]);
  return getHours(internationalTime);
}

function formatTodaysDate(date, lat, lng) {
  const internationalTime = ts.getFuzzyLocalTimeFromPoint(date, [lng, lat]);

  const hours = getHours(internationalTime);
  const [day, month, dateVal, year] = internationalTime.toString().split(' ');
  const str = `${day}, ${month} ${dateVal}, ${year}, ${hours}`;

  return str;
}

function formatWeekDayName(date, lat, lng) {
  const internationalTime = ts.getFuzzyLocalTimeFromPoint(date, [lng, lat]);
  const [day] = internationalTime.toString().split(' ');

  return day;
}

export async function render(fetchFiveDayForecast, lat, lng, metric) {
  //fetch for data
  const data = await fetchFiveDayForecast(lat, lng);

  dateDom.textContent = formatTodaysDate(new Date(), lat, lng);

  //render data
  cityNameDom.textContent = `${data.city.name}`;
  countryNameDom.textContent = `${byIso(data.city.country).country} ${countryCodeEmoji(data.city.country)}`;
  weatherDescriptionDom.textContent = data.list[0].weather[0].description;
  tempDom.textContent = `${Math.round(data.list[0].main.temp)}°C`;

  const [maxTemp, minTemp] = findMinAndMaxTemp(0, data);
  tempHighTextDom.textContent = maxTemp;
  tempLowTextDom.textContent = minTemp;

  feelsLikeTempDom.textContent = `${Math.round(data.list[0].main.feels_like)}°C`;
  iconDom.src = `src/img/icons/${data.list[0].weather[0].icon}.svg`;

  humidityValueDom.textContent = data.list[0].main.humidity;
  windSpeedValueDom.textContent = data.list[0].wind.speed;

  const [sunriseTime, sunriseUnit] = formatAMPM(new Date(data.city.sunrise * 1000), lat, lng).split(' ');
  const [sunsetTime, sunsetUnit] = formatAMPM(new Date(data.city.sunset * 1000), lat, lng).split(' ');
  sunriseValueDom.textContent = sunriseTime;
  sunsetValueDom.textContent = sunsetTime;
  sunriseUnitDom.textContent = sunriseUnit;
  sunsetUnitDom.textContent = sunsetUnit;

  //render hourly forecast
  for (let i = 0; i < 7; i++) {
    hourlyTimeDom[i].textContent = formatAMPM(new Date(data.list[i].dt * 1000), lat, lng);
    hourlyImgDom[i].src = `src/img/icons/${data.list[i].weather[0].icon}.svg`;
    hourlyTempDom[i].textContent = `${Math.round(data.list[i].main.temp)}°C`;
  }

  let j = 0;
  for (let i = 0; i < 40; i += 8) {
    if (j === 0) fiveDayForecastDayDom[j].textContent = 'Today';
    else fiveDayForecastDayDom[j].textContent = formatWeekDayName(new Date(data.list[i].dt * 1000), lat, lng);

    fiveDayForecastImgDom[j].src = `src/img/icons/${data.list[i].weather[0].icon.replace('n', 'd')}.svg`; //remove 'n' from weather

    const [maxTemp, minTemp] = findMinAndMaxTemp(i, data);
    fiveDayForecastTempHigh[j].textContent = maxTemp;
    fiveDayForecastTempLow[j].textContent = minTemp;

    j++;
  }
}

/**
 * Go through data arr & find min & max temp for the day
 * @param {*} startIdx
 * @param {*} data
 * @returns
 */
function findMinAndMaxTemp(startIdx, data) {
  let maxTemp = -Infinity;
  let minTemp = Infinity;

  //loop through something for 8 times
  for (let i = startIdx; i < startIdx + 8; i++) {
    maxTemp = Math.max(maxTemp, data.list[i].main.temp_max);
    minTemp = Math.min(minTemp, data.list[i].main.temp_min);
  }

  return [Math.round(maxTemp), Math.round(minTemp)];
}

/**
 *
 * @param {String} metricStr
 */
function convertMetrics(metricStr) {
  if (metricStr === 'metric');
  if (metricStr === 'imperial');
}
