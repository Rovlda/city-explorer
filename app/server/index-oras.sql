-- Exercițiul 5: se rulează pe rând în DataGrip, după genereaza.js.
-- Păstrați rezultatul primului EXPLAIN înainte de a crea indexul.
EXPLAIN SELECT id, oras, tara, zile, vizitat
FROM destinatii WHERE oras = 'Zalau-199943';

CREATE INDEX IF NOT EXISTS idx_oras ON destinatii (oras);

EXPLAIN SELECT id, oras, tara, zile, vizitat
FROM destinatii WHERE oras = 'Zalau-199943';
