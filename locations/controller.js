const databaseModule = require('../common/database');

const sequelize =
  databaseModule.default ||
  databaseModule.sequelize ||
  databaseModule;
const defineLocation = require('../common/models/Location');

const Location = defineLocation(sequelize);

// Tüm konumları listeler
exports.getAllLocations = async (req, res) => {
  try {
    const locations = await Location.findAll({
      order: [['location_id', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      data: locations
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Yeni konum oluşturur
exports.createLocation = async (req, res) => {
  try {
    const {
      location_name,
      address,
      city,
      district,
      capacity
    } = req.body;

    if (!location_name) {
      return res.status(400).json({
        success: false,
        message: 'Konum adı zorunludur.'
      });
    }

    if (capacity !== undefined && capacity !== null && capacity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Kapasite negatif olamaz.'
      });
    }

    const location = await Location.create({
      location_name,
      address: address || null,
      city: city || null,
      district: district || null,
      capacity: capacity ?? null
    });

    return res.status(201).json({
      success: true,
      message: 'Konum başarıyla oluşturuldu.',
      data: location
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
// ID değerine göre tek konum getirir
exports.getLocationById = async (req, res) => {
  try {
    const { locationId } = req.params;

    const location = await Location.findByPk(locationId);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Konum bulunamadı.'
      });
    }

    return res.status(200).json({
      success: true,
      data: location
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Konumu günceller
exports.updateLocation = async (req, res) => {
  try {
    const { locationId } = req.params;

    const location = await Location.findByPk(locationId);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Konum bulunamadı.'
      });
    }

    const {
      location_name,
      address,
      city,
      district,
      capacity
    } = req.body;

    if (capacity !== undefined && capacity !== null && capacity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Kapasite negatif olamaz.'
      });
    }

    await location.update({
      location_name: location_name ?? location.location_name,
      address: address ?? location.address,
      city: city ?? location.city,
      district: district ?? location.district,
      capacity: capacity ?? location.capacity
    });

    return res.status(200).json({
      success: true,
      message: 'Konum başarıyla güncellendi.',
      data: location
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Konumu siler
exports.deleteLocation = async (req, res) => {
  try {
    const { locationId } = req.params;

    const location = await Location.findByPk(locationId);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Konum bulunamadı.'
      });
    }

    await location.destroy();

    return res.status(200).json({
      success: true,
      message: 'Konum başarıyla silindi.'
    });
  } catch (error) {
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(409).json({
        success: false,
        message:
          'Bu konuma bağlı etkinlikler bulunduğu için konum silinemez.'
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};