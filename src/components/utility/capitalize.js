export default s => {
  if (typeof s !== 'string') return ''
  const cap = s.charAt(0).toUpperCase() + s.slice(1)
  return cap
}
