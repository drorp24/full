export default function(serializedTime) {
  if (!serializedTime) return false
  const oneHour = 1000 * 60 * 60
  return new Date() - Date.parse(serializedTime) < oneHour
}
