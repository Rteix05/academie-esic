<?php

namespace App\Media;

use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 * Enregistre les images téléversées depuis l'admin dans public/uploads/images.
 *
 * Les photos (JPEG, PNG, WebP) sont redimensionnées à MAX_SIZE px sur leur plus grand côté
 * et converties en WebP : quelques centaines de Ko au lieu de plusieurs Mo, pour un affichage
 * rapide sur le site. Les GIF (animations possibles) sont conservés tels quels, de même que
 * toute image si l'extension GD est absente ou si la conversion échoue.
 */
class ImageUploader
{
    public const MAX_SIZE = 1600;
    private const WEBP_QUALITY = 82;

    public function __construct(
        #[Autowire('%kernel.project_dir%/public/uploads/images')] private readonly string $imageDir,
        private readonly LoggerInterface $logger,
    ) {}

    /** @return string nom du fichier enregistré (à stocker sur l'entité) */
    public function store(UploadedFile $file, string $prefix): string
    {
        $baseName = uniqid($prefix);

        $source = $this->load($file);
        if ($source) {
            $fileName = $baseName . '.webp';
            if ($this->saveWebp($source, $this->imageDir . '/' . $fileName)) {
                return $fileName;
            }
        }

        $fileName = $baseName . '.' . ($file->guessExtension() ?? 'jpg');
        $file->move($this->imageDir, $fileName);

        return $fileName;
    }

    private function load(UploadedFile $file): ?\GdImage
    {
        if (!extension_loaded('gd') || !function_exists('imagewebp')) {
            return null;
        }

        $path = $file->getPathname();
        if (!$this->fitsInMemory($path)) {
            $this->logger->info('Image trop grande pour être optimisée en mémoire, fichier original conservé', ['file' => $file->getClientOriginalName()]);

            return null;
        }

        $image = match ($file->getMimeType()) {
            'image/jpeg' => @imagecreatefromjpeg($path),
            'image/png'  => @imagecreatefrompng($path),
            'image/webp' => @imagecreatefromwebp($path),
            default      => false,
        };

        if (!$image instanceof \GdImage) {
            return null;
        }

        return $file->getMimeType() === 'image/jpeg' ? $this->applyExifOrientation($image, $path) : $image;
    }

    /**
     * GD décompresse l'image en mémoire (4 octets par pixel, plus la copie redimensionnée) :
     * une photo de 12 Mpx occupe ~50 Mo. Au-delà de la mémoire disponible, PHP s'arrêterait en erreur fatale.
     */
    private function fitsInMemory(string $path): bool
    {
        $size = @getimagesize($path);
        if (!$size) {
            return false;
        }

        $limit = $this->bytes((string) ini_get('memory_limit'));
        if ($limit <= 0) {
            return true; // pas de limite
        }

        $needed = (int) ($size[0] * $size[1] * 4 * 1.7) + 8 * 1024 * 1024;

        return memory_get_usage(true) + $needed < $limit;
    }

    private function bytes(string $value): int
    {
        $value = trim($value);
        $number = (int) $value;

        return match (strtolower(substr($value, -1))) {
            'g'     => $number * 1024 ** 3,
            'm'     => $number * 1024 ** 2,
            'k'     => $number * 1024,
            default => $number,
        };
    }

    private function saveWebp(\GdImage $image, string $target): bool
    {
        $width = imagesx($image);
        $height = imagesy($image);
        $ratio = min(1, self::MAX_SIZE / max($width, $height));

        if ($ratio < 1) {
            $resized = imagescale($image, max(1, (int) round($width * $ratio)), max(1, (int) round($height * $ratio)), IMG_BICUBIC);
            if ($resized instanceof \GdImage) {
                $image = $resized;
            }
        }

        // Transparence des PNG conservée
        imagepalettetotruecolor($image);
        imagealphablending($image, false);
        imagesavealpha($image, true);

        if (!is_dir($this->imageDir)) {
            mkdir($this->imageDir, 0775, true);
        }

        if (!@imagewebp($image, $target, self::WEBP_QUALITY)) {
            $this->logger->warning('Image : conversion WebP impossible, fichier original conservé', ['target' => $target]);
            @unlink($target);

            return false;
        }

        return true;
    }

    /** Photos de smartphone : rotation indiquée dans les métadonnées EXIF, appliquée aux pixels */
    private function applyExifOrientation(\GdImage $image, string $path): \GdImage
    {
        if (!function_exists('exif_read_data')) {
            return $image;
        }

        $orientation = (int) (@exif_read_data($path)['Orientation'] ?? 1);
        $angle = match ($orientation) {
            3       => 180,
            6       => -90,
            8       => 90,
            default => 0,
        };

        if ($angle === 0) {
            return $image;
        }

        $rotated = imagerotate($image, $angle, 0);

        return $rotated instanceof \GdImage ? $rotated : $image;
    }
}
