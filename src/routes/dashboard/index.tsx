import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, BookOpen, Heart, TrendingUp, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

function DashboardHome() {
  const { session } = Route.useRouteContext();

  const stats = [
    {
      label: "Mes recettes",
      value: 0,
      icon: BookOpen,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
    {
      label: "Favoris",
      value: 0,
      icon: Heart,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
    },
    {
      label: "Vues totales",
      value: 0,
      icon: TrendingUp,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Bonjour, {session?.user?.name}
        </h1>
        <p className="text-muted-foreground">
          Bienvenue sur votre espace personnel CroqueRecettes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 ${stat.iconBg} rounded-full flex items-center justify-center`}
                >
                  <stat.icon className={stat.iconColor} size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button asChild>
              <Link to="/dashboard/recettes/nouvelle">
                <Plus size={20} />
                Nouvelle recette
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/dashboard/rechercher">
                <Search size={20} />
                Explorer les recettes
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
