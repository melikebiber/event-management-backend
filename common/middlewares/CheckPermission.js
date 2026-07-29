const sequelize = require('../database');
const defineUser = require('../models/User');

const User = defineUser(sequelize);

exports.has = (requiredRole) => async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı.'
      });
    }

    const currentRole = String(user.role).toUpperCase();
    const expectedRole = String(requiredRole).toUpperCase();

    if (currentRole !== expectedRole) {
      return res.status(403).json({
        success: false,
        message: `Bu işlem için ${expectedRole} rolü gereklidir.`
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};