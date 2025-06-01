<?php

namespace App;

use Symfony\Bundle\FrameworkBundle\Kernel\MicroKernelTrait;
use Symfony\Component\HttpKernel\Kernel as BaseKernel;

class Kernel extends BaseKernel
{
    use MicroKernelTrait;

     public function getCacheDir(): string
    {
        // En environnement serverless (Vercel), /tmp est généralement writable
        if ($this->environment !== 'dev') {
            return sys_get_temp_dir().'/symfony/cache/'.$this->environment;
        }

        // Sinon, en local, on garde le dossier var/cache
        return parent::getCacheDir();
    }

    public function getLogDir(): string
    {
        if ($this->environment !== 'dev') {
            return sys_get_temp_dir().'/symfony/log/'.$this->environment;
        }

        return parent::getLogDir();
    }
}
