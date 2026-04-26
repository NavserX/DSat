// ==========================================================================
// MAIN.JS - EL DIRECTOR (Inicia y conecta todo)
// ==========================================================================

// Importamos TODAS las funciones que hemos creado en los otros archivos
import { cargarPerfilUsuario, cargarClientes, cargarTecnicos, cargarMarcas } from './api.js';
import { adaptarInterfazAlRol, mostrarPantalla, mostrarMapaDeTabla } from './ui.js';
import { filtrarClientes, seleccionarClienteReparacion, abrirModalCliente, cerrarModalCliente, guardarNuevoCliente } from './clientes.js';
// AÑADIDO: aplicarFiltroFechasCliente
import { cargarHistorialCliente, aplicarFiltroFechasCliente, filtrarHistorialTecnicos, asignarmeAviso, cambiarEstadoRapido, abrirModalFinalizar, cerrarModalFinalizar, agregarPiezaLista, eliminarPiezaLista, guardarFinalizacion, cargarReparaciones, guardarReparacion, editarReparacion, borrarReparacion, limpiarFormulario, verDetalleReparacion } from './reparaciones.js';

// --- ORGANIZACIÓN PARA EL HTML ---
// Al usar módulos, el HTML "se vuelve ciego" y no encuentra las funciones de los onclick="".
// Para arreglarlo, he tenido que anclar las funciones al objeto global 'window'.
window.mostrarPantalla = mostrarPantalla;
window.filtrarClientes = filtrarClientes;
window.seleccionarClienteReparacion = seleccionarClienteReparacion;
window.abrirModalCliente = abrirModalCliente;
window.cerrarModalCliente = cerrarModalCliente;
window.guardarNuevoCliente = guardarNuevoCliente;
window.cargarHistorialCliente = cargarHistorialCliente;
window.aplicarFiltroFechasCliente = aplicarFiltroFechasCliente;
window.filtrarHistorialTecnicos = filtrarHistorialTecnicos;
window.asignarmeAviso = asignarmeAviso;
window.cambiarEstadoRapido = cambiarEstadoRapido;
window.abrirModalFinalizar = abrirModalFinalizar;
window.cerrarModalFinalizar = cerrarModalFinalizar;
window.agregarPiezaLista = agregarPiezaLista;
window.eliminarPiezaLista = eliminarPiezaLista;
window.guardarFinalizacion = guardarFinalizacion;
window.guardarReparacion = guardarReparacion;
window.editarReparacion = editarReparacion;
window.borrarReparacion = borrarReparacion;
window.limpiarFormulario = limpiarFormulario;
window.verDetalleReparacion = verDetalleReparacion;
window.mostrarMapaDeTabla = mostrarMapaDeTabla;

window.logout = function() {
    localStorage.removeItem('token');
    window.location.href = '/';
};

// --- ARRANQUE ---
// Ejecuto las llamadas principales para iniciar la aplicación
async function iniciarApp() {
    await cargarPerfilUsuario();
    adaptarInterfazAlRol();
    cargarClientes();
    cargarTecnicos();
    cargarMarcas();
    cargarReparaciones();
}

iniciarApp();
