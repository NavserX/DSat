// ==========================================================================
// 🎨 UI.JS - INTERFAZ Y NAVEGACIÓN
// ==========================================================================
import { AppState } from './api.js';

export function adaptarInterfazAlRol() {
    // Si la persona tiene el rol de 'tecnico', le aplico el "tijeretazo".
    if (AppState.usuarioActual && AppState.usuarioActual.rol === 'tecnico') {
        const btnClientes = document.getElementById('btn-menu-clientes');
        const btnTecnicos = document.getElementById('btn-menu-tecnicos');

        // AÑADIDO: Ocultamos también los nuevos menús de gestión
        const btnGestionClientes = document.getElementById('btn-menu-gestion-clientes');
        const btnMaquinas = document.getElementById('btn-menu-maquinas');
        const btnInventario = document.getElementById('btn-menu-inventario');

        if (btnClientes) btnClientes.classList.add('hidden');
        if (btnTecnicos) btnTecnicos.classList.add('hidden');
        if (btnGestionClientes) btnGestionClientes.classList.add('hidden');
        if (btnMaquinas) btnMaquinas.classList.add('hidden');
        if (btnInventario) btnInventario.classList.add('hidden'); // Oculto el inventario al técnico

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
    // CORREGIDO: Formato correcto de la URL con template string de JS
    document.getElementById('google_map_iframe').src = `https://maps.google.com/maps?q=${dir}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
    document.getElementById('link_como_llegar').href = `https://maps.google.com/maps?q=${dir}`;
    map.classList.remove('hidden');
}

// Cierra los desplegables al hacer clic fuera
document.addEventListener('click', function(e) {
    // AÑADIDO: Incluimos los dos nuevos desplegables ('maq_cliente_dropdown' y 'dropdown_piezas_modal')
    ['cliente_dropdown', 'historial_cliente_dropdown', 'maq_cliente_dropdown', 'dropdown_piezas_modal'].forEach(id => {
        const el = document.getElementById(id);

        // Si pincho fuera del desplegable Y fuera de su input de búsqueda, lo oculto
        if(el && !el.contains(e.target) && e.target.id !== id.replace('_dropdown', '_search') && e.target.id !== 'add_pieza_ref') {
            el.classList.add('hidden');
        }
    });
});
