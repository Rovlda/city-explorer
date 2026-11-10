const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
export const PAGINARE = import.meta.env.VITE_PAGINARE !== 'false'
async function cerere(cale, optiuni = {}) {
  const response = await fetch(`${API_URL}${cale}`, optiuni)
  if (!response.ok) throw new Error(`Serverul a răspuns cu ${response.status}`)
  return response.json()
}
export function getDestinatii(pagina = 1) {
  return cerere(PAGINARE ? `/destinatii?_page=${pagina}&_per_page=20` : '/destinatii')
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
