import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { addReservation, getReservation, editReservation } from '../utils/api';

function ReservationForm() {
  const history = useHistory();
  const initialState = {
    first_name: '',
    last_name: '',
    mobile_number: '',
    reservation_date: '',
    reservation_time: '',
    people: 0,
  };

  const reservation_id = useParams().reservationId;
  const [reservation, setReservation] = useState(initialState);
  useEffect(() => {
    async function loadReservationForm({ signal }) {
      console.log(1);
      if (reservation_id) {
        const reservationFromAPI = await getReservation(reservation_id, signal);
        setReservation(reservationFromAPI);
      }
    }
    const abortController = new AbortController();
    loadReservationForm(abortController);
    return () => abortController.abort();
  }, [reservation_id]);

  function changeHandler({ target: { name, value } }) {
    setReservation((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }

  function changeHandlerNum({ target: { name, value } }) {
    setReservation((prevState) => ({
      ...prevState,
      [name]: Number(value),
    }));
  }

  const [error, setError] = useState(null);

  function validate(reservation) {
    const errors = [];

    function isFutureDate({ reservation_date, reservation_time }) {
      const dt = new Date(`${reservation_date}T${reservation_time}`);
      if (dt < new Date()) {
        errors.push(new Error('Reservation must be set in the future'));
      }
    }

    function isTuesday({ reservation_date, reservation_time }) {
      const day = new Date(`${reservation_date}T${reservation_time}`).getDay();
      if (day === 2) {
        errors.push(new Error('No reservations available on Tuesday.'));
      }
    }

    function isOpenHours({ reservation_date, reservation_time }) {
      if (
        new Date(`${reservation_date} ${reservation_time}`).getTime() <
        new Date(reservation_date + 'T10:30')
      ) {
        errors.push(new Error('Reservation time must be after 10:30 am'));
      }

      if (
        new Date(`${reservation_date} ${reservation_time}`).getTime() >
        new Date(reservation_date + ' 21:30')
      ) {
        errors.push(new Error('Restaurant time must be before 9:30 pm'));
      }
    }

    isFutureDate(reservation);
    isTuesday(reservation);
    isOpenHours(reservation);

    return errors;
  }

  async function submitHandler(event) {
    event.preventDefault();
    event.stopPropagation();

    const reservationErrors = validate(reservation);

    if (reservationErrors.length) {
      return setError(reservationErrors);
    }
    if (reservation_id) {
      await editReservation(reservation);
      const res_date =
        reservation.reservation_date.match(/\d{4}-\d{2}-\d{2}/)[0];
      history.push(`/dashboard?date=` + res_date);
    } else {
      await addReservation(reservation);
      const res_date =
        reservation.reservation_date.match(/\d{4}-\d{2}-\d{2}/)[0];
      history.push(`/dashboard?date=` + res_date);
    }
  }

  return (
    <form onSubmit={submitHandler}>
      {error ? (
        error.map((error, index) => {
          return (
            <div className="alert alert-danger" key={`${index}`}>
              {error.message}
            </div>
          );
        })
      ) : (
        <></>
      )}
      <div className="form-group row">
        <label className="col-sm-2 col-form-label">First name:</label>
        <div className="col-sm-10">
          <input
            name="first_name"
            value={reservation.first_name}
            onChange={changeHandler}
            required
          />
        </div>
      </div>
      <div className="form-group row">
        <label className="col-sm-2 col-form-label">Last name:</label>
        <div className="col-sm-10">
          <input
            name="last_name"
            value={reservation.last_name}
            onChange={changeHandler}
            required
          />
        </div>
      </div>
      <div className="form-group row">
        <label className="col-sm-2 col-form-label">Mobile Number:</label>
        <div className="col-sm-10">
          <input
            name="mobile_number"
            type="tel"
            value={reservation.mobile_number}
            onChange={changeHandler}
            required
          />
        </div>
      </div>
      <div className="form-group row">
        <label className="col-sm-2 col-form-label">Reservation Date:</label>
        <div className="col-sm-10">
          <input
            name="reservation_date"
            type="date"
            value={reservation.reservation_date}
            onChange={changeHandler}
            required
          />
        </div>
      </div>
      <div className="form-group row">
        <label className="col-sm-2 col-form-label">Time:</label>
        <div className="col-sm-10">
          <input
            name="reservation_time"
            type="time"
            value={reservation.reservation_time}
            onChange={changeHandler}
            required
          />
        </div>
      </div>
      <div className="form-group row">
        <label className="col-sm-2 col-form-label">Number of people:</label>
        <div className="col-sm-10">
          <input
            name="people"
            type="number"
            min={1}
            value={reservation.people}
            onChange={changeHandlerNum}
            required
          />
        </div>
      </div>
      <button type="submit">Submit</button>
      <button type="button" onClick={() => history.goBack()}>
        Cancel
      </button>
    </form>
  );
}

export default ReservationForm;
