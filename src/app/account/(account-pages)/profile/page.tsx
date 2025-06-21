"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateUserProfile } from '@/hooks/user-profile/useUpdateUserProfile'; // New hook

// Zod schema for profile information form
const profileFormSchema = z.object({
  displayName: z.string().min(1, "Name is required.").max(50, "Name must be 50 characters or less."),
  // photoURL: z.string().url("Must be a valid URL.").optional().or(z.literal('')), // Optional: if you add photoURL update
});
type ProfileFormData = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { currentUser, error: authError, setError: setAuthError } = useAuth(); // Renamed error to authError
  const { toast } = useToast();

  // State for password change form
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);

  // Initialize react-hook-form for profile info
  const { control, handleSubmit, reset, formState: { isDirty, errors: formErrors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: "",
    }
  });

  // Initialize the mutation hook for profile updates
  const { mutateAsync: updateUserProfile, isLoading: isProfileSaving } = useUpdateUserProfile();

  useEffect(() => {
    if (currentUser) {
      reset({ displayName: currentUser.displayName || "" });
    }
  }, [currentUser, reset]);

  useEffect(() => {
    // Handle errors from auth context (e.g., password change errors)
    if (authError) {
      toast({ variant: "destructive", title: "Error", description: authError });
      setAuthError(null); // Clear error after displaying
      setIsPasswordSaving(false); // Reset password saving state if it was active
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authError, setAuthError]); // Removed toast from dep array

  const handleProfileFormSubmit = async (data: ProfileFormData) => {
    if (!currentUser) {
      toast({ variant: "destructive", title: "Not Authenticated", description: "You must be logged in to update your profile." });
      return;
    }
    try {
      await updateUserProfile({ displayName: data.displayName });
      // Toast for success is handled by the hook/authContext
      reset(data); // Reset form with new data to clear isDirty state
    } catch (e: any) {
      // Toast for error is handled by the hook/authContext
      // No need for additional toast here unless specific to this page
      console.error("Profile update submission error:", e);
    }
  };

   const handlePasswordChange = async (event: React.FormEvent<HTMLFormElement>) => {
     event.preventDefault();
     setIsPasswordSaving(true);
     setAuthError(null); // Clear previous auth errors

     const form = event.target as HTMLFormElement;
     const currentPassword = form['current-password'].value;
     const newPassword = form['new-password'].value;
     const confirmPassword = form['confirm-password'].value;

      if (newPassword !== confirmPassword) {
        setAuthError("New passwords do not match!");
        setIsPasswordSaving(false);
        return;
      }
      if (!currentUser) {
        setAuthError("No user logged in.");
        setIsPasswordSaving(false);
        return;
      }

      try {
        if (currentUser.email) {
            const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
            await reauthenticateWithCredential(currentUser, credential);
        } else {
            throw new Error("Current user email not found for re-authentication.");
        }
        await updatePassword(currentUser, newPassword);
        toast({ title: "Password Updated", description: "Your password has been successfully changed." });
        form.reset();
      } catch (e: any) {
        console.error("Password change error:", e);
        setAuthError(e.message);
      } finally {
        setIsPasswordSaving(false);
      }
   };

  return (
     <div className="space-y-8 p-6"> {/* Consider max-w-2xl mx-auto for better layout on wider screens */}
        <Card className="bg-transparent border-none shadow-none">
            <CardHeader className="px-0 pt-0 pb-4">
                <CardTitle>Personal Information</CardTitle>
                 <CardDescription>Update your name. Email is managed by your authentication provider.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
                <form onSubmit={handleSubmit(handleProfileFormSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="displayName">Full Name</Label>
                        <Controller
                            name="displayName"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    id="displayName"
                                    {...field}
                                    className="bg-background/70"
                                    disabled={isProfileSaving}
                                />
                            )}
                        />
                        {formErrors.displayName && <p className="text-sm text-destructive">{formErrors.displayName.message}</p>}
                    </div>
                    <div className="space-y-2">
                         <Label htmlFor="email">Email</Label>
                         <Input
                            id="email"
                            type="email"
                            value={currentUser?.email || "user@example.com"}
                            readOnly
                            className="bg-muted/50 cursor-not-allowed"
                         />
                         <p className="text-xs text-muted-foreground">Email address cannot be changed here.</p>
                    </div>
                    <div className="flex justify-end pt-4 border-t border-border/50">
                         <Button type="submit" disabled={isProfileSaving || !isDirty}>
                            {isProfileSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Save Changes
                         </Button>
                    </div>
                </form>
            </CardContent>
        </Card>

        <Separator className="border-border/50" />

         <Card className="bg-transparent border-none shadow-none">
            <CardHeader className="px-0 pt-4 pb-4">
                <CardTitle>Change Password</CardTitle>
                 <CardDescription>Update your account password.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
                <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" name="current-password" type="password" required className="bg-background/70" disabled={isPasswordSaving}/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" name="new-password" type="password" required className="bg-background/70" disabled={isPasswordSaving}/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" name="confirm-password" type="password" required className="bg-background/70" disabled={isPasswordSaving}/>
                    </div>
                     <div className="flex justify-end pt-4 border-t border-border/50">
                         <Button type="submit" disabled={isPasswordSaving}>
                             {isPasswordSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                             Update Password
                         </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
     </div>
  );
}
