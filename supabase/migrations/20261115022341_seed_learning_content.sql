insert into public.techniques (slug, title, description, position)
values
  ('misdirection', 'Misdirection', 'Set a clear expectation, then turn it in a surprising but safe direction.', 1),
  ('rule-of-three', 'Rule of Three', 'Build a rhythm with two expected beats and one unexpected beat.', 2),
  ('exaggeration', 'Exaggeration', 'Make a small, relatable detail comically larger.', 3)
on conflict (slug) do nothing;

insert into public.lessons (technique_id, slug, title, summary, body, difficulty, position)
select id, 'turn-the-expectation', 'Set an expectation, then turn it', 'A gentle first lesson in conversational misdirection.',
  '[{"heading":"The setup","text":"Make the listener expect an ordinary ending."},{"heading":"The turn","text":"Finish with a specific, harmless detail they did not predict."}]'::jsonb, 1, 1
from public.techniques where slug = 'misdirection'
on conflict (slug) do nothing;

insert into public.lessons (technique_id, slug, title, summary, body, difficulty, position)
select id, 'three-beats', 'Build rhythm with three beats', 'Use repetition to make the final beat land.',
  '[{"heading":"Two expected beats","text":"Establish a simple pattern."},{"heading":"One surprising beat","text":"Break it with a concise, context-safe detail."}]'::jsonb, 1, 1
from public.techniques where slug = 'rule-of-three'
on conflict (slug) do nothing;

insert into public.lessons (technique_id, slug, title, summary, body, difficulty, position)
select id, 'make-it-big', 'Make a small thing comically big', 'Turn a small workplace moment into a playful overstatement.',
  '[{"heading":"Start small","text":"Pick a relatable inconvenience."},{"heading":"Scale it up","text":"Describe it as if it were a historic event."}]'::jsonb, 1, 1
from public.techniques where slug = 'exaggeration'
on conflict (slug) do nothing;

insert into public.drills (technique_id, lesson_id, slug, title, prompt, guidance, context_tags, difficulty, position)
select t.id, l.id, 'meeting-timeline-turn', 'Give this meeting update a turn', 'The project timeline is moving exactly as planned…',
  'Finish with an unexpected—but workplace-safe—detail.', array['meetings', 'presenting'], 1, 1
from public.techniques t join public.lessons l on l.technique_id = t.id
where t.slug = 'misdirection' and l.slug = 'turn-the-expectation'
on conflict (slug) do nothing;
