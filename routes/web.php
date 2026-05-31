<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Para tu index (la página principal /)
Route::get('/', function () {
    return view('index');
});

// Para tu dashboard (/dashboard)
Route::get('/dashboard', function () {
    return view('dashboard');
});

Route::view('/portal', 'portal-cliente');

