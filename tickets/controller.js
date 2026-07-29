const databaseModule = require('../common/database');

const sequelize =
  databaseModule.default ||
  databaseModule.sequelize ||
  databaseModule;
const defineTicket = require('../common/models/Ticket');
const defineEvent = require('../common/models/Event');

const Ticket = defineTicket(sequelize);
const Event = defineEvent(sequelize);

Ticket.belongsTo(Event, {
  foreignKey: 'event_id',
  as: 'event'
});

/**
 * Bir etkinliğe ait biletlerin toplam kontenjanını hesaplar.
 * ignoreTicketId verilirse o bilet hesaba katılmaz.
 */
const calculateTicketTotal = async (
  eventId,
  ignoreTicketId = null,
  transaction = null
) => {
  const tickets = await Ticket.findAll({
    where: {
      event_id: eventId
    },
    transaction
  });

  return tickets.reduce((total, currentTicket) => {
    if (
      ignoreTicketId !== null &&
      Number(currentTicket.ticket_id) ===
        Number(ignoreTicketId)
    ) {
      return total;
    }

    return (
      total +
      Number(currentTicket.total_quantity || 0)
    );
  }, 0);
};

// Tüm biletleri listeler
exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.findAll({
      include: [
        {
          model: Event,
          as: 'event',
          attributes: [
            'event_id',
            'title',
            'event_date'
          ]
        }
      ],
      order: [['ticket_id', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      data: tickets
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Etkinliğe ait biletleri listeler
exports.getTicketsByEventId = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findByPk(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Etkinlik bulunamadı.'
      });
    }

    const tickets = await Ticket.findAll({
      where: {
        event_id: eventId
      },
      order: [['ticket_id', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      data: tickets
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Yeni bilet türü oluşturur
exports.createTicket = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      event_id,
      ticket_type,
      total_quantity,
      available_quantity
    } = req.body;

    if (
      !event_id ||
      !ticket_type ||
      total_quantity === undefined ||
      available_quantity === undefined
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          'event_id, ticket_type, total_quantity ve available_quantity zorunludur.'
      });
    }

    const totalQuantity = Number(total_quantity);
    const availableQuantity = Number(
      available_quantity
    );

    if (
      !Number.isInteger(totalQuantity) ||
      !Number.isInteger(availableQuantity)
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          'Bilet miktarları tam sayı olmalıdır.'
      });
    }

    if (
      totalQuantity < 0 ||
      availableQuantity < 0
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: 'Bilet miktarları negatif olamaz.'
      });
    }

    if (availableQuantity > totalQuantity) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          'Mevcut bilet sayısı toplam bilet sayısından fazla olamaz.'
      });
    }

    const event = await Event.findByPk(event_id, {
      transaction
    });

    if (!event) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          'Belirtilen event_id için etkinlik bulunamadı.'
      });
    }

    const currentTicketTotal =
      await calculateTicketTotal(
        event_id,
        null,
        transaction
      );

    const newTicketTotal =
      currentTicketTotal + totalQuantity;

    if (
      event.capacity !== null &&
      event.capacity !== undefined &&
      newTicketTotal > Number(event.capacity)
    ) {
      const remainingCapacity = Math.max(
        Number(event.capacity) -
          currentTicketTotal,
        0
      );

      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          `Bilet kontenjanlarının toplamı etkinlik kapasitesini aşamaz. ` +
          `Kalan kullanılabilir kapasite: ${remainingCapacity}.`
      });
    }

    const ticket = await Ticket.create(
      {
        event_id,
        ticket_type: ticket_type.trim(),
        total_quantity: totalQuantity,
        available_quantity: availableQuantity
      },
      {
        transaction
      }
    );

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message:
        'Bilet türü başarıyla oluşturuldu.',
      data: ticket
    });
  } catch (error) {
    await transaction.rollback();

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ID değerine göre bilet getirir
exports.getTicketById = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findByPk(
      ticketId,
      {
        include: [
          {
            model: Event,
            as: 'event',
            attributes: [
              'event_id',
              'title',
              'event_date'
            ]
          }
        ]
      }
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Bilet bulunamadı.'
      });
    }

    return res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Bilet bilgilerini günceller
exports.updateTicket = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findByPk(
      ticketId,
      {
        transaction
      }
    );

    if (!ticket) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: 'Bilet bulunamadı.'
      });
    }

    const {
      event_id,
      ticket_type,
      total_quantity,
      available_quantity
    } = req.body;

    const targetEventId =
      event_id ?? ticket.event_id;

    const event = await Event.findByPk(
      targetEventId,
      {
        transaction
      }
    );

    if (!event) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: 'Belirtilen etkinlik bulunamadı.'
      });
    }

    const newTotal = Number(
      total_quantity ?? ticket.total_quantity
    );

    const newAvailable = Number(
      available_quantity ??
        ticket.available_quantity
    );

    if (
      !Number.isInteger(newTotal) ||
      !Number.isInteger(newAvailable)
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          'Bilet miktarları tam sayı olmalıdır.'
      });
    }

    if (newTotal < 0 || newAvailable < 0) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: 'Bilet miktarları negatif olamaz.'
      });
    }

    if (newAvailable > newTotal) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          'Mevcut bilet sayısı toplam bilet sayısından fazla olamaz.'
      });
    }

    const usedTicketCount =
      Number(ticket.total_quantity) -
      Number(ticket.available_quantity);

    if (newTotal < usedTicketCount) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          `Toplam bilet sayısı kullanılan bilet sayısından az olamaz. ` +
          `Bu bilet türünde ${usedTicketCount} bilet kullanılmıştır.`
      });
    }

    const otherTicketsTotal =
      await calculateTicketTotal(
        targetEventId,
        Number(ticket.ticket_id),
        transaction
      );

    const updatedTicketTotal =
      otherTicketsTotal + newTotal;

    if (
      event.capacity !== null &&
      event.capacity !== undefined &&
      updatedTicketTotal >
        Number(event.capacity)
    ) {
      const remainingCapacity = Math.max(
        Number(event.capacity) -
          otherTicketsTotal,
        0
      );

      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          `Bilet kontenjanlarının toplamı etkinlik kapasitesini aşamaz. ` +
          `Bu bilet türü için kullanılabilir en yüksek kontenjan: ` +
          `${remainingCapacity}.`
      });
    }

    await ticket.update(
      {
        event_id: targetEventId,
        ticket_type:
          ticket_type !== undefined
            ? ticket_type.trim()
            : ticket.ticket_type,
        total_quantity: newTotal,
        available_quantity: newAvailable
      },
      {
        transaction
      }
    );

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: 'Bilet başarıyla güncellendi.',
      data: ticket
    });
  } catch (error) {
    await transaction.rollback();

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Bileti siler
exports.deleteTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findByPk(
      ticketId
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Bilet bulunamadı.'
      });
    }

    await ticket.destroy();

    return res.status(200).json({
      success: true,
      message: 'Bilet başarıyla silindi.'
    });
  } catch (error) {
    if (
      error.name ===
      'SequelizeForeignKeyConstraintError'
    ) {
      return res.status(409).json({
        success: false,
        message:
          'Bu bilete ait kayıtlar bulunduğu için bilet silinemez.'
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};