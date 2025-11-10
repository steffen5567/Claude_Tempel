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

Server läuft auf: http://localhost:5001

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

## Troubleshooting

### Datenbank zurücksetzen

Wenn nach Schema-Änderungen 500-Fehler auftreten oder die Datenbank beschädigt ist:

**Auf dem Server:**
```bash
# 1. Backend stoppen
sudo systemctl stop habit-tracker-backend

# 2. Datenbank löschen (im instance Ordner!)
cd /var/www/habit-tracker-app/backend
rm instance/habits.db

# 3. Backend neu starten (erstellt automatisch neue leere Datenbank)
sudo systemctl start habit-tracker-backend

# 4. Status prüfen
sudo systemctl status habit-tracker-backend
```

**Lokal (Entwicklung):**
```bash
# Datenbank löschen
rm instance/habits.db

# Server neu starten (erstellt neue Datenbank)
python app.py
```

### Port-Konflikt beheben

Wenn der Port bereits belegt ist:

```bash
# 1. Prozess finden, der den Port blockiert
sudo netstat -tulpn | grep :5001

# 2. Prozess beenden (PID aus vorherigem Befehl)
sudo kill <PID>

# 3. Service neu starten
sudo systemctl restart habit-tracker-backend
```

### Backend-Logs anzeigen

```bash
# Letzte 50 Zeilen der Logs anzeigen
sudo journalctl -u habit-tracker-backend -n 50 --no-pager

# Logs live verfolgen
sudo journalctl -u habit-tracker-backend -f
```

## Deployment-Konfiguration

- **Lokale Entwicklung**: Port 5001
- **Produktions-Server**: Port 5001 (intern)
- **Nginx Proxy**: Port 8080 (öffentlich) → leitet `/api/*` an Backend weiter
- **Datenbank-Speicherort**: `instance/habits.db`
