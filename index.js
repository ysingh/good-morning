require('dotenv').config()

const fetch = require('node-fetch')
const fs = require('fs').promises

const { DARKSKY_API_KEY, DARKSKY_BASE_URL, LAT, LON } = process.env

const getWeatherData = async () => {
  const reqUrl = new URL(`${DARKSKY_BASE_URL}${DARKSKY_API_KEY}/${LAT},${LON}`)
  reqUrl.searchParams.set('exclude', 'daily,minutely')
  const res = await fetch(reqUrl)
  const weatherData = await res.json()
  return weatherData
}

const humanReadableDateTime = (timestamp) => {
  return new Date(timestamp * 1e3).toLocaleString('en-US', { timezone: 'America/New_York' })
}

const minMaxTemp = (hourlyWeather) => {
  let minTemp = Number.MAX_SAFE_INTEGER
  let maxTemp = Number.MIN_SAFE_INTEGER
  let minTempAt = null
  let maxTempAt = null

  hourlyWeather.forEach(forecast => {
    if (forecast.apparentTemperature > maxTemp) {
      maxTemp = forecast.apparentTemperature
      maxTempAt = humanReadableDateTime(forecast.time)
    }
    if (forecast.apparentTemperature < minTemp) {
      minTemp = forecast.apparentTemperature
      minTempAt = humanReadableDateTime(forecast.time)
    }
  })

  return {
    max: `${maxTemp}F @ ${maxTempAt}`,
    min: `${minTemp}F @ ${minTempAt}`
  }
}

const formatData = (weatherData) => {
  const minMax = minMaxTemp(weatherData.hourly.data.slice(0, 15))
  return {
    high: minMax.max,
    low: minMax.min,
    weatherNow: `${weatherData.currently.apparentTemperature} F - ${weatherData.currently.summary}`,
    chanceOfRain: `${weatherData.currently.precipProbability} %`,
    daySummary: weatherData.hourly.summary,
  }
}

const main = async () => {
  weatherData = await getWeatherData()
  const formattedData = formatData(weatherData)
}

main()
