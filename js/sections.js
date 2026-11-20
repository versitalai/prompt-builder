// sections.js — the ONLY file you edit to add/change a tab.
//
// Each section = one tab in the UI + one block in the final prompt.
// Shape:
//   (text fields may have `half: true` to sit side by side;
//    checkbox fields may have `hint`: small grey description under the label)
//   id       unique key (used in saved state — don't rename casually)
//   label    tab name
//   heading  markdown heading in the output prompt
//   icon     icon name from js/icons.js (sidebar + summary)
//   subtitle one-line description under the page title
//   tip      teaching text shown at top of the tab
//   fields   inputs (types: text | textarea | checkbox | list)
//   build(v) -> string   turns this tab's values into prompt text ('' = skip)
//   check(v) -> {level, text} | null   clarity warning shown on Preview tab
//
// Order in this array = tab order = order in the final prompt.

const has = (s) => typeof s === 'string' && s.trim().length > 0;
const linesOf = (s) => (has(s) ? s.split('\n').map((x) => x.trim()).filter(Boolean) : []);
const sentence = (s) => {
  const t = s.trim();
  return /[.!?]$/.test(t) ? t : `${t}.`;
};
const bullets = (arr) => arr.map((x) => `- ${x}`).join('\n');
const numbered = (arr) => arr.map((x, i) => `${i + 1}. ${x}`).join('\n');

