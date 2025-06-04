import React, { useState, useEffect } from "react";
  import { ToastContainer, toast } from 'react-toastify';

import RecipeCard from "./RecipeCard";
import EditRecipeModal from "./EditRecipeModal";

export default function RecipesSection({
  recipes: initialRecipes,
  userFavoriteIds = [],
  idModal = "",
  q = "",
  type = "edit",
}) {
  const [recipes, setRecipes] = useState(initialRecipes || []);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState(userFavoriteIds);
  const notifySuccess = (msg) => toast.success(msg);
  const notifyError = (msg) => toast.error(msg);
  
  useEffect(() => {
    if (!q) {
      setRecipes(initialRecipes);
    } else {
      const lowerQ = q.toLowerCase();
      setRecipes(
        (initialRecipes || []).filter(
          (r) =>
            r.title.toLowerCase().includes(lowerQ) ||
            r.description.toLowerCase().includes(lowerQ)
        )
      );
    }
  }, [q, initialRecipes]);

  useEffect(() => {
    const handleNewRecipe = (event) => {
      const newRecipe = event.detail;
      setRecipes((prev) => [newRecipe, ...prev]);
    };

    window.addEventListener("recipe:created", handleNewRecipe);

    return () => {
      window.removeEventListener("recipe:created", handleNewRecipe);
    };
  }, []);

  const handleEdit = (recipe) => {
    setEditingRecipe(recipe);
    document.getElementById(idModal).showModal();
  };

  const handleDelete = (deletedId) => {
    notifySuccess("Recette supprimée avec succès.");
    setRecipes((prev) => prev.filter((r) => r.id !== deletedId));
  };

  const handleUpdate = (updated) => {
    notifySuccess("Recette mise à jour avec succès.");
    setRecipes((prev) =>
      prev.map((recipe) => (recipe.id === updated.id ? updated : recipe))
    );
  };

  const handleFavorite = async (recipeId) => {
    try {
      const response = await fetch("/dashboard/add_favorite/" + recipeId, {
        method: "POST",
      });

      const res = await response.json();
      if (!response.ok) {
        
        notifyError(res.message || "Erreur lors de la suppression.");
        return;
      }
      notifySuccess(res.message);
    } catch (e) {
      console.error("Erreur réseau : ", e);
      notifyError("Erreur réseau, réessayez plus tard.");
    }
    const alreadyFavorite = favoriteIds.includes(recipeId);
    setFavoriteIds((prev) =>
      alreadyFavorite
        ? prev.filter((id) => id !== recipeId)
        : [...prev, recipeId]
    );
    if (type === "favorites") {
      setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
    }
  };

  return (
    <>
      {recipes.length > 0 ? (
        <section className="gap-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 py-8">
          {recipes.map((r) => (
            <RecipeCard
              key={r.id}
              onDelete={handleDelete}
              onEditClick={handleEdit}
              onFavoriteClick={handleFavorite}
              type={type}
              userFavoriteIds={favoriteIds}
              {...r}
            />
          ))}
        </section>
      ) : (
        <div className="flex justify-center items-center py-20 w-full text-gray-500 text-3xl">
          Aucune recette trouvée
        </div>
      )}

      <EditRecipeModal
        recipe={editingRecipe}
        onClose={() => document.getElementById(idModal).close()}
        onSave={handleUpdate}
      />
      <ToastContainer />
    </>
  );
}
