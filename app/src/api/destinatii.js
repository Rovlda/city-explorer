const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

async function cerere(cale, optiuni = {}) {
  const response = await fetch(`${API_URL}${cale}`, optiuni)
  if (!response.ok) {
    const date = await response.json().catch(() => null)
    throw new Error(date?.eroare || `Serverul a răspuns cu ${response.status}`)
  }
  return response.json()
}
export function getDestinatii() {
  return cerere('/destinatii')
}
export function postDestinatie(d) {
  return cerere('/destinatii', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d),
  })
}
export function patchVizitat(id, vizitat) {
  return cerere(`/destinatii/${encodeURIComponent(id)}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vizitat }),
  })
}
