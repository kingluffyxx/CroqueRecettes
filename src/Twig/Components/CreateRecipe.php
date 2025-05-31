<?php

namespace App\Twig\Components;


use App\Form\RecipeForm;
use Symfony\Component\HttpFoundation\Request;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Form\FormInterface;
use Symfony\UX\LiveComponent\Attribute\AsLiveComponent;
use Symfony\UX\LiveComponent\Attribute\LiveAction;
use Symfony\UX\LiveComponent\Attribute\LiveProp;
use Symfony\UX\LiveComponent\ComponentWithFormTrait;
use Symfony\UX\LiveComponent\DefaultActionTrait;
use Symfony\UX\LiveComponent\ComponentToolsTrait;
use Symfony\Component\HttpFoundation\File\UploadedFile;

#[AsLiveComponent]
final class CreateRecipe extends AbstractController
{
    use ComponentWithFormTrait;
    use ComponentToolsTrait;
    use DefaultActionTrait;
    // #[LiveProp]
    // public bool $isSuccessful = false;

    // #[LiveProp]
    // public ?string $newUserEmail = null;

    #[LiveProp]
    public ?string $singleUploadFilename = null;
    #[LiveProp]
    public ?string $singleFileUploadError = null;

    public function __construct(
        private readonly EntityManagerInterface $entityManager
    ) {}

    protected function instantiateForm(): FormInterface
    {
        return $this->createForm(RecipeForm::class);
    }

    public function hasValidationErrors(): bool
    {
        return $this->getForm()->isSubmitted() && !$this->getForm()->isValid();
    }


    #[LiveAction]
    public function saveRecipe(Request $request)
    {
        $this->submitForm();

        if (!$this->getForm()->isValid()) {
            return;
        }

        $singleFileUpload = $request->files->get('image_recipe');

        //dd($singleFileUpload);
        $recipe = $this->getForm()->getData();
        $recipe->setAuthor($this->getUser());
        if ($singleFileUpload) {
            try {
                $uploadDir = $this->getParameter('kernel.project_dir') . '/public/uploads';

                // Créer le dossier s'il n'existe pas
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0755, true);
                }

                // Générer un nom de fichier unique
                $originalFilename = pathinfo($singleFileUpload->getClientOriginalName(), PATHINFO_FILENAME);
                $safeFilename = $this->slugify($originalFilename);
                $newFilename = $safeFilename . '-' . uniqid() . '.' . $singleFileUpload->guessExtension();

                // Déplacer le fichier
                $singleFileUpload->move($uploadDir, $newFilename);

                // Stocker le nom du fichier
                $recipe->setImage($newFilename); // Assure-toi que cette méthode existe dans ton entité Recipe
                //$this->uploadedFileName = $newFilename;

                //return true;

            } catch (\Exception $e) {
                //$this->uploadError = 'Erreur lors de l\'upload : ' . $e->getMessage();
                return false;
            }
        }

        // Gestion de l'upload de fichier
        // $uploadSuccess = $this->handleFileUpload($recipe);

        // if (!$uploadSuccess) {
        //     return; // Arrêter si l'upload a échoué
        // }

        $this->entityManager->persist($recipe);
        $this->entityManager->flush();

        $this->resetForm();

        // JS event dispatché côté template
        $this->dispatchBrowserEvent('recipe:created', [
            'id' => $recipe->getId(),
            'title' => $recipe->getTitle(),
            'description' => $recipe->getDescription(),
            'image' => $recipe->getImage(),
            // Ajoute ce que tu veux transmettre à React ici
        ]);
        // save to the database
        // or, instead of creating a LiveAction, allow the form to submit
        // to a normal controller: that's even better.
        // $newUser = $this->getFormInstance()->getData();

        // $this->newUserEmail = $this->getForm()
        //     ->get('email')
        //     ->getData();
        // $this->isSuccessful = true;
    }

    private function handleFileUpload($recipe): bool
    {
        /** @var UploadedFile|null $file */
        $file = $this->getForm()->get('image')->getData();

        if (!$file) {
            return true; // Pas de fichier, c'est OK
        }

        // Validation du fichier
        if (!$this->validateFile($file)) {
            return false;
        }

        try {
            $uploadDir = $this->getParameter('kernel.project_dir') . '/public/uploads';

            // Créer le dossier s'il n'existe pas
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            // Générer un nom de fichier unique
            $originalFilename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $safeFilename = $this->slugify($originalFilename);
            $newFilename = $safeFilename . '-' . uniqid() . '.' . $file->guessExtension();

            // Déplacer le fichier
            $file->move($uploadDir, $newFilename);

            // Stocker le nom du fichier
            $recipe->setImage($newFilename); // Assure-toi que cette méthode existe dans ton entité Recipe
            $this->uploadedFileName = $newFilename;

            return true;
        } catch (\Exception $e) {
            $this->uploadError = 'Erreur lors de l\'upload : ' . $e->getMessage();
            return false;
        }
    }

    private function validateFile(UploadedFile $file): bool
    {
        // Vérifier la taille (5MB max)
        if ($file->getSize() > 5 * 1024 * 1024) {
            $this->uploadError = 'Le fichier est trop volumineux (5MB maximum)';
            return false;
        }

        // Vérifier le type MIME
        $allowedMimes = ['image/jpeg', 'image/png'];
        if (!in_array($file->getMimeType(), $allowedMimes)) {
            $this->uploadError = 'Format de fichier non supporté. Utilisez JPEG, PNG';
            return false;
        }

        return true;
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
