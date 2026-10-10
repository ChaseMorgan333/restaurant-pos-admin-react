import { useEffect, useState } from "react";
import "./App.css";
import MenuManagement from "./MenuManagement.jsx";
import EmployeeManagement from "./EmployeeManagement.jsx";
import CheckManagement from "./CheckManagement.jsx";
import Dashboard from "./Dashboard.jsx";

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

  const [checks, setChecks] = useState([]);
  const [selectedCheckDate, setSelectedCheckDate] = useState(
    new Date().toISOString().split("T")[0],
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
    const confirmed = window.confirm(
      "Are you sure you want to delete this employee?",
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/employees/${id}`,
        {
          method: "DELETE",
        },
      );

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

  async function handleUpdateEmployee(id, updatedEmployee) {
    setErrorMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/employees/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedEmployee),
        },
      );

      if (!response.ok) {
        const details = await response.text();
        throw new Error(`Update failed (${response.status}): ${details}`);
      }

      await loadEmployees();
      return true;
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message);
      return false;
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
      //----------------------------------------- LOGIN SECTION(LOGIN FORM) ----------------------------------------
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

        <button type="button" onClick={() => setIsLoggedIn(false)}>
          Logout
        </button>
        {/*------------------------------------------------------THIS IS THE DIV THAT HOLDS THE NAVIGATION BUTTONS(TABS)-----------------------*/}
        <div className="tabs">
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
          <button type="button" onClick={() => setActiveTab("employees")}>
            Employees
          </button>

          <button type="button" onClick={() => setActiveTab("menu")}>
            Menu
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("checks");
              loadChecks(selectedCheckDate);
            }}
          >
            Checks
          </button>
        </div>
      </section>
      {/*-----------------------------------WHAT TO SHOW BASED ON ACTIVETAB---------------------------------*/}
      {/*-------------------------------------DASHBOARD SECTION---------------------------------------------*/}
      {activeTab === "dashboard" && (
        <>
          <Dashboard
            checks={checks}
            selectedCheckDate={selectedCheckDate}
            errorMessage={errorMessage}
          />
        </>
      )}
      {/*-----------------------------------WHAT TO SHOW BASED ON ACTIVETAB(EMPLOYEES)---------------------------------*/}
      {activeTab === "employees" && (
        <>
          <EmployeeManagement
            employees={employees}
            handleDeleteEmployee={handleDeleteEmployee}
            handleAddEmployee={handleAddEmployee}
            handleUpdateEmployee={handleUpdateEmployee}
            name={name}
            setName={setName}
            pin={pin}
            setPin={setPin}
            role={role}
            setRole={setRole}
            errorMessage={errorMessage}
          />
        </>
      )}
      {/*-----------------------------------WHAT TO SHOW BASED ON ACTIVETAB(MENU)---------------------------------*/}
      {/*----------------------------------------- MENU SECTION ----------------------------------------*/}
      {activeTab === "menu" && <MenuManagement apiBaseUrl={API_BASE_URL} />}
      {/*----------------------------------------- CHECKS SECTION ----------------------------------------*/}
      {activeTab === "checks" && (
        <CheckManagement
          checks={checks}
          selectedCheckDate={selectedCheckDate}
          setSelectedCheckDate={setSelectedCheckDate}
          loadChecks={loadChecks}
        ></CheckManagement>
      )}
    </main>
  );
}

export default App;
