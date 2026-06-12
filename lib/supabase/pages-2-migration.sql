-- ─── pages-2.sql → Markdown Migration ────────────────────────────────────────
-- Converts rich HTML content from the legacy feelbettr CMS (pages-2.sql)
-- into clean markdown for the pages table. Uses ON CONFLICT DO UPDATE to
-- overwrite the sparse stubs seeded by cms-schema.sql.

insert into pages (slug, title, meta_description, content) values

('home', 'Home',
'Melbourne & Surf Coast psychotherapy, holotropic breathwork, and men''s groups — Wildheart Psychotherapy.',
$md$# Wild Heart Psychotherapy

I am a Melbourne & Surf Coast based Psychotherapist, Holotropic Breathwork practitioner and Men''s Group facilitator.

I work from a therapy clinic on Sydney Road in [Brunswick](/finding-us/brunswick) and also offer psychotherapy and individual breathwork sessions in [Lorne on the Surf Coast](/finding-us/lorne) of Victoria. I support people across a wide range of areas, including anxiety, depression, and experiences of spiritual emergence or emergency.

My work is informed by Gestalt, Process Oriented, and Transpersonal approaches, with roots in Traditional Chinese Medicine. My approach is awareness-based, using the breath and body as central tools to support psychological healing and personal growth. I firmly believe that we cannot simply think our way through crisis — we need to learn how to come into relationship with them.

[Read more about my work →](/about)

---

> In the middle of the road of my life, I awoke in a dark wood, where the true way was wholly lost.
>
> — David Whyte

---

## Services and Modalities

### [Psychotherapy & Counselling](/services/psychotherapy-and-counselling)

I offer one-on-one psychotherapy and counselling in Brunswick and Lorne. My work draws on Gestalt, Process-Oriented, and Transpersonal approaches, using mind, body, and awareness-based practices to support psychological healing, personal growth, and more fulfilling relationships.

---

### [Holotropic Breathwork](/services/holotropic-breathwork)

I offer Holotropic Breathwork sessions and workshops that use guided breathing to help people process emotions, increase self-awareness, and support personal growth. Sessions are experiential, safe, and tailored to each person''s needs.

---

### [Men''s Groups](/services/mens-groups)

I facilitate ongoing Men''s Groups to support personal insight, relational growth, and emotional resilience. These groups provide a safe space for men to explore their inner world, build authentic connections, and deepen self-awareness.

---

## Two Practice Locations

Sessions are available in two locations in Brunswick and Lorne on the Surf Coast of Victoria.

**Brunswick Practice**
503 Sydney Rd, Brunswick VIC 3056

[Find the Brunswick practice →](/finding-us/brunswick)

**Lorne Practice**
6/5 Cora Lynne Crt, Lorne VIC 3232

[Find the Lorne practice →](/finding-us/lorne)
$md$),

