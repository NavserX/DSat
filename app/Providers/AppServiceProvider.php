<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Pieza;
use App\Observers\PiezaObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Le digo a Laravel que examine las piezas con el Observer
        Pieza::observe(PiezaObserver::class);
    }
}
