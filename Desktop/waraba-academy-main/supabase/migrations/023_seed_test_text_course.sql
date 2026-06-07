-- Migration 023: Seed a free text+quiz test course
-- Purpose: Test the complete flow: enrollment → text lessons → quiz → certificate
-- Safe: Uses ON CONFLICT DO NOTHING, idempotent

-- 1. Ensure a test category exists
INSERT INTO categories (id, name, slug, description)
SELECT
  'a0000000-0000-4000-a000-000000000001',
  'Formation Gratuite',
  'formation-gratuite',
  'Cours gratuits pour decouvrir la plateforme'
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE slug = 'formation-gratuite'
);

-- 2. Create the free text course
INSERT INTO courses (
  id, title, slug, description, short_description,
  price, is_free, level, language, certificate,
  is_published, status, category_id, duration,
  requirements, objectives, features,
  syllabus
)
VALUES (
  'c0000000-0000-4000-a000-000000000001',
  'Introduction au Developpement Web',
  'intro-developpement-web',
  'Decouvrez les bases du developpement web avec ce cours gratuit. Apprenez HTML, CSS et les concepts fondamentaux pour creer vos premieres pages web. Aucune experience prealable requise.',
  'Apprenez les bases du web gratuitement - HTML, CSS et concepts fondamentaux',
  0,
  true,
  'beginner',
  'fr',
  true,
  true,
  'PUBLISHED',
  'a0000000-0000-4000-a000-000000000001',
  45,
  '["Ordinateur avec navigateur web", "Aucune experience requise"]',
  '["Comprendre le fonctionnement du web", "Ecrire du HTML valide", "Styliser avec CSS", "Creer une page web complete"]',
  '["Cours 100% gratuit", "Contenu texte interactif", "Quiz de validation", "Certificat de completion"]',
  '[
    {
      "id": "mod-intro-web-01",
      "title": "Les Fondamentaux du Web",
      "lessons": [
        {
          "id": "les-intro-web-01",
          "title": "Comment fonctionne Internet ?",
          "description": "Decouvrez les concepts cles : serveurs, clients, HTTP et DNS",
          "content": "<h2>Comment fonctionne Internet ?</h2><p>Internet est un reseau mondial qui connecte des milliards d''ordinateurs entre eux. Quand vous tapez une adresse web dans votre navigateur, voici ce qui se passe :</p><h3>1. La requete DNS</h3><p>Votre navigateur contacte un <strong>serveur DNS</strong> (Domain Name System) pour traduire le nom de domaine (ex: waraba-academy.com) en une adresse IP numerique (ex: 192.168.1.1).</p><h3>2. La connexion au serveur</h3><p>Votre navigateur etablit une connexion avec le <strong>serveur web</strong> qui heberge le site. Cette connexion utilise le protocole <strong>HTTP</strong> (ou HTTPS pour les connexions securisees).</p><h3>3. La reponse</h3><p>Le serveur envoie les fichiers demandes : du <strong>HTML</strong> (la structure), du <strong>CSS</strong> (le style) et du <strong>JavaScript</strong> (l''interactivite).</p><h3>4. L''affichage</h3><p>Votre navigateur interprete ces fichiers et affiche la page web.</p><blockquote>Chaque fois que vous visitez un site web, ce processus se repete en quelques millisecondes !</blockquote><h3>Vocabulaire cle</h3><ul><li><strong>Client</strong> : votre navigateur (Chrome, Firefox, Safari)</li><li><strong>Serveur</strong> : l''ordinateur qui stocke et envoie les pages web</li><li><strong>HTTP/HTTPS</strong> : le protocole de communication du web</li><li><strong>DNS</strong> : le systeme qui traduit les noms de domaine en adresses IP</li></ul>",
          "duration": 10,
          "videoUrl": null
        },
        {
          "id": "les-intro-web-02",
          "title": "HTML : Le squelette des pages web",
          "description": "Apprenez la structure de base d''un document HTML",
          "content": "<h2>HTML : Le langage de structure du web</h2><p><strong>HTML</strong> (HyperText Markup Language) est le langage qui definit la <em>structure</em> de chaque page web. Il utilise des <strong>balises</strong> pour organiser le contenu.</p><h3>Structure de base</h3><p>Tout document HTML commence par cette structure :</p><pre><code>&lt;!DOCTYPE html&gt;\n&lt;html lang=\"fr\"&gt;\n  &lt;head&gt;\n    &lt;meta charset=\"UTF-8\"&gt;\n    &lt;title&gt;Ma page&lt;/title&gt;\n  &lt;/head&gt;\n  &lt;body&gt;\n    &lt;h1&gt;Bonjour le monde !&lt;/h1&gt;\n    &lt;p&gt;Mon premier paragraphe.&lt;/p&gt;\n  &lt;/body&gt;\n&lt;/html&gt;</code></pre><h3>Les balises essentielles</h3><table><tr><th>Balise</th><th>Role</th><th>Exemple</th></tr><tr><td><code>&lt;h1&gt;</code> a <code>&lt;h6&gt;</code></td><td>Titres (du plus grand au plus petit)</td><td><code>&lt;h1&gt;Titre principal&lt;/h1&gt;</code></td></tr><tr><td><code>&lt;p&gt;</code></td><td>Paragraphe</td><td><code>&lt;p&gt;Du texte ici&lt;/p&gt;</code></td></tr><tr><td><code>&lt;a&gt;</code></td><td>Lien hypertexte</td><td><code>&lt;a href=\"url\"&gt;Cliquez ici&lt;/a&gt;</code></td></tr><tr><td><code>&lt;img&gt;</code></td><td>Image</td><td><code>&lt;img src=\"photo.jpg\" alt=\"description\"&gt;</code></td></tr><tr><td><code>&lt;ul&gt;</code> / <code>&lt;ol&gt;</code></td><td>Listes (puces / numerotees)</td><td><code>&lt;ul&gt;&lt;li&gt;Element&lt;/li&gt;&lt;/ul&gt;</code></td></tr><tr><td><code>&lt;div&gt;</code></td><td>Conteneur generique</td><td><code>&lt;div class=\"section\"&gt;...&lt;/div&gt;</code></td></tr></table><h3>Attributs</h3><p>Les balises peuvent avoir des <strong>attributs</strong> qui ajoutent des informations :</p><ul><li><code>href</code> : destination d''un lien</li><li><code>src</code> : source d''une image</li><li><code>class</code> : nom de classe CSS</li><li><code>id</code> : identifiant unique</li><li><code>alt</code> : texte alternatif pour les images</li></ul><blockquote>HTML s''occupe uniquement de la <strong>structure</strong>. Pour le style visuel, on utilise CSS !</blockquote>",
          "duration": 15,
          "videoUrl": null
        }
      ]
    },
    {
      "id": "mod-intro-web-02",
      "title": "CSS : Styliser vos pages",
      "lessons": [
        {
          "id": "les-intro-web-03",
          "title": "Introduction a CSS",
          "description": "Decouvrez comment CSS permet de styliser vos pages web",
          "content": "<h2>CSS : Donner du style a vos pages</h2><p><strong>CSS</strong> (Cascading Style Sheets) est le langage qui controle l''apparence visuelle de vos pages web. Si HTML est le squelette, CSS est la peau et les vetements.</p><h3>Comment utiliser CSS</h3><p>Il y a 3 facons d''ajouter du CSS :</p><ol><li><strong>Fichier externe</strong> (recommande) : <code>&lt;link rel=\"stylesheet\" href=\"style.css\"&gt;</code></li><li><strong>Balise style</strong> : <code>&lt;style&gt; p { color: blue; } &lt;/style&gt;</code></li><li><strong>Style inline</strong> (a eviter) : <code>&lt;p style=\"color: blue;\"&gt;</code></li></ol><h3>Syntaxe CSS</h3><p>Une regle CSS se compose d''un <strong>selecteur</strong> et de <strong>declarations</strong> :</p><pre><code>selecteur {\n  propriete: valeur;\n  propriete2: valeur2;\n}</code></pre><h3>Selecteurs courants</h3><table><tr><th>Selecteur</th><th>Cible</th><th>Exemple</th></tr><tr><td><code>h1</code></td><td>Toutes les balises h1</td><td><code>h1 { color: blue; }</code></td></tr><tr><td><code>.classe</code></td><td>Elements avec cette classe</td><td><code>.important { font-weight: bold; }</code></td></tr><tr><td><code>#id</code></td><td>Element avec cet id</td><td><code>#header { background: navy; }</code></td></tr></table><h3>Proprietes essentielles</h3><ul><li><code>color</code> : couleur du texte</li><li><code>background-color</code> : couleur de fond</li><li><code>font-size</code> : taille du texte</li><li><code>font-weight</code> : graisse (bold, normal)</li><li><code>margin</code> : espace exterieur</li><li><code>padding</code> : espace interieur</li><li><code>border</code> : bordure</li><li><code>border-radius</code> : coins arrondis</li></ul><blockquote>Astuce : utilisez les outils de developpement de votre navigateur (F12) pour experimenter avec CSS en temps reel !</blockquote>",
          "duration": 15,
          "videoUrl": null
        },
        {
          "id": "les-intro-web-04",
          "title": "Creer votre premiere page web",
          "description": "Mettez en pratique HTML et CSS pour creer une page complete",
          "content": "<h2>Projet : Votre premiere page web</h2><p>Felicitations ! Vous avez maintenant les bases pour creer votre premiere page web. Voici un exemple complet combinant HTML et CSS :</p><h3>Le fichier HTML (index.html)</h3><pre><code>&lt;!DOCTYPE html&gt;\n&lt;html lang=\"fr\"&gt;\n&lt;head&gt;\n  &lt;meta charset=\"UTF-8\"&gt;\n  &lt;title&gt;Mon Portfolio&lt;/title&gt;\n  &lt;style&gt;\n    body {\n      font-family: Arial, sans-serif;\n      max-width: 800px;\n      margin: 0 auto;\n      padding: 20px;\n      background-color: #f5f5f5;\n    }\n    header {\n      background: linear-gradient(to right, #3b82f6, #1d4ed8);\n      color: white;\n      padding: 40px;\n      border-radius: 12px;\n      text-align: center;\n    }\n    .section {\n      background: white;\n      padding: 30px;\n      margin: 20px 0;\n      border-radius: 8px;\n      box-shadow: 0 2px 4px rgba(0,0,0,0.1);\n    }\n  &lt;/style&gt;\n&lt;/head&gt;\n&lt;body&gt;\n  &lt;header&gt;\n    &lt;h1&gt;Mon Portfolio&lt;/h1&gt;\n    &lt;p&gt;Developpeur Web Junior&lt;/p&gt;\n  &lt;/header&gt;\n  &lt;div class=\"section\"&gt;\n    &lt;h2&gt;A propos&lt;/h2&gt;\n    &lt;p&gt;Je suis en train d''apprendre le developpement web !&lt;/p&gt;\n  &lt;/div&gt;\n&lt;/body&gt;\n&lt;/html&gt;</code></pre><h3>Points cles a retenir</h3><ul><li>HTML structure le contenu avec des <strong>balises</strong></li><li>CSS stylise l''apparence avec des <strong>regles</strong></li><li>Les deux langages travaillent ensemble</li><li>Utilisez <code>F12</code> pour inspecter et experimenter</li><li>Pratiquez regulierement pour progresser</li></ul><h3>Prochaines etapes</h3><p>Vous etes pret a passer le <strong>quiz de validation</strong> pour obtenir votre certificat ! Le quiz porte sur les concepts vus dans ce cours :</p><ol><li>Fonctionnement d''Internet (DNS, HTTP, clients/serveurs)</li><li>Structure HTML (balises, attributs)</li><li>Bases de CSS (selecteurs, proprietes)</li></ol><p>Bonne chance ! 🎓</p>",
          "duration": 10,
          "videoUrl": null
        }
      ]
    }
  ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 3. No separate lessons table rows needed:
--    The syllabus JSON is the source of truth for the learn page.
--    user_progress.lesson_id is TEXT and matches the syllabus lesson IDs directly.

-- 4. Create a quiz for this course
INSERT INTO quizzes (id, course_id, title, description, passing_score, time_limit, is_active)
VALUES (
  'd0000000-0000-4000-a000-000000000001',
  'c0000000-0000-4000-a000-000000000001',
  'Quiz : Les bases du Web',
  'Testez vos connaissances sur HTML, CSS et le fonctionnement du web',
  70,
  10,
  true
)
ON CONFLICT (id) DO NOTHING;

-- 5. Create quiz questions
INSERT INTO quiz_questions (id, quiz_id, question_text, question_type, points, order_index)
VALUES
  ('e0000000-0000-4000-a000-000000000001', 'd0000000-0000-4000-a000-000000000001',
   'Quel protocole est utilise pour communiquer sur le web ?', 'multiple_choice', 1, 0),
  ('e0000000-0000-4000-a000-000000000002', 'd0000000-0000-4000-a000-000000000001',
   'Que signifie HTML ?', 'multiple_choice', 1, 1),
  ('e0000000-0000-4000-a000-000000000003', 'd0000000-0000-4000-a000-000000000001',
   'HTML est un langage de programmation.', 'true_false', 1, 2),
  ('e0000000-0000-4000-a000-000000000004', 'd0000000-0000-4000-a000-000000000001',
   'Quel langage est utilise pour styliser les pages web ?', 'multiple_choice', 1, 3),
  ('e0000000-0000-4000-a000-000000000005', 'd0000000-0000-4000-a000-000000000001',
   'Quel selecteur CSS cible les elements avec une classe "important" ?', 'multiple_choice', 1, 4),
  ('e0000000-0000-4000-a000-000000000006', 'd0000000-0000-4000-a000-000000000001',
   'DNS traduit les noms de domaine en adresses IP.', 'true_false', 1, 5),
  ('e0000000-0000-4000-a000-000000000007', 'd0000000-0000-4000-a000-000000000001',
   'Quelle balise HTML est utilisee pour creer un lien hypertexte ?', 'multiple_choice', 1, 6)
ON CONFLICT (id) DO NOTHING;

-- 6. Create quiz answers
INSERT INTO quiz_answers (id, question_id, answer_text, is_correct, order_index)
VALUES
  -- Q1: Protocole web
  ('fa000000-0000-0000-0001-000000000001', 'e0000000-0000-4000-a000-000000000001', 'HTTP/HTTPS', true, 0),
  ('fa000000-0000-0000-0001-000000000002', 'e0000000-0000-4000-a000-000000000001', 'FTP', false, 1),
  ('fa000000-0000-0000-0001-000000000003', 'e0000000-0000-4000-a000-000000000001', 'SMTP', false, 2),
  ('fa000000-0000-0000-0001-000000000004', 'e0000000-0000-4000-a000-000000000001', 'SSH', false, 3),

  -- Q2: Signification HTML
  ('fa000000-0000-0000-0002-000000000001', 'e0000000-0000-4000-a000-000000000002', 'HyperText Markup Language', true, 0),
  ('fa000000-0000-0000-0002-000000000002', 'e0000000-0000-4000-a000-000000000002', 'High Tech Modern Language', false, 1),
  ('fa000000-0000-0000-0002-000000000003', 'e0000000-0000-4000-a000-000000000002', 'Home Tool Markup Language', false, 2),
  ('fa000000-0000-0000-0002-000000000004', 'e0000000-0000-4000-a000-000000000002', 'HyperText Making Language', false, 3),

  -- Q3: HTML est un langage de programmation (Faux)
  ('fa000000-0000-0000-0003-000000000001', 'e0000000-0000-4000-a000-000000000003', 'Vrai', false, 0),
  ('fa000000-0000-0000-0003-000000000002', 'e0000000-0000-4000-a000-000000000003', 'Faux', true, 1),

  -- Q4: Langage de style
  ('fa000000-0000-0000-0004-000000000001', 'e0000000-0000-4000-a000-000000000004', 'CSS', true, 0),
  ('fa000000-0000-0000-0004-000000000002', 'e0000000-0000-4000-a000-000000000004', 'HTML', false, 1),
  ('fa000000-0000-0000-0004-000000000003', 'e0000000-0000-4000-a000-000000000004', 'JavaScript', false, 2),
  ('fa000000-0000-0000-0004-000000000004', 'e0000000-0000-4000-a000-000000000004', 'Python', false, 3),

  -- Q5: Selecteur CSS classe
  ('fa000000-0000-0000-0005-000000000001', 'e0000000-0000-4000-a000-000000000005', '.important', true, 0),
  ('fa000000-0000-0000-0005-000000000002', 'e0000000-0000-4000-a000-000000000005', '#important', false, 1),
  ('fa000000-0000-0000-0005-000000000003', 'e0000000-0000-4000-a000-000000000005', 'important', false, 2),
  ('fa000000-0000-0000-0005-000000000004', 'e0000000-0000-4000-a000-000000000005', '*important', false, 3),

  -- Q6: DNS (Vrai)
  ('fa000000-0000-0000-0006-000000000001', 'e0000000-0000-4000-a000-000000000006', 'Vrai', true, 0),
  ('fa000000-0000-0000-0006-000000000002', 'e0000000-0000-4000-a000-000000000006', 'Faux', false, 1),

  -- Q7: Balise lien
  ('fa000000-0000-0000-0007-000000000001', 'e0000000-0000-4000-a000-000000000007', '<a>', true, 0),
  ('fa000000-0000-0000-0007-000000000002', 'e0000000-0000-4000-a000-000000000007', '<link>', false, 1),
  ('fa000000-0000-0000-0007-000000000003', 'e0000000-0000-4000-a000-000000000007', '<href>', false, 2),
  ('fa000000-0000-0000-0007-000000000004', 'e0000000-0000-4000-a000-000000000007', '<url>', false, 3)
ON CONFLICT (id) DO NOTHING;
