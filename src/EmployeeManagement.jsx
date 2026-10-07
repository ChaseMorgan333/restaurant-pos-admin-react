import { useState } from "react";
export default function EmployeeManagement({
  employees,
  handleDeleteEmployee,
  handleUpdateEmployee,
  handleAddEmployee,
  name,
  setName,
  pin,
  setPin,
  role,
  setRole,
  errorMessage,
}) {
  function handleEditEmployee(employee) {
    setEditingEmployeeId(employee.id);
    setEditValues({
      name: employee.name,
      pin: employee.pin,
      role: employee.role,
      active: employee.active,
    });
  }

  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [editValues, setEditValues] = useState({});

  async function handleSaveEmployee(){
    const saved = await handleUpdateEmployee(
        editingEmployeeId,
        editValues
    );

    if(saved){
        setEditingEmployeeId(null);
        setEditValues({});
    }
  }

  return (
    <>
      {
        <section className="card">
          <h2>Add Employee</h2>

          <form onSubmit={handleAddEmployee} className="form">
            <input
              type="text"
              placeholder="Employee name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />

            <input
              type="text"
              placeholder="PIN"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              maxLength="4"
              required
            />

            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              <option value="SERVER">SERVER</option>
              <option value="MANAGER">MANAGER</option>
            </select>

            <button type="submit">Add Employee</button>
          </form>

          {errorMessage && <p className="error">{errorMessage}</p>}
        </section>
      }
      {
        <section className="card">
          <h2>Employees</h2>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>PIN</th>
                <th>Role</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td>{employee.id}</td>
                  <td>
                    {/*--------EMPLOYEE NAME FIELD--------*/}
                    {editingEmployeeId === employee.id ? (
                      <input
                        type="text"
                        value={editValues.name}
                        onChange={(event) =>
                          setEditValues({
                            ...editValues,
                            name: event.target.value,
                          })
                        }
                      />
                    ) : (
                      employee.name
                    )}
                  </td>
                  <td>
                    {/*--------EMPLOYEE PIN FIELD--------*/}
                    {editingEmployeeId === employee.id ? (
                      <input
                        className="pin-edit"
                        type="text"
                        value={editValues.pin}
                        maxLength={4}
                        onChange={(event) =>
                          setEditValues({
                            ...editValues,
                            pin: event.target.value,
                          })
                        }
                      />
                    ) : (
                      employee.pin
                    )}
                  </td>
                  <td>
                    {/*--------EMPLOYEE ROLE FIELD--------*/}
                    {editingEmployeeId === employee.id ? (
                      <select
                        value={editValues.role}
                        onChange={(event) =>
                          setEditValues({
                            ...editValues,
                            role: event.target.value,
                          })
                        }
                      >
                        <option value="SERVER">SERVER</option>
                        <option value="MANAGER">MANAGER</option>
                      </select>
                    ) : (
                      employee.role
                    )}
                  </td>
                  <td>
                    {/*--------EMPLOYEE ACTIVE FIELD--------*/}

                    {editingEmployeeId === employee.id ? (
                      <select
                        value={String(editValues.active)}
                        onChange={(event) =>
                          setEditValues({
                            ...editValues,
                            active: event.target.value === "true",
                          })
                        }
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    ) : employee.active ? (
                      "Yes"
                    ) : (
                      "No"
                    )}
                  </td>
                  <td>
                    {editingEmployeeId === employee.id ? (
                      <div className="row-actions">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingEmployeeId(null);
                            setEditValues({});
                          }}
                        >
                          Cancel
                        </button>
                        <button type="button"
                        onClick={handleSaveEmployee}>
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="row-actions">
                        <button
                          type="button"
                          onClick={() => handleDeleteEmployee(employee.id)}
                        >
                          Delete
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEditEmployee(employee)}
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      }
    </>
  );
}
