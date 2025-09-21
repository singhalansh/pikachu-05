"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Key, 
  Trash2, 
  Eye, 
  EyeOff, 
  AlertTriangle,
  Shield,
  Lock
} from "lucide-react";

interface AccountManagementProps {
  userType: 'citizen' | 'admin';
}

export default function AccountManagement({ userType }: AccountManagementProps) {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  // Password reset states
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Account deletion states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState("");

  const handlePasswordReset = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "New password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    setPasswordLoading(true);
    try {
      console.log('Sending password reset request:', { newPassword: newPassword ? '***' : 'missing' });
      
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          newPassword
        })
      });

      console.log('Password reset response status:', response.status);
      const data = await response.json();
      console.log('Password reset response data:', data);

      if (response.ok) {
        toast({
          title: "Success",
          description: "Password updated successfully"
        });
        setShowPasswordReset(false);
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update password",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAccountDeletion = async () => {
    if (!deletePassword) {
      toast({
        title: "Error",
        description: "Password is required to delete account",
        variant: "destructive"
      });
      return;
    }

    if (confirmDelete !== "DELETE") {
      toast({
        title: "Error",
        description: "Please type 'DELETE' to confirm account deletion",
        variant: "destructive"
      });
      return;
    }

    setDeleteLoading(true);
    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          password: deletePassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Account Deleted",
          description: "Your account and all data have been permanently deleted. You will be redirected to create a new account."
        });
        
        // Wait a moment for the toast to show, then sign out and redirect to signup
        setTimeout(async () => {
          await signOut();
          router.push('/auth?mode=signup');
        }, 2000);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete account",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-3 xs:space-y-4 sm:space-y-6">
      {/* Password Reset Section */}
      <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in">
        <CardHeader className="pb-2 xs:pb-3 sm:pb-4">
          <CardTitle className="flex items-center text-sm xs:text-base sm:text-lg font-semibold text-gray-900">
            <div className="w-6 h-6 xs:w-8 xs:h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-2 xs:mr-3 shadow-lg">
              <Key className="w-3 h-3 xs:w-4 xs:h-4 text-white" />
            </div>
            <span className="hidden xs:inline">Change Password</span>
            <span className="xs:hidden">Password</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3 xs:space-y-4">
          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 sm:gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs xs:text-sm font-medium text-gray-900">Update Password</p>
              <p className="text-xs text-gray-600 mt-1">
                Change your account password for better security
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowPasswordReset(true)}
              className="border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:scale-105 text-xs xs:text-sm w-full xs:w-auto"
            >
              <Lock className="w-3 h-3 xs:w-4 xs:h-4 mr-1 xs:mr-2" />
              <span className="hidden xs:inline">Change Password</span>
              <span className="xs:hidden">Change</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Deletion Section */}
      <Card className="bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in border-red-200">
        <CardHeader className="pb-2 xs:pb-3 sm:pb-4">
          <CardTitle className="flex items-center text-sm xs:text-base sm:text-lg font-semibold text-red-600">
            <div className="w-6 h-6 xs:w-8 xs:h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center mr-2 xs:mr-3 shadow-lg">
              <Trash2 className="w-3 h-3 xs:w-4 xs:h-4 text-white" />
            </div>
            <span className="hidden xs:inline">Delete Account</span>
            <span className="xs:hidden">Delete</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3 xs:space-y-4">
          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 sm:gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs xs:text-sm font-medium text-red-600">Permanently Delete Account</p>
              <p className="text-xs text-gray-600 mt-1">
                This action cannot be undone. All your data will be permanently deleted.
              </p>
            </div>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="text-xs xs:text-sm w-full xs:w-auto"
            >
              <Trash2 className="w-3 h-3 xs:w-4 xs:h-4 mr-1 xs:mr-2" />
              <span className="hidden xs:inline">Delete Account</span>
              <span className="xs:hidden">Delete</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password Reset Dialog */}
      <Dialog open={showPasswordReset} onOpenChange={setShowPasswordReset}>
        <DialogContent className="sm:max-w-md bg-white border border-gray-200 shadow-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Key className="w-4 h-4 text-white" />
              </div>
              Change Password
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Choose a new password for your account
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-sm font-medium text-gray-700">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordReset(false);
                setNewPassword("");
                setConfirmPassword("");
              }}
              className="border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePasswordReset}
              disabled={passwordLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-blue-200"
            >
              {passwordLoading ? "Updating..." : "Update Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Account Deletion Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md bg-white border border-gray-200 shadow-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold text-red-600">
              <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
              Delete Account
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              This action cannot be undone. All your data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-medium">Warning: This action is irreversible</p>
                  <p className="mt-1">
                    All your data including profile, issues, comments, and votes will be permanently deleted.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="delete-password" className="text-sm font-medium text-gray-700">Enter Password to Confirm</Label>
              <div className="relative">
                <Input
                  id="delete-password"
                  type={showDeletePassword ? "text" : "password"}
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Enter your password"
                  className="border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-200"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowDeletePassword(!showDeletePassword)}
                >
                  {showDeletePassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-delete" className="text-sm font-medium text-gray-700">Type "DELETE" to confirm</Label>
              <Input
                id="confirm-delete"
                value={confirmDelete}
                onChange={(e) => setConfirmDelete(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-200"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeletePassword("");
                setConfirmDelete("");
              }}
              className="border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleAccountDeletion}
              disabled={deleteLoading || !deletePassword || confirmDelete !== "DELETE"}
              className="bg-red-600 hover:bg-red-700 text-white transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-red-200"
            >
              {deleteLoading ? "Deleting..." : "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
