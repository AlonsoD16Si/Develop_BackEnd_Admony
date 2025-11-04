const organizacionService = require('../services/organization.service');

/**
 * @route   POST /api/organization
 * @desc    Crear organización y asignar usuario como admin
 * @access  Private
 */
const crearOrganizacion = async (req, res, next) => {
  try {
    const { nombre } = req.body;
    const usuario = req.user;

    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de la organización es requerido',
      });
    }

    const result = await organizacionService.crearOrganizacion({
      nombre,
      idUsuario: usuario.Id_Usuario,
    });

    res.status(201).json({
      success: true,
      message: 'Organización creada correctamente',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/organizacion/miembros
 * @desc    Agregar miembro a la organización
 * @access  Private (Admin)
 */
const agregarMiembro = async (req, res, next) => {
  try {
    const { correo, contrasenia, nombre, idOrganizacion } = req.body;
    const usuario = req.user;

    const result = await organizacionService.agregarMiembro({
      correo,
      contrasenia,
      nombre,
      idOrganizacion,
      idAdmin: usuario.Id_Usuario,
    });

    res.status(201).json({
      success: true,
      message: 'Miembro agregado exitosamente',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/organizacion/:idOrganizacion/miembros
 * @desc    Obtener miembros de la organización
 * @access  Private (Admin)
 */
const obtenerMiembros = async (req, res, next) => {
  try {
    const { idOrganizacion } = req.params;
    const usuario = req.user;

    const miembros = await organizacionService.obtenerMiembros({
      idOrganizacion: parseInt(idOrganizacion),
      idAdmin: usuario.Id_Usuario,
    });

    res.status(200).json({
      success: true,
      data: miembros,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/organizacion/:idOrganizacion/miembros/:idMiembro
 * @desc    Eliminar miembro de la organización
 * @access  Private (Admin)
 */
const eliminarMiembro = async (req, res, next) => {
  try {
    const { idOrganizacion, idMiembro } = req.params;
    const usuario = req.user;

    const result = await organizacionService.eliminarMiembro({
      idMiembro: parseInt(idMiembro),
      idOrganizacion: parseInt(idOrganizacion),
      idAdmin: usuario.Id_Usuario,
    });

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  crearOrganizacion, 
  agregarMiembro, 
  obtenerMiembros,
  eliminarMiembro 
};