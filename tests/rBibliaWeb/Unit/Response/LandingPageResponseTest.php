<?php declare(strict_types=1);

namespace rBibliaWeb\Unit\Response;

use PHPUnit\Framework\TestCase;
use rBibliaWeb\Response\LandingPageResponse;

class LandingPageResponseTest extends TestCase
{
    private string $assetsDir;
    private string $cssFile;
    private string $jsFile;

    protected function setUp(): void
    {
        $this->assetsDir = APP_PATH_ASSETS;
        if (!is_dir($this->assetsDir)) {
            mkdir($this->assetsDir, 0777, true);
        }

        $this->cssFile = $this->assetsDir . '/app.css';
        $this->jsFile = $this->assetsDir . '/app.js';

        file_put_contents($this->cssFile, 'body { color: black; }');
        file_put_contents($this->jsFile, 'console.log("hello");');
    }

    protected function tearDown(): void
    {
        if (file_exists($this->cssFile)) {
            unlink($this->cssFile);
        }
        if (file_exists($this->jsFile)) {
            unlink($this->jsFile);
        }
        if (is_dir($this->assetsDir)) {
            rmdir($this->assetsDir);
        }
    }

    public function testRenderWithoutStatsClass(): void
    {
        $response = new LandingPageResponse();

        $this->expectOutputRegex('(<!DOCTYPE html>)');
        $this->expectOutputRegex('(<title>rBiblia Web</title>)');
        $this->expectOutputRegex('(<!-- the Matomo code will be placed here only in prod env -->)');

        $response->render();
    }

    public function testRenderWithStatsClass(): void
    {
        // Define temporary matomo class file
        $tempStatsFile = __DIR__ . '/temp_matomo_class.php';
        $classContent = <<<'PHP'
<?php
class matomo {
    public static function getCode(int $id): string {
        return "<!-- Matomo ID: " . $id . " -->";
    }
}
PHP;
        file_put_contents($tempStatsFile, $classContent);

        $response = new LandingPageResponse();

        $this->expectOutputRegex('(<!-- Matomo ID: 37 -->)');

        try {
            $response->render([
                'stats_class' => $tempStatsFile
            ]);
        } finally {
            if (file_exists($tempStatsFile)) {
                unlink($tempStatsFile);
            }
        }
    }
}
