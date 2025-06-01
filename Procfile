release: composer install --no-dev && npm install && php bin/console doctrine:migrations:migrate --no-interaction
web:     heroku-php-apache2 public/