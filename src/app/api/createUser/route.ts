import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { UserRole, EMAIL_ROLE_OVERRIDES } from "@/lib/permissions";

interface UserPayload {
  uid: string;
  email?: string | null;
  displayName?: string | null;
}

export async function POST(req: Request) {
  try {
    const { user } = (await req.json()) as { user: UserPayload };

    if (!user || !user.uid) {
      console.error("No user UID provided in request body for /api/createUser");
      return Response.json(
        { message: "User UID is required." },
        { status: 400 },
      );
    }

    console.log("Received user for Firestore creation/update:", user);

    try {
      // Verify the user exists in Firebase Auth
      const authUser = await adminAuth.getUser(user.uid);

      const userRef = adminDb.collection("users").doc(user.uid);
      const userSnap = await userRef.get();

      // Check if the user has a special role override based on email
      const userEmail = authUser.email || user.email || "";
      let userRole = "Customer";

      // Apply email overrides if email matches
      if (userEmail && EMAIL_ROLE_OVERRIDES[userEmail]) {
        userRole = EMAIL_ROLE_OVERRIDES[userEmail];
        console.log(`Applied role override for ${userEmail}: ${userRole}`);
      }

      const userDataToSet = {
        email: authUser.email || user.email || "",
        displayName: authUser.displayName || user.displayName || "New User",
        lastLogin: new Date().toISOString(),
        role: userSnap.exists ? userSnap.data()?.role || userRole : userRole, // Apply role or use existing
        createdAt: userSnap.exists ? undefined : new Date().toISOString(), // Only set for new users
      };

      if (userSnap.exists) {
        // User already exists, update as needed but preserve role if one exists and there's no override
        const updates = { ...userDataToSet };

        // If this user has a role override by email, always apply it
        if (userEmail && EMAIL_ROLE_OVERRIDES[userEmail]) {
          updates.role = EMAIL_ROLE_OVERRIDES[userEmail];
        }

        await userRef.update(updates);
        console.log(
          `User document for ${user.uid} updated in Firestore. Role: ${updates.role}`,
        );
      } else {
        // User does not exist, create new document
        await userRef.set(userDataToSet);
        console.log(
          `Created new user document for ${user.uid} in Firestore. Role: ${userDataToSet.role}`,
        );
      }

      return Response.json(
        {
          message: "User document processed successfully in Firestore.",
          role: userDataToSet.role,
        },
        { status: 200 },
      );
    } catch (authError) {
      console.error("Error verifying user in Firebase Auth:", authError);
      return Response.json(
        {
          message: "Unable to verify user in Firebase Auth.",
        },
        { status: 404 },
      );
    }
  } catch (e) {
    console.error(
      "Failed to process user document in Firestore (/api/createUser):",
      e,
    );
    return Response.json(
      {
        message: `Failed to process user document in Firestore. Details: ${e instanceof Error ? e.message : "Unknown error"}`,
      },
      { status: 500 },
    );
  }
}
