import { supabase } from "../lib/supabase";
import type { TimelineItem, TimelineData } from "../types/Timeline";

export class TimelineService {
  // Get timeline data for a user
  async getTimeline(userId: string): Promise<TimelineData | null> {
    try {
      // Get timeline info
      const { data: timeline, error: timelineError } = await supabase
        .from("timelines")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (timelineError || !timeline) {
        console.error("Timeline not found:", timelineError);
        return null;
      }

      // Get milestones for this timeline
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

  // Create or update timeline
  async saveTimeline(
    userId: string,
    timelineData: TimelineData,
  ): Promise<void> {
    try {
      // Upsert timeline
      const { error: timelineError } = await supabase
        .from("timelines")
        .upsert(
          {
            user_id: userId,
            baby_name: timelineData.babyName,
            birth_date: timelineData.birthDate,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id",
          },
        )
        .select()
        .single();

      if (timelineError) {
        throw new Error(`Timeline save error: ${timelineError.message}`);
      }

      console.log("Timeline saved successfully");
    } catch (error) {
      console.error("Error saving timeline:", error);
      throw error;
    }
  }

  // Add a new milestone
  async addMilestone(
    userId: string,
    milestone: Omit<TimelineItem, "id">,
  ): Promise<TimelineItem> {
    try {
      // First get the timeline ID
      const { data: timeline, error: timelineError } = await supabase
        .from("timelines")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (timelineError || !timeline) {
        throw new Error("Timeline not found");
      }

      // Insert the milestone
      const { data, error } = await supabase
        .from("milestones")
        .insert({
          timeline_id: timeline.id,
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
