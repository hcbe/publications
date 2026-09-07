# Publikationsstatus – GitHub Pages Website

Statische Website zur Übersicht der wissenschaftlichen Publikationen, Konferenzbeiträge und des aktuellen Forschungsstatus.

## Inhalt

- **Übersicht** mit Kennzahlen (Anzahl, Author/Co-Author, Abgeschlossen, Note A)
- **Publikationen** als Filter- und suchbare Karten (Rolle, Status, Rating, Volltextsuche)
- **Detail-Modal** mit Abstract und allen Metadaten
- **Kategorien & Credits** nach dem Decree of the Ministry of Education and Science of the Slovak Republic No. 456/2012 Coll.
- **ABDC-Liste** Erklärung der Ratings (A*, A, B, C)
- Dark-/Light-Mode

## Deployment auf GitHub Pages

1. Neues Repository auf GitHub anlegen (z. B. `username.github.io` oder `publications`).
2. Inhalt dieses Ordners in das Repository pushen (in den Root oder in `/docs`).
3. Unter **Settings → Pages**:
   - Source: **Deploy from a branch**
   - Branch: `main` (oder `master`)
   - Folder: `/ (root)` oder `/docs`
4. Nach wenigen Minuten ist die Seite unter  
   `https://username.github.io/` bzw. `https://username.github.io/repo-name/` erreichbar.

## Lokal testen

Einfach `index.html` im Browser öffnen oder einen lokalen Server starten:

```bash
# Python
python -m http.server 8000

# Node
npx serve .
```

Dann `http://localhost:8000` öffnen.

## Dateien

| Datei        | Beschreibung                          |
|--------------|---------------------------------------|
| `index.html` | Hauptseite                            |
| `styles.css` | Styles (inkl. Dark Mode)              |
| `data.js`    | Publikationen-Daten                   |
| `app.js`     | Filter, Suche, Modal, Theme           |
| `README.md`  | Diese Anleitung                       |

Daten stammen aus der Excel-Datei `Status publications.xlsx` (Sheets: Status, ABDC-List, Categories).
