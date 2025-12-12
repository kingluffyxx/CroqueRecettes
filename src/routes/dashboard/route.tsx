import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import {
  Search,
  BookOpen,
  Heart,
  Home,
  LogOut,
  Plus,
  Bell,
  ChefHat,
} from "lucide-react";
import { useSession, signOut } from "../../lib/auth-client";
import { createServerFn } from "@tanstack/react-start";
import { auth } from "../../lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const getSession = createServerFn().handler(async ({ request }) => {
  const session = await auth.api.getSession({ headers: request.headers });
  return session;
});

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const session = await getSession();
    if (!session) {
      throw redirect({ to: "/auth/login" });
    }
    return { session };
  },
  component: DashboardLayout,
});

function DashboardLayout() {
  const { session } = Route.useRouteContext();
  const { data: clientSession } = useSession();
  const user = clientSession?.user || session?.user;

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const menuItems = [
    { to: "/dashboard", icon: Home, label: "Accueil", exact: true },
    { to: "/dashboard/rechercher", icon: Search, label: "Rechercher" },
    { to: "/dashboard/recettes", icon: BookOpen, label: "Mes recettes" },
    { to: "/dashboard/favoris", icon: Heart, label: "Favoris" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-muted/50">
      {/* Top Navbar */}
      <header className="bg-orange-600 text-white shadow-lg z-10">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 font-bold text-xl"
            >
              <ChefHat size={28} />
              CroqueRecettes
            </Link>
          </div>

          <div className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60"
                size={18}
              />
              <Input
                type="text"
                placeholder="Rechercher une recette..."
                className="w-full pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-white/40"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              className="bg-white text-orange-600 hover:bg-orange-50"
              asChild
            >
              <Link to="/dashboard/recettes/nouvelle">
                <Plus size={18} />
                Nouvelle recette
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-white hover:bg-white/10"
            >
              <Bell size={22} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            <Separator orientation="vertical" className="h-8 bg-white/20" />
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-white/20 text-white text-sm">
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{user?.name}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-card shadow-lg flex flex-col border-r">
          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    activeOptions={{ exact: item.exact }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-orange-50 hover:text-orange-600 transition-colors"
                    activeProps={{
                      className:
                        "flex items-center gap-3 px-4 py-3 rounded-lg bg-orange-100 text-orange-600 font-medium",
                    }}
                  >
                    <item.icon size={20} />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <Separator />

          <div className="p-4">
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut size={20} />
              Déconnexion
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
