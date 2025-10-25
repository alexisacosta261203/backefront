// controllers/auth.controller.js
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const cors = require('cors');

// Ruta al archivo users.json
const USERS_FILE = path.join(__dirname, '../modelo/users.json');

// Almacén de sesiones en memoria
const sessions = new Map();

// Generar token aleatorio
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Leer usuarios del archivo JSON
const readUsers = async () => {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error leyendo users.json:', error);
    return [];
  }
};

// Login
const login = async (req, res) => {
  try {
    const { cuenta, contraseña } = req.body;

    if (!cuenta || !contraseña) {
      return res.status(400).json({ 
        error: 'Se requieren las propiedades cuenta y contraseña' 
      });
    }

    const users = await readUsers();
    const user = users.find(u => u.cuenta === cuenta && u.contraseña === contraseña);

    if (!user) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }

    const token = generateToken();
    sessions.set(token, {
      cuenta: user.cuenta,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    res.status(200).json({
      mensaje: 'Login exitoso',
      token,
      usuario: { cuenta: user.cuenta }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Verificar token
const verifyToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Formato de token inválido' });
    }

    const session = sessions.get(token);

    if (!session) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    if (new Date() > session.expiresAt) {
      sessions.delete(token);
      return res.status(401).json({ error: 'Token expirado' });
    }

    res.status(200).json({
      valido: true,
      usuario: { cuenta: session.cuenta }
    });

  } catch (error) {
    console.error('Error verificando token:', error);
    res.status(500).json({ error: 'Error verificando token' });
  }
};

// Obtener perfil
const getProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const token = authHeader.split(' ')[1];
    const session = sessions.get(token);

    if (!session) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    if (new Date() > session.expiresAt) {
      sessions.delete(token);
      return res.status(401).json({ error: 'Sesión expirada' });
    }

    const users = await readUsers();
    const user = users.find(u => u.cuenta === session.cuenta);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.status(200).json({
      usuario: { cuenta: user.cuenta }
    });

  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(401).json({ error: 'Error obteniendo perfil' });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      if (sessions.has(token)) {
        sessions.delete(token);
      }
    }

    res.status(200).json({ mensaje: 'Logout exitoso' });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Listar usuarios
const getAllUsers = async (req, res) => {
  try {
    const users = await readUsers();
    const usersWithoutPasswords = users.map(user => ({ cuenta: user.cuenta }));

    res.status(200).json(usersWithoutPasswords);

  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Limpiar sesiones expiradas
const cleanExpiredSessions = () => {
  const now = new Date();
  for (const [token, session] of sessions.entries()) {
    if (now > session.expiresAt) {
      sessions.delete(token);
    }
  }
};

setInterval(cleanExpiredSessions, 60 * 60 * 1000);

module.exports = {
  login,
  verifyToken,
  getProfile,
  logout,
  getAllUsers
};