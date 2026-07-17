<?php

namespace App;

use Symfony\Bundle\FrameworkBundle\Kernel\MicroKernelTrait;
use Symfony\Component\HttpKernel\Kernel as BaseKernel;

class Kernel extends BaseKernel
{
    use MicroKernelTrait;

    // Force le cache à s'exécuter dans le container Linux (vitesse maximale)
    public function getCacheDir(): string
    {
        if ($this->getEnvironment() === 'dev') {
            return '/tmp/esic_cache/' . $this->environment;
        }
        return parent::getCacheDir();
    }

    // Force les logs à s'exécuter dans le container Linux
    public function getLogDir(): string
    {
        if ($this->getEnvironment() === 'dev') {
            return '/tmp/esic_logs';
        }
        return parent::getLogDir();
    }
}