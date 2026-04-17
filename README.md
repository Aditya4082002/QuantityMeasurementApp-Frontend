# QMA React - Quantity Measurement Application

A modern React application for quantity measurement calculations with support for length, weight, volume, and temperature conversions.

## 🚀 Features

- ✅ User authentication (Login/Signup) with Google OAuth
- 🔢 Measurement operations: Add, Subtract, Divide, Compare, Convert
- 📏 Multiple measurement types: Length, Weight, Volume, Temperature
- 📊 Operation history tracking
- 🌓 Dark/Light theme toggle
- 📱 Responsive design
- 🔒 Protected routes with authentication

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Backend API** running on `http://localhost:8765`

## 🛠️ Installation Steps

### Step 1: Navigate to the Project Directory

```bash
cd qma-react
```

### Step 2: Install Dependencies

```bash
npm install
```

Or if you prefer yarn:

```bash
yarn install
```

### Step 3: Configure Backend URL (Optional)

If your backend is running on a different port or URL, update the `BASE_URL` in:
- `src/services/api.js`

```javascript
const BASE_URL = 'http://localhost:8765'; // Change this if needed
```

## 🏃 Running the Application

### Development Mode

Start the development server:

```bash
npm run dev
```

Or with yarn:

```bash
yarn dev
```

The application will open automatically in your browser at `http://localhost:3000`

### Production Build

To create an optimized production build:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## 📁 Project Structure

```
qma-react/
├── index.html                 # HTML entry point
├── package.json              # Dependencies and scripts
├── vite.config.js           # Vite configuration
├── src/
│   ├── main.jsx             # React entry point
│   ├── App.jsx              # Main App component with routing
│   ├── components/          # Reusable components
│   │   ├── Calculator.jsx   # Measurement calculator
│   │   ├── History.jsx      # Operation history view
│   │   ├── Toast.jsx        # Notification component
│   │   └── ProtectedRoute.jsx # Route protection
│   ├── pages/               # Page components
│   │   ├── Login.jsx        # Login page
│   │   ├── Signup.jsx       # Signup page
│   │   └── Dashboard.jsx    # Main dashboard
│   ├── contexts/            # React contexts
│   │   ├── AuthContext.jsx  # Authentication state
│   │   └── ThemeContext.jsx # Theme state
│   ├── services/            # API services
│   │   └── api.js           # API client and services
│   └── styles/              # CSS files
│       ├── global.css       # Global styles
│       ├── dashboard.css    # Dashboard styles
│       ├── auth.css         # Auth page styles
│       └── toast.css        # Toast notification styles
```

## 🎯 Usage

### 1. Login/Signup
- Navigate to `http://localhost:3000`
- Login with existing credentials or create a new account
- Or use Google OAuth for quick login

### 2. Perform Calculations
- Select an operation (Add, Subtract, Divide, Compare, Convert)
- Choose a measurement category (Length, Weight, Volume, Temperature)
- Enter values and units
- Click "Calculate" to see results

### 3. View History
- Click on "History" in the sidebar
- Filter by operation type
- View all past calculations

### 4. Theme Toggle
- Click the sun/moon icon in the header to switch between light and dark modes

## 🔑 Key Components

### Authentication
- **Login**: User login with username/password or Google OAuth
- **Signup**: New user registration
- **Protected Routes**: Automatically redirects to login if not authenticated

### Calculator
- Supports 5 operations: ADD, SUBTRACT, DIVIDE, COMPARE, CONVERT
- 4 measurement categories: LENGTH, WEIGHT, VOLUME, TEMPERATURE
- Real-time validation and error handling
- Temperature restrictions (only Compare and Convert allowed)

### History
- Displays past calculations filtered by operation
- Shows timestamp, inputs, and results
- Persists across sessions via backend

## 🎨 Theming

The app supports both light and dark themes:
- Theme preference is stored in localStorage
- Smooth transitions between themes
- All components adapt to the current theme

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## 🌐 API Endpoints Used

The application connects to the following backend endpoints:

### Authentication
- `POST /auth-service/auth/login` - User login
- `POST /auth-service/auth/signup` - User registration
- `GET /auth-service/oauth2/authorization/google` - Google OAuth
- `GET /auth-service/auth/oauth-success` - OAuth callback

### Measurements
- `POST /quantity-service/api/v1/quantity/calculate` - Perform calculation
- `GET /quantity-service/api/v1/quantity/history/{operation}` - Get operation history

## 🐛 Troubleshooting

### Port Already in Use
If port 3000 is already in use, Vite will automatically use the next available port (3001, 3002, etc.)

### Backend Connection Issues
- Ensure your backend is running on `http://localhost:8765`
- Check CORS settings on your backend
- Verify API endpoints are accessible

### Module Not Found Errors
Run:
```bash
npm install
```

### Build Errors
Clear cache and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📦 Dependencies

### Main Dependencies
- **react** (^18.2.0) - UI library
- **react-dom** (^18.2.0) - React DOM rendering
- **react-router-dom** (^6.20.0) - Routing
- **axios** (^1.6.2) - HTTP client

### Dev Dependencies
- **vite** (^5.0.8) - Build tool
- **@vitejs/plugin-react** (^4.2.1) - React plugin for Vite

## 🔐 Security Notes

- User tokens are stored in sessionStorage (cleared on browser close)
- All API requests include Bearer token authentication
- Protected routes prevent unauthorized access
- Passwords are sent securely to backend (ensure backend uses HTTPS in production)

## 📝 Environment Variables

Create a `.env` file in the root directory if you need to customize settings:

```env
VITE_API_BASE_URL=http://localhost:8765
```

Then update `src/services/api.js`:
```javascript
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8765';
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

---

**Enjoy using QMA React! 🎉**
