import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Search } from "lucide-react";
import { createServerFn } from "@tanstack/react-start";
import { prisma } from "../../lib/db";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const getUserFavorites = createServerFn().handler(
  async ({ data }: { data: string }) => {
    const favorites = await prisma.favorite.findMany({
      where: { userId: data },
      include: {
        recipe: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return favorites;
  },
);

const removeFavorite = createServerFn().handler(
  async ({ data }: { data: { userId: string; recipeId: string } }) => {
    await prisma.favorite.delete({
      where: {
        userId_recipeId: {
          userId: data.userId,
          recipeId: data.recipeId,
        },
      },
    });
    return { success: true };
  },
);

export const Route = createFileRoute("/dashboard/favoris")({
  loader: async ({ context }) => {
    const userId = context.session?.user?.id;
    if (!userId) return [];
    return getUserFavorites({ data: userId });
  },
  component: FavorisPage,
});

function FavorisPage() {
  const { session } = Route.useRouteContext();
  const initialFavorites = Route.useLoaderData();
  const [favorites, setFavorites] = useState(initialFavorites);
  const [removing, setRemoving] = useState<string | null>(null);

  const handleRemove = async (recipeId: string) => {
    if (!session?.user?.id) return;

    setRemoving(recipeId);
    try {
      await removeFavorite({ data: { userId: session.user.id, recipeId } });
      setFavorites(favorites.filter((f) => f.recipeId !== recipeId));
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-6">Mes favoris</h1>

      {favorites.length === 0 ? (
        <Card className="p-12">
          <CardContent className="text-center pt-6">
            <Heart
              className="mx-auto text-muted-foreground/30 mb-4"
              size={48}
            />
            <p className="text-muted-foreground mb-4">
              Vous n'avez pas encore de recettes favorites
            </p>
            <Button asChild>
              <Link to="/dashboard/rechercher">
                <Search size={18} />
                Découvrir des recettes
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => (
            <Card key={favorite.id} className="overflow-hidden group">
              <Link
                to="/dashboard/recettes/$id"
                params={{ id: favorite.recipe.id }}
              >
                {favorite.recipe.imageUrl ? (
                  <img
                    src={favorite.recipe.imageUrl}
                    alt={favorite.recipe.title}
                    className="w-full h-40 object-cover group-hover:opacity-90 transition"
                  />
                ) : (
                  <div className="w-full h-40 bg-muted flex items-center justify-center text-muted-foreground">
                    Pas d'image
                  </div>
                )}
              </Link>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    to="/dashboard/recettes/$id"
                    params={{ id: favorite.recipe.id }}
                    className="font-semibold text-foreground hover:text-orange-600 transition"
                  >
                    {favorite.recipe.title}
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleRemove(favorite.recipeId)}
                    disabled={removing === favorite.recipeId}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Heart size={18} fill="currentColor" />
                  </Button>
                </div>
                {favorite.recipe.description && (
                  <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
                    {favorite.recipe.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground/70 mt-2">
                  Par {favorite.recipe.user.name}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
