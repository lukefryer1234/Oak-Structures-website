# Firebase Local Development Setup

This guide explains how to use Firebase emulators for local development of the Oak Structures website. Using emulators allows you to develop and test your application without connecting to the production Firebase services.

## What's Included

The following Firebase emulators have been configured:

- **Authentication** (port 9099) - For testing auth flows without affecting real users
- **Firestore** (port 8080) - For local database operations
- **Storage** (port 9199) - For uploading and managing files locally
- **Emulator UI** (port 4000) - For visually interacting with and monitoring all emulators

## Prerequisites

Ensure you have:

- Node.js installed
- Firebase CLI installed (`npm install -g firebase-tools`)
- Project dependencies installed (`npm install`)

## Getting Started

### Starting the Firebase Emulators and Next.js Development Server

The easiest way to start local development is to use the predefined npm script that runs both the Firebase emulators and the Next.js development server simultaneously:

```bash
npm run dev:emulators
```

This command will:
1. Start all configured Firebase emulators (Auth, Firestore, Storage) with pre-seeded data
2. Launch the Emulator UI at http://localhost:4000
3. Start the Next.js development server on port 9002

### Starting Emulators with Sample Data

To start only the emulators with the pre-seeded sample data:

```bash
npm run emulators:data
```

### Starting Just the Emulators

If you only need to run the emulators (for example, if you're working with another service that connects to them):

```bash
npm run emulators
```

### Accessing the Emulator UI

Once the emulators are running, you can access the Emulator UI at:

```
http://localhost:4000
```

This interface allows you to:
- Explore and edit Firestore data
- View Storage files
- Manage Authentication users
- View logs and requests

## Emulator Port Configuration

The following ports are used:

| Service       | Port | URL                      |
|---------------|------|--------------------------|
| Auth          | 9099 | http://localhost:9099    |
| Firestore     | 8080 | http://localhost:8080    |
| Storage       | 9199 | http://localhost:9199    |
| Emulator UI   | 4000 | http://localhost:4000    |
| Next.js       | 9002 | http://localhost:9002    |

## Automatic Data Seeding and Persistence

We've added automatic data seeding capabilities to make development faster and more consistent.

### Seeding Emulators with Sample Data

Instead of manually creating test data, you can use our seeding script:

```bash
npm run emulators:seed
```

This script will:

- Create test users with different roles (admin, manager, customer)
- Add sample products to the database
- Create test orders linked to customers
- Add sample contact form submissions
- Initialize site settings and gallery items

### Seeding and Exporting in One Step

To seed the emulators and export the data for future use:

```bash
npm run emulators:seed-export
```

This will create or update the `emulator-data` directory with the seeded data.

### Starting Emulators with Previous Data

To start the emulators with previously exported data:

```bash
npm run emulators:data
```

### Manual Export

If you've made changes to the data and want to save it:

```bash
npm run emulators:export
```

## VS Code Debugging Setup

We've added VS Code configurations to make debugging Firebase interactions easier.

### Available Debug Configurations

In VS Code, press F5 or go to the Run and Debug panel to see these options:

1. **Next.js: Debug with Firebase Emulators** - Debug the Next.js application with emulators running
2. **Debug Emulator Seeding Script** - Debug the seed script
3. **Debug Seed & Export** - Debug the seeding process with data export
4. **Debug Full Stack (Next.js + Emulators)** - Debug the complete stack

### Using VS Code Tasks

We've also added several tasks that can be run from the Command Palette (Ctrl+Shift+P or Cmd+Shift+P):

1. Tasks: Run Task → Start Firebase Emulators
2. Tasks: Run Task → Start Firebase Emulators with Data
3. Tasks: Run Task → Seed Emulators
4. Tasks: Run Task → Open Emulator UI

## Environment Setup

The code has been updated to automatically connect to emulators when `NODE_ENV` is set to 'development'. No manual configuration is needed for this functionality.

## Common Troubleshooting

### Emulators Won't Start

If emulators won't start, try:

- Ensure no other processes are using the configured ports
- Check if Firebase CLI is properly installed (`firebase --version`)
- Try running `firebase emulators:start` directly to see more detailed error messages

### Authentication Issues

If you're having trouble with authentication:

- Make sure you're using test accounts in the local environment
- The emulator Auth service doesn't require real email verification
- Create test users through the Emulator UI at http://localhost:4000

### Firestore Connection Issues

If your app isn't connecting to the Firestore emulator:

- Check console logs for connection errors
- Ensure the code connecting to emulators is running in development mode
- Verify that your Firestore rules allow the operations you're attempting

### Data Not Persisting Between Sessions

By default, emulator data is not persisted when you restart. To persist data:

1. Export data before shutting down:
```bash
firebase emulators:export emulator-data
```

2. Import when starting:
```bash
firebase emulators:start --import=emulator-data
```

## Best Practices for Local Development

To optimize your development workflow with Firebase emulators:

1. **Always use seeded data**: Start with consistent test data using `npm run emulators:seed-export` and then `npm run emulators:data` for subsequent runs.

2. **Create test cases with appropriate user roles**: Use the pre-created admin, manager, and customer test users to verify role-based access controls.

3. **Reset data when needed**: If your tests have modified data in ways that interfere with development, re-seed the emulators.

4. **Use VS Code debugging**: Set breakpoints in your Firebase interactions to understand data flow.

5. **Check emulator logs**: Use the Emulator UI to inspect request logs and debug authentication or permission issues.

6. **Test security rules thoroughly**: Verify your Firestore rules work as expected using different user accounts.

7. **Export periodically**: Export your emulator data periodically to avoid losing important test setups.

## Additional Resources

- [Firebase Emulator Suite Documentation](https://firebase.google.com/docs/emulator-suite)
- [Firebase Local Emulator UI](https://firebase.google.com/docs/emulator-suite/connect_ui)
- [Firestore Emulator Documentation](https://firebase.google.com/docs/firestore/security/test-rules-emulator)
