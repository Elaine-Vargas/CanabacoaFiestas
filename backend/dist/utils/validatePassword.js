"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePassword = validatePassword;
// Función de validación de contraseña extraída de Usuario_model para pruebas unitarias
function validatePassword(password) {
    if (password.length < 8 || password.length > 25) {
        return 'La contraseña debe tener entre 8 y 25 caracteres';
    }
    if (!/[A-Z]/.test(password)) {
        return 'Debe contener al menos una mayúscula';
    }
    if (!/[0-9]/.test(password)) {
        return 'Debe contener al menos un número';
    }
    if (!/[!@#$%^&*]/.test(password)) {
        return 'Debe contener al menos un carácter especial (!@#$%^&*)';
    }
    return null;
}
