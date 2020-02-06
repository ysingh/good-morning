require('dotenv').config()

const fetch = require('node-fetch')
const TelegramBot = require('node-telegram-bot-api')

const { DARKSKY_API_KEY, DARKSKY_BASE_URL, LAT, LON, GOOGLE_API_KEY, HOME_ADDRESS, WORK_ADDRESS,
  TELEGRAM_API_KEY, TELEGRAM_CHAT_ID } = process.env



const getWeatherData = async () => {
  const reqUrl = new URL(`${DARKSKY_BASE_URL}${DARKSKY_API_KEY}/${LAT},${LON}`)
  reqUrl.searchParams.set('exclude', 'daily,minutely')
  const res = await fetch(reqUrl)
  const weatherData = await res.json()
  return weatherData
}

const getTrafficData = async () => {
  const googleUrl = new URL('https://maps.googleapis.com/maps/api/directions/json')
  googleUrl.searchParams.set('origin', HOME_ADDRESS)
  googleUrl.searchParams.set('destination', WORK_ADDRESS)
  googleUrl.searchParams.set('key', GOOGLE_API_KEY)
  const res = await fetch(googleUrl)
  const driveTimeData = await res.json()
  return driveTimeData.routes[0].legs[0].duration.text
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
    chanceOfRain: `${weatherData.currently.precipProbability* 100} %`,
    daySummary: weatherData.hourly.summary,
  }
}

const main = async () => {
  weatherData = await getWeatherData()
  const formattedData = formatData(weatherData)
  const driveTime = await getTrafficData()
  const message = {
    ...formattedData,
    driveTime
  }
  const bot = new TelegramBot(TELEGRAM_API_KEY)
  bot.sendMessage(TELEGRAM_CHAT_ID, JSON.stringify(message, null, 4))
}

main()
