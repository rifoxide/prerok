function human_readable_bytes(bytes) {
  return new Intl.NumberFormat([], {
    style: 'unit',
    unit: 'byte',
    notation: 'compact',
    unitDisplay: 'narrow'
  }).format(bytes)
}
