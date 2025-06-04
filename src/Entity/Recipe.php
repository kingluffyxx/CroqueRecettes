<?php

namespace App\Entity;

use App\Repository\RecipeRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: RecipeRepository::class)]
class Recipe
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['read'])]
    private ?string $title = null;

    #[ORM\Column(type: 'text')]
    #[Groups(groups: ['read'])]
    private ?string $description;

    #[ORM\Column(type: 'text')]
    #[Groups(groups: ['read'])]

    private ?string $ingredients = null;

    #[ORM\Column(type: 'text')]
    #[Groups(groups: ['read'])]

    private ?string $steps = null;

    #[ORM\Column(nullable: true)]
    #[Groups(groups: ['read'])]
    private ?string $image = null;

    #[ORM\ManyToOne(inversedBy: 'recipes')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $author = null;

    #[ORM\OneToMany(mappedBy: 'recipe', targetEntity: Favorite::class, orphanRemoval: true)]
    private Collection $favorites;

    public function __construct()
    {
        $this->favorites = new ArrayCollection();
    }
    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function getDescription(): string
    {
        return $this->description;
    }

    public function setDescription(string $description): static
    {
        $this->description = $description;
        return $this;
    }

    public function getIngredients(): ?string
    {
        return $this->ingredients;
    }

    public function setIngredients(?string $ingredients): self
    {
        $this->ingredients = $ingredients;
        return $this;
    }

    public function getSteps(): ?string
    {
        return $this->steps;
    }

    public function setSteps(?string $steps): self
    {
        $this->steps = $steps;
        return $this;
    }

    public function getImage(): ?string
    {
        return $this->image ? $this->image : null;
    }

    public function setImage(?string $image): static
    {
        $this->image = $image;
        return $this;
    }

    public function getAuthor(): ?User
    {
        return $this->author;
    }

    public function setAuthor(?User $author): static
    {
        $this->author = $author;
        return $this;
    }

    /** @return Collection<int, Favorite> */
    public function getFavorites(): Collection
    {
        return $this->favorites;
    }

    public function addFavorite(Favorite $favorite): static
    {
        if (!$this->favorites->contains($favorite)) {
            $this->favorites->add($favorite);
            $favorite->setRecipe($this);
        }
        return $this;
    }

    public function removeFavorite(Favorite $favorite): static
    {
        if ($this->favorites->removeElement($favorite) && $favorite->getRecipe() === $this) {
            $favorite->setRecipe(null);
        }
        return $this;
    }
}
