const addFormats = require('ajv-formats');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Ajv = require('ajv');

const databaseModule = require('../common/database');
const sequelize =
  databaseModule.default ||
  databaseModule.sequelize ||
  databaseModule;
const defineUser = require('../common/models/User');

const User = defineUser(sequelize);

const ajv = new Ajv({
  allErrors: true
});

addFormats(ajv);

// Kayıt olurken gönderilmesi gereken alanlar
const registerSchema = {
  type: 'object',
  required: ['name', 'surname', 'email', 'password'],
  additionalProperties: false,
  properties: {
    name: {
      type: 'string',
      minLength: 2
    },
    surname: {
      type: 'string',
      minLength: 2
    },
    email: {
      type: 'string',
      format: 'email'
    },
    password: {
      type: 'string',
      minLength: 6
    },
    phone: {
      type: 'string',
      minLength: 10
    }
  }
};

// Giriş yaparken gönderilmesi gereken alanlar
const loginSchema = {
  type: 'object',
  required: ['email', 'password'],
  additionalProperties: false,
  properties: {
    email: {
      type: 'string',
      format: 'email'
    },
    password: {
      type: 'string',
      minLength: 6
    }
  }
};

const validateRegister = ajv.compile(registerSchema);
const validateLogin = ajv.compile(loginSchema);

// Şifreyi SHA-256 ile hashler
const encryptPassword = (password) =>
  crypto
    .createHash('sha256')
    .update(password)
    .digest('hex');

// JWT token oluşturur
const generateAccessToken = (user) =>
  jwt.sign(
    {
      userId: user.user_id,
      email: user.email,
      role: user.role
    },
    'your-secret-key',
    {
      expiresIn: '24h'
    }
  );

// POST /signup
exports.register = async (req, res) => {
  if (!validateRegister(req.body)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid input',
      details: validateRegister.errors
    });
  }

  try {
    const {
      name,
      surname,
      email,
      password,
      phone
    } = req.body;

    // Aynı e-posta adresiyle daha önce kullanıcı oluşturulmuş mu?
    const existingUser = await User.findOne({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Bu e-posta adresi zaten kullanılıyor.'
      });
    }

    const encryptedPassword = encryptPassword(password);

    const user = await User.create({
      name,
      surname,
      email,
      password: encryptedPassword,
      phone: phone || null,
      role: 'PARTICIPANT'
    });

    const accessToken = generateAccessToken(user);

    return res.status(201).json({
      success: true,
      message: 'Kullanıcı başarıyla oluşturuldu.',
      user: {
        user_id: user.user_id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      token: accessToken
    });
  } catch (error) {
    console.error('Register error:', error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// POST /login
exports.login = async (req, res) => {
  if (!validateLogin(req.body)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid input',
      details: validateLogin.errors
    });
  }

  try {
    const {
      email,
      password
    } = req.body;

    const encryptedPassword = encryptPassword(password);

    const user = await User.findOne({
      where: {
        email,
        password: encryptedPassword
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'E-posta veya şifre hatalı.'
      });
    }

    const accessToken = generateAccessToken(user);

    return res.status(200).json({
      success: true,
      message: 'Giriş başarılı.',
      user: {
        user_id: user.user_id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      token: accessToken
    });
  } catch (error) {
    console.error('Login error:', error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// username → kaldırıldı
// firstName → name oldu
// lastName → surname oldu
// age → kaldırıldı
// phone → eklendi
// id → user_id oldu