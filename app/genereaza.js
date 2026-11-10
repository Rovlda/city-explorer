import { writeFileSync } from 'node:fs'
const tari = {
  Portugalia: ['Lisabona', 'Porto', 'Faro', 'Braga', 'Coimbra'],
  România: ['Cluj-Napoca', 'Brașov', 'Sibiu', 'Iași', 'Timișoara'],
  Japonia: ['Kyoto', 'Tokyo', 'Osaka', 'Nara', 'Kobe'],
  Spania: ['Madrid', 'Barcelona', 'Sevilla', 'Valencia', 'Bilbao'],
  Italia: ['Roma', 'Milano', 'Florența', 'Napoli', 'Veneția'],
}
const perechi = Object.entries(tari).flatMap(([tara, orase]) => orase.map((oras) => ({ oras, tara })))
const destinatii = Array.from({ length: 2000 }, (_, index) => {
  const i = index + 1
  const { oras, tara } = perechi[i % perechi.length]
  return { id: String(i), oras: `${oras} ${i}`, tara, zile: (i % 14) + 1, vizitat: i % 3 === 0 }
})
writeFileSync('db-mare.json', JSON.stringify({ destinatii }, null, 2))
