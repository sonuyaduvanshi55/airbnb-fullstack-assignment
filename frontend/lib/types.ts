export type User = {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
  role: "guest" | "host" | string;
  is_superhost: boolean;
};

export type Amenity = {
  id: number;
  name: string;
  icon: string;
};

export type ListingImage = {
  id: number;
  url: string;
  alt_text: string;
  sort_order: number;
};

export type Review = {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  author: User;
};

export type ListingSummary = {
  id: number;
  title: string;
  location: string;
  country: string;
  property_type: string;
  price_per_night: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  instant_book: boolean;
  cover_image: string;
  rating: number;
  review_count: number;
  host: User;
};

export type ListingDetail = ListingSummary & {
  description: string;
  cleaning_fee: number;
  latitude: number | null;
  longitude: number | null;
  images: ListingImage[];
  amenities: Amenity[];
  reviews: Review[];
};

export type PaginatedListings = {
  items: ListingSummary[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type Booking = {
  id: number;
  listing_id: number;
  guest_id: number;
  check_in: string;
  check_out: string;
  guests: number;
  nights: number;
  nightly_total: number;
  cleaning_fee: number;
  service_fee: number;
  taxes: number;
  total_price: number;
  status: string;
  confirmation_code: string;
  created_at: string;
  listing: ListingSummary;
  guest: User;
};

export type Favorite = {
  id: number;
  user_id: number;
  listing_id: number;
  created_at: string;
  listing: ListingSummary;
};

export type Availability = {
  listing_id: number;
  unavailable_ranges: Array<{ check_in: string; check_out: string }>;
};

export type ListingFilters = {
  location?: string;
  check_in?: string;
  check_out?: string;
  guests?: number;
  min_price?: number;
  max_price?: number;
  property_type?: string;
  amenities?: string[];
  page?: number;
  page_size?: number;
};

export type ListingPayload = {
  host_id: number;
  title: string;
  description: string;
  location: string;
  country: string;
  property_type: string;
  price_per_night: number;
  cleaning_fee: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  latitude?: number | null;
  longitude?: number | null;
  instant_book: boolean;
  image_urls: string[];
  amenity_names: string[];
};
