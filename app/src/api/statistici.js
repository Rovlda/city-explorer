const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
export async function getStatistici(prag, tara) {
  const adresa = new URL(`${API_URL}/statistici`)
  adresa.searchParams.set('prag', prag)
  if (tara !== '') adresa.searchParams.set('tara', tara)
  const response = await fetch(adresa)
  if (!response.ok) {
    const date = await response.json().catch(() => null)
    throw new Error(date?.eroare || `Serverul a răspuns cu ${response.status}`)
  }
  return response.json()
}
