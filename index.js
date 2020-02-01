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

const humanReadableTime = (timestamp) => {
  return new Date(timestamp * 1e3).toLocaleString('en-US', { timezone: 'America/New_York' })
}

const dailyWeather = (hourlyWeather) => {
  let minTemp = Number.MAX_SAFE_INTEGER
  let maxTemp = Number.MIN_SAFE_INTEGER
  let minTempAt = null
  let maxTempAt = null
  const hourlyWeatherFormatted = hourlyWeather.map(forecast => {
    if (forecast.apparentTemperature > maxTemp) {
      maxTemp = forecast.apparentTemperature
      maxTempAt = humanReadableTime(forecast.time)
    }
    if (forecast.apparentTemperature < minTemp) {
      minTemp = forecast.apparentTemperature
      minTempAt = humanReadableTime(forecast.time)
    }
    return {
      time: humanReadableTime(forecast.time),
      summary: forecast.summary,
      temperature: `${forecast.apparentTemperature} F`
    }
  })
  return {
    hourlyWeatherFormatted,
    max: {
      temp: `${maxTemp} F`,
      time: maxTempAt
    },
    min: {
      temp: `${minTemp} F`,
      time: minTempAt
    }
  }
}

const formatData = (weatherData) => {
  const getWeatherDataForWholeDay = dailyWeather(weatherData.hourly.data.slice(0, 15))
  return {
    max: getWeatherDataForWholeDay.max,
    min: getWeatherDataForWholeDay.min,
    currentTime: humanReadableTime(weatherData.currently.time),
    currentSummary: weatherData.currently.summary,
    chanceOfRain: `${weatherData.currently.precipProbability} %`,
    currentTemp: `${weatherData.currently.apparentTemperature} F`,
    daySummary: weatherData.hourly.summary,
  }
}


const main = async () => {
  weatherData = await getWeatherData()
  const formattedData = formatData(weatherData)
  
}

main()
