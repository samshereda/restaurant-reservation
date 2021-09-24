const knex = require('../db/connection');

function list(reservation_date = null) {
  if (!reservation_date) {
    return knex('reservations').select('*');
  }
  return knex('reservations')
    .select('*')
    .where({ reservation_date })
    .whereNotIn('status', ['finished', 'cancelled'])
    .orderBy('reservation_time');
}

function search(mobile_number) {
  return knex('reservations')
    .whereRaw(
      "translate(mobile_number, '() -', '') like ?",
      `%${mobile_number.replace(/\D/g, '')}%`
    )
    .orderBy('reservation_date');
}

function create(reservation) {
  return knex('reservations')
    .insert(reservation)
    .returning('*')
    .then((createdRecords) => createdRecords[0]);
}

function read(reservation_id) {
  return knex('reservations').select('*').where({ reservation_id }).first();
}

function update(updatedReservation) {
  return knex('reservations')
    .select('*')
    .where({ reservation_id: updatedReservation.reservation_id })
    .update(updatedReservation);
}

module.exports = {
  create,
  list,
  read,
  update,
  search,
};
