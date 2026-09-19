-- Replace the placeholder/reused photos in 0005_spots.sql with a real,
-- verified image per spot (matched by unique name), at a higher quality.
update public.spots set image_url = 'https://images.unsplash.com/photo-1726135334734-3cbe7f1cb5d2?auto=format&fit=crop&w=1600&q=85' where name = 'Forêt de la Chartreuse';
update public.spots set image_url = 'https://images.unsplash.com/photo-1596478025392-a1a92109ca31?auto=format&fit=crop&w=1600&q=85' where name = 'Pointe du Raz';
update public.spots set image_url = 'https://images.unsplash.com/photo-1508181441164-3c8e9bd4575a?auto=format&fit=crop&w=1600&q=85' where name = 'Gorges du Verdon';
update public.spots set image_url = 'https://images.unsplash.com/photo-1667128576672-7e39ce288b98?auto=format&fit=crop&w=1600&q=85' where name = 'Cirque de Gavarnie';
update public.spots set image_url = 'https://images.unsplash.com/photo-1604782101560-b1cf32c445a8?auto=format&fit=crop&w=1600&q=85' where name = 'Massif des Vosges';
update public.spots set image_url = 'https://images.unsplash.com/photo-1567248579483-e803b65027f6?auto=format&fit=crop&w=1600&q=85' where name = 'Dune du Pilat';
update public.spots set image_url = 'https://images.unsplash.com/photo-1762854215339-55b9701f7f84?auto=format&fit=crop&w=1600&q=85' where name = 'Falaises d''Étretat';
update public.spots set image_url = 'https://images.unsplash.com/photo-1516227261495-384d0b67b187?auto=format&fit=crop&w=1600&q=85' where name = 'Aiguilles de Bavella';
update public.spots set image_url = 'https://images.unsplash.com/photo-1654516364529-331a8ac85049?auto=format&fit=crop&w=1600&q=85' where name = 'Le Morvan';
update public.spots set image_url = 'https://images.unsplash.com/photo-1612830310621-1b0763eff89e?auto=format&fit=crop&w=1600&q=85' where name = 'Baie de Somme';
