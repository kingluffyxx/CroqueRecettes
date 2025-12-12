import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { createServerFn } from "@tanstack/react-start";
import { prisma } from "../../lib/db";
import { auth } from "../../lib/auth";

const getSession = createServerFn().handler(async ({ request }) => {
  const session = await auth.api.getSession({ headers: request.headers });
  return session;
});

const createRecipe = createServerFn().handler(
  async ({
    data,
  }: {
    data: {
      title: string;
      description?: string;
      imageUrl?: string;
      prepTime?: number;
      cookTime?: number;
      servings?: number;
      difficulty: "EASY" | "MEDIUM" | "HARD";
      ingredients: { name: string; quantity?: string; unit?: string }[];
      steps: string[];
      userId: string;
    };
  }) => {
    const { ingredients, steps, ...recipeData } = data;

    const recipe = await prisma.recipe.create({
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

export const Route = createFileRoute("/recettes/nouvelle")({
  beforeLoad: async () => {
    const session = await getSession();
    if (!session) {
      throw redirect({ to: "/auth/login" });
    }
    // Utilisateur connecté -> rediriger vers dashboard
    throw redirect({ to: "/dashboard/recettes/nouvelle" });
  },
  component: NouvelleRecettePage,
});

type Ingredient = { name: string; quantity: string; unit: string };

function NouvelleRecettePage() {
  const navigate = useNavigate();
  const { session } = Route.useRouteContext();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState("");
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">(
    "MEDIUM",
  );
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: "", quantity: "", unit: "" },
  ]);
  const [steps, setSteps] = useState<string[]>([""]);
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

      const recipe = await createRecipe({
        data: {
          title,
          description: description || undefined,
          imageUrl: imageUrl || undefined,
          prepTime: prepTime ? parseInt(prepTime) : undefined,
          cookTime: cookTime ? parseInt(cookTime) : undefined,
          servings: servings ? parseInt(servings) : undefined,
          difficulty,
          ingredients: validIngredients,
          steps: validSteps,
          userId: session.user.id,
        },
      });

      navigate({ to: "/recettes/$id", params: { id: recipe.id } });
    } catch {
      setError("Erreur lors de la création de la recette");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Nouvelle recette
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h2 className="text-lg font-semibold">Informations générales</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL de l'image
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Préparation (min)
                </label>
                <input
                  type="number"
                  min="0"
                  value={prepTime}
                  onChange={(e) => setPrepTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cuisson (min)
                </label>
                <input
                  type="number"
                  min="0"
                  value={cookTime}
                  onChange={(e) => setCookTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Portions
                </label>
                <input
                  type="number"
                  min="1"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulté
                </label>
                <select
                  value={difficulty}
                  onChange={(e) =>
                    setDifficulty(e.target.value as "EASY" | "MEDIUM" | "HARD")
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="EASY">Facile</option>
                  <option value="MEDIUM">Moyen</option>
                  <option value="HARD">Difficile</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Ingrédients</h2>
              <button
                type="button"
                onClick={addIngredient}
                className="text-orange-600 hover:text-orange-700 text-sm"
              >
                + Ajouter
              </button>
            </div>
            <div className="space-y-3">
              {ingredients.map((ing, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Quantité"
                    value={ing.quantity}
                    onChange={(e) =>
                      updateIngredient(index, "quantity", e.target.value)
                    }
                    className="w-20 px-2 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Unité"
                    value={ing.unit}
                    onChange={(e) =>
                      updateIngredient(index, "unit", e.target.value)
                    }
                    className="w-20 px-2 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Ingrédient"
                    value={ing.name}
                    onChange={(e) =>
                      updateIngredient(index, "name", e.target.value)
                    }
                    className="flex-1 px-2 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Étapes</h2>
              <button
                type="button"
                onClick={addStep}
                className="text-orange-600 hover:text-orange-700 text-sm"
              >
                + Ajouter
              </button>
            </div>
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm mt-2">
                    {index + 1}
                  </span>
                  <textarea
                    placeholder="Décrivez cette étape..."
                    value={step}
                    onChange={(e) => updateStep(index, e.target.value)}
                    rows={2}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="text-red-500 hover:text-red-700 mt-2"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
            >
              {loading ? "Création..." : "Créer la recette"}
            </button>
            <a
              href="/recettes"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-center"
            >
              Annuler
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
