import { useState, useEffect } from "react";
import Timeline from "./components/Timeline";
import AddMilestone from "./components/AddMilestone";
import AdminLogin from "./components/AdminLogin";
import PasswordScreen from "./components/PasswordScreen";
import { authService } from "./services/auth";
import { timelineService } from "./services/timeline";
import type { TimelineItem, TimelineData } from "./types/Timeline";
import "./App.css";

function App() {
  const [isPasswordAuthenticated, setIsPasswordAuthenticated] = useState(false);
  const [timelineData, setTimelineData] = useState<TimelineData>({
    babyName: "Nora",
    birthDate: "2024-01-01",
    items: [],
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize authentication and load shared timeline data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load shared timeline for everyone (no authentication required to view)
        await loadTimelineData();

        // Check if user is already authenticated (for admin features)
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser({ id: currentUser.id });
        }
      } catch (err) {
        console.error("Error initializing app:", err);
        setError("Failed to initialize app");
      } finally {
        setLoading(false);
      }
    };

    initializeApp();

    // Listen for auth state changes (for admin login/logout)
    const {
      data: { subscription },
    } = authService.onAuthStateChange(async (supabaseUser) => {
      if (supabaseUser) {
        setUser({ id: supabaseUser.id });
      } else {
        setUser(null);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  // Load shared timeline data (public for everyone)
  const loadTimelineData = async () => {
    try {
      setError(null);
      const data = await timelineService.getTimeline();
      if (data) {
        setTimelineData(data);
      } else {
        // Create initial timeline if none exists
        const initialTimeline = {
          babyName: "Nora",
          birthDate: "2024-01-01",
          items: [],
        };
        await timelineService.saveTimeline(initialTimeline);
        setTimelineData(initialTimeline);
      }
    } catch (err) {
      console.error("Error loading timeline:", err);
      setError("Failed to load timeline data");
    }
  };

  const addMilestone = async (newItem: Omit<TimelineItem, "id">) => {
    if (!user) return; // Admin only

    try {
      setError(null);
      const milestone = await timelineService.addMilestone(newItem);

      setTimelineData((prev) => ({
        ...prev,
        items: [...prev.items, milestone],
      }));
    } catch (err) {
      console.error("Error adding milestone:", err);
      setError("Failed to add milestone");
    }
  };

  const deleteMilestone = async (id: string) => {
    if (!user) return; // Admin only

    if (window.confirm("Are you sure you want to delete this milestone?")) {
      try {
        setError(null);
        await timelineService.deleteMilestone(id);

        setTimelineData((prev) => ({
          ...prev,
          items: prev.items.filter((item) => item.id !== id),
        }));
      } catch (err) {
        console.error("Error deleting milestone:", err);
        setError("Failed to delete milestone");
      }
    }
  };

  const handleAdminLogin = (userId: string) => {
    setUser({ id: userId });
  };

  const handleAdminLogout = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setShowAddModal(false);
    } catch (err) {
      console.error("Error signing out:", err);
      setError("Failed to sign out");
    }
  };

  const handlePasswordAuthenticated = () => {
    setIsPasswordAuthenticated(true);
  };

  const handleAddMilestoneClick = () => {
    setShowAddModal(true);
  };

  // Show password screen if not authenticated
  if (!isPasswordAuthenticated) {
    return <PasswordScreen onAuthenticated={handlePasswordAuthenticated} />;
  }

  // Show loading spinner during initialization
  if (loading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="error-close">
            ×
          </button>
        </div>
      )}

      <header className="app-header">
        <div className="header-content">
          <div className="baby-name-title">{timelineData.babyName}</div>

          <div className="header-actions">
            {user && (
              <button
                onClick={handleAddMilestoneClick}
                className="add-milestone-btn"
                title="Add new milestone"
              >
                + Add Milestone
              </button>
            )}

            {user ? (
              <button
                onClick={handleAdminLogout}
                className="admin-btn admin-logout"
              >
                🔓 Admin Logout
              </button>
            ) : (
              <button
                onClick={() => setShowAdminLogin(true)}
                className="admin-btn admin-login"
              >
                🔒 Admin Login
              </button>
            )}
          </div>
        </div>
      </header>

      <main>
        <Timeline
          items={timelineData.items}
          babyName={timelineData.babyName}
          onDeleteItem={deleteMilestone}
          isAdmin={!!user}
        />
      </main>

      {showAddModal && user && (
        <AddMilestone
          onAdd={addMilestone}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showAdminLogin && (
        <AdminLogin
          onLogin={handleAdminLogin}
          onClose={() => setShowAdminLogin(false)}
        />
      )}
    </div>
  );
}

export default App;
