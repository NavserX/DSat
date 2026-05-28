<!DOCTYPE html>
<html>
<head>
    <title>Nuevo Aviso Asignado</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f5; padding: 20px;">

<div style="max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; border-top: 4px solid #2563eb;">
    <h2 style="color: #1e3a8a;">¡Tienes un nuevo aviso asignado!</h2>

    <p>Hola, te han asignado un aviso desde el portal DSat.</p>

    <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0;">
        <p><strong>Aviso Nº:</strong> #{{ $reparacion->id }}</p>

        <p><strong>Cliente:</strong> {{ $reparacion->cliente ? $reparacion->cliente->nombre : 'Cliente no asignado' }}</p>

        <p><strong>Avería reportada:</strong> <br>
            {{ $reparacion->descripcion ?? $reparacion->descripcion_averia ?? 'Sin descripción' }}
        </p>
    </div>

    <p>Por favor, accede a tu panel técnico desde el móvil para iniciar el trabajo y ver la ubicación exacta.</p>

    <a href="http://dsat.alwaysdata.net" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Abrir Panel Técnico DSat</a>
</div>

</body>
</html>
