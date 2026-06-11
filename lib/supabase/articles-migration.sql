-- Full article migration from pages.sql
-- link_enabled=1 → external_url set; link_enabled=0 → full article
-- Uses created_at as published_at

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('body-keeps-the-score-by-bessel-van-der-kolk', 'Body keeps the score by Bessel Van Der Kolk', 'A seminal book detailing the relationship between childhood and unresolved trauma and conditions such as PTSD, ADHD and other attachment disorders. A evidence based exploration of the power of non-cognitive methods for helping the body work with and resolve trauma.', 'https://www.amazon.com.au/LSD-Mind-Universe-Diamonds-Heaven/dp/1620559706', 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1042/body-keeps-score_benzq8', true, '2025-07-04 07:46:54')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('book-review-king-warrior-magician-lover-rediscovering-the-archetypes-of-the-matu', 'Book Review: "King, Warrior, Magician, Lover: Rediscovering the Archetypes of the Mature Masculine"', '"King, Warrior, Magician, Lover" by Robert Moore and Douglas Gillette is a profound exploration of the archetypes that shape the mature masculine psyche. Drawing upon Jungian psychology, mythology, and anthropology, the authors guide readers on a transformative journey to reclaim the balanced and integrated aspects of masculinity. With deep insights and practical wisdom, this book offers a roadmap for men seeking to embrace their full potential and cultivate healthier expressions of masculinity.', NULL, 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1042/king-warrior-magician-lover-4-mature-male-archetypes_u8pirp', true, '2025-07-04 07:46:54')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('can-you-do-holotropic-breathwork-by-yourself', 'Can you do Holotropic Breathwork by yourself?', 'Holotropic Breathwork is an impactful and transformative modality that utilizes deep and intense breathing, complemented by evocative music and bodywork. While the advantages of Holotropic Breathwork are widely recognized, it is crucial to recognize the significance of refraining from engaging in this practice independently. Undertaking Holotropic Breathwork without appropriate guidance and support can expose individuals to significant risks, such as heightened psychological fragmentation, the potential for unexpected interruptions, and the inadvertent reinforcement of traumas related to neglect or omission.', 'https://melbournebreathwork.com/resources/can-you-do-holotropic-breathwork-by-yourself', 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1042/not-alone-breathwork_ofk9g1', true, '2025-07-04 07:46:54')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('christina-grof-and-spiritual-emergency', 'Christina Grof and Spiritual Emergency', 'Christina Grof is a renowned author, speaker, and pioneer in the field of transpersonal psychology and spiritual emergence. With a deep passion for personal transformation and healing, Christina has dedicated her life to exploring the realms of consciousness and the human psyche.', NULL, 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1042/christina-grof_ijch4m_uzz9fz', true, '2025-07-04 07:46:54')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('diewise-by-stephen-jenkinson', 'Diewise by Stephen Jenkinson', '"Die Wise: A Manifesto for Sanity and Soul" by Stephen Jenkinson is a thought-provoking and insightful book that challenges our society''s views on death and dying. The author argues that our society is hope-addled, death-phobic, and competence-addicted, and that these views prevent us from fully living our lives and preparing for death.', NULL, 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1042/diewise_ymg0ub', true, '2025-07-04 07:46:54')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('eco-therapy-unveiling-the-science-and-traditional-wisdom-of-connecting-with-natu', 'Eco-Therapy: Unveiling the Science and Traditional Wisdom of Connecting with Nature''s Spirit', 'In today''s modern world, with its fast-paced lifestyles and urban environments, many of us yearn for a deeper connection with nature. Eco-therapy, also known as nature therapy or green therapy, has emerged as a powerful approach to healing and well-being by harnessing the inherent benefits of immersing ourselves in the natural world. In this article, we will explore the science behind eco-therapy, the traditional understanding of connecting with the spirit of place, and the profound impact nature has on our physiological and psychological well-being.', NULL, 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1042/sacred-forest_wszudr', true, '2025-07-04 07:46:54')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('exploring-5-techniques-for-grounding-nurturing-the-nervous-system-with-polyvagal', 'Exploring 5 Techniques for Grounding: Nurturing the Nervous System with Polyvagal Theory and Eco-Therapy', 'In today''s fast-paced and overstimulated world, it is increasingly important to find ways to ground ourselves and regulate our nervous systems. Anxiety, overstimulation, and depression can take a toll on our well-being, leaving us feeling disconnected and overwhelmed. Fortunately, there are effective techniques rooted in Polyvagal Theory and the healing power of nature, often referred to as eco-therapy. In this article, we will explore five grounding techniques that can help restore balance and provide a sense of stability amidst life''s challenges.', NULL, 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1042/blue-earth-ocean_p1yyp7', true, '2025-07-04 07:46:54')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('exploring-gestalt-psychotherapy-and-processwork-phenomenology-body-centered-appr', 'Exploring Gestalt Psychotherapy and ProcessWork: Phenomenology, Body-Centered Approaches, and their Unique Contributions', 'Gestalt Psychotherapy and ProcessWork are two therapeutic approaches that share a focus on experiential exploration and personal growth. While Gestalt Psychotherapy emphasizes the importance of phenomenology in understanding the present moment, ProcessWork integrates the body as a valuable source of information and transformation. In this article, we will delve into the concepts of phenomenology, provide a historical overview of Gestalt Psychotherapy and ProcessWork, and compare their approaches to working with the body.', NULL, 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1042/DALL_E_2023-05-30_k2l5xv', true, '2025-07-04 07:46:54')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('exploring-gestalt-therapy-embracing-relational-healing', 'Exploring Gestalt Therapy: Embracing Relational Healing', 'In the field of psychology, there is a multitude of therapeutic approaches available to support individuals in their healing journey. One such approach is Gestalt therapy, which offers a unique perspective on personal growth and transformation. In this blog post, we will delve into the essence of Gestalt therapy and highlight the advantages of relational therapy in fostering deep and meaningful healing.', NULL, 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1042/Therapy-line-drawing-1_yens0z', true, '2025-07-04 07:46:54')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('exploring-the-depths-of-the-psyche-holotropic-breathwork-and-mindells-processwor', 'Exploring the Depths of the Psyche: Holotropic Breathwork and Mindell''s Processwork', 'The human psyche is a vast and intricate landscape, often concealing hidden aspects of ourselves that can profoundly impact our well-being. In the pursuit of self-discovery and personal growth, various therapeutic modalities have emerged to delve into these depths. Holotropic Breathwork and Mindell''s Processwork are two such approaches that utilize the power of the breath to facilitate the emergence of material from the psyche in a safe and supported setting. In this article, we will explore these transformative practices and their potential to unlock inner wisdom and healing.', NULL, 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1042/light-landscape-peaceful-art_ul05ow', true, '2025-07-04 07:46:54')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('exploring-the-interplay-between-internal-family-systems-and-arnold-mindells-proc', 'Exploring the Interplay Between Internal Family Systems and Arnold Mindell''s ProcessWork: Parts and Body Signals', 'While developed independently, there are intriguing connections between the concepts of parts in IFS and body signals in ProcessWork. In this article, we will explore the interplay between these two approaches, highlighting their similarities and differences in understanding and working with internal experiences.', NULL, 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1042/DALL_E_2023-05-30_09.49.32_-_sacred_nature_digital_art_au5ngv', true, '2025-07-04 07:46:54')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('holotropic-breathwork-in-europe', 'Holotropic Breathwork in Europe', 'A website based on all of the Holotropic Breathwork training and workshops available in Europe.', 'https://www.holotropic-association.eu', 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1042/holotropic-association-eu_nmzawd_qprtxa', true, '2025-07-04 07:46:54')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('holotropic-breathwork-in-slovenia', 'Holotropic Breathwork in Slovenia', 'Holotropic Breathwork and Psychotherapy based in Slovenia', 'https://velosimed.com/', 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1042/velosimed_frflps_b0qtc6', true, '2025-07-04 07:46:54')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('how-to-measure-progress-in-psychedelic-integration-with-tomas-frymann', 'How to measure progress in psychedelic integration with Tomas Frymann', 'This is a very useful podcast exploring the importance of integrating psychedelic and expanded states of awareness. Integration is often used as a general term for what happens after a deep experiential process but what does it actually mean?', NULL, 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1042/kaleidoscope-2-psychedelic_knvipv', true, '2025-07-04 07:46:54')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('lsd-and-the-mind-of-the-universe', 'LSD and the mind of the universe', 'This is an incredible book detailing the potential of non-ordinary states and their capacity to not only invoke our own personal healing but also to give use a greater understanding of the universal layers of consciousness.', 'https://www.amazon.com.au/LSD-Mind-Universe-Diamonds-Heaven/dp/1620559706', 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1042/lsd-mind-of-universe_s1a0td', true, '2025-07-04 07:46:54')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('melbourne-breathwork', 'Melbourne Breathwork', 'Group Workshops for Holotropic Breathwork and Men''s Groups based in Melbourne with Anthony Olsen and Ruth Langford.', 'https://www.melbournebreathwork.com', 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1042/meagan-carsience-TpG2TBiclik-unsplash_gkl42k_l9zed5_hrlxcr', true, '2025-07-04 07:46:54')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('music-for-breathwork', 'Music for Breathwork', 'A carefully crafted collection of music for Holotropic breathwork and other experiential therapies.', 'https://www.musicforbreathwork.com', 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1042/music-for-breathwork_bl4l27', true, '2025-07-04 07:46:55')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('navigating-psychedelics-what-you-need-to-know-before-taking-the-plunge', 'Navigating Psychedelics: What You Need to Know Before Taking the Plunge', 'Embarking on a psychedelic journey is an extraordinary and potentially life-altering experience. However, it is essential to approach these substances with knowledge, caution, and respect. In this blog post, we delve into the critical considerations that individuals should be aware of before taking a psychedelic. Whether you are a curious explorer or someone contemplating this profound step, understanding the key factors can greatly enhance the safety and transformative potential of your journey.', NULL, 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1042/astronaut-mountain-colours_uplirx', true, '2025-07-04 07:46:55')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('on-resonance-caves-hooves-hearts-harps-and-the-birth-of-culture', 'On Resonance: Caves, Hooves, Hearts, Harps... and the Birth of Culture', 'This is a beautifully crafted podcast that is helpful to remind us why the mythic and the poetic and the resonant are an essential ingredient in living a spirit filled / authentic life.', 'https://podcasts.apple.com/au/podcast/on-resonance-caves-hooves-hearts-harps-and-the/id1465445746?i=1000538392160', 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1042/screenshot_339_s2qit7', true, '2025-07-04 07:46:55')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('polyvagal-theory-deep-listening-and-mens-groups', 'Polyvagal Theory, deep listening and Men''s groups', 'In today''s society, men often face unique challenges in navigating their masculinity, emotional expression, and personal growth. Fortunately, men''s groups have emerged as empowering spaces where men can come together, share their experiences, and support each other''s journeys. In this blog post, we will explore the importance of men''s groups and the practice of deep listening through the lens of Polyvagal Theory—a groundbreaking framework that sheds light on our autonomic nervous system and its impact on social interactions, emotional well-being, and personal growth.', 'https://melbournebreathwork.com/resources/the-power-of-mens-groups-and-deep-listening-insights-from-polyvagal-theory', 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1042/mens-group-listening-in-a-circle_wvbwbz', true, '2025-07-04 07:46:55')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('the-role-of-music-in-holotropic-breathwork-and-how-it-entrains-the-brain', 'The role of music in Holotropic Breathwork and how it entrains the brain', 'Music possesses an extraordinary power to transcend language and touch the deepest corners of our hearts and minds. Its ability to generate profound emotions, influence brain activity, and inspire transformative experiences is truly remarkable. Whether through joyful melodies that lift our spirits, melancholic harmonies that evoke introspection, or pulsating rhythms that ignite our bodies, music has the capacity to ignite a kaleidoscope of emotions within us. It connects us to our deepest selves, resonates with our experiences, and creates an emotional landscape that words alone often fail to capture. As we immerse ourselves in the captivating world of music, we embark on a transformative journey that impacts both our brain and our soul, elevating us to heights of profound beauty and connection.', 'https://melbournebreathwork.com/resources/how-music-entrains-the-brain-and-the-power-of-music-in-holotropic-breathwork', 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1042/DALL_E_2023-06-04_08.24.54_-_listening_to_music_and_transcendance_digital_art_otb0gq', true, '2025-07-04 07:46:55')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('the-role-of-the-sitter-in-holotropic-breathwork-and-the-notion-of-unconditional-', 'The role of the sitter in Holotropic Breathwork and the notion of Unconditional Positive Regard', 'In Holotropic Breathwork, the role of the sitter is vital in providing support and guidance to participants as they embark on their inner journey. The sitter''s responsibilities align closely with the concept of Unconditional Positive Regard (UPR), which emphasizes empathy, acceptance, and non-judgment.', 'https://melbournebreathwork.com/resources/what-is-the-role-of-the-sitter-in-holotropic-breathwork', 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1042/breathers-sitting-for-eachother_ksilmt', true, '2025-07-04 07:46:55')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('the-shamans-body-by-arnold-mindell', 'The Shaman''s body by Arnold Mindell', '"The Shaman''s Body: A New Approach to Transforming Health, Relationships, and Community" by Arnold Mindell is a thought-provoking and insightful book that explores the process of personal transformation and its impact on our lives and the world around us. Mindell argues that process work, a holistic approach that integrates modern Western psychology with ancient wisdom traditions, can play a vital role in transforming our lives and our world.', NULL, 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1042/shamansbodynewsh00mind_0001_ujo9lt', true, '2025-07-04 07:46:55')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('the-silent-hike', 'The Silent Hike', 'A few weeks ago I had the privilege to travel to one of the most northern parts of Norway, way up in the Arctic Circle and take part in a 7 day hike and vision quest across the Tundra. It was an incredible immersion in nature, physically challenging and also deeply rewarding.', NULL, 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1042/EFFD3B03-CA1A-47EE-A201-DE969030790D_lntidb', true, '2025-07-04 07:46:55')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('undertstanding-processwork-jungian-psychology-and-shamanism', 'Undertstanding processwork, jungian psychology and shamanism', 'Arnold Mindell is a renowned psychotherapist, author, and teacher who has made significant contributions to the field of psychology through his development of ProcessWork. Combining elements from various disciplines such as shamanic practices, Jungian psychology, and the concept of deep democracy, Mindell''s approach offers a unique and holistic perspective on personal and collective transformation. In this article, we will delve into the foundations of ProcessWork, its incorporation of shamanic practices, the influence of Jungian psychology, and the central tenet of deep democracy.', NULL, 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1042/DALL_E_2023-05-25_11.32.05_-_existential_grief_loneliness_pain_hope_of_connection_digital_art_q6py7n', true, '2025-07-04 07:46:55')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('waking-the-tiger-healing-trauma', 'Waking the Tiger: Healing Trauma', '"Waking the Tiger: Healing Trauma" by Peter Levine is a groundbreaking book that provides a new perspective on the nature of trauma and its effects on the body and mind. Levine explores the connection between trauma and the body''s natural "fight or flight" response, and shows how this response can become stuck, leading to chronic symptoms of trauma.', NULL, 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1042/waking-tiger-peter-levine_io1se4', true, '2025-07-04 07:46:55')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('way-of-the-psychonaut-film', 'Way of the Psychonaut Film', 'This is a beautiful film documenting the life and work of Stan Grof and the healing potential of non-ordinary states of consciousness. It is highly recommended as an entry point into the world of Holotropic Breathwork and Psychedelic therapy,', 'https://www.thewayofthepsychonaut.com/', 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1042/way_of_the_psychonaut_ejrgbv', true, '2025-07-04 07:46:55')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('what-are-the-core-integration-practices-of-psychedlic-therapy', 'What are the core integration practices of psychedlic therapy?', 'While the specific integration practices may vary among therapists and modalities, there are several core principles commonly employed in psychedelic therapy integration. nThese practices are aimed at helping individuals process and make meaning of their psychedelic experiences and integrate the insights gained into their daily lives. Here are some key integration practices:', NULL, 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1042/asstronaut-in-psychedelic-landscape_wugxv4', true, '2025-07-04 07:46:55')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('what-is-the-benefit-of-psycho-therapy-and-how-does-it-differ-from-psychology', 'What is the benefit of psycho-therapy? and how does it differ from psychology?', 'Therapy, also known as psychotherapy or counseling, can offer numerous benefits for individuals seeking support and personal growth. Here are some of the key advantages of therapy:', NULL, 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1042/Therapy-couch_blnacf', true, '2025-07-04 07:46:55')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('what-is-the-role-of-the-body-in-healing-trauma', 'What is the role of the body in healing trauma?', 'In recent years, there has been a growing recognition of the role of the body in processing trauma. Traditional approaches to trauma therapy have often focused primarily on the cognitive and emotional aspects of trauma, but researchers and clinicians have increasingly emphasized the importance of integrating the body into the healing process. This recognition stems from the understanding that trauma is not only an event that happens to the mind, but also an experience that profoundly affects the body.', NULL, 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1042/healing-trauma_uepoyi', true, '2025-07-04 07:46:55')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('why-is-the-integration-of-psychedelic-experiences-so-important', 'Why is the integration of psychedelic experiences so important?', 'Integration is a crucial aspect of the psychedelic experience. It refers to the process of making sense of and incorporating the insights, emotions, and perspectives gained during a psychedelic journey into one''s everyday life. Integration helps individuals derive long-lasting benefits from their psychedelic experiences and maximize their potential for personal growth and transformation.', NULL, 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1042/psychedelic-art-kaliedoscope_oonf5r', true, '2025-07-04 07:46:55')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('the-others-within-us-by-robert-falconer', 'The Others within us by Robert Falconer', 'A seminal book detailing the relationship between childhood and unresolved trauma and conditions such as PTSD, ADHD and other attachment disorders. A evidence based exploration of the power of non-cognitive methods for helping the body work with and resolve trauma.', 'https://www.amazon.com.au/LSD-Mind-Universe-Diamonds-Heaven/dp/1620559706', 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1314/others-within-us_er6te9', true, '2025-07-06 00:09:12')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('holotropic-breathwork-amp-its-potential-life-changing-impact', 'Holotropic Breathwork &amp; it''s potential life changing impact', 'Holotropic breathwork, a therapy technique often used in mental health treatment programs, is a unique method to achieve heightened self-awareness and personal growth. It employs a combination of rapid, deep breathing, evocative music, and focused bodywork to stimulate the psyche and bring about emotional release and psychological insight.', NULL, 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1314/wolf-medicine_wy2wzj', true, '2025-07-08 07:08:50')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('healthy-masculinity-the-power-of-mens-groups-in-collective-healing', 'Healthy Masculinity: The Power of Men''s Groups in Collective Healing', 'Explore the transformative role of men''s groups in fostering healthy masculinity and collective healing. Learn practical tips to harness the power of these groups.', NULL, 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1314/norway_k1dqti', true, '2025-07-09 01:17:07')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('breathe-your-way-to-balance-the-polyvagal-theory-and-meditation', 'Breathe Your Way to Balance: The Polyvagal Theory and Meditation', 'Explore how mindful breathing during meditation can influence your central nervous system, as explained by the polyvagal theory.', NULL, 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1314/mohamed-nohassi-odxB5oIG_iA-unsplash_r49u8y', true, '2025-07-09 05:39:33')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('unlocking-the-power-of-breathwork-impact-on-the-central-nervous-system', 'Unlocking the Power of Breathwork: Impact on the Central Nervous System', 'Explore the fascinating intersection of breathwork and neuroscience, and learn how conscious breathing can positively influence our central nervous system.', NULL, 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1314/therapy_ydfwfv', true, '2025-07-09 06:34:06')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('exploring-the-power-of-music-for-breathwork-and-trance-states', 'Exploring the Power of Music for Breathwork and Trance States', 'Explore the therapeutic potential of music in enhancing breathwork and facilitating deeper trance states for improved wellbeing.', NULL, 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1314/ohbw_d0ri3p', true, '2025-07-09 11:53:34')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('unleashing-the-power-of-trance-state-breathwork-and-music', 'Unleashing the Power of Trance State Breathwork and Music', 'Uncover the powerful combination of trance state breathwork and music, and how you can harness it for better health and wellness.', NULL, 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1314/therapy_ydfwfv', true, '2025-07-09 12:01:00')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('unlocking-the-power-of-music-trance-states-through-breathwork', 'Unlocking the Power of Music Trance States through Breathwork', 'Discover how combining music trance states with breathwork can contribute to deep therapeutic benefits and overall wellness.', NULL, 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1314/anthony-avatar-large-anthony-olsen-1080x675_xmdgo9_ynyj1z_5f2vrU_ouiqt4', true, '2025-07-09 12:07:50')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('grof-transpersonal-training', 'Grof Transpersonal Training', 'Holotropic Breathwork Training and facilitation course. GTT run an international and rigorous course aimed at preparing students to be able to facilitate Holotropic Breathwork Workshops.', 'https://www.holotropic.com', 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1042/gtt-holotropic_j9md3h', true, '2025-07-10 07:54:02')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('grof-transpersonal-training-2', 'Grof Transpersonal Training', 'Holotropic Breathwork Training and facilitation course. GTT run an international and rigorous course aimed at preparing students to be able to facilitate Holotropic Breathwork Workshops.', 'https://www.holotropic.com', 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1042/gtt-holotropic_j9md3h', true, '2025-07-10 07:55:08')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('discover-your-inner-healer-a-guide-to-holistic-healing-and-breathwork', 'Discover Your Inner Healer: A Guide to Holistic Healing and Breathwork', 'Explore the concept of the ''inner healer'' and discover how holistic healing and breathwork therapy techniques can help you unlock your body''s innate healing potential.', NULL, 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1314/meagan-carsience-TpG2TBiclik-unsplash_gy44ix_exacii', true, '2025-07-11 22:37:03')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('the-science-behind-breath-holding-amp-over-breathing', 'The Science Behind Breath Holding &amp; Over Breathing', 'Discover the physiological changes that occur when you hold your breath or over breathe. Understand the connection between your breathing patterns and overall health.', NULL, 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1314/jeremy-bishop-ewkxn5capa4-unsplashjpg-jmha5thr', true, '2025-08-03 23:45:54')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('breathe-your-way-to-health-the-power-of-wim-hofs-breath-holding-technique', 'Breathe Your Way to Health: The Power of Wim Hof''s Breath Holding Technique', 'Explore the health benefits of breath holding, the chemical changes it induces, and how the Wim Hof Method harnesses these for stress reduction.', NULL, 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1314/mark-basarab-1otukd-8svc-unsplashjpg-parnvgwq', true, '2025-08-03 23:48:45')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('the-harmonious-connection-between-breathwork-music-and-trance', 'The Harmonious Connection Between Breathwork, Music, and Trance', 'This article explores the fascinating intersection of breathwork, music, and trance, and how they can be combined for enhanced emotional and physical health.', NULL, 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1314/IMG_0349_dxl0mm', true, '2025-08-04 02:04:53')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('the-magic-of-breathwork-and-music-a-journey-into-trance', 'The Magic of Breathwork and Music: A Journey into Trance', 'Explore the powerful combination of breathwork and music, and learn how it can lead to trance states for deep healing and personal growth.', NULL, 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1314/jeremy-bishop-ewkxn5capa4-unsplashjpg-jmha5thr', true, '2025-08-04 02:09:10')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('the-rise-of-mens-groups-fostering-emotional-intelligence-and-personal-growth', 'The Rise of Men''s Groups: Fostering Emotional Intelligence and Personal Growth', 'An exploration of men''s groups, their role in promoting emotional intelligence, and fostering personal growth. Understand the significance of these groups in redefining masculinity.', NULL, 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1314/meagan-carsience-TpG2TBiclik-unsplash_gy44ix_exacii', true, '2025-08-04 02:13:10')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('the-tranquil-symmetry-breathwork-meets-music', 'The Tranquil Symmetry: Breathwork Meets Music', 'Unravel the unique combination of breathwork and music, how it can induce a trance, and its potential for deeper self-understanding and healing.', NULL, 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1314/damiano-baschiera-d4feocyfzam-unsplashjpg-ppzomws0', true, '2025-08-04 02:15:48')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('sessions-now-available-on-the-surf-coast', 'Sessions now available on the Surf Coast', 'From February 2026, I will be offering psychotherapy and one-to-one breathwork sessions in Lorne on the Surf Coast of Victoria.', NULL, 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1314/andrew-st-lawrence-w0v2678-r-w-unsplash_vqkhgz', true, '2026-01-02 04:59:36')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('harness-the-power-of-breath-for-relaxation-and-healing', 'Harness the Power of Breath for Relaxation and Healing', 'This article explores the science-backed benefits of mindful breathing for relaxation and healing, especially for those recovering from central nervous system trauma.', NULL, 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1314/Brunswick_Room_w89mkd', true, '2026-01-05 00:57:39')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

INSERT INTO articles (slug, title, excerpt, external_url, image_url, published, published_at)
VALUES ('can-ai-do-therapy-and-is-it-an-existential-risk', 'Can AI do therapy and is it an existential risk?', 'Holotropic breathwork, a therapy technique often used in mental health treatment programs, is a unique method to achieve heightened self-awareness and personal growth. It employs a combination of rapid, deep breathing, evocative music, and focused bodywork to stimulate the psyche and bring about emotional release and psychological insight.', NULL, 'https://res.cloudinary.com/feelbettr/image/upload/q_72/f_auto/w_1200/1314/florian-van-duyn-dm-qxdynoec-unsplashjpg-sprqsbls', true, '2026-03-06 01:52:30')
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  external_url = EXCLUDED.external_url,
  published = EXCLUDED.published,
  image_url = COALESCE(articles.image_url, EXCLUDED.image_url);

