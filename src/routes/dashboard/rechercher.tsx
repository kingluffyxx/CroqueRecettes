import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, SearchX } from "lucide-react";
import { createServerFn } from "@tanstack/react-start";
import { prisma } from "../../lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const getRecentRecipes = createServerFn().handler(async () => {
  const recipes = await prisma.recipe.findMany({
    include: {
      user: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 12,
  });
  return recipes;
});

const searchRecipes = createServerFn().handler(
  async ({ data }: { data: string }) => {
    if (!data || data.trim().length < 2) {
      return [];
    }
    const recipes = await prisma.recipe.findMany({
      where: {
        OR: [
          { title: { contains: data, mode: "insensitive" } },
          { description: { contains: data, mode: "insensitive" } },
        ],
      },
      include: {
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return recipes;
  },
);

export const Route = createFileRoute("/dashboard/rechercher")({
  loader: async () => {
    const recentRecipes = await getRecentRecipes();
    return { recentRecipes };
  },
  component: RechercherPage,
});

function RechercherPage() {
  const { recentRecipes } = Route.useLoaderData();
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    Awaited<ReturnType<typeof searchRecipes>>
  >([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length < 2) return;

    setLoading(true);
    setSearched(true);
    try {
      const data = await searchRecipes({ data: query });
      setSearchResults(data);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setSearched(false);
    setSearchResults([]);
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Facile
          </Badge>
        );
      case "MEDIUM":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Moyen
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Difficile
          </Badge>
        );
    }
  };

  const recipes = searched ? searchResults : recentRecipes;

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-6">Rechercher</h1>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={20}
            />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une recette..."
              className="pl-12 h-12"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={loading || query.trim().length < 2}
          >
            {loading ? "Recherche..." : "Rechercher"}
          </Button>
        </div>
      </form>

      {/* Results header */}
      <div className="flex items-center justify-between mb-6">
        {searched ? (
          <>
            <p className="text-muted-foreground">
              {searchResults.length} résultat
              {searchResults.length !== 1 ? "s" : ""} pour "{query}"
            </p>
            <Button variant="ghost" size="sm" onClick={clearSearch}>
              Effacer la recherche
            </Button>
          </>
        ) : (
          <p className="text-muted-foreground">Recettes récentes</p>
        )}
      </div>

      {/* Recipes grid */}
      {recipes.length === 0 ? (
        <Card className="p-8">
          <CardContent className="text-center pt-6">
            <SearchX
              className="mx-auto text-muted-foreground/50 mb-4"
              size={48}
            />
            <p className="text-muted-foreground">
              {searched
                ? "Aucune recette trouvée"
                : "Aucune recette disponible"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <Link
              key={recipe.id}
              to="/dashboard/recettes/$id"
              params={{ id: recipe.id }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                {recipe.imageUrl && (
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    className="w-full h-40 object-cover"
                  />
                )}
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">
                      {recipe.title}
                    </h3>
                    {recipe.difficulty && getDifficultyBadge(recipe.difficulty)}
                  </div>
                  {recipe.description && (
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {recipe.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground/70 mt-2">
                    Par {recipe.user.name}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
