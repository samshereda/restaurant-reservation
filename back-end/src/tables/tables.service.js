const knex = require('../db/connection');

function list() {
  return knex('tables').select('*').orderBy('table_name');
}

function create(table) {
  return knex('tables')
    .insert(table)
    .returning('*')
    .then((createdRecords) => createdRecords[0]);
}

function read(table_id) {
  return knex('tables').select('*').where({ table_id }).first();
}

function seat({ table_id, reservation_id }) {
  return knex.transaction(async (trx) => {
    await trx('reservations')
      .select('*')
      .where({ reservation_id })
      .update({ status: 'seated' });

    await trx('tables')
      .select('*')
      .where({ table_id })
      .update({ reservation_id });
  });
}

function finish(table_id) {
  return knex.transaction(async (trx) => {
    const { reservation_id } = await trx('tables')
      .select('*')
      .where({ table_id })
      .first();
    await trx('reservations')
      .select('*')
      .where({ reservation_id })
      .update({ status: 'finished' });
    await trx('tables')
      .select('*')
      .where({ table_id })
      .update({ reservation_id: null });
  });
}

module.exports = {
  create,
  list,
  read,
  seat,
  finish,
};
