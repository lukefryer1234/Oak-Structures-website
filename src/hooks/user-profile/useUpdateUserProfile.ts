// src/hooks/user-profile/useUpdateUserProfile.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
// import type { User as FirebaseUser } from 'firebase/auth'; // Firebase User type - Not strictly needed here as authContext handles types

// Define the expected input for this hook, matching what authContext.updateUserProfile expects
interface UpdateProfileAuthVariables {
  displayName?: string;
  photoURL?: string;
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient(); // Kept for potential future use with other queries
  const { toast } = useToast();
  const authContext = useAuth();

  return useMutation<void, Error, UpdateProfileAuthVariables, unknown>({
    mutationFn: async (profileData: UpdateProfileAuthVariables) => {
      if (!authContext.currentUser) {
        throw new Error("User not authenticated.");
      }
      if (Object.keys(profileData).length === 0) {
        throw new Error("No data provided for profile update.");
      }
      // authContext.updateUserProfile handles updating Firebase Auth profile,
      // then calls ensureUserDocumentInFirestore (via API) to update Firestore,
      // and finally updates the local auth context state.
      return authContext.updateUserProfile(authContext.currentUser, profileData);
    },
    onSuccess: () => {
      // authContext.updateUserProfile already updates the context's currentUser and shows a toast.
      // If additional specific queries related to user profile need invalidation, do it here.
      // e.g., queryClient.invalidateQueries({ queryKey: ['userDetailedProfile', authContext.currentUser?.uid] });
      // No need for a separate toast here as authContext.updateUserProfile handles it.
    },
    onError: (error: Error) => {
      // authContext.updateUserProfile also handles its own error toasts.
      // This is a fallback if needed, or for specific error logging.
      // toast({ variant: "destructive", title: "Profile Update Failed", description: error.message });
      console.error("useUpdateUserProfile error:", error); // Log error for debugging
    },
  });
}
