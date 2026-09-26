<?php

namespace App\Controller\Admin;

use Symfony\Component\Validator\Constraints\File;
use Symfony\Component\Validator\Constraints\Image;

/**
 * Contraintes communes des uploads du back-office.
 * Le type MIME est détecté à partir du contenu réel du fichier (pas de l'extension) :
 * un script renommé en .jpg est refusé.
 */
final class UploadConstraints
{
    public static function image(): Image
    {
        return new Image(
            maxSize: '5M',
            mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
            mimeTypesMessage: 'Formats acceptés : JPG, PNG, WebP ou GIF.',
            maxSizeMessage: 'L\'image ne doit pas dépasser {{ limit }} {{ suffix }}.',
        );
    }

    public static function pdf(): File
    {
        return new File(
            maxSize: '50M',
            mimeTypes: ['application/pdf', 'application/x-pdf'],
            mimeTypesMessage: 'Seuls les fichiers PDF sont acceptés.',
            maxSizeMessage: 'Le PDF ne doit pas dépasser {{ limit }} {{ suffix }}.',
        );
    }
}
