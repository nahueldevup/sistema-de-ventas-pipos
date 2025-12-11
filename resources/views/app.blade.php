<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title inertia>{{ config('app.name', 'PIPOS') }}</title>

        @viteReactRefresh
        {{-- OJO AQUÍ: Debe apuntar a tu archivo .tsx en resources/js --}}
        @vite(['resources/js/app.tsx', 'resources/css/app.css']) 
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>