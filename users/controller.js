const databaseModule = require('../common/database');

const sequelize =
  databaseModule.default ||
  databaseModule.sequelize ||
  databaseModule;
const defineUser = require('../common/models/User');

const User = defineUser(sequelize);

// Giriş yapan kullanıcının bilgilerini getirir
exports.getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: [
        'user_id',
        'name',
        'surname',
        'email',
        'phone',
        'role',
        'created_at'
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı.'
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Veritabanındaki bütün kullanıcıları getirir
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        'user_id',
        'name',
        'surname',
        'email',
        'phone',
        'role',
        'created_at'
      ],
      order: [['user_id', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
// ID değerine göre kullanıcı getirir
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId, {
      attributes: [
        'user_id',
        'name',
        'surname',
        'email',
        'phone',
        'role',
        'created_at'
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı.'
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Kullanıcı bilgilerini günceller
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı.'
      });
    }

    const {
      name,
      surname,
      email,
      phone,
      role
    } = req.body;

    if (email && email !== user.email) {
      const existingUser = await User.findOne({
        where: { email }
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Bu e-posta adresi zaten kullanılıyor.'
        });
      }
    }

    await user.update({
      name: name ?? user.name,
      surname: surname ?? user.surname,
      email: email ?? user.email,
      phone: phone ?? user.phone,
      role: role ?? user.role
    });

    return res.status(200).json({
      success: true,
      message: 'Kullanıcı başarıyla güncellendi.',
      data: {
        user_id: user.user_id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        phone: user.phone,
        role: user.role,
        created_at: user.created_at
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Kullanıcıyı siler
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı.'
      });
    }

    await user.destroy();

    return res.status(200).json({
      success: true,
      message: 'Kullanıcı başarıyla silindi.'
    });
  } catch (error) {
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(409).json({
        success: false,
        message:
          'Bu kullanıcıya bağlı etkinlik veya kayıt bulunduğu için kullanıcı silinemez.'
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};