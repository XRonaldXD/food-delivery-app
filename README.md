"# food-delivery-app

A full-stack food delivery MVP built with **Node/Express + TypeScript** (backend) and **Expo React Native + TypeScript** (mobile).

---

## Project Structure

```
food-delivery-app/
├── server/          # Node/Express API
└── mobile/          # Expo React Native app
```

---

## Backend (`server/`)

### Stack
- Node.js + Express
- TypeScript
- JWT authentication (`jsonwebtoken`)
- bcrypt password hashing
- In-memory data store (swap arrays in `src/data/store.ts` with DB calls)

### Setup

```bash
cd server
npm install
npm run dev        # development with hot-reload
# or
npm run build && npm start   # production
```

Runs on **port 3000** by default. Set `PORT` env var to override.  
Set `JWT_SECRET` env var for production (defaults to `food-delivery-dev-secret`).

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | — | Register `{email, password, role, name?}` → `{token, user}` |
| POST | `/auth/login` | — | Login `{email, password}` → `{token, user}` |
| GET | `/restaurants` | Bearer | List restaurants |
| GET | `/restaurants/:id/menu` | Bearer | Restaurant + menu items |
| POST | `/orders` | Customer | Create order |
| GET | `/orders/mine` | Bearer | Customer's orders / Driver's accepted orders |
| GET | `/orders/available` | Driver | Orders with status `placed` and no driver |
| POST | `/orders/:id/accept` | Driver | Accept an order |
| POST | `/orders/:id/status` | Bearer | Update status (`picked_up`/`delivered` for driver; `cancelled` for customer) |
| GET | `/orders/:id` | Bearer | Get single order |
| GET | `/health` | — | Health check |

**Roles:** `customer` | `driver`

---

## Mobile App (`mobile/`)

### Stack
- Expo (SDK 54) + React Native
- TypeScript
- React Navigation (bottom tabs + native stack)
- expo-secure-store (JWT storage)

### Setup

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with **Expo Go** on your device, or run on a simulator.

> **Configure API URL:** By default the app connects to `http://localhost:3000`.  
> To use a physical device, create `mobile/.env` with:
> ```
> EXPO_PUBLIC_API_URL=http://<your-lan-ip>:3000
> ```

### Customer Flows
1. Register / Login as **customer**
2. Browse restaurant list
3. Tap a restaurant → view menu → add items to cart
4. Checkout → enter delivery address → place order
5. View order history and details, cancel if needed

### Driver Flows
1. Register / Login as **driver**
2. Browse available orders → accept one
3. View accepted deliveries → mark as **Picked Up** → **Delivered**
" 
