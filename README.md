# Habit Tracker App

Eine Full-Stack Web-Anwendung zum Tracken von täglichen Habits mit Streak-Funktion, Verlauf und Zielsetzung.

## Features

- **Habits erstellen & verwalten**: Erstelle benutzerdefinierte Habits mit Namen, Beschreibung und Farbe
- **Tägliches Abhaken**: Markiere Habits als erledigt mit optionalen Notizen
- **Streak-Tracking**: Verfolge deine aktuelle und längste Streak für jedes Habit
- **Verlauf**: Vollständige Timeline aller Completions mit Datum und Notizen
- **Ziele setzen**: Definiere Ziele mit Anzahl und Deadline
- **Monitoring Dashboard**: Übersicht über alle Habits, Fortschritt und Statistiken
- **Responsive Design**: Optimiert für Desktop und Mobile

## Tech Stack

### Backend
- **Python 3.x**
- **Flask**: Web-Framework
- **SQLAlchemy**: ORM für Datenbankzugriff
- **SQLite**: Datenbank

### Frontend
- **React 18**: UI-Framework
- **React Router**: Navigation
- **Axios**: API-Client
- **Vite**: Build-Tool

## Installation & Setup

### Voraussetzungen
- Python 3.8+
- Node.js 16+
- npm oder yarn

### Backend Setup

1. Navigiere zum Backend-Verzeichnis:
```bash
cd backend
```

2. Erstelle eine virtuelle Umgebung:
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

3. Installiere Dependencies:
```bash
pip install -r requirements.txt
```

4. Starte den Server:
```bash
python app.py
```

Der Backend-Server läuft nun auf: `http://localhost:5000`

### Frontend Setup

1. Öffne ein neues Terminal und navigiere zum Frontend-Verzeichnis:
```bash
cd frontend
```

2. Installiere Dependencies:
```bash
npm install
```

3. Starte den Development Server:
```bash
npm run dev
```

Die App läuft nun auf: `http://localhost:5173`

## 🚀 Production Deployment

Die App kann mit automatischem GitHub Actions Deployment auf einem Server deployed werden.

### Schnellstart (10 Minuten)

Siehe: **[deploy/QUICKSTART.md](deploy/QUICKSTART.md)**

### Vollständige Dokumentation

Siehe: **[deploy/DEPLOYMENT.md](deploy/DEPLOYMENT.md)**

### Features
- ✅ Automatisches Deployment bei jedem Push
- ✅ Nginx als Reverse Proxy
- ✅ Systemd Service für Backend
- ✅ SSL/HTTPS Support (optional)
- ✅ Domain-Support (optional)

## Verwendung

### Dashboard
- Sieh alle Habits für heute
- Markiere Habits als erledigt mit optionaler Notiz
- Verfolge deinen täglichen Fortschritt

### Habits
- Erstelle neue Habits mit Namen, Beschreibung und Farbe
- Bearbeite oder lösche bestehende Habits
- Klicke auf ein Habit für Details und Statistiken

### Habit-Details
- Sieh aktuelle und längste Streak
- Verfolge Completion-Rate der letzten 30 Tage
- Vollständiger Verlauf mit allen Notizen

### Ziele
- Setze Ziele für Habits (z.B. "30 Tage Sport")
- Verfolge Fortschritt mit Progress Bar
- Sieh abgelaufene und erreichte Ziele

## API Endpoints

### Habits
- `GET /api/habits` - Alle Habits abrufen
- `POST /api/habits` - Neues Habit erstellen
- `PUT /api/habits/<id>` - Habit bearbeiten
- `DELETE /api/habits/<id>` - Habit löschen

### Completions
- `POST /api/habits/<id>/complete` - Habit als erledigt markieren
- `GET /api/habits/<id>/completions` - Alle Completions eines Habits
- `GET /api/habits/<id>/stats` - Statistiken und Streaks

### Goals
- `GET /api/goals` - Alle Ziele abrufen
- `POST /api/goals` - Neues Ziel erstellen
- `DELETE /api/goals/<id>` - Ziel löschen

### Dashboard
- `GET /api/dashboard` - Dashboard-Übersicht

## Zukünftige Erweiterungen

- **Mobile App**: React Native Version für Android und iOS
- **Smartwatch Integration**: Für schnelles Check-off unterwegs
- **Benachrichtigungen**: Erinnerungen für Habits
- **Kategorien**: Gruppiere Habits in Kategorien
- **Export/Import**: Daten sichern und übertragen
- **Social Features**: Teile Erfolge mit Freunden
- **Habit-Templates**: Vordefinierte Habit-Vorlagen

## Lizenz

MIT

---

Dieses Repository wurde mit Claude Code erstellt.
