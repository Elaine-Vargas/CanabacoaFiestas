"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
describe('Auth Integration', () => {
    it('debería responder 400 si faltan credenciales', async () => {
        const res = await (0, supertest_1.default)(app_1.default).post('/api/auth/login').send({});
        expect(res.status).toBe(400);
    });
    it('debería responder 200 y un token si las credenciales de elaine son válidas', async () => {
        const res = await (0, supertest_1.default)(app_1.default).post('/api/auth/login').send({
            usuario_login: 'elaine',
            contrasena: '!Pass.evr2007',
        });
        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
    });
});
