<?php

namespace App\Controller;

use App\Entity\Recipe;
use App\Form\RecipeForm;
use App\Entity\Favorite;
use App\Repository\RecipeRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\String\Slugger\SluggerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Cloudinary\Cloudinary;

#[Route('/dashboard')]
#[IsGranted('ROLE_USER')]
class RecipeController extends AbstractController
{
    private EntityManagerInterface $em;
    private RecipeRepository $recipeRepository;

    public function __construct(EntityManagerInterface $em, RecipeRepository $recipeRepository)
    {
        $this->em = $em;
        $this->recipeRepository = $recipeRepository;
    }

    #[Route('/', name: 'app_dashboard', methods: ['GET'])]
    public function index(NormalizerInterface $normalizer): Response
    {
        $repository =  $this->em->getRepository(Recipe::class);
        $user = $this->getUser();

        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], 401);
        }

        $favoriteRecipes = $user->getFavorites()->map(fn($f) => $f->getRecipe()->getId());
        // look for a single Product by name
        $recipes = $repository->findAll();
        return $this->render('dashboard/index.html.twig', [
            'recipes' => $normalizer->normalize($recipes, null, ['groups' => 'read']),
            'favorites' => $normalizer->normalize($favoriteRecipes, null, ['groups' => 'read']),
        ]);
    }

    #[Route('/my_recipes', name: 'my_recipes', methods: ['GET'])]
    public function getMyRecipes(NormalizerInterface $normalizer): Response
    {
        $user = $this->getUser();

        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], 401);
        }

        $repository =  $this->em->getRepository(Recipe::class);

        // look for a single Product by name
        $recipes = $repository->findBy(['author' => $user]);
        return $this->render('dashboard/recipe/my_recipes.html.twig', [
            'recipes' => $normalizer->normalize($recipes, null, ['groups' => 'read']),
            'favorites' => [],
            'title' => 'Mes recettes',
            'type' => 'create',
        ]);
    }

    #[Route('/my_favorites', name: 'my_favorites', methods: ['GET'])]
    public function getFavorites(NormalizerInterface $normalizer): Response
    {
        $user = $this->getUser();

        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], 401);
        }

        $recipes = $user->getFavorites()->map(fn($f) => $f->getRecipe());
        $favoriteRecipesIds = $user->getFavorites()->map(fn($f) => $f->getRecipe()->getId());

        
        return $this->render('dashboard/recipe/my_recipes_favorites.html.twig', [
            'recipes' => $normalizer->normalize($recipes, null, ['groups' => 'read']),
            'favorites' => $normalizer->normalize($favoriteRecipesIds, null, ['groups' => 'read']),
            'title' => 'Mes recettes favorites',
            'type' => 'favorites',
        ]);
    }

    #[Route('/recipe/{id}', name: 'recipe_show', methods: ['GET'])]
    public function show(Recipe $recipe): Response
    {
        return $this->render('dashboard/recipe/show.html.twig', [
            'recipe' => $recipe,
        ]);
    }

    #[Route('/recipe/{id}', name: 'recipe_update', methods: ['POST'])]
    public function update(Request $request, Recipe $recipe, NormalizerInterface $normalizer, SluggerInterface $slugger): Response
    {
        $recipe->setTitle($request->request->get('title'));
        $recipe->setDescription($request->request->get('description'));
        $recipe->setIngredients($request->request->get('ingredients'));
        $recipe->setSteps($request->request->get('steps'));

        $fileUpload = $request->files->get('image');
        if ($fileUpload) {

            $cloudinary = new Cloudinary( $this->getParameter('cloudinary_url'));
            $cloudinary->uploadApi()->upload($fileUpload->getRealPath(), [
                'public_id' => $recipe->getImage(),
                'resource_type' => 'image',
                'overwrite' => true,
                'invalidate' => true, // Invalider le cache
            ]);
        }

        $this->em->flush();
        return $this->json($normalizer->normalize($recipe, null, ['groups' => 'read']), 200, [], ['groups' => 'recipe:read']);
    }

    #[Route('/recipe/{id}', name: 'recipe_delete', methods: ['DELETE'])]
    public function delete(Recipe $recipe): Response
    {
        $this->em->remove($recipe);
        $this->em->flush();

        return new Response(null, 204);
    }

    #[Route('/add_favorite/{id}', name: 'recipe_add_favorite', methods: ['POST'])]
    public function addFavorite(Recipe $recipe): Response
    {
        $user = $this->getUser();

        $favoriteRepo = $this->em->getRepository(Favorite::class);
        $favorite = $favoriteRepo->findOneBy([
            'user' => $user,
            'recipe' => $recipe,
        ]);

        if ($favorite) {
            // Supprimer le favori
            $this->em->remove($favorite);
            $this->em->flush();

            return $this->json(['message' => 'Favori retiré'], 200);
        }

        // Sinon, on l'ajoute
        $favorite = new Favorite();
        $favorite->setUser($user);
        $favorite->setRecipe($recipe);

        $recipe->addFavorite($favorite);
        $this->em->persist($favorite);
        $this->em->flush();

        return $this->json(['message' => 'Favori ajouté'], 201);
    }
}
