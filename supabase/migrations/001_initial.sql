-- profiles: auth.users 와 1:1 대응
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  name text not null,
  avatar_url text,
  dorm_building text,
  created_at timestamptz default now() not null
);

alter table profiles enable row level security;

create policy "누구나 프로필 조회 가능" on profiles for select using (true);
create policy "본인 프로필만 수정 가능" on profiles for update using (auth.uid() = id);

-- 신규 가입 시 profiles 자동 생성
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- parties
create table parties (
  id uuid default gen_random_uuid() primary key,
  host_id uuid references profiles(id) on delete cascade not null,
  restaurant_name text not null,
  order_url text,
  min_order_amount integer not null,
  current_amount integer default 0 not null,
  deadline timestamptz not null,
  pickup_location text not null,
  status text default 'open' check (status in ('open', 'closed', 'ordered')) not null,
  kakao_pay_link text,
  created_at timestamptz default now() not null
);

alter table parties enable row level security;

create policy "누구나 파티 조회 가능" on parties for select using (true);
create policy "로그인한 유저만 파티 생성" on parties for insert with check (auth.uid() = host_id);
create policy "호스트만 파티 수정" on parties for update using (auth.uid() = host_id);

-- party_members
create table party_members (
  id uuid default gen_random_uuid() primary key,
  party_id uuid references parties(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  menu_note text,
  amount integer not null,
  joined_at timestamptz default now() not null,
  unique (party_id, user_id)
);

alter table party_members enable row level security;

create policy "누구나 파티원 조회 가능" on party_members for select using (true);
create policy "로그인한 유저만 참여 가능" on party_members for insert with check (auth.uid() = user_id);
create policy "본인 참여 정보만 수정/삭제 가능" on party_members for delete using (auth.uid() = user_id);

-- current_amount 자동 업데이트 트리거
create or replace function update_party_amount()
returns trigger language plpgsql as $$
begin
  update parties
  set current_amount = (
    select coalesce(sum(amount), 0) from party_members where party_id = coalesce(new.party_id, old.party_id)
  )
  where id = coalesce(new.party_id, old.party_id);
  return coalesce(new, old);
end;
$$;

create trigger on_member_change
  after insert or update or delete on party_members
  for each row execute procedure update_party_amount();
