# Deployment Guide - Habit Tracker App

Komplette Anleitung für das Deployment der Habit Tracker App auf einem Ubuntu/Debian Server mit automatischem GitHub Actions Deployment.

## 📋 Übersicht

Nach dem Setup:
- **Automatisches Deployment** bei jedem Push zu `master`
- Backend läuft als systemd Service
- Frontend wird von Nginx ausgeliefert
- API-Anfragen werden von Nginx zu Backend weitergeleitet

---

## 🚀 Einmaliges Server-Setup

### Voraussetzungen
- Ubuntu/Debian Server
- SSH-Zugang zum Server
- Git installiert

### Schritt 1: Auf den Server verbinden

```bash
ssh IHR_BENUTZER@IHR_SERVER_IP
```

### Schritt 2: Setup-Skript herunterladen und ausführen

```bash
# Skript herunterladen
wget https://raw.githubusercontent.com/steffen5567/Claude_Tempel/master/deploy/server-setup.sh

# Ausführbar machen
chmod +x server-setup.sh

# Ausführen
./server-setup.sh
```

Das Skript wird:
- System-Pakete aktualisieren
- Python, Node.js, Nginx installieren
- Repository klonen
- Virtual Environment erstellen
- Frontend bauen
- Nginx konfigurieren
- Systemd Service für Backend erstellen
- Firewall konfigurieren

### Schritt 3: SSH-Keys für GitHub Actions generieren

Noch auf dem Server:

```bash
# Skript herunterladen
wget https://raw.githubusercontent.com/steffen5567/Claude_Tempel/master/deploy/setup-ssh-keys.sh

# Ausführbar machen
chmod +x setup-ssh-keys.sh

# Ausführen
./setup-ssh-keys.sh
```

Das Skript zeigt Ihnen alle notwendigen Informationen für GitHub Secrets an.

---

## 🔐 GitHub Secrets einrichten

Gehen Sie zu: https://github.com/steffen5567/Claude_Tempel/settings/secrets/actions

Fügen Sie folgende Secrets hinzu:

| Secret Name | Wert | Beschreibung |
|------------|------|--------------|
| `SSH_PRIVATE_KEY` | Inhalt von `~/.ssh/github-actions` | Privater SSH-Key (wird vom Skript angezeigt) |
| `SERVER_HOST` | z.B. `123.45.67.89` | IP-Adresse oder Hostname Ihres Servers |
| `SERVER_USER` | z.B. `ubuntu` oder Ihr Benutzername | SSH-Benutzername |
| `DEPLOY_PATH` | `/var/www/habit-tracker-app` | Pfad zum Deployment-Verzeichnis |

### So fügen Sie ein Secret hinzu:
1. Klicken Sie auf "New repository secret"
2. Geben Sie den Namen ein (z.B. `SSH_PRIVATE_KEY`)
3. Fügen Sie den Wert ein
4. Klicken Sie auf "Add secret"

---

## 🧪 Deployment testen

### Automatisches Deployment auslösen

```bash
# Lokale Änderung machen
echo "# Test" >> README.md
git add README.md
git commit -m "Test deployment"
git push
```

Gehen Sie zu: https://github.com/steffen5567/Claude_Tempel/actions

Sie sollten den Workflow "Deploy to Server" sehen, der ausgeführt wird.

### Manuelles Deployment auslösen

1. Gehen Sie zu: https://github.com/steffen5567/Claude_Tempel/actions
2. Klicken Sie auf "Deploy to Server"
3. Klicken Sie auf "Run workflow"

---

## 🔍 Troubleshooting

### Backend läuft nicht?

```bash
# Status prüfen
sudo systemctl status habit-tracker-backend

# Logs ansehen
sudo journalctl -u habit-tracker-backend -f

# Neu starten
sudo systemctl restart habit-tracker-backend
```

### Nginx-Probleme?

```bash
# Status prüfen
sudo systemctl status nginx

# Konfiguration testen
sudo nginx -t

# Logs ansehen
sudo tail -f /var/log/nginx/error.log

# Neu starten
sudo systemctl restart nginx
```

