# SOIL — Creative Asset Guide
### *How to create ultra-real images & videos with AI*

---

> Duke, this is the guide I promised.
> No fluff — just the tools, the anatomy of a great prompt, and examples you can
> run today. Every single thing in here is what I'd use myself.

---

## Your Toolkit

| Tool | Best for | Free? |
|---|---|---|
| **Midjourney** | Editorial images, campaign art, atmosphere | Paid (~$10/mo) — midjourney.com |
| **Flux (via fal.ai)** | Ultra-photorealistic people & products | Pay-per-use — fal.ai |
| **Ideogram** | Posters & images with readable text baked in | Free tier — ideogram.ai |
| **Adobe Firefly** | Product mockups, background removal, textures | Free with Adobe — firefly.adobe.com |
| **Runway Gen-4** | Short cinematic video clips, image-to-video | Free tier — runwayml.com |
| **Kling AI** | Longer video, fabric & clothing motion | Free tier — klingai.com |
| **Sora (OpenAI)** | High-fidelity video, complex scenes | ChatGPT Plus — sora.com |
| **Pika** | Quick social video, product motion | Free tier — pika.art |
| **CapCut** | Editing, colour grade, final assembly | Free |

**Where to start:** Midjourney for images, Runway for video. Master those two first.

---

## Part 1 — How to Build a Prompt

Every great AI image prompt is built in layers. The more intentional each layer,
the more real and controlled the result. Here's the anatomy — and a real example
to show you exactly how it works.

---

### The Seven Layers

```
1. Shot type       — what kind of image is this?
2. Main subject    — what is the hero element?
3. Placement       — where is it, how is it sitting?
4. Supporting cast — what else is in frame?
5. Atmosphere      — what is the mood / moment?
6. Light           — where is it coming from, what does it feel like?
7. Style tags      — what genre / references / technical finish?
```

---

### A Real Example — SOIL Branded Merchandise

Here is a prompt I wrote and the image it produced. Study the layers.

![SOIL tote bag, coffee cup, notebook and stationery on a park bench — generated with the prompt below](assets/creative-guide/example-1-soil-tote.jpg)

**The prompt:**
```
close-up lifestyle product shot of a plain canvas eco bag casually placed 
on a park bench, main focus on the eco bag, naturally and loosely positioned, 
an open book, a drink cup, pens and stationery casually scattered nearby, 
with the branding word 'SOIL' in brown letters on the products, 
relaxed everyday atmosphere, candid outdoor moment, 
soft natural sunlight filtering through trees, gentle shadows, 
realistic textures, shallow depth of field, 
park greenery softly blurred in the background, 
natural composition, not staged, 
lifestyle photography, editorial product photography, film still aesthetic, 
highly realistic, clean and refined mood, no people visible
```

**Breaking it down by layer:**

| Layer | What was written |
|---|---|
| Shot type | `close-up lifestyle product shot` |
| Main subject | `plain canvas eco bag` |
| Placement | `casually placed on a park bench, naturally and loosely positioned` |
| Supporting cast | `open book, drink cup, pens and stationery casually scattered nearby` |
| Atmosphere | `relaxed everyday atmosphere, candid outdoor moment` |
| Light | `soft natural sunlight filtering through trees, gentle shadows` |
| Style tags | `lifestyle photography, editorial product photography, film still aesthetic, highly realistic, clean and refined mood` |
| Exclusion | `no people visible` |

**What makes this prompt work:**
- `naturally and loosely positioned` — one phrase that kills staged, stiff composition
- `casually scattered nearby` — tells the model props are secondary, not the hero
- `'SOIL' in brown letters on the products` — brand name on every object, specified colour
- `not staged` — reinforces the candid feel a second time
- `no people visible` — clean exclusion so the product stays the focus

---

### The Formula to Copy

Take this structure and swap in your subject:

```
[shot type] of [main subject], [placement + how it sits],
[supporting props] casually nearby,
with the branding word 'SOIL' [colour] on the products,
[atmosphere — the moment / feeling],
[light — source, direction, quality],
realistic textures, shallow depth of field,
[background treatment],
natural composition, not staged,
[2–3 style references],
highly realistic, [mood], no people visible
```

---

## Part 2 — Image Types

---

### 2A. Lifestyle Product Shots

These are your bread and butter — the images that sell the Studio.
The goal is to make the product feel lived-in and real, not catalogue.

**Different settings to rotate through:**

**Morning kitchen / home:**
```
close-up lifestyle product shot of a SOIL branded ceramic mug 
resting on a wooden kitchen counter, morning light, 
a folded linen napkin and a small plant beside it, 
with the branding word 'SOIL' in burnt umber letters on the mug, 
quiet morning atmosphere, 
warm golden sunlight from a window to the left, gentle rim shadow, 
realistic textures, shallow depth of field, 
background softly blurred, natural composition, not staged, 
lifestyle photography, editorial product photography, film still aesthetic, 
highly realistic, clean warm mood, no people visible
```

