<?php

namespace App\Tests\Unit\Media;

use App\Media\ImageUploader;
use PHPUnit\Framework\Attributes\RequiresPhpExtension;
use PHPUnit\Framework\TestCase;
use Psr\Log\NullLogger;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\File\UploadedFile;

#[RequiresPhpExtension('gd')]
final class ImageUploaderTest extends TestCase
{
    private string $dir;
    private ImageUploader $uploader;

    protected function setUp(): void
    {
        $this->dir = sys_get_temp_dir() . '/image-uploader-' . bin2hex(random_bytes(4));
        $this->uploader = new ImageUploader($this->dir . '/images', new NullLogger());
    }

    protected function tearDown(): void
    {
        (new Filesystem())->remove($this->dir);
    }

    public function testLargePhotoIsResizedAndConvertedToWebp(): void
    {
        $fileName = $this->uploader->store($this->upload('photo.jpg', 3000, 2000, 'imagejpeg'), 'img_');

        self::assertMatchesRegularExpression('/^img_\w+\.webp$/', $fileName);
        [$width, $height, $type] = getimagesize($this->dir . '/images/' . $fileName);
        self::assertSame(IMAGETYPE_WEBP, $type);
        self::assertSame([ImageUploader::MAX_SIZE, 1067], [$width, $height]);
    }

    public function testSmallImageKeepsItsDimensions(): void
    {
        $fileName = $this->uploader->store($this->upload('logo.png', 400, 300, 'imagepng'), 'evt_');

        self::assertStringStartsWith('evt_', $fileName);
        self::assertSame([400, 300], array_slice(getimagesize($this->dir . '/images/' . $fileName), 0, 2));
    }

    public function testPhotoTooLargeForAvailableMemoryIsKeptAsIs(): void
    {
        $upload = $this->upload('grande.jpg', 3000, 2000, 'imagejpeg');
        $previous = (string) ini_get('memory_limit');
        // ~40 Mo nécessaires au décodage, 16 Mo disponibles
        self::assertNotFalse(ini_set('memory_limit', (string) (memory_get_usage(true) + 16 * 1024 * 1024)));

        try {
            $fileName = $this->uploader->store($upload, 'img_');
        } finally {
            ini_set('memory_limit', $previous);
        }

        self::assertStringEndsWith('.jpg', $fileName);
        self::assertSame([3000, 2000], array_slice(getimagesize($this->dir . '/images/' . $fileName), 0, 2));
    }

    public function testGifIsKeptAsIs(): void
    {
        $upload = $this->upload('anim.gif', 200, 200, 'imagegif');
        $original = (string) file_get_contents($upload->getPathname());

        $fileName = $this->uploader->store($upload, 'img_');

        self::assertStringEndsWith('.gif', $fileName);
        self::assertSame($original, file_get_contents($this->dir . '/images/' . $fileName));
    }

    /** @param callable(\GdImage, string): bool $writer */
    private function upload(string $name, int $width, int $height, callable $writer): UploadedFile
    {
        (new Filesystem())->mkdir($this->dir);
        $path = $this->dir . '/' . $name;
        $image = imagecreatetruecolor($width, $height);
        imagefilledrectangle($image, 0, 0, $width - 1, $height - 1, imagecolorallocate($image, 20, 120, 80));
        $writer($image, $path);

        return new UploadedFile($path, $name, null, null, true);
    }
}
