export default function CheckManagement({
    checks,
    selectedCheckDate,
    setSelectedCheckDate,
    loadChecks
}){
    return(
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
    )
}