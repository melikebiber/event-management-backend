const router = require('express').Router();

const RatingController =
  require('./controller');

const {
  check
} = require(
  '../common/middlewares/IsAuthenticated'
);

const {
  has
} = require(
  '../common/middlewares/CheckPermission'
);

/**
 * @swagger
 * /events/{eventId}/ratings:
 *   post:
 *     summary: Etkinliği değerlendirir
 *     tags:
 *       - Event Ratings
 *     security:
 *       - bearerAuth: []
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
 *             required:
 *               - content_score
 *               - organization_score
 *               - location_score
 *               - satisfaction_score
 *             properties:
 *               content_score:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               organization_score:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               location_score:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               satisfaction_score:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: Etkinlik oldukça güzeldi.
 *     responses:
 *       201:
 *         description: Değerlendirme kaydedildi
 *       400:
 *         description: Geçersiz puan veya etkinlik bitmedi
 *       403:
 *         description: Kullanıcı etkinliğe kayıtlı değil
 *       409:
 *         description: Daha önce değerlendirme yapıldı
 */
router.post(
  '/:eventId/ratings',
  check,
  RatingController.createRating
);

/**
 * @swagger
 * /events/{eventId}/rating-summary:
 *   get:
 *     summary: Etkinliğin genel puanını getirir
 *     tags:
 *       - Event Ratings
 */
router.get(
  '/:eventId/rating-summary',
  RatingController.getRatingSummary
);

/**
 * @swagger
 * /events/{eventId}/rating-summary/admin:
 *   get:
 *     summary: Kriter bazlı puanları getirir
 *     tags:
 *       - Event Ratings
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:eventId/rating-summary/admin',
  check,
  has('ADMIN'),
  RatingController.getAdminRatingSummary
);

module.exports = router;