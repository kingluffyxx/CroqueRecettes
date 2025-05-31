<?php

namespace App\Twig\Components;


use App\Form\RecipeForm;
use App\Entity\Recipe;
use App\Repository\RecipeRepository;
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
final class SearchRecipe extends AbstractController
{
    use ComponentToolsTrait;
    use DefaultActionTrait;

    #[LiveProp(writable: true)]
    public string $query = '';

    public ?Recipe $recipe = null;
    private EntityManagerInterface $em;
    private RecipeRepository $recipeRepository;

    public function __construct(EntityManagerInterface $em, RecipeRepository $recipeRepository)
    {
        $this->em = $em;
        $this->recipeRepository = $recipeRepository;
    }
    public function getRecipes(): array
    {
        // example method that returns an array of Products
        return $this->recipeRepository->search($this->query);
    }
}