### Verbindungsprobleme?

```bash
# Prüfen ob Backend läuft
curl http://localhost:5000/api/health

# Prüfen ob Nginx läuft
curl http://localhost

# Firewall-Status
sudo ufw status

# Offene Ports prüfen
sudo netstat -tulpn | grep LISTEN
```

### GitHub Actions schlägt fehl?

Häufige Probleme:
1. **SSH-Key falsch**: Überprüfen Sie, ob der komplette Key in GitHub Secrets ist
2. **Server-Berechtigung**: Stellen Sie sicher, dass der User sudo ohne Passwort ausführen kann
3. **Git-Konflikte**: Manuell auf Server gehen und `git status` prüfen

---

## 🔧 Server-Befehle

### Deployment-Verzeichnis
```bash
cd /var/www/habit-tracker-app
```

### Git-Status prüfen
```bash
git status
git log -1
```

### Manuelles Deployment
```bash
cd /var/www/habit-tracker-app
git pull origin master

# Backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart habit-tracker-backend

# Frontend
cd ../frontend
npm install
npm run build
sudo rm -rf /var/www/habit-tracker/*
sudo cp -r dist/* /var/www/habit-tracker/
sudo systemctl restart nginx
```

---

## 🌐 Domain & HTTPS (Optional)

### Domain einrichten

1. Ersetzen Sie in `/etc/nginx/sites-available/habit-tracker` die Zeile:
   ```nginx
   server_name _;
   ```
   mit:
   ```nginx
   server_name ihre-domain.de www.ihre-domain.de;
   ```

2. Nginx neu laden:
   ```bash
   sudo systemctl reload nginx
   ```

### SSL/HTTPS mit Let's Encrypt

```bash
# Certbot installieren
sudo apt install certbot python3-certbot-nginx

# Zertifikat erstellen
sudo certbot --nginx -d ihre-domain.de -d www.ihre-domain.de

# Auto-Renewal testen
sudo certbot renew --dry-run
```

---

## 📊 Monitoring

### Logs in Echtzeit verfolgen

```bash
# Backend
sudo journalctl -u habit-tracker-backend -f

# Nginx Access
sudo tail -f /var/log/nginx/access.log

# Nginx Errors
sudo tail -f /var/log/nginx/error.log
```

### Ressourcen-Nutzung

```bash
# CPU & RAM
htop

# Festplatte
df -h

# Service-Status
systemctl status habit-tracker-backend nginx
```

---

## 🔄 Updates & Wartung

### Manuelle Aktualisierung

```bash
cd /var/www/habit-tracker-app
git pull
# Dann normale Deployment-Schritte
```

### System-Updates

```bash
sudo apt update
sudo apt upgrade -y
sudo reboot  # wenn nötig
```

---

## 📝 Architektur-Übersicht

```
Internet
    ↓
Nginx (Port 80/443)
    ├─→ / (Frontend Static Files)
    └─→ /api/* → Flask Backend (Port 5000)
                      ↓
                  SQLite DB
```

**Services:**
- `nginx` - Webserver
- `habit-tracker-backend` - Flask API

**Wichtige Pfade:**
- Frontend: `/var/www/habit-tracker/`
- Backend: `/var/www/habit-tracker-app/backend/`
- Logs: `/var/log/nginx/` und `journalctl -u habit-tracker-backend`
- Nginx Config: `/etc/nginx/sites-available/habit-tracker`

---

## ✅ Checkliste

Nach dem Setup sollten folgende Dinge funktionieren:

- [ ] Server ist via SSH erreichbar
- [ ] Backend Service läuft: `systemctl status habit-tracker-backend`
- [ ] Nginx läuft: `systemctl status nginx`
- [ ] API antwortet: `curl http://localhost:5000/api/health`
- [ ] Frontend ist erreichbar: `curl http://SERVER_IP`
- [ ] GitHub Secrets sind konfiguriert
- [ ] Test-Deployment erfolgreich
- [ ] App ist im Browser erreichbar

---

Bei Fragen oder Problemen, überprüfen Sie die Logs oder erstellen Sie ein GitHub Issue!
