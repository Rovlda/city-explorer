import { useEffect, useState } from 'react'
import { getStatistici } from '../api/statistici.js'

export default function PanouStatistici({ revizie = 0 }) {
  const [prag, setPrag] = useState('3')
  const [tara, setTara] = useState('')
  const [rezultat, setRezultat] = useState(null)
  const cheie = JSON.stringify([prag, tara, revizie])
  useEffect(() => {
    let activ = true
    getStatistici(prag, tara)
      .then((date) => { if (activ) setRezultat({ cheie, date }) })
      .catch((eroare) => { if (activ) setRezultat({ cheie, eroare: eroare.message }) })
    return () => { activ = false }
  }, [prag, tara, revizie, cheie])
  const incarcare = rezultat?.cheie !== cheie
  return <section className="panou" aria-labelledby="statistici-titlu">
    <h2 id="statistici-titlu">Statistici</h2>
    <div className="filtre-statistici">
      <label htmlFor="prag">Cel puțin <input id="prag" type="number" min="1" step="1" value={prag} onChange={(e) => setPrag(e.target.value)} /> zile</label>
      <label htmlFor="tara-statistici">Țară <input id="tara-statistici" type="text" maxLength="100" placeholder="Toate țările" value={tara} onChange={(e) => setTara(e.target.value)} /></label>
    </div>
    {incarcare ? <p className="stare" role="status">Se încarcă statisticile...</p>
      : rezultat.eroare ? <p className="stare eroare" role="alert">Statistici indisponibile: {rezultat.eroare}</p>
        : <div aria-live="polite">
          {rezultat.date.destinatii === 0 && <p className="gol">Nicio destinație nu corespunde filtrelor.</p>}
          <ul><li>Destinații: {rezultat.date.destinatii}</li><li>Total zile: {rezultat.date.zile}</li><li>Media: {rezultat.date.medie.toFixed(1)} zile</li></ul>
        </div>}
  </section>
}
