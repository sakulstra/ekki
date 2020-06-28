import numToWords from 'number-to-words'

export const numberToWord = (input: number) => numToWords.toWords(input)

export const closestInArray = (needle: number, haystack: number[]) => {
  return haystack.reduce((a, b) => {
    const aDiff = Math.abs(a - needle)
    const bDiff = Math.abs(b - needle)

    if (aDiff === bDiff) {
      return a > b ? a : b
    } else {
      return bDiff < aDiff ? b : a
    }
  })
}

export const average = (values: number[]) =>
  values.reduce((pre, acc) => pre + acc) / values.length

export const median = (values: number[]) => {
  if (values.length === 0) return 0

  values.sort(function (a, b) {
    return a - b
  })

  const half = Math.floor(values.length / 2)

  if (values.length % 2) return values[half]

  return (values[half - 1] + values[half]) / 2.0
}

export const getEstimations = (
  pokerMap: Map<string, number>,
  allowed: number[]
) => {
  const avg = average(Array.from(pokerMap.values()))
  return {
    avg,
    median: median(Array.from(pokerMap.values())),
    near: closestInArray(avg, allowed),
  }
}
