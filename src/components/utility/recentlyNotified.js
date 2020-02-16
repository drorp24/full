const recentlyNotified = serializedTime => {
  if (!serializedTime) return false
  const timeNow = new Date()
  const timeThen = serializedTime
  const oneHour = 1000 * 60 * 60

  return Date.parse(timeNow) - Date.parse(timeThen) < oneHour
}

export default recentlyNotified
