import { useState, useEffect } from "react";
import Timeline from "./components/Timeline";
import AddMilestone from "./components/AddMilestone";
import AdminLogin from "./components/AdminLogin";
import { authService } from "./services/auth";
import { timelineService } from "./services/timeline";
import type { TimelineItem, TimelineData } from "./types/Timeline";
import "./App.css";

function App() {
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

  // Initialize authentication and load data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if user is already authenticated
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser({ id: currentUser.id });
          await loadTimelineData(currentUser.id);
        }
      } catch (err) {
        console.error("Error initializing app:", err);
        setError("Failed to initialize app");
      } finally {
        setLoading(false);
      }
    };

    initializeApp();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = authService.onAuthStateChange(async (supabaseUser) => {
      if (supabaseUser) {
        setUser({ id: supabaseUser.id });
        await loadTimelineData(supabaseUser.id);
      } else {
        setUser(null);
        setTimelineData({
          babyName: "Nora",
          birthDate: "2024-01-01",
          items: [],
        });
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  // Load timeline data from Supabase
  const loadTimelineData = async (userId: string) => {
    try {
      setError(null);
      const data = await timelineService.getTimeline(userId);
      if (data) {
        setTimelineData(data);
      } else {
        // Create initial timeline if none exists
        const initialTimeline = {
          babyName: "Nora",
          birthDate: "2024-01-01",
          items: [],
        };
        await timelineService.saveTimeline(userId, initialTimeline);
        setTimelineData(initialTimeline);
      }
    } catch (err) {
      console.error("Error loading timeline:", err);
      setError("Failed to load timeline data");
    }
  };

  // Save timeline changes to Supabase
  const saveTimelineChanges = async (newTimelineData: TimelineData) => {
    if (!user) return;

    try {
      await timelineService.saveTimeline(user.id, newTimelineData);
    } catch (err) {
      console.error("Error saving timeline:", err);
      setError("Failed to save timeline changes");
    }
  };

  const addMilestone = async (newItem: Omit<TimelineItem, "id">) => {
    if (!user) return;

    try {
      setError(null);
      const milestone = await timelineService.addMilestone(user.id, newItem);

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
    if (!user) return;

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

  const updateBabyName = async (newName: string) => {
    if (!user) return;

    const newTimelineData = {
      ...timelineData,
      babyName: newName,
    };

    setTimelineData(newTimelineData);
    await saveTimelineChanges(newTimelineData);
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

  const handleAddMilestoneClick = () => {
    if (user) {
      setShowAddModal(true);
    } else {
      setShowAdminLogin(true);
    }
  };

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
          <input
            type="text"
            value={timelineData.babyName}
            onChange={(e) => updateBabyName(e.target.value)}
            className="baby-name-input"
            placeholder="Baby's name"
            disabled={!user}
            title={!user ? "Login required to edit name" : ""}
          />

          <div className="header-actions">
            <button
              onClick={handleAddMilestoneClick}
              className="add-milestone-btn"
              title={
                !user ? "Login required to add milestones" : "Add new milestone"
              }
            >
              + Add Milestone
            </button>

            {user ? (
              <button
                onClick={handleAdminLogout}
                className="admin-btn admin-logout"
              >
                🔓 Logout
              </button>
            ) : (
              <button
                onClick={() => setShowAdminLogin(true)}
                className="admin-btn admin-login"
              >
                🔒 Login
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
