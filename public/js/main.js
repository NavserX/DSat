// ==========================================================================
// 🚀 MAIN.JS - EL DIRECTOR (Inicia y conecta todo)
// ==========================================================================

// Importamos TODAS las funciones que hemos creado en los otros archivos
import { cargarPerfilUsuario, cargarClientes, cargarTecnicos, cargarMaquinas, cargarPiezas } from './api.js';
import { adaptarInterfazAlRol, mostrarPantalla, mostrarMapaDeTabla } from './ui.js';

import {
    filtrarClientes,
    seleccionarClienteReparacion,
    abrirModalCliente,
    cerrarModalCliente,
    guardarNuevoCliente,
    dibujarTablaClientes,
    filtrarTablaGestionClientes,
    guardarClienteGestion,
    editarClienteGestion,
    borrarClienteGestion,
    limpiarFormClienteGestion
} from './clientes.js';

import {
    cargarHistorialCliente,
    aplicarFiltroFechasCliente,
    filtrarHistorialTecnicos,
    asignarmeAviso,
    cambiarEstadoRapido,
    abrirModalFinalizar,
    cerrarModalFinalizar,
    agregarPiezaLista,
    eliminarPiezaLista,
    guardarFinalizacion,
    cargarReparaciones,
    guardarReparacion,
    editarReparacion,
    borrarReparacion,
    limpiarFormulario,
    verDetalleReparacion,
    buscarPiezaModal,
    generarPDFReparacion,
    filtrarPorEstado,          // <-- AÑADIDO: Filtro por tarjetas
    cambiarPaginaReparaciones  // <-- AÑADIDO: Paginación
} from './reparaciones.js';

import { dibujarTablaMaquinas, guardarMaquina, editarMaquina, borrarMaquina, limpiarFormMaquina, seleccionarClienteMaquina } from './maquinas.js';

import { dibujarTablaInventario, filtrarTablaInventario, guardarPiezaInventario, editarPieza, borrarPieza, limpiarFormPieza } from './inventario.js';

// --- ORGANIZACIÓN PARA EL HTML ---
window.mostrarPantalla = mostrarPantalla;
window.filtrarClientes = filtrarClientes;
window.seleccionarClienteReparacion = seleccionarClienteReparacion;
window.abrirModalCliente = abrirModalCliente;
window.cerrarModalCliente = cerrarModalCliente;
window.guardarNuevoCliente = guardarNuevoCliente;

// Gestión de clientes
window.dibujarTablaClientes = dibujarTablaClientes;
window.filtrarTablaGestionClientes = filtrarTablaGestionClientes;
window.guardarClienteGestion = guardarClienteGestion;
window.editarClienteGestion = editarClienteGestion;
window.borrarClienteGestion = borrarClienteGestion;
window.limpiarFormClienteGestion = limpiarFormClienteGestion;

// Reparaciones
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
window.generarPDFReparacion = generarPDFReparacion;
window.buscarPiezaModal = buscarPiezaModal;

// Funciones de Paginación y Filtros (Nuevas)
window.filtrarPorEstado = filtrarPorEstado;
window.cambiarPaginaReparaciones = cambiarPaginaReparaciones;

// Máquinas
window.dibujarTablaMaquinas = dibujarTablaMaquinas;
window.guardarMaquina = guardarMaquina;
window.editarMaquina = editarMaquina;
window.borrarMaquina = borrarMaquina;
window.limpiarFormMaquina = limpiarFormMaquina;
window.seleccionarClienteMaquina = seleccionarClienteMaquina;

// Inventario
window.dibujarTablaInventario = dibujarTablaInventario;
window.filtrarTablaInventario = filtrarTablaInventario;
window.guardarPiezaInventario = guardarPiezaInventario;
window.editarPieza = editarPieza;
window.borrarPieza = borrarPieza;
window.limpiarFormPieza = limpiarFormPieza;

window.logout = function() {
    localStorage.removeItem('token');
    window.location.href = '/';
};

// --- ARRANQUE ---
async function iniciarApp() {
    await cargarPerfilUsuario();
    adaptarInterfazAlRol();
    await cargarClientes();
    await cargarTecnicos();
    await cargarMaquinas();
    await cargarPiezas();
    await cargarReparaciones();
}

iniciarApp();
