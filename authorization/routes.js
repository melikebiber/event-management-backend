const router = require('express').Router();
const AuthController = require('./controller');

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: Yeni kullanıcı kaydı oluşturur
 *     tags:
 *       - Authorization
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - surname
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 example: Melike
 *               surname:
 *                 type: string
 *                 minLength: 2
 *                 example: Yılmaz
 *               email:
 *                 type: string
 *                 format: email
 *                 example: melike@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: 123456
 *               phone:
 *                 type: string
 *                 example: "05551234567"
 *     responses:
 *       201:
 *         description: Kullanıcı başarıyla oluşturuldu
 *       400:
 *         description: Girilen bilgiler geçersiz
 *       409:
 *         description: E-posta adresi zaten kullanılıyor
 *       500:
 *         description: Sunucu hatası
 */
router.post('/signup', AuthController.register);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Kullanıcının giriş yapmasını sağlar
 *     tags:
 *       - Authorization
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: melike@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Giriş başarılı ve JWT token oluşturuldu
 *       400:
 *         description: Girilen bilgiler geçersiz
 *       401:
 *         description: E-posta veya şifre hatalı
 *       500:
 *         description: Sunucu hatası
 */
router.post('/login', AuthController.login);

module.exports = router;