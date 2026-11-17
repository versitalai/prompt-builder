// sections.js — the ONLY file you edit to add/change a tab.
//
// Each section = one tab in the UI + one block in the final prompt.
// Shape:
//   id       unique key (used in saved state — don't rename casually)
//   label    tab name
//   heading  markdown heading in the output prompt
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
    label: 'Persona',
    heading: 'Role',
    tip: 'Who is answering? AI "can be anybody, also nobody." Pick the expert you would actually ask. This narrows which knowledge the model draws from.',
    fields: [
      { id: 'role', type: 'text', label: 'You are…', placeholder: 'a senior site reliability engineer at Cloudflare' },
      { id: 'audience', type: 'text', label: 'Writing for…', placeholder: 'both customers and engineers' },
      { id: 'perspective', type: 'textarea', label: 'Extra expertise / perspective (optional)', placeholder: '10 years running incident response; values radical transparency' },
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
    label: 'Task',
    heading: 'Task',
    tip: 'Think first, prompt second. If you can\'t explain it clearly yourself, you can\'t prompt it. Write the goal like you\'re handing it to a human.',
    fields: [
      { id: 'task', type: 'textarea', label: 'What should the AI do?', placeholder: 'Write an apology email about yesterday\'s outage.' },
      { id: 'goal', type: 'textarea', label: 'What does success look like?', placeholder: 'Customers trust us again and understand exactly what broke and what we changed.' },
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
    label: 'Context',
    heading: 'Context',
    tip: 'Most important technique. Whatever you leave out, the model fills in by guessing. More context = fewer hallucinations. Always be contexting.',
    fields: [
      { id: 'facts', type: 'textarea', label: 'Background facts', rows: 6, placeholder: 'On Nov 18, a bad config file doubled in size and crashed our proxy. ~20% of traffic failed for 3 hours…' },
      { id: 'constraints', type: 'textarea', label: 'Constraints (one per line)', placeholder: 'Don\'t blame any vendor\nDon\'t promise dates we can\'t keep' },
      { id: 'allowUnknown', type: 'checkbox', label: 'Give permission to say "I don\'t know" (top hallucination fix)', default: true },
      { id: 'useSearch', type: 'checkbox', label: 'Tell it to search the web for current info', default: false },
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
    label: 'Format',
    heading: 'Output format',
    tip: 'Tell it exactly how the result should look. Easy to forget, biggest punch. Tone alone can turn the same facts into a calm memo or a panicked rant.',
    fields: [
      { id: 'outputType', type: 'text', label: 'Output type', placeholder: 'email with subject line' },
      { id: 'length', type: 'text', label: 'Length', placeholder: 'under 200 words' },
      { id: 'tone', type: 'text', label: 'Tone', placeholder: 'professional, apologetic, radically transparent' },
      { id: 'structure', type: 'textarea', label: 'Structure (one item per line)', placeholder: 'Subject line\nBulleted timeline\nWhat we\'re changing' },
      { id: 'avoid', type: 'text', label: 'Avoid', placeholder: 'corporate fluff, buzzwords' },
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
          { id: 'label', type: 'text', label: 'What this shows', placeholder: 'Tone and ownership' },
          { id: 'content', type: 'textarea', label: 'Example text', placeholder: 'We let you down today. I own that.' },
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
    label: 'Advanced',
    heading: 'Approach',
    tip: 'Optional. Chain of thought = show your work. Tree of thoughts = try several paths, keep the best. Battle of the bots = drafts get critiqued (AI critiques better than it writes).',
    fields: [
      { id: 'cot', type: 'checkbox', label: 'Chain of thought: think step by step first', default: false },
      { id: 'cotSteps', type: 'textarea', label: 'Steps to follow (one per line, optional)', placeholder: 'List the facts\nIdentify what the customer cares about most\nDraft\nCheck every claim against the context', showIf: 'cot' },
      { id: 'tot', type: 'checkbox', label: 'Tree of thoughts: explore approaches, combine the best', default: false },
      { id: 'totBranches', type: 'textarea', label: 'Approaches (one per line; blank = AI picks 3)', placeholder: 'Radical transparency\nCustomer empathy first\nFuture-focused assurance', showIf: 'tot' },
      { id: 'battle', type: 'checkbox', label: 'Battle of the bots: drafts, critique, final', default: false },
      { id: 'battlePersonas', type: 'textarea', label: 'Personas (one per line; LAST one is the critic)', placeholder: 'Engineer\nPR crisis manager\nAngry customer', showIf: 'battle' },
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
