/**
 * List handler for reservation resources
 */
const service = require('./reservations.service.js');
const asyncErrorBoundary = require('../errors/asyncErrorBoundary');

function reservationValidation(req, res, next) {
  const { data } = req.body;
  if (!data) {
    next({
      status: 400,
      message: 'No reservation data',
    });
  }
  const {
    first_name,
    last_name,
    mobile_number,
    reservation_date,
    reservation_time,
    people,
    status,
  } = data;
  if (!first_name) {
    next({
      status: 400,
      message: 'Reservation must include a first_name',
    });
  }
  if (!last_name) {
    next({
      status: 400,
      message: 'Reservation must include a last_name',
    });
  }
  if (!mobile_number) {
    next({
      status: 400,
      message: 'Reservation must include a mobile_number',
    });
  }
  if (!reservation_date || !Date.parse(reservation_date)) {
    next({
      status: 400,
      message: 'Reservation must include a reservation_date',
    });
  }
  if (new Date(`${reservation_date} ${reservation_time}`).getDay() === 2) {
    next({
      status: 400,
      message: 'reservation_date cannot be on a tuesday (restaurant is closed)',
    });
  }
  if (new Date(`${reservation_date} ${reservation_time}`) < new Date()) {
    next({
      status: 400,
      message: `Reservation must be in the future. Current date/time is ${new Date()}. Reservation is set to ${new Date(
        `${reservation_date} ${reservation_time}`
      )}`,
    });
  }

  if (
    new Date(`${reservation_date} ${reservation_time}`).getTime() <
      new Date(reservation_date + ' 10:30') ||
    new Date(`${reservation_date} ${reservation_time}`).getTime() >
      new Date(reservation_date + ' 21:30')
  ) {
    next({
      status: 400,
      message: 'reservation_time must be between 10:30am and 9:30pm',
    });
  }

  if (
    !reservation_time ||
    !/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/.test(reservation_time)
  ) {
    next({
      status: 400,
      message: 'Reservation must include a reservation_time',
    });
  }
  if (typeof people !== 'number' || !people) {
    next({
      status: 400,
      message: 'Reservation must include people',
    });
  }
  if (['seated', 'finished'].includes(status)) {
    next({
      status: 400,
      message:
        "Reservation status cannot be 'seated' or 'finished' when created",
    });
  }
  next();
}

async function list(req, res) {
  const { mobile_number, date } = req.query;
  if (mobile_number) {
    res.json({
      data: await service.search(mobile_number),
    });
  }
  res.json({
    data: await service.list(date),
  });
}

async function create(req, res) {
  res.status(201).json({
    data: await service.create(req.body.data),
  });
}

async function update(req, res) {
  await service.update(req.body.data);
  res.status(200).json({
    data: await service.read(res.locals.reservation.reservation_id),
  });
}

async function reservationExists(req, res, next) {
  const { reservationId } = req.params;
  const foundReservation = await service.read(reservationId);
  if (foundReservation) {
    res.locals.reservation = foundReservation;
    return next();
  }
  next({
    status: 404,
    message: `Reservation id not found: ${reservationId}`,
  });
}

async function updateStatus(req, res, next) {
  const { data } = req.body;
  if (!data) {
    next({
      status: 400,
      message: 'No data',
    });
  }
  const { status } = data;
  const { reservation } = res.locals;
  if (!['booked', 'seated', 'finished', 'cancelled'].includes(status)) {
    next({
      status: 400,
      message: 'unknown status',
    });
  }
  if (reservation.status === 'finished') {
    next({
      status: 400,
      message: `Reservation cannot be updated once finished`,
    });
  }
  const updatedReservation = {
    reservation_id: reservation.reservation_id,
    status,
  };
  await service.update(updatedReservation);
  res.json({ data: await service.read(reservation.reservation_id) });
}

function read(req, res, next) {
  res.json({ data: res.locals.reservation });
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    asyncErrorBoundary(reservationValidation),
    asyncErrorBoundary(create),
  ],
  read: [asyncErrorBoundary(reservationExists), asyncErrorBoundary(read)],
  reservationExists: asyncErrorBoundary(reservationExists),
  updateStatus: [
    asyncErrorBoundary(reservationExists),
    asyncErrorBoundary(updateStatus),
  ],
  update: [
    asyncErrorBoundary(reservationExists),
    asyncErrorBoundary(reservationValidation),
    asyncErrorBoundary(update),
  ],
};
