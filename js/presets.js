// presets.js — "What are you making?" use cases.
//
// A preset NEVER changes your typed text by itself. It changes:
//   placeholders   grey example text in every field (also used by "Fill example")
//   suggestions    tap-to-fill chips under fields, keyed "sectionId.fieldId"
//   toggles        which Advanced switches "Fill example" turns on
//
// To add a preset: add one object to PRESETS. Keys you leave out fall back to
// the defaults in sections.js (placeholders) and DEFAULT_SUGGESTIONS (chips).
// Placeholder keys: "sectionId.fieldId". For the Examples list use
// "examples.label" / "examples.content".

export const DEFAULT_SUGGESTIONS = {
  'format.outputType': ['Bullet list', 'Numbered steps', 'Table', 'JSON', 'Code', 'Email', 'Essay', 'Story', 'Outline', 'Summary'],
  'format.length': ['1 sentence', 'Under 100 words', 'Under 300 words', '1 page', 'As long as needed'],
  'format.tone': ['Professional', 'Friendly', 'Casual', 'Technical', 'Encouraging', 'Blunt', 'Funny'],
};

export const PRESETS = [
  {
    id: 'general', group: 'General', label: 'General', icon: 'sparkles',
    description: 'Anything. Placeholders use the birthday-gift example from the video.',
    placeholders: {},
    toggles: { context: { allowUnknown: true } },
  },

  // ---------- Writing ----------
  {
    id: 'email', group: 'Writing', label: 'Email / message', icon: 'layout',
    description: 'Emails, letters, Slack/Discord messages, announcements.',
    placeholders: {
      'persona.role': 'a senior site reliability engineer at Cloudflare',
      'persona.audience': 'both customers and engineers',
      'persona.perspective': '10 years running incident response; values radical transparency',
      'task.task': "Write an apology email about yesterday's outage.",
      'task.goal': 'Customers trust us again and understand exactly what broke and what we changed.',
      'context.facts': 'On Nov 18, a bad config file doubled in size and crashed our proxy. About 20% of traffic failed for 3 hours. Root cause found and fixed; config size limits added.',
      'context.constraints': "Don't blame any vendor\nDon't promise dates we can't keep",
      'format.outputType': 'email with subject line',
      'format.length': 'under 200 words',
      'format.tone': 'professional, apologetic, radically transparent',
      'format.avoid': 'corporate fluff, buzzwords',
      'format.structure': 'Subject line\nWhat happened (bulleted timeline)\nWhat we changed\nSign-off',
      'examples.label': 'Tone and ownership',
      'examples.content': 'We let you down today. I own that.',
      'advanced.battlePersonas': 'Engineer\nPR crisis manager\nAngry customer',
      'advanced.totBranches': 'Radical transparency\nCustomer empathy first\nFuture-focused assurance',
    },
    suggestions: {
      'format.outputType': ['Email with subject line', 'Short message', 'Formal letter', 'Announcement', 'Reply'],
      'format.tone': ['Professional', 'Warm', 'Apologetic', 'Firm but polite', 'Casual'],
      'format.length': ['2–3 sentences', 'Under 150 words', 'Under 300 words'],
    },
    toggles: { context: { allowUnknown: true } },
  },
  {
    id: 'essay', group: 'Writing', label: 'Essay / article', icon: 'book',
    description: 'School essays, blog posts, articles, reports.',
    placeholders: {
      'persona.role': 'a history teacher who grades AP essays',
      'persona.audience': 'a high-school class',
      'persona.perspective': 'Values a clear thesis backed by specific evidence',
      'task.task': 'Write an essay arguing whether the printing press or the internet changed society more.',
      'task.goal': 'A clear thesis, three strong arguments with evidence, and a fair counterargument.',
      'context.facts': 'Assignment: 5-paragraph argumentative essay. Must cite at least 2 historical examples per technology.',
      'context.constraints': 'No made-up quotes or statistics\nMark anything that needs a citation with [cite]',
      'format.outputType': 'essay with title',
      'format.length': '600–800 words',
      'format.tone': 'academic but readable',
      'format.avoid': 'clichés like "since the dawn of time"',
      'format.structure': 'Title\nIntro with thesis\n3 body paragraphs\nCounterargument\nConclusion',
      'examples.label': 'Thesis style',
      'examples.content': 'While the internet spread information faster, the printing press changed who was allowed to know things.',
      'advanced.cotSteps': 'Pick a side\nList the 3 strongest arguments\nFind evidence for each\nWrite the counterargument\nDraft',
      'advanced.battlePersonas': 'Student writer\nDebate coach\nStrict teacher',
    },
    suggestions: {
      'format.outputType': ['Essay with title', 'Blog post', 'Article', 'Report', 'Outline only'],
      'format.length': ['300 words', '600–800 words', '1,500 words'],
      'format.tone': ['Academic', 'Conversational', 'Persuasive', 'Neutral', 'Journalistic'],
    },
    toggles: { context: { allowUnknown: true }, advanced: { cot: true } },
  },
  {
    id: 'social', group: 'Writing', label: 'Social post', icon: 'quote',
    description: 'YouTube titles/descriptions, tweets, TikTok scripts, Roblox game descriptions.',
    placeholders: {
      'persona.role': 'a Roblox game marketer who has launched front-page games',
      'persona.audience': 'Roblox players aged 10–16',
      'persona.perspective': 'Knows what makes players click: clear hook, big promise, no walls of text',
      'task.task': 'Write the Roblox game description and 5 title options for my idle brick breaker game.',
      'task.goal': 'Players instantly get the game and want to press Play.',
      'context.facts': 'Idle brick breaker. Upgrade balls, buy AI robots that break bricks for you, leaderboard for richest player.',
      'context.constraints': 'Follow Roblox community rules\nNo fake promises (no "free Robux")',
      'format.outputType': 'game description + 5 titles',
      'format.length': 'description under 80 words',
      'format.tone': 'hype, fun',
      'format.avoid': 'walls of text, too many emojis',
      'format.structure': '5 title options\nDescription with emoji bullets\nUpdate log line',
      'examples.label': 'Hook style',
      'examples.content': '🧱 Break bricks. Get rich. Let robots do the work.',
      'advanced.totBranches': 'Hype / FOMO\nFunny\nSimple and clear',
      'advanced.battlePersonas': 'Marketer\nGame designer\nBored 12-year-old scrolling',
    },
    suggestions: {
      'format.outputType': ['Roblox game description', 'YouTube title + description', 'Tweet / X post', 'TikTok script', 'Discord announcement'],
      'format.length': ['Under 280 characters', 'Under 80 words', '30-second script'],
      'format.tone': ['Hype', 'Funny', 'Mysterious', 'Chill', 'Informative'],
    },
    toggles: { advanced: { tot: true } },
  },

  // ---------- Creative ----------
  {
    id: 'story', group: 'Creative', label: 'Story / creative', icon: 'book',
    description: 'Short stories, lore, dialogue, scripts, worldbuilding.',
    placeholders: {
      'persona.role': 'a horror writer known for slow-burn psychological tension',
      'persona.audience': 'teens who like analog horror',
      'persona.perspective': 'Scares come from what is NOT shown',
      'task.task': 'Write the opening scene for my Backrooms horror game: the player no-clips into Level 0.',
      'task.goal': 'Unsettling, quiet, makes players want to keep walking.',
      'context.facts': 'Level 0: endless yellow rooms, damp carpet, buzzing fluorescent lights. Player is alone. No monsters yet.',
      'context.constraints': 'No gore\nNo jump scares in the first scene',
      'format.outputType': 'short story scene',
      'format.length': 'about 400 words',
      'format.tone': 'eerie, quiet, second person',
      'format.avoid': 'explaining the mystery',
      'format.structure': 'Arrival\nFirst detail that feels wrong\nEnding hook',
      'examples.label': 'Voice',
      'examples.content': 'The hum never stops. You notice it most when you try to remember what silence sounded like.',
      'advanced.totBranches': 'Sensory dread\nUnreliable memory\nSomething almost seen',
      'advanced.battlePersonas': 'Horror writer\nGame designer\nPlayer who has seen every Backrooms video',
    },
    suggestions: {
      'format.outputType': ['Short story', 'Scene', 'Dialogue / script', 'Lore entry', 'Poem', 'Character profile'],
      'format.length': ['Under 200 words', 'About 400 words', '1,000 words'],
      'format.tone': ['Eerie', 'Whimsical', 'Dramatic', 'Funny', 'Dark', 'Cozy'],
    },
    toggles: { advanced: { tot: true } },
  },
  {
    id: 'image', group: 'Creative', label: 'Image prompt', icon: 'layout',
    description: 'Prompts for image generators: thumbnails, game icons, concept art.',
    placeholders: {
      'persona.role': 'a prompt engineer for image generators who makes game thumbnails',
      'persona.audience': 'an image generator (Midjourney / DALL·E / Stable Diffusion)',
      'persona.perspective': 'Describes subject, style, lighting, camera, and composition explicitly',
      'task.task': 'Write an image prompt for my Roblox game icon: a space-sorting game.',
      'task.goal': 'Bright, readable at small size, makes kids curious.',
      'context.facts': 'Game: "Sort the Universe". Player sorts stars and galaxies into bins. Roblox icon is square and shown tiny.',
      'context.constraints': 'No text in the image\nNo copyrighted characters',
      'format.outputType': 'one image prompt + 2 variations',
      'format.length': 'under 60 words each',
      'format.tone': 'vivid, specific',
      'format.avoid': 'vague words like "beautiful" or "amazing"',
      'format.structure': 'Subject\nStyle\nLighting and colors\nComposition\nAspect ratio',
      'examples.label': 'Detail level',
      'examples.content': 'A cartoon robot holding a glowing galaxy in a cardboard box, bold outlines, saturated purple and teal, centered, 1:1',
      'advanced.totBranches': 'Cute cartoon\n3D toy style\nBold flat icon',
    },
    suggestions: {
      'format.outputType': ['One image prompt', 'Prompt + 3 variations', 'Negative prompt too'],
      'format.tone': ['Vivid', 'Minimal', 'Cinematic', 'Cartoon', 'Photorealistic'],
      'format.length': ['Under 40 words', 'Under 60 words', 'Under 100 words'],
    },
    toggles: { advanced: { tot: true } },
  },

  // ---------- Code ----------
  {
    id: 'roblox', group: 'Code', label: 'Roblox / Luau script', icon: 'layout',
    description: 'Roblox systems: server/client scripts, remotes, DataStores, UI.',
    placeholders: {
      'persona.role': 'a senior Roblox engineer who writes secure, strictly typed Luau',
      'persona.audience': 'me, a solo dev who knows Lua basics',
      'persona.perspective': 'Server-authoritative; never trusts the client; modular ModuleScripts',
      'task.task': 'Write a coin shop system: player buys ball upgrades with coins.',
      'task.goal': 'Works in Studio first try, exploit-safe, easy to add new upgrades.',
      'context.facts': 'Game: idle brick breaker. Coins live in leaderstats. Upgrades: Speed, Damage, Ball Count. Prices double each level.',
      'context.constraints': 'Use --!strict\nValidate every RemoteEvent on the server\nNo deprecated APIs (no wait(), use task.wait())',
      'format.outputType': 'Luau code + file layout',
      'format.length': 'as long as needed',
      'format.tone': 'technical, commented',
      'format.avoid': 'putting logic in LocalScripts, _G',
      'format.structure': 'File tree (where each script goes)\nShared config ModuleScript\nServer script\nClient script\nHow to test in Studio',
      'examples.label': 'Code style',
      'examples.content': 'local UPGRADES: {[string]: {base: number}} = {\n\tSpeed = {base = 10},\n}',
      'advanced.cotSteps': 'List the remotes needed\nDecide what the server validates\nWrite shared config\nWrite server\nWrite client\nList exploits and how the code blocks them',
      'advanced.battlePersonas': 'Roblox engineer\nExploiter trying to break it',
    },
    suggestions: {
      'format.outputType': ['Luau code + file layout', 'Single ModuleScript', 'Server + client scripts', 'Explanation + code'],
      'format.tone': ['Technical, commented', 'Beginner-friendly', 'Minimal comments'],
      'format.length': ['As long as needed', 'Under 100 lines'],
    },
    toggles: { context: { allowUnknown: true }, advanced: { cot: true, battle: true } },
  },
  {
    id: 'code', group: 'Code', label: 'Code feature', icon: 'layout',
    description: 'Python, JavaScript, any language. New features, scripts, tools.',
    placeholders: {
      'persona.role': 'a senior Python developer who writes clean, tested code',
      'persona.audience': 'me, an intermediate programmer',
      'persona.perspective': 'Prefers small functions, type hints, and no unnecessary libraries',
      'task.task': 'Write a script that renames all photos in a folder by the date they were taken.',
      'task.goal': 'Safe to run (dry-run first), handles photos with no date.',
      'context.facts': 'Python 3.12 on Windows. Folder has ~2,000 JPG and PNG files. Some have no EXIF data.',
      'context.constraints': 'Never overwrite files\nOnly use Pillow plus the standard library',
      'format.outputType': 'code + how to run it',
      'format.length': 'as long as needed',
      'format.tone': 'technical',
      'format.avoid': 'placeholder code like "# TODO"',
      'format.structure': 'Short plan\nFull code\nHow to run\nEdge cases handled',
      'examples.label': 'Style',
      'examples.content': 'def taken_date(path: Path) -> datetime | None:\n    """Return EXIF date or None."""',
      'advanced.cotSteps': 'Restate requirements\nPlan functions\nWrite code\nWalk through edge cases',
      'advanced.battlePersonas': 'Developer\nCode reviewer',
    },
    suggestions: {
      'format.outputType': ['Code + how to run it', 'Single file', 'Function only', 'Code + tests', 'Pseudocode first'],
      'format.tone': ['Technical', 'Beginner-friendly', 'Heavily commented'],
      'format.length': ['As long as needed', 'Under 50 lines'],
    },
    toggles: { context: { allowUnknown: true }, advanced: { cot: true } },
  },
  {
    id: 'debug', group: 'Code', label: 'Debug an error', icon: 'warn',
    description: 'Paste an error and the code; get the cause and a fix.',
    placeholders: {
      'persona.role': 'a patient senior engineer who is great at debugging',
      'persona.audience': 'me, I want to understand the fix, not just copy it',
      'persona.perspective': 'Finds the root cause before suggesting changes',
      'task.task': 'Find out why this script errors and fix it.',
      'task.goal': 'I understand the cause and the error is gone.',
      'context.facts': 'Error: attempt to index nil with \'leaderstats\'\nHappens when a player joins.\n\n[paste the code here]',
      'context.constraints': 'Change as little code as possible\nExplain why the fix works',
      'format.outputType': 'diagnosis + fixed code',
      'format.length': 'concise',
      'format.tone': 'clear, teaching',
      'format.avoid': 'rewriting everything',
      'format.structure': 'Root cause (1–2 sentences)\nFixed code\nWhy it works\nHow to avoid it next time',
      'examples.label': 'Explanation depth',
      'examples.content': 'The script runs before the player\'s leaderstats exist, so it reads nil. WaitForChild waits until it exists.',
      'advanced.cotSteps': 'Read the error line\nTrace where the nil value comes from\nList possible causes\nPick the most likely\nFix and explain',
    },
    suggestions: {
      'format.outputType': ['Diagnosis + fixed code', 'Just the fix', 'Step-by-step walkthrough'],
      'format.tone': ['Clear, teaching', 'Brief', 'Technical'],
      'format.length': ['Concise', 'Detailed'],
    },
    toggles: { context: { allowUnknown: true }, advanced: { cot: true } },
  },

  // ---------- Study ----------
  {
    id: 'explain', group: 'Study', label: 'Explain a concept', icon: 'bulb',
    description: 'Learn something: explanations, analogies, ELI5, step-by-step.',
    placeholders: {
      'persona.role': 'a great physics teacher who uses everyday analogies',
      'persona.audience': 'a 19-year-old who knows basic algebra',
      'persona.perspective': 'Intuition first, then the math',
      'task.task': 'Explain how GPS works and why it needs relativity.',
      'task.goal': 'I could explain it to a friend afterwards.',
      'context.facts': 'I know what satellites are. I don\'t know relativity at all.',
      'context.constraints': 'Define every new term the first time you use it',
      'format.outputType': 'explanation with an analogy',
      'format.length': 'under 400 words',
      'format.tone': 'friendly, clear',
      'format.avoid': 'jargon without definitions',
      'format.structure': 'One-sentence answer\nAnalogy\nStep-by-step explanation\n3 quick check questions',
      'examples.label': 'Analogy style',
      'examples.content': 'Think of each satellite as a lighthouse that shouts the time.',
      'advanced.cotSteps': 'Find what I already know\nBuild from that\nAdd one new idea at a time',
    },
    suggestions: {
      'format.outputType': ['Explanation with analogy', 'ELI5', 'Step-by-step', 'Comparison table', 'Cheat sheet'],
      'format.tone': ['Friendly', 'Like explaining to a 10-year-old', 'Academic', 'Socratic (ask me questions)'],
      'format.length': ['Under 150 words', 'Under 400 words', 'Deep dive'],
    },
    toggles: { context: { allowUnknown: true } },
  },
  {
    id: 'quiz', group: 'Study', label: 'Quiz / flashcards', icon: 'clipboard',
    description: 'Practice questions, flashcards, test prep from your notes.',
    placeholders: {
      'persona.role': 'a tutor who writes tricky but fair practice questions',
      'persona.audience': 'me, studying for a test',
      'persona.perspective': 'Wrong answers should be believable mistakes',
      'task.task': 'Make 10 practice questions from my notes below.',
      'task.goal': 'I find the gaps in what I know before the test.',
      'context.facts': '[paste your notes here]\nTest: Biology unit 3, cell respiration.',
      'context.constraints': 'Only use facts from my notes\nMix easy and hard questions',
      'format.outputType': 'multiple-choice quiz with answer key',
      'format.length': '10 questions',
      'format.tone': 'clear, encouraging',
      'format.avoid': 'trick wording, "all of the above"',
      'format.structure': 'Questions (A–D)\nAnswer key at the end with 1-line explanations',
      'examples.label': 'Question style',
      'examples.content': 'Q: Where does glycolysis happen?\nA) Mitochondria  B) Cytoplasm  C) Nucleus  D) Ribosome',
    },
    suggestions: {
      'format.outputType': ['Multiple-choice quiz', 'Flashcards (front / back)', 'Short-answer questions', 'Fill in the blank', 'Table: term / definition'],
      'format.length': ['5 questions', '10 questions', '20 flashcards'],
      'format.tone': ['Encouraging', 'Exam-style', 'Fun'],
    },
    toggles: { context: { allowUnknown: true } },
  },

  // ---------- Plans & data ----------
  {
    id: 'gamedesign', group: 'Plans & data', label: 'Game design doc', icon: 'target',
    description: 'Game ideas, core loops, progression, monetization, design docs.',
    placeholders: {
      'persona.role': 'a lead game designer who has shipped top Roblox simulator games',
      'persona.audience': 'me, a solo developer planning what to build first',
      'persona.perspective': 'Fun first, then retention; scope small enough for one person',
      'task.task': 'Write a game design doc for my rhythm boss-fight game where math graphs are the attacks.',
      'task.goal': 'I know the core loop, what to build first, and what makes it different.',
      'context.facts': 'Like "Just Shapes & Beats". Boss attacks are graphs (sine waves, parabolas) that pulse with the music. Roblox, mobile + PC.',
      'context.constraints': 'Solo dev, 3 months\nNo pay-to-win',
      'format.outputType': 'game design document',
      'format.length': 'about 1 page',
      'format.tone': 'clear, decisive',
      'format.avoid': 'vague ideas like "lots of content"',
      'format.structure': 'One-line pitch\nCore loop\nControls\nProgression\nMonetization\nMVP scope (build first)\nRisks',
      'examples.label': 'Core loop format',
      'examples.content': 'Pick boss → survive the song → earn notes → unlock harder remix',
      'advanced.totBranches': 'Casual / short sessions\nHardcore / skill-based\nSocial / co-op',
      'advanced.battlePersonas': 'Game designer\nProducer worried about scope\nPicky player',
    },
    suggestions: {
      'format.outputType': ['Game design document', 'Core loop diagram (text)', 'Feature list (MVP vs later)', 'Monetization plan', 'Level / boss list'],
      'format.length': ['About 1 page', 'Bullet points only', 'Detailed'],
      'format.tone': ['Clear, decisive', 'Brainstorm-y', 'Critical'],
    },
    toggles: { advanced: { tot: true, battle: true } },
  },
  {
    id: 'plan', group: 'Plans & data', label: 'Project plan', icon: 'clipboard',
    description: 'Step-by-step plans, schedules, roadmaps, checklists.',
    placeholders: {
      'persona.role': 'a project manager who plans realistic timelines',
      'persona.audience': 'me, working on this after school/work',
      'persona.perspective': 'Small milestones; something playable or usable every week',
      'task.task': 'Make a 4-week plan to launch my first Roblox game.',
      'task.goal': 'A plan I can actually follow, with clear "done" checks each week.',
      'context.facts': 'About 10 hours per week. Game idea is done. I know basic Luau, no UI experience.',
      'context.constraints': 'Leave 1 buffer day per week\nPublishing must happen in week 4',
      'format.outputType': 'week-by-week table',
      'format.length': 'one screen',
      'format.tone': 'practical',
      'format.avoid': 'tasks bigger than one evening',
      'format.structure': 'Week\nGoal\nTasks\nDone when…',
      'examples.label': 'Task size',
      'examples.content': 'Make the shop UI open and close (no buying yet)',
      'advanced.cotSteps': 'List everything needed to launch\nOrder by dependency\nSplit into evening-size tasks\nFit into weeks',
    },
    suggestions: {
      'format.outputType': ['Week-by-week table', 'Checklist', 'Timeline', 'Kanban columns (To do / Doing / Done)'],
      'format.length': ['One screen', 'Detailed'],
      'format.tone': ['Practical', 'Motivating', 'Strict'],
    },
    toggles: { advanced: { cot: true } },
  },
  {
    id: 'data', group: 'Plans & data', label: 'Data → table / JSON', icon: 'layout',
    description: 'Turn messy info into tables, JSON, CSV; compare options.',
    placeholders: {
      'persona.role': 'a data analyst who structures messy information',
      'persona.audience': 'a spreadsheet / a program that reads JSON',
      'persona.perspective': 'Consistent field names; never invents missing values',
      'task.task': 'Turn my upgrade notes below into JSON I can paste into my game config.',
      'task.goal': 'Valid JSON, every upgrade has the same fields.',
      'context.facts': 'Notes:\nSpeed upgrade costs 10, doubles each level, max 20\nDamage costs 25, x1.5 per level, max 50\n[paste more]',
      'context.constraints': 'If a value is missing, use null and list it after the JSON',
      'format.outputType': 'JSON',
      'format.length': 'as long as needed',
      'format.tone': 'none, data only',
      'format.avoid': 'comments inside the JSON, extra text before it',
      'format.structure': 'JSON code block\nList of missing/unclear values',
      'examples.label': 'Shape',
      'examples.content': '{ "id": "speed", "baseCost": 10, "growth": 2, "maxLevel": 20 }',
    },
    suggestions: {
      'format.outputType': ['JSON', 'Table', 'CSV', 'Comparison table', 'Markdown list'],
      'format.length': ['As long as needed', 'Top 10 rows'],
      'format.tone': ['Data only', 'Short notes allowed'],
    },
    toggles: { context: { allowUnknown: true } },
  },
  {
    id: 'research', group: 'Plans & data', label: 'Research summary', icon: 'book',
    description: 'Summaries, comparisons, pros/cons, "what should I pick?".',
    placeholders: {
      'persona.role': 'a careful researcher who separates facts from opinions',
      'persona.audience': 'me, deciding what to use',
      'persona.perspective': 'Cites sources; says "I don\'t know" instead of guessing',
      'task.task': 'Compare Rojo, Argon, and Roblox Studio script sync for a solo developer.',
      'task.goal': 'I can pick one today and know the trade-offs.',
      'context.facts': 'I use VS Code. Windows. Solo dev. I want Git version control.',
      'context.constraints': 'Use sources from the last 12 months\nMark anything uncertain',
      'format.outputType': 'comparison table + recommendation',
      'format.length': 'under 300 words',
      'format.tone': 'neutral, direct',
      'format.avoid': 'marketing language',
      'format.structure': 'Comparison table\nPros / cons\nRecommendation for my case\nSources',
      'examples.label': 'Table style',
      'examples.content': '| Tool | Setup time | Git-friendly | Best for |',
    },
    suggestions: {
      'format.outputType': ['Comparison table + recommendation', 'Pros / cons list', 'Summary with sources', 'Timeline'],
      'format.length': ['Under 150 words', 'Under 300 words', 'Detailed report'],
      'format.tone': ['Neutral', 'Direct', 'Skeptical'],
    },
    toggles: { context: { allowUnknown: true, useSearch: true } },
  },
];

export const DEFAULT_PRESET_ID = 'general';

export function getPreset(id) {
  return PRESETS.find((p) => p.id === id) || PRESETS.find((p) => p.id === DEFAULT_PRESET_ID);
}

/** Placeholder for a field under a preset, falling back to the field's own. */
export function placeholderFor(preset, sectionId, fieldId, fallback = '') {
  return preset?.placeholders?.[`${sectionId}.${fieldId}`] ?? fallback;
}

/** Tap-to-fill chips for a field. [] if none. */
export function suggestionsFor(preset, sectionId, fieldId) {
  const key = `${sectionId}.${fieldId}`;
  return preset?.suggestions?.[key] ?? DEFAULT_SUGGESTIONS[key] ?? [];
}

/** Group presets for a <select> with <optgroup>s, keeping array order. */
export function groupedPresets() {
  const groups = new Map();
  for (const p of PRESETS) {
    if (!groups.has(p.group)) groups.set(p.group, []);
    groups.get(p.group).push(p);
  }
  return [...groups.entries()];
}
