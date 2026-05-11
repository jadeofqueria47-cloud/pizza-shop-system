# 🍕 Slice & Spice — Pizza Shop System

## Project Structure
```
pizza-project/
├── client/                    # Front-end
│   ├── assets/
│   │   ├── css/style.css
│   │   └── js/
│   │       ├── main.js        # UI logic
│   │       ├── api.js         # Fetch calls
│   │       └── utils.js       # Helpers
│   └── index.html
├── server/                    # Back-end
│   ├── config/db.js           # MySQL connection
│   ├── controllers/           # Request handlers
│   ├── models/                # DB queries
│   ├── routes/                # API endpoints
│   └── server.js
├── database/schema.sql        # MySQL setup
└── package.json
```

## Setup Steps

### 1. Install Node.js
Download from https://nodejs.org (choose LTS version)

### 2. Install MySQL
Download from https://dev.mysql.com/downloads/installer/

### 3. Setup the database
Open MySQL Workbench or MySQL shell and run:
```sql
source /path/to/pizza-project/database/schema.sql
```

### 4. Configure DB password
Open `server/config/db.js` and update:
```js
password: 'your_mysql_password',
```

### 5. Install dependencies
```bash
cd pizza-project
npm install
```

### 6. Run the server
```bash
npm run dev       # auto-restarts on file change
# OR
npm start
```

### 7. Open in browser
```
http://localhost:3000
```

## API Endpoints
| Method | URL | Description |
|--------|-----|-------------|
| POST | /api/customers/register | Register (US-01) |
| POST | /api/customers/login | Login (US-01) |
| GET  | /api/menu | Browse menu (US-02) |
| POST | /api/orders | Place order (US-03) |
| GET  | /api/orders?status=Pending | Cook view (US-04) |
| PATCH| /api/orders/:id/status | Update status (US-05) |
| POST | /api/orders/:id/pay | Confirm payment (US-06) |
| GET  | /api/orders/:id/receipt | Get receipt (US-07) |
| GET  | /api/reports/daily-report | Sales report (US-08) |
