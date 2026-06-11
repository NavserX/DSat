<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .caja { border: 1px solid #fca5a5; padding: 15px; background-color: #fef2f2; border-radius: 5px; }
        .rojo { color: #dc2626; font-weight: bold; }
    </style>
</head>
<body>
<h2>Alerta de Inventario: <span class="rojo">Stock a cero</span></h2>
<p>El siguiente repuesto se ha quedado sin unidades en el almacén tras el último parte de trabajo:</p>

<div class="caja">
    <ul>
        <li><strong>Referencia:</strong> {{ $pieza->referencia }}</li>
        <li><strong>Descripción:</strong> {{ $pieza->descripcion }}</li>
        <li><strong>Precio Coste:</strong> {{ $pieza->precio }} €</li>
    </ul>
</div>

<p>Por favor, comprueba el stock de este material y añadelo próximo pedido.</p>
<p><small>Este es un mensaje automático de DSat.</small></p>
</body>
</html>
