import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  seatTable,
  listTables,
  getReservation,
  updateReservationStatus,
} from '../utils/api';

function SeatForm() {
  const history = useHistory();
  const initialState = {
    table_id: '',
  };
  const [tables, setTables] = useState([]);
  const [reservation, setReservation] = useState(null);
  const [error, setError] = useState(null);

  const reservation_id = useParams().reservationId;

  useEffect(loadSeatForm, [reservation_id]);

  function loadSeatForm() {
    const abortController = new AbortController();
    listTables(abortController.signal).then(setTables);
    getReservation(reservation_id, abortController.signal).then(setReservation);
    return () => abortController.abort();
  }

  const [formState, setFormState] = useState(initialState);
  function changeHandler({ target: { name, value } }) {
    setFormState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }

  function submitHandler(event) {
    event.preventDefault();
    event.stopPropagation();
    if (
      reservation.people >
      tables.find((table) => table.table_id === parseInt(formState.table_id))
        .capacity
    ) {
      return setError(
        new Error('Table capacity cannot be less than people in reservaiton.')
      );
    }
    const abortController = new AbortController();
    seatTable(formState.table_id, reservation_id, abortController.signal).then(
      () => {
        updateReservationStatus(
          reservation_id,
          'seated',
          abortController.signal
        ).then(history.push('/dashboard'));
      }
    );
  }

  return (
    <form onSubmit={submitHandler}>
      {error ? (
        <div className="alert alert-danger">{error.message}</div>
      ) : (
        <></>
      )}
      <div className="form-group row">
        <label className="col-sm-2 col-form-label">Table:</label>
        <div className="col-sm-10">
          <select
            name="table_id"
            value={formState.table_id}
            minLength="2"
            onChange={changeHandler}
            required
          >
            <option value=""> Please choose an option </option>
            {tables.map((table) => {
              if (table.reservation_id) {
                return null;
              }
              return (
                <option key={table.table_id} value={table.table_id}>
                  {table.table_name} - {table.capacity}
                </option>
              );
            })}
          </select>
        </div>
      </div>
      <div className="btn-group">
        <button className="btn btn-primary" type="submit">
          Submit
        </button>
        <button
          className="btn btn-danger"
          type="button"
          onClick={() => history.goBack()}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default SeatForm;
