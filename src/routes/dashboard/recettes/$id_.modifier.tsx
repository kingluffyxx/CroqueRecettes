import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { createServerFn } from "@tanstack/react-start";
import { prisma } from "../../../lib/db";
import { Plus, X, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "@tanstack/react-router";

const getRecipeById = createServerFn().handler(
  async ({ data }: { data: string }) => {
    const recipe = await prisma.recipe.findUnique({
      where: { id: data },
      include: {
        ingredients: { orderBy: { order: "asc" } },
        steps: { orderBy: { order: "asc" } },
      },
    });
    return recipe;
  },
);

const updateRecipe = createServerFn().handler(
  async ({
    data,
  }: {
    data: {
      id: string;
      title: string;
      description?: string;
      imageUrl?: string;
      prepTime?: number;
      cookTime?: number;
      servings?: number;
      difficulty: "EASY" | "MEDIUM" | "HARD";
      ingredients: { name: string; quantity?: string; unit?: string }[];
      steps: string[];
    };
  }) => {
    const { id, ingredients, steps, ...recipeData } = data;

    // Supprimer les anciens ingrédients et étapes
    await prisma.ingredient.deleteMany({ where: { recipeId: id } });
    await prisma.step.deleteMany({ where: { recipeId: id } });

    // Mettre à jour la recette avec les nouveaux ingrédients et étapes
    const recipe = await prisma.recipe.update({
      where: { id },
      data: {
        ...recipeData,
        imageUrl: recipeData.imageUrl || null,
        ingredients: {
          create: ingredients.map((ing, index) => ({
            ...ing,
            order: index,
          })),
        },
        steps: {
          create: steps.map((instruction, index) => ({
            instruction,
            order: index,
          })),
        },
      },
    });

    return recipe;
  },
);

export const Route = createFileRoute("/dashboard/recettes/$id_/modifier")({
  loader: async ({ params, context }) => {
    const recipe = await getRecipeById({ data: params.id });
    if (!recipe) {
      throw new Error("Recette non trouvée");
    }
    // Vérifier que l'utilisateur est le propriétaire
    if (recipe.userId !== context.session?.user?.id) {
      throw new Error("Non autorisé");
    }
    return { recipe };
  },
  component: ModifierRecettePage,
});

type Ingredient = { name: string; quantity: string; unit: string };

function ModifierRecettePage() {
  const navigate = useNavigate();
  const { recipe } = Route.useLoaderData();

  const [title, setTitle] = useState(recipe.title);
  const [description, setDescription] = useState(recipe.description || "");
  const [imageUrl, setImageUrl] = useState(recipe.imageUrl || "");
  const [prepTime, setPrepTime] = useState(recipe.prepTime?.toString() || "");
  const [cookTime, setCookTime] = useState(recipe.cookTime?.toString() || "");
  const [servings, setServings] = useState(recipe.servings?.toString() || "");
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">(
    recipe.difficulty,
  );
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    recipe.ingredients.map((ing) => ({
      name: ing.name,
      quantity: ing.quantity || "",
      unit: ing.unit || "",
    })),
  );
  const [steps, setSteps] = useState<string[]>(
    recipe.steps.map((s) => s.instruction),
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", quantity: "", unit: "" }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (
    index: number,
    field: keyof Ingredient,
    value: string,
  ) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  const addStep = () => {
    setSteps([...steps, ""]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, value: string) => {
    const updated = [...steps];
    updated[index] = value;
    setSteps(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const validIngredients = ingredients.filter((i) => i.name.trim());
      const validSteps = steps.filter((s) => s.trim());

      if (validIngredients.length === 0) {
        setError("Ajoutez au moins un ingrédient");
        setLoading(false);
        return;
      }

      if (validSteps.length === 0) {
        setError("Ajoutez au moins une étape");
        setLoading(false);
        return;
      }

      await updateRecipe({
        data: {
          id: recipe.id,
          title,
          description: description || undefined,
          imageUrl: imageUrl || undefined,
          prepTime: prepTime ? parseInt(prepTime) : undefined,
          cookTime: cookTime ? parseInt(cookTime) : undefined,
          servings: servings ? parseInt(servings) : undefined,
          difficulty,
          ingredients: validIngredients,
          steps: validSteps,
        },
      });

      navigate({ to: "/dashboard/recettes/$id", params: { id: recipe.id } });
    } catch {
      setError("Erreur lors de la modification de la recette");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button variant="ghost" className="mb-6" asChild>
        <Link to="/dashboard/recettes/$id" params={{ id: recipe.id }}>
          <ArrowLeft size={16} />
          Retour à la recette
        </Link>
      </Button>

      <h1 className="text-3xl font-bold text-foreground mb-8">
        Modifier la recette
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">URL de l'image</Label>
              <Input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prepTime">Préparation (min)</Label>
                <Input
                  id="prepTime"
                  type="number"
                  min="0"
                  value={prepTime}
                  onChange={(e) => setPrepTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cookTime">Cuisson (min)</Label>
                <Input
                  id="cookTime"
                  type="number"
                  min="0"
                  value={cookTime}
                  onChange={(e) => setCookTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="servings">Portions</Label>
                <Input
                  id="servings"
                  type="number"
                  min="1"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Difficulté</Label>
                <Select
                  value={difficulty}
                  onValueChange={(value) =>
                    setDifficulty(value as "EASY" | "MEDIUM" | "HARD")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EASY">Facile</SelectItem>
                    <SelectItem value="MEDIUM">Moyen</SelectItem>
                    <SelectItem value="HARD">Difficile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Ingrédients</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addIngredient}
            >
              <Plus size={16} />
              Ajouter
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {ingredients.map((ing, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  placeholder="Quantité"
                  value={ing.quantity}
                  onChange={(e) =>
                    updateIngredient(index, "quantity", e.target.value)
                  }
                  className="w-20"
                />
                <Input
                  placeholder="Unité"
                  value={ing.unit}
                  onChange={(e) =>
                    updateIngredient(index, "unit", e.target.value)
                  }
                  className="w-20"
                />
                <Input
                  placeholder="Ingrédient"
                  value={ing.name}
                  onChange={(e) =>
                    updateIngredient(index, "name", e.target.value)
                  }
                  className="flex-1"
                />
                {ingredients.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeIngredient(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X size={16} />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Étapes</CardTitle>
            <Button type="button" variant="ghost" size="sm" onClick={addStep}>
              <Plus size={16} />
              Ajouter
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-2 items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm mt-2">
                  {index + 1}
                </span>
                <Textarea
                  placeholder="Décrivez cette étape..."
                  value={step}
                  onChange={(e) => updateStep(index, e.target.value)}
                  rows={2}
                  className="flex-1"
                />
                {steps.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeStep(index)}
                    className="text-destructive hover:text-destructive mt-2"
                  >
                    <X size={16} />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? "Enregistrement..." : "Enregistrer les modifications"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              navigate({
                to: "/dashboard/recettes/$id",
                params: { id: recipe.id },
              })
            }
          >
            Annuler
          </Button>
        </div>
      </form>
    </div>
  );
}
