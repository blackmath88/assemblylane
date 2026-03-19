/* ─── AssemblyLane — Application ───────────────────────── */

(function () {
  'use strict';

  const state = {
    mode: 'assembled',
    selectedId: null,
    threadIds: new Set()
  };

  let canvas, svgOverlay, detailPanel, detailInner;
  let inspoBackdrop, inspoPanel, inspoTextarea, inspoOutput, inspoOutputContent;
  let redrawTimer = null;
  let connectorDelayTimer = null;

  function init() {
    canvas = document.getElementById('canvas');
    svgOverlay = document.getElementById('connector-svg');
    detailPanel = document.getElementById('detail-panel');
    detailInner = document.getElementById('detail-inner');

    inspoBackdrop = document.getElementById('inspo-backdrop');
    inspoPanel = document.getElementById('inspo-panel');
    inspoTextarea = document.getElementById('inspo-textarea');
    inspoOutput = document.getElementById('inspo-output');
    inspoOutputContent = document.getElementById('inspo-output-content');

    renderIntroLegend();
    renderStages();
    bindControls();
    bindInspoPanel();

    canvas.addEventListener('scroll', drawConnectors);
    window.addEventListener('resize', scheduleRedraw);

    requestAnimationFrame(() => requestAnimationFrame(drawConnectors));
  }

  function renderIntroLegend() {
    const wrap = document.getElementById('canvas-intro');
    const zones = [
      { key: 'concept', label: 'Concept', stages: 'Intent → Use Cases' },
      { key: 'architecture', label: 'Architecture', stages: 'Capabilities → Modules → Layers' },
      { key: 'implementation', label: 'Implementation', stages: 'Patterns → Components → Code' }
    ];

    wrap.innerHTML = zones.map(zone => `
      <span class="zone-badge ${zone.key}" title="${zone.stages}">${zone.label}</span>
    `).join('<span style="color:var(--text-3);font-size:11px">·</span>');
  }

  function renderStages() {
    const container = document.getElementById('stage-container');
    container.innerHTML = '';

    let cardIndex = 0;
    STAGE_ORDER.forEach(stageType => {
      const meta = STAGE_METADATA[stageType];
      const nodes = stagesByType[stageType] || [];
      if (!nodes.length) return;

      const row = document.createElement('div');
      row.className = 'stage-row';
      row.dataset.type = stageType;
      row.dataset.zone = meta.zone;

      const label = document.createElement('div');
      label.className = 'stage-label';
      label.innerHTML = `
        <div class="stage-icon-wrap">
          <div class="stage-icon" style="background:${meta.color}">${meta.icon}</div>
          <span class="stage-type-name">${meta.label}</span>
        </div>
        <span class="stage-count">${nodes.length} item${nodes.length !== 1 ? 's' : ''}</span>
      `;

      const cardsWrap = document.createElement('div');
      cardsWrap.className = 'stage-cards';

      nodes.forEach(node => {
        cardsWrap.appendChild(buildCard(node, meta, cardIndex));
        cardIndex += 1;
      });

      row.appendChild(label);
      row.appendChild(cardsWrap);
      container.appendChild(row);
    });
  }

  function buildCard(node, meta, index) {
    const card = document.createElement('div');
    card.className = 'card';
    card.id = `card-${node.id}`;
    card.dataset.id = node.id;
    card.dataset.index = String(index);
    card.style.setProperty('--stage-color', meta.color);

    const contextLabel = node.risk_warning
      ? 'Risk'
      : node.teaching_note
        ? 'Context'
        : 'Explore';
    const contextText = node.risk_warning || node.teaching_note || `Open ${node.title} to inspect its role in the incident thread.`;

    card.innerHTML = `
      <div class="card-type-chip" style="color:${meta.color}">${meta.label}</div>
      <div class="card-title">${node.title}</div>
      <div class="card-desc">${node.description}</div>
      <div class="card-context">
        <div class="card-context-line"><strong>${contextLabel}:</strong> ${truncate(contextText, 110)}</div>
        <div class="card-context-line"><strong>Parents:</strong> ${(node.parent_ids || []).length ? (node.parent_ids || []).map(parentId => nodesById[parentId]?.title || parentId).join(' · ') : 'Entry point'}</div>
      </div>
      <div class="card-click-hint">Click for context</div>
    `;

    card.addEventListener('click', (event) => {
      event.stopPropagation();
      if (state.selectedId === node.id) {
        clearSelection();
      } else {
        selectCard(node.id);
      }
    });

    return card;
  }

  function bindControls() {
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        if (mode !== state.mode) setMode(mode);
      });
    });

    canvas.addEventListener('click', clearSelection);
    detailPanel.addEventListener('click', event => event.stopPropagation());

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && inspoPanel.classList.contains('open')) {
        closeInspoPanel();
      }
    });
  }

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

  function setMode(mode) {
    state.mode = mode;
    const isExploded = mode === 'exploded';

    document.body.classList.toggle('exploded', isExploded);
    document.body.classList.toggle('connectors-delayed', isExploded);
    document.body.classList.remove('connectors-ready');

    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    animateModeCards(isExploded ? 'mode-enter' : 'mode-exit', isExploded ? 35 : 0);
    scheduleConnectorReveal(isExploded ? 650 : 0);
    scheduleRedraw();
  }

  function animateModeCards(className, staggerMs) {
    document.querySelectorAll('.card').forEach(card => {
      card.classList.remove('mode-enter', 'mode-exit');
      card.style.animationDelay = `${Number(card.dataset.index || 0) * staggerMs}ms`;
      card.classList.add(className);

      const onEnd = () => {
        card.classList.remove(className);
        if (className === 'mode-exit') {
          card.style.animationDelay = '0ms';
        }
      };
      card.addEventListener('animationend', onEnd, { once: true });
    });
  }

  function scheduleConnectorReveal(delayMs) {
    clearTimeout(connectorDelayTimer);

    if (delayMs <= 0) {
      document.body.classList.remove('connectors-delayed');
      document.body.classList.add('connectors-ready');
      return;
    }

    connectorDelayTimer = setTimeout(() => {
      document.body.classList.remove('connectors-delayed');
      document.body.classList.add('connectors-ready');
      drawConnectors();
    }, delayMs);
  }

  function computeThread(id) {
    const set = new Set([id]);

    function up(nodeId) {
      const node = nodesById[nodeId];
      if (!node) return;
      (node.parent_ids || []).forEach(parentId => {
        if (!set.has(parentId)) {
          set.add(parentId);
          up(parentId);
        }
      });
    }

    function down(nodeId) {
      (childrenById[nodeId] || []).forEach(childId => {
        if (!set.has(childId)) {
          set.add(childId);
          down(childId);
        }
      });
    }

    up(id);
    down(id);
    return set;
  }

  function selectCard(id) {
    state.selectedId = id;
    state.threadIds = computeThread(id);

    document.querySelectorAll('.card').forEach(card => {
      const cardId = card.dataset.id;
      card.classList.remove('thread-selected', 'thread-member', 'thread-dimmed');
      if (cardId === id) {
        card.classList.add('thread-selected', 'thread-member');
      } else if (state.threadIds.has(cardId)) {
        card.classList.add('thread-member');
      } else {
        card.classList.add('thread-dimmed');
      }
    });

    const hint = document.getElementById('thread-hint');
    hint.textContent = 'Thread active — click another part for more context, or click the canvas to clear';
    hint.classList.add('active');

    openDetailPanel(nodesById[id]);
    scheduleRedraw();
  }

  function clearSelection() {
    state.selectedId = null;
    state.threadIds = new Set();

    document.querySelectorAll('.card').forEach(card => {
      card.classList.remove('thread-selected', 'thread-member', 'thread-dimmed');
    });

    document.getElementById('thread-hint').classList.remove('active');
    closeDetailPanel();
    scheduleRedraw();
  }

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
    const ancestors = getAncestors(node.id);
    const descendants = getDescendants(node.id);

    let html = `
      <div class="detail-header">
        <div class="detail-type-chip" style="background:${meta.color}">${meta.icon} ${meta.label}</div>
        <button id="detail-close" title="Close">✕</button>
      </div>
      <div id="detail-title">${node.title}</div>
      <div id="detail-description">${node.description}</div>
    `;

    if (node.teaching_note) {
      html += `
        <div class="detail-section">
          <div class="detail-section-label">Teaching Note</div>
          <div class="teaching-note">${node.teaching_note}</div>
        </div>
      `;
    }

    if (node.risk_warning) {
      html += `
        <div class="detail-section">
          <div class="detail-section-label">Risk Warning</div>
          <div class="risk-warning">${node.risk_warning}</div>
        </div>
      `;
    }

    if (node.decision_points?.length) {
      html += `
        <hr class="detail-divider">
        <div class="detail-section">
          <div class="detail-section-label">Decision Points</div>
          <ul class="detail-list">
            ${node.decision_points.map(point => `<li>${point}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    if (node.prototype_path?.length || node.scale_path?.length) {
      html += `
        <hr class="detail-divider">
        <div class="detail-section">
          <div class="detail-section-label">Implementation Path</div>
          <div class="path-tabs">
            <button class="path-tab active" data-tab="proto">Prototype</button>
            <button class="path-tab" data-tab="scale">Scale-up</button>
          </div>
          <div class="path-content active" id="path-proto">
            ${(node.prototype_path || []).map((item, index) => `
              <div class="path-item">
                <span class="path-item-num">${index + 1}</span>
                <span>${item}</span>
              </div>
            `).join('')}
          </div>
          <div class="path-content" id="path-scale">
            ${(node.scale_path || []).map((item, index) => `
              <div class="path-item">
                <span class="path-item-num">${index + 1}</span>
                <span>${item}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (ancestors.length || descendants.length) {
      html += '<hr class="detail-divider"><div class="detail-section">';
      html += '<div class="detail-section-label">Thread Trace</div><div class="thread-trace">';

      if (ancestors.length) {
        html += '<div class="trace-dir">↑ From above</div>';
        ancestors.slice().reverse().forEach(id => {
          const ancestorNode = nodesById[id];
          if (!ancestorNode) return;
          const ancestorMeta = STAGE_METADATA[ancestorNode.type];
          html += `
            <div class="trace-item" data-id="${id}">
              <div class="trace-dot" style="background:${ancestorMeta.color}"></div>
              <span><strong>${ancestorMeta.label}</strong> · ${ancestorNode.title}</span>
            </div>
          `;
        });
      }

      if (descendants.length) {
        html += '<div class="trace-dir">↓ Leads to</div>';
        descendants.forEach(id => {
          const descendantNode = nodesById[id];
          if (!descendantNode) return;
          const descendantMeta = STAGE_METADATA[descendantNode.type];
          html += `
            <div class="trace-item" data-id="${id}">
              <div class="trace-dot" style="background:${descendantMeta.color}"></div>
              <span><strong>${descendantMeta.label}</strong> · ${descendantNode.title}</span>
            </div>
          `;
        });
      }

      html += '</div></div>';
    }

    if (node.artifacts?.length) {
      html += '<hr class="detail-divider"><div class="detail-section">';
      html += '<div class="detail-section-label">Artifacts</div>';
      node.artifacts.forEach(artifact => {
        html += `
          <div class="artifact-block">
            <div class="artifact-header">
              <span class="artifact-type-pill">${artifact.type}</span>
              <span class="artifact-filename">${artifact.title}</span>
            </div>
            <div class="artifact-body">
              <pre>${escapeHtml(artifact.content)}</pre>
            </div>
          </div>
        `;
      });
      html += '</div>';
    }

    detailInner.innerHTML = html;
    detailInner.scrollTop = 0;

    document.getElementById('detail-close').addEventListener('click', clearSelection);

    detailInner.querySelectorAll('.path-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        detailInner.querySelectorAll('.path-tab').forEach(item => item.classList.remove('active'));
        detailInner.querySelectorAll('.path-content').forEach(item => item.classList.remove('active'));
        tab.classList.add('active');
        detailInner.querySelector(`#path-${tab.dataset.tab}`).classList.add('active');
      });
    });

    detailInner.querySelectorAll('.trace-item[data-id]').forEach(item => {
      item.addEventListener('click', () => {
        const targetId = item.dataset.id;
        selectCard(targetId);
        const cardEl = document.getElementById(`card-${targetId}`);
        if (cardEl) {
          cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    });
  }

  function getAncestors(id) {
    const result = [];
    function up(nodeId) {
      const node = nodesById[nodeId];
      if (!node) return;
      (node.parent_ids || []).forEach(parentId => {
        if (!result.includes(parentId)) {
          result.push(parentId);
          up(parentId);
        }
      });
    }
    up(id);
    return result;
  }

  function getDescendants(id) {
    const result = [];
    function down(nodeId) {
      (childrenById[nodeId] || []).forEach(childId => {
        if (!result.includes(childId)) {
          result.push(childId);
          down(childId);
        }
      });
    }
    down(id);
    return result;
  }

  function scheduleRedraw() {
    clearTimeout(redrawTimer);
    redrawTimer = setTimeout(drawConnectors, 50);
  }

  function drawConnectors() {
    const canvasRect = canvas.getBoundingClientRect();
    const scrollTop = canvas.scrollTop;
    const scrollLeft = canvas.scrollLeft;
    const totalH = canvas.scrollHeight;
    const totalW = canvas.scrollWidth;

    svgOverlay.setAttribute('width', totalW);
    svgOverlay.setAttribute('height', totalH);
    svgOverlay.setAttribute('viewBox', `0 0 ${totalW} ${totalH}`);

    while (svgOverlay.firstChild) svgOverlay.removeChild(svgOverlay.firstChild);

    const isExploded = state.mode === 'exploded';
    const hasThread = state.selectedId !== null;

    project.stages.forEach(node => {
      (node.parent_ids || []).forEach(parentId => {
        const parentEl = document.getElementById(`card-${parentId}`);
        const childEl = document.getElementById(`card-${node.id}`);
        if (!parentEl || !childEl) return;

        const parentRect = posRelToCanvas(parentEl, canvasRect, scrollTop, scrollLeft);
        const childRect = posRelToCanvas(childEl, canvasRect, scrollTop, scrollLeft);

        const x1 = parentRect.left + parentRect.width / 2;
        const y1 = parentRect.top + parentRect.height;
        const x2 = childRect.left + childRect.width / 2;
        const y2 = childRect.top;
        const curveY = (y1 + y2) / 2;

        const isThread = hasThread && state.threadIds.has(parentId) && state.threadIds.has(node.id);

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M ${x1} ${y1} C ${x1} ${curveY} ${x2} ${curveY} ${x2} ${y2}`);

        let className = 'connector';
        if (isExploded) className += ' conn-visible';
        if (hasThread) className += isThread ? ' conn-thread' : ' conn-dimmed';
        path.setAttribute('class', className);
        svgOverlay.appendChild(path);
      });
    });
  }

  function posRelToCanvas(el, canvasRect, scrollTop, scrollLeft) {
    const rect = el.getBoundingClientRect();
    return {
      top: rect.top - canvasRect.top + scrollTop,
      left: rect.left - canvasRect.left + scrollLeft,
      bottom: rect.bottom - canvasRect.top + scrollTop,
      right: rect.right - canvasRect.left + scrollLeft,
      width: rect.width,
      height: rect.height
    };
  }

  function truncate(text, maxLength) {
    const value = String(text || '');
    return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
