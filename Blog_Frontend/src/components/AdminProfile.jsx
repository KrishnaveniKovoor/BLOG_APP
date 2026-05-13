import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../store/authStore";
import { API_URL } from "../config/api";

function AdminProfile() {
    const currentUser = useAuth((state) => state.currentUser);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/admin-api/users`, {
          withCredentials: true,
        });
        setUsers(res.data.payload.users || []);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchUsers();
    }, []);

    const toggleStatus = async (user) => {
      try {
        await axios.patch(
          `${API_URL}/admin-api/users/${user._id}/status`,
          { isUserActive: !user.isUserActive },
          { withCredentials: true }
        );
        fetchUsers();
      } catch (err) {
        alert(err.response?.data?.message || "Could not update status");
      }
    };

    return (
      <div style={{ maxWidth: 800, margin: "40px auto", padding: "0 16px", fontFamily: "sans-serif" }}>
        <h1 style={{ fontSize: 24, marginBottom: 4 }}>Admin Dashboard</h1>
        <p style={{ color: "#555", marginBottom: 24 }}>
          Logged in as <strong>{currentUser?.firstName} {currentUser?.lastName}</strong> ({currentUser?.email})
        </p>

        <h2 style={{ fontSize: 18, marginBottom: 12 }}>Registered Users</h2>

        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && users.length === 0 && (
          <p style={{ color: "#888" }}>No users found.</p>
        )}

        {!loading && !error && users.length > 0 && (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #ddd", textAlign: "left" }}>
                <th style={{ padding: "8px 12px" }}>Name</th>
                <th style={{ padding: "8px 12px" }}>Email</th>
                <th style={{ padding: "8px 12px" }}>Role</th>
                <th style={{ padding: "8px 12px" }}>Status</th>
                <th style={{ padding: "8px 12px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "8px 12px" }}>{u.firstName} {u.lastName}</td>
                  <td style={{ padding: "8px 12px" }}>{u.email}</td>
                  <td style={{ padding: "8px 12px" }}>{u.role}</td>
                  <td style={{ padding: "8px 12px", color: u.isUserActive ? "green" : "red" }}>
                    {u.isUserActive ? "Active" : "Blocked"}
                  </td>
                  <td style={{ padding: "8px 12px" }}>
                    <button
                      onClick={() => toggleStatus(u)}
                      style={{
                        padding: "4px 12px",
                        cursor: "pointer",
                        background: u.isUserActive ? "#e53e3e" : "#3182ce",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                      }}
                    >
                      {u.isUserActive ? "Block" : "Unblock"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <button
          onClick={fetchUsers}
          style={{ marginTop: 20, padding: "6px 16px", cursor: "pointer" }}
        >
          Refresh
        </button>
      </div>
    );
  }

  export default AdminProfile;