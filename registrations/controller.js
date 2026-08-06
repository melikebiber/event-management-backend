const { Op } = require('sequelize');
const databaseModule = require('../common/database');

const sequelize =
  databaseModule.default ||
  databaseModule.sequelize ||
  databaseModule;
const defineRegistration = require('../common/models/Registration');
const defineUser = require('../common/models/User');
const defineEvent = require('../common/models/Event');
const defineTicket = require('../common/models/Ticket');
const defineCategory = require('../common/models/Category');
const defineLocation = require('../common/models/Location');

const Registration = defineRegistration(sequelize);
const User = defineUser(sequelize);
const Event = defineEvent(sequelize);
const Ticket = defineTicket(sequelize);
const Category = defineCategory(sequelize);
const Location = defineLocation(sequelize);

// Modeller arasındaki ilişkiler
if (!Registration.associations.user) {
  Registration.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });
}

if (!Registration.associations.event) {
  Registration.belongsTo(Event, {
    foreignKey: 'event_id',
    as: 'event'
  });
}

if (!Registration.associations.ticket) {
  Registration.belongsTo(Ticket, {
    foreignKey: 'ticket_id',
    as: 'ticket'
  });
}
if (!Event.associations.category) {
  Event.belongsTo(Category, {
    foreignKey: 'category_id',
    as: 'category'
  });
}

if (!Event.associations.location) {
  Event.belongsTo(Location, {
    foreignKey: 'location_id',
    as: 'location'
  });
}

// Tüm kayıtları listeler
exports.getAllRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: [
            'user_id',
            'name',
            'surname',
            'email'
          ]
        },
        {
          model: Event,
          as: 'event',
          attributes: [
            'event_id',
            'title',
            'event_date',
            'start_time'
          ]
        },
        {
          model: Ticket,
          as: 'ticket',
          attributes: [
            'ticket_id',
            'ticket_type',
            'total_quantity',
            'available_quantity'
          ]
        }
      ],
      order: [['registration_id', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      data: registrations
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Yeni etkinlik kaydı oluşturur
exports.createRegistration = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      user_id,
      event_id,
      ticket_id
    } = req.body;

    if (!user_id || !event_id || !ticket_id) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          'user_id, event_id ve ticket_id alanları zorunludur.'
      });
    }

    const user = await User.findByPk(user_id, {
      transaction
    });

    if (!user) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: 'Belirtilen user_id için kullanıcı bulunamadı.'
      });
    }

    const event = await Event.findByPk(event_id, {
      transaction
    });

    if (!event) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: 'Belirtilen event_id için etkinlik bulunamadı.'
      });
    }
    const today = new Date()
  .toISOString()
  .slice(0, 10);

if (event.event_date < today) {
  await transaction.rollback();

  return res.status(400).json({
    success: false,
    message:
      'Tarihi geçmiş bir etkinliğe kayıt olunamaz.'
  });
}

if (event.status !== 'active') {
  await transaction.rollback();

  return res.status(400).json({
    success: false,
    message:
      'Bu etkinlik şu anda kayıt kabul etmiyor.'
  });
}

    const ticket = await Ticket.findByPk(ticket_id, {
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!ticket) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: 'Belirtilen ticket_id için bilet bulunamadı.'
      });
    }

    // Seçilen bilet, seçilen etkinliğe ait mi?
    if (ticket.event_id !== Number(event_id)) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: 'Seçilen bilet bu etkinliğe ait değildir.'
      });
    }

    // Kullanıcı aynı etkinliğe daha önce kayıt olmuş mu?
    const existingRegistration =
  await Registration.findOne({
    where: {
      user_id,
      event_id
    },
    transaction,
    lock: transaction.LOCK.UPDATE
  });

if (
  existingRegistration &&
  existingRegistration.status !== 'cancelled'
) {
  await transaction.rollback();

  return res.status(409).json({
    success: false,
    message:
      'Kullanıcı bu etkinliğe zaten kayıtlıdır.'
  });
}

    if (ticket.available_quantity <= 0) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: 'Bu bilet türünde boş kontenjan kalmamıştır.'
      });
    }

    let registration;

