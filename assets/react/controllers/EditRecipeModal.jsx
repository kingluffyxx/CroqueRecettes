import React, { useState, useEffect } from "react";

export default function EditRecipeModal({ recipe, onSave, onClose }) {
  const [title, setTitle] = useState(recipe?.title || "");
  const [description, setDescription] = useState(recipe?.description || "");
  const [ingredients, setIngredients] = useState(recipe?.ingredients || "");
  const [steps, setSteps] = useState(recipe?.steps || "");
  const [image, setImage] = useState(null); // For file input

  useEffect(() => {
    if (recipe) {
      setTitle(recipe.title);
      setDescription(recipe.description);
      setIngredients(recipe.ingredients);
      setSteps(recipe.steps);
    }
  }, [recipe]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("ingredients", ingredients);
    formData.append("steps", steps);
    if (image) {
      formData.append("image", image);
    }
    const response = await fetch(`/dashboard/recipe/${recipe.id}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      alert("Erreur lors de la mise à jour");
      return;
    }

    let updated = await response.json();
    updated.image = updated.image+"?v="+Date.now(); // Force reload of image
    onSave(updated);
    onClose();
  };

  return (
    <dialog id="editRecipe" className="modal">
      <div className="w-11/12 max-w-2xl modal-box">
        <form method="dialog">
          <button className="top-2 right-2 absolute btn btn-sm btn-circle btn-ghost">
            ✕
          </button>
        </form>
        <form onSubmit={handleSubmit} className="">
          <fieldset className="bg-base-200 p-4 border border-base-300 rounded-box w-full fieldset">
            <legend className="fieldset-legend">Edition de la recette</legend>

            <label className="label required" htmlFor="title">Titre de la recette</label>
            <input
              id="title"
              type="text"
              className="mb-3 w-full input"
              value={title}
              required
              placeholder="Titre de la recette"
              onChange={(e) => setTitle(e.target.value)}
            />

            <label className="label required" htmlFor="description">Description courte</label>
            <textarea
              id="description"
              className="mb-3 w-full textarea"
              value={description}
              required
              placeholder="Description courte"
              onChange={(e) => setDescription(e.target.value)}
            />

            <label className="label required" htmlFor="ingredients">Liste des ingrédients</label>
            <textarea
              id="ingredients"
              className="mb-3 w-full textarea"
              value={ingredients}
              required
              placeholder="Liste des ingrédients"
              onChange={(e) => setIngredients(e.target.value)}
            />

            <label className="label required" htmlFor="steps">Décrivez les étapes</label>
            <textarea
              id="steps"
              className="mb-3 w-full textarea"
              value={steps}
              required
              placeholder="Décrivez les étapes"
              onChange={(e) => setSteps(e.target.value)}
            />

            <fieldset className="mb-4">
              <legend className="mb-1 font-semibold">Pick a file</legend>
              <input
                id="file"
                type="file"
                className="w-full file-input"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
              />
              <label className="text-sm label" htmlFor="file">Max size 5MB</label>
            </fieldset>

            <button
              type="submit"
              className="px-4 py-2 rounded transition btn btn-primary"
            >
              Enregistrer
            </button>
          </fieldset>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
