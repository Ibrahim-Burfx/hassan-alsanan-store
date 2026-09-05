-- Homepage image rollout for the first eight products shown by the ordered listing.
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;

UPDATE products AS p
SET image_url = v.image_url
FROM (VALUES
  (1, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'),
  (2, 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80'),
  (3, 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80'),
  (4, 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=800&q=80'),
  (5, 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80'),
  (6, 'https://images.unsplash.com/photo-1522335789203-aecd9fc54c84?auto=format&fit=crop&w=800&q=80'),
  (7, 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=800&q=80'),
  (8, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80')
) AS v(id, image_url)
WHERE p.id = v.id;
