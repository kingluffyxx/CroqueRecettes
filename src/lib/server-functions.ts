"use server";

import { createServerFn } from "@tanstack/react-start";
import { prisma } from "./db";

// ==================== RECETTES ====================

export const getRecipes = createServerFn().handler(async () => {
  const recipes = await prisma.recipe.findMany({
    include: {
      user: { select: { name: true } },
      ingredients: { orderBy: { order: "asc" } },
      steps: { orderBy: { order: "asc" } },
      categories: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return recipes;
});

export const getRecipeById = createServerFn().handler(
  async (ctx: { data: string }) => {
    const recipe = await prisma.recipe.findUnique({
      where: { id: ctx.data },
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

export const getUserRecipes = createServerFn().handler(
  async (ctx: { data: string }) => {
    const recipes = await prisma.recipe.findMany({
      where: { userId: ctx.data },
      include: {
        ingredients: { orderBy: { order: "asc" } },
        steps: { orderBy: { order: "asc" } },
        categories: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return recipes;
  },
);

interface CreateRecipeInput {
  title: string;
  description?: string;
  imageUrl?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  ingredients: { name: string; quantity?: string; unit?: string }[];
  steps: string[];
  categoryIds?: string[];
  userId: string;
}

export const createRecipe = createServerFn().handler(
  async (ctx: { data: CreateRecipeInput }) => {
    const { ingredients, steps, categoryIds, ...recipeData } = ctx.data;

    const recipe = await prisma.recipe.create({
      data: {
        ...recipeData,
        imageUrl: recipeData.imageUrl || null,
        ingredients: {
          create: ingredients.map(
            (
              ing: { name: string; quantity?: string; unit?: string },
              index: number,
            ) => ({
              ...ing,
              order: index,
            }),
          ),
        },
        steps: {
          create: steps.map((instruction: string, index: number) => ({
            instruction,
            order: index,
          })),
        },
        categories: categoryIds
          ? { connect: categoryIds.map((id: string) => ({ id })) }
          : undefined,
      },
      include: {
        ingredients: true,
        steps: true,
        categories: true,
      },
    });

    return recipe;
  },
);

interface UpdateRecipeInput {
  id: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  ingredients?: { name: string; quantity?: string; unit?: string }[];
  steps?: string[];
  categoryIds?: string[];
}

export const updateRecipe = createServerFn().handler(
  async (ctx: { data: UpdateRecipeInput }) => {
    const { id, ingredients, steps, categoryIds, ...recipeData } = ctx.data;

    // Supprimer les anciens ingrédients et étapes
    await prisma.ingredient.deleteMany({ where: { recipeId: id } });
    await prisma.step.deleteMany({ where: { recipeId: id } });

    const recipe = await prisma.recipe.update({
      where: { id },
      data: {
        ...recipeData,
        imageUrl: recipeData.imageUrl || null,
        ingredients: ingredients
          ? {
              create: ingredients.map(
                (
                  ing: { name: string; quantity?: string; unit?: string },
                  index: number,
                ) => ({
                  ...ing,
                  order: index,
                }),
              ),
            }
          : undefined,
        steps: steps
          ? {
              create: steps.map((instruction: string, index: number) => ({
                instruction,
                order: index,
              })),
            }
          : undefined,
        categories: categoryIds
          ? { set: categoryIds.map((catId: string) => ({ id: catId })) }
          : undefined,
      },
      include: {
        ingredients: true,
        steps: true,
        categories: true,
      },
    });

    return recipe;
  },
);

export const deleteRecipe = createServerFn().handler(
  async (ctx: { data: string }) => {
    await prisma.recipe.delete({ where: { id: ctx.data } });
    return { success: true };
  },
);

// ==================== CATEGORIES ====================

export const getCategories = createServerFn().handler(async () => {
  return await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
});

export const createCategory = createServerFn().handler(
  async (ctx: { data: string }) => {
    return await prisma.category.create({ data: { name: ctx.data } });
  },
);
