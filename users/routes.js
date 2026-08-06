const router = require('express').Router();
const UserController = require('./controller');
const { check } = require('../common/middlewares/IsAuthenticated');
const { has } = require('../common/middlewares/CheckPermission');

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Giriş yapan kullanıcının bilgilerini getirir
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kullanıcı bilgileri başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Token eksik veya geçersiz
 */
router.get('/', check, UserController.getUser);

/**
 * @swagger
 * /users/all:
 *   get:
 *     summary: Tüm kullanıcıları listeler
 *     description: Bu endpoint yalnızca ADMIN rolündeki kullanıcılar tarafından kullanılabilir.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kullanıcılar başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: Token eksik veya geçersiz
 *       403:
 *         description: Bu işlem için ADMIN yetkisi gerekli
 */
router.get('/all', check, has('ADMIN'), UserController.getAllUsers);
/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     summary: ID değerine göre kullanıcı getirir
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Kullanıcı getirildi
 *       404:
 *         description: Kullanıcı bulunamadı
 */

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Giriş yapan kullanıcının profil bilgilerini günceller
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Melike
 *               surname:
 *                 type: string
 *                 example: Biber
 *               email:
 *                 type: string
 *                 format: email
 *                 example: melike@example.com
 *               phone:
 *                 type: string
 *                 example: "05551234567"
 *     responses:
 *       200:
 *         description: Profil başarıyla güncellendi
 *       401:
 *         description: Token eksik veya geçersiz
 *       404:
 *         description: Kullanıcı bulunamadı
 *       409:
 *         description: E-posta adresi zaten kullanılıyor
 */
router.put(
  '/profile',
  check,
  UserController.updateProfile
);

/**
 * @swagger
 * /users/change-password:
 *   put:
 *     summary: Giriş yapan kullanıcının şifresini değiştirir
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: eskiSifre123
 *               newPassword:
 *                 type: string
 *                 example: yeniSifre123
 *               confirmPassword:
 *                 type: string
 *                 example: yeniSifre123
 *     responses:
 *       200:
 *         description: Şifre başarıyla değiştirildi
 *       400:
 *         description: Girilen bilgiler geçersiz
 *       401:
 *         description: Mevcut şifre hatalı veya token geçersiz
 *       404:
 *         description: Kullanıcı bulunamadı
 */
router.put(
  '/change-password',
  check,
  UserController.changePassword
);
/**
 * @swagger
 * /users/my-ratings:
 *   get:
 *     summary: Giriş yapan kullanıcının değerlendirmelerini getirir
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Değerlendirmeler başarıyla getirildi
 *       401:
 *         description: Token eksik veya geçersiz
 *       500:
 *         description: Sunucu hatası
 */
router.get(
  '/my-ratings',
  check,
  UserController.getMyRatings
);
router.get(
  '/:userId',
  check,
  has('ADMIN'),
  UserController.getUserById
);

/**
 * @swagger
 * /users/{userId}:
 *   put:
 *     summary: Kullanıcı bilgilerini günceller
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Melike
 *               surname:
 *                 type: string
 *                 example: Biber
 *               email:
 *                 type: string
 *                 format: email
 *                 example: melike@example.com
 *               phone:
 *                 type: string
 *                 example: "05551234567"
 *               role:
 *                 type: string
 *                 example: ADMIN
 *     responses:
 *       200:
 *         description: Kullanıcı güncellendi
 *       404:
 *         description: Kullanıcı bulunamadı
 *       409:
 *         description: E-posta zaten kullanılıyor
 */
router.put(
  '/:userId',
  check,
  has('ADMIN'),
  UserController.updateUser
);

/**
 * @swagger
 * /users/{userId}:
 *   delete:
 *     summary: Kullanıcıyı siler
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Kullanıcı silindi
 *       404:
 *         description: Kullanıcı bulunamadı
 *       409:
 *         description: Kullanıcıya bağlı kayıt bulunduğu için silinemedi
 */
router.delete(
  '/:userId',
  check,
  has('ADMIN'),
  UserController.deleteUser
);
module.exports = router;

// Bu kodun amacı:
// Kullanıcı ile ilgili istekler hangi endpoint'e gelirse,
// hangi controller fonksiyonunun çalışacağını belirlemektir.

// /users/all isteği gelirse:
// 1. check çalışır → token doğru mu?
// 2. has('ADMIN') çalışır → kullanıcının rolü ADMIN mi?
// 3. İkisi de doğruysa getAllUsers çalışır.

// Yani /users/all endpointi normal USER rolündeki kullanıcıya açık değildir.