export const SECTIONS = [
  {
    id: 'persona',
    icon: 'user',
    subtitle: 'Who is answering, and who are they talking to?',
    label: 'Persona',
    heading: 'Role',
    tip: 'Who is answering? AI "can be anybody, also nobody." Pick the expert you would actually ask. This narrows which knowledge the model draws from.',
    fields: [
      { id: 'role', type: 'text', half: true, label: 'You are…', placeholder: "a gift advisor who knows outdoor sports gear" },
      { id: 'audience', type: 'text', half: true, label: 'Writing for…', placeholder: "me, shopping for a friend" },
      { id: 'perspective', type: 'textarea', label: 'Extra expertise / perspective (optional)', placeholder: "Practical; prefers useful gifts over novelty" },
    ],
    build(v) {
      const out = [];
      if (has(v.role)) out.push(sentence(`You are ${v.role}`));
      if (has(v.audience)) out.push(sentence(`Your audience is ${v.audience}`));
      if (has(v.perspective)) out.push(sentence(v.perspective));
      return out.join(' ');
    },
    check(v) {
      return has(v.role) ? null : { level: 'info', text: 'No persona. Output may sound generic ("nobody" wrote it).' };
    },
  },

  {
    id: 'task',
    icon: 'target',
    subtitle: 'What you want done, and what a good result looks like.',
    label: 'Task',
    heading: 'Task',
    tip: 'Think first, prompt second. If you can\'t explain it clearly yourself, you can\'t prompt it. Write the goal like you\'re handing it to a human.',
    fields: [
      { id: 'task', type: 'textarea', label: 'What should the AI do?', placeholder: "Give me birthday gift ideas for my friend." },
      { id: 'goal', type: 'textarea', label: 'What does success look like?', placeholder: "I can buy one today and know it fits what they love." },
    ],
    build(v) {
      const out = [];
      if (has(v.task)) out.push(v.task.trim());
      if (has(v.goal)) out.push(`Success looks like: ${sentence(v.goal)}`);
      return out.join('\n\n');
    },
    check(v) {
      return has(v.task) ? null : { level: 'warn', text: 'No task. The AI doesn\'t know what to do.' };
    },
  },

  {
    id: 'context',
    icon: 'book',
    subtitle: 'The facts the AI needs so it doesn\'t have to guess.',
    label: 'Context',
    heading: 'Context',
    tip: 'Most important technique. Whatever you leave out, the model fills in by guessing. More context = fewer hallucinations. Always be contexting.',
    fields: [
      { id: 'facts', type: 'textarea', label: 'Background facts', rows: 6, placeholder: "Budget is $30. My friend is 29, loves winter sports, and just switched from snowboarding to skiing." },
      { id: 'constraints', type: 'textarea', label: 'Constraints (one per line)', placeholder: "Must arrive within 3 days\nNo gift cards" },
      { id: 'allowUnknown', type: 'checkbox', label: 'Allow "I don\'t know"', hint: 'The #1 hallucination fix. Without it, the AI guesses to please you.', default: true },
      { id: 'useSearch', type: 'checkbox', label: 'Search the web', hint: 'For anything after the model\'s training cutoff. Watch for bad sources.', default: false },
    ],
    build(v) {
      const out = [];
      if (has(v.facts)) out.push(v.facts.trim());
      const c = linesOf(v.constraints);
      if (c.length) out.push(`Constraints:\n${bullets(c)}`);
      if (v.useSearch) out.push('Search the web for current information. Prefer official, recent sources and note where each fact came from.');
      if (v.allowUnknown) out.push('If something isn\'t in the context provided and you can\'t verify it, say "I don\'t know" instead of guessing. Don\'t invent details.');
      return out.join('\n\n');
    },
    check(v) {
      return has(v.facts) ? null : { level: 'warn', text: 'No context facts. The model will fill gaps by guessing (hallucination risk).' };
    },
  },

  {
    id: 'format',
    icon: 'layout',
    subtitle: 'Exactly how the answer should look.',
    label: 'Format',
    heading: 'Output format',
    tip: 'Tell it exactly how the result should look. Easy to forget, biggest punch. Tone alone can turn the same facts into a calm memo or a panicked rant.',
    fields: [
      { id: 'outputType', type: 'text', half: true, label: 'Output type', placeholder: "numbered list" },
      { id: 'length', type: 'text', half: true, label: 'Length', placeholder: "5 ideas, one line each" },
      { id: 'tone', type: 'text', half: true, label: 'Tone', placeholder: "friendly, specific" },
      { id: 'avoid', type: 'text', half: true, label: 'Avoid', placeholder: "generic ideas like mugs or socks" },
      { id: 'structure', type: 'textarea', label: 'Structure (one item per line)', placeholder: "Idea\nPrice\nWhy it fits" },
    ],
    build(v) {
      const out = [];
      if (has(v.outputType)) out.push(`- Type: ${v.outputType.trim()}`);
      if (has(v.length)) out.push(`- Length: ${v.length.trim()}`);
      if (has(v.tone)) out.push(`- Tone: ${v.tone.trim()}`);
      const s = linesOf(v.structure);
      if (s.length) out.push(`- Structure:\n${s.map((x) => `  - ${x}`).join('\n')}`);
      if (has(v.avoid)) out.push(`- Avoid: ${v.avoid.trim()}`);
      return out.join('\n');
    },
    check(v) {
      const any = ['outputType', 'length', 'tone', 'structure', 'avoid'].some((k) => has(v[k]));
      return any ? null : { level: 'info', text: 'No format. Expect default length and tone.' };
    },
  },

  {
    id: 'examples',
    icon: 'quote',
    subtitle: 'Show the AI what good looks like.',
    label: 'Examples',
    heading: 'Examples',
    tip: 'Few-shot: show, don\'t describe. Short snippets of each quality you want (tone, timeline, technical detail) beat whole documents, which get noisy.',
    fields: [
      {
        id: 'items',
        type: 'list',
        label: 'Examples',
        addLabel: '+ Add example',
        itemFields: [
          { id: 'label', type: 'text', label: 'What this shows', placeholder: "Level of detail" },
          { id: 'content', type: 'textarea', label: 'Example text', placeholder: "1. Ski wax kit ($22): new skiers wax often and rarely own one." },
        ],
      },
    ],
    build(v) {
      const items = (v.items || []).filter((i) => has(i.content));
      if (!items.length) return '';
      const blocks = items.map((it, i) => {
        const title = `### Example ${i + 1}${has(it.label) ? `: ${it.label.trim()}` : ''}`;
        const quoted = it.content.trim().split('\n').map((l) => `> ${l}`).join('\n');
        return `${title}\n${quoted}`;
      });
      return `Match the style, tone, and level of detail of these examples. Don't copy their content.\n\n${blocks.join('\n\n')}`;
    },
    check(v) {
      const n = (v.items || []).filter((i) => has(i.content)).length;
      return n ? null : { level: 'info', text: 'Zero-shot (no examples). Add a few for more consistent output.' };
    },
  },

  {
    id: 'advanced',
    icon: 'sparkles',
    subtitle: 'Optional techniques for harder problems.',
    label: 'Advanced',
    heading: 'Approach',
    tip: 'Optional. Chain of thought = show your work. Tree of thoughts = try several paths, keep the best. Battle of the bots = drafts get critiqued (AI critiques better than it writes).',
    fields: [
      { id: 'cot', type: 'checkbox', label: 'Chain of thought', hint: 'Think step by step before answering. More accuracy, and you can see its work.', default: false },
      { id: 'cotSteps', type: 'textarea', label: 'Steps to follow (one per line, optional)', placeholder: "List what they love\nFilter by budget\nPick the 5 most useful", showIf: 'cot' },
      { id: 'tot', type: 'checkbox', label: 'Tree of thoughts', hint: 'Explore several approaches, compare them, combine the best parts.', default: false },
      { id: 'totBranches', type: 'textarea', label: 'Approaches (one per line; blank = AI picks 3)', placeholder: "Practical gear\nAn experience\nFunny / personal", showIf: 'tot' },
      { id: 'battle', type: 'checkbox', label: 'Battle of the bots', hint: 'Personas write drafts, a critic tears them apart, then they write one final version.', default: false },
      { id: 'battlePersonas', type: 'textarea', label: 'Personas (one per line; LAST one is the critic)', placeholder: "Gift advisor\nBest friend\nThe birthday person", showIf: 'battle' },
    ],
    build(v) {
      const out = [];
      if (v.cot) {
        const steps = linesOf(v.cotSteps);
        out.push(steps.length
          ? `Before answering, think step by step:\n${numbered(steps)}`
          : 'Before answering, think through the problem step by step.');
      }
      if (v.tot) {
        const b = linesOf(v.totBranches);
        out.push(b.length
          ? `Explore these approaches separately:\n${numbered(b)}\nEvaluate each one's strengths and weaknesses, then combine the best parts into one final answer.`
          : 'Brainstorm three distinct approaches. Evaluate each one\'s strengths and weaknesses, then combine the best parts into one final answer.');
      }
      if (v.battle) {
        let p = linesOf(v.battlePersonas);
        if (p.length < 2) p = ['Engineer', 'PR crisis manager', 'Angry customer'];
        const critic = p[p.length - 1];
        const drafters = p.slice(0, -1);
        out.push([
          'Run a three-round competition:',
          `- Round 1: ${drafters.join(' and ')} each write their own draft.`,
          `- Round 2: ${critic} reads every draft and critiques it brutally and specifically.`,
          `- Round 3: ${drafters.join(' and ')} use that feedback to write one final version together.`,
          'Show all rounds, then the final version last.',
        ].join('\n'));
      }
      return out.join('\n\n');
    },
    check() {
      return null;
    },
  },
];