**Flat lay on textured surface:**
```
top-down flat lay product shot of a handwoven earth-tone SOIL tote bag 
laid flat on aged terracotta tile, 
a dried palm leaf, small stones and a folded card scattered nearby, 
with the branding word 'SOIL' in gold letters on the bag, 
calm and considered atmosphere, 
diffused natural light from above, minimal shadows, 
realistic textures, pin-sharp focus across the whole frame, 
natural composition, editorial still life photography, 
highly realistic, clean and refined mood, no people visible
```

**Carried / in-use (no face):**
```
close-up lifestyle shot of a hand holding a SOIL branded canvas tote bag, 
walking on a sunlit stone pavement, 
lower half of the body only, linen trousers, open-toe sandals, 
with the branding word 'SOIL' in brown letters on the bag, 
warm summer afternoon light, soft moving shadows, 
shallow depth of field, pavement blurred, 
street lifestyle photography, film still aesthetic, 
highly realistic, relaxed refined mood
```

---

### 2B. Campaign & Editorial

Hero images for the website, social, and print. The energy should feel like
it belongs in a magazine, not on a product page.

**Landscape / atmosphere:**
```
wide cinematic shot of a vast open savanna at golden hour, 
ancient baobab tree alone on cracked red earth, 
heavy amber sky, long shadows, haze in the air, 
no people, no text, completely still, 
shot as if on 35mm film, warm colour grade, natural grain, 
editorial landscape photography, monumental and sacred feeling, 
highly realistic --ar 16:9
```

**Person in SOIL clothing:**
```
full length editorial shot of a young West African man 
in a handwoven earth-tone agbada, 
standing still in a dusty open field, 
looking slightly off-camera, calm and unhurried, 
golden hour light from behind, warm halo around the figure, 
low camera angle, wide angle, 
natural grain, warm colour grade, 
Kenyan Vogue editorial aesthetic, 
highly realistic, not staged --ar 4:5
```

**Close detail / texture:**
```
extreme close-up of the weave pattern of a handwoven earth-tone fabric, 
threads visible in sharp detail, 
warm afternoon side light catching the texture, 
rich shadows between threads, 
macro product photography, editorial textile photography, 
highly realistic, warm and tactile --ar 1:1
```

---

### 2C. Posters & Brand Art

For the website, the store, social, or print.

**For images without text — Midjourney:**
```
cinematic poster composition, a lone eagle in slow descent 
over an African savanna at golden hour, 
wings fully spread, seen from below against a vast amber sky, 
deep rich earth tones, molten gold light, 
dust particles in the air, 
editorial fashion meets African mythology, 
shot on large format film, grain, weight, stillness, 
highly realistic --ar 2:3
```

**For posters with text baked in — use Ideogram:**
```
minimalist brand poster, bold aged serif text reads 
"BEFORE THE RISE — THE ROOTS" centered vertically, 
deep burnt umber background, subtle cracked-earth texture, 
off-white type, thin gold ruled line border, 
clean, sacred, editorial, SOIL brand aesthetic --ar 2:3
```

> **Ideogram is the only tool that reliably renders readable text inside an image.**
> For anything where the words need to be correct and legible, use Ideogram.
> For everything else, use Midjourney or Flux.

---

### The Poster Prompt Playbook

Posters are a different discipline to product shots. Here's how to think about them.

**1. Keywords over narrative**
Don't write a sentence. Write a list of precise visual cues separated by commas.
The model reads it like a mood board, not a brief.

```
❌  "I want a poster that shows the spirit of Africa and feels powerful"
✅  cinematic, African savanna, golden hour, eagle silhouette, monumental, sacred, warm amber
```

**2. Specify the style and perspective**
Tell it *how* to look and *from where*.

```
bird's eye view, low angle looking up, first-person perspective, 
aerial, extreme close-up, wide establishing shot
```

**3. Plant a story without narrating it**
Imply something happened — or is about to. Don't explain it.

```
❌  "A man who has just returned from a long journey stands looking at his homeland"
✅  worn leather sandals on cracked red earth, long shadow stretching behind, horizon ahead
```
The story is there. The model fills in the weight.

**4. Use brackets to emphasise what matters most**
Round brackets tell Midjourney to weight that element higher.

```
(eagle wings fully spread), golden light, savanna, dust, --ar 2:3
```
Whatever is most critical to the image — wrap it.

**5. Colour carries emotion — be specific**
Don't say "warm." Say the actual tones.

```
❌  warm and earthy
✅  burnt umber, raw sienna, molten gold, obsidian shadow, amber haze
```

**6. Negative prompts do serious work**
Adding `--no` removes things that would otherwise creep in.

```
--no text, --no watermark, --no people, --no modern buildings, --no stock photo feel
```

**7. Style references are shortcuts**
One name does the work of twenty adjectives.

```
Loewe campaign aesthetic, Sebastião Salgado photography, 
Kenyan Vogue editorial, Nadine Ijewere portrait style
```

