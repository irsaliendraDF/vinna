import type { Herb, Recipe, Profile, NeedFilter } from './types'

/* The demo world: Aga, Edmonton, Day 1 Menstrual, training for an 80km Haleakalā ride. */
export const demoProfile: Profile = {
  name: 'Aga',
  city: 'Edmonton',
  cycleDay: 1,
  phase: 'Menstrual',
  tier: 'free',
  goal: '80km Haleakalā ride',
}

export const needLabels: Record<NeedFilter, string> = {
  energy: 'Energy',
  phase: 'Cycle phase',
  load: 'Big load',
  recovery: 'Recovery',
  calm: 'Calm + sleep',
}

export const moodMeta = {
  great: { glyph: '✦', label: 'Great', positive: true },
  okay: { glyph: '◌', label: 'Okay', positive: true },
  low: { glyph: '△', label: 'Low', positive: false },
  pain: { glyph: '◎', label: 'Pain', positive: false },
  tired: { glyph: '○', label: 'Tired', positive: false },
} as const

/* Symptom chip sets adapt to the mood (positive asks "what's contributing", the rest ask about symptoms). */
export const symptomSets = {
  positive: ['Good sleep', 'Light cramps', 'Steady energy', 'Clear head', 'Strong legs', 'Calm'],
  negative: ['Cramps', 'Bloating', 'Fatigue', 'Headache', 'Low mood', 'Tender breasts', 'Back ache', 'Poor sleep'],
}

export const herbs: Herb[] = [
  {
    id: 'ginger',
    name: 'Ginger',
    latin: 'Zingiber officinale',
    glyph: '❧',
    summary: 'Traditionally used to support digestion and ease period cramping.',
    needs: ['phase', 'recovery', 'calm'],
    evidence: 'Evidence reviewed · 3 RCTs cited',
    traditional:
      'Ginger has traditionally been used to support comfort during menstruation and to settle the stomach. In several small trials it has been studied alongside cramping in the first days of a cycle.',
    preparation:
      'A common form is fresh ginger steeped as a tea, taken in the first two days. Some prefer it as a standardised capsule with food.',
    caution:
      'May interact with blood-thinning medication. This is educational information, not medical advice, talk to your care team about what is right for you.',
  },
  {
    id: 'magnesium',
    name: 'Magnesium glycinate',
    latin: 'Magnesium bisglycinate',
    glyph: '❧',
    summary: 'Traditionally used to support muscle relaxation and restful sleep.',
    needs: ['recovery', 'calm'],
    evidence: 'Evidence reviewed · 2 RCTs cited',
    traditional:
      'Magnesium is a mineral the body uses in muscle and nerve function. The glycinate form is often chosen for its gentleness on digestion and is associated with evening wind-down.',
    preparation: 'Commonly taken in the evening, away from high-dose calcium. Start low and notice how you sleep.',
    caution:
      'High doses can loosen the stomach. Educational information only, check with your care team if you take other medication.',
  },
  {
    id: 'raspberry-leaf',
    name: 'Raspberry leaf',
    latin: 'Rubus idaeus',
    glyph: '❧',
    summary: 'Traditionally used to support tone and comfort through the cycle.',
    needs: ['phase', 'calm'],
    evidence: 'Clinically reviewed',
    traditional:
      'Raspberry leaf is a long-standing herbal tea associated in tradition with the menstruating and reproductive years. Evidence is largely traditional rather than trial-based.',
    preparation: 'Usually a mild tea, one to two cups a day. An easy daily ritual rather than an acute remedy.',
    caution: 'If you are pregnant or trying to conceive, speak with your care team first. Educational only.',
  },
  {
    id: 'beetroot',
    name: 'Beetroot',
    latin: 'Beta vulgaris',
    glyph: '❧',
    summary: 'Traditionally used to support endurance and blood flow before a big effort.',
    needs: ['energy', 'load'],
    evidence: 'Evidence reviewed · 4 RCTs cited',
    traditional:
      'Beetroot is rich in dietary nitrate, which the body can use in the pathways behind blood flow. Endurance athletes often take it before long efforts.',
    preparation: 'A common approach is concentrated beetroot taken 2–3 hours before a long ride. Test it in training first, never on race day.',
    caution: 'Harmless reddening of urine can occur. Educational information only.',
  },
  {
    id: 'ashwagandha',
    name: 'Ashwagandha',
    latin: 'Withania somnifera',
    glyph: '❧',
    summary: 'An adaptogen traditionally used to support resilience to stress.',
    needs: ['calm', 'recovery'],
    evidence: 'Evidence reviewed · 3 RCTs cited',
    traditional:
      'Ashwagandha is an adaptogenic root from Ayurvedic tradition, associated with a steadier response to stress and with evening calm.',
    preparation: 'Often taken as a standardised extract, morning or evening. Effects, if any, build over weeks rather than in one dose.',
    caution: 'Not recommended in pregnancy or with thyroid medication without guidance. Educational only.',
  },
  {
    id: 'iron',
    name: 'Iron-rich foods',
    latin: 'Dietary iron',
    glyph: '❧',
    summary: 'Traditionally used to support energy when menstrual loss is heaviest.',
    needs: ['energy', 'phase'],
    evidence: 'Clinically reviewed',
    traditional:
      'The first days of a cycle are when iron stores are most drawn on. Food-first iron, red meat, lentils, leafy greens with vitamin C, is the gentlest way to replenish.',
    preparation: 'Pair plant iron with a squeeze of citrus to help absorption. Keep tea and coffee away from the meal.',
    caution: 'Only supplement iron if a test shows you need it. Educational information, not a diagnosis.',
  },
]

