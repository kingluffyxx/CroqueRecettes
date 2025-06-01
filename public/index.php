<?php

use App\Kernel;
use Symfony\Component\Dotenv\Dotenv;

require_once dirname(__DIR__).'/vendor/autoload_runtime.php';

// Charge .env uniquement si présent (évite l’erreur sur Vercel)
if (file_exists(dirname(__DIR__).'/.env')) {
    (new Dotenv())->loadEnv(dirname(__DIR__).'/.env');
}


return function (array $context) {
    return new Kernel($context['APP_ENV'], (bool) $context['APP_DEBUG']);
};
