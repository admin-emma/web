import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { userQueries } from './database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'tu-clave-secreta-super-segura-cambiala-en-produccion';

export const auth = {
  // Verificar credenciales
  async verifyCredentials(username, password) {
    try {
      const user = userQueries.getByUsername.get(username);
      if (!user) return null;
      
      const isValid = bcrypt.compareSync(password, user.password);
      if (!isValid) return null;
      
      return { id: user.id, username: user.username, role: user.role };
    } catch (error) {
      console.error('Error verificando credenciales:', error);
      return null;
    }
  },

  // Generar token JWT
  generateToken(user) {
    return jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
  },

  // Verificar token JWT
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  },

  // Middleware para verificar autenticación en requests
  verifyAuth(request) {
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.headers.get('cookie')?.split(';')
      .find(c => c.trim().startsWith('auth-token='))?.split('=')[1];
    
    const token = authHeader?.replace('Bearer ', '') || cookieToken;
    
    if (!token) return null;
    
    return this.verifyToken(token);
  },

  // Hash de contraseña
  hashPassword(password) {
    return bcrypt.hashSync(password, 10);
  }
};

export default auth;
