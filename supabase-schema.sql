-- ============================================================
-- ALAALA Memorial Services — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- =====================
-- PROFILES (extends auth.users)
-- =====================
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    full_name text,
    display_name text,
    phone text,
    avatar_url text,
    plan text default 'free' check (plan in ('free', 'family', 'premium')),
    is_active boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles for select using (
    exists (select 1 from public.profiles where id = auth.uid() and plan = 'premium')
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, full_name)
    values (new.id, new.raw_user_meta_data->>'full_name');
    return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- =====================
-- SERVICES (service catalog)
-- =====================
create table public.services (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    slug text unique not null,
    description text,
    price integer not null, -- in PHP centavos (e.g. 50000 = ₱500)
    price_display text, -- e.g. "From ₱500"
    icon text, -- Material Symbol name
    icon_color text default '#7c3aed',
    is_active boolean default true,
    requires_scheduling boolean default true,
    cal_link text, -- e.g. "kenneth-call/mass-offering"
    sort_order integer default 0,
    created_at timestamptz default now()
);
alter table public.services enable row level security;
create policy "Anyone can view active services" on public.services for select using (is_active = true);
create policy "Admins can manage services" on public.services for all using (auth.role() = 'service_role');

-- Seed default services
insert into public.services (name, slug, description, price, price_display, icon, icon_color, cal_link, sort_order) values
('Mass Offering', 'mass', 'Request a memorial mass at your chosen parish', 50000, '₱500', 'church', '#7c3aed', 'kenneth-call/mass-offering', 1),
('Flower Delivery', 'flowers', 'Fresh flower arrangements delivered to the memorial site', 80000, 'From ₱800', 'local_florist', '#ec4899', 'kenneth-call/flower-delivery', 2),
('Live Stream', 'livestream', 'Professional live streaming of memorial services', 150000, '₱1,500', 'videocam', '#ef4444', 'kenneth-call/live-stream', 3),
('AI Voice Tribute', 'ai-voice', 'AI-generated voice tribute using loved one''s voice', 99900, '₱999', 'record_voice_over', '#8b5cf6', 'kenneth-call/ai-voice-tribute', 4),
('SMS Notifications', 'sms', 'Send memorial anniversary reminders to family', 29900, '₱299/year', 'sms', '#10b981', null, 5),
('Virtual Candle', 'candle', 'Premium animated candle for the memorial page', 5000, '₱50', 'candle', '#f59e0b', null, 6),
('Memorial Lot Cleaning', 'lot-cleaning', 'Professional cleaning of gravesites and memorial lots', 120000, 'From ₱1,200', 'cleaning_services', '#14b8a6', 'kenneth-call/lot-cleaning', 7),
('Tombstone Repair', 'tombstone-repair', 'Expert restoration and repair of tombstones and markers', 250000, 'From ₱2,500', 'construction', '#78716c', 'kenneth-call/tombstone-repair', 8);

-- =====================
-- MEMORIALS
-- =====================
create table public.memorials (
    id uuid default gen_random_uuid() primary key,
    slug text unique not null,
    owner_id uuid references public.profiles(id) on delete cascade not null,
    full_name text not null,
    birth_date date,
    death_date date,
    birth_place text,
    death_place text,
    biography text,
    cover_image_url text,
    profile_image_url text,
    location_name text,
    lat double precision,
    lng double precision,
    status text default 'draft' check (status in ('draft', 'published', 'flagged', 'archived')),
    is_featured boolean default false,
    visitor_count integer default 0,
    candle_count integer default 0,
    tribute_count integer default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
alter table public.memorials enable row level security;
create policy "Anyone can view published memorials" on public.memorials for select using (status = 'published');
create policy "Owners can manage own memorials" on public.memorials for all using (auth.uid() = owner_id);

-- =====================
-- TRIBUTES (candles, flowers, comments)
-- =====================
create table public.tributes (
    id uuid default gen_random_uuid() primary key,
    memorial_id uuid references public.memorials(id) on delete cascade not null,
    user_id uuid references public.profiles(id) on delete set null,
    type text not null check (type in ('candle', 'flower', 'comment', 'prayer')),
    message text,
    is_anonymous boolean default false,
    created_at timestamptz default now()
);
alter table public.tributes enable row level security;
create policy "Anyone can view tributes" on public.tributes for select using (true);
create policy "Authenticated users can add tributes" on public.tributes for insert with check (auth.uid() is not null);

-- =====================
-- ORDERS
-- =====================
create table public.orders (
    id uuid default gen_random_uuid() primary key,
    order_ref text unique not null default 'ALA-' || to_char(now(), 'YYYY') || '-' || lpad(floor(random() * 9999)::text, 4, '0'),
    user_id uuid references public.profiles(id) on delete set null,
    memorial_id uuid references public.memorials(id) on delete set null,
    service_id uuid references public.services(id) on delete set null,
    service_name text not null,
    amount integer not null, -- in PHP centavos
    service_fee integer default 2500,
    total_amount integer not null,
    status text default 'pending' check (status in ('pending', 'processing', 'completed', 'cancelled', 'refunded')),
    payment_method text check (payment_method in ('gcash', 'paymaya', 'card', 'bank')),
    payment_ref text,
    scheduled_at timestamptz,
    cal_booking_uid text, -- Cal.com booking UID
    notes text,
    delivery_address text,
    recipient_name text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
alter table public.orders enable row level security;
create policy "Users can view own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Users can create orders" on public.orders for insert with check (auth.uid() = user_id);

-- =====================
-- MEMORIAL PHOTOS
-- =====================
create table public.memorial_photos (
    id uuid default gen_random_uuid() primary key,
    memorial_id uuid references public.memorials(id) on delete cascade not null,
    storage_path text not null,
    url text not null,
    caption text,
    sort_order integer default 0,
    created_at timestamptz default now()
);
alter table public.memorial_photos enable row level security;
create policy "Anyone can view photos of published memorials" on public.memorial_photos for select using (
    exists (select 1 from public.memorials m where m.id = memorial_id and m.status = 'published')
);
create policy "Owners can manage their memorial photos" on public.memorial_photos for all using (
    exists (select 1 from public.memorials m where m.id = memorial_id and m.owner_id = auth.uid())
);

-- =====================
-- SITE SETTINGS (admin key-value store)
-- =====================
create table public.site_settings (
    key text primary key,
    value text,
    updated_at timestamptz default now()
);
alter table public.site_settings enable row level security;
create policy "Admins can manage settings" on public.site_settings for all using (auth.role() = 'service_role');

insert into public.site_settings (key, value) values
('maintenance_mode', 'false'),
('site_name', 'Alaala — Filipino Memorial Services'),
('contact_email', 'hello@alaala.ph'),
('sms_enabled', 'true'),
('cal_username', 'kenneth-call');

-- =====================
-- STORAGE BUCKETS
-- =====================
-- Run in Supabase Dashboard → Storage → New Bucket
-- Bucket: memorial-photos (public)
-- Bucket: profile-avatars (public)

-- =====================
-- INDEXES
-- =====================
create index on public.memorials(owner_id);
create index on public.memorials(status);
create index on public.memorials(slug);
create index on public.orders(user_id);
create index on public.orders(status);
create index on public.tributes(memorial_id);
create index on public.memorial_photos(memorial_id);
