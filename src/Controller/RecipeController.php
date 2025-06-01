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

    #[Route('/recipe/create', name: 'recipe_create', methods: ['POST'])]
    public function create(Request $request, SluggerInterface $slugger): JsonResponse
    {
        $recipe = new Recipe();

        // On crée un tableau avec les champs texte uniquement
        $form = $this->createForm(RecipeForm::class, $recipe);
        $form->handleRequest($request); // fonctionne aussi avec AJAX

        // Manuellement : récupérer l'image
        /** @var UploadedFile|null $imageFile */
        $imageFile = $request->files->get('image');

        if ($form->isSubmitted() && $form->isValid()) {
            // Si image envoyée
            if ($imageFile) {
                $originalFilename = pathinfo($imageFile->getClientOriginalName(), PATHINFO_FILENAME);
                $safeFilename = $slugger->slug($originalFilename);
                $newFilename = $safeFilename . '-' . uniqid() . '.' . $imageFile->guessExtension();

                try {
                    $imageFile->move(
                        $this->getParameter('uploads_directory'), // à définir dans services.yaml
                        $newFilename
                    );
                    $recipe->setImage($newFilename);
                } catch (FileException $e) {
                    return new JsonResponse(['errors' => ['image' => ['Erreur lors de l’upload.']]], 400);
                }
            }

            $recipe->setAuthor($this->getUser());
            $this->em->persist($recipe);
            $this->em->flush();

            return new JsonResponse(['success' => true], 201);
        }

        // Erreurs de validation
        $errors = [];
        foreach ($form->getErrors() as $error) {

            $field = $error->getOrigin()->getName();
            $errors[$field][] = $error->getMessage();
        }

        return new JsonResponse(['errors' => $errors], 400);
    }

    #[Route('/recipe/{id}', name: 'recipe_update', methods: ['POST'])]
    public function update(Request $request, Recipe $recipe, NormalizerInterface $normalizer): Response
    {
        $recipe->setTitle($request->request->get('title'));
        $recipe->setDescription($request->request->get('description'));
        $recipe->setIngredients($request->request->get('ingredients'));
        $recipe->setSteps($request->request->get('steps'));

        $fileUpload = $request->files->get('image');
        if ($fileUpload) {
            $uploadDir = $this->getParameter('kernel.project_dir') . '/public/uploads';

            // Créer le dossier s'il n'existe pas
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            // Générer un nom de fichier unique
            $originalFilename = pathinfo($fileUpload->getClientOriginalName(), PATHINFO_FILENAME);
            $safeFilename = $this->slugify($originalFilename);
            $newFilename = $safeFilename . '-' . uniqid() . '.' . $fileUpload->guessExtension();

            // Déplacer le fichier
            $fileUpload->move($uploadDir, $newFilename);

            // Stocker le nom du fichier
            $recipe->setImage($newFilename);
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

    private function slugify(string $text): string
    {
        // Convertir en minuscules et remplacer les caractères spéciaux
        $text = strtolower($text);
        $text = preg_replace('/[^a-z0-9]+/', '-', $text);
        $text = trim($text, '-');

        return $text ?: 'image';
    }
}
