# Timberline Commerce - E-commerce Web Application

This project aims to build a comprehensive E-commerce Web Application for "Timberline Commerce," specializing in configurable timber products and structures. The application will enable customers to view product information, configure items, manage their accounts, and complete purchases. A key feature is a detailed Admin Panel for site management.

## Project Goals

- **Customer-Facing E-commerce Site:** Allow users to:
    - Browse and configure products across categories like Garages, Gazebos, Porches, Oak Beams, and Oak Flooring.
    - View and purchase pre-configured "Special Deals."
    - Submit inquiries for custom/bespoke orders (requires login).
    - Manage their user accounts, addresses, and order history.
    - Complete purchases through a secure checkout process.
- **Admin Panel:** Provide administrators with tools to manage:
    - Product configurations and pricing.
    - Special deals and product photos.
    - Site settings (company info, financial, delivery, payment gateways, analytics).
    - Content (gallery, custom order page text, SEO meta tags).
    - Orders and potentially user accounts.

## Core Technologies

This application is being developed using the following primary technologies:

- **Frontend:** [Next.js](https://nextjs.org/) (App Router) with [React](https://reactjs.org/) and [TypeScript](https://www.typescriptlang.org/).
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) built on [Tailwind CSS](https://tailwindcss.com/).
- **Backend Services (Firebase):**
    - **Authentication:** Firebase Authentication for user sign-up, login (Email/Password, Google OAuth), and account management.
    - **Database:** Firebase Firestore (NoSQL) for storing product data, user information, orders, admin settings, etc.
    - **Serverless Functions:** Firebase Cloud Functions for backend logic, API endpoints (order processing, form submissions, payment integration).
- **Styling:** Tailwind CSS for utility-first CSS.
- **State Management:** React Context API and component-level state.

## Key Features (Planned/In Development)

- User Authentication (Email/Password, Google OAuth)
- Product Configuration Tools for multiple categories
- Dynamic Pricing based on configuration
- Shopping Basket & Secure Checkout
- Order Management (Customer & Admin)
- Admin Panel for Site Management
- Custom Order Inquiry System
- Product Gallery

## Getting Started

This project is currently under active development within Firebase Studio.

### Prerequisites

- Node.js and npm/yarn
- Firebase Account and Project Setup

### (General) Local Development Setup (Adapt as necessary)

1.  **Clone the repository (if applicable):**
    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Set up Firebase:**
    - Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/).
    - Add a Web App to your Firebase project and copy the Firebase configuration.
    - Configure Firebase Authentication (Email/Password, Google Sign-in).
    - Set up Firestore database and define security rules.
    - (Later) Set up Cloud Functions.
4.  **Environment Variables:**
    - Create a `.env.local` file in the root of your project.
    - Add your Firebase project configuration variables (prefixed with `NEXT_PUBLIC_FIREBASE_`). Refer to `src/lib/firebase.ts` and `next.config.ts`.
    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    # NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id (optional)

    # For Genkit (if using Google AI for GenAI features)
    GOOGLE_GENAI_API_KEY=your_google_genai_api_key
    ```
5.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The application should be accessible at `http://localhost:9002` (or the port specified in your `package.json`).

### Genkit Development (If Applicable)
If you are using Genkit for AI features:
```bash
npm run genkit:dev
# or for watching changes
npm run genkit:watch
```

## Project Structure Highlights

- `src/app/`: Next.js App Router pages and layouts.
- `src/components/`: Reusable UI components.
- `src/components/ui/`: Components from `shadcn/ui`.
- `src/lib/`: Utility functions, Firebase configuration.
- `src/context/`: React context providers (e.g., AuthContext).
- `src/app/admin/`: Admin panel pages and functionality.
- `src/app/api/` or Firebase Cloud Functions: For backend API logic (to be developed).

This README will be updated as the project progresses.
