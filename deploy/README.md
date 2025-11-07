# Deployment Scripts

Dieses Verzeichnis enthält alle Skripte und Anleitungen für das Server-Deployment.

## 📄 Dateien

### QUICKSTART.md
**Schnelle 10-Minuten-Anleitung** für das erste Deployment.
- Für Eilige
- Minimale Erklärungen
- Direkt loslegen

👉 **Start hier wenn:** Sie schnell deployen wollen

---

### DEPLOYMENT.md
**Vollständige Dokumentation** mit allen Details.
- Ausführliche Erklärungen
- Troubleshooting
- Erweiterte Konfiguration (HTTPS, Domain, etc.)
- Monitoring & Wartung

👉 **Start hier wenn:** Sie alles verstehen wollen

---

### server-setup.sh
**Server-Installations-Skript** (läuft auf dem Server)

Was es macht:
- Installiert alle Dependencies (Python, Node.js, Nginx)
- Klont das Repository
- Konfiguriert Nginx
- Erstellt systemd Service
- Konfiguriert Firewall

**Verwendung:**
```bash
# Auf dem Server
wget https://raw.githubusercontent.com/steffen5567/Claude_Tempel/master/deploy/server-setup.sh
chmod +x server-setup.sh
./server-setup.sh
```

---

### setup-ssh-keys.sh
**SSH-Key-Generator** für GitHub Actions (läuft auf dem Server)

Was es macht:
- Generiert SSH-Key-Paar
- Fügt Public Key zu authorized_keys hinzu
- Zeigt Private Key für GitHub Secrets

**Verwendung:**
```bash
# Auf dem Server
wget https://raw.githubusercontent.com/steffen5567/Claude_Tempel/master/deploy/setup-ssh-keys.sh
chmod +x setup-ssh-keys.sh
./setup-ssh-keys.sh
```

---

## 🚀 Empfohlener Workflow

1. **Erstes Deployment:**
   - Folgen Sie [QUICKSTART.md](QUICKSTART.md)

2. **Verstehen was passiert:**
   - Lesen Sie [DEPLOYMENT.md](DEPLOYMENT.md)

3. **Probleme?**
   - Siehe Troubleshooting-Sektion in [DEPLOYMENT.md](DEPLOYMENT.md)

4. **Erweiterte Konfiguration:**
   - Domain & HTTPS siehe [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 🔐 Benötigte GitHub Secrets

Nach dem Setup müssen diese Secrets in GitHub eingerichtet werden:

| Secret | Beschreibung | Beispiel |
|--------|--------------|----------|
| `SSH_PRIVATE_KEY` | Privater SSH-Key | Wird von setup-ssh-keys.sh generiert |
| `SERVER_HOST` | Server IP/Hostname | `123.45.67.89` |
| `SERVER_USER` | SSH Benutzername | `ubuntu` |
| `DEPLOY_PATH` | Deployment-Pfad | `/var/www/habit-tracker-app` |

Einrichten unter:
https://github.com/steffen5567/Claude_Tempel/settings/secrets/actions

---

## 📦 Was wird deployed?

```
/var/www/habit-tracker-app/    # Haupt-Verzeichnis
├── backend/                    # Flask Backend
│   ├── venv/                   # Python Virtual Environment
│   ├── app.py                  # Haupt-App
│   └── habits.db               # SQLite Datenbank
├── frontend/                   # React Frontend
│   ├── dist/                   # Build-Output
│   └── node_modules/           # Dependencies
└── .git/                       # Git Repository

/var/www/habit-tracker/         # Nginx Web-Root
└── (Frontend Build Files)      # Kopiert von frontend/dist/
```

---

## 🔄 Automatisches Deployment

GitHub Actions Workflow: `.github/workflows/deploy.yml`

**Trigger:**
- Push zu `master` branch
- Manuell via GitHub Actions UI

**Schritte:**
1. Code pullen
2. Backend Dependencies installieren
3. Backend Service neu starten
4. Frontend bauen
5. Build-Files zu Nginx kopieren
6. Nginx neu starten

---

## 🛠️ System-Services

### Backend Service
```bash
sudo systemctl status habit-tracker-backend
sudo systemctl restart habit-tracker-backend
sudo journalctl -u habit-tracker-backend -f
```

### Nginx
```bash
sudo systemctl status nginx
sudo systemctl restart nginx
sudo nginx -t  # Config testen
```

---

## 📊 Monitoring

### Logs
```bash
# Backend
sudo journalctl -u habit-tracker-backend -f

# Nginx Access
sudo tail -f /var/log/nginx/access.log

# Nginx Errors
sudo tail -f /var/log/nginx/error.log
```

### Status prüfen
```bash
# API Health Check
curl http://localhost:5000/api/health

# Frontend
curl http://localhost
```

---

## 🆘 Support

Bei Problemen:
1. Prüfen Sie die Logs (siehe oben)
2. Siehe Troubleshooting in [DEPLOYMENT.md](DEPLOYMENT.md)
3. Öffnen Sie ein GitHub Issue

---

**Viel Erfolg beim Deployment! 🚀**
