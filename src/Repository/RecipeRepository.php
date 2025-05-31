<?php

namespace App\Repository;

use App\Entity\Recipe;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Recipe>
 */
class RecipeRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Recipe::class);
    }

    public function search(string $query): array
{
    $qb = $this->createQueryBuilder('r');

    if (!$query) {
        // Si la query est vide, on retourne tout ou un tableau vide selon ton besoin
        return [];
    }

    $qb->where(
        $qb->expr()->orX(
            $qb->expr()->like('r.title', ':query'),
            $qb->expr()->like('r.description', ':query'),
            $qb->expr()->like('r.ingredients', ':query'),
            $qb->expr()->like('r.steps', ':query')
        )
    )
    ->setParameter('query', '%' . $query . '%');

    return $qb->getQuery()->getResult();
}
}
