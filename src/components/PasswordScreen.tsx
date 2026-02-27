import React, { useState } from "react";
import "./PasswordScreen.css";

interface PasswordScreenProps {
  onAuthenticated: () => void;
}

const PasswordScreen: React.FC<PasswordScreenProps> = ({ onAuthenticated }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Simple client-side password - you can change this to whatever you want
  const CORRECT_PASSWORD = "rkfamily-nora";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Add a small delay to make it feel more secure
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (password.trim() === CORRECT_PASSWORD) {
      onAuthenticated();
    } else {
      setError("Incorrect password. Please try again.");
      setPassword("");
    }

    setLoading(false);
  };

  return (
    <div className="password-screen">
      <div className="password-content">
        <div className="password-header">
          <h1>Welcome to Nora's Timeline</h1>
          <p>Please enter the password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="password-form">
          <div className="password-input-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="password-input"
              autoFocus
              disabled={loading}
            />
          </div>

          {error && <div className="password-error">{error}</div>}

          <button
            type="submit"
            className="password-submit"
            disabled={loading || !password.trim()}
          >
            {loading ? (
              <div className="password-loading">
                <div className="password-spinner"></div>
                Checking...
              </div>
            ) : (
              "Enter Timeline"
            )}
          </button>
        </form>

        <div className="password-footer">
          <p>🌸 A private collection of precious moments 🌸</p>
        </div>
      </div>
    </div>
  );
};

export default PasswordScreen;
