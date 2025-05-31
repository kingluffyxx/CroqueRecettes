<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use App\Entity\Recipe;
use App\Form\RecipeForm;
use App\Repository\RecipeRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\String\Slugger\SluggerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;

final class DashboardController extends AbstractController
{

    private EntityManagerInterface $em;
    private RecipeRepository $recipeRepository;

    public function __construct(EntityManagerInterface $em, RecipeRepository $recipeRepository)
    {
        $this->em = $em;
        $this->recipeRepository = $recipeRepository;
    }

    #[Route('/dashboard', name: 'app_dashboard', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
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
}
