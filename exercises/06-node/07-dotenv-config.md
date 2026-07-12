# Node.js — Exercise #7: Dotenv & Configuration

> **Level:** Beginner
> **Topics:** dotenv, environment variables, configuration management, .env file

## Instructions

Buat sistem konfigurasi aplikasi menggunakan `dotenv` dan environment variables.

1. Buat file `.env` dengan variabel-variabel konfigurasi.
2. Buat file `config.js` yang membaca dan mengekspor konfigurasi.
3. Buat fungsi `validateConfig()` yang memastikan konfigurasi penting ada.
4. Buat fungsi `getDatabaseUrl()` yang menggabungkan konfigurasi database.

## Starter Code

```javascript
// .env file (buat di folder yang sama)
// PORT=3000
// NODE_ENV=development
// DB_HOST=localhost
// DB_PORT=5432
// DB_NAME=rpl_ai
// DB_USER=postgres
// DB_PASSWORD=rahasia
// CORS_ORIGIN=http://localhost:5173
// JWT_SECRET=my-super-secret-key

// TODO: config.js
const dotenv = require('dotenv');
dotenv.config();

const config = {
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_NAME || 'rpl_ai',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || '',
};

function validateConfig() {
  // TODO: cek config penting (jwtSecret, db password)
  // Lempar error jika ada yang kosong
}

function getDatabaseUrl() {
  // TODO: return connection string
  // Format: postgresql://user:password@host:port/dbname
}

function isProduction() {
  // TODO: return true jika nodeEnv === 'production'
}

module.exports = { config, validateConfig, getDatabaseUrl, isProduction };

// Test
console.log('Config:', config);
console.log('DB URL:', getDatabaseUrl());
console.log('Is Production:', isProduction());
```

## Expected Output

```
Config: {
  port: 3000,
  nodeEnv: 'development',
  database: { host: 'localhost', port: 5432, name: 'rpl_ai', user: 'postgres', password: 'rahasia' },
  corsOrigin: 'http://localhost:5173',
  jwtSecret: 'my-super-secret-key'
}
DB URL: postgresql://postgres:rahasia@localhost:5432/rpl_ai
Is Production: false
```

## Test Cases

```javascript
console.log(config.port === 3000);                  // true
console.log(isProduction() === false);               // true
console.log(getDatabaseUrl().includes('postgresql')); // true
```
