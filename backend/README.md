# 🥤 Little Smoothie Order Management System

A full-stack order management system built with Nuxt 3, Vue 3, MongoDB, and Socket.IO for real-time updates.

## ✨ Features

- **Customer Interface**: Browse menu, build custom smoothie orders, track order status
- **Operator Dashboard**: Manage orders, start preparation, mark orders as ready
- **Real-time Updates**: Socket.IO integration for live order status updates
- **RESTful API**: Complete backend API for order and menu management
- **MongoDB Integration**: Persistent data storage with MongoDB
- **Redis Support**: Optional Redis adapter for Socket.IO horizontal scaling

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
# Create a .env file with your MongoDB connection string
# MONGO_URL=mongodb://localhost:27017/smoothie_db
# OR for MongoDB Atlas:
# MONGO_URL=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/smoothie_db

# 3. Seed the database
npm run seed

# 4. Start development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

**For detailed database seeding instructions, see [DATABASE_SEEDING.md](./DATABASE_SEEDING.md)**

## 📖 Documentation

- **[Setup Instructions](./SETUP_INSTRUCTIONS.md)** - Complete setup guide
- **[Database Seeding](./DATABASE_SEEDING.md)** - How to seed the database (for sharing with partners)
- **[Authentication](./AUTHENTICATION.md)** - Authentication system documentation
- **[Menu System](./MENU_SYSTEM.md)** - Menu management documentation

## 🏗️ Tech Stack

- **Frontend**: Nuxt 3, Vue 3, TypeScript
- **Backend**: Nuxt Server API, MongoDB
- **Real-time**: Socket.IO with Redis adapter
- **Database**: MongoDB 7.x
- **Caching**: Redis (optional)

## 📁 Project Structure

```
backend/
├── app/              # Root Vue application
├── assets/           # Global CSS and assets
├── composables/      # Vue composables (Socket.IO)
├── pages/            # Application pages/routes
│   ├── index.vue     # Home/role selection
│   ├── customer.vue  # Customer ordering interface
│   └── operator.vue  # Operator dashboard
├── server/
│   ├── api/          # REST API endpoints
│   ├── plugins/      # Server plugins (Socket.IO)
│   └── utils/        # Utilities (MongoDB connection)
├── public/           # Static files
└── .env             # Environment variables
```

## 🔧 Configuration

Create a `.env` file in the backend directory:

```env
MONGO_URL=mongodb://localhost:27017/smoothie_order_system
REDIS_URL=redis://localhost:6379
SOCKET_PORT=4001
NUXT_DEV_URL=http://localhost:3000
NODE_ENV=development
```

## 📡 API Endpoints

### Menu Management
- `GET /api/menu` - Get all menu items
- `POST /api/menu` - Add menu item
- `PUT /api/menu` - Update menu item
- `DELETE /api/menu` - Delete menu item

### Customer Operations
- `GET /api/customer/:customerId/draft-order` - Get draft order
- `PUT /api/customer/:customerId/draft-order` - Save draft order
- `POST /api/customer/:customerId/submit-draft-order` - Submit order

### Operator Operations
- `GET /api/operator/orders` - Get all queued orders
- `POST /api/operator/orders/:orderId/start` - Start order preparation
- `POST /api/operator/orders/:orderId/finish` - Complete order

## 🎯 Usage

### Customer Flow
1. Navigate to `/customer`
2. Select base, size, and fruits
3. Customize sweetness and ice levels
4. Submit order

### Operator Flow
1. Navigate to `/operator`
2. View queued orders
3. Start preparing an order
4. Mark as ready when complete

## 🧪 Testing

Test database connection:
```bash
curl http://localhost:3000/api/db-test
```

Test menu API:
```bash
curl http://localhost:3000/api/menu
```

### End-to-End Demo Order Flow

Install Playwright once and run the automated "demo customer submits an order" scenario:

```bash
npx playwright install
npm run test:e2e
```

Set `BASE_URL` (or `LB_BASE_URL`) if you launch the app on a non-default host. Example for the demo cluster:

```bash
set BASE_URL=http://127.0.0.1:8131
npm run test:e2e
```

## 🐛 Troubleshooting

See [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md#troubleshooting) for common issues and solutions.

## 🎛️ Load-Balanced Chat Demo

Want to capture logs from multiple backend replicas while chatting? Use the bundled demo runner:

```bash
# From the backend directory
npm run demo:cluster
```

The script will:

- Build the production bundle if needed.
- Start two Nitro servers (ports `8132` and `8133`) with their Socket.IO servers on `9132` and `9133`.
- Launch two lightweight Node load balancers that expose:
	- `http://127.0.0.1:8131` for regular web traffic.
	- `http://127.0.0.1:9131` for Socket.IO/WebSocket traffic.

Open two browser profiles or an incognito window and navigate to `http://127.0.0.1:8131`. Logs in the terminal are prefixed (`[api-1]`, `[api-2]`, `[lb-http]`, `[lb-socket]`) so you can show which replica handled each request or socket event. Press `Ctrl+C` to stop all processes.

## � Containerization & Kubernetes

```bash
# Build the production output and container image
npm ci
npm run build
docker build -t your-registry/smoothie-backend:latest .
docker push your-registry/smoothie-backend:latest

# Apply the Kubernetes stack via kustomize (edit k8s/base first)
kubectl apply -k ../k8s/base

# Seed Mongo once pods are ready
kubectl create job --from=job/smoothie-seed-database smoothie-seed-$(date +%s) -n smoothie
# (PowerShell) kubectl create job --from=job/smoothie-seed-database "smoothie-seed-$(Get-Date -UFormat %s)" -n smoothie
```

Update `k8s/base/app-configmap.yaml` with the public site URL, socket URL, and database connection strings that match your cluster. Replace `your-registry/smoothie-backend:latest` anywhere it appears with your published image (for example, `ghcr.io/<user>/smoothie-backend:latest`).

## �📝 Development

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Generate static site
npm run generate
```

## 🔒 Security Notes

- Never commit `.env` files
- Use strong MongoDB passwords
- Enable authentication in production
- Use SSL/TLS for MongoDB connections
- Whitelist IPs in MongoDB Atlas

## 📚 Learn More

- [Nuxt Documentation](https://nuxt.com/docs)
- [Vue Documentation](https://vuejs.org/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Socket.IO Documentation](https://socket.io/docs/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

---

Built with ❤️ using Nuxt 3, Vue 3, and MongoDB
