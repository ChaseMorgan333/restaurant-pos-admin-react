export default function Dashboard({
    checks,
    selectedCheckDate,
    errorMessage
}){

return(
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