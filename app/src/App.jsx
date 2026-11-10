import { useEffect, useRef, useState } from 'react'
import { getDestinatii, postDestinatie, patchVizitat, PAGINARE } from './api/destinatii.js'
import { getNevizitate, totalZile } from './utils/destinatii.js'
import Rezumat from './components/Rezumat.jsx'
import FormularDestinatie from './components/FormularDestinatie.jsx'
import ListaDestinatii from './components/ListaDestinatii.jsx'
import Cautare from './components/Cautare.jsx'
import './App.css'

export default function App() {
  const [destinatii, setDestinatii] = useState([])
  const [incarcare, setIncarcare] = useState(true)
  const [eroare, setEroare] = useState(null)
  const [eroareSalvare, setEroareSalvare] = useState(null)
  const [seTrimite, setSeTrimite] = useState(false)
  const [cautare, setCautare] = useState('')
  const [pagina, setPagina] = useState(1)
  const [totalPagini, setTotalPagini] = useState(1)
  const [revizie, setRevizie] = useState(0)
  const modificari = useRef(new Set())

  useEffect(() => {
    let activ = true
    async function incarca() {
      try {
        const rezultat = await getDestinatii(pagina)
        if (activ) {
          setDestinatii(PAGINARE ? rezultat.data : rezultat)
          setTotalPagini(PAGINARE ? Math.max(1, rezultat.pages) : 1)
        }
      } catch (err) {
        if (activ) setEroare(err.message)
      } finally {
        if (activ) setIncarcare(false)
      }
    }
    incarca()
    return () => { activ = false }
  }, [pagina, revizie])

  function schimbaPagina(noua) {
    setIncarcare(true)
    setEroare(null)
    setPagina(noua)
  }
  async function handleToggle(id) {
    if (modificari.current.has(id)) return
    const destinatie = destinatii.find((d) => d.id === id)
    if (!destinatie) return
    modificari.current.add(id)
    setEroareSalvare(null)
    try {
      const salvata = await patchVizitat(id, !destinatie.vizitat)
      setDestinatii((curent) => curent.map((d) => d.id === id ? salvata : d))
    } catch (err) {
      setEroareSalvare(err.message)
    } finally {
      modificari.current.delete(id)
    }
  }
  async function handleAdd(destinatie) {
    setSeTrimite(true)
    setEroareSalvare(null)
    try {
      const salvata = await postDestinatie(destinatie)
      setDestinatii((curent) => [...curent, salvata])
      if (PAGINARE) {
        // Recitim ultima pagină pentru a păstra limita de 20 de carduri.
        try {
          const rezultat = await getDestinatii(1)
          setIncarcare(true)
          setPagina(Math.max(1, rezultat.pages))
          setRevizie((curent) => curent + 1)
        } catch (err) {
          // POST a reușit: nu sugerăm retrimiterea aceleiași destinații.
          setEroareSalvare(`Destinația a fost salvată, dar lista nu s-a reîncărcat: ${err.message}`)
        }
      }
      return true
    } catch (err) {
      setEroareSalvare(err.message)
      return false
    } finally {
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
              : <ListaDestinatii destinatii={afisate} onToggle={handleToggle} />}
          {PAGINARE && <nav className="paginare" aria-label="Paginare">
            <button disabled={pagina === 1 || seTrimite} onClick={() => schimbaPagina(pagina - 1)}>Înapoi</button>
            <span>pagina {pagina} din {totalPagini}</span>
            <button disabled={pagina >= totalPagini || seTrimite} onClick={() => schimbaPagina(pagina + 1)}>Înainte</button>
          </nav>}
        </>}
    </main>
  )
}
