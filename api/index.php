<?php

require_once __DIR__ . '/../vendor/autoload_runtime.php';

return function (array $context) {
    return require __DIR__ . '/../public/index.php';
};