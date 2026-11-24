export function valideaza(valori) {
  const erori = {}
  if (valori.oras.trim().length < 2) erori.oras = 'Orașul are cel puțin două caractere.'
  if (!valori.tara.trim()) erori.tara = 'Țara este obligatorie.'
  const zile = Number(valori.zile)
  if (!Number.isInteger(zile) || zile < 1 || zile > 30) erori.zile = 'Numărul de zile trebuie să fie întreg, între 1 și 30.'
  if (valori.oras.trim().length > 100) erori.oras = 'Maximum 100 de caractere.'
  if (valori.tara.trim().length > 100) erori.tara = 'Maximum 100 de caractere.'
  return erori
}