('about', 'About',
'About Anthony Olsen — Melbourne & Surf Coast psychotherapist and holotropic breathwork facilitator.',
$md$# About

Anthony Olsen is a Melbourne and Surf Coast-based Psychotherapist, Holotropic Breathwork practitioner and Men''s Group facilitator.

His practice integrates Gestalt, Process-Oriented, and Transpersonal psychology with Traditional Chinese Medicine foundations, with an emphasis on awareness-based work using breath, body, and relational experience as therapeutic tools.

Active in healing and personal development since the mid-1990s.

Anthony is a certified Holotropic Breathwork facilitator (2013), trained under Tav Sparks in the Grof Transpersonal method. He has facilitated men''s groups since 2013 and is a long-term group member.

He also developed [Music for Breathwork](https://musicforbreathwork.com/), a platform containing 1600+ tracks tagged for breathwork applications.

## Locations

- **Brunswick:** 503 Sydney Rd, Brunswick 3056
- **Lorne:** 6/5 Cora Lynne Crt, Lorne 3232
$md$),

('services/psychotherapy-and-counselling', 'Psychotherapy & Counselling',
'One-on-one psychotherapy and counselling in Brunswick and Lorne — Gestalt, Process-Oriented, and Transpersonal approaches.',
$md$# Psychotherapy & Counselling in Brunswick and the Surf Coast

I offer one-on-one counselling and psychotherapy sessions in Brunswick and Lorne, working with people who are ready to develop greater awareness, process unresolved experiences, and build better relationships.

> Grief is not a feeling it is a capacity. It is not something that disables you, we are not on the receiving end of grief we are on the practising end of grief.
>
> — Stephen Jenkinson

[Book a session →](/appointments)

---

## How I Work

My approach draws from Gestalt, Process-Oriented, and Transpersonal methods. These are experiential sessions that include your mind, body, and spirit in addressing whatever you bring. Rather than just talking, we might work with breathing, body awareness, dreams, or other ways of exploring what''s present for you.

Each session is shaped by what emerges and what feels most helpful in the moment. Some people find this different from traditional talk therapy, and that''s intentional — I believe healing happens through the whole person, not just through thinking about problems.

---

## What People Bring to Sessions

I work with people experiencing:

- Anxiety and depression
- Trauma and its effects
- Grief and loss
- Physical pain that seems connected to emotional experiences
- Relationship patterns they want to understand or change
- A desire for psychological integration
- Interest in shadow work — exploring parts of themselves they''ve pushed away
- Simply wanting to explore their inner world more deeply
- Spiritual emergence and emergency
- Eco-therapy and creating / enhancing connection to nature

All of these areas are supported at both our Brunswick and Lorne clinics.

---

## About the Process

Sessions are experiential, which means we work with what''s actually happening in the present moment. This might include noticing body sensations, following your breath, exploring a feeling, or working with imagery. I pay attention to the whole person — not just your words, but how you sit, breathe, and move through the world.

Some sessions involve breathwork. Others focus on dialogue between different parts of yourself. We might explore dreams, work with creative expression, or simply sit with what''s present. The approach adapts to what you need.

---

## Location and Community

**Brunswick:** [503 Sydney Road](/finding-us/brunswick), near the corner of Blythe Street. Two-hour parking is available on Sydney Road — please check clearway times to avoid fines.

**Lorne:** [Our Surf Coast clinic](/finding-us/lorne) is minutes from the Erskine River rainforest and the beach, with ample parking nearby.

I see clients from across Melbourne''s inner north, including Brunswick, Fitzroy, Carlton, and Coburg, as well as from the Surf Coast — Torquay, Anglesea, Aireys Inlet, Lorne, Colac, and surrounding areas.

---

## Getting Started

If you''re curious about this approach or think it might be helpful for what you''re experiencing, we can start with a conversation. I''m happy to discuss what you''re looking for and whether working together makes sense.

[Book a session →](/appointments) | [Free 20-minute introductory chat →](/book/intro)
$md$),

('services/holotropic-breathwork', 'Holotropic Breathwork',
'Holotropic Breathwork workshops and one-on-one sessions in Melbourne — certified Grof Transpersonal facilitator.',
$md$# Holotropic Breathwork

> A powerful breathing technique designed to support the emergence of transformative non-ordinary states of consciousness.

Holotropic Breathwork is a guided breathing practice that supports emotional release, self-awareness, and personal growth. It can complement psychotherapy and psychedelic therapy integration.

I run workshops and one-on-one sessions in [Melbourne](/finding-us/brunswick) and the [Surf Coast](/finding-us/lorne), creating a safe space for self-exploration, emotional release, and personal growth.

Holotropic Breathwork was developed by Stanislav and Christina Grof in order to facilitate the healing potential of non-ordinary states of consciousness — primarily via the manipulation of the breath.

Given the right setting, it is possible to powerfully alter your normal waking consciousness and allow yourself to become immersed within a rich and diverse inner world of experience. The processing of this experience helps the breather to strengthen self-awareness, process trauma and other unresolved life experiences, and build a dialogue between the waking consciousness and what Stan Grof coined the Inner Healer (Inner Healing Mechanism).

It is this inner healer that helps to catalyse our movement towards wholeness (the literal meaning of the word Holotropic), by providing inner experiences that can thematically represent important psychological, spiritual, emotional and physical issues that may be present within us. When these elements are processed, we allow for the possibility of transformation of our fears, anxieties and other tensions.

Each session uses guided breathing, music, and a safe container to help you explore inner experiences, process unresolved emotions, and deepen self-awareness. Whether in a group workshop or one-on-one, sessions are tailored to your needs and paced to support personal insight and integration.

---

## My Holotropic Breathwork Experience

Holotropic Breathwork has been a fundamental influence on how I approach all aspects of my life and since the late 1990s it has been the primary tool I have used in order to gain greater insight into my life.

My work with Alf Foote was foundational in terms of demonstrating the transformative potential of the breath. From 2006 to 2013 my training to become a Holotropic Breathwork facilitator via [GTT](http://holotropic.com/) further grounded my understanding of the healing power of non-ordinary states of consciousness.

Since 2013 I have been running Holotropic Breathwork Workshops in Melbourne with [Ruth Langford](https://melbournebreathwork.com/practitioners/ruth-langford) and others and I am also a senior staff member of the official [Grof Transpersonal Training](https://www.holotropic.com) for Holotropic Breathwork.

---

## What is Holotropic Breathwork?

Holotropic Breathwork is conducted in a very specific set and setting. On the outside it may look like many other forms of breathwork — however there are some key differences.

### The Technique is Deceptively Simple

The key instruction is to "Breathe a little bit faster and a little bit deeper — ensuring that your breathing is continuous and without pause." How you breathe is paradoxically perhaps the least important element in the session.

### Always Done with a Sitter

Holotropic Breathwork is a relational modality — at its core is the understanding that we heal through relationship with the other. The sitter ensures the process can unfold in a safe and undisturbed way, offers support if required, and helps ensure the breathwork process itself is completed as much as possible in the moment.

### Non-Directive

The breather is the expert in their process. The facilitator''s role is simply to provide a container wide enough and deep enough to hold the experience. There is no hierarchy of experience — grand, transcendent experiences are just as important as difficult, emotional, or painful ones.

### Music as a Key Element

The music is played at a high volume and follows the arc of the session like a wave:

- **Initial phase:** Intense, rhythmic music designed to entrain the brain
- **Peak phase:** More emotional music aimed at facilitating breakthrough and release
- **Closing phase:** Gentle, prayerful and meditation music

A Holotropic Breathwork session typically runs for 2.5 to 3 hours.

You can find a curated list of music used in sessions on [Music for Breathwork](http://www.musicforbreathwork.com).

---

## One-on-One Breathwork Sessions

In some cases we may be able to do shorter one-on-one holotropic inspired breathwork. This differs slightly from a workshop setting but is suitable as a form of release and exploration in conjunction with ongoing psychotherapeutic support.

**What is the process?**

One-on-one breathwork unfolds in 3 steps:

**Step 1 — Introduction (1 hour)**
A psychotherapy session to discuss breathwork and share your story about what brings you to it.

**Step 2 — Breathwork session (3 hours)**
Includes a 2-hour breathwork process, pre-chat, and integration work after the session.

**Step 3 — Integration (1 hour)**
A follow-up session to deepen the insight and awareness gathered during the breathwork.

### Pricing

- Introductory session: $160 (50 minutes)
- Breathwork Session: $395 (3 hours)
- Integration Session: $160 (50 minutes)

### Cancellation Policy

Introductory and integration sessions: $160 cancellation fee within 24 hours.
Breathwork sessions: $200 cancellation fee within 72 hours of the session.

[Book a session →](/appointments)
$md$),

('services/mens-groups', 'Men''s Groups',
'Experiential men''s groups in Melbourne — personal and relational growth, emotional intelligence.',
$md$# Experiential Men''s Groups

> Deep listening circles aimed at providing a space for men to develop intimacy and greater relational awareness.

It''s not an understatement to suggest that the last 20 years has seen a huge change in awareness of the role of men in society.

Men are often being called to extend and deepen the way they are in the world, and explore ways to embody what might be called a more healthy masculinity. These groups have been created to provide a safe and supportive container for this exploration.

---

## What Are They and When Are They Held?

Series of groups are held throughout the year around specific topics such as The Mature Masculine Archetypes, The Hero''s Journey, The Family System, Work and more. They are experiential sessions that may include meditation, music, movies, ritual and deep listening, aimed at providing an opportunity for like-minded men to meet and share life experience in a non-judgemental forum.

Each session follows this format:

- Introduction of the topic
- Reflective process exploring the topic — through music, movie or meditation
- Small group sharing
- Larger group discussion of each participant''s life experience
- General discussion on the topic before the close

Participants are encouraged to share from their personal experience and to avoid theory and philosophy as a way of engaging in the topic. When we are able to stay as close to our experience as possible it opens up the possibility of creating more intimate relationships around us.

These sessions are not therapy groups. The circles are held in a deeply democratic fashion with the belief that each participant has an important contribution to make. Each contribution is respected and listened to in a way that ensures the group remains open to a diverse range of experiences.

[View upcoming men''s groups →](/workshops-and-events)
$md$),

('services/retrievals-and-dispatches', 'Retrievals & Dispatches',
'Shamanic-informed psychological work for navigating difficult states — Wildheart Psychotherapy.',
$md$# Dispatching, Retrieving & Reconnecting

> When we find ourselves in the depths of pain, it can be easy for our systems to feel overwhelmed. In these moments of being broken open, it can seem as though we''ve lost connection to who we truly are. We may feel untethered, abandoned, and as if a vital part of ourselves is missing.

In profound places of pain and distress, our psyche and soul sometimes draw in external forces as a means of support. These external influences are what Internal Family Systems refers to as "Unattached Burdens" or what a Shaman might call attachments.

Put simply, an Unattached Burden is an element within the system that does not originate from within the system. In response to grief, trauma, and loss these external forces may offer a sense of relief or stability in the moment. However, over time, these burdens can drain our systems and obscure our path back to wholeness.

Through a compassionate and affirming process of reconnection — to self, soul, spirit, and inner wholeness — it becomes possible to release these burdens. By doing so, we reclaim our inner wisdom and rediscover the strength and clarity that has always resided within us.

---

## Retrieving

Sometimes our psyche chooses another path: exiling feelings that are too overwhelming to process. This creates fierce boundaries and protections around the painful parts of ourselves. While these strategies may offer temporary stability, they often leave the system operating with reduced energy, a sense of unnamed and unknown loss, and in some cases can be experienced as dissociation.

To work with these conditions, it is essential to approach these protective mechanisms with deep respect, honouring the extraordinary work they''ve done to preserve the system''s sense of safety. Healing begins by gently engaging with the protective parts of the psyche, understanding their fears, and updating their awareness of the inner system''s current state.

These protectors are often frozen in time, locked at the moment of their creation. The process of healing involves "unfreezing" these protections, reclaiming the exiled emotions they guard, and reintegrating them into the system.

---

## Reconnecting

A central aspect of any healing journey involves the reintegration of the parts of ourselves that were exiled and the repair of any vulnerabilities that allowed external influences to take root within the system.

In Holotropic Breathwork, this transformative process is guided by "The Inner Healer." In Internal Family Systems, it is referred to as "the capital-S Self" — others may recognise it as the soul or core essence. Regardless of the terminology, the principle remains the same: every individual possesses an inherent capacity to heal.

---

## What Do Sessions Look Like?

These sessions involve delving into our inner landscape and cultivating a deeper understanding of its underlying dynamics. This is accomplished by accessing light trance states and non-ordinary states of consciousness, facilitated through a blend of conscious breathing, somatic awareness, guided visualisation, and inner dialogue.

Sessions draw significant inspiration from the Internal Family Systems (IFS) model and may also take on a shamanic quality, blending therapeutic principles with a deeper, more spiritual exploration of the self.

Participants often experience deep and embodied feelings of support and connection and often report feeling relief — particularly after the release of unattached burdens.

Sessions are 80 minutes long and cost $240.

[Book a session →](/appointments)
$md$),

('services/psychedelic-integration', 'Psychedelic Integration',
'Psychedelic integration support — working with experiences involving psilocybin, MDMA, and other substances.',
$md$# Psychedelic Integration

> Integrating non-ordinary states of consciousness

It''s no secret that psychedelics have been undergoing a resurgence in popular culture over the last decade. New science has been revealing what psychonauts through the ages have known — that psychedelic and non-ordinary states have an enormous power to change, shape, and re-frame our lives. The question remains: what do we do with the experience?

---

## The Three Components of a Psychedelic Session

Any experience involving non-ordinary states of consciousness can be broken into 3 parts:

1. **Preparation**
2. **Session**
3. **Integration**

Without the proper attention to any of these three parts there is a much greater potential for fragmentation, de-stabilisation, or what is often referred to as a bad trip.

### Preparation

The preparation includes gathering the required knowledge for the experience and laying down the ground rules for what is possible or desired in the session. Having a clear intention can help the mind to focus on the reason why you have launched into the sometimes confusing psychedelic landscape.

### Session

The session itself is often seen as the focus for the therapy but it is ultimately just a part of it. The real benefit of working with non-ordinary states is found in what happens afterwards — how we are able to put the insight gained during the session into practice.

### Integration

Integration is essentially the process of embodying the wisdom and insight gained during the session. Questions that may be helpful:

- What supports do you have to work through the material that arose in the session?
- Do you have people close to you that you can talk to?
- Do you have daily practices such as meditation, journalling, or other physical practices?
- Do you have psychotherapists to work with after the session?
- Have you allowed for enough time and space?

---

## How Psychotherapy Supports Integration

### Sharing the Story

The psychedelic experience can often be confusing and hard to make sense of. Being listened to in a non-directive and curious way can allow the really important parts of the experience to come to the surface, supporting the individual to find their own meaning and create "touch stones" that help with the integration.

Sharing the story is less about finding a narrative for the experience and more about uncovering themes and plumbing the depths of the feeling of the experience. In the words of Tav Sparks, *"Feeling is the royal road to healing."*

### Somatic Exploration

After a breathwork or psychedelic session we can work with the body using breath, guided imagery and felt sensation to help bring any parts of the experience into a point of completion. The psyche is always trying to move us towards wholeness.

### Holotropic Breathwork

In some cases the psychedelic experience may be somewhat incomplete and more non-ordinary states work may be an important part of the integration process. Holotropic Breathwork can often help the breather to resolve or bring to a point of completion the material that was opened up to in the psychedelic session.

---

## Integrating a Difficult Trip

From a Holotropic Breathwork or transpersonal lens there may be no such thing as a "bad trip" — but there are most definitely experiences that are *extremely* difficult to experience and integrate.

Any non-ordinary state of consciousness has the potential to help us heal. The material that emerges can be seen as the psyche attempting to move towards wholeness, regardless of the quality or type of material emerging.

Integrating difficult trips can be made even more challenging because of the shame and guilt the journeyer may experience after the session. However if we can approach the difficult experience with an open and curious mind, it may in fact yield more benefit than the classical cosmic journey.

**Disclaimer:** Due to the legal status of psychedelic assisted therapy, Anthony is not available as a guide for psychedelic therapy sessions. If you would like support in working with psychedelic integration, please [get in touch](/contact) or book an appointment below.

[Book a session →](/appointments)
$md$),

('services/couples-breathwork-sessions', 'Couples Breathwork Sessions',
'Breathwork for couples — expanding connection, communication, and understanding.',
$md$# Holotropic Breathwork for Couples

> Combining Holotropic Breathwork with ongoing couples work to expand and deepen connection, communication and understanding

Couples therapy is a powerful tool that helps couples improve their relationship by providing them with the tools and skills they need to communicate effectively, resolve conflicts, and build a stronger bond. However, for couples who are looking for a more transformative and holistic approach to therapy, Holotropic Breathwork is an exciting option to consider.

Holotropic Breathwork is a form of therapy that combines deep breathing techniques, music, and bodywork to access the deeper parts of the psyche. It was developed by Stanislav Grof, a Czech psychiatrist who spent decades researching non-ordinary states of consciousness, and it is based on the idea that the human psyche has the innate ability to heal itself.

When combined with couples therapy, Holotropic Breathwork can help couples access deeper levels of awareness and understanding, leading to greater self-awareness and improved communication. Here are some of the ways that couples therapy combined with Holotropic Breathwork can benefit your relationship:

**1. Increased emotional intimacy**

Holotropic Breathwork can help couples connect on a deeper emotional level, allowing them to access feelings and emotions that may be difficult to articulate. By engaging in this practice together, couples can create a safe and supportive environment where they can explore their feelings and connect with each other in a more meaningful way.

**2. Greater self-awareness**

Through Holotropic Breathwork, couples can gain a greater understanding of their own thoughts, feelings, and behaviors. This increased self-awareness can help them identify patterns in their relationship that may be holding them back and make the necessary changes to improve their relationship.

**3. Improved communication**

Holotropic Breathwork can help couples improve their communication skills by providing them with a deeper understanding of their own emotions and needs. This increased awareness can lead to more open and honest communication, which can strengthen the bond between partners and reduce conflict.

**4. Deeper empathy**

By experiencing non-ordinary states of consciousness together, couples can develop a greater sense of empathy for each other. This can help them understand each other''s perspectives and feelings on a deeper level, leading to a more compassionate and supportive relationship.

---

## What is Involved with Holotropic Breathwork for Couples Therapy?

Holotropic Breathwork for couples therapy includes 3 sessions:

**Session 1 — Introduction and preparation (50 minutes)**

During the integration and preparation session we will discuss the various themes that are emerging in the relationship and how they are impacting the relationship. We will also discuss the theory and practice of Holotropic Breathwork and how breathwork may support the working through of those themes.

**Session 2 — The breathwork session day (10am to 4:30pm)**

This is a whole day of breathwork where you will take part in two breathwork sessions. Each breathwork session will run for 2.5 hours and you will have an opportunity to sit for your partner while they breathe and they will sit for you while you breathe. The process of sitting in breathwork is often described as being just as powerful as the breathwork process itself.

There will be an opportunity to do integration work on the day after each session as well as time for lunch.

**Session 3 — Integration (50 minutes)**

The integration phase for any non-ordinary states of awareness work is crucial as it helps us to make sense of the experience and to understand how we might be able to bring the wisdom and insight from the experience into our daily lives and importantly into our relationships.

---

## Who is This Suited For?

While breathwork may well be a powerful tool for developing self-awareness it is not always the right choice for some individuals. Ideally couples who attend this couples breathwork work are already in some form of couples or individual counselling and have a degree of communication skills within the relationship.

A key factor of suitability for couples doing this work is that there are no occurrences of domestic violence nor the threat of such violence. For non-ordinary state work to be truly supportive the container the work is performed in must have some capacity for each party to take ownership of their experience and that there be limited projection onto the other of that experience. If you are interested in doing this work but are not sure if this is right for you, you may like to book a [free 20-minute introductory phone call](/book/intro) where we can discuss those concerns.

---

## Pricing Structure

The cost of the whole package including introduction, session and integration is $1,200.

Bookings can be made for the first introductory session via the [appointments page](/appointments). At the end of that session we will book in a time to complete the rest of the sessions.

### Cancellation Fee

Introductory and integration sessions have a standard $160 cancellation fee within 24 hours.

Breathwork sessions have a $200 cancellation fee within 72 hours of the session.

---

## About Anthony Olsen

My work is informed by Gestalt, Process Oriented, and Transpersonal psychotherapy, with roots in Traditional Chinese Medicine. It is awareness-based and attends to breath, body, and relational experience as central elements of the therapeutic process. This work supports psycho-spiritual integration, meaningful relationships, and a deeper sense of connection to self and others.

[Book a session in Brunswick →](/book/brunswick) | [Book a session in Lorne →](/book/lorne)

Or if you''d like to find out if we are a good fit, feel free to book a [free 20-minute exploratory call](/book/intro).
$md$),

('contact', 'Contact',
'Contact Wildheart Psychotherapy — book a session or enquire about services.',
$md$# Contact Wild Heart Psychotherapy

If you''d like to book a session, ask a question, or simply explore whether therapy here feels like the right fit, you''re welcome to get in touch at any time.

You can call directly on **0416 277 063** for a quick conversation, or use the contact form below to send a message at your convenience.

I''ll usually get back to you within one business day. Whether it''s to book a full session, arrange an introductory chat, or clarify anything before starting, I''m here to help make the process as simple and supportive as possible.

---

## Getting Here

Wild Heart Psychotherapy is located at **503 Sydney Road, Brunswick**, in the heart of Melbourne''s inner north. You''ll find us near the corner of Sydney Road and Blyth Street, surrounded by cafes, small shops, and the vibrant energy that makes Brunswick such a welcoming place.

- **Tram:** Route 19 stops almost directly outside at Stop 22 (Blyth St/Sydney Rd)
- **Train:** Short walk from Anstey Station on the Upfield line
- **Bus:** Routes along Blyth Street and nearby Nicholson Street
- **Parking:** 1–2 hour street parking available on Sydney Road; longer-term parking in nearby residential streets — check signs for time limits

Please aim to arrive at your scheduled time, as waiting areas are limited.

[View full directions →](/finding-us/brunswick)
$md$),

('finding-us/brunswick', 'Finding Us — Brunswick',
'How to find the Brunswick practice — 503 Sydney Rd, Brunswick VIC 3056.',
$md$# Wild Heart Psychotherapy in Brunswick

Wild Heart Psychotherapy is located at **503 Sydney Road, Brunswick**, in the heart of Melbourne''s inner north. This vibrant and accessible location is ideal for anyone seeking psychotherapy, counselling, or inner exploration in a warm and welcoming space.

I also offer [counselling sessions in Lorne, Surf Coast](/finding-us/lorne).

---

## Location

**Address:**
503 Sydney Road, Brunswick VIC 3056

**Near:** Corner of Sydney Road and Blyth Street, surrounded by local cafes, shops, and community services.

---

## Getting Here

- **Tram:** Route 19 — stop directly outside (Stop 22 – Blyth St/Sydney Rd)
- **Train:** Short walk from Anstey Station on the Upfield line
- **Bus:** Routes along Blyth Street and nearby Nicholson Street
- **Parking:** Limited 1–2 hour street parking on Sydney Road; longer options in residential side streets (check signage)

---

## About the Space

The practice room is designed to feel calm, grounded, and welcoming:

- Comfortable seating for individual therapy
- Warm natural lighting
- Climate control for all seasons
- A peaceful atmosphere amidst the lively Brunswick surroundings

---

## Why Brunswick?

Brunswick is a diverse, culturally rich area known for its community-minded feel and accessibility. Being located here makes it easier for people from **Coburg, Carlton, Northcote, Thornbury, Fitzroy, and the Melbourne CBD** to attend sessions without the stress of long commutes.

---

## On Arrival

1. Look for the **503 Sydney Road** entrance, near Blyth Street
2. You''ll find clear signage for Wild Heart Psychotherapy inside the building
3. Please arrive at your scheduled time, as the waiting area is limited

If you have any questions about getting to the practice, parking, or accessibility needs, feel free to get in touch before your appointment.

[Book a session in Brunswick →](/book/brunswick)
$md$),

('finding-us/lorne', 'Finding Us — Surfcoast (Lorne)',
'How to find the Lorne practice on the Surf Coast — 6/5 Cora Lynne Crt, Lorne VIC 3232.',
$md$# Wild Heart Psychotherapy in Lorne

> "If we surrendered to earth''s intelligence we could rise up rooted, like trees."
>
> — Rainer Maria Rilke

Psychotherapy and individual breathwork sessions are now available in Lorne on the Surf Coast of Victoria.

---

## Location

**Address:**
6/5 Cora Lynne Crt, Lorne VIC 3232

The Lorne clinic is minutes from the Erskine River rainforest and the beach, with ample parking nearby.

---

## Who This Location Serves

The Lorne clinic is convenient for people from the Surf Coast and surrounding areas, including:

- Torquay
- Anglesea
- Aireys Inlet
- Lorne
- Colac
- Apollo Bay
- Geelong

---

## Sessions Available

- Individual psychotherapy and counselling
- One-on-one Holotropic Breathwork sessions
- Telehealth sessions also available

[Book a session in Lorne →](/book/lorne)
$md$)

on conflict (slug) do update set
  title = excluded.title,
  meta_description = excluded.meta_description,
  content = excluded.content,
  updated_at = now();
