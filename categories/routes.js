const router = require('express').Router();
const CategoryController = require('./controller');
const { check } = require('../common/middlewares/IsAuthenticated');
const { has } = require('../common/middlewares/CheckPermission');

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Tüm kategorileri listeler
 *     tags:
 *       - Categories
 *     responses:
 *       200:
 *         description: Kategoriler başarıyla listelendi
 *       500:
 *         description: Sunucu hatası
 */
router.get('/', CategoryController.getAllCategories);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Yeni kategori oluşturur
 *     description: Bu endpoint yalnızca ADMIN rolündeki kullanıcılar tarafından kullanılabilir.
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category_name
 *             properties:
 *               category_name:
 *                 type: string
 *                 example: Teknoloji
 *               description:
 *                 type: string
 *                 example: Yazılım ve teknoloji etkinlikleri
 *     responses:
 *       201:
 *         description: Kategori başarıyla oluşturuldu
 *       400:
 *         description: Kategori adı zorunludur
 *       401:
 *         description: Token eksik veya geçersiz
 *       403:
 *         description: Bu işlem için ADMIN rolü gerekli
 *       500:
 *         description: Sunucu hatası
 */
router.post(
  '/',
  check,
  has('ADMIN'),
  CategoryController.createCategory
);

/**
 * @swagger
 * /categories/{categoryId}:
 *   get:
 *     summary: ID değerine göre kategori getirir
 *     tags:
 *       - Categories
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Kategori getirildi
 *       404:
 *         description: Kategori bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.get(
  '/:categoryId',
  CategoryController.getCategoryById
);

/**
 * @swagger
 * /categories/{categoryId}:
 *   put:
 *     summary: Kategoriyi günceller
 *     description: Bu endpoint yalnızca ADMIN rolündeki kullanıcılar tarafından kullanılabilir.
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
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
 *               category_name:
 *                 type: string
 *                 example: El Sanatları
 *               description:
 *                 type: string
 *                 example: El işi ve tasarım etkinlikleri
 *     responses:
 *       200:
 *         description: Kategori güncellendi
 *       401:
 *         description: Token eksik veya geçersiz
 *       403:
 *         description: Bu işlem için ADMIN rolü gerekli
 *       404:
 *         description: Kategori bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.put(
  '/:categoryId',
  check,
  has('ADMIN'),
  CategoryController.updateCategory
);

/**
 * @swagger
 * /categories/{categoryId}:
 *   delete:
 *     summary: Kategoriyi siler
 *     description: Bu endpoint yalnızca ADMIN rolündeki kullanıcılar tarafından kullanılabilir.
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Kategori silindi
 *       401:
 *         description: Token eksik veya geçersiz
 *       403:
 *         description: Bu işlem için ADMIN rolü gerekli
 *       404:
 *         description: Kategori bulunamadı
 *       409:
 *         description: Kategoriye bağlı etkinlik olduğu için silinemedi
 *       500:
 *         description: Sunucu hatası
 */
router.delete(
  '/:categoryId',
  check,
  has('ADMIN'),
  CategoryController.deleteCategory
);

module.exports = router;