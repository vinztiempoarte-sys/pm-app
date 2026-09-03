export type ContactType = "cliente" | "prospecto" | "equipo";
export type Temperature = "frio" | "tibio" | "caliente";
export type ActivityStatus = "activo" | "inactivo";

export type Contact = {
  id: string;
  owner_id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  type: ContactType;
  temperature: Temperature | null;
  activity_status: ActivityStatus | null;
  source: string | null;
  last_interaction_at: string | null;
  next_action_at: string | null;
  next_action_note: string | null;
  team_rank: string | null;
  team_join_date: string | null;
  team_personal_volume: number | null;
  team_group_volume: number | null;
  sponsor_contact_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ContactInsert = Omit<
  Contact,
  "id" | "owner_id" | "created_at" | "updated_at" | "last_interaction_at"
>;

export type Product = {
  id: string;
  owner_id: string;
  name: string;
  category: string | null;
  avg_duration_days: number;
  default_price: number | null;
  created_at: string;
  updated_at: string;
};

export type SaleStatus = "pendiente_recompra" | "recomprado" | "perdido";

export type Sale = {
  id: string;
  owner_id: string;
  contact_id: string;
  product_id: string;
  quantity: number;
  price: number | null;
  sale_date: string;
  estimated_reorder_date: string;
  status: SaleStatus;
  reminder_sent_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SaleWithProduct = Sale & { products: Product };

export type EventType = "llamada" | "reunion" | "evento_empresa" | "formacion";

export type Event = {
  id: string;
  owner_id: string;
  contact_id: string | null;
  title: string;
  type: EventType;
  start_at: string;
  end_at: string | null;
  location: string | null;
  reminder_sent_at: string | null;
  created_at: string;
  updated_at: string;
};

export type EventWithContact = Event & {
  contacts: { id: string; full_name: string } | null;
};

export type TemplateCategory =
  | "primer_contacto"
  | "seguimiento"
  | "objecion_precio"
  | "cierre"
  | "onboarding_equipo"
  | "otro";

export type Template = {
  id: string;
  owner_id: string;
  category: TemplateCategory;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type ChecklistItem = {
  id: string;
  owner_id: string;
  contact_id: string;
  title: string;
  day_bucket: 30 | 60 | 90;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
};

export type ChecklistTemplateItem = {
  id: string;
  owner_id: string;
  title: string;
  day_bucket: 30 | 60 | 90;
  position: number;
  created_at: string;
};

export type Rank = {
  id: string;
  owner_id: string;
  name: string;
  min_personal_volume: number;
  min_group_volume: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  pm_distributor_id: string | null;
  current_rank: string | null;
  current_personal_volume: number | null;
  current_group_volume: number | null;
  subscription_status: string;
  mini_landing_slug: string | null;
  mini_landing_bio: string | null;
  brand_color: string | null;
  brand_logo_url: string | null;
  mini_landing_video_url: string | null;
  created_at: string;
};

export type MiniLandingLink = {
  id: string;
  profile_id: string;
  label: string;
  url: string;
  position: number;
  click_count: number;
  created_at: string;
};

export type PushSubscriptionRow = {
  id: string;
  owner_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
};
