const databaseModule = require('../common/database');

const sequelize =
  databaseModule.default ||
  databaseModule.sequelize ||
  databaseModule;
const defineCategory = require('../common/models/Category');

const Category = defineCategory(sequelize);

// Tüm kategorileri listeler
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['category_id', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Yeni kategori oluşturur
exports.createCategory = async (req, res) => {
  try {
    const { category_name, description } = req.body;

    if (!category_name) {
      return res.status(400).json({
        success: false,
        message: 'Kategori adı zorunludur.'
      });
    }

    const category = await Category.create({
      category_name,
      description: description || null
    });

    res.status(201).json({
      success: true,
      message: 'Kategori başarıyla oluşturuldu.',
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
// ID değerine göre kategori getirir
exports.getCategoryById = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await Category.findByPk(categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori bulunamadı.'
      });
    }

    return res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Kategoriyi günceller
exports.updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await Category.findByPk(categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori bulunamadı.'
      });
    }

    const { category_name, description } = req.body;

    await category.update({
      category_name: category_name ?? category.category_name,
      description: description ?? category.description
    });

    return res.status(200).json({
      success: true,
      message: 'Kategori başarıyla güncellendi.',
      data: category
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Kategoriyi siler
exports.deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await Category.findByPk(categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Kategori bulunamadı.'
      });
    }

    await category.destroy();

    return res.status(200).json({
      success: true,
      message: 'Kategori başarıyla silindi.'
    });
  } catch (error) {
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(409).json({
        success: false,
        message:
          'Bu kategoriye bağlı etkinlikler bulunduğu için kategori silinemez.'
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};