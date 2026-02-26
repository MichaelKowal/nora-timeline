import { supabase } from "../lib/supabase";
import type { User, AuthChangeEvent, Session } from "@supabase/supabase-js";

export class AuthService {
  // Sign up new user
  async signUp(
    email: string,
    password: string,
  ): Promise<{ user: User | null; error: any }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error("Error signing up:", error);
      return { user: null, error };
    }
  }

  // Sign in user
  async signIn(
    email: string,
    password: string,
  ): Promise<{ user: User | null; error: any }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error("Error signing in:", error);
      return { user: null, error };
    }
  }

  // Sign out user
  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        throw error;
      }

      return user;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  // Listen for auth changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        callback(session?.user || null);
      },
    );
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return !!user;
  }

  // Get current user ID
  async getUserId(): Promise<string | null> {
    const user = await this.getCurrentUser();
    return user?.id || null;
  }
}

export const authService = new AuthService();
