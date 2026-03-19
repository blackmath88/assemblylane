/* ─── Build Atlas — Application ─────────────────────────── */

(function () {
  'use strict';

  // ─── State ────────────────────────────────────────────────
  const state = {
    mode: 'assembled',   // 'assembled' | 'exploded'
    selectedId: null,    // currently selected card id
    threadIds: new Set() // all ids in the active thread
  };

  // ─── DOM refs ─────────────────────────────────────────────
  let canvas, svgOverlay, detailPanel, detailInner;

  // ─── Inspiration panel refs ───────────────────────────────
  let inspoBackdrop, inspoPanel, inspoTextarea, inspoOutput, inspoOutputContent;

  // ─── Init ─────────────────────────────────────────────────
  function init() {
    canvas       = document.getElementById('canvas');
    svgOverlay   = document.getElementById('connector-svg');
    detailPanel  = document.getElementById('detail-panel');
    detailInner  = document.getElementById('detail-inner');

    inspoBackdrop     = document.getElementById('inspo-backdrop');
    inspoPanel        = document.getElementById('inspo-panel');
    inspoTextarea     = document.getElementById('inspo-textarea');
    inspoOutput       = document.getElementById('inspo-output');
    inspoOutputContent = document.getElementById('inspo-output-content');

    renderIntroLegend();
    renderStages();
    bindControls();
    bindInspoPanel();

    // Redraw lines on scroll and resize
    canvas.addEventListener('scroll', drawConnectors);
    window.addEventListener('resize', () => { scheduleRedraw(); });

    // Initial draw after layout settles
    requestAnimationFrame(() => requestAnimationFrame(drawConnectors));
  }

  // ─── Legend / intro ───────────────────────────────────────
  function renderIntroLegend() {
    const wrap = document.getElementById('canvas-intro');
    const zones = [
      { key: 'concept',        label: 'Concept',        stages: 'Intent → Use Cases' },
      { key: 'architecture',   label: 'Architecture',   stages: 'Capabilities → Modules → Layers' },
      { key: 'implementation', label: 'Implementation', stages: 'Patterns → Components → Code' }
    ];
    wrap.innerHTML = zones.map(z => `
      <span class="zone-badge ${z.key}" title="${z.stages}">${z.label}</span>
    `).join('<span style="color:var(--text-3);font-size:11px">·</span>');
  }

  // ─── Stage rows ───────────────────────────────────────────
  function renderStages() {
    const container = document.getElementById('stage-container');
    container.innerHTML = '';

    let cardDelay = 0;
    STAGE_ORDER.forEach(stageType => {
      const meta  = STAGE_METADATA[stageType];
      const nodes = stagesByType[stageType] || [];
      if (!nodes.length) return;

      const row = document.createElement('div');
      row.className = 'stage-row';
      row.dataset.type = stageType;
      row.dataset.zone = meta.zone;

      // Stage label
      const label = document.createElement('div');
      label.className = 'stage-label';
      label.innerHTML = `
        <div class="stage-icon-wrap">
          <div class="stage-icon" style="background:${meta.color}">${meta.icon}</div>
          <span class="stage-type-name">${meta.label}</span>
        </div>
        <span class="stage-count">${nodes.length} item${nodes.length !== 1 ? 's' : ''}</span>
      `;

      // Cards area
      const cardsWrap = document.createElement('div');
      cardsWrap.className = 'stage-cards';

      nodes.forEach(node => {
        const card = buildCard(node, meta, cardDelay * 40);
        cardsWrap.appendChild(card);
        cardDelay++;
      });

      row.appendChild(label);
      row.appendChild(cardsWrap);
      container.appendChild(row);
    });
  }

  function buildCard(node, meta, delayMs) {
    const card = document.createElement('div');
    card.className = 'card';
    card.id = `card-${node.id}`;
    card.dataset.id = node.id;
    card.style.setProperty('--stage-color', meta.color);
    card.style.animationDelay = `${delayMs}ms`;

    card.innerHTML = `
      <div class="card-type-chip" style="color:${meta.color}">${meta.label}</div>
      <div class="card-title">${node.title}</div>
      <div class="card-desc">${node.description}</div>
    `;

    card.addEventListener('click', (e) => {
      e.stopPropagation();
      if (state.selectedId === node.id) {
        clearSelection();
      } else {
        selectCard(node.id);
      }
    });

    return card;
  }

  // ─── Controls ─────────────────────────────────────────────
  function bindControls() {
    // Mode toggle
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        if (mode !== state.mode) setMode(mode);
      });
    });

    // Click canvas background → clear
    canvas.addEventListener('click', clearSelection);

    // Detail panel clicks don't propagate to canvas
    detailPanel.addEventListener('click', e => e.stopPropagation());

    // Keyboard: Escape closes inspiration panel
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && inspoPanel && inspoPanel.classList.contains('open')) {
        closeInspoPanel();
      }
    });
  }

  // ─── AI Inspiration panel ─────────────────────────────────
  function bindInspoPanel() {
    document.getElementById('inspo-btn').addEventListener('click', openInspoPanel);
    document.getElementById('inspo-close').addEventListener('click', closeInspoPanel);
    inspoBackdrop.addEventListener('click', closeInspoPanel);

    document.getElementById('inspo-render-btn').addEventListener('click', renderInspoContent);
    document.getElementById('inspo-clear-btn').addEventListener('click', clearInspoContent);
    document.getElementById('inspo-edit-btn').addEventListener('click', editInspoContent);
  }

  function openInspoPanel() {
    inspoBackdrop.classList.add('open');
    inspoPanel.classList.add('open');
    inspoTextarea.focus();
  }

  function closeInspoPanel() {
    inspoBackdrop.classList.remove('open');
    inspoPanel.classList.remove('open');
  }

  function renderInspoContent() {
    const raw = inspoTextarea.value.trim();
    if (!raw) {
      inspoTextarea.classList.add('inspo-shake');
      inspoTextarea.addEventListener('animationend', () => {
        inspoTextarea.classList.remove('inspo-shake');
      }, { once: true });
      return;
    }
    inspoOutputContent.textContent = raw;
    inspoOutput.hidden = false;
    document.getElementById('inspo-input-area').hidden = true;
  }

  function editInspoContent() {
    inspoOutput.hidden = true;
    document.getElementById('inspo-input-area').hidden = false;
    inspoTextarea.focus();
  }

  function clearInspoContent() {
    inspoTextarea.value = '';
    inspoOutput.hidden = true;
    inspoOutputContent.textContent = '';
    document.getElementById('inspo-input-area').hidden = false;
    inspoTextarea.focus();
  }

  // ─── Mode switch ──────────────────────────────────────────
  function setMode(mode) {
    state.mode = mode;
    document.body.classList.toggle('exploded', mode === 'exploded');

    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    scheduleRedraw();
  }

  // ─── Thread computation ───────────────────────────────────
  function computeThread(id) {
    const set = new Set([id]);

    function up(nodeId) {
      const node = nodesById[nodeId];
      if (!node) return;
      (node.parent_ids || []).forEach(pid => {
        if (!set.has(pid)) { set.add(pid); up(pid); }
      });
    }

    function down(nodeId) {
      (childrenById[nodeId] || []).forEach(cid => {
        if (!set.has(cid)) { set.add(cid); down(cid); }
      });
    }

    up(id);
    down(id);
    return set;
  }

  // ─── Selection ────────────────────────────────────────────
  function selectCard(id) {
    state.selectedId = id;
    state.threadIds  = computeThread(id);

    // Apply card classes
    document.querySelectorAll('.card').forEach(card => {
      const cid = card.dataset.id;
      card.classList.remove('thread-selected', 'thread-member', 'thread-dimmed');
      if (cid === id) {
        card.classList.add('thread-selected', 'thread-member');
      } else if (state.threadIds.has(cid)) {
        card.classList.add('thread-member');
      } else {
        card.classList.add('thread-dimmed');
      }
    });

    // Update header hint
    const hint = document.getElementById('thread-hint');
    hint.textContent = 'Thread active — click card to switch, click background to clear';
    hint.classList.add('active');

    openDetailPanel(nodesById[id]);
    scheduleRedraw();
  }

  function clearSelection() {
    state.selectedId = null;
    state.threadIds  = new Set();

    document.querySelectorAll('.card').forEach(card => {
      card.classList.remove('thread-selected', 'thread-member', 'thread-dimmed');
    });

    document.getElementById('thread-hint').classList.remove('active');
    closeDetailPanel();
    scheduleRedraw();
  }

  // ─── Detail Panel ─────────────────────────────────────────
  function openDetailPanel(node) {
    if (!node) return;
    detailPanel.classList.add('open');
    renderDetailContent(node);
  }

  function closeDetailPanel() {
    detailPanel.classList.remove('open');
  }

  function renderDetailContent(node) {
    const meta = STAGE_METADATA[node.type];

    // Ancestors and descendants for thread trace display
    const ancestors   = getAncestors(node.id);
    const descendants = getDescendants(node.id);

    let html = `
      <div class="detail-header">
        <div class="detail-type-chip" style="background:${meta.color}">${meta.icon} ${meta.label}</div>
        <button id="detail-close" title="Close">✕</button>
      </div>
      <div id="detail-title">${node.title}</div>
      <div id="detail-description">${node.description}</div>
    `;

    // Decision points
    if (node.decision_points && node.decision_points.length) {
      html += `
        <hr class="detail-divider">
        <div class="detail-section">
          <div class="detail-section-label">Decision Points</div>
          <ul class="detail-list">
            ${node.decision_points.map(d => `<li>${d}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    // Prototype & scale path
    if (
      (node.prototype_path && node.prototype_path.length) ||
      (node.scale_path && node.scale_path.length)
    ) {
      html += `
        <hr class="detail-divider">
        <div class="detail-section">
          <div class="detail-section-label">Implementation Path</div>
          <div class="path-tabs">
            <button class="path-tab active" data-tab="proto">Prototype</button>
            <button class="path-tab" data-tab="scale">Scale-up</button>
          </div>
          <div class="path-content active" id="path-proto">
            ${(node.prototype_path || []).map((p, i) => `
              <div class="path-item">
                <span class="path-item-num">${i + 1}</span>
                <span>${p}</span>
              </div>`).join('')}
          </div>
          <div class="path-content" id="path-scale">
            ${(node.scale_path || []).map((p, i) => `
              <div class="path-item">
                <span class="path-item-num">${i + 1}</span>
                <span>${p}</span>
              </div>`).join('')}
          </div>
        </div>
      `;
    }

    // Thread trace
    if (ancestors.length || descendants.length) {
      html += `<hr class="detail-divider"><div class="detail-section">`;
      html += `<div class="detail-section-label">Thread Trace</div><div class="thread-trace">`;

      if (ancestors.length) {
        html += `<div class="trace-dir">↑ From above</div>`;
        ancestors.slice().reverse().forEach(id => {
          const n = nodesById[id];
          if (!n) return;
          const m = STAGE_METADATA[n.type];
          html += `<div class="trace-item" data-id="${id}">
            <div class="trace-dot" style="background:${m.color}"></div>
            <span><strong>${m.label}</strong> · ${n.title}</span>
          </div>`;
        });
      }

      if (descendants.length) {
        html += `<div class="trace-dir">↓ Leads to</div>`;
        descendants.forEach(id => {
          const n = nodesById[id];
          if (!n) return;
          const m = STAGE_METADATA[n.type];
          html += `<div class="trace-item" data-id="${id}">
            <div class="trace-dot" style="background:${m.color}"></div>
            <span><strong>${m.label}</strong> · ${n.title}</span>
          </div>`;
        });
      }

      html += `</div></div>`;
    }

    // Artifacts
    if (node.artifacts && node.artifacts.length) {
      html += `<hr class="detail-divider"><div class="detail-section">`;
      html += `<div class="detail-section-label">Artifacts</div>`;
      node.artifacts.forEach(art => {
        html += `
          <div class="artifact-block">
            <div class="artifact-header">
              <span class="artifact-type-pill">${art.type}</span>
              <span class="artifact-filename">${art.title}</span>
            </div>
            <div class="artifact-body">
              <pre>${escapeHtml(art.content)}</pre>
            </div>
          </div>
        `;
      });
      html += `</div>`;
    }

    detailInner.innerHTML = html;
    detailInner.scrollTop = 0;

    // Rebind close button (innerHTML replaced it)
    document.getElementById('detail-close').addEventListener('click', clearSelection);

    // Bind path tabs
    detailInner.querySelectorAll('.path-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        detailInner.querySelectorAll('.path-tab').forEach(t => t.classList.remove('active'));
        detailInner.querySelectorAll('.path-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        detailInner.querySelector(`#path-${tab.dataset.tab}`).classList.add('active');
      });
    });

    // Bind trace items → click to navigate
    detailInner.querySelectorAll('.trace-item[data-id]').forEach(item => {
      item.addEventListener('click', () => {
        const tid = item.dataset.id;
        selectCard(tid);
        // Scroll card into view
        const cardEl = document.getElementById(`card-${tid}`);
        if (cardEl) cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
  }

  // ─── Thread helpers ───────────────────────────────────────
  function getAncestors(id) {
    const result = [];
    function up(nodeId) {
      const node = nodesById[nodeId];
      if (!node) return;
      (node.parent_ids || []).forEach(pid => {
        if (!result.includes(pid)) { result.push(pid); up(pid); }
      });
    }
    up(id);
    return result;
  }

  function getDescendants(id) {
    const result = [];
    function down(nodeId) {
      (childrenById[nodeId] || []).forEach(cid => {
        if (!result.includes(cid)) { result.push(cid); down(cid); }
      });
    }
    down(id);
    return result;
  }

  // ─── Connector lines ──────────────────────────────────────
  let redrawTimer = null;

  function scheduleRedraw() {
    clearTimeout(redrawTimer);
    redrawTimer = setTimeout(drawConnectors, 50);
  }

  function drawConnectors() {
    const canvasRect  = canvas.getBoundingClientRect();
    const scrollTop   = canvas.scrollTop;
    const scrollLeft  = canvas.scrollLeft;

    // Size the SVG to the full scroll area
    const totalH = canvas.scrollHeight;
    const totalW = canvas.scrollWidth;
    svgOverlay.setAttribute('width',  totalW);
    svgOverlay.setAttribute('height', totalH);
    svgOverlay.setAttribute('viewBox', `0 0 ${totalW} ${totalH}`);

    // Remove existing paths
    while (svgOverlay.firstChild) svgOverlay.removeChild(svgOverlay.firstChild);

    const isExploded  = state.mode === 'exploded';
    const hasThread   = state.selectedId !== null;

    // For each parent→child relationship, draw a bezier
    project.stages.forEach(node => {
      (node.parent_ids || []).forEach(parentId => {
        const parentEl = document.getElementById(`card-${parentId}`);
        const childEl  = document.getElementById(`card-${node.id}`);
        if (!parentEl || !childEl) return;

        const pRect = posRelToCanvas(parentEl, canvasRect, scrollTop, scrollLeft);
        const cRect = posRelToCanvas(childEl,  canvasRect, scrollTop, scrollLeft);

        const x1 = pRect.left + pRect.width  / 2;
        const y1 = pRect.top  + pRect.height;
        const x2 = cRect.left + cRect.width  / 2;
        const y2 = cRect.top;

        const cy = (y1 + y2) / 2;

        const isThread = hasThread &&
          state.threadIds.has(parentId) &&
          state.threadIds.has(node.id);

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M ${x1} ${y1} C ${x1} ${cy} ${x2} ${cy} ${x2} ${y2}`);

        let cls = 'connector';
        if (isExploded) cls += ' conn-visible';
        if (hasThread) {
          cls += isThread ? ' conn-thread' : ' conn-dimmed';
        }
        path.setAttribute('class', cls);

        svgOverlay.appendChild(path);
      });
    });
  }

  function posRelToCanvas(el, canvasRect, scrollTop, scrollLeft) {
    const r = el.getBoundingClientRect();
    return {
      top:    r.top    - canvasRect.top  + scrollTop,
      left:   r.left   - canvasRect.left + scrollLeft,
      bottom: r.bottom - canvasRect.top  + scrollTop,
      right:  r.right  - canvasRect.left + scrollLeft,
      width:  r.width,
      height: r.height
    };
  }

  // ─── Util ─────────────────────────────────────────────────
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ─── Boot ─────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', init);
})();
