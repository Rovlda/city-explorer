import { useState } from 'react'
import { valideaza } from '../utils/validare.js'
const initial = { oras: '', tara: '', zile: '' }
export default function FormularDestinatie({ onAdd, seTrimite }) {
  const [valori, setValori] = useState(initial)
  const [erori, setErori] = useState({})
  function handleChange(event) {
    const { name, value } = event.target
    setValori((curent) => ({ ...curent, [name]: value }))
  }
  async function handleSubmit(event) {
    event.preventDefault()
    if (seTrimite) return
    const rezultat = valideaza(valori)
    setErori(rezultat)
    if (Object.keys(rezultat).length > 0) return
    const succes = await onAdd({ oras: valori.oras.trim(), tara: valori.tara.trim(), zile: Number(valori.zile), vizitat: false })
    if (succes) setValori(initial)
  }
  return (
    <form className="formular" onSubmit={handleSubmit} noValidate>
      {Object.entries({ oras: 'Oraș', tara: 'Țară', zile: 'Zile' }).map(([name, label]) => (
        <div className="camp" key={name}>
          <label htmlFor={name}>{label}</label>
          <input id={name} name={name} type={name === 'zile' ? 'number' : 'text'}
            value={valori[name]} onChange={handleChange} disabled={seTrimite}
            className={erori[name] ? 'invalid' : ''} aria-invalid={Boolean(erori[name])}
            aria-describedby={erori[name] ? `${name}-eroare` : undefined} />
          {erori[name] && <p className="eroare-camp" id={`${name}-eroare`}>{erori[name]}</p>}
        </div>
      ))}
      <button type="submit" disabled={seTrimite}>{seTrimite ? 'Se trimite...' : 'Adaugă'}</button>
    </form>
  )
}
