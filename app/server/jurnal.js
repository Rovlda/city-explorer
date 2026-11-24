import { pool } from './db.js'

export function jurnal(req, res, next) {
  const inceput = process.hrtime.bigint()
  // OriginalUrl se reține înainte de intrarea în Router.
  const cale = req.originalUrl
  const metoda = req.method
  res.on('finish', async () => {
    const durata = Number(process.hrtime.bigint() - inceput) / 1e6
    try {
      await pool.query(
        'INSERT INTO jurnal (metoda, cale, status, durata_ms) VALUES (?, ?, ?, ?)',
        [metoda, cale.slice(0, 255), res.statusCode, Math.round(durata)],
      )
    } catch (err) {
      // Răspunsul a plecat deja; aici nu se mai apelează res.json().
      console.error('Nu s-a putut scrie în jurnal:', err.message)
    }
  })
  next()
}
