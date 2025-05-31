<?php

namespace App\Form;

use App\Entity\Recipe;
use App\Entity\User;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\Extension\Core\Type\FileType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Constraints\File;
class RecipeForm extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('title', TextType::class, [
                'label' => '',
                'attr' => ['placeholder' => 'Titre de la recette'],
                'constraints' => [
                    new NotBlank([
                        'message' => 'Le titre ne peut pas être vide.',
                    ]),
                ],
            ])
            ->add('description', TextareaType::class, [
                'label' => '',
                'attr' => ['placeholder' => 'Description courte'],
                'constraints' => [
                    new NotBlank([
                        'message' => 'La description ne peut pas être vide.',
                    ]),
                ],
            ])
            ->add('ingredients', TextareaType::class, [
                'label' => '',
                'attr' => ['placeholder' => 'Liste des ingrédients'],
                'constraints' => [
                    new NotBlank([
                        'message' => 'Les ingrédients sont obligatoires.',
                    ]),
                ],
            ])
            ->add('steps', TextareaType::class, [
                'label' => '',
                'attr' => ['placeholder' => 'Décrivez les étapes'],
                'constraints' => [
                    new NotBlank([
                        'message' => 'Les étapes sont obligatoires.',
                    ]),
                ],
            ])
            // ->add('image', FileType::class, [
            //     'label' => 'Image de la recette',
            //     'mapped' => false, // si l'image n'est pas directement mappée à l'entité
            //     'required' => false,
            //     'help' => 'Téléversez une image (jpeg, png, etc.)',
            //     'constraints' => [
            //         new File([
            //             'maxSize' => '5M',
            //             'mimeTypes' => ['image/jpeg', 'image/png'],
            //             'mimeTypesMessage' => 'Veuillez uploader une image valide (JPEG, PNG)',
            //         ])
            //     ],
            // ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Recipe::class,
            'csrf_protection' => false,
        ]);
    }
}
