import React, { useState, useEffect } from "react";
export default function RecipeCard({
  title,
  description,
  ingredients,
  steps,
  id,
  image,
  onDelete,
  onEditClick,
  onFavoriteClick,
  userFavoriteIds = [],
  type,
}) {
  
  const isFavorite = userFavoriteIds.includes(id);

  function truncate(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '…' : text;
  }

  const handleDelete = async () => {
    try {
      const response = await fetch("/dashboard/recipe/" + id, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const err = await response.json();
        alert(err.message || "Erreur lors de la suppression.");
        return;
      }

      // Préviens le parent que la recette a été supprimée
      onDelete?.(id);
    } catch (e) {
      console.error("Erreur réseau : ", e);
      alert("Erreur réseau, réessayez plus tard.");
    }
  };

  

  return (
    <div className="bg-base-100 shadow-sm card">
      <figure className="">
        {!image ? (
          <img
            src="/images/anh-nguyen-kcA-c3f_3FE-unsplash.jpg"
            alt="image_recipe"
            className="w-full h-66 object-cover"
          />
        ) : (
          <img
            src={image}
            alt="image_recipe"
            className="w-full h-66 object-cover"
          />
        )}
      </figure>
      <div className="items-center text-center card-body">
        <h2 className="card-title">{title}</h2>
        <p>{truncate(description, 250)}</p>
        <p className="hidden">{ingredients}</p>
        <p className="hidden">{steps}</p>
        <div className="justify-end card-actions">
         <a href={`/dashboard/recipe/${id}`}
          className="btn btn-circle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
          </a>
          {type === "create" ? (
            <>
              <button
                className="btn btn-circle btn-soft btn-info"
                onClick={() =>
                  onEditClick({ id, title, description, ingredients, steps })
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                  />
                </svg>
              </button>
              <button
                className="btn btn-circle btn-soft btn-error"
                onClick={handleDelete}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>
              </button>
            </>
          ) : (
            <>
              {isFavorite ? (
                <button
                  className="bg-pink-100 hover:bg-pink-200 p-2 border-pink-200 transition btn btn-circle"
                  onClick={() => onFavoriteClick(id)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="w-6 h-6 text-pink-600"
                  >
                    <path d="M12.001 4.529c2.349-2.362 6.145-2.362 8.494 0 2.349 2.362 2.349 6.194 0 8.556l-7.438 7.47a1.5 1.5 0 01-2.115 0l-7.437-7.47c-2.35-2.362-2.35-6.194 0-8.556 2.35-2.362 6.145-2.362 8.496 0z" />
                  </svg>
                </button>
              ) : (
                <button
                  className="hover:bg-pink-100 p-2 border-pink-100 transition btn btn-circle"
                  onClick={() => onFavoriteClick(id)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="w-6 h-6 text-pink-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a5.5 5.5 0 017.782 0L12 6.879l-.1-.1a5.5 5.5 0 017.9 7.9l-7.8 7.8-7.8-7.8a5.5 5.5 0 010-7.9z"
                    />
                  </svg>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
