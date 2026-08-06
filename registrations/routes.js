const router = require('express').Router();
const RegistrationController = require('./controller');

/**
 * @swagger
 * /registrations:
 *   get:
 *     summary: Tüm etkinlik kayıtlarını listeler
 *     tags:
 *       - Registrations
 *     responses:
 *       200:
 *         description: Kayıtlar başarıyla listelendi
 *       500:
 *         description: Sunucu hatası
 */
router.get(
  '/',
  RegistrationController.getAllRegistrations
);

/**
 * @swagger
 * /registrations:
 *   post:
 *     summary: Bir kullanıcıyı etkinliğe kaydeder
 *     tags:
 *       - Registrations
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - event_id
 *               - ticket_id
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 5
 *               event_id:
 *                 type: integer
 *                 example: 4
 *               ticket_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Etkinlik kaydı başarıyla oluşturuldu
 *       400:
 *         description: Bilgiler geçersiz veya bilet kalmamış
 *       409:
 *         description: Kullanıcı etkinliğe zaten kayıtlı
 *       500:
 *         description: Sunucu hatası
 */
router.post(
  '/',
  RegistrationController.createRegistration
);

/**
 * @swagger
 * /registrations/user/{userId}:
 *   get:
 *     summary: Bir kullanıcının etkinlik kayıtlarını listeler
 *     tags:
 *       - Registrations
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Kullanıcının kayıtları listelendi
 *       500:
 *         description: Sunucu hatası
 */
router.get(
  '/user/:userId',
  RegistrationController.getUserRegistrations
);
/**
 * @swagger
 * /registrations/user/{userId}/cancelled:
 *   get:
 *     summary: Bir kullanıcının iptal ettiği etkinlik kayıtlarını listeler
 *     tags:
 *       - Registrations
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: İptal edilen kayıtlar başarıyla listelendi
 *       500:
 *         description: Sunucu hatası
 */
router.get(
  '/user/:userId/cancelled',
  RegistrationController.getUserCancelledRegistrations
);

/**
 * @swagger
 * /registrations/{registrationId}:
 *   delete:
 *     summary: Etkinlik kaydını iptal eder
 *     tags:
 *       - Registrations
 *     parameters:
 *       - in: path
 *         name: registrationId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Etkinlik kaydı iptal edildi
 *       404:
 *         description: Kayıt bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.delete(
  '/:registrationId',
  RegistrationController.cancelRegistration
);
/**
 * @swagger
 * /registrations/event/{eventId}:
 *   get:
 *     summary: Bir etkinliğe ait kayıtları listeler
 *     tags:
 *       - Registrations
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Etkinliğin kayıtları listelendi
 *       404:
 *         description: Etkinlik bulunamadı
 */
router.get(
  '/event/:eventId',
  RegistrationController.getEventRegistrations
);

/**
 * @swagger
 * /registrations/{registrationId}:
 *   get:
 *     summary: ID değerine göre kayıt getirir
 *     tags:
 *       - Registrations
 *     parameters:
 *       - in: path
 *         name: registrationId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Kayıt getirildi
 *       404:
 *         description: Kayıt bulunamadı
 */
router.get(
  '/:registrationId',
  RegistrationController.getRegistrationById
);

/**
 * @swagger
 * /registrations/{registrationId}:
 *   put:
 *     summary: Kayıt durumunu günceller
 *     tags:
 *       - Registrations
 *     parameters:
 *       - in: path
 *         name: registrationId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum:
 *                   - registered
 *                   - approved
 *                   - rejected
 *                   - cancelled
 *                 example: approved
 *     responses:
 *       200:
 *         description: Kayıt durumu güncellendi
 *       400:
 *         description: Status değeri geçersiz
 *       404:
 *         description: Kayıt bulunamadı
 */
router.put(
  '/:registrationId',
  RegistrationController.updateRegistrationStatus
);

module.exports = router;