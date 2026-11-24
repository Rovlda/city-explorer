# City Explorer

Aplicație pentru organizarea destinațiilor turistice, realizată la Tehnologii Web.
Autor: Vlad Robert-Daniel, grupa 633AB.

## Laboratorul 5

Interfața React din laboratorul 4 este conectată la un backend Express și o bază
MariaDB prin mysql2. Destinațiile se citesc din baza de date, se adaugă printr-un
formular validat și se pot marca drept vizitate. Căutarea din interfață este păstrată.
Panoul de statistici folosește agregări SQL și filtre după pragul de zile și țară.

Structura existentă este păstrată: proiectul Vite se află în `app/`, iar noul backend
în `app/server/`, lângă `app/src/`. Fișierele HTML/CSS de la rădăcină aparțin versiunii
statice istorice. Aplicația actuală se pornește din `app/`.

## Pornire

Necesare: Node.js 22.12+ (sau o versiune mai nouă compatibilă), Docker Desktop pornit.
Comenzile de mai jos sunt pentru PowerShell, din rădăcina repository-ului.

Terminalul 1, baza de date și backendul:

```powershell
cd app/server
Copy-Item .env.example .env
npm ci
docker compose up -d
docker compose ps
npm run dev
```

Așteaptă ca MariaDB să fie `healthy` înainte să folosești aplicația.
La următoarele porniri nu mai copia `.env` și nu reinstala dependențele dacă nu
s-au schimbat. `.env` este exclus din Git; exemplul conține doar valorile locale
pentru laborator. Dacă portul 3306 este ocupat, schimbă `DB_PORT` în `.env`,
de exemplu la 3307: Compose și backendul folosesc aceeași valoare.

Terminalul 2, din rădăcina repository-ului:

```powershell
cd app
npm ci
npm run dev
```

Deschide adresa afișată de Vite, de obicei http://localhost:5173.
Backendul folosește http://localhost:3000/api. Terminalele rămân deschise.
Fișierul `app/.env` este opțional: adresa API implicită este deja corectă.

În DataGrip: MariaDB, host `127.0.0.1`, portul `DB_PORT` (implicit 3306),
user `web`, password `web`, database `city_explorer`.

```sql
SELECT COUNT(*) FROM destinatii;
SELECT oras FROM destinatii WHERE id = 4;
```

Pe o bază nouă, rezultatele sunt 6 și Brașov. `schema.sql` este executat automat
doar la prima inițializare a volumului Docker. Rularea sa manuală resetează tabelele.
Pentru oprirea bazei fără ștergerea datelor: `docker compose stop`, din `app/server`.

## Rute API

| Metodă și rută | Comportament |
|---|---|
| `GET /api/salut` | Mesaj de verificare a serverului |
| `ALL /api/ecou/:id` | Întoarce params, query și body pentru observațiile din fișă |
| `GET /api/destinatii` | Lista ordonată după ID; id string și vizitat boolean |
| `POST /api/destinatii` | Validează și inserează; 201 la succes, 400 la date invalide |
| `PATCH /api/destinatii/:id` | Modifică vizitat; 404 dacă ID-ul nu există |
| `GET /api/destinatii/caut?oras=Zalau-199943` | Căutare exactă, parametrizată |
| `GET /api/statistici?prag=3&tara=Portugalia` | COUNT, SUM și media pentru filtrul cerut |
| `GET /api/jurnal/raport?metoda=GET` | Maximum 10 grupuri metodă/cale, ordonate după numărul cererilor |

POST primește `oras`, `tara` și `zile`; zile trebuie să fie un număr întreg între
1 și 30, nu textul `"3"`. Orașul și țara nu pot fi goale și au maximum 100 de
caractere. Serverul generează ID-ul și setează vizitat la false.
PATCH primește un boolean real pentru vizitat. Cererile cu JSON incorect primesc 400.

Interogările folosesc parametri, inclusiv filtrul raportului. Apostrofurile și textul
`GET' OR '1'='1` sunt tratate ca valori; varianta vulnerabilă nu este activă în proiect.

Middleware-ul de jurnalizare este înaintea CORS, astfel încât înregistrează și
OPTIONS. El reține `req.originalUrl` înainte de rutare și scrie metoda, calea,
statusul și durata după evenimentul `finish`, cu tratarea erorilor INSERT.
Ruta nefiltrată întoarce un array, conform laboratorului; paginarea json-server din
laboratorul 4 nu mai este folosită. Datele vechi din `app/db.json` și generatorul
vechi `app/genereaza.js` nu sunt sursa backendului MariaDB.

## Exercițiul 5 și indexul

Din `app/server`, pe baza destinată laboratorului:

```powershell
npm run tipuri
npm run generate
```

Generatorul adaugă 200.000 de rânduri. Nu deschide lista React cu acest volum;
folosește direct adresa API de căutare. Rulează pe rând comenzile din
`server/index-oras.sql` în DataGrip: EXPLAIN, CREATE INDEX, apoi EXPLAIN din nou.
Indexul nu este creat în schema inițială, pentru a permite măsurarea înainte/după.

Rezultate efectiv măsurate pe o instanță temporară MariaDB 11.4.5:

| Măsurătoare | Fără index | Cu idx_oras |
|---|---:|---:|
| EXPLAIN type | ALL | ref |
| EXPLAIN key | NULL | idx_oras |
| EXPLAIN rows | 199488 | 1 |
| HTTP căutare, minim din 5 cereri | 28,59 ms | 0,88 ms |
| Corpul răspunsului listei complete | 15905220 octeți | 15905220 octeți |

Duratele de mai sus provin din Node fetch pe loopback, nu din coloana Time a
DevTools, și variază cu mediul. Pentru fișă se fac separat măsurătorile și capturile
cerute în browser și DataGrip. `rows` este o estimare a optimizatorului, nu numărul
exact de rânduri din tabelă. Indexul accelerează căutarea exactă, dar nu micșorează
lista completă: pentru aceea este necesară paginare SQL cu LIMIT/OFFSET. Un filtru
`LIKE '%alau%'` nu permite aceeași căutare eficientă prin indexul B-tree.

După experiment, dacă s-a pornit de la cele șase rânduri inițiale și restul sunt
doar date de test, se poate rula în baza laboratorului:

```sql
DELETE FROM destinatii WHERE id > 6;
ALTER TABLE destinatii AUTO_INCREMENT = 7;
```

Indexul rămâne. Nu executa această curățare într-o bază cu destinații personale
adăugate ulterior pe care vrei să le păstrezi.

## Verificare

```powershell
cd app
npm run build
npm run lint
cd server
npm test
```

Au trecut build, lint, 4 teste unitare, 41 verificări API cu MariaDB real și 15
verificări în browser. Au fost verificate validarea, persistența, codurile HTTP,
statisticile, jurnalizarea OPTIONS, filtrarea sigură și interfața mobilă. Testarea
bazei s-a făcut pe o instanță nativă temporară, separată de datele utilizatorului;
configurația Compose a fost validată, dar Docker Desktop nu rula în mediul de test.

## Utilizare AI

OpenAI Codex a ajutat la implementarea backendului, adaptarea interfeței existente,
validare și testare. Măsurătorile din README au fost obținute prin rularea codului.
Fișa Word și capturile sale sunt livrabile separate, de completat ulterior.
