import { useUser } from "@clerk/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserCheck, TrendingUp, Activity, Shield, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

type AdminStats = {
  totalUsers: number;
  newThisWeek: number;
  newThisMonth: number;
  activeThisWeek: number;
};

type AdminUser = {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  createdAt: string;
  lastSignInAt: string | null;
};

type MeResponse = {
  userId: string;
  isAdmin: boolean;
  adminConfigured: boolean;
};

export default function AdminPage() {
  const { user } = useUser();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((data: MeResponse) => {
        setMe(data);
        if (data.isAdmin) {
          return Promise.all([
            fetch("/api/admin/stats").then((r) => r.json()),
            fetch("/api/admin/users").then((r) => r.json()),
          ]).then(([statsData, usersData]) => {
            setStats(statsData);
            setUsers(usersData.users);
            setTotal(usersData.total);
          });
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const copyUserId = () => {
    if (me?.userId) {
      navigator.clipboard.writeText(me.userId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (!me?.adminConfigured || !me?.isAdmin) {
    return (
      <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Admin Setup Required</h1>
          {!me?.adminConfigured ? (
            <>
              <p className="text-muted-foreground leading-relaxed">
                To access the admin panel, set your Clerk user ID as the <code className="bg-amber-100 px-1.5 py-0.5 rounded text-sm font-mono">ADMIN_USER_ID</code> environment variable in Replit Secrets.
              </p>
              <div className="bg-white rounded-2xl border border-amber-200 p-4 space-y-3">
                <p className="text-sm font-medium text-foreground">Your Clerk User ID:</p>
                <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-4 py-3 font-mono text-sm text-foreground">
                  <span className="flex-1 truncate">{me?.userId || "Loading..."}</span>
                  <Button size="sm" variant="ghost" className="h-7 px-2 rounded-lg" onClick={copyUserId}>
                    {copied ? "Copied!" : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <ol className="text-sm text-muted-foreground text-left space-y-1 list-decimal list-inside">
                  <li>Copy your user ID above</li>
                  <li>Open Replit Secrets (the lock icon in the sidebar)</li>
                  <li>Add a new secret: key <code className="bg-muted px-1 rounded">ADMIN_USER_ID</code>, value = your user ID</li>
                  <li>Restart the API server workflow</li>
                  <li>Reload this page</li>
                </ol>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">You don't have admin access. Only the configured admin can view this page.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <Shield className="w-7 h-7 text-primary" />
          Admin Panel
        </h1>
        <p className="text-muted-foreground mt-1">Manage your MindMate AI users and platform stats.</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<Users className="w-5 h-5" />} label="Total Users" value={stats.totalUsers} color="blue" />
          <StatCard icon={<TrendingUp className="w-5 h-5" />} label="New This Week" value={stats.newThisWeek} color="green" />
          <StatCard icon={<UserCheck className="w-5 h-5" />} label="New This Month" value={stats.newThisMonth} color="purple" />
          <StatCard icon={<Activity className="w-5 h-5" />} label="Active This Week" value={stats.activeThisWeek} color="orange" />
        </div>
      )}

      <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="pb-4 border-b border-border/50">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            All Users
            <span className="ml-auto text-sm font-normal text-muted-foreground">{total} total</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 border-b border-border/50">
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">User</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Email</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Joined</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {u.imageUrl ? (
                            <img src={u.imageUrl} alt={u.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-primary font-semibold text-sm">{u.name[0]?.toUpperCase() || "?"}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{u.name}</p>
                          <p className="text-xs text-muted-foreground font-mono truncate max-w-[120px]">{u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                    <td className="px-6 py-4 text-muted-foreground">{format(new Date(u.createdAt), "MMM d, yyyy")}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {u.lastSignInAt ? format(new Date(u.lastSignInAt), "MMM d, yyyy") : "Never"}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">No users yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };
  return (
    <Card className="rounded-2xl border-border/50 shadow-sm">
      <CardContent className="p-5">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}>
          {icon}
        </div>
        <p className="text-3xl font-bold text-foreground">{value.toLocaleString()}</p>
        <p className="text-sm text-muted-foreground mt-1">{label}</p>
      </CardContent>
    </Card>
  );
}
