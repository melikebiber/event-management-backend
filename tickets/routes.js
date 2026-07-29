const router = require('express').Router();
const TicketController = require('./controller');
const {
  check
} = require('../common/middlewares/IsAuthenticated');

const {
  has
} = require('../common/middlewares/CheckPermission');
/**
 * @swagger
 * /tickets:
 *   get:
 *     summary: Tüm bilet türlerini listeler
 *     tags:
 *       - Tickets
 *     responses:
 *       200:
 *         description: Biletler başarıyla listelendi
 *       500:
 *         description: Sunucu hatası
 */
router.get(
  '/',
  TicketController.getAllTickets
);

/**
 * @swagger
 * /tickets:
 *   post:
 *     summary: Bir etkinlik için yeni bilet türü oluşturur
 *     tags:
 *       - Tickets
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - event_id
 *               - ticket_type
 *               - total_quantity
 *               - available_quantity
 *             properties:
 *               event_id:
 *                 type: integer
 *                 example: 4
 *               ticket_type:
 *                 type: string
 *                 example: Standart
 *               total_quantity:
 *                 type: integer
 *                 example: 30
 *               available_quantity:
 *                 type: integer
 *                 example: 30
 *     responses:
 *       201:
 *         description: Bilet türü başarıyla oluşturuldu
 *       400:
 *         description: Girilen bilgiler geçersiz
 *       500:
 *         description: Sunucu hatası
 */
router.post(
  '/',
  check,
  has('ADMIN'),
  TicketController.createTicket
);

/**
 * @swagger
 * /tickets/event/{eventId}:
 *   get:
 *     summary: Bir etkinliğe ait biletleri listeler
 *     tags:
 *       - Tickets
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Etkinliğin biletleri listelendi
 *       404:
 *         description: Etkinlik bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.get(
  '/event/:eventId',
  TicketController.getTicketsByEventId
);

/**
 * @swagger
 * /tickets/{ticketId}:
 *   get:
 *     summary: ID değerine göre bilet getirir
 *     tags:
 *       - Tickets
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Bilet getirildi
 *       404:
 *         description: Bilet bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.get(
  '/:ticketId',
  TicketController.getTicketById
);

/**
 * @swagger
 * /tickets/{ticketId}:
 *   put:
 *     summary: Bilet bilgilerini günceller
 *     tags:
 *       - Tickets
 *     parameters:
 *       - in: path
 *         name: ticketId
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
 *               event_id:
 *                 type: integer
 *                 example: 4
 *               ticket_type:
 *                 type: string
 *                 example: Standart
 *               total_quantity:
 *                 type: integer
 *                 example: 40
 *               available_quantity:
 *                 type: integer
 *                 example: 40
 *     responses:
 *       200:
 *         description: Bilet güncellendi
 *       400:
 *         description: Girilen bilgiler geçersiz
 *       404:
 *         description: Bilet bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.put(
  '/:ticketId',
  check,
  has('ADMIN'),
  TicketController.updateTicket
);

/**
 * @swagger
 * /tickets/{ticketId}:
 *   delete:
 *     summary: Bileti siler
 *     tags:
 *       - Tickets
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Bilet silindi
 *       404:
 *         description: Bilet bulunamadı
 *       409:
 *         description: Bilete bağlı kayıt bulunduğu için silinemedi
 *       500:
 *         description: Sunucu hatası
 */
router.delete(
  '/:ticketId',
  check,
  has('ADMIN'),
  TicketController.deleteTicket
);
module.exports = router;