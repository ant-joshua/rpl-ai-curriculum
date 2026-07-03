# Docker

> **Level:** Advanced  
> **Jam:** 3  
> **Prasyarat:** Node.js & Express

## Contoh Dockerfile

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
CMD ["node", "dist/index.js"]
```
