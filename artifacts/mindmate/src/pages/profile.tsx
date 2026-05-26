import { useUser, useClerk } from "@clerk/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, LogOut, Settings, Bell, Shield } from "lucide-react";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  if (!isLoaded || !user) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Profile</h1>
        <p className="text-muted-foreground mt-1 text-lg">Manage your account and preferences.</p>
      </div>

      <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden">
        <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8">
          <Avatar className="w-24 h-24 border-4 border-background shadow-md">
            <AvatarImage src={user.imageUrl} />
            <AvatarFallback className="bg-primary/10 text-primary text-2xl">
              {user.firstName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          
          <div className="text-center md:text-left flex-1">
            <h2 className="text-2xl font-bold text-foreground">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-muted-foreground mt-1">
              {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>

          <Button variant="outline" className="rounded-full px-6" onClick={() => signOut({ redirectUrl: "/" })}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        <Card className="rounded-3xl border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Account Settings</CardTitle>
            <CardDescription>Manage your app preferences</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              <div className="p-6 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">General Preferences</h3>
                    <p className="text-sm text-muted-foreground">Theme, timezone, and language</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">Manage</Button>
              </div>

              <div className="p-6 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Notifications</h3>
                    <p className="text-sm text-muted-foreground">Daily reminders and alerts</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">Manage</Button>
              </div>

              <div className="p-6 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Privacy & Security</h3>
                    <p className="text-sm text-muted-foreground">Data export and security</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">Manage</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}