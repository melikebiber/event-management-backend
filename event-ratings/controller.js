const databaseModule = require('../common/database');

const sequelize =
  databaseModule.default ||
  databaseModule.sequelize ||
  databaseModule;

const { fn, col } = require('sequelize');

const defineEventRating =
  require('../common/models/EventRating');

const defineEvent =
  require('../common/models/Event');

const defineRegistration =
  require('../common/models/Registration');

const EventRating = defineEventRating(sequelize);
const Event = defineEvent(sequelize);
const Registration = defineRegistration(sequelize);

/**
 * Kullanıcının giriş bilgisindeki ID değerini alır.
 */
const getUserId = (req) => {
  return (
    req.user?.userId ||
    req.user?.user_id ||
    req.user?.id
  );
};

/**
 * Etkinlik değerlendirmesi oluşturur.
 */
exports.createRating = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = getUserId(req);

    const {
      content_score,
      organization_score,
      location_score,
      satisfaction_score,
      comment
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı bilgisi bulunamadı.'
      });
    }

    const scores = [
      content_score,
      organization_score,
      location_score,
      satisfaction_score
    ];

    const invalidScore = scores.some(
      (score) =>
        !Number.isInteger(Number(score)) ||
        Number(score) < 1 ||
        Number(score) > 5
    );

    if (invalidScore) {
      return res.status(400).json({
        success: false,
        message:
          'Bütün puanlar 1 ile 5 arasında olmalıdır.'
      });
    }

    const event = await Event.findByPk(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Etkinlik bulunamadı.'
      });
    }

    const registration =
      await Registration.findOne({
        where: {
          user_id: userId,
          event_id: eventId,
          status: 'registered'
        }
      });

    if (!registration) {
      return res.status(403).json({
        success: false,
        message:
          'Yalnızca etkinliğe kayıtlı kullanıcılar değerlendirme yapabilir.'
      });
    }

    const today = new Date()
      .toISOString()
      .slice(0, 10);

    if (event.event_date >= today) {
      return res.status(400).json({
        success: false,
        message:
          'Etkinlik tamamlanmadan değerlendirme yapılamaz.'
      });
    }

    const existingRating =
      await EventRating.findOne({
        where: {
          user_id: userId,
          event_id: eventId
        }
      });

    if (existingRating) {
      return res.status(409).json({
        success: false,
        message:
          'Bu etkinliği daha önce değerlendirdiniz.'
      });
    }

    const rating = await EventRating.create({
      user_id: userId,
      event_id: Number(eventId),
      content_score: Number(content_score),
      organization_score:
        Number(organization_score),
      location_score: Number(location_score),
      satisfaction_score:
        Number(satisfaction_score),
      comment: comment?.trim() || null,
      updated_at: new Date()
    });

    const averageScore =
      (
        Number(content_score) +
        Number(organization_score) +
        Number(location_score) +
        Number(satisfaction_score)
      ) / 4;

    return res.status(201).json({
      success: true,
      message:
        'Etkinlik değerlendirmesi başarıyla kaydedildi.',
      data: {
        ...rating.toJSON(),
        average_score:
          Number(averageScore.toFixed(1))
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        'Etkinlik değerlendirmesi kaydedilemedi.',
      error: error.message
    });
  }
};

/**
 * Kullanıcı tarafında gösterilecek genel puanı getirir.
 */
exports.getRatingSummary = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findByPk(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Etkinlik bulunamadı.'
      });
    }

    const result = await EventRating.findOne({
      where: {
        event_id: eventId
      },
      attributes: [
        [
          fn(
            'AVG',
            (
              col('content_score') +
              col('organization_score') +
              col('location_score') +
              col('satisfaction_score')
            ) / 4
          ),
          'average_score'
        ],
        [
          fn('COUNT', col('rating_id')),
          'rating_count'
        ]
      ],
      raw: true
    });

    return res.status(200).json({
      success: true,
      data: {
        average_score:
          result?.average_score
            ? Number(
                Number(
                  result.average_score
                ).toFixed(1)
              )
            : 0,

        rating_count:
          Number(result?.rating_count || 0)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        'Değerlendirme bilgileri alınamadı.',
      error: error.message
    });
  }
};

/**
 * Admin için kriterlerin ayrı ortalamalarını getirir.
 */
exports.getAdminRatingSummary = async (
  req,
  res
) => {
  try {
    const { eventId } = req.params;

    const result = await EventRating.findOne({
      where: {
        event_id: eventId
      },
      attributes: [
        [
          fn('AVG', col('content_score')),
          'content_average'
        ],
        [
          fn(
            'AVG',
            col('organization_score')
          ),
          'organization_average'
        ],
        [
          fn('AVG', col('location_score')),
          'location_average'
        ],
        [
          fn(
            'AVG',
            col('satisfaction_score')
          ),
          'satisfaction_average'
        ],
        [
          fn('COUNT', col('rating_id')),
          'rating_count'
        ]
      ],
      raw: true
    });

    const formatAverage = (value) => {
      return value
        ? Number(Number(value).toFixed(1))
        : 0;
    };

    return res.status(200).json({
      success: true,
      data: {
        content_average:
          formatAverage(
            result?.content_average
          ),

        organization_average:
          formatAverage(
            result?.organization_average
          ),

        location_average:
          formatAverage(
            result?.location_average
          ),

        satisfaction_average:
          formatAverage(
            result?.satisfaction_average
          ),

        rating_count:
          Number(result?.rating_count || 0)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        'Detaylı değerlendirme bilgileri alınamadı.',
      error: error.message
    });
  }
};