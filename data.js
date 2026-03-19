// Build Atlas — Worked Example: Stakeholder Atlas
// AI-powered stakeholder complexity navigation tool

const STAGE_METADATA = {
  intent:     { label: 'Intent',       icon: '◎',  color: '#7c3aed', zone: 'concept' },
  use_case:   { label: 'Use Cases',    icon: '◉',  color: '#4f46e5', zone: 'concept' },
  capability: { label: 'Capabilities', icon: '⬡',  color: '#1d4ed8', zone: 'architecture' },
  module:     { label: 'Modules',      icon: '⊟',  color: '#0891b2', zone: 'architecture' },
  layer:      { label: 'Layers',       icon: '≡',  color: '#059669', zone: 'architecture' },
  pattern:    { label: 'Patterns',     icon: '⚙',  color: '#b45309', zone: 'implementation' },
  component:  { label: 'Components',   icon: '⬛', color: '#c2410c', zone: 'implementation' },
  code:       { label: 'Code',         icon: '</>', color: '#b91c1c', zone: 'implementation' }
};

const STAGE_ORDER = ['intent', 'use_case', 'capability', 'module', 'layer', 'pattern', 'component', 'code'];

const project = {
  id: 'stakeholder-atlas',
  name: 'Stakeholder Atlas',
  summary: 'An AI-powered tool that helps teams navigate stakeholder complexity through visual relationship mapping and AI-generated insight.',
  intent_meta: {
    problem: 'Stakeholder information lives scattered across documents, emails, and memory — making it hard to form a coherent picture before critical decisions.',
    users: ['Product managers', 'Strategy leads', 'Consultants', 'Team leads in complex organizations'],
    outcome: 'Teams see actors, tensions, priorities, and AI-generated action insights in one navigable, shareable view.',
    constraints: ['No complex backend required in v1', 'Usable without data science expertise', 'Loads fast in any modern browser']
  },
  stages: [

    // ─── INTENT ──────────────────────────────────────────────
    {
      id: 'int-1', type: 'intent',
      title: 'Navigate Stakeholder Complexity',
      description: 'Help teams quickly understand who matters, what they want, and where tensions or alignments exist — before decisions are made or meetings happen.',
      decision_points: [
        'Is the primary user an individual or a team?',
        'Do we support data import or only manual entry in v1?',
        'What is the minimum viable insight we must surface?'
      ],
      prototype_path: ['Start with a static JSON stakeholder model', 'Build graph visualization from hardcoded data'],
      scale_path: ['Add live data ingestion', 'Multi-user collaboration', 'LLM-powered relationship extraction from unstructured text'],
      parent_ids: [],
      artifacts: []
    },

    // ─── USE CASES ───────────────────────────────────────────
    {
      id: 'uc-1', type: 'use_case',
      title: 'Map a Stakeholder Landscape',
      description: 'Upload or define stakeholders, then see them arranged visually showing roles, interests, and connections across the system.',
      decision_points: ['Manual entry vs. file upload vs. AI extraction?', 'How much structure to enforce upfront?'],
      prototype_path: ['Use hardcoded sample stakeholder JSON'],
      scale_path: ['Allow CSV/document upload', 'AI-assisted entity extraction from pasted text'],
      parent_ids: ['int-1'], artifacts: []
    },
    {
      id: 'uc-2', type: 'use_case',
      title: 'Identify Tensions and Alignments',
      description: 'Surface where stakeholders agree or conflict on priorities — providing actionable insight for facilitation and decision preparation.',
      decision_points: ['Manual tagging vs. AI inference of tensions?', 'How are "tensions" defined — by user or by system?'],
      prototype_path: ['Encode tensions directly in sample JSON'],
      scale_path: ['AI detection of conflicting interests from free-form text'],
      parent_ids: ['int-1'], artifacts: []
    },
    {
      id: 'uc-3', type: 'use_case',
      title: 'Generate an AI Stakeholder Briefing',
      description: 'Produce a concise, structured summary of the stakeholder landscape before a meeting or major decision.',
      decision_points: ['Which LLM provider to use?', 'How to structure and format the briefing output?'],
      prototype_path: ['Display a hardcoded sample AI briefing in the insight panel'],
      scale_path: ['Connect to OpenAI/Anthropic API', 'Customizable briefing templates', 'Exportable briefing documents'],
      parent_ids: ['int-1'], artifacts: []
    },

    // ─── CAPABILITIES ─────────────────────────────────────────
    {
      id: 'cap-1', type: 'capability',
      title: 'Ingest Stakeholder Data',
      description: 'Accept structured or unstructured stakeholder information and normalize it into a data model the system can work with.',
      decision_points: ['JSON-first or form-based entry?', 'What is the minimum required schema?'],
      prototype_path: ['Hardcoded JSON file served as mock data'],
      scale_path: ['File upload parser', 'AI extraction endpoint', 'CRM/HRIS integration adapters'],
      parent_ids: ['uc-1'], artifacts: []
    },
    {
      id: 'cap-2', type: 'capability',
      title: 'Visualize Relationships',
      description: 'Render stakeholders and their connections in an interactive, navigable graph or spatial view with selectable nodes.',
      decision_points: ['Force-directed vs. fixed layout?', 'D3.js vs. Cytoscape vs. custom canvas?'],
      prototype_path: ['D3 force simulation in a single HTML page'],
      scale_path: ['Performant canvas/WebGL renderer for large graphs', 'Layout optimization and presets'],
      parent_ids: ['uc-1', 'uc-2'], artifacts: []
    },
    {
      id: 'cap-3', type: 'capability',
      title: 'Detect Tensions and Alignments',
      description: 'Identify conflicting priorities or relationship gaps and surface them as clear visual signals in the interface.',
      decision_points: ['Explicit vs. inferred detection?', 'How to visually distinguish tension from alignment?'],
      prototype_path: ['Tag edges with tension/alignment type in sample data'],
      scale_path: ['LLM classification of relationships', 'Priority conflict scoring algorithm'],
      parent_ids: ['uc-2'], artifacts: []
    },
    {
      id: 'cap-4', type: 'capability',
      title: 'Generate AI Insights',
      description: 'Use an LLM to produce briefings, identify patterns, suggest facilitation approaches, or flag risks across the stakeholder landscape.',
      decision_points: ['When to call AI — on demand or automatically?', 'How to make AI output trustworthy and editable?'],
      prototype_path: ['Display hardcoded AI output in insight panel'],
      scale_path: ['Live LLM API calls', 'User-editable AI output with confidence indicators'],
      parent_ids: ['uc-3'], artifacts: []
    },
    {
      id: 'cap-5', type: 'capability',
      title: 'Filter and Focus',
      description: 'Allow users to narrow the graph view by role, priority, relationship type, or custom tags to focus on what matters most.',
      decision_points: ['Pre-defined filter types vs. user-defined?', 'Filter state in URL for shareability?'],
      prototype_path: ['Simple tag-based filter buttons updating graph state'],
      scale_path: ['Saved filter views', 'Semantic search', 'Collaborative highlights and annotations'],
      parent_ids: ['uc-1', 'uc-2'], artifacts: []
    },

    // ─── MODULES ──────────────────────────────────────────────
    {
      id: 'mod-1', type: 'module',
      title: 'Data Intake Module',
      description: 'Handles ingestion, parsing, validation, and normalization of stakeholder information into the internal graph model.',
      decision_points: ['Strict schema enforcement or flexible parsing?'],
      prototype_path: ['Load hardcoded JSON at startup'],
      scale_path: ['Upload handler', 'Schema validator with user-friendly error messages', 'AI extraction adapter'],
      parent_ids: ['cap-1'], artifacts: []
    },
    {
      id: 'mod-2', type: 'module',
      title: 'Graph Workspace',
      description: 'The interactive canvas showing stakeholders as nodes, relationships as edges, and tensions/alignments as visual signals.',
      decision_points: ['Layout algorithm choice — force vs. hierarchical', 'Touch/mobile support scope?'],
      prototype_path: ['D3 force simulation + SVG rendering in browser'],
      scale_path: ['WebGL canvas renderer for scale', 'Layout presets', 'Export to image or PDF'],
      parent_ids: ['cap-2', 'cap-5'], artifacts: []
    },
    {
      id: 'mod-3', type: 'module',
      title: 'Insight Engine',
      description: 'AI-powered analysis layer that detects tensions, generates briefings, and surfaces action suggestions for the team.',
      decision_points: ['LLM provider abstraction strategy?', 'Caching for repeated queries?'],
      prototype_path: ['Static insight text displayed in side panel'],
      scale_path: ['OpenAI / Anthropic API integration', 'Streaming responses', 'User feedback loop for quality'],
      parent_ids: ['cap-3', 'cap-4'], artifacts: []
    },
    {
      id: 'mod-4', type: 'module',
      title: 'Filtering & Views',
      description: 'Controls for filtering by role, tag, or relationship type; view presets and focus modes for the graph workspace.',
      decision_points: ['How many filter dimensions in v1?', 'URL state for shareable filtered views?'],
      prototype_path: ['Simple role/tag filter buttons updating graph state'],
      scale_path: ['Saved view profiles', 'Smart semantic filters', 'Collaborative focus modes'],
      parent_ids: ['cap-5'], artifacts: []
    },

    // ─── LAYERS ───────────────────────────────────────────────
    {
      id: 'lay-ui', type: 'layer',
      title: 'UI Layer',
      description: 'All visual surfaces: graph canvas, detail drawer, filter controls, toolbar, and the overall layout framework.',
      layer_group: 'ui',
      decision_points: ['Framework vs. vanilla JS for v1?', 'Responsive design priority in scope?'],
      prototype_path: ['Vanilla HTML/CSS/JS with flexbox layout'],
      scale_path: ['React or Vue component system', 'Shared design system integration'],
      parent_ids: ['mod-2', 'mod-4'], artifacts: []
    },
    {
      id: 'lay-logic', type: 'layer',
      title: 'Logic Layer',
      description: 'Relationship parsing, filter logic, tension detection rules, application state management, and event coordination between modules.',
      layer_group: 'logic',
      decision_points: ['Central state store vs. distributed component state?', 'Event bus vs. direct function calls?'],
      prototype_path: ['Plain JavaScript module with shared state object'],
      scale_path: ['Redux or Zustand for state management', 'Event-driven architecture with typed events'],
      parent_ids: ['mod-1', 'mod-3', 'mod-4'], artifacts: []
    },
    {
      id: 'lay-data', type: 'layer',
      title: 'Data Layer',
      description: 'JSON schema definition, in-memory graph model, actor and relationship entities, and data transformation utilities.',
      layer_group: 'data',
      decision_points: ['Storage format — JSON vs. relational?', 'Client-side only or persistent backend?'],
      prototype_path: ['Static JSON file as the single source of truth'],
      scale_path: ['IndexedDB for local persistence', 'REST or GraphQL API layer for multi-user scenarios'],
      parent_ids: ['mod-1'], artifacts: []
    },
    {
      id: 'lay-ai', type: 'layer',
      title: 'AI Layer',
      description: 'Prompt templates, LLM integration interface, response parsing, error handling, and output quality signals.',
      layer_group: 'ai',
      decision_points: ['Provider-agnostic abstraction needed?', 'How to version and test prompt changes?'],
      prototype_path: ['Hardcoded prompt templates + sample static output'],
      scale_path: ['LLM provider adapter pattern', 'Prompt versioning and evaluation pipeline'],
      parent_ids: ['mod-3'], artifacts: []
    },

    // ─── PATTERNS ─────────────────────────────────────────────
    {
      id: 'pat-1', type: 'pattern',
      title: 'Client-side Graph Rendering',
      description: 'Use D3.js force simulation for layout; all graph processing happens in-browser. No server required for the visual layer.',
      decision_points: ['Force-directed vs. dagre hierarchical layout?', 'Node collision detection strategy?'],
      prototype_path: ['D3 v7 force simulation + SVG-based rendering'],
      scale_path: ['Canvas or WebGL renderer for performance at scale', 'Server-side layout precomputation for large graphs'],
      parent_ids: ['lay-ui', 'lay-logic'], artifacts: []
    },
    {
      id: 'pat-2', type: 'pattern',
      title: 'JSON-driven Data Model',
      description: 'Stakeholder data stored as structured JSON with actors, relationships, and metadata — portable, human-readable, and AI-generatable.',
      decision_points: ['Schema strictness level?', 'Versioning strategy for schema evolution?'],
      prototype_path: ['Single stakeholders.json file with sample content'],
      scale_path: ['JSON Schema validation with rich error messages', 'GraphQL schema with type evolution'],
      parent_ids: ['lay-data'], artifacts: []
    },
    {
      id: 'pat-3', type: 'pattern',
      title: 'Prompt Chaining for Insights',
      description: 'Sequential LLM calls: first extract entities and relationships, then detect tensions, then generate the narrative summary briefing.',
      decision_points: ['Sequential vs. parallel LLM calls?', 'Error handling between chained steps?'],
      prototype_path: ['Single combined prompt returning mock JSON output'],
      scale_path: ['LangChain or LlamaIndex orchestration', 'Streaming output directly to the UI'],
      parent_ids: ['lay-ai'], artifacts: []
    },

    // ─── COMPONENTS ───────────────────────────────────────────
    {
      id: 'cmp-1', type: 'component',
      title: 'Graph Canvas',
      description: 'SVG-based interactive graph renderer showing actors as nodes and relationships as labeled edges. Supports zoom, pan, hover tooltips, and click-to-select.',
      parent_ids: ['pat-1'],
      artifacts: [
        {
          type: 'code', title: 'graph-canvas.js',
          content: `const svg = d3.select('#graph')
  .attr('width', width)
  .attr('height', height);

const simulation = d3.forceSimulation(nodes)
  .force('link', d3.forceLink(links)
    .id(d => d.id).distance(120))
  .force('charge', d3.forceManyBody().strength(-400))
  .force('center', d3.forceCenter(width / 2, height / 2))
  .force('collision', d3.forceCollide().radius(42));`
        }
      ]
    },
    {
      id: 'cmp-2', type: 'component',
      title: 'Details Drawer',
      description: 'Side panel that opens when a stakeholder node is selected, showing their role, interests, relationships, and AI-generated notes.',
      parent_ids: ['pat-1'],
      artifacts: [
        {
          type: 'code', title: 'details-drawer.js',
          content: `function openDrawer(actor) {
  document.getElementById('drawer-name')
    .textContent = actor.name;
  document.getElementById('drawer-role')
    .textContent = actor.role;
  document.getElementById('drawer-interests').innerHTML =
    actor.interests.map(i => \`<li>\${i}</li>\`).join('');
  document.getElementById('drawer')
    .classList.add('open');
}`
        }
      ]
    },
    {
      id: 'cmp-3', type: 'component',
      title: 'Stakeholder Schema',
      description: 'JSON schema defining actors with roles, interests and priorities, plus relationships with type, strength, and human-readable labels.',
      parent_ids: ['pat-2'],
      artifacts: [
        {
          type: 'schema', title: 'stakeholder.schema.json',
          content: `{
  "actors": [{
    "id": "string",
    "name": "string",
    "role": "string",
    "interests": ["string"],
    "priority": 1
  }],
  "relationships": [{
    "source": "string",
    "target": "string",
    "type": "tension | alignment | neutral",
    "strength": 0.5,
    "label": "string"
  }]
}`
        }
      ]
    },
    {
      id: 'cmp-4', type: 'component',
      title: 'Relationship Parser',
      description: 'Normalizes and enriches relationship data from raw JSON or AI-generated output into the internal typed graph model.',
      parent_ids: ['pat-2', 'pat-3'],
      artifacts: [
        {
          type: 'code', title: 'relationship-parser.js',
          content: `function parseRelationships(rawData) {
  return rawData.relationships.map(rel => ({
    source: rel.source,
    target: rel.target,
    type: rel.type || 'neutral',
    strength: rel.strength ?? 0.5,
    label: rel.label || ''
  }));
}`
        }
      ]
    },
    {
      id: 'cmp-5', type: 'component',
      title: 'Prompt Templates',
      description: "Structured prompt templates for entity extraction, tension detection, and briefing generation — the AI layer's primary interface definition.",
      parent_ids: ['pat-3'],
      artifacts: [
        {
          type: 'prompt', title: 'prompts.js',
          content: `const EXTRACTION_PROMPT = \`
Given the following stakeholder information,
extract all actors and relationships.
Return JSON matching the stakeholder schema.

Input: {input}
\`;

const BRIEFING_PROMPT = \`
Analyze this stakeholder map and produce:
1. A 3-sentence executive summary
2. Top 2 tensions requiring attention
3. One alignment opportunity

Return as JSON with keys:
summary, tensions[], opportunity
\`;`
        }
      ]
    },

    // ─── CODE ARTIFACTS ───────────────────────────────────────
    {
      id: 'cod-1', type: 'code',
      title: 'App Shell',
      description: 'Main HTML page with the graph container, sidebar drawer, filter toolbar, and all script/style references. The structural entry point.',
      parent_ids: ['cmp-1', 'cmp-2'],
      artifacts: [
        {
          type: 'code', title: 'index.html',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Stakeholder Atlas</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>
    <h1>Stakeholder Atlas</h1>
    <div id="filter-bar"><!-- tag filters --></div>
  </header>
  <main>
    <div id="graph-container">
      <svg id="graph"></svg>
    </div>
    <aside id="drawer"><!-- detail panel --></aside>
  </main>
  <script src="data.js"></script>
  <script src="app.js"></script>
</body>
</html>`
        }
      ]
    },
    {
      id: 'cod-2', type: 'code',
      title: 'D3 Graph Renderer',
      description: 'Force-directed layout with node and edge rendering, zoom/pan behavior, hover tooltips, and click-to-select with state management.',
      parent_ids: ['cmp-1'],
      artifacts: [
        {
          type: 'code', title: 'graph.js',
          content: `// D3 force simulation setup
const simulation = d3.forceSimulation(nodes)
  .force('link', d3.forceLink(links)
    .id(d => d.id).distance(120))
  .force('charge', d3.forceManyBody().strength(-400))
  .force('center', d3.forceCenter(width / 2, height / 2))
  .force('collision', d3.forceCollide().radius(40));

// Edge color by relationship type
const edgeColor = {
  tension:   '#ef4444',
  alignment: '#10b981',
  neutral:   '#94a3b8'
};`
        }
      ]
    },
    {
      id: 'cod-3', type: 'code',
      title: 'Sample Stakeholder Data',
      description: 'Sample stakeholder data in JSON format following the schema. Serves as the single source of truth for the v1 prototype.',
      parent_ids: ['cmp-3', 'cmp-4'],
      artifacts: [
        {
          type: 'schema', title: 'data.js',
          content: `const stakeholderData = {
  actors: [
    { id: "ceo", name: "CEO", role: "Sponsor",
      interests: ["ROI", "Market position"],
      priority: 5 },
    { id: "pm", name: "Product Manager",
      role: "Driver",
      interests: ["User adoption", "Roadmap clarity"],
      priority: 4 },
    { id: "eng", name: "Engineering Lead",
      role: "Delivery",
      interests: ["Technical quality", "Realistic scope"],
      priority: 4 }
  ],
  relationships: [
    { source: "ceo", target: "pm",
      type: "alignment", strength: 0.7 },
    { source: "pm", target: "eng",
      type: "tension", strength: 0.8,
      label: "Scope vs. delivery time" }
  ]
};`
        }
      ]
    },
    {
      id: 'cod-4', type: 'code',
      title: 'AI Prompt Contract',
      description: 'System prompts and user prompt templates defining the AI layer\'s interface, expectations, and output format contracts.',
      parent_ids: ['cmp-5'],
      artifacts: [
        {
          type: 'prompt', title: 'prompts.js',
          content: `// System prompt for all requests
export const SYSTEM_PROMPT = \`
You are a stakeholder analysis assistant.
Extract structured information from text into JSON.
Always follow the provided schema exactly.
Be concise and factual — avoid speculation.\`;

// Briefing generation prompt
export const BRIEFING_PROMPT = \`
Analyze the following stakeholder map.
Produce a JSON response with these keys:
- summary: string (3 sentences)
- tensions: string[] (top 2)
- opportunity: string (1 alignment opportunity)
- recommended_actions: string[] (top 3)
\`;`
        }
      ]
    }
  ]
};

// ─── Derived indexes built at load time ────────────────────
const nodesById = {};
project.stages.forEach(n => { nodesById[n.id] = n; });

const childrenById = {};
project.stages.forEach(n => {
  (n.parent_ids || []).forEach(pid => {
    if (!childrenById[pid]) childrenById[pid] = [];
    childrenById[pid].push(n.id);
  });
});

// Groups stages by type for layout
const stagesByType = {};
STAGE_ORDER.forEach(t => { stagesByType[t] = []; });
project.stages.forEach(n => {
  if (stagesByType[n.type]) stagesByType[n.type].push(n);
});
