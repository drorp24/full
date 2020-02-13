const recentlyNotified = serializedTime => {
  if (!serializedTime) return false
  const timeNow = new Date()
  const timeThen = serializedTime
  const oneHour = 1000 * 60 * 60
  console.log('recentlyNotified is getting: ', serializedTime)
  console.log('timeNow: ', timeNow)
  console.log('timeThen: ', timeThen)
  console.log('timeNow - timeThen: ', timeNow - timeThen)
  console.log('will return: ', timeNow - timeThen < oneHour)
  return timeNow - timeThen < oneHour
}

export default recentlyNotified
