# Deploy ke VPS (Biznet / DigitalOcean)

```bash
# SSH
ssh root@ip-server

# Install
apt update && apt install -y docker docker-compose nginx certbot

# Clone repo
cd /var/www && git clone https://github.com/namamu/project.git && cd project

# Run
cp .env.example .env  # isi env
npm install && npm run build && npm start

# Nginx reverse proxy
server {
    listen 80;
    server_name mydomain.com;
    location / { proxy_pass http://localhost:3000; }
}

# SSL
certbot --nginx -d mydomain.com
```
