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
use Cloudinary\Cloudinary;

#[AsLiveComponent]
final class CreateRecipe extends AbstractController
{
    use ComponentWithFormTrait;
    use ComponentToolsTrait;
    use DefaultActionTrait;
    #[LiveProp(writable: true)]
    public ?UploadedFile $imageRecipe = null;

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

        $recipe = $this->getForm()->getData();
        $recipe->setAuthor($this->getUser());
        if ($singleFileUpload) {
            try {

                $originalFilename = pathinfo($singleFileUpload->getClientOriginalName(), PATHINFO_FILENAME);
                $safeFilename = $this->slugify($originalFilename) . '-' . uniqid();

                $cloudinary = new Cloudinary($this->getParameter('cloudinary_url'));
                $cloudinary->uploadApi()->upload($singleFileUpload->getRealPath(), [
                    'public_id' => $safeFilename,
                    'resource_type' => 'image',
                ]);

                $recipe->setImage($safeFilename);
            } catch (\Exception $e) {
                echo "Erreur lors de l'upload de l'image : " . $e->getMessage();
                return false;
            }
        }

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
