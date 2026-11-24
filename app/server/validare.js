export function textValid(valoare) {
  return typeof valoare === 'string' && valoare.trim().length > 0 && valoare.trim().length <= 100
}

export function destinatieValida(date) {
  return date !== null && typeof date === 'object' && !Array.isArray(date)
    && textValid(date.oras) && textValid(date.tara)
    && Number.isInteger(date.zile) && date.zile >= 1 && date.zile <= 30
}

export function idValid(id) {
  return typeof id === 'string' && /^[1-9]\d*$/.test(id) && Number(id) <= 2147483647
}

export function pentruClient(d) {
  return { ...d, id: String(d.id), vizitat: Boolean(d.vizitat) }
}
