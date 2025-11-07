# 🚀 Quick Start - Deployment in 10 Minuten

Schnelle Anleitung, um die Habit Tracker App auf Ihrem Server zu deployen.

## Schritt 1: Server vorbereiten (5 Minuten)

### 1.1 Mit Server verbinden
```bash
ssh IHR_BENUTZER@IHR_SERVER_IP
```

### 1.2 Setup-Skript ausführen
```bash
curl -sSL https://raw.githubusercontent.com/steffen5567/Claude_Tempel/master/deploy/server-setup.sh | bash
```

**Wichtig:** Das Skript wird nach Ihrer GitHub Repository-URL fragen!
- Antwort: `https://github.com/steffen5567/Claude_Tempel.git`

### 1.3 SSH-Keys generieren
```bash
curl -sSL https://raw.githubusercontent.com/steffen5567/Claude_Tempel/master/deploy/setup-ssh-keys.sh | bash
```

Das Skript zeigt Ihnen alle Informationen, die Sie für Schritt 2 brauchen.

---

## Schritt 2: GitHub Secrets einrichten (3 Minuten)

### 2.1 GitHub öffnen
https://github.com/steffen5567/Claude_Tempel/settings/secrets/actions

### 2.2 Diese 4 Secrets hinzufügen:

Klicken Sie auf **"New repository secret"** für jedes Secret:

**1. SSH_PRIVATE_KEY**
- Kopieren Sie den kompletten privaten Key vom Server-Output
- Beginnt mit: `-----BEGIN OPENSSH PRIVATE KEY-----`
- Endet mit: `-----END OPENSSH PRIVATE KEY-----`

**2. SERVER_HOST**
- Ihre Server-IP, z.B.: `123.45.67.89`
- Oder Hostname, z.B.: `server.example.com`

**3. SERVER_USER**
- Ihr SSH-Benutzername, z.B.: `ubuntu` oder `root`

**4. DEPLOY_PATH**
- Genau so eingeben: `/var/www/habit-tracker-app`

---

## Schritt 3: Deployment testen (2 Minuten)

### 3.1 Workflow manuell auslösen

1. Gehen Sie zu: https://github.com/steffen5567/Claude_Tempel/actions
2. Klicken Sie auf **"Deploy to Server"**
3. Klicken Sie auf **"Run workflow"**
4. Warten Sie ca. 1-2 Minuten

### 3.2 App aufrufen

Öffnen Sie im Browser:
```
http://IHR_SERVER_IP
```

Sie sollten die Habit Tracker App sehen!

---

## ✅ Fertig!

Ab jetzt wird die App **automatisch deployed** bei jedem `git push` zu `master`!

### Nächste Schritte (Optional):

**Domain einrichten:**
```bash
# Auf dem Server
sudo nano /etc/nginx/sites-available/habit-tracker
# Ändern Sie: server_name _; → server_name ihre-domain.de;
sudo systemctl reload nginx
```

**HTTPS aktivieren:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d ihre-domain.de
```

---

## 🆘 Probleme?

### App läuft nicht?
```bash
# Auf dem Server
sudo systemctl status habit-tracker-backend
sudo systemctl status nginx
```

### Logs ansehen:
```bash
sudo journalctl -u habit-tracker-backend -f
sudo tail -f /var/log/nginx/error.log
```

### Mehr Hilfe:
Siehe: [deploy/DEPLOYMENT.md](DEPLOYMENT.md)

---

## 🎉 Das war's!

Ihre App läuft jetzt auf:
- **Frontend:** http://IHR_SERVER_IP
- **API:** http://IHR_SERVER_IP/api/habits

Bei jedem Push zu GitHub wird automatisch deployed! 🚀
