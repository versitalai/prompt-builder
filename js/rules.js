// rules.js — DATA for the Rules page: the prompting rules from the video.
// Quotes are short excerpts from the auto-captions ([brackets] = caption fixes).
// Each rule: id, title, summary (our words), quotes [{text, by?}], tryLine?, tab? (section id to jump to).

export const SOURCE = {
  title: "You SUCK at Prompting AI (Here's the secret)",
  by: 'NetworkChuck',
  url: 'https://www.youtube.com/watch?v=pwWBcsxEoLk',
};

export const CHECKLIST = [
  { text: 'Persona: did I say who is answering?', tab: 'persona' },
  { text: 'Context: did I give every fact it needs, so it has nothing to guess?', tab: 'context' },
  { text: 'Permission to fail: did I tell it to say "I don\'t know"?', tab: 'context' },
  { text: 'Format: type, length, tone, structure, what to avoid?', tab: 'format' },
  { text: 'Examples: did I show a short snippet of what good looks like?', tab: 'examples' },
  { text: 'Hard problem? Turn on thinking, or try step-by-step, several paths, or a critique round.', tab: 'advanced' },
  { text: 'Human test: would a person have enough to do this?', tab: 'task' },
];

export const RULES = [
  {
    id: 'what', title: 'What a prompt is',
    summary: 'The AI predicts what comes next from your words. Focused words get focused predictions.',
    quotes: [
      { text: "a prompt just isn't a question, it's a program. You aren't asking the ai, you're programming it with words." },
      { text: "If your pattern is vague, the AI guesses anything, but if it's more focused, you'll get way better results." },
    ],
  },
  {
    id: 'persona', title: 'Persona', tab: 'persona',
    summary: 'Name the expert you would actually ask. Works in a normal chat message, not only the system prompt.',
    quotes: [{ text: 'AI can be anybody. Also nobody.' }],
    tryLine: 'You are a senior Roblox engineer. You are writing for a solo dev who knows Lua basics.',
  },
  {
    id: 'context', title: 'Context (the most important)', tab: 'context',
    summary: "Every gap you leave gets filled with a guess. Models are frozen at their training date, and web search can pick bad sources. Give all the context every time, even if you think it remembers.",
    quotes: [
      { text: "whatever context or information you don't include, it's going to fill in those gaps itself." },
      { text: 'more context equals less hallucinations.' },
    ],
    tryLine: 'Budget is $30. My friend is 29, loves winter sports, and just switched from snowboarding to skiing.',
  },
  {
    id: 'fail', title: 'Permission to fail (#1 hallucination fix)', tab: 'context',
    summary: 'Tell it to say "I don\'t know" when the answer isn\'t in your context. Credited to Anthropic\'s prompting docs.',
    quotes: [{ text: "If you don't say that, it will lie to please you." }],
    tryLine: 'If it\'s not in the context I gave you and you can\'t verify it, say "I don\'t know" instead of guessing.',
  },
  {
    id: 'format', title: 'Output format', tab: 'format',
    summary: 'Spell out the type, length, tone, structure, and what to avoid. Tone alone changes everything.',
    quotes: [{ text: 'telling the LLM exactly how you want the result to look is kind of a superpower.' }],
    tryLine: 'Output: numbered list, 5 items, one line each. Tone: friendly, specific. Avoid: generic ideas.',
  },
  {
    id: 'fewshot', title: 'Few-shot examples', tab: 'examples',
    summary: 'Show, don\'t describe. Short snippets, one per quality you want. Whole documents get noisy and confuse it.',
    quotes: [{ text: "we're not describing the output, we're showing the output" }],
    tryLine: 'Match the style of these examples, not their content:',
  },
  {
    id: 'cot', title: 'Chain of thought', tab: 'advanced',
    summary: 'Think step by step before answering: higher accuracy, and you can see its reasoning. "Extended thinking" does this automatically; still list the steps for repeatable processes.',
    quotes: [{ text: '95% of all practical problems folks encounter can be solved by turning on extended thinking.', by: 'Ethan Mollick' }],
    tryLine: 'Before answering, think step by step: 1. … 2. … 3. …',
  },
  {
    id: 'tot', title: 'Tree of thoughts', tab: 'advanced',
    summary: 'Explore several approaches, evaluate each, then combine the best parts. The first idea is rarely the best.',
    quotes: [{ text: "the first idea isn't always best." }],
    tryLine: 'Brainstorm 3 distinct approaches, evaluate each, and combine the best into one answer.',
  },
  {
    id: 'battle', title: 'Battle of the bots', tab: 'advanced',
    summary: 'Personas each write a draft, a critic tears them apart, then they write one final version. Breaks the "average" answer.',
    quotes: [{ text: 'AI is normally better at critiquing or editing than original writing.' }],
    tryLine: 'Engineer and PR manager each draft; an angry customer critiques; then write one final version together.',
  },
  {
    id: 'meta', title: 'The meta-skill: clarity', tab: 'task',
    summary: 'The techniques don\'t make the AI smarter; they make you clearer. Write the goal first and attack it from different angles (Daniel Miessler\'s method). Save prompts that work in a library.',
    quotes: [
      { text: "if you can't explain it clearly yourself, you can't prompt it." },
      { text: 'Treat everything as like a personal skill issue.', by: 'Joseph Thacker' },
    ],
    tryLine: 'Would a human have enough information to do this? Then an AI probably does too.',
  },
];
