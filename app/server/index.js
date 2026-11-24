import express from 'express'
import cors from 'cors'
import { pool } from './db.js'
import { jurnal } from './jurnal.js'
import statistici from './rute/statistici.js'
import raportJurnal from './rute/jurnal.js'
import { destinatieValida, idValid, pentruClient } from './validare.js'

const app = express()
app.use((req, res, next) => {
  console.log(req.method, req.originalUrl)
  next()
})
// Înainte de cors(): înregistrăm inclusiv OPTIONS, la care cors răspunde direct.
app.use(jurnal)
app.use(cors())
app.use(express.json())

app.get('/api/salut', (req, res) => res.json({ mesaj: 'Serverul funcționează' }))
app.all('/api/ecou/:id', (req, res) => {
  res.json({ params: req.params, query: req.query, body: req.body })
})

app.get('/api/destinatii', async (req, res) => {
  const [randuri] = await pool.query('SELECT id, oras, tara, zile, vizitat FROM destinatii ORDER BY id')
  res.json(randuri.map(pentruClient))
})

app.get('/api/destinatii/caut', async (req, res) => {
  if (typeof req.query.oras !== 'string' || !req.query.oras.trim() || req.query.oras.length > 100) {
    return res.status(400).json({ eroare: 'Specifică orașul căutat, de maximum 100 de caractere.' })
  }
  const [randuri] = await pool.query(
    'SELECT id, oras, tara, zile, vizitat FROM destinatii WHERE oras = ? ORDER BY id',
    [req.query.oras],
  )
  res.json(randuri.map(pentruClient))
})

app.post('/api/destinatii', async (req, res) => {
  if (!destinatieValida(req.body)) {
    return res.status(400).json({ eroare: 'Date invalide. Orașul și țara sunt obligatorii (maximum 100 de caractere), iar zile trebuie să fie un număr întreg între 1 și 30.' })
  }
  const oras = req.body.oras.trim()
  const tara = req.body.tara.trim()
  const { zile } = req.body
  const [rezultat] = await pool.query(
    'INSERT INTO destinatii (oras, tara, zile, vizitat) VALUES (?, ?, ?, ?)',
    [oras, tara, zile, false],
  )
  res.status(201).json({ id: String(rezultat.insertId), oras, tara, zile, vizitat: false })
})

app.patch('/api/destinatii/:id', async (req, res) => {
  const { id } = req.params
  if (!idValid(id) || typeof req.body?.vizitat !== 'boolean') {
    return res.status(400).json({ eroare: 'ID invalid sau vizitat diferit de true/false.' })
  }
  const [rezultat] = await pool.query('UPDATE destinatii SET vizitat = ? WHERE id = ?', [req.body.vizitat, id])
  if (rezultat.affectedRows === 0) {
    return res.status(404).json({ eroare: 'Destinația nu există.' })
  }
  const [randuri] = await pool.query('SELECT id, oras, tara, zile, vizitat FROM destinatii WHERE id = ?', [id])
  if (randuri.length === 0) return res.status(404).json({ eroare: 'Destinația nu există.' })
  res.json(pentruClient(randuri[0]))
})

app.use('/api/statistici', statistici)
app.use('/api/jurnal', raportJurnal)
app.use((req, res) => res.status(404).json({ eroare: 'Ruta nu există.' }))
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err)
  console.error(err.message)
  if (err.type === 'entity.parse.failed') return res.status(400).json({ eroare: 'Corpul cererii nu este JSON valid.' })
  if (err.type === 'entity.too.large') return res.status(413).json({ eroare: 'Corpul cererii este prea mare.' })
  res.status(500).json({ eroare: 'Eroare internă. Verifică legătura serverului cu baza de date.' })
})

const port = Number(process.env.PORT ?? 3000)
const server = app.listen(port, '127.0.0.1', () => {
  console.log(`API pornit pe http://localhost:${port}`)
})
server.on('error', (err) => { console.error(err.message); process.exitCode = 1 })
for (const semnal of ['SIGINT', 'SIGTERM']) {
  process.once(semnal, () => server.close(async () => { await pool.end(); process.exit(0) }))
}