export const recipes: Recipe[] = [
  {
    id: 'iron-bowl',
    title: 'Iron-forward beef & lentil bowl',
    glyph: '❧',
    why: 'Day 1 is when iron stores are most drawn on. This bowl pairs heme and plant iron with citrus to help your body take it up, so the dip you feel on heavy days has somewhere to land.',
    needs: ['energy', 'phase', 'recovery'],
    time: '25 min',
    tags: ['Iron', 'Protein', 'Day 1'],
    nutrients: [
      { label: 'Iron', value: 'High' },
      { label: 'Protein', value: '34g' },
      { label: 'Vitamin C', value: 'High' },
    ],
    ingredients: [
      '150g lean beef strips',
      '1 cup cooked green lentils',
      '2 handfuls spinach',
      'Half a red pepper',
      'Juice of half a lemon',
      'Olive oil, cumin, salt',
    ],
    method: [
      'Sear the beef in a hot pan with a little oil and cumin, 3–4 minutes.',
      'Add lentils and red pepper, warm through.',
      'Fold in spinach until just wilted.',
      'Off the heat, squeeze over lemon, the vitamin C helps iron absorption.',
    ],
    evidence: 'Clinically reviewed',
  },
  {
    id: 'cherry-smoothie',
    title: 'Tart cherry recovery smoothie',
    glyph: '❧',
    why: 'After a long ride your legs are clearing the load of the effort. Tart cherry is traditionally used to support overnight recovery, and the protein here gives muscle something to rebuild with.',
    needs: ['recovery', 'load'],
    time: '5 min',
    tags: ['Recovery', 'Post-ride'],
    nutrients: [
      { label: 'Protein', value: '24g' },
      { label: 'Carbs', value: '38g' },
      { label: 'Antioxidants', value: 'High' },
    ],
    ingredients: [
      '1 cup tart cherry juice',
      '1 scoop vanilla protein',
      '1 frozen banana',
      'Handful of oats',
      'Splash of milk of choice',
    ],
    method: [
      'Add everything to a blender.',
      'Blend until smooth, 30 seconds.',
      'Drink within the first hour after your ride.',
    ],
    evidence: 'Evidence reviewed · 2 RCTs cited',
  },
  {
    id: 'ginger-oats',
    title: 'Ginger-honey oat bowl',
    glyph: '❧',
    why: 'A warm, settling start on a cramp-y morning. Ginger is traditionally used to ease period discomfort, and slow oats keep your energy even rather than spiking.',
    needs: ['phase', 'calm', 'energy'],
    time: '10 min',
    tags: ['Breakfast', 'Calm', 'Day 1'],
    nutrients: [
      { label: 'Fibre', value: 'High' },
      { label: 'Slow carbs', value: 'Yes' },
      { label: 'Added sugar', value: 'Low' },
    ],
    ingredients: [
      'Half a cup rolled oats',
      '1 cup milk of choice',
      '1 tsp grated fresh ginger',
      '1 tsp honey',
      'Cinnamon and a few walnuts',
    ],
    method: [
      'Simmer oats, milk and ginger for 5 minutes, stirring.',
      'Take off the heat and stir in honey.',
      'Top with cinnamon and walnuts.',
    ],
    evidence: 'Evidence reviewed · 3 RCTs cited',
  },
  {
    id: 'beet-shot',
    title: 'Beetroot endurance shot',
    glyph: '❧',
    why: 'For the long climb. Beetroot is rich in nitrate, which sits in the pathways behind blood flow. Take it well before the ride, and only after you have tested it in training.',
    needs: ['energy', 'load'],
    time: '5 min',
    tags: ['Pre-ride', 'Endurance'],
    nutrients: [
      { label: 'Nitrate', value: 'High' },
      { label: 'Natural sugars', value: 'Moderate' },
    ],
    ingredients: ['1 cooked beetroot', 'Half an apple', '1cm fresh ginger', 'Squeeze of lemon', 'Splash of water'],
    method: [
      'Blend everything until smooth.',
      'Strain if you like it thinner.',
      'Take 2–3 hours before a long effort.',
    ],
    evidence: 'Evidence reviewed · 4 RCTs cited',
  },
]

