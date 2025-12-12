import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { prisma } from "../../../lib/db";
import { Heart, ArrowLeft, Clock, Users, Trash2, Edit } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const getRecipeById = createServerFn().handler(
  async ({ data }: { data: string }) => {
    const recipe = await prisma.recipe.findUnique({
      where: { id: data },
      include: {
        user: { select: { name: true, image: true } },
        ingredients: { orderBy: { order: "asc" } },
        steps: { orderBy: { order: "asc" } },
        categories: true,
      },
    });
    return recipe;
  },
);

const deleteRecipe = createServerFn().handler(
  async ({ data }: { data: string }) => {
    await prisma.recipe.delete({ where: { id: data } });
    return { success: true };
  },
);

const checkFavorite = createServerFn().handler(
  async ({ data }: { data: { userId: string; recipeId: string } }) => {
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_recipeId: {
          userId: data.userId,
          recipeId: data.recipeId,
        },
      },
    });
    return !!favorite;
  },
);

const toggleFavorite = createServerFn().handler(
  async ({ data }: { data: { userId: string; recipeId: string } }) => {
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_recipeId: {
          userId: data.userId,
          recipeId: data.recipeId,
        },
      },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id },
      });
      return false;
    } else {
      await prisma.favorite.create({
        data: {
          userId: data.userId,
          recipeId: data.recipeId,
        },
      });
      return true;
    }
  },
);

export const Route = createFileRoute("/dashboard/recettes/$id")({
  loader: async ({ params, context }) => {
    const recipe = await getRecipeById({ data: params.id });
    let isFavorite = false;
    if (context.session?.user?.id && recipe) {
      isFavorite = await checkFavorite({
        data: { userId: context.session.user.id, recipeId: params.id },
      });
    }
    return { recipe, isFavorite };
  },
  component: RecipeDetailPage,
});

function RecipeDetailPage() {
  const { recipe, isFavorite: initialFavorite } = Route.useLoaderData();
  const { session } = Route.useRouteContext();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [togglingFavorite, setTogglingFavorite] = useState(false);

  if (!recipe) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="p-8 text-center">
          <CardContent className="pt-6">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Recette non trouvée
            </h1>
            <Button variant="outline" asChild>
              <Link to="/dashboard/recettes">
                <ArrowLeft size={16} />
                Retour aux recettes
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwner = session?.user?.id === recipe.userId;

  const handleDelete = async () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette recette ?")) {
      await deleteRecipe({ data: recipe.id });
      navigate({ to: "/dashboard/recettes" });
    }
  };

  const handleToggleFavorite = async () => {
    if (!session?.user?.id) return;
    setTogglingFavorite(true);
    try {
      const result = await toggleFavorite({
        data: { userId: session.user.id, recipeId: recipe.id },
      });
      setIsFavorite(result);
    } finally {
      setTogglingFavorite(false);
    }
  };

  const getDifficultyBadge = () => {
    switch (recipe.difficulty) {
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

  return (
    <div>
      <Button variant="ghost" className="mb-6" asChild>
        <Link to="/dashboard/recettes">
          <ArrowLeft size={16} />
          Retour aux recettes
        </Link>
      </Button>

      {recipe.imageUrl && (
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          className="w-full h-64 md:h-80 object-cover rounded-lg mb-6"
        />
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-3xl">{recipe.title}</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={isFavorite ? "destructive" : "outline"}
                size="icon"
                onClick={handleToggleFavorite}
                disabled={togglingFavorite}
                className={
                  isFavorite
                    ? "bg-red-100 text-red-600 hover:bg-red-200 border-0"
                    : ""
                }
              >
                <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
              </Button>
              {isOwner && (
                <>
                  <Button variant="outline" asChild>
                    <Link
                      to="/dashboard/recettes/$id/modifier"
                      params={{ id: recipe.id }}
                    >
                      <Edit size={16} />
                      Modifier
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDelete}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 size={16} />
                    Supprimer
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {recipe.description && (
            <p className="text-muted-foreground">{recipe.description}</p>
          )}

          <div className="flex flex-wrap gap-4 text-sm">
            {recipe.prepTime && (
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-muted-foreground" />
                <span className="text-muted-foreground">Préparation:</span>
                <span className="font-medium">{recipe.prepTime} min</span>
              </div>
            )}
            {recipe.cookTime && (
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-muted-foreground" />
                <span className="text-muted-foreground">Cuisson:</span>
                <span className="font-medium">{recipe.cookTime} min</span>
              </div>
            )}
            {recipe.servings && (
              <div className="flex items-center gap-2">
                <Users size={16} className="text-muted-foreground" />
                <span className="text-muted-foreground">Portions:</span>
                <span className="font-medium">{recipe.servings}</span>
              </div>
            )}
            {getDifficultyBadge()}
          </div>

          {recipe.categories.length > 0 && (
            <div className="flex gap-2">
              {recipe.categories.map((cat) => (
                <Badge
                  key={cat.id}
                  variant="secondary"
                  className="bg-orange-100 text-orange-800"
                >
                  {cat.name}
                </Badge>
              ))}
            </div>
          )}

          <Separator />

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Ingrédients</h2>
              <ul className="space-y-2">
                {recipe.ingredients.map((ing) => (
                  <li key={ing.id} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full" />
                    <span className="text-foreground">
                      {ing.quantity && `${ing.quantity} `}
                      {ing.unit && `${ing.unit} `}
                      {ing.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Étapes</h2>
              <ol className="space-y-4">
                {recipe.steps.map((step, index) => (
                  <li key={step.id} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm">
                      {index + 1}
                    </span>
                    <p className="text-muted-foreground">{step.instruction}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <Separator />

          <p className="text-sm text-muted-foreground">
            Recette par{" "}
            <span className="font-medium text-foreground">
              {recipe.user.name}
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
