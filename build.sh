#!/usr/bin/env bash
# Salir si hay errores
set -o errexit

composer install --no-dev --optimize-autoloader
php artisan optimize
php artisan migrate --force
