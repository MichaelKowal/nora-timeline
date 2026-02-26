export interface TimelineItem {
  id: string;
  date: string;
  title: string;
  description: string;
  photo?: string;
  category?: "milestone" | "first" | "growth" | "fun";
}

export interface TimelineData {
  babyName: string;
  birthDate: string;
  items: TimelineItem[];
}