/* Innovation / "What's new" library. */
export const innovations = [
  {
    id: 'cycle-vo2',
    eyebrow: '● NEW RESEARCH',
    title: 'Cycle phase and endurance performance',
    blurb: 'A 2026 review on how training response shifts across the menstrual cycle, and what is still unknown.',
    evidence: 'Evidence reviewed · 6 studies',
  },
  {
    id: 'perimenopause-strength',
    eyebrow: '● FEMTECH WATCH',
    title: 'Strength training through perimenopause',
    blurb: 'Why resistance work is moving to the centre of perimenopause care, in plain language.',
    evidence: 'Clinically reviewed',
  },
  {
    id: 'wearable-temp',
    eyebrow: '● DEVICE',
    title: 'Skin-temperature cycle tracking',
    blurb: 'How overnight temperature sensors estimate phase, and where they get it wrong.',
    evidence: 'Evidence reviewed · 4 studies',
  },
]

/* Pattern cards, the data decides what surfaces. */
export const patterns = [
  {
    id: 'ginger-cramp',
    stat: '3/3',
    statLabel: 'cycles',
    color: 'lichen' as const,
    title: 'Ginger eased your cramps',
    body: 'Across your last three cycles you logged ginger on Day 1 and rated cramp relief "Yes" each time.',
    footer: 'Auto-surfacing · Day 1',
    cat: 'cycle',
  },
  {
    id: 'energy-dip',
    stat: '4/4',
    statLabel: 'cycles',
    color: 'ochre' as const,
    title: 'Energy dips on Day 1–2',
    body: 'Your check-ins show a reliable low at the start of each cycle. Vinna front-loads rest and iron-forward food here.',
    footer: 'Auto-surfacing · Energy',
    cat: 'energy',
  },
  {
    id: 'mag-sleep',
    stat: '2/2',
    statLabel: 'used',
    color: 'lichen' as const,
    title: 'Magnesium and better sleep',
    body: 'Both evenings you logged magnesium, your next-morning check-in was "Great". Early, but worth watching.',
    footer: 'Auto-surfacing · Sleep',
    cat: 'sleep',
  },
  {
    id: 'nutrition-thin',
    stat: '1/5',
    statLabel: 'logged',
    color: 'muted' as const,
    title: 'Recovery meals, needs more data',
    body: 'You have logged one recovery meal so far. Log a few more and Vinna can tell you what actually helps your legs.',
    footer: 'Needs more data',
    cat: 'nutrition',
  },
]

export const tiers = [
  {
    id: 'free' as const,
    name: 'Vinna Free',
    price: '$0',
    line: 'Tracking that is genuinely useful, never paywalled.',
    features: [
      'Period & cycle tracking',
      'Wearable + app sync (Strava / Garmin / Peloton / Oura)',
      'Calendar reminders & screening nudges',
      'Femtech innovation library',
      'Community clubs & challenges',
    ],
  },
  {
    id: 'plus' as const,
    name: 'Vinna+',
    price: '$2.99',
    line: 'Daily insight tuned to your phase, the what.',
    features: [
      'Daily insights tuned to your phase',
      'Trending prompts that open deeper understanding',
      'Reads your synced activity for nutrition & herbal guidance',
      'Everything in Free',
    ],
  },
  {
    id: 'deep' as const,
    name: 'Vinna Deep',
    price: '$5.99',
    line: 'The full why, phase-timed, and it learns your tastes.',
    features: [
      'The full reasoning: why these foods, herbs & nutrients, and exactly when',
      'Phase-timed protocols',
      'Personalisation that learns your tastes',
      'Everything in Vinna+',
    ],
  },
]
