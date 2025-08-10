export interface TestimonialData {
  id: number;
  name: string;
  position?: string;
  company?: string;
  content: string;
  avatar_url?: string;
  rating: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  // Optional fields for future use
  industry?: string;
  location?: string;
  verified?: boolean;
  date?: string;
  featured?: boolean;
}

export interface TestimonialsResponse {
  testimonials: TestimonialData[];
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
}

export interface TestimonialFormData {
  name: string;
  position: string;
  company: string;
  content: string;
  rating: number;
  industry?: string;
  location?: string;
}
