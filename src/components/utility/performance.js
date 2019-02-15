// The random extension to the mark names is to make names unique
// otherwise, as there are duplicate mark names, measure picks the wrong identically named mark

export const mark = msg => {
  performance.mark(msg + ' ' + String(Math.random().toFixed(3)))
}

const chop = s => s.substring(0, s.lastIndexOf(' '))

export const measure = () => {
  //   performance.clearMeasures()
  performance.getEntriesByType('mark').forEach((p, i, a) => {
    if (i < a.length - 1) {
      const currName = p.name
      const nextName = a[i + 1].name
      performance.measure(
        `from ${chop(currName)} to ${chop(nextName)}`,
        currName,
        nextName
      )
    }
  })
  console.table(performance.getEntriesByType('measure'), ['name', 'duration'])

  //   performance.clearMarks()
}