**Full poster prompt using all seven techniques:**
```
(lone eagle, wings fully spread), descending over ancient savanna, 
seen from below against a heavy amber sky, 
dust particles and golden light rays cutting through dark air, 
worn cracked red earth below, baobab silhouette at the edge of frame, 
burnt umber, raw sienna, molten gold, obsidian shadow, 
sacred and monumental, story of return, 
Sebastião Salgado meets Loewe campaign, 
large format film grain, weight, stillness 
--ar 2:3 --style raw --stylize 800 --no text --no watermark --no people
```

---

### 2D. Portraits

When you need a face — campaign talent, community stories, press.

```
editorial portrait of a West African woman in her 30s, 
natural hair, wearing a handwoven earth-tone garment, 
calm and powerful expression, slight upward gaze, 
seated against a softly blurred ochre courtyard wall, 
golden hour light from the right, warm rim light, 
85mm shallow depth of field, 
natural grain, warm colour grade, 
Nadine Ijewere editorial photography, 
ultra-photorealistic, not staged --ar 4:5
```

**Tips for portraits:**
- Name a real photographer whose work matches the feel you want — `Nadine Ijewere`, `Tyler Mitchell`, `Fatoumata Diabaté` all steer toward something intentional
- Be specific about features and expression — the more detail, the more dignified the result
- For Flux (fal.ai): handles photorealistic faces better than Midjourney — use it when the face is the hero

---

## Part 3 — Video

---

### The Best Workflow

**Generate the image first. Then animate it.**

Midjourney or Flux → Runway or Kling → finish in CapCut

This gives you control. You know exactly what the first frame looks like
before the video even starts.

---

### Runway Gen-4 — Your Main Video Tool

Upload any image to Runway → Gen-4 and write a motion prompt.
The motion prompt only describes **what moves and how** — not the full scene
(Runway already knows the scene from the image).

**Motion prompt formula:**
```
[what moves] [how it moves],
[camera movement or "camera holds still"],
cinematic slow motion, film grain
```

**Animating a product shot:**
```
fabric moves gently in a warm breeze, texture catching the light,
camera holds completely still,
cinematic ultra slow motion, film grain
```

**Animating a landscape:**
```
tall grass sways slowly in the wind, dust drifts through golden air,
camera very slowly pushes forward,
cinematic slow motion, sacred atmosphere, film grain
```

**Animating a portrait:**
```
fabric and hair move gently in a slow breeze,
subject holds completely still, gaze forward,
camera holds still,
golden particles drift through frame, cinematic ultra slow motion
```

**Tips:**
- Keep motion prompts short — one or two movements maximum
- "Camera holds still" stops unwanted drift — always include it if you don't want camera movement
- Generate 3–4 times and pick the best — output varies every run

---

### Kling AI

Better than Runway for fabric, clothing, and natural environment movement.
Same workflow — image first, then motion prompt.

```
handwoven fabric ripples slowly in a warm breeze,
weave texture visible in the light,
golden hour warmth, cinematic slow motion
```

---

### Sora

Use for the most complex, high-fidelity scenes — when you want something
that looks like it was actually shot on location.

```
a lone eagle soars low over an African savanna at golden hour,
wingbeats slow and deliberate, tall grass bending below,
camera tracks alongside from eye level,
cinematic wide angle, natural light, film grain,
no text, no music --ar 16:9
```

---

### Finishing in CapCut (free)

Three quick steps that make any AI video look more polished:

1. **Speed:** slow it to 80% — `Speed → 0.8x`
2. **Colour:** push shadows warmer, reduce highlights — match SOIL's amber palette
3. **Sound:** add one ambient tone — wind, distant drums, silence. Not stock music.

---

## Part 4 — Aspect Ratios (Quick Reference)

| Format | Ratio | Use for |
|---|---|---|
| Portrait poster | `--ar 2:3` | Prints, stories, phone wallpaper |
| Square | `--ar 1:1` | Instagram grid, product shots |
| Landscape hero | `--ar 16:9` | Website, YouTube, Twitter |
| Editorial tall | `--ar 4:5` | Instagram feed, campaign |

---

## Part 5 — SOIL Asset Map

| Asset | Tool | Ratio |
|---|---|---|
| Homepage hero image | Midjourney | 16:9 |
| Studio product listing | Midjourney or Flux | 1:1 or 4:5 |
| Instagram post | Midjourney | 4:5 |
| Instagram story | Midjourney or Ideogram | 9:16 |
| Brand poster (text-free) | Midjourney | 2:3 |
| Brand poster (with text) | Ideogram | 2:3 |
| Website background video | Runway + Midjourney | 16:9 |
| Social video clip | Kling or Pika | 9:16 |
| Campaign portrait | Flux | 4:5 |

---

*More assets, more prompts, more refinement — I'm one message away.*

*Before the rise — the roots.*

**Emmanuel**
