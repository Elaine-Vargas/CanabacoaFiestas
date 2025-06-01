export const validatePassword = (password: string): string | null => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*.]/.test(password);
  const isValidLength = password.length >= 8 && password.length <= 25;
  
  const errorMsg = [];
  if (!hasUpperCase) errorMsg.push("una mayúscula");
  if (!hasNumber) errorMsg.push("un número"); 
  if (!hasSpecial) errorMsg.push("un carácter especial (!@#$%^&*.?_-)");
  if (!isValidLength) errorMsg.push("entre 8-25 caracteres");
  
  return errorMsg.length > 0 
    ? `La contraseña debe tener ${errorMsg.join(", ")}` 
    : null;
};

export const validatePasswordMatch = (password: string, confirmPassword: string): string | null => {
  return password !== confirmPassword ? "Las contraseñas no coinciden" : null;
};

export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? null : "Ingrese un correo electrónico válido";
};

export const validateUsername = (username: string): string | null => {
  const usernameRegex = /^[a-zA-Z0-9_]{4,20}$/;
  return usernameRegex.test(username) 
    ? null 
    : "El usuario debe tener entre 4-20 caracteres (solo letras, números y _)";
};

export const formatPhoneNumber = (input: string): string => {
  const numbers = input.replace(/\D/g, '');
  let formatted = '';
  
  if (numbers.length > 0) {
      formatted = numbers.substring(0, 3);
  }
  if (numbers.length > 3) {
      formatted += '-' + numbers.substring(3, 6);
  }
  if (numbers.length > 6) {
      formatted += '-' + numbers.substring(6, 10);
  }
  
  return formatted;
};

export const formatCedula = (input: string): string => {
  const numbers = input.replace(/\D/g, '');
  let formatted = '';
  
  if (numbers.length > 0) {
      formatted = numbers.substring(0, 3);
  }
  if (numbers.length > 3) {
      formatted += '-' + numbers.substring(3, 10);
  }
  if (numbers.length > 10) {
      formatted += '-' + numbers.substring(10, 11);
  }
  
  return formatted;
};

export const validatePhoneNumber = (phone: string): string | null => {
  const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
  return phoneRegex.test(phone) ? null : "Formato de teléfono inválido (000-000-0000)";
};

export const validateCedula = (cedula: string): string | null => {
  const cedulaRegex = /^\d{3}-\d{7}-\d{1}$/;
  return cedulaRegex.test(cedula) ? null : "Formato de cédula inválido (000-0000000-0)";
};