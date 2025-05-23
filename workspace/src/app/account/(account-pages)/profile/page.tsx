
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential, User } from "firebase/auth";

export default function ProfilePage() {
  const { currentUser, updateUserProfile, setError, error } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.displayName || "User");
      setEmail(currentUser.email || "user@example.com");
    }
  }, [currentUser]);

  useEffect(() => {
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error });
      setError(null);
      setIsProfileSaving(false);
      setIsPasswordSaving(false);
    }
  }, [error, setError, toast]);

  const handleProfileUpdate = async (event: FormEvent<HTMLFormElement>) => {
     event.preventDefault();
     if (!currentUser) {
        toast({ variant: "destructive", title: "Error", description: "No user logged in." });
        return;
     }
     setIsProfileSaving(true);
     setError(null);
     try {
        await updateUserProfile(currentUser as User, { displayName: name }); // Cast currentUser to User
     } catch (e: unknown) {
        console.error("Profile update error from page:", e);
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during profile update.";
        toast({ variant: "destructive", title: "Profile Update Error", description: errorMessage });
     } finally {
        setIsProfileSaving(false);
     }
  };

   const handlePasswordChange = async (event: FormEvent<HTMLFormElement>) => {
     event.preventDefault();
     setIsPasswordSaving(true);
     setError(null);

     const currentPassword = (event.target as HTMLFormElement)['current-password'].value;
     const newPassword = (event.target as HTMLFormElement)['new-password'].value;
     const confirmPassword = (event.target as HTMLFormElement)['confirm-password'].value;

      if (newPassword !== confirmPassword) {
        setError("New passwords do not match!");
        setIsPasswordSaving(false);
        return;
      }
      if (!currentUser) {
        setError("No user logged in.");
        setIsPasswordSaving(false);
        return;
      }

      try {
        if (currentUser.email) {
            const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
            await reauthenticateWithCredential(currentUser as User, credential); // Cast currentUser to User
        } else {
            throw new Error("Current user email not found for re-authentication.");
        }

        await updatePassword(currentUser as User, newPassword); // Cast currentUser to User
        toast({ title: "Password Updated", description: "Your password has been successfully changed." });
        (event.target as HTMLFormElement).reset();
      } catch (e: unknown) {
        console.error("Password change error:", e);
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during password change.";
        setError(errorMessage);
      } finally {
        setIsPasswordSaving(false);
      }
   };


  return (
     <div className="space-y-8 p-6">
        <Card className="bg-transparent border-none shadow-none">
            <CardHeader className="px-0 pt-0 pb-4">
                <CardTitle>Personal Information</CardTitle>
                 <CardDescription>Update your name and email address.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-background/70"
                            disabled={isProfileSaving}
                        />
                    </div>
                    <div className="space-y-2">
                         <Label htmlFor="email">Email</Label>
                         <Input
                            id="email"
                            type="email"
                            value={email}
                            readOnly
                            className="bg-muted/50 cursor-not-allowed"
                         />
                         <p className="text-xs text-muted-foreground">Email address cannot be changed here. Contact support if needed.</p>
                    </div>
                    <div className="flex justify-end pt-4 border-t border-border/50">
                         <Button type="submit" disabled={isProfileSaving}>
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
