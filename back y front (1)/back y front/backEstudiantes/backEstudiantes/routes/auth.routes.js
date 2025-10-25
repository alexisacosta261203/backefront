const express = require("express");
const router = express.Router();

// Exportamos una función que recibe 'pendientes'
module.exports = (pendientes) => {
    console.log("✅ ¡El archivo de rutas se ha cargado correctamente!");

    // RUTA GET: Obtener todos los pendientes
    router.get('/', (req, res) => {
        res.status(200).json(pendientes);
    });

    // RUTA POST: Crear un nuevo pendiente
    router.post('/', (req, res) => {
        if (!req.body || !req.body.descripcion) {
            return res.status(400).json({ error: "Se requiere la propiedad 'descripcion'." });
        }
        const nuevoId = pendientes.length > 0 ? Math.max(...pendientes.map(p => p.id)) + 1 : 1;
        const nuevoPendiente = {
            id: nuevoId,
            descripcion: req.body.descripcion,
            finalizada: false,
        };
        pendientes.push(nuevoPendiente);
        res.status(201).json(nuevoPendiente);
    });

    // RUTA PUT: Actualizar un pendiente por ID
    router.put('/:id', (req, res) => {
        const id = parseInt(req.params.id);
        const pendienteBuscado = pendientes.find(t => t.id === id);

        if (!pendienteBuscado) {
            return res.status(404).json({ error: "Pendiente no encontrado" });
        }
        const { descripcion, finalizada } = req.body;
        if (descripcion !== undefined) {
            pendienteBuscado.descripcion = descripcion;
        }
        if (finalizada !== undefined) {
            pendienteBuscado.finalizada = !!finalizada; // Convierte a booleano
        }
        res.json({ mensaje: "Pendiente actualizado", pendiente: pendienteBuscado });
    });

    // RUTA DELETE: Eliminar un pendiente por ID
    router.delete('/:id', (req, res) => {
        const id = parseInt(req.params.id);
        const index = pendientes.findIndex(t => t.id === id);
        if (index === -1) {
            return res.status(404).json({ error: "Pendiente no encontrado" });
        }
        const [pendienteEliminado] = pendientes.splice(index, 1);
        res.status(200).json({ mensaje: "Pendiente eliminado", pendiente: pendienteEliminado });
    });

    // Al final, la función DEVUELVE el router ya listo
    return router;
};