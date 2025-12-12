import { createFileRoute, Link } from "@tanstack/react-router";
import { Edit, Trash2, BookOpen } from "lucide-react";
import { createServerFn } from "@tanstack/react-start";
import { prisma } from "../../../lib/db";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const getUserRecipes = createServerFn().handler(
  async ({ data }: { data: string }) => {
    const recipes = await prisma.recipe.findMany({
      where: { userId: data },
      include: {
        ingredients: { orderBy: { order: "asc" } },
        steps: { orderBy: { order: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });
    return recipes;
  },
);

const deleteRecipe = createServerFn().handler(
  async ({ data }: { data: string }) => {
    await prisma.recipe.delete({ where: { id: data } });
    return { success: true };
  },
);

export const Route = createFileRoute("/dashboard/recettes/")({
  loader: async ({ context }) => {
    const userId = context.session?.user?.id;
    if (!userId) return [];
    return getUserRecipes({ data: userId });
  },
  component: MesRecettesPage,
});

function MesRecettesPage() {
  const initialRecipes = Route.useLoaderData();
  const [recipes, setRecipes] = useState(initialRecipes);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette recette ?")) return;

    setDeleting(id);
    try {
      await deleteRecipe({ data: id });
      setRecipes(recipes.filter((r) => r.id !== id));
    } finally {
      setDeleting(null);
    }
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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Mes recettes</h1>
      </div>

      {recipes.length === 0 ? (
        <Card className="p-12">
          <CardContent className="text-center pt-6">
            <BookOpen
              className="mx-auto text-muted-foreground/30 mb-4"
              size={48}
            />
            <p className="text-muted-foreground">
              Vous n'avez pas encore de recettes. Cliquez sur "Nouvelle recette"
              dans la barre de navigation pour commencer.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recette</TableHead>
                <TableHead>Difficulté</TableHead>
                <TableHead>Créée le</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recipes.map((recipe) => (
                <TableRow key={recipe.id}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      {recipe.imageUrl ? (
                        <img
                          src={recipe.imageUrl}
                          alt={recipe.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                          ?
                        </div>
                      )}
                      <div>
                        <Link
                          to="/dashboard/recettes/$id"
                          params={{ id: recipe.id }}
                          className="font-medium text-foreground hover:text-orange-600"
                        >
                          {recipe.title}
                        </Link>
                        {recipe.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {recipe.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getDifficultyBadge(recipe.difficulty)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(recipe.createdAt).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" asChild>
                        <Link
                          to="/dashboard/recettes/$id/modifier"
                          params={{ id: recipe.id }}
                        >
                          <Edit size={18} />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(recipe.id)}
                        disabled={deleting === recipe.id}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
