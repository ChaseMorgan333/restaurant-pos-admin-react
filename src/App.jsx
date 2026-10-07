import { useEffect, useState } from "react";
import "./App.css";
import MenuManagement from "./MenuManagement.jsx";

const API_BASE_URL = "http://10.0.0.110:8080";
//const API_BASE_URL = "http://localhost:8080";

function App() {
  const [employees, setEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");                                                          
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [role, setRole] = useState("SERVER");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [checks, setChecks] = useState([])
  const [selectedCheckDate, setSelectedCheckDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/employees`);

      if (!response.ok) {
        throw new Error("Failed to load employees");
      }

      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      setErrorMessage("Could not load employees from backend.");
    }
  }

  async function handleAddEmployee(event) {
    event.preventDefault();

    const newEmployee = {
      name: name,
      pin: pin,
      role: role,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/employees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEmployee),
      });

      if (!response.ok) {
        throw new Error("Failed to create employee");
      }

      setName("");
      setPin("");
      setRole("SERVER");
      setErrorMessage("");

      await loadEmployees();
    } catch (error) {
      setErrorMessage("Could not create employee.");
    }
  }

  async function handleDeleteEmployee(id) {
  const confirmed = window.confirm("Are you sure you want to delete this employee?");

  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/employees/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete employee");
    }

    setErrorMessage("");

    await loadEmployees();
  } catch (error) {
    console.error(error);
    setErrorMessage("Could not delete employee.");
  }
}

async function handleLogin(event) {
  event.preventDefault();

  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    });

    if (!response.ok) {
      throw new Error("Login request failed");
    }

    const data = await response.json();

    if (data.success) {
      setIsLoggedIn(true);
      setLoginError("");
      setUsername("");
      setPassword("");
      await loadEmployees();
    } else {
      setLoginError(data.message);
    }
  } catch (error) {
    console.error(error);
    setLoginError("Could not connect to backend.");
  }
}
//--------------------------------------------------------------------------LOAD CHECKS FUNCTION ---------------------------------
async function loadChecks(date) {
  try {
    const url = `${API_BASE_URL}/api/admin/checks?date=${date}`;

    console.log("Loading checks for date:", date);
    console.log("Request URL:", url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to load checks: ${response.status}`);
    }

    const data = await response.json();

    console.log("Checks returned:", data);

    setChecks(data);
    setErrorMessage("");
  } catch (error) {
    console.error(error);
    setErrorMessage("Could not load checks from backend.");
  }
}

