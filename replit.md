# GreenMart - Sustainable Product Marketplace

## Overview

GreenMart is a full-stack e-commerce marketplace focused on sustainable, eco-friendly, and ethically sourced products. The platform connects environmentally conscious consumers with verified sellers offering organic food, sustainable fashion, eco home goods, green beauty products, and more. Key differentiators include sustainability scoring for products, certification badges (Fair Trade, Organic, Vegan, Carbon Neutral), carbon-neutral shipping options, and a community-driven approach with eco challenges and educational content.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state caching and synchronization
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom theme configuration supporting light/dark modes
- **Build Tool**: Vite with React plugin and custom Replit plugins for development

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Design**: RESTful JSON API with `/api` prefix
- **Session Management**: Express-session with PostgreSQL session store (connect-pg-simple)
- **Authentication**: Replit OpenID Connect (OIDC) integration via Passport.js

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` contains all table definitions using Drizzle's pgTable
- **Migrations**: Drizzle Kit for schema migrations (`drizzle.config.ts`)
- **Key Entities**: Users, Products, Categories, Certifications, Reviews, Cart Items, Wishlist Items, Orders, Order Items

### Authentication & Authorization
- **Provider**: Replit Auth using OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions with 1-week TTL
- **Protected Routes**: Middleware-based authentication checks via `isAuthenticated`
- **User Sync**: Automatic user upsert on authentication with profile data from OIDC claims

### Payment Integration
- **Provider**: Stripe for payment processing
- **Frontend**: @stripe/react-stripe-js and @stripe/stripe-js
- **Backend**: Stripe Node.js SDK for payment intent creation and webhook handling

### Project Structure
```
├── client/           # React frontend application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route page components
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # Utilities and query client
├── server/           # Express backend
│   ├── index.ts      # Server entry point
│   ├── routes.ts     # API route definitions
│   ├── storage.ts    # Database access layer
│   ├── db.ts         # Database connection
│   └── replitAuth.ts # Authentication setup
├── shared/           # Shared code between client/server
│   └── schema.ts     # Drizzle database schema
└── migrations/       # Database migration files
```

### Key Design Patterns
- **Storage Interface**: `IStorage` interface in `storage.ts` abstracts all database operations
- **Path Aliases**: TypeScript path aliases (`@/`, `@shared/`) for clean imports
- **Shared Types**: Database types exported from schema used across client and server
- **Query Keys**: API endpoints used as query keys for automatic cache invalidation

## External Dependencies

### Database
- **PostgreSQL**: Primary database via `DATABASE_URL` environment variable
- **Neon Database**: Serverless PostgreSQL connector (@neondatabase/serverless)

### Authentication
- **Replit Auth**: OIDC-based authentication requiring `REPL_ID`, `ISSUER_URL`, and `SESSION_SECRET` environment variables

### Payment Processing
- **Stripe**: Requires `STRIPE_SECRET_KEY` (server) and `VITE_STRIPE_PUBLIC_KEY` (client) environment variables

### UI/Design System
- **Radix UI**: Headless component primitives for accessibility
- **Shadcn/ui**: Pre-built component library (new-york style variant)
- **Lucide React**: Icon library
- **Google Fonts**: Plus Jakarta Sans and Inter fonts

### Development Tools
- **Vite**: Development server with HMR
- **Replit Plugins**: Runtime error overlay, cartographer, dev banner
- **esbuild**: Production bundling for server code