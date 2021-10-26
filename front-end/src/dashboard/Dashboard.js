import React, { useEffect, useState } from 'react';
import {
  listReservations,
  listTables,
  finishTable,
  updateReservationStatus,
} from '../utils/api';
import useQuery from '../utils/useQuery';
import { Link } from 'react-router-dom';
import { next, previous } from '../utils/date-time';

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);

  date = useQuery().get('date') ?? date;
  useEffect(() => {
    const abortController = new AbortController();
    loadDashboard(abortController);
    return () => abortController.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  async function loadDashboard({ signal }) {
    const newReservations = await listReservations({ date }, signal);
    setReservations(await listReservations({ date }, signal));
    setTables(await listTables(signal));
  }

  console.log(reservations[0]?.first_name);

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="btn-group">
        <Link
          to={`/dashboard?date=${previous(date)}`}
          className="btn btn-secondary"
        >
          Previous
        </Link>
        <Link to="/dashboard" className="btn btn-primary">
          Today
        </Link>
        <Link
          to={`/dashboard?date=${next(date)}`}
          className="btn btn-secondary"
        >
          Next
        </Link>
      </div>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for date: {date}</h4>
      </div>
      {reservations.map((reservation) => {
        return (
          <div key={reservation.reservation_id} className="card">
            <p>
              Name: {reservation.last_name}, {reservation.first_name}
            </p>
            <p>Mobile number: {reservation.mobile_number}</p>
            <p>Time: {reservation.reservation_time}</p>
            <p>Number of People: {reservation.people}</p>
            <p>
              Status:{' '}
              <span data-reservation-id-status={reservation.reservation_id}>
                {reservation.status}
              </span>
            </p>
            <div className="btn-group">
              {reservation.status === 'booked' ? (
                <>
                  <a
                    className="btn btn-primary"
                    href={`/reservations/${reservation.reservation_id}/seat`}
                  >
                    Seat
                  </a>
                  <a
                    className="btn btn-secondary"
                    href={`/reservations/${reservation.reservation_id}/edit`}
                  >
                    Edit
                  </a>
                </>
              ) : (
                <></>
              )}
              <button
                className="btn btn-danger"
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
                    loadDashboard(abortController);
                  }
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        );
      })}
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Tables</h4>
      </div>
      {tables.map((table) => {
        return (
          <div key={table.table_id} className="card">
            <p>Table: {table.table_name}</p>
            <p>Capacity: {table.capacity}</p>
            {table.reservation_id ? (
              <>
                <p>
                  Status:{' '}
                  <span data-table-id-status={`${table.table_id}`}>
                    Occupied
                  </span>
                </p>
                <button
                  className="btn btn-primary"
                  data-table-id-finish={table.table_id}
                  onClick={async () => {
                    if (
                      window.confirm(
                        'Is this table ready to seat new guests? This cannot be undone.'
                      )
                    ) {
                      const abortController = new AbortController();
                      await finishTable(table.table_id, abortController.signal);
                      loadDashboard(abortController);
                    }
                  }}
                >
                  Finish
                </button>
              </>
            ) : (
              <p>
                Status:{' '}
                <span data-table-id-status={`${table.table_id}`}>Free</span>
              </p>
            )}
          </div>
        );
      })}
    </main>
  );
}

export default Dashboard;
