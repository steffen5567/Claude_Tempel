# Datenbank-Migrationen

Diese App verwendet **Flask-Migrate** (Alembic) für sichere Datenbank-Schema-Änderungen.

## ⚠️ Warum Migrationen?

Ohne Migrationen:
- Schema-Änderungen überschreiben die Datenbank
- **Alle Daten gehen verloren!**

Mit Migrationen:
- Schema wird sicher aktualisiert
- **Daten bleiben erhalten** ✅

---

## 🚀 Migrationen einrichten (nur einmal)

Auf dem Server ausführen:

```bash
cd /var/www/habit-tracker-app/backend
source venv/bin/activate

# Migrations-Ordner initialisieren
flask db init

# Erste Migration erstellen (aktuelles Schema)
flask db migrate -m "Initial migration"

# Migration anwenden
flask db upgrade
```

---

## 📝 Schema-Änderungen in Zukunft

### Schritt 1: Model ändern

Ändere die Models in `app.py`, z.B.:

```python
class Habit(db.Model):
    # ... bestehende Felder ...
    new_field = db.Column(db.String(100), default='default_value')  # NEU
```

### Schritt 2: Migration erstellen (Lokal)

```bash
cd backend
source venv/bin/activate  # Linux/Mac
# oder
venv\Scripts\activate  # Windows

flask db migrate -m "Add new_field to Habit"
```

Dies erstellt eine Migrations-Datei in `migrations/versions/`

### Schritt 3: Code committen & pushen

```bash
git add backend/app.py backend/migrations/
git commit -m "Add new_field to Habit model"
git push
```

### Schritt 4: Automatisches Deployment

Der Deployment-Workflow führt automatisch aus:
```bash
flask db upgrade  # Wendet Migrationen an
```

Die Daten bleiben erhalten! ✅

---

## 🛠️ Nützliche Befehle

### Migration manuell auf Server anwenden

```bash
cd /var/www/habit-tracker-app/backend
source venv/bin/activate
flask db upgrade
sudo systemctl restart habit-tracker-backend
```

### Migration rückgängig machen

```bash
flask db downgrade  # Eine Migration zurück
```

### Migrations-Status checken

```bash
flask db current   # Aktuelle Migration
flask db history   # Alle Migrationen
```

### Neue Migration erstellen

```bash
flask db migrate -m "Beschreibung der Änderung"
```

---

## 📋 Workflow-Zusammenfassung

1. **Model ändern** in `app.py`
2. **Migration erstellen**: `flask db migrate -m "beschreibung"`
3. **Migration reviewen** in `migrations/versions/xxx.py`
4. **Committen & pushen**
5. **Deployment triggern** → Migration läuft automatisch

---

## ⚠️ Best Practices

✅ **DO:**
- Immer Migrationen erstellen bei Schema-Änderungen
- Migrations-Dateien mit committen
- Migrations-Beschreibungen klar formulieren
- Migrations vor Deployment testen

❌ **DON'T:**
- `db.create_all()` in Production verwenden
- Migrations-Ordner löschen
- Mehrere Schema-Änderungen ohne Migration
- Datenbank manuell ändern

---

## 🔧 Troubleshooting

### "No such file or directory: migrations"

Migrations noch nicht initialisiert:
```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

### "Can't locate revision identified by 'xxx'"

Migrations-Ordner mit Server synchronisieren:
```bash
git pull
flask db upgrade
```

### Datenbank ist kaputt

Letzter Ausweg (⚠️ LÖSCHT DATEN):
```bash
rm habits.db
rm -rf migrations/
flask db init
flask db migrate -m "Fresh start"
flask db upgrade
```

---

## 📚 Weitere Infos

- [Flask-Migrate Docs](https://flask-migrate.readthedocs.io/)
- [Alembic Tutorial](https://alembic.sqlalchemy.org/en/latest/tutorial.html)
