import React, { useState } from "react";
import { authService } from "../services/auth";
import "./AdminLogin.css";

interface AdminLoginProps {
  onLogin: (userId: string) => void;
  onClose: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let result;
      result = await authService.signIn(email, password);
      if (result.user && !result.error) {
          onLogin(result.user.id);
          onClose();
      }

      if (result.error) {
        setError(result.error.message || "Authentication failed");
      }
    } catch (error: any) {
      setError(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="admin-login-overlay" onClick={handleOverlayClick}>
      <div className="admin-login-content">
        <div className="admin-login-header">
          <h2>Admin Login</h2>
          <button className="admin-close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-form-group">
            <label htmlFor="adminEmail">Email</label>
            <input
              type="email"
              id="adminEmail"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="Enter your email"
              disabled={loading}
              required
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="adminPassword">Password</label>
            <input
              type="password"
              id="adminPassword"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="Enter your password"
              disabled={loading}
              required
            />
            {error && <div className="admin-error">{error}</div>}
          </div>

          <div className="admin-form-actions">
            <button
              type="button"
              onClick={onClose}
              className="admin-cancel-button"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-login-button"
              disabled={loading}
            >
              {loading ? "..." : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
