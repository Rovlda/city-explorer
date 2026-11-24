-- Datele inițiale din laboratorul 5. Docker rulează fișierul la primul volum gol.
-- Rularea manuală resetează cele trei tabele; folosiți doar baza laboratorului.
SET NAMES utf8mb4;
DROP TABLE IF EXISTS orase;
CREATE TABLE orase (
  id INT AUTO_INCREMENT PRIMARY KEY,
  oras VARCHAR(100) NOT NULL,
  tara VARCHAR(100) NOT NULL,
  pret INT NOT NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
INSERT INTO orase (oras, tara, pret) VALUES
  ('Madrid', 'Spania', 520), ('Barcelona', 'Spania', 480),
  ('Praga', 'Cehia', 310), ('Viena', 'Austria', 390);

DROP TABLE IF EXISTS destinatii;
CREATE TABLE destinatii (
  id INT AUTO_INCREMENT PRIMARY KEY,
  oras VARCHAR(100) NOT NULL,
  tara VARCHAR(100) NOT NULL,
  zile INT NOT NULL,
  vizitat BOOLEAN NOT NULL DEFAULT FALSE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
INSERT INTO destinatii (oras, tara, zile, vizitat) VALUES
  ('Lisabona', 'Portugalia', 4, FALSE),
  ('Cluj-Napoca', 'România', 2, TRUE),
  ('Porto', 'Portugalia', 3, FALSE),
  ('Brașov', 'România', 2, TRUE),
  ('Kyoto', 'Japonia', 6, FALSE),
  ('Tokyo', 'Japonia', 5, FALSE);

DROP TABLE IF EXISTS jurnal;
CREATE TABLE jurnal (
  id INT AUTO_INCREMENT PRIMARY KEY,
  metoda VARCHAR(10) NOT NULL,
  cale VARCHAR(255) NOT NULL,
  status INT NOT NULL,
  durata_ms INT NOT NULL,
  creat_la DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
