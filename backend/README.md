# Habit Tracker Backend

Flask-basiertes Backend für die Habit Tracker App.

## Setup

1. Virtual Environment erstellen und aktivieren:
```bash
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate
```

2. Dependencies installieren:
```bash
pip install -r requirements.txt
```

3. Server starten:
```bash
python app.py
```

Server läuft auf: http://localhost:5000

## API Endpoints

### Habits
- `GET /api/habits` - Alle Habits abrufen
- `POST /api/habits` - Neues Habit erstellen
- `PUT /api/habits/<id>` - Habit bearbeiten
- `DELETE /api/habits/<id>` - Habit löschen

### Completions
- `POST /api/habits/<id>/complete` - Habit als erledigt markieren (mit optionaler Notiz)
- `GET /api/habits/<id>/completions` - Alle Completions eines Habits
- `GET /api/habits/<id>/stats` - Statistiken inkl. Streaks

### Goals
- `GET /api/goals` - Alle Ziele abrufen
- `POST /api/goals` - Neues Ziel erstellen
- `DELETE /api/goals/<id>` - Ziel löschen

### Dashboard
- `GET /api/dashboard` - Übersicht aller Habits mit Status
