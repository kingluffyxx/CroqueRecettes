release: npm install && npm run build && php bin/console doctrine:migrations:migrate --no-interaction && php bin/console cache:clear --env=prod --no-warmup
web: heroku-php-apache2 public/