if (
  existingRegistration &&
  existingRegistration.status === 'cancelled'
) {
  existingRegistration.ticket_id = ticket_id;
  existingRegistration.status = 'registered';
  existingRegistration.registration_date =
    new Date();

  await existingRegistration.save({
    transaction
  });

  registration = existingRegistration;
} else {
  registration = await Registration.create(
    {
      user_id,
      event_id,
      ticket_id,
      status: 'registered'
    },
    {
      transaction
    }
  );
}

    // Kalan bilet sayısını bir azalt
    ticket.available_quantity -= 1;

    await ticket.save({
      transaction
    });

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: 'Etkinlik kaydı başarıyla oluşturuldu.',
      data: registration,
      remaining_ticket_quantity: ticket.available_quantity
    });
  } catch (error) {
    await transaction.rollback();

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
// Belirli bir kullanıcının kayıtlarını listeler
exports.getUserRegistrations = async (req, res) => {
  try {
    const { userId } = req.params;

    const registrations = await Registration.findAll({
      where: {
  user_id: userId,
  status: {
    [Op.in]: [
      'registered',
      'approved'
    ]
  }
},

      include: [
        {
          model: Event,
          as: 'event',

          attributes: [
            'event_id',
            'title',
            'description',
            'event_date',
            'start_time',
            'end_time',
            'status'
          ],

          include: [
            {
              model: Category,
              as: 'category',
              attributes: [
                'category_id',
                'category_name'
              ]
            },
            {
              model: Location,
              as: 'location',
              attributes: [
                'location_id',
                'location_name',
                'city',
                'district'
              ]
            }
          ]
        },

        {
          model: Ticket,
          as: 'ticket',
          attributes: [
            'ticket_id',
            'ticket_type'
          ]
        }
      ],

      order: [
        ['registration_date', 'DESC']
      ]
    });

    return res.status(200).json({
      success: true,
      data: registrations
    });
  } catch (error) {
    console.error(
      'Kullanıcı kayıtları alınamadı:',
      error
    );

    return res.status(500).json({
      success: false,
      message:
        'Kullanıcının etkinlik kayıtları alınamadı.',
      error: error.message
    });
  }
};
// Belirli bir kullanıcının iptal ettiği kayıtları getirir
exports.getUserCancelledRegistrations =
  async (req, res) => {
    try {
      const { userId } = req.params;

      const registrations =
        await Registration.findAll({
          where: {
            user_id: userId,
            status: 'cancelled'
          },

          include: [
            {
              model: Event,
              as: 'event',

              attributes: [
                'event_id',
                'title',
                'description',
                'event_date',
                'start_time',
                'end_time',
                'status'
              ],

              include: [
                {
                  model: Category,
                  as: 'category',
                  attributes: [
                    'category_id',
                    'category_name'
                  ]
                },
                {
                  model: Location,
                  as: 'location',
                  attributes: [
                    'location_id',
                    'location_name',
                    'city',
                    'district'
                  ]
                }
              ]
            },

            {
              model: Ticket,
              as: 'ticket',
              attributes: [
                'ticket_id',
                'ticket_type'
              ]
            }
          ],

          order: [
            ['registration_date', 'DESC']
          ]
        });

      return res.status(200).json({
        success: true,
        data: registrations
      });
    } catch (error) {
      console.error(
        'İptal edilen kayıtlar alınamadı:',
        error
      );

      return res.status(500).json({
        success: false,
        message:
          'İptal edilen etkinlik kayıtları alınamadı.',
        error: error.message
      });
    }
  };

// Etkinlik kaydını iptal eder
exports.cancelRegistration = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { registrationId } = req.params;

    const registration =
      await Registration.findByPk(
        registrationId,
        {
          transaction,
          lock: transaction.LOCK.UPDATE
        }
      );

    if (!registration) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: 'Kayıt bulunamadı.'
      });
    }

    if (registration.status === 'cancelled') {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: 'Bu kayıt daha önce iptal edilmiş.'
      });
    }

    const ticket = await Ticket.findByPk(
      registration.ticket_id,
      {
        transaction,
        lock: transaction.LOCK.UPDATE
      }
    );

    if (ticket) {
      ticket.available_quantity += 1;

      await ticket.save({
        transaction
      });
    }

    registration.status = 'cancelled';

    await registration.save({
      transaction
    });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: 'Etkinlik kaydı iptal edildi.',
      data: registration
    });
  } catch (error) {
    await transaction.rollback();

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
// ID değerine göre kayıt getirir
exports.getRegistrationById = async (req, res) => {
  try {
    const { registrationId } = req.params;

    const registration = await Registration.findByPk(registrationId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['user_id', 'name', 'surname', 'email']
        },
        {
          model: Event,
          as: 'event',
          attributes: ['event_id', 'title', 'event_date']
        },
        {
          model: Ticket,
          as: 'ticket',
          attributes: ['ticket_id', 'ticket_type']
        }
      ]
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Kayıt bulunamadı.'
      });
    }

    return res.status(200).json({
      success: true,
      data: registration
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Bir etkinliğe ait kayıtları listeler
exports.getEventRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findByPk(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Etkinlik bulunamadı.'
      });
    }

    const registrations = await Registration.findAll({
      where: {
        event_id: eventId
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['user_id', 'name', 'surname', 'email']
        },
        {
          model: Ticket,
          as: 'ticket',
          attributes: ['ticket_id', 'ticket_type']
        }
      ],
      order: [['registration_date', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      data: registrations
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Kayıt durumunu günceller
exports.updateRegistrationStatus = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      'registered',
      'approved',
      'rejected',
      'cancelled'
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          'Status registered, approved, rejected veya cancelled olmalıdır.'
      });
    }

    const registration = await Registration.findByPk(registrationId);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Kayıt bulunamadı.'
      });
    }

    registration.status = status;
    await registration.save();

    return res.status(200).json({
      success: true,
      message: 'Kayıt durumu başarıyla güncellendi.',
      data: registration
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};