// AssemblyLane — Worked Example: AI Incident Response Assistant

const STAGE_METADATA = {
  intent:     { label: 'Intent',       icon: '◎',   color: '#c084fc', zone: 'concept' },
  use_case:   { label: 'Use Cases',    icon: '◉',   color: '#7dd8f8', zone: 'concept' },
  capability: { label: 'Capabilities', icon: '⬡',   color: '#4efcb8', zone: 'architecture' },
  module:     { label: 'Modules',      icon: '⊟',   color: '#52e8a0', zone: 'architecture' },
  layer:      { label: 'Layers',       icon: '≡',   color: '#fbcB3a', zone: 'architecture' },
  pattern:    { label: 'Patterns',     icon: '⚙',   color: '#ffb347', zone: 'implementation' },
  component:  { label: 'Components',   icon: '⬛',  color: '#ff6b6b', zone: 'implementation' },
  code:       { label: 'Code',         icon: '</>', color: '#7dd8f8', zone: 'implementation' }
};

const STAGE_ORDER = ['intent', 'use_case', 'capability', 'module', 'layer', 'pattern', 'component', 'code'];

const project = {
  id: 'assemblylane-incident-response',
  name: 'AssemblyLane',
  summary: 'An architecture journey interface showing how an AI Incident Response Assistant moves from operational intent to concrete implementation artifacts.',
  intent_meta: {
    problem: 'Incident response teams have alert data, runbooks, and tribal knowledge, but they lack a navigable explanation layer that shows how AI suggestions are produced and when responders should trust them.',
    users: ['Platform engineering teams', 'Incident commanders', 'AI product builders', 'Security and reliability leads'],
    outcome: 'Teams can teach, inspect, and evolve an AI incident workflow by tracing every module, dependency, and code artifact from purpose to execution.',
    constraints: ['Human approval must remain in the loop for outward communication', 'Prototype is read-only for automated actions', 'Trust signals and auditability are first-class requirements']
  },
  stages: [
    {
      id: 'int-1', type: 'intent',
      title: 'Shorten time-to-understanding during incidents',
      description: 'Create a system that helps responders move from noisy alerts to trusted action faster, while making the reasoning, confidence, and context legible to humans.',
      decision_points: [
        'How much autonomy can the assistant have before human review is mandatory?',
        'What trust signals must be visible before responders act on AI guidance?',
        'Which incident classes are in-scope for the first release?'
      ],
      prototype_path: [
        'Start with a read-only assistant that assembles diagnosis and suggested runbook steps.',
        'Use seeded incidents and curated runbooks so the teaching layer is stable during demos.'
      ],
      scale_path: [
        'Expand to multiple incident classes with policy-based guardrails.',
        'Add evaluation loops that compare AI advice to human postmortem outcomes.'
      ],
      teaching_note: 'Teams often frame incident tooling as automation first. The stronger starting point is comprehension: responders need to see why the system thinks a particular action is safe.',
      parent_ids: [],
      artifacts: []
    },
    {
      id: 'uc-1', type: 'use_case',
      title: 'Triage a fresh production alert',
      description: 'An on-call engineer receives an alert and wants the assistant to normalize the signal, gather relevant context, and suggest likely next actions.',
      decision_points: [
        'What alert payload fields are required to begin diagnosis?',
        'Do we let responders ask follow-up questions in free-form chat or use structured prompts first?'
      ],
      prototype_path: [
        'Use PagerDuty-style sample payloads and a fixed set of historical incidents.',
        'Display recommendations in the responder interface with confidence scores.'
      ],
      scale_path: [
        'Support multi-source correlation across metrics, logs, and deployment events.',
        'Personalize recommended actions based on service ownership and escalation policy.'
      ],
      teaching_note: 'The first user need is not a perfect root-cause answer; it is rapid orientation. The architecture should optimize for fast context assembly before deep analysis.',
      parent_ids: ['int-1'],
      artifacts: []
    },
    {
      id: 'uc-2', type: 'use_case',
      title: 'Draft stakeholder-ready incident updates',
      description: 'An incident commander wants concise, context-aware communication drafts that reflect current confidence, impact, and next review time.',
      decision_points: [
        'How should the system separate internal hypotheses from externally shareable statements?',
        'What must be human-approved before anything is sent?'
      ],
      prototype_path: [
        'Generate drafts but keep delivery disabled.',
        'Show source evidence for each statement in the draft.'
      ],
      scale_path: [
        'Add channel-specific templates for status pages, Slack, and customer email.',
        'Track which phrasing patterns reduce confusion during ongoing incidents.'
      ],
      teaching_note: 'Communication is part of the architecture, not a downstream afterthought. The system must preserve uncertainty without sounding evasive.',
      parent_ids: ['int-1'],
      artifacts: []
    },
    {
      id: 'uc-3', type: 'use_case',
      title: 'Audit what happened after the incident',
      description: 'A reliability lead needs to inspect what the assistant saw, suggested, and logged so they can evaluate trustworthiness and improve the workflow.',
      decision_points: [
        'What events are immutable and what can be amended with annotations?',
        'How detailed should the timeline be for AI prompts, retrieved context, and user actions?'
      ],
      prototype_path: [
        'Log every recommendation, approval, and UI action to a single timeline stream.',
        'Provide direct links from timeline events back to the module that produced them.'
      ],
      scale_path: [
        'Add policy retention windows and searchable audit exports.',
        'Compare model outputs over time to detect drift in operational guidance.'
      ],
      teaching_note: 'The post-incident view is where teams learn whether the AI layer was useful, noisy, or misleading. Auditability has to be designed up-front.',
      parent_ids: ['int-1'],
      artifacts: []
    },
    {
      id: 'cap-1', type: 'capability',
      title: 'Normalize incident signals',
      description: 'Convert alerts from PagerDuty, Datadog, and Prometheus into a canonical incident object the rest of the system can reason about.',
      decision_points: [
        'Do we enforce a strict canonical schema or preserve provider-specific fields?',
        'How do we represent missing metadata without blocking downstream modules?'
      ],
      prototype_path: [
        'Map a few known providers to a shared incident envelope.',
        'Store raw payload alongside normalized fields for debugging.'
      ],
      scale_path: [
        'Add schema versioning and ingestion validation dashboards.',
        'Introduce enrichment from CMDB, service catalog, and deployment metadata.'
      ],
      teaching_note: 'AI systems fail quietly when upstream normalization is fuzzy. If the incident object is ambiguous, every later confidence score becomes suspect.',
      parent_ids: ['uc-1'],
      artifacts: []
    },
    {
      id: 'cap-2', type: 'capability',
      title: 'Retrieve operational context',
      description: 'Find the most relevant runbooks, recent postmortems, service docs, and historical incidents for the current event.',
      decision_points: [
        'When do we use semantic search versus deterministic lookup?',
        'How do we show why a particular document was retrieved?'
      ],
      prototype_path: [
        'Seed a vector store with a small corpus of runbooks and postmortems.',
        'Render citations and relevance hints in the diagnosis response.'
      ],
      scale_path: [
        'Blend vector retrieval with service ownership and topology metadata.',
        'Evaluate retrieval quality against curated incident test sets.'
      ],
      teaching_note: 'Developers often assume retrieval is just search. In incident response it is also evidence selection, so provenance and relevance are part of the product surface.',
      risk_warning: 'Poor retrieval creates convincing but context-free diagnoses. Always expose source documents and freshness signals.',
      parent_ids: ['uc-1', 'uc-3'],
      artifacts: []
    },
    {
      id: 'cap-3', type: 'capability',
      title: 'Generate explainable diagnosis',
      description: 'Produce a structured diagnosis with probable root cause, blast radius, confidence score, and ranked recommended actions.',
      decision_points: [
        'What structured output contract do responders need?',
        'How should the model communicate low confidence or conflicting evidence?'
      ],
      prototype_path: [
        'Use one model call that returns JSON with confidence, hypothesis, and actions.',
        'Require supporting evidence snippets before a recommendation is shown.'
      ],
      scale_path: [
        'Add model routing by incident type and evaluation on historical datasets.',
        'Separate diagnosis generation from recommendation ranking for clearer failure modes.'
      ],
      teaching_note: 'The goal is not to sound certain; it is to help humans decide. Diagnosis quality depends as much on output structure and calibration as on the model itself.',
      risk_warning: 'LLMs can overstate certainty during high-pressure incidents. Pair every diagnosis with confidence rationale and fallback instructions.',
      parent_ids: ['uc-1', 'uc-2'],
      artifacts: []
    },
    {
      id: 'cap-4', type: 'capability',
      title: 'Guide human-approved action',
      description: 'Surface runbook steps and communication drafts with enough context that responders can approve, reject, or adapt them safely.',
      decision_points: [
        'How do we distinguish assistive suggestions from executable actions?',
        'What approvals are required for technical actions versus stakeholder communication?'
      ],
      prototype_path: [
        'Keep execution read-only and present suggested runbook steps in sequence.',
        'Provide editable communication drafts with highlighted evidence.'
      ],
      scale_path: [
        'Add policy-aware action automation for low-risk remediations.',
        'Integrate approval flows with chatops and incident command workflows.'
      ],
      teaching_note: 'Most teams over-focus on AI generation and under-design the approval surface. The human review step is where operational trust is earned.',
      parent_ids: ['uc-2'],
      artifacts: []
    },
    {
      id: 'cap-5', type: 'capability',
      title: 'Record a defensible incident trail',
      description: 'Capture alerts, retrieved context, model outputs, human approvals, and communication history in a timeline responders can revisit.',
      decision_points: [
        'Which timeline events are mandatory for compliance and postmortem analysis?',
        'How should we link timeline events back to source modules and artifacts?'
      ],
      prototype_path: [
        'Write all timeline events to one append-only stream.',
        'Expose timestamps, actor, source module, and user-visible summary.'
      ],
      scale_path: [
        'Support long-term retention, export, and cross-incident analytics.',
        'Add anomaly detection on gaps between recommendations and human actions.'
      ],
      teaching_note: 'A strong audit trail is not just for compliance. It is the dataset that lets teams learn where the architecture helped or failed responders.',
      parent_ids: ['uc-3', 'uc-2'],
      artifacts: []
    },
    {
      id: 'mod-1', type: 'module',
      title: 'Signal Intake',
      description: 'Receives alerts from external systems and converts them into the canonical incident object used across the architecture.',
      decision_points: [
        'Should source-specific adapters live here or in a separate integration layer?',
        'What fields are mandatory before the incident can enter the workflow?'
      ],
      prototype_path: [
        'Use provider adapters with deterministic field mapping.',
        'Expose both raw payload and normalized object in the detail view.'
      ],
      scale_path: [
        'Add source health monitoring and schema drift alerts.',
        'Introduce a plugin interface for new observability providers.'
      ],
      teaching_note: 'New AI builders often ignore ingestion quality because it feels non-AI. In practice this module determines whether downstream intelligence is even grounded.',
      parent_ids: ['cap-1'],
      artifacts: []
    },
    {
      id: 'mod-2', type: 'module',
      title: 'Context Retrieval',
      description: 'Searches a vector store of runbooks and past incidents to assemble the evidence package used by the diagnosis engine.',
      decision_points: [
        'Do we retrieve by embedding similarity alone or add service metadata filters?',
        'How many context documents can responders review without overload?'
      ],
      prototype_path: [
        'Embed a limited corpus and show top matches with excerpts.',
        'Let responders inspect exactly what context was injected into the prompt.'
      ],
      scale_path: [
        'Combine vector, keyword, and topology-aware retrieval.',
        'Continuously evaluate retrieval relevance with curated incident benchmarks.'
      ],
      teaching_note: 'Retrieval is where architecture touches epistemology: which evidence gets shown, omitted, or weighted shapes the entire diagnosis.',
      risk_warning: 'A polished UI can hide weak evidence selection. Make freshness, source type, and retrieval confidence explicit.',
      parent_ids: ['cap-2'],
      artifacts: []
    },
    {
      id: 'mod-3', type: 'module',
      title: 'AI Diagnosis Engine',
      description: 'Uses an LLM to synthesize signal data and retrieved evidence into a structured diagnosis with confidence and action ranking.',
      decision_points: [
        'Do we keep one prompt contract or decompose into diagnosis and recommendation prompts?',
        'What evaluation harness must exist before changing prompts or models?'
      ],
      prototype_path: [
        'Use one strictly validated JSON output contract.',
        'Render evidence references beside every root-cause hypothesis.'
      ],
      scale_path: [
        'Route by incident class and maintain prompt version history.',
        'Compare multiple candidate models for calibration and hallucination rate.'
      ],
      teaching_note: 'The diagnosis engine is not magic in the middle. It is a bounded reasoning surface whose outputs must be inspectable, comparable, and easy to challenge.',
      risk_warning: 'Without calibrated confidence and schema validation, the model can create precise-sounding but operationally unsafe advice.',
      parent_ids: ['cap-3'],
      artifacts: []
    },
    {
      id: 'mod-4', type: 'module',
      title: 'Runbook Executor',
      description: 'Surfaces the next relevant runbook steps with incident-specific context, while keeping humans in control of execution.',
      decision_points: [
        'How do we represent step preconditions and rollback guidance?',
        'What tasks remain read-only in v1 even if they are deterministic?'
      ],
      prototype_path: [
        'Display step-by-step runbooks with incident annotations and copyable commands.',
        'Track which steps responders mark as accepted, skipped, or irrelevant.'
      ],
      scale_path: [
        'Enable safe automation for pre-approved low-risk steps.',
        'Add structured rollback and approval policies per service.'
      ],
      teaching_note: 'A runbook surface is where AI suggestions become operational decisions. Design for explicit approval and reversibility, not just convenience.',
      parent_ids: ['cap-4', 'cap-3'],
      artifacts: []
    },
    {
      id: 'mod-5', type: 'module',
      title: 'Communication Draft',
      description: 'Drafts incident updates for responders and stakeholders using the current diagnosis, impact estimate, and confidence state.',
      decision_points: [
        'What tone and structure should differ between internal and external updates?',
        'How do we keep draft text synced with the latest incident state?'
      ],
      prototype_path: [
        'Generate one editable update with cited evidence blocks.',
        'Require human approval before any sending action is unlocked.'
      ],
      scale_path: [
        'Support audience-specific templates and send previews.',
        'Track communication quality through stakeholder feedback and incident outcomes.'
      ],
      teaching_note: 'This module is not just UX polish. It operationalizes confidence communication, which is central to how teams trust AI during incidents.',
      parent_ids: ['cap-4', 'cap-5'],
      artifacts: []
    },
    {
      id: 'mod-6', type: 'module',
      title: 'Incident Timeline',
      description: 'Maintains the immutable sequence of alerts, AI outputs, decisions, and updates so the system remains inspectable under pressure and afterward.',
      decision_points: [
        'Do we store model prompts verbatim or only sanitized references?',
        'How do we compress noisy event streams without destroying causality?'
      ],
      prototype_path: [
        'Write all workflow events to an append-only event list.',
        'Allow navigation from timeline events back to the generating module.'
      ],
      scale_path: [
        'Persist timeline events in an audit-grade event store.',
        'Add timeline analytics for review, compliance, and model debugging.'
      ],
      teaching_note: 'Observability is architecture for decisions, not just systems. If responders cannot reconstruct the story, the assistant remains a black box.',
      parent_ids: ['cap-5'],
      artifacts: []
    },
    {
      id: 'mod-7', type: 'module',
      title: 'Responder Interface',
      description: 'The chat and dashboard surface where responders inspect the thread, ask follow-up questions, and review AI-assisted recommendations.',
      decision_points: [
        'What belongs in the primary incident view versus secondary drill-downs?',
        'How do we preserve speed while still exposing enough evidence and context?'
      ],
      prototype_path: [
        'Use a focused, low-cognitive-load interface with explicit confidence badges.',
        'Keep evidence previews and timeline jumps one click away from every recommendation.'
      ],
      scale_path: [
        'Offer Slack, browser, and mobile incident surfaces with shared context.',
        'Personalize views by role while keeping one authoritative incident thread.'
      ],
      teaching_note: 'Interface design is part of the safety model. If evidence is hidden or buried, humans will over-trust summaries and skip validation.',
      parent_ids: ['cap-4', 'cap-5'],
      artifacts: []
    },
    {
      id: 'lay-data', type: 'layer',
      title: 'Data Layer',
      description: 'Canonical incident objects, provider adapters, retrieval corpora, and timeline events that ground the rest of the system.',
      decision_points: [
        'Which records are authoritative versus derived?',
        'How do we preserve raw source fidelity while exposing normalized structures?'
      ],
      prototype_path: [
        'Keep a single in-memory incident object plus a seeded evidence corpus.',
        'Model timeline events as append-only records.'
      ],
      scale_path: [
        'Back with event storage, retrieval indexes, and service catalog enrichment.',
        'Version schemas so model and UI changes remain backwards-compatible.'
      ],
      teaching_note: 'The data layer is the truth boundary. If raw and normalized data drift apart, later explanations become impossible to defend.',
      parent_ids: ['mod-1', 'mod-2', 'mod-6'],
      artifacts: []
    },
    {
      id: 'lay-ai', type: 'layer',
      title: 'AI Layer',
      description: 'Prompt contracts, retrieval-augmented context assembly, model routing, and output validation for diagnosis and communication.',
      decision_points: [
        'What parts of the AI layer need explicit versioning and evaluation?',
        'How do we surface model uncertainty without degrading response speed?'
      ],
      prototype_path: [
        'Use one prompt contract with schema validation and evidence references.',
        'Display confidence explanations in the responder interface.'
      ],
      scale_path: [
        'Add prompt registry, evaluation harnesses, and per-service policy routing.',
        'Track failure patterns such as stale context, missing citations, and low-confidence outputs.'
      ],
      teaching_note: 'AI is a layer with interfaces and failure modes, not a single box. Teams need to reason about it the same way they reason about any other subsystem.',
      risk_warning: 'When the AI layer is treated as opaque, hallucinations become architecture bugs instead of model bugs.',
      parent_ids: ['mod-2', 'mod-3', 'mod-5'],
      artifacts: []
    },
    {
      id: 'lay-logic', type: 'layer',
      title: 'Logic + Action Layer',
      description: 'Application state, workflow orchestration, approval rules, runbook sequencing, and event coordination between modules.',
      decision_points: [
        'Which workflow transitions are deterministic and which are advisory?',
        'How do we represent safe default behavior when context is incomplete?'
      ],
      prototype_path: [
        'Use a single state object and explicit status transitions.',
        'Keep execution advisory while approvals and annotations are captured.'
      ],
      scale_path: [
        'Move to event-driven orchestration with typed workflow states.',
        'Add policy engines for guarded automation and escalations.'
      ],
      teaching_note: 'This layer is where architecture makes promises about control. It should clearly show what the machine proposes and what the human decides.',
      parent_ids: ['mod-4', 'mod-5', 'mod-7'],
      artifacts: []
    },
    {
      id: 'lay-ui', type: 'layer',
      title: 'UI Layer',
      description: 'The interactive surfaces that make the system navigable: responder workspace, evidence views, thread trace, and audit drill-downs.',
      decision_points: [
        'How much context should stay visible without opening the detail panel?',
        'How do we let users jump between architecture, evidence, and audit views fast?'
      ],
      prototype_path: [
        'Use cards, thread tracing, and a slide-in panel to teach the system progressively.',
        'Make evidence and artifact navigation one click away in exploded mode.'
      ],
      scale_path: [
        'Introduce role-aware layouts with preserved thread navigation.',
        'Add synchronized deep-linking across module, timeline, and code views.'
      ],
      teaching_note: 'The UI layer is doing teaching work. It should make relationships and reasoning visible without forcing users to read long documentation first.',
      parent_ids: ['mod-7', 'mod-5'],
      artifacts: []
    },
    {
      id: 'pat-1', type: 'pattern',
      title: 'Canonical incident envelope',
      description: 'Use one normalized incident object so every downstream module consumes the same shape, regardless of alert provider.',
      decision_points: [
        'What goes into the core envelope versus provider-specific extension fields?',
        'How do we preserve schema evolution without breaking thread tracing?'
      ],
      prototype_path: [
        'Represent incident_id, source, severity, service, symptoms, and timestamps in one object.',
        'Store raw payload references separately for debugging.'
      ],
      scale_path: [
        'Version the envelope and publish adapter contracts for new integrations.',
        'Backfill older incidents into the new schema through migration jobs.'
      ],
      teaching_note: 'A shared envelope is a comprehension pattern: it lets every later stage speak about the same incident in consistent terms.',
      parent_ids: ['lay-data'],
      artifacts: []
    },
    {
      id: 'pat-2', type: 'pattern',
      title: 'Retrieval-augmented diagnosis',
      description: 'Compose diagnosis prompts from live incident data plus retrieved runbook and postmortem evidence.',
      decision_points: [
        'How do we constrain prompts so they cite evidence instead of inventing missing context?',
        'What retrieval failures should abort diagnosis generation?'
      ],
      prototype_path: [
        'Inject top-ranked context chunks with source labels into a validated prompt.',
        'Reject outputs that omit evidence references.'
      ],
      scale_path: [
        'Blend semantic retrieval, topology data, and recency weighting.',
        'Score retrieval quality separately from model quality in evaluation runs.'
      ],
      teaching_note: 'RAG is not “AI plus docs.” It is a contract between evidence selection and reasoning, which is why both pieces need to stay inspectable.',
      risk_warning: 'If prompt assembly hides weak evidence, responders will blame the model when the real failure is retrieval design.',
      parent_ids: ['lay-ai', 'lay-data'],
      artifacts: []
    },
    {
      id: 'pat-3', type: 'pattern',
      title: 'Human approval loop',
      description: 'Keep high-stakes communication and execution behind explicit approval checkpoints with captured rationale.',
      decision_points: [
        'Which actions can be pre-approved and which always require manual review?',
        'How do we log approval context without slowing responders too much?'
      ],
      prototype_path: [
        'Show approve / revise / reject controls next to suggested actions.',
        'Record reviewer identity and rationale in the timeline.'
      ],
      scale_path: [
        'Add service-specific approval policies and delegated authority rules.',
        'Automate low-risk remediations only when confidence and policy thresholds are both met.'
      ],
      teaching_note: 'Approval is part of the architecture, not a governance add-on. It is how the system shares responsibility with humans under pressure.',
      parent_ids: ['lay-logic', 'lay-ui'],
      artifacts: []
    },
    {
      id: 'cmp-1', type: 'component',
      title: 'Incident Adapter Registry',
      description: 'Maps provider payloads into the canonical incident envelope and records raw-source references for traceability.',
      decision_points: [
        'Should adapters be static modules or runtime plugins?',
        'How do we test schema changes across providers?'
      ],
      prototype_path: [
        'Implement a small registry with one transform per alert source.',
        'Expose validation failures directly in the UI.'
      ],
      scale_path: [
        'Add adapter health checks and schema compatibility tests.',
        'Support custom provider packages for internal tooling.'
      ],
      teaching_note: 'This component teaches a key lesson: AI reliability begins at interfaces, not at prompts.',
      parent_ids: ['pat-1'],
      artifacts: [
        {
          type: 'code',
          title: 'incident-adapters.js',
          content: `export function normalizePagerDuty(payload) {
  return {
    incident_id: payload.id,
    source: 'pagerduty',
    severity: payload.severity,
    service: payload.service?.summary,
    symptoms: payload.title,
    raw_ref: payload.self
  };
}`
        }
      ]
    },
    {
      id: 'cmp-2', type: 'component',
      title: 'Context Retrieval Service',
      description: 'Retrieves and ranks supporting documents, then packages evidence snippets for the diagnosis prompt and UI citations.',
      decision_points: [
        'How do we cap context volume without missing decisive evidence?',
        'What metadata must every snippet carry into the UI?'
      ],
      prototype_path: [
        'Return top documents with score, title, freshness, and excerpt.',
        'Log retrieval inputs and outputs to the incident timeline.'
      ],
      scale_path: [
        'Add hybrid retrieval and metadata-aware ranking.',
        'Support evaluation fixtures for known-good evidence sets.'
      ],
      teaching_note: 'This is the evidence broker of the system; make it inspectable enough that humans can challenge what was included.',
      risk_warning: 'Top-k retrieval without freshness or service filters can surface plausible but irrelevant guidance.',
      parent_ids: ['pat-2'],
      artifacts: [
        {
          type: 'code',
          title: 'context-retrieval.js',
          content: `export async function getIncidentContext(incident) {
  const results = await vectorIndex.search({
    query: incident.symptoms,
    service: incident.service,
    limit: 5
  });

  return results.map(match => ({
    title: match.title,
    excerpt: match.chunk,
    score: match.score,
    freshness_hours: match.freshness_hours
  }));
}`
        }
      ]
    },
    {
      id: 'cmp-3', type: 'component',
      title: 'Diagnosis Prompt Contract',
      description: 'Defines the structured prompt and schema validation rules used by the diagnosis engine.',
      decision_points: [
        'How strict should schema validation be when the model returns partial output?',
        'Do we allow free-form explanation or only typed fields?'
      ],
      prototype_path: [
        'Use one prompt template with required JSON keys.',
        'Reject outputs that omit confidence or evidence_ids.'
      ],
      scale_path: [
        'Version prompt contracts and validate across evaluation fixtures.',
        'Add fallback prompts for low-context situations.'
      ],
      teaching_note: 'Prompt contracts are interface design. Treat them like typed APIs, not ad-hoc text blobs.',
      risk_warning: 'Loose output contracts make it impossible to distinguish model creativity from structured reasoning.',
      parent_ids: ['pat-2'],
      artifacts: [
        {
          type: 'prompt',
          title: 'diagnosis-prompt.js',
          content: `export const DIAGNOSIS_PROMPT = [
  'You are assisting an incident commander.',
  'Return strict JSON with keys:',
  '- probable_root_cause',
  '- confidence',
  '- blast_radius',
  '- ranked_actions',
  '- evidence_ids',
  'If evidence is weak, say so explicitly.'
].join('\n');`
        }
      ]
    },
    {
      id: 'cmp-4', type: 'component',
      title: 'Approval Workspace',
      description: 'UI component that shows suggested actions and communication drafts with explicit approval controls and rationale capture.',
      decision_points: [
        'What interaction pattern is fastest during incident pressure?',
        'Should approvals live inline or in a dedicated review queue?'
      ],
      prototype_path: [
        'Render action cards with approve, revise, and reject controls.',
        'Capture reviewer notes in the timeline.'
      ],
      scale_path: [
        'Add policy-based approval routing and analytics on rejected suggestions.',
        'Support batched approvals for coordinated incident workflows.'
      ],
      teaching_note: 'This component makes accountability visible. That is why it needs just as much design care as the AI output itself.',
      parent_ids: ['pat-3'],
      artifacts: [
        {
          type: 'code',
          title: 'approval-workspace.js',
          content: `function renderSuggestionCard(suggestion) {
  return [
    '<article class="suggestion-card">',
    '  <header>' + suggestion.title + '</header>',
    '  <p>' + suggestion.reason + '</p>',
    '  <footer>',
    '    <button data-action="approve">Approve</button>',
    '    <button data-action="revise">Revise</button>',
    '    <button data-action="reject">Reject</button>',
    '  </footer>',
    '</article>'
  ].join('\n');
}`
        }
      ]
    },
    {
      id: 'cmp-5', type: 'component',
      title: 'Timeline Event Store',
      description: 'Append-only timeline component that records what the system observed, suggested, and what humans decided.',
      decision_points: [
        'How granular should prompt and retrieval events be?',
        'What needs redaction before events are retained long-term?'
      ],
      prototype_path: [
        'Keep events in memory and render them chronologically.',
        'Store actor, source module, summary, and timestamp for each event.'
      ],
      scale_path: [
        'Persist to an event store with export and retention policies.',
        'Add correlation ids across modules and incident sessions.'
      ],
      teaching_note: 'The timeline component is where system behavior becomes teachable. It gives teams a defensible record of machine and human collaboration.',
      parent_ids: ['pat-1', 'pat-3'],
      artifacts: [
        {
          type: 'code',
          title: 'timeline-store.js',
          content: `export function appendTimelineEvent(event) {
  timeline.push({
    id: crypto.randomUUID(),
    ts: new Date().toISOString(),
    ...event
  });
}`
        }
      ]
    },
    {
      id: 'cod-1', type: 'code',
      title: 'App Shell',
      description: 'Main HTML entry point for the AssemblyLane architecture experience with canvas, detail panel, and mode controls.',
      decision_points: [
        'Which navigation elements should always remain visible?',
        'How much explanatory copy belongs in the shell versus data-driven cards?'
      ],
      prototype_path: [
        'Keep the shell minimal and let data.js carry the worked example content.',
        'Make architecture mode switching obvious from the header.'
      ],
      scale_path: [
        'Add about, vision, and architecture tabs around the same shell.',
        'Preserve deep-linking into selected nodes and depth modes.'
      ],
      teaching_note: 'The shell defines the learning posture of the product: browse first, then inspect, then drill into artifacts.',
      parent_ids: ['cmp-4', 'cmp-5'],
      artifacts: [
        {
          type: 'code',
          title: 'index.html',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AssemblyLane</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="app">
    <header id="header"></header>
    <div id="main">
      <div id="canvas"></div>
      <aside id="detail-panel"></aside>
    </div>
  </div>
</body>
</html>`
        }
      ]
    },
    {
      id: 'cod-2', type: 'code',
      title: 'Thread Rendering Logic',
      description: 'Selection state, ancestor/descendant tracing, and connector drawing that explain how the incident assistant is stitched together.',
      decision_points: [
        'Should thread tracing include only direct relationships or the full chain?',
        'How do we keep redraws responsive during scroll and resize?'
      ],
      prototype_path: [
        'Compute ancestors and descendants directly from parent_ids.',
        'Redraw SVG connectors on every relevant state change.'
      ],
      scale_path: [
        'Add virtualized rendering if datasets become much larger.',
        'Support multiple focused threads and saved teaching views.'
      ],
      teaching_note: 'Architecture teaching works because thread tracing exposes causality, not just adjacency.',
      parent_ids: ['cmp-5'],
      artifacts: [
        {
          type: 'code',
          title: 'app.js',
          content: `function computeThread(id) {
  const set = new Set([id]);
  walkParents(id, set);
  walkChildren(id, set);
  return set;
}`
        }
      ]
    },
    {
      id: 'cod-3', type: 'code',
      title: 'Incident Example Dataset',
      description: 'Data model containing the incident-response worked example, including teaching notes, decision points, and artifact snippets.',
      decision_points: [
        'How much sample realism is needed before the architecture feels credible?',
        'Which teaching notes are essential for first-time AI system builders?'
      ],
      prototype_path: [
        'Keep all explanatory content in one source file.',
        'Use parent_ids as the single source of truth for relationships.'
      ],
      scale_path: [
        'Allow loading multiple worked examples from external files.',
        'Add schema validation for teaching-note completeness and risk warnings.'
      ],
      teaching_note: 'A good worked example should teach architecture choices, not just name components.',
      parent_ids: ['cmp-1', 'cmp-2', 'cmp-3'],
      artifacts: [
        {
          type: 'schema',
          title: 'data.js',
          content: `const project = {
  id: 'assemblylane-incident-response',
  name: 'AssemblyLane',
  stages: [/* intent → code nodes */]
};`
        }
      ]
    },
    {
      id: 'cod-4', type: 'code',
      title: 'Diagnosis Service Contract',
      description: 'Prompt and validation definitions for the diagnosis engine, making the AI surface concrete and reviewable.',
      decision_points: [
        'How do we validate ranked actions before they reach users?',
        'What happens when the model returns low-confidence output?'
      ],
      prototype_path: [
        'Validate JSON output before rendering any recommendations.',
        'Show confidence and evidence ids beside generated actions.'
      ],
      scale_path: [
        'Add automated regression tests against archived incidents.',
        'Version prompt contracts independently from UI releases.'
      ],
      teaching_note: 'Concrete prompt contracts help teams see where AI behavior is specified instead of assuming it emerges mysteriously.',
      parent_ids: ['cmp-3'],
      artifacts: [
        {
          type: 'prompt',
          title: 'diagnosis-service.js',
          content: `export async function diagnoseIncident(input) {
  const response = await llm.generate(DIAGNOSIS_PROMPT, input);
  return diagnosisSchema.parse(JSON.parse(response));
}`
        }
      ]
    }
  ]
};

const nodesById = {};
project.stages.forEach(n => { nodesById[n.id] = n; });

const childrenById = {};
project.stages.forEach(n => {
  (n.parent_ids || []).forEach(pid => {
    if (!childrenById[pid]) childrenById[pid] = [];
    childrenById[pid].push(n.id);
  });
});

const stagesByType = {};
STAGE_ORDER.forEach(t => { stagesByType[t] = []; });
project.stages.forEach(n => {
  if (stagesByType[n.type]) stagesByType[n.type].push(n);
});
