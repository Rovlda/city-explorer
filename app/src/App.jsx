import { useEffect, useRef, useState } from 'react'
import { getDestinatii, postDestinatie, patchVizitat } from './api/destinatii.js'
import { getNevizitate, totalZile } from './utils/destinatii.js'
import Rezumat from './components/Rezumat.jsx'
import FormularDestinatie from './components/FormularDestinatie.jsx'
import ListaDestinatii from './components/ListaDestinatii.jsx'
import Cautare from './components/Cautare.jsx'
import PanouStatistici from './components/PanouStatistici.jsx'
import './App.css'

export default function App() {
  const [destinatii, setDestinatii] = useState([])
  const [incarcare, setIncarcare] = useState(true)
  const [eroare, setEroare] = useState(null)
  const [eroareSalvare, setEroareSalvare] = useState(null)
  const [seTrimite, setSeTrimite] = useState(false)
  const [ocupate, setOcupate] = useState([])
  const [cautare, setCautare] = useState('')
  const [revizie, setRevizie] = useState(0)
  const modificari = useRef(new Set())
  const adaugare = useRef(false)

  useEffect(() => {
    let activ = true
    getDestinatii()
      .then((date) => { if (activ) setDestinatii(date) })
      .catch((err) => { if (activ) setEroare(err.message) })
      .finally(() => { if (activ) setIncarcare(false) })
    return () => { activ = false }
  }, [])

  async function handleToggle(id) {
    if (modificari.current.has(id)) return
    const destinatie = destinatii.find((d) => d.id === id)
    if (!destinatie) return
    modificari.current.add(id)
    setOcupate((curent) => [...curent, id])
    setEroareSalvare(null)
    try {
      const salvata = await patchVizitat(id, !destinatie.vizitat)
      setDestinatii((curent) => curent.map((d) => d.id === id ? salvata : d))
    } catch (err) {
      setEroareSalvare(err.message)
    } finally {
      modificari.current.delete(id)
      setOcupate((curent) => curent.filter((valoare) => valoare !== id))
    }
  }

  async function handleAdd(destinatie) {
    if (adaugare.current) return false
    adaugare.current = true
    setSeTrimite(true)
    setEroareSalvare(null)
    try {
      const salvata = await postDestinatie(destinatie)
      setDestinatii((curent) => [...curent, salvata])
      setRevizie((curent) => curent + 1)
      return true
    } catch (err) {
      setEroareSalvare(err.message)
      return false
    } finally {
      adaugare.current = false
      setSeTrimite(false)
    }
  }
  const nevizitate = getNevizitate(destinatii)
  const text = cautare.trim().toLowerCase()
  const afisate = destinatii.filter((d) => d.oras.toLowerCase().includes(text) || d.tara.toLowerCase().includes(text))
  return (
    <main>
      <h1>City Explorer</h1>
      {incarcare ? <p className="stare" role="status">Se încarcă destinațiile...</p>
        : eroare ? <p className="stare eroare" role="alert">{eroare}</p> : <>
          <Rezumat total={destinatii.length} nevizitate={nevizitate.length} zile={totalZile(nevizitate)} />
          {eroareSalvare && <p className="stare eroare" role="alert">{eroareSalvare}</p>}
          <FormularDestinatie onAdd={handleAdd} seTrimite={seTrimite} />
          <Cautare valoare={cautare} onChange={setCautare} />
          {destinatii.length === 0 ? <p className="gol">Nu există destinații. Adaugă prima destinație folosind formularul.</p>
            : afisate.length === 0 ? <p className="gol">Niciun rezultat pentru «{cautare.trim()}».</p>
              : <ListaDestinatii destinatii={afisate} onToggle={handleToggle} ocupate={ocupate} />}
        </>}
      <PanouStatistici revizie={revizie} />
    </main>
  )
}