if (!isLoggedIn) {
  return (
    //----------------------------------------- LOGIN SECTION ----------------------------------------
    <main className="page">
      <section className="card">
        <h1>Admin Login</h1>
        <p>Sign in to manage your POS system.</p>

        <form onSubmit={handleLogin} className="form">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <button type="submit">Login</button>
        </form>

        {loginError && <p className="error">{loginError}</p>}
      </section>
    </main>
  );
}
//----------------------------------------- LOGIN SECTION (LOGGED IN)----------------------------------------
  return (
    <main className="page">
      
      <section className="card">
        <h1>Restaurant POS Admin</h1>
        <p>Add and manage employees for your POS system.</p>

        <button
          type="button"
          onClick={() => setIsLoggedIn(false)}
        >
         Logout
      </button>

        <div className = "tabs">
          <button
  type="button"
  onClick={() => {
    const now = new Date();
    const today = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("-");

    setSelectedCheckDate(today);
    setActiveTab("dashboard");
    loadChecks(today);
  }}
>
  Dashboard
</button>
          <button type = "button" onClick={()=> setActiveTab("employees")}>
            Employees
          </button>

          <button type = "button" onClick={()=> setActiveTab("menu")}>
            Menu
          </button>

          <button type = "button" onClick={()=> {
            setActiveTab("checks");
            loadChecks(selectedCheckDate);
          }}
          >
            Checks 
          </button>
        </div>
        </section>
        {/*-----------------------------------WHAT TO SHOW BASED ON ACTIVETAB---------------------------------*/}
        {activeTab === "dashboard" && (
  <section className="card">
    <h2>Dashboard</h2>
    <p>Checks for {selectedCheckDate}</p>

    {errorMessage ? (
      <p className="error">{errorMessage}</p>
    ) : (
      <>
        <h3>Total Checks: {checks.length}</h3>

        <h3>
          Open Checks: {
            checks.filter(check => check.status === "OPEN").length
          }
        </h3>

        <h3>Recent Checks</h3>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Server</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {[...checks]
              .sort(
                (a, b) =>
                  new Date(b.createdAt) - new Date(a.createdAt)
              )
              .slice(0, 5)
              .map(check => (
                <tr key={check.id}>
                  <td>{check.id}</td>
                  <td>{check.serverName ?? "Unknown Server"}</td>
                  <td>${Number(check.total ?? 0).toFixed(2)}</td>
                  <td>{check.status}</td>
                </tr>
              ))}
          </tbody>
        </table>

        {checks.length === 0 && <p>No checks for today.</p>}
      </>
    )}
  </section>
)}
{/*-----------------------------------WHAT TO SHOW BASED ON ACTIVETAB(EMPLOYEES)---------------------------------*/}
        {activeTab === "employees" && (
          <>
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

          <select value={role} onChange={(event) => setRole(event.target.value)}>
            <option value="SERVER">SERVER</option>
            <option value="MANAGER">MANAGER</option>
          </select>

          <button type="submit">Add Employee</button>
        </form>

        {loginError && <p className="error">{loginError}</p>}
      </section>

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
              <th>Actions1</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td>{employee.id}</td>
                <td>{employee.name}</td>
                <td>{employee.pin}</td>
                <td>{employee.role}</td>
                <td>{employee.active ? "Yes" : "No"}</td>
                <td>
                  <button
                  type="button"
                  onClick={() => handleDeleteEmployee(employee.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      </>
      )}
      {/*-----------------------------------WHAT TO SHOW BASED ON ACTIVETAB(MENU)---------------------------------*/}
{/*----------------------------------------- MENU SECTION ----------------------------------------*/}
    {activeTab === "menu" && (
  <MenuManagement apiBaseUrl={API_BASE_URL} />
)}
{/*----------------------------------------- CHECKS SECTION ----------------------------------------*/}
    {activeTab === "checks" && (
      <section className="card">
        <h2>Checks</h2>
        

      <label>
        Select Date:
        <input
        type="date"
        value={selectedCheckDate}
        onChange={(event) => {
          const newDate = event.target.value;
          setSelectedCheckDate(newDate);
          loadChecks(newDate);
        }}
        />
      </label>
{/* ---------------------------------------------------------------------------CHECKS TABLE--------------*/}
      <p>Showing checks for: {selectedCheckDate}</p>

      <h3>All Checks</h3>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Service:</th>
            <th>Server:</th>
            <th>Table#</th>
            <th>Total</th>
            <th>Status:</th>
            <th>Created:</th>
            <th>Updated:</th>
            <th>Synced:</th>
          </tr>
        </thead>
        <tbody>
        {checks.map((check)=> (
          <tr key={check.id}>
            <td>{check.id}</td>
            <td>{check.service}</td>
            <td>{check.serverName ?? "Unknown Server"}</td>
            <td>{check.tableId}</td>
            <td>${Number(check.total ?? 0).toFixed(2)}</td>
            <td>{check.status}</td>
            <td>{new Date(check.createdAt).toLocaleString()}</td>
            <td>{new Date(check.updatedAt).toLocaleString()}</td>
            <td>{check.syncedAt
            ? new Date(check.syncedAt).toLocaleString()
            : "Not Synced"}</td>
          </tr>
        ))}
      </tbody>
      </table>

      
      </section>
    )}
        

        
    </main>
  );
}

export default App;