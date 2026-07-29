const router = require('express').Router();
const LocationController = require('./controller');

const {
  check
} = require('../common/middlewares/IsAuthenticated');

const {
  has
} = require('../common/middlewares/CheckPermission');
/**
 * @swagger
 * /locations:
 *   get:
 *     summary: Tüm etkinlik konumlarını listeler
 *     tags:
 *       - Locations
 *     responses:
 *       200:
 *         description: Konumlar başarıyla listelendi
 *       500:
 *         description: Sunucu hatası
 */
router.get('/', LocationController.getAllLocations);

/**
 * @swagger
 * /locations:
 *   post:
 *     summary: Yeni etkinlik konumu oluşturur
 *     tags:
 *       - Locations
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - location_name
 *             properties:
 *               location_name:
 *                 type: string
 *                 example: Cumhuriyet Kültür Merkezi
 *               address:
 *                 type: string
 *                 example: Üniversite Kampüsü
 *               city:
 *                 type: string
 *                 example: Sivas
 *               district:
 *                 type: string
 *                 example: Merkez
 *               capacity:
 *                 type: integer
 *                 example: 500
 *     responses:
 *       201:
 *         description: Konum başarıyla oluşturuldu
 *       400:
 *         description: Girilen bilgiler geçersiz
 *       500:
 *         description: Sunucu hatası
 */
router.post(
  '/',
  check,
  has('ADMIN'),
  LocationController.createLocation
);

/**
 * @swagger
 * /locations/{locationId}:
 *   get:
 *     summary: ID değerine göre konum getirir
 *     tags:
 *       - Locations
 *     parameters:
 *       - in: path
 *         name: locationId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Konum getirildi
 *       404:
 *         description: Konum bulunamadı
 */
router.get('/:locationId', LocationController.getLocationById);

/**
 * @swagger
 * /locations/{locationId}:
 *   put:
 *     summary: Konum bilgilerini günceller
 *     tags:
 *       - Locations
 *     parameters:
 *       - in: path
 *         name: locationId
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
 *               location_name:
 *                 type: string
 *                 example: Güncellenmiş Kültür Merkezi
 *               address:
 *                 type: string
 *                 example: Üniversite Kampüsü
 *               city:
 *                 type: string
 *                 example: Sivas
 *               district:
 *                 type: string
 *                 example: Merkez
 *               capacity:
 *                 type: integer
 *                 example: 600
 *     responses:
 *       200:
 *         description: Konum güncellendi
 *       404:
 *         description: Konum bulunamadı
 */
router.put(
  '/:locationId',
  check,
  has('ADMIN'),
  LocationController.updateLocation
);

/**
 * @swagger
 * /locations/{locationId}:
 *   delete:
 *     summary: Konumu siler
 *     tags:
 *       - Locations
 *     parameters:
 *       - in: path
 *         name: locationId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Konum silindi
 *       404:
 *         description: Konum bulunamadı
 *       409:
 *         description: Konuma bağlı etkinlik bulunduğu için silinemedi
 */
router.delete(
  '/:locationId',
  check,
  has('ADMIN'),
  LocationController.deleteLocation
);
module.exports = router;