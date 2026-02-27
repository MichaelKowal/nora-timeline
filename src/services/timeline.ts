import { supabase } from "../lib/supabase";
import type { TimelineItem, TimelineData } from "../types/Timeline";

export class TimelineService {
  // Fixed ID for the shared public timeline
  private readonly PUBLIC_TIMELINE_ID = 'public-timeline';

  // Get the shared public timeline data
  async getTimeline(): Promise<TimelineData | null> {
    try {
      // Get timeline info - use a fixed ID for the public timeline
      const { data: timeline, error: timelineError } = await supabase
        .from("timelines")
        .select("*")
        .eq("id", this.PUBLIC_TIMELINE_ID)
        .single();

      if (timelineError || !timeline) {
        // If no public timeline exists, return a default one
        console.log("No public timeline found, returning default");
        return {
          babyName: "Nora",
          birthDate: "2024-01-01",
          items: [],
        };
      }

      // Get milestones for the public timeline
      const { data: milestones, error: milestonesError } = await supabase
        .from("milestones")
        .select("*")
        .eq("timeline_id", timeline.id)
        .order("milestone_date", { ascending: true });

      if (milestonesError) {
        console.error("Error fetching milestones:", milestonesError);
        return null;
      }

      // Transform database records to our frontend types
      const items: TimelineItem[] = (milestones || []).map(
        (milestone: any) => ({
          id: milestone.id,
          title: milestone.title,
          description: milestone.description,
          date: milestone.milestone_date,
          category: milestone.category as TimelineItem["category"],
          photo: milestone.photo_url || undefined,
        }),
      );

      return {
        babyName: timeline.baby_name,
        birthDate: timeline.birth_date,
        items,
      };
    } catch (error) {
      console.error("Error in getTimeline:", error);
      return null;
    }
  }

  // Create or update the shared public timeline
  async saveTimeline(timelineData: TimelineData): Promise<void> {
    try {
      // Upsert the public timeline
      const { error: timelineError } = await supabase
        .from("timelines")
        .upsert(
          {
            id: this.PUBLIC_TIMELINE_ID,
            user_id: null, // No specific user for shared timeline
            baby_name: timelineData.babyName,
            birth_date: timelineData.birthDate,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "id",
          },
        )
        .select()
        .single();

      if (timelineError) {
        throw new Error(`Timeline save error: ${timelineError.message}`);
      }

      console.log("Public timeline saved successfully");
    } catch (error) {
      console.error("Error saving timeline:", error);
      throw error;
    }
  }

  // Add a new milestone to the shared public timeline
  async addMilestone(milestone: Omit<TimelineItem, "id">): Promise<TimelineItem> {
    try {
      // Ensure public timeline exists first
      await this.ensurePublicTimelineExists();

      // Insert the milestone to the public timeline
      const { data, error } = await supabase
        .from("milestones")
        .insert({
          timeline_id: this.PUBLIC_TIMELINE_ID,
          title: milestone.title,
          description: milestone.description,
          milestone_date: milestone.date,
          category: milestone.category,
          photo_url: milestone.photo,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Error adding milestone: ${error.message}`);
      }

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        date: data.milestone_date,
        category: data.category as TimelineItem["category"],
        photo: data.photo_url || undefined,
      };
    } catch (error) {
      console.error("Error in addMilestone:", error);
      throw error;
    }
  }

  // Helper method to ensure public timeline exists
  private async ensurePublicTimelineExists(): Promise<void> {
    try {
      const { data: existingTimeline } = await supabase
        .from("timelines")
        .select("id")
        .eq("id", this.PUBLIC_TIMELINE_ID)
        .single();

      if (!existingTimeline) {
        // Create the public timeline if it doesn't exist
        await supabase
          .from("timelines")
          .insert({
            id: this.PUBLIC_TIMELINE_ID,
            user_id: null,
            baby_name: "Nora",
            birth_date: "2024-01-01",
          });
      }
    } catch (error) {
      console.log("Public timeline creation handled");
    }
  }

  // Delete a milestone
  async deleteMilestone(milestoneId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("milestones")
        .delete()
        .eq("id", milestoneId);

      if (error) {
        throw new Error(`Error deleting milestone: ${error.message}`);
      }
    } catch (error) {
      console.error("Error in deleteMilestone:", error);
      throw error;
    }
  }

  // Upload photo to Supabase Storage
  async uploadPhoto(file: File, milestoneId: string): Promise<string> {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${milestoneId}-${Date.now()}.${fileExt}`;
      const filePath = `timeline-photos/${fileName}`;

      const { data, error } = await supabase.storage
        .from("timeline-photos")
        .upload(filePath, file);

      if (error) {
        throw new Error(`Error uploading photo: ${error.message}`);
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("timeline-photos").getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading photo:", error);
      throw error;
    }
  }
}

export const timelineService = new TimelineService();
