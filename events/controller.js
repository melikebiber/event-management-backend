const databaseModule = require('../common/database');

const sequelize =
  databaseModule.default ||
  databaseModule.sequelize ||
  databaseModule;

const defineEvent =
  require('../common/models/Event');

const defineUser =
  require('../common/models/User');

const defineCategory =
  require('../common/models/Category');

const defineLocation =
  require('../common/models/Location');

const defineTicket =
  require('../common/models/Ticket');

const defineRegistration =
  require('../common/models/Registration');

const Event = defineEvent(sequelize);
const User = defineUser(sequelize);
const Category = defineCategory(sequelize);
const Location = defineLocation(sequelize);
const Ticket = defineTicket(sequelize);
const Registration =
  defineRegistration(sequelize);

// İlişkiler
Event.belongsTo(User, {
  foreignKey: 'organizer_id',
  as: 'organizer'
});

Event.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category'
});

Event.belongsTo(Location, {
  foreignKey: 'location_id',
  as: 'location'
});

/**
 * Bir etkinliğe ait toplam bilet kontenjanını hesaplar.
 */
const calculateEventTicketTotal = async (
  eventId,
  transaction = null
) => {
  const tickets = await Ticket.findAll({
    where: {
      event_id: eventId
    },
    transaction
  });

  return tickets.reduce(
    (total, currentTicket) =>
      total +
      Number(currentTicket.total_quantity || 0),
    0
  );
};

// Tüm etkinlikleri listeler
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: [
            'user_id',
            'name',
            'surname',
            'email'
          ]
        },
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
      ],
      order: [
        ['event_date', 'ASC'],
        ['start_time', 'ASC']
      ]
    });

    return res.status(200).json({
      success: true,
      data: events
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ID değerine göre tek etkinlik getirir
exports.getEventById = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findByPk(
      eventId,
      {
        include: [
          {
            model: User,
            as: 'organizer',
            attributes: [
              'user_id',
              'name',
              'surname',
              'email'
            ]
          },
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
              'address',
              'city',
              'district',
              'capacity'
            ]
          }
        ]
      }
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Etkinlik bulunamadı.'
      });
    }

    return res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Yeni etkinlik oluşturur
exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      event_date,
      start_time,
      end_time,
      capacity,
      status,
      organizer_id,
      category_id,
      location_id
    } = req.body;

    if (
      !title ||
      !event_date ||
      !organizer_id
    ) {
      return res.status(400).json({
        success: false,
        message:
          'title, event_date ve organizer_id alanları zorunludur.'
      });
    }

    const parsedCapacity =
      capacity !== undefined &&
      capacity !== null
        ? Number(capacity)
        : null;

    if (
      parsedCapacity !== null &&
      (
        !Number.isInteger(parsedCapacity) ||
        parsedCapacity < 0
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Kapasite negatif olmayan bir tam sayı olmalıdır.'
      });
    }

    const organizer = await User.findByPk(
      organizer_id
    );

    if (!organizer) {
      return res.status(400).json({
        success: false,
        message:
          'Belirtilen organizer_id için kullanıcı bulunamadı.'
      });
    }

    if (
      category_id !== undefined &&
      category_id !== null
    ) {
      const category = await Category.findByPk(
        category_id
      );

      if (!category) {
        return res.status(400).json({
          success: false,
          message:
            'Belirtilen category_id için kategori bulunamadı.'
        });
      }
    }

    if (
      location_id !== undefined &&
      location_id !== null
    ) {
      const location = await Location.findByPk(
        location_id
      );

      if (!location) {
        return res.status(400).json({
          success: false,
          message:
            'Belirtilen location_id için konum bulunamadı.'
        });
      }

      if (
        parsedCapacity !== null &&
        location.capacity !== null &&
        location.capacity !== undefined &&
        parsedCapacity > Number(location.capacity)
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Etkinlik kapasitesi seçilen mekânın kapasitesini aşamaz. ` +
            `Mekân kapasitesi: ${location.capacity}.`
        });
      }
    }

    if (
      start_time &&
      end_time &&
      start_time >= end_time
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Bitiş saati başlangıç saatinden sonra olmalıdır.'
      });
    }

    const event = await Event.create({
      title: title.trim(),
      description: description || null,
      event_date,
      start_time: start_time || null,
      end_time: end_time || null,
      capacity: parsedCapacity,
      status: status || 'active',
      organizer_id,
      category_id: category_id ?? null,
      location_id: location_id ?? null
    });

    return res.status(201).json({
      success: true,
      message:
        'Etkinlik başarıyla oluşturuldu.',
      data: event
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Etkinliği günceller
exports.updateEvent = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { eventId } = req.params;

    const event = await Event.findByPk(
      eventId,
      {
        transaction
      }
    );

    if (!event) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: 'Etkinlik bulunamadı.'
      });
    }

    const {
      title,
      description,
      event_date,
      start_time,
      end_time,
      capacity,
      status,
      organizer_id,
      category_id,
      location_id
    } = req.body;

    const newCapacity =
      capacity !== undefined &&
      capacity !== null
        ? Number(capacity)
        : Number(event.capacity);

    if (
      !Number.isInteger(newCapacity) ||
      newCapacity < 0
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          'Kapasite negatif olmayan bir tam sayı olmalıdır.'
      });
    }

    const finalStartTime =
      start_time ?? event.start_time;

    const finalEndTime =
      end_time ?? event.end_time;

    if (
      finalStartTime &&
      finalEndTime &&
      finalStartTime >= finalEndTime
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          'Bitiş saati başlangıç saatinden sonra olmalıdır.'
      });
    }

    if (organizer_id !== undefined) {
      const organizer = await User.findByPk(
        organizer_id,
        {
          transaction
        }
      );

      if (!organizer) {
        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message:
            'Belirtilen organizer_id için kullanıcı bulunamadı.'
        });
      }
    }

    if (
      category_id !== undefined &&
      category_id !== null
    ) {
      const category = await Category.findByPk(
        category_id,
        {
          transaction
        }
      );

      if (!category) {
        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message:
            'Belirtilen category_id için kategori bulunamadı.'
        });
      }
    }

    const finalLocationId =
      location_id !== undefined
        ? location_id
        : event.location_id;

    if (
      finalLocationId !== undefined &&
      finalLocationId !== null
    ) {
      const location = await Location.findByPk(
        finalLocationId,
        {
          transaction
        }
      );

      if (!location) {
        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message:
            'Belirtilen location_id için konum bulunamadı.'
        });
      }

      if (
        location.capacity !== null &&
        location.capacity !== undefined &&
        newCapacity > Number(location.capacity)
      ) {
        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message:
            `Etkinlik kapasitesi seçilen mekânın kapasitesini aşamaz. ` +
            `Mekân kapasitesi: ${location.capacity}.`
        });
      }
    }

    const totalTicketCapacity =
      await calculateEventTicketTotal(
        eventId,
        transaction
      );

    if (newCapacity < totalTicketCapacity) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          `Etkinlik kapasitesi mevcut bilet kontenjanlarının toplamından az olamaz. ` +
          `Mevcut toplam bilet kontenjanı: ${totalTicketCapacity}.`
      });
    }

    await event.update(
      {
        title:
          title !== undefined
            ? title.trim()
            : event.title,
        description:
          description ?? event.description,
        event_date:
          event_date ?? event.event_date,
        start_time: finalStartTime,
        end_time: finalEndTime,
        capacity: newCapacity,
        status: status ?? event.status,
        organizer_id:
          organizer_id ?? event.organizer_id,
        category_id:
          category_id !== undefined
            ? category_id
            : event.category_id,
        location_id: finalLocationId
      },
      {
        transaction
      }
    );

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message:
        'Etkinlik başarıyla güncellendi.',
      data: event
    });
  } catch (error) {
    await transaction.rollback();

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Etkinliği ve bağlı kayıtları siler
exports.deleteEvent = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { eventId } = req.params;

    const event = await Event.findByPk(
      eventId,
      {
        transaction
      }
    );

    if (!event) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: 'Etkinlik bulunamadı.'
      });
    }

    await Registration.destroy({
      where: {
        event_id: eventId
      },
      transaction
    });

    await Ticket.destroy({
      where: {
        event_id: eventId
      },
      transaction
    });

    await event.destroy({
      transaction
    });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message:
        'Etkinlik ve bağlı kayıtlar başarıyla silindi.'
    });
  } catch (error) {
    await transaction.rollback();

    return res.status(500).json({
      success: false,
      message: 'Etkinlik silinemedi.',
      error: error.message
    });
  }
};