import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { addTable } from '../utils/api';

function TableForm() {
  const history = useHistory();
  const initialState = {
    table_name: '',
    capacity: 0,
  };

  const [table, setTable] = useState(initialState);
  function changeHandler({ target: { name, value } }) {
    setTable((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }

  function changeHandlerNum({ target: { name, value } }) {
    setTable((prevState) => ({
      ...prevState,
      [name]: Number(value),
    }));
  }

  function submitHandler(event) {
    event.preventDefault();
    event.stopPropagation();

    addTable(table).then(() => {
      history.push('/dashboard');
    });
  }

  return (
    <form onSubmit={submitHandler}>
      <div className="form-group row">
        <label className="col-sm-2 col-form-label">Table name:</label>
        <div className="col-sm-10">
          <input
            name="table_name"
            value={table.table_name}
            minLength="2"
            onChange={changeHandler}
            required
          />
        </div>
      </div>
      <div className="form-group row">
        <label className="col-sm-2 col-form-label">Capacity:</label>
        <div className="col-sm-10">
          <input
            name="capacity"
            type="number"
            min={1}
            value={table.capacity}
            onChange={changeHandlerNum}
            required
          />
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

export default TableForm;
