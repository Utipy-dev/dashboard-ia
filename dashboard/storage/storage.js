// storage.js — Capa de datos. La UI nunca sabe dónde se guardan las cosas.
// Incluye persistencia de handle de carpeta via IndexedDB.

(function () {
  'use strict';

  let _dirHandle = null;

  // ── IndexedDB para recordar la carpeta ─────────────────────────────────────
  async function _abrirDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('dashboard-ia-config', 1);
      req.onupgradeneeded = e => e.target.result.createObjectStore('config', { keyPath: 'key' });
      req.onsuccess  = e => resolve(e.target.result);
      req.onerror    = e => reject(e.target.error);
    });
  }

  async function _guardarHandle(handle) {
    const db = await _abrirDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('config', 'readwrite');
      tx.objectStore('config').put({ key: 'dirHandle', value: handle });
      tx.oncomplete = resolve;
      tx.onerror    = reject;
    });
  }

  async function _recuperarHandle() {
    const db = await _abrirDB();
    return new Promise((resolve, reject) => {
      const tx  = db.transaction('config', 'readonly');
      const req = tx.objectStore('config').get('dirHandle');
      req.onsuccess = e => resolve(e.target.result?.value || null);
      req.onerror   = reject;
    });
  }

  // ── File System Access API ─────────────────────────────────────────────────
  async function _leerJSON(nombre) {
    try {
      const fh   = await _dirHandle.getFileHandle(nombre);
      const file = await fh.getFile();
      const text = await file.text();
      return text.trim() ? JSON.parse(text) : [];
    } catch (e) {
      if (e.name === 'NotFoundError') return []; // archivo aún no existe
      throw e;
    }
  }

  async function _escribirJSON(nombre, datos) {
    const fh       = await _dirHandle.getFileHandle(nombre, { create: true });
    const writable = await fh.createWritable();
    await writable.write(JSON.stringify(datos, null, 2));
    await writable.close();
  }

  // ── API pública ────────────────────────────────────────────────────────────
  const Storage = {

    // Intenta restaurar carpeta guardada (sin diálogo de usuario)
    async intentarRestauraHandle() {
      try {
        const handle = await _recuperarHandle();
        if (!handle) return false;
        const perm = await handle.queryPermission({ mode: 'readwrite' });
        if (perm === 'granted') { _dirHandle = handle; return true; }
        // Pedir permiso con un gesto mínimo (requiere interacción)
        const newPerm = await handle.requestPermission({ mode: 'readwrite' });
        if (newPerm === 'granted') { _dirHandle = handle; return true; }
      } catch (e) {
        console.warn('No se pudo restaurar carpeta:', e);
      }
      return false;
    },

    // Abre el diálogo de selección de carpeta (requiere gesto de usuario)
    async init() {
      if (!window.showDirectoryPicker) {
        throw new Error('Tu navegador no soporta File System Access API. Usa Chrome o Edge.');
      }
      _dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
      await _guardarHandle(_dirHandle);
    },

    // Usar un handle ya obtenido externamente
    usarHandle(handle) {
      _dirHandle = handle;
    },

    estaIniciado() { return _dirHandle !== null; },

    async getIAs()                { return _leerJSON('ias.json'); },
    async saveIAs(datos)          { return _escribirJSON('ias.json', datos); },
    async getProyectos()          { return _leerJSON('proyectos.json'); },
    async saveProyectos(datos)    { return _escribirJSON('proyectos.json', datos); },
    async getConversaciones()     { return _leerJSON('conversaciones.json'); },
    async saveConversaciones(d)   { return _escribirJSON('conversaciones.json', d); },
    async getTranscripciones()    { return _leerJSON('transcripciones.json'); },
    async saveTranscripciones(d)  { return _escribirJSON('transcripciones.json', d); },

    nuevoId(prefijo = 'id') {
      return `${prefijo}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    },
  };

  window.Storage = Storage;
})();
