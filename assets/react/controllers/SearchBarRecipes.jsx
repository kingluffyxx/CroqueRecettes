import React, { useState, useEffect } from "react";
import RecipesSection from "./RecipesSection";


export default function RecipeSearch({recipes, favorites}) {
    const [query, setQuery] = useState("");

    return (    
        <>
            <div className="flex justify-center items-center">
                <label className="w-6/12 input">
                    <svg className="opacity-50 h-[1em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.3-4.3"></path>
                        </g>
                    </svg>
                    <input type="search" className="focus:ring-0 w-full" placeholder="Rechercher une recette" value={query}
                        onChange={(e) => setQuery(e.target.value)}/>
                </label>
                <label htmlFor="default-search" className="sr-only mb-2 font-medium text-gray-900 text-sm">Rechercher</label>
            </div>
         <RecipesSection q={query} recipes={recipes} userFavoriteIds={favorites} type="read"/>
        </>
        
    )
}
