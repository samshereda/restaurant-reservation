/**
 * List handler for reservation resources
 */
const service = require('./tables.service.js');
const asyncErrorBoundary = require('../errors/asyncErrorBoundary');
const reservationsService = require('../reservations/reservations.service.js');

function tableValidation(req, res, next) {
  const { data } = req.body;
  if (!data) {
    next({
      status: 400,
      message: 'No table data',
    });
  }
  const { table_name, capacity } = data;
  if (!table_name) {
    next({
      status: 400,
      message: 'Table must include table_name',
    });
  }
  if (table_name.length < 2) {
    next({
      status: 400,
      message: 'table_name must be at least 2 characters long',
    });
  }
  if (typeof capacity !== 'number' || !capacity) {
    next({
      status: 400,
      message: 'Table must include capacity',
    });
  }
  next();
}

async function list(req, res) {
  res.json({
    data: await service.list(req.query.date),
  });
}

async function create(req, res) {
  res.status(201).json({
    data: await service.create(req.body.data),
  });
}

async function tableExists(req, res, next) {
  const { table_id } = req.params;
  const foundTable = await service.read(table_id);
  if (foundTable) {
    res.locals.table = foundTable;
    return next();
  }
  next({
    status: 404,
    message: `Table id not found: ${table_id}`,
  });
}

function read(req, res, next) {
  res.json({ data: res.locals.table });
}

async function seat(req, res, next) {
  const { data } = req.body;
  if (!data) {
    next({
      status: 400,
      message: 'No data',
    });
  }
  const { reservation_id } = data;
  const { table } = res.locals;
  if (!reservation_id) {
    next({
      status: 400,
      message: 'Seating must have a reservation_id',
    });
  }
  const reservation = await reservationsService.read(reservation_id);
  if (!reservation) {
    next({
      status: 404,
      message: `Reservation id not found: ${reservation_id}`,
    });
  }
  if (reservation.people > table.capacity) {
    next({
      status: 400,
      message: 'Table capacity cannot be less than people in reservation',
    });
  }
  if (table.reservation_id) {
    next({
      status: 400,
      message: 'Table cannot be occupied',
    });
  }
  if (reservation.status === 'seated') {
    next({
      status: 400,
      message: 'Reservation is already seated',
    });
  }
  const updatedTable = {
    reservation_id: reservation_id,
    table_id: table.table_id,
  };
  res.json({ data: await service.seat(updatedTable) });
}

async function finish(req, res, next) {
  if (!res.locals.table.reservation_id) {
    next({
      status: 400,
      message: 'Cannot finish a table that is not occupied',
    });
  }
  res.json({ data: await service.finish(res.locals.table.table_id) });
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [tableValidation, asyncErrorBoundary(create)],
  read: [asyncErrorBoundary(tableExists), read],
  seat: [asyncErrorBoundary(tableExists), asyncErrorBoundary(seat)],
  finish: [asyncErrorBoundary(tableExists), asyncErrorBoundary(finish)],
};
