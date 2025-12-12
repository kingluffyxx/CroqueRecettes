import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { prisma } from "../../lib/db";
import { auth } from "../../lib/auth";
import { ArrowLeft, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const getSession = createServerFn().handler(async ({ request }) => {
  const session = await auth.api.getSession({ headers: request.headers });
  return session;
});

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

export const Route = createFileRoute("/recettes/$id")({
  beforeLoad: async () => {
    const session = await getSession();
    if (session) {
      throw redirect({ to: "/dashboard/rechercher" });
    }
  },
  loader: async ({ params }) => {
    const recipe = await getRecipeById({ data: params.id });
    return { recipe };
  },
  component: RecipeDetailPage,
});

function RecipeDetailPage() {
  const { recipe } = Route.useLoaderData();

  if (!recipe) {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center py-12">
        <Card className="p-8 text-center">
          <CardContent className="pt-6">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Recette non trouvée
            </h1>
            <Button variant="outline" asChild>
              <Link to="/recettes">
                <ArrowLeft size={16} />
                Retour à la recherche
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
    <div className="min-h-screen bg-muted/50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Button variant="ghost" className="mb-6" asChild>
          <Link to="/recettes">
            <ArrowLeft size={16} />
            Retour à la recherche
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
            <CardTitle className="text-3xl">{recipe.title}</CardTitle>
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
                      <p className="text-muted-foreground">
                        {step.instruction}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Recette par{" "}
                <span className="font-medium text-foreground">
                  {recipe.user.name}
                </span>
              </p>
              <div className="flex gap-4">
                <Button variant="outline" asChild>
                  <Link to="/auth/login">Se connecter</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth/register">Créer un compte</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
