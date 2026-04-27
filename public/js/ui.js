// ==========================================================================
// UI.JS - INTERFAZ Y NAVEGACIÓN
// ==========================================================================
import { AppState } from './api.js';

export function adaptarInterfazAlRol() {
    // Si la persona tiene el rol de 'tecnico', le aplico el "tijeretazo".
    if (AppState.usuarioActual && AppState.usuarioActual.rol === 'tecnico') {
        const btnClientes = document.getElementById('btn-menu-clientes');
        const btnTecnicos = document.getElementById('btn-menu-tecnicos');
        if (btnClientes) btnClientes.classList.add('hidden');
        if (btnTecnicos) btnTecnicos.classList.add('hidden');

        const cajaFormulario = document.getElementById('caja-formulario-reparacion');
        const cajaTabla = document.getElementById('caja-tabla-reparaciones');

        if (cajaFormulario && cajaTabla) {
            cajaFormulario.classList.add('hidden');
            cajaTabla.classList.remove('lg:col-span-2');
            cajaTabla.classList.add('col-span-1', 'lg:col-span-3');
        }

        document.getElementById('cliente_search').disabled = true;
        document.getElementById('tecnico_id').disabled = true;

        const btnNuevoCliente = document.querySelector('button[onclick="abrirModalCliente()"]');
        if (btnNuevoCliente) btnNuevoCliente.classList.add('hidden');

        const btnLimpiar = document.querySelector('button[onclick="limpiarFormulario()"]');
        if (btnLimpiar) btnLimpiar.classList.add('hidden');
    }
}

export function mostrarPantalla(idPantalla, botonClicado) {
    document.querySelectorAll('.pantalla-seccion').forEach(div => div.classList.add('hidden'));
    document.getElementById(idPantalla).classList.remove('hidden');

    document.querySelectorAll('.menu-btn').forEach(btn => {
        btn.classList.remove('bg-blue-600', 'border-l-4');
        btn.classList.add('hover:bg-slate-800');
    });
    botonClicado.classList.remove('hover:bg-slate-800');
    botonClicado.classList.add('bg-blue-600');
}

export function setFechaHoy() {
    const hoy = new Date().toISOString().split('T')[0];
    const inputFecha = document.getElementById('fecha_entrada');
    if(inputFecha) inputFecha.value = hoy;
}

export function mostrarMapaDeTabla(dir) {
    const map = document.getElementById('mapa_container');
    document.getElementById('google_map_iframe').src = `https://maps.google.com/maps?q=${dir}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
    document.getElementById('link_como_llegar').href = `https://www.google.com/maps/search/?api=1&query=${dir}`;
    map.classList.remove('hidden');
}

// Cierra los desplegables al hacer clic fuera
document.addEventListener('click', function(e) {
    ['cliente_dropdown', 'historial_cliente_dropdown'].forEach(id => {
        const el = document.getElementById(id);
        if(el && !el.contains(e.target) && e.target.id !== id.replace('_dropdown', '_search')) el.classList.add('hidden');
    });
});
