# IT Inventory Manager - Frontend

Angular-based frontend for the IT Inventory Management System.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure API endpoint in `src/environments/environment.ts`

3. Run development server:
```bash
npm start
```

The application will be available at `http://localhost:4200`

## Build

```bash
npm run build
```

Build artifacts will be stored in the `dist/` directory.

## Features

- Dashboard with inventory overview
- Equipment management (CRUD operations)
- Employee management
- Location tracking
- Chatbot interface for natural language queries
- Role-based access control (Admin, Gestionnaire, Collaborateur)

## Project Structure

```
src/
├── app/
│   ├── core/           # Core services (auth, API)
│   ├── shared/         # Shared components and utilities
│   ├── features/
│   │   ├── dashboard/
│   │   ├── equipment/
│   │   ├── employees/
│   │   ├── chatbot/
│   │   └── auth/
│   └── models/         # TypeScript interfaces
└── environments/       # Environment configs
```

## Note

To fully initialize this Angular project, run:
```bash
ng new it-inventory-frontend --routing --style=css
```

Then copy the component structures from this template.
