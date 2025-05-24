# Oak Structures Website - Project Overview

This document provides a comprehensive overview of the Oak Structures website project, including its architecture, development plans, current status, and guidelines for future work. This document is intended to serve as a complete reference for developers and AI assistants working on the project.

## Table of Contents

1. [Project Architecture and Technology Stack](#1-project-architecture-and-technology-stack)
2. [Development Plan](#2-development-plan)
3. [Current Development Status](#3-current-development-status) 
4. [Guidelines for Future Development](#4-guidelines-for-future-development)
5. [Common Issues and Troubleshooting](#5-common-issues-and-troubleshooting)
6. [Project Structure](#6-project-structure)
7. [Firebase Configuration](#7-firebase-configuration)
8. [Local Development Setup](#8-local-development-setup)

## Current Development Status (Updated May 13, 2025)

### Recent Progress Summary

As of May 13, 2025, significant progress has been made in stabilizing the Oak Structures website architecture. Key achievements include:

- **React Query Implementation**: Firebase hooks for Firestore documents and collections have been created and properly integrated with the React Query provider.
- **Service Layer Development**: Firebase services and domain services have been implemented with proper error handling, transaction support, and retry logic.
- **Admin Component Refactoring**: Several admin components have been successfully refactored to use the React Query hooks and service layer.
- **Product Configuration Refactoring**: Two key product configuration pages (oak-beams and gazebos) have been successfully refactored to use React Query and proper service integration, significantly improving stability.
- **Development Environment**: Turbopack has been removed to improve stability, and the development workflow has been streamlined.

### Next Steps Plan

Based on the current state of the project, the following specific tasks should be prioritized:

1. **Complete React Query Implementation**
   - Refactor product configuration pages to use React Query hooks
   - Replace direct Firebase access in remaining components
   - Focus on high-priority components in the admin dashboard first

2. **Fix Server/Client Boundary Issues**
   - Continue identifying direct Firebase usage in server components
   - Refactor server-side Firebase usage to use API routes
   - Add "use client" directive consistently to components using client-side APIs

3. **Implement Firebase Service Layer**
   - Complete integration of existing service layer throughout the application
   - Focus on replacing direct Firebase access with service calls
   - Ensure consistent error handling across all operations

4. **Improve Admin Dashboard Reliability**
   - Apply React Query and service layer refactoring to remaining admin components
   - Implement proper loading and error states in all components
   - Use Firestore transactions for related data updates to ensure consistency

5. **Standardize Error Handling**
   - Use the existing ErrorBoundary component consistently
   - Implement retry logic for intermittent connection issues
   - Provide clear error messages to users

### Implementation Status

#### React Query Implementation
- ✅ React Query provider configured with appropriate default settings
- ✅ useFirestoreDocument hook implemented with both single-fetch and real-time options
- ✅ useFirestoreCollection hook implemented with pagination and filtering support
- ✅ Enhanced error handling and retry logic through custom wrappers
- ✅ Successfully applied to product configurations (oak-beams, gazebos)
- ✅ Image loading refactored to use ProductImagesService with React Query
- ⏳ Several other components still need refactoring to use these hooks

#### Service Layer Implementation
- ✅ Firebase service abstraction completed with comprehensive error handling
- ✅ Domain services created for business logic and data consistency
- ✅ Transaction support implemented for related updates
- ⏳ Component integration with service layer is partially complete

#### Component Refactoring Status
- ✅ Admin settings components have been refactored with React Query
- ✅ Oak beams product configuration page refactored to use React Query and service layer
- ✅ Gazebos product configuration page refactored to use React Query and ProductImagesService
- ⏳ Other product configuration pages still need refactoring
- ⏳ Several admin dashboard features remain unstable and need refactoring

With two product configuration pages now successfully refactored (oak-beams and gazebos), we've established a clear pattern for modernizing our components. Key learnings include:

1. Using ErrorBoundary wrappers consistently improves error recovery
2. Replacing direct Firebase access with service layers simplifies testing and maintenance
3. React Query provides superior caching and loading states compared to direct useState/useEffect patterns
4. Proper loading indicators and error states significantly improve user experience
5. Image loading operations benefit from service layer abstraction and fallback strategies

We should continue applying these patterns to the remaining product configuration pages, followed by admin dashboard components. This incremental approach is proving successful and building our confidence in the architecture.

## 1. Project Architecture and Technology Stack

### Core Technologies

- **Frontend Framework**: Next.js 15.3.2
- **UI Framework**: React 18.3.1 with TypeScript
- **Styling**: Tailwind CSS 3.4.1 with custom components
- **Backend**: Firebase services with local emulators for development
- **Authentication**: Firebase Authentication
- **Database**: Firestore
- **Storage**: Firebase Storage
- **Deployment**: Firebase Hosting

### Key Dependencies

- **UI Component Library**: Custom components using Radix UI primitives
- **Forms**: react-hook-form (7.54.2) with zod (3.24.2) validation
- **Data Fetching**: TanStack Query (React Query) for data fetching and caching
- **Icons**: Lucide React (0.475.0)
- **Date Handling**: date-fns (3.6.0)
- **Charts**: Recharts (2.15.1)
- **AI Integration**: genkit (1.6.2)

### Architecture Overview

The Oak Structures website follows a client-side architecture with Firebase integration:

1. **Next.js Application**: Serves as the primary frontend framework, handling routing and page rendering.
2. **Firebase Services**: Provides backend functionality including:
   - **Authentication**: User management and login
   - **Firestore**: NoSQL database for storing product, order, and user information
   - **Storage**: File storage for product images and documents
3. **Server Components/Actions**: Next.js server components and server actions for server-side logic

### Current Implementation Approach

The current implementation has several architectural issues:

1. **Firebase Integration**:
   - Direct Firebase access in server components/actions creating server/client boundary issues
   - Manual data fetching without proper caching or error handling
   - No consistent service layer for Firebase operations

2. **State Management**:
   - Relies on local component state (`useState`/`useEffect`) for data fetching
   - No global state management solution for shared data
   - No proper caching strategy for Firebase data

3. **Development Environment**:
   - Heavy reliance on Firebase emulators for all development
   - Turbopack usage causing instability issues
   - Limited separation between development and production environments

## 2. Development Plan

The development plan focuses on improving the stability, reliability, and maintainability of the Oak Structures website. The plan is divided into the following major areas:

### 1. Data Fetching and State Management

- **Implement React Query**: Add React Query for Firebase data fetching to provide proper caching, loading states, and error handling
- **Create Custom Hooks**: Develop reusable Firebase hooks to encapsulate data fetching logic
- **Optimistic Updates**: Implement optimistic updates for form submissions to improve perceived performance

### 2. Firebase and Next.js Integration

- **Client/Server Boundary Fixes**: Properly separate client and server code to avoid SSR issues
- **API Routes**: Replace direct Firebase calls in server actions with proper API routes
- **Remove Turbopack**: Use standard Next.js development server until Turbopack is more stable

### 3. Service Layer Implementation

- **Firebase Service Modules**: Create dedicated service modules for Firebase operations
- **Error Handling**: Implement robust error handling across all Firebase interactions
- **Retry Logic**: Add retry mechanisms for intermittent connection issues with emulators

### 4. Development Environment Improvements

- **TypeScript Validation**: Enforce stricter TypeScript checking
- **Testing Setup**: Implement testing for critical paths, especially admin functions
- **Development Workflow**: Create a more reliable local development workflow

### 5. Admin Dashboard Reliability

- **Data Model Optimization**: Improve Firestore data models for better performance
- **UI State Handling**: Add proper loading and error states to all admin components
- **Transaction-Based Updates**: Use Firestore transactions for related updates

## 3. Current Development Status

### Completed

- Basic website structure and navigation
- Product catalog display and search functionality
- User authentication flows
- Basic admin dashboard interfaces
- Firebase emulator integration for local development
- Shopping cart functionality

### In Progress

- **Implementation of React Query for data fetching (STARTED)**
  - ✅ React Query provider set up
  - ✅ Custom hooks for Firestore documents created
  - ✅ Custom hooks for Firestore collections created
  - ⏳ Refactoring components to use React Query hooks
  
- **Creation of Firebase service layers (STARTED)**
  - ✅ Authentication service created with error handling and retry logic
  - ✅ Firestore service created with CRUD operations and transaction support
  - ✅ Storage service created with upload/download functionality
  - ✅ Domain services created for business logic and data consistency
  - ⏳ Integration of services with components
  
- **Fixing server/client boundary issues (STARTED)**
  - ✅ Refactored contact form server action to use API route
  - ✅ Refactored custom order form server action to use API route
  - ✅ Created API routes for settings and payment configuration
  - ⏳ Identifying and refactoring remaining server-side Firebase usage
  
- **Development environment optimization (STARTED)**
  - ✅ Removed Turbopack for better stability
  - ⏳ Additional development environment improvements

- **Admin dashboard reliability improvements (STARTED)**
  - ✅ Started refactoring admin dashboard components to use React Query
  - ✅ Added domain service for settings with proper error handling
  - ✅ Implemented proper loading and error states in admin components
  - ✅ Refactored payment settings page with better UX and error handling
  - ⏳ Continuing to refactor remaining admin components
  
- **Comprehensive error handling implementation (STARTED)**
  - ✅ Created ErrorBoundary component for catching and displaying errors
  - ✅ Developed error handling utilities with retry logic
  - ✅ Implemented enhanced React Query hooks with better error handling
  - ✅ Created example component showcasing best practices
  - ⏳ Rolling out error handling across all components
  
- **Firestore data model optimization (STARTED)**
  - ✅ Created domain service with transaction-based updates
  - ✅ Implemented related data consistency with transactions
  - ✅ Added batch operations for bulk updates
  - ⏳ Reviewing and optimizing existing data models

### Pending

- Comprehensive error handling implementation
- Development environment optimization
- End-to-end testing setup
- Performance optimizations
- Advanced analytics integration

### Known Issues

1. Admin dashboard functions are unreliable, with many features not working correctly
2. Product configuration experiences stability issues
3. Data fetching has performance and caching problems
4. Development environment with Turbopack is unstable

## 4. Guidelines for Future Development

### Code Organization

All new code should follow these organizational principles:

1. **Component Structure**:
   - UI components in `src/components/` 
   - Page components in `src/app/`
   - Hooks in `src/hooks/`
   - Firebase services in `src/services/`
   - Utility functions in `src/utils/`

2. **State Management**:
   - Use React Query for server state
   - Use React context for global UI state
   - Keep component state local where appropriate

3. **Type Safety**:
   - Maintain strict TypeScript typing for all components and functions
   - Use Zod for runtime validation of data

### Firebase Best Practices

1. **Data Access**:
   - Never access Firebase directly from components; use hooks and services
   - Follow the repository pattern for data access
   - Implement proper error handling for all Firebase operations

2. **Security**:
   - Keep sensitive information out of client-side code
   - Follow the principle of least privilege in Firestore rules
   - Use Firebase Authentication for all user-specific operations

3. **Performance**:
   - Use query limits and pagination for large data sets
   - Implement proper indexes for frequently queried fields
   - Use caching strategies to minimize unnecessary reads

### Development Workflow

1. **Local Development**:
   - Start Firebase emulators with `npm run emulators:data`
   - Run the Next.js development server with `npm run dev` (without Turbopack)
   - Use the emulator UI at http://localhost:4000 for inspecting data

2. **Testing**:
   - Write tests for critical functionality
   - Test across different user roles (admin, customer)
   - Ensure error cases are properly handled

## 5. Common Issues and Troubleshooting

### Firebase Emulator Issues

1. **Emulators Won't Start**:
   - Check if ports are already in use
   - Ensure Firebase CLI is properly installed
   - Try running `firebase emulators:start` directly for detailed error messages

2. **Authentication Problems**:
   - For local development, use test accounts
   - Emulator Auth doesn't require real email verification
   - Create test users through the Emulator UI

3. **Firestore Connection Issues**:
   - Check console logs for connection errors
   - Ensure code is using the development environment detection
   - Verify Firestore rules allow the operations

4. **Data Persistence**:
   - Export data before shutting down: `firebase emulators:export emulator-data`
   - Import when starting: `firebase emulators:start --import=emulator-data`

### Next.js and React Issues

1. **Server Component/Client Component Confusion**:
   - Ensure Firebase is only used in client components
   - Use API routes for server-side Firebase operations
   - Check for "use client" directive in components that use client-side APIs

2. **Hydration Errors**:
   - Check for mismatches between server and client rendering
   - Ensure state is initialized properly
   - Use dynamic imports for client-only components

3. **Performance Issues**:
   - Implement proper data fetching with React Query
   - Use memoization for expensive calculations
   - Lazy load non-critical components

## 6. Project Structure

```
/Users/lukefryer/Oak-Structures-website/
├── .firebase/                      # Firebase deployment cache
├── .next/                          # Next.js build output
├── public/                         # Static assets
│   └── images/                     # Image assets
├── src/                            # Source code
│   ├── ai/                         # AI integration
│   ├── app/                        # Next.js app directory (pages)
│   │   ├── admin/                  # Admin dashboard pages
│   │   ├── api/                    # API routes
│   │   │   ├── contact/            # Contact form API
│   │   │   ├── custom-order/       # Custom order API
│   │   │   └── settings/           # Settings API endpoints
│   │   ├── products/               # Product pages
│   │   └── ...                     # Other page routes
│   ├── components/                 # React components
│   │   ├── error/                  # Error handling components
│   │   ├── examples/               # Example components
│   │   ├── layout/                 # Layout components
│   │   └── ui/                     # UI components
│   ├── context/                    # React contexts
│   ├── hooks/                      # Custom React hooks
│   │   ├── firebase/               # Firebase-specific hooks
│   │   │   ├── useFirestoreDocument.ts    # Hooks for Firestore documents
│   │   │   └── useFirestoreCollection.ts  # Hooks for Firestore collections
│   │   └── use-safe-query.ts       # Enhanced React Query hooks
│   ├── lib/                        # Library code
│   │   ├── firebase.ts             # Firebase initialization
│   │   └── react-query.tsx         # React Query provider setup
│   ├── services/                   # Service layer
│   │   ├── domain/                 # Domain services
│   │   │   ├── product-service.ts  # Product domain logic
│   │   │   └── settings-service.ts # Settings domain logic
│   │   └── firebase/               # Firebase services
│   │       ├── auth-service.ts     # Authentication service
│   │       ├── firestore-service.ts # Firestore database service
│   │       ├── storage-service.ts  # Storage service
│   │       └── index.ts            # Services entry point
│   └── utils/                      # Utility functions
│       └── error-utils.ts          # Error handling utilities
├── .env.local                      # Environment variables
├── firebase.json                   # Firebase configuration
├── firestore.rules                 # Firestore security rules
├── storage.rules                   # Storage security rules
├── next.config.ts                  # Next.js configuration
├── package.json                    # Project dependencies
└── tailwind.config.ts              # Tailwind CSS configuration
```

## 7. Firebase Configuration

The project uses Firebase for backend functionality. The Firebase configuration is stored in `src/lib/firebase.ts` and connects to the following services:

- **Firebase Project**: `timberline-commerce`
- **Authentication**: Email/password and Google sign-in
- **Firestore**: Document database for products, orders, and users
- **Storage**: File storage for product images and documentation

In development mode, the application connects to local Firebase emulators:
- Auth emulator: http://localhost:9099
- Firestore emulator: http://localhost:8080
- Storage emulator: http://localhost:9199
- Emulator UI: http://localhost:4000

## 8. Local Development Setup

### Prerequisites

- Node.js (v20+)
- npm (v9+)
- Firebase CLI (`npm install -g firebase-tools`)

### Initial Setup

1. Clone the repository: `git clone <repository-url>`
2. Install dependencies: `npm install`
3. Create a `.env.local` file based on `.env.example`
4. Add Firebase configuration to `.env.local`

### Development Workflow

#### Option 1: Complete Development Environment (Recommended)

Use the provided script to start both Firebase emulators and the Next.js development server:

```bash
npm run dev:emulators
```

This command:
1. Starts Firebase emulators with pre-loaded data (Auth, Firestore, Storage)
2. Launches the Next.js development server on port 9002
3. Makes the Emulator UI available at http://localhost:4000

#### Option 2: Development with External Firebase Project

If you want to develop against the production Firebase project:

```bash
npm run dev
```

This starts only the Next.js development server, connecting to the Firebase project specified in your environment variables.

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `.next` directory.

### Deploying to Firebase

```bash
firebase deploy
```

This deploys the application to Firebase Hosting.

---

This document will be updated as the project evolves. Last updated: May 13, 2025 (Added React Query, Firebase hooks, Firebase service layers, server/client boundary fixes, improved development stability, admin dashboard improvements, comprehensive error handling, and transaction-based data updates).
