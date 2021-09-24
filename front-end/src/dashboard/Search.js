import React, { useState } from 'react';
import { listReservations, updateReservationStatus } from '../utils/api';

function SearchForm() {
  const initialState = {
    mobile_number: '',
  };
  const [reservations, setReservations] = useState(null);

  async function loadResults(mobile_number) {
    const abortController = new AbortController();
    setReservations(
      await listReservations({ mobile_number }, abortController.signal)
    );
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
    loadResults(formState.mobile_number);
  }

  return (
    <>
      <form onSubmit={submitHandler}>
        <div className="form-group row">
          <label className="col-sm-2 col-form-label">Phone number:</label>
          <div className="col-sm-10">
            <input
              name="mobile_number"
              value={formState.mobile_number}
              onChange={changeHandler}
              placeholder="Enter a customer's phone number"
              required
            />
          </div>
        </div>
        <button type="submit">Find</button>
      </form>
      {reservations ? (
        reservations.length > 0 ? (
          reservations.map((reservation) => {
            return (
              <div key={reservation.reservation_id}>
                <p>
                  {reservation.last_name}, {reservation.first_name}
                </p>
                <p>{reservation.mobile_number}</p>
                <p>{reservation.reservation_time}</p>
                <p>{reservation.people}</p>
                <p data-reservation-id-status={reservation.reservation_id}>
                  {reservation.status}
                </p>
                {reservation.status === 'booked' ? (
                  <>
                    <a
                      href={`/reservations/${reservation.reservation_id}/seat`}
                    >
                      Seat
                    </a>
                    <a
                      href={`/reservations/${reservation.reservation_id}/edit`}
                    >
                      Edit
                    </a>
                  </>
                ) : (
                  <></>
                )}
                <button
                  data-reservation-id-cancel={reservation.reservation_id}
                  onClick={async () => {
                    if (
                      window.confirm(
                        'Do you want to cancel this reservation? This cannot be undone.'
                      )
                    ) {
                      const abortController = new AbortController();
                      await updateReservationStatus(
                        reservation.reservation_id,
                        'cancelled',
                        abortController.signal
                      );
                      loadResults(formState.mobile_number, abortController);
                    }
                  }}
                >
                  Cancel
                </button>
                <hr />
              </div>
            );
          })
        ) : (
          <p>No reservations found.</p>
        )
      ) : (
        <></>
      )}
    </>
  );
}

export default SearchForm;
