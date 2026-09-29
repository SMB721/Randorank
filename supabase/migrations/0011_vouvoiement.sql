-- Switches user-facing copy already inserted by 0007/0008 from tutoiement to
-- vouvoiement (site-wide product decision). Re-runnable: each update is
-- keyed by the row's stable `code`.
update public.badges set description = 'Votre toute première rando enregistrée. Le début d''une obsession.' where code = 'first_hike';
update public.badges set description = '10 sorties au compteur. Vous commencez à connaître vos sentiers par cœur.' where code = 'regular_10';
update public.badges set description = '30 randos. À ce stade, vos chaussures ont plus vécu que vous.' where code = 'unstoppable_30';
update public.badges set description = '500 km cumulés. La carte commence à manquer de place pour vos traces.' where code = 'distance_500';
update public.badges set description = '1000 m de dénivelé cumulé. Le début de la fin pour vos mollets.' where code = 'elevation_1000';
update public.badges set description = 'Vous avez quitté le rang des débutants. Retour en arrière impossible.' where code = 'level_amateur';

update public.challenges set description = 'Cumulez 1000 m de dénivelé positif ce mois-ci.' where code = 'monthly_elevation';
update public.challenges set description = 'Cumulez 100 km ce mois-ci.' where code = 'monthly_distance';
