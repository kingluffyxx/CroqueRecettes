release: php bin/console doctrine:migrations:migrate --no-interaction && php bin/console cache:clear --env=prod
web: heroku-php-apache2 public/