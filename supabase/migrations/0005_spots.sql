-- Curated "spots à découvrir" shown on the dashboard: photo + short story,
-- editorial content maintained via SQL for now (no admin UI in V1).
create table if not exists public.spots (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  region text not null,
  short_story text not null,
  image_url text not null,
  created_at timestamptz not null default now()
);

alter table public.spots enable row level security;

create policy "spots are publicly readable"
  on public.spots for select
  using (true);

insert into public.spots (name, region, short_story, image_url) values
  (
    'Forêt de la Chartreuse',
    'Auvergne-Rhône-Alpes',
    'Ici, les chamois regardent les randonneurs souffler dans les lacets avec un mépris tout alpin. La légende locale veut que le fromage du coin ait des vertus miraculeuses sur les mollets fatigués — à vérifier sur place.',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'Pointe du Raz',
    'Bretagne',
    'Le vent y décoiffe même les plus téméraires. Les Bretons l''appellent le bout du monde, les mouettes en ont fait leur QG, et par temps clair on jurerait apercevoir l''Amérique (spoiler : non).',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'Gorges du Verdon',
    'Provence-Alpes-Côte d''Azur',
    'Une eau turquoise à faire pâlir les Caraïbes, des falaises à donner le vertige rien qu''en photo, et des vautours percnoptères qui planent en silence au-dessus des randonneurs essoufflés.',
    'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'Cirque de Gavarnie',
    'Occitanie',
    'Victor Hugo l''a qualifié de "colisée de la nature" — pas mal pour un mec qui n''avait pas Instagram. Les isards y sont chez eux, et la grande cascade fait 400 mètres de chute libre, histoire d''impressionner.',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'Massif des Vosges',
    'Grand Est',
    'Des lacs glaciaires, des tourbières mystérieuses et des chevreuils qui débarquent sans prévenir sur le sentier. Les hautes chaumes offrent une vue à 360° — pique-nique vivement recommandé.',
    'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'Dune du Pilat',
    'Nouvelle-Aquitaine',
    'La plus haute dune d''Europe, un dénivelé de sable pur qui fait mal aux mollets, et une forêt de pins qu''elle grignote centimètre par centimètre chaque année. Vue sur le bassin d''Arcachon garantie en haut.',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'Falaises d''Étretat',
    'Normandie',
    'Des arches de craie blanche sculptées par la mer, des goélands qui gueulent plus fort que le vent, et un panorama qui a inspiré Monet — lui aussi devait chercher le bon sentier.',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'Aiguilles de Bavella',
    'Corse',
    'Le GR20 passe par là, et on comprend vite pourquoi on le surnomme "la rando qui rend humble". Mouflons en embuscade, granit rose flamboyant au coucher du soleil, mollets en feu garantis.',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'Le Morvan',
    'Bourgogne-Franche-Comté',
    'Forêts profondes, sources qui alimentent la Seine et l''Yonne, et des cerfs qui bramment en automne à réveiller tout un camping. Un parc naturel encore trop discret pour son propre bien.',
    'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'Baie de Somme',
    'Hauts-de-France',
    'Des phoques qui se dorent la pilule sur les bancs de sable, une lumière à faire pleurer les peintres, et une marée qui avale le paysage deux fois par jour sans prévenir les distraits.',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'
  )
on conflict (name) do nothing;
