const router = require('express').Router();
const EventController = require('./controller');

const {
  check
} = require('../common/middlewares/IsAuthenticated');

const {
  has
} = require('../common/middlewares/CheckPermission');
/**
 * @swagger
 * /events:
 *   get:
 *     summary: Tüm etkinlikleri listeler
 *     tags:
 *       - Events
 *     responses:
 *       200:
 *         description: Etkinlikler başarıyla listelendi
 *       500:
 *         description: Sunucu hatası
 */
router.get('/', EventController.getAllEvents);

/**
 * @swagger
 * /events/{eventId}:
 *   get:
 *     summary: ID değerine göre bir etkinliği getirir
 *     tags:
 *       - Events
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Etkinlik ID değeri
 *     responses:
 *       200:
 *         description: Etkinlik başarıyla getirildi
 *       404:
 *         description: Etkinlik bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.get('/:eventId', EventController.getEventById);

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Yeni etkinlik oluşturur
 *     tags:
 *       - Events
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - event_date
 *               - organizer_id
 *             properties:
 *               title:
 *                 type: string
 *                 example: Yapay Zeka Zirvesi
 *               description:
 *                 type: string
 *                 example: Yapay zeka alanındaki güncel gelişmeler
 *               event_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-08-10"
 *               start_time:
 *                 type: string
 *                 example: "10:00:00"
 *               end_time:
 *                 type: string
 *                 example: "16:00:00"
 *               capacity:
 *                 type: integer
 *                 example: 300
 *               status:
 *                 type: string
 *                 example: active
 *               organizer_id:
 *                 type: integer
 *                 example: 5
 *               category_id:
 *                 type: integer
 *                 example: 1
 *               location_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Etkinlik başarıyla oluşturuldu
 *       400:
 *         description: Girilen bilgiler geçersiz
 *       500:
 *         description: Sunucu hatası
 */
router.post(
  '/',
  check,
  has('ADMIN'),
  EventController.createEvent
);

/**
 * @swagger
 * /events/{eventId}:
 *   put:
 *     summary: Bir etkinliği günceller
 *     tags:
 *       - Events
 *     parameters:
 *       - in: path
 *         name: eventId
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
 *               title:
 *                 type: string
 *                 example: Boncuk Kolye Yapım Atölyesi
 *               description:
 *                 type: string
 *                 example: Katılımcılar kendi kolyelerini tasarlar.
 *               event_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-08-15"
 *               start_time:
 *                 type: string
 *                 example: "10:00:00"
 *               end_time:
 *                 type: string
 *                 example: "16:00:00"
 *               capacity:
 *                 type: integer
 *                 example: 30
 *               status:
 *                 type: string
 *                 example: active
 *               organizer_id:
 *                 type: integer
 *                 example: 5
 *               category_id:
 *                 type: integer
 *                 example: 2
 *               location_id:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       200:
 *         description: Etkinlik başarıyla güncellendi
 *       400:
 *         description: Girilen bilgiler geçersiz
 *       404:
 *         description: Etkinlik bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.put(
  '/:eventId',
  check,
  has('ADMIN'),
  EventController.updateEvent
);

/**
 * @swagger
 * /events/{eventId}:
 *   delete:
 *     summary: Bir etkinliği siler
 *     tags:
 *       - Events
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Etkinlik başarıyla silindi
 *       404:
 *         description: Etkinlik bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.delete(
  '/:eventId',
  check,
  has('ADMIN'),
  EventController.deleteEvent
);

module.exports = router;