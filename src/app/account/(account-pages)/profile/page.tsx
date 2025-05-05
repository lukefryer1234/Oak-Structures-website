"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// Placeholder data - fetch user data
const userData = {
  name: "Logged In User",
  email: "user@example.com",
};

export default function ProfilePage() {

  const handleProfileUpdate = (event: React.FormEvent<HTMLFormElement>) => {
     event.preventDefault();
     // TODO: Handle profile update logic
     alert("Profile update submitted (placeholder)");
  };

   const handlePasswordChange = (event: React.FormEvent<HTMLFormElement>) => {
     event.preventDefault();
     const currentPassword = (event.target as HTMLFormElement)['current-password'].value;
     const newPassword = (event.target as HTMLFormElement)['new-password'].value;
     const confirmPassword = (event.target as HTMLFormElement)['confirm-password'].value;

      if (newPassword !== confirmPassword) {
        alert("New passwords do not match!"); // Use better error handling
        return;
      }
     // TODO: Handle password change logic
     alert("Password change submitted (placeholder)");
   };


  return (
     <div className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                 <CardDescription>Update your name and email address.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" defaultValue={userData.name} />
                    </div>
                    <div className="space-y-2">
                         <Label htmlFor="email">Email</Label>
                         {/* Consider making email read-only or requiring verification on change */}
                         <Input id="email" type="email" defaultValue={userData.email} readOnly />
                         <p className="text-xs text-muted-foreground">Email address cannot be changed here. Contact support if needed.</p>
                    </div>
                    <div className="flex justify-end">
                         <Button type="submit">Save Changes</Button>
                    </div>
                </form>
            </CardContent>
        </Card>

         <Card>
            <CardHeader>
                <CardTitle>Change Password</CardTitle>
                 <CardDescription>Update your account password.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" type="password" required />
                    </div>
                     <div className="flex justify-end">
                         <Button type="submit">Update Password</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
     </div>
  );
}
