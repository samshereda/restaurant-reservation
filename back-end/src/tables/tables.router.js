/**
 * Defines the router for table resources.
 *
 * @type {Router}
 */
const methodNotAllowed = require('../errors/methodNotAllowed');
const router = require('express').Router();
const controller = require('./tables.controller');

router
  .route('/')
  .get(controller.list)
  .post(controller.create)
  .all(methodNotAllowed);

router.route('/:table_id').get(controller.read).all(methodNotAllowed);

router
  .route('/:table_id/seat')
  .put(controller.seat)
  .delete(controller.finish)
  .all(methodNotAllowed);

module.exports = router;
