// js/ui.js
window.UIManager = class UIManager {
  constructor(data) {
    this.data = data;
    this.matrixContainer = document.getElementById('matrix-container');

    this.activeSelectedId = null;
    this.onSelectionChange = () => {};
  }

  escapeHtml(str) {
    return (str || "").toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  createLinkHtml(item) {
    if (!item.url) return '';
    return `<a href="${item.url}" target="_blank" class="node-link" title="Open MITRE Webpage">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="link-icon"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
    </a>`;
  }

  createExpandBtnHtml(hasSubs) {
    if (!hasSubs) return '';
    return `<button class="expand-btn" aria-label="Toggle Subtechniques" title="Toggle Subtechniques">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="expand-icon"><path d="M12 5v14M5 12h14"></path></svg>
    </button>`;
  }

  clearSelection() {
    document.querySelectorAll('.node-pill, .subtechnique-pill').forEach(el => el.classList.remove('selected'));
  }

  selectNode(el, item) {
    this.clearSelection();
    el.classList.add('selected');
    this.activeSelectedId = item.id || item.stixId;
    this.openDrawer(item);
  }

  initMatrix() {
    this.matrixContainer.innerHTML = '';
    
    this.data.tactics.forEach(tactic => {
      // Create column
      const col = document.createElement('div');
      col.className = 'tactic-column';
      
      // Column Header
      const header = document.createElement('div');
      header.className = 'tactic-header';
      header.style.cursor = 'pointer';
      header.title = "View Tactic Details";
      header.textContent = `${tactic.name} (${tactic.techniques.length})`;
      
      header.addEventListener('click', () => {
        this.clearSelection();
        this.openDrawer(tactic);
      });
      col.appendChild(header);
      
      // Scroll Area
      const scrollArea = document.createElement('div');
      scrollArea.className = 'col-scroll-area';
      
      // Techniques
      tactic.techniques.forEach((tech, i) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'node-wrapper anim-enter';
        wrapper.style.animationDelay = `${i * 15}ms`;
        
        // Main Technique Pill
        const hasSubs = tech.subtechniques && tech.subtechniques.length > 0;
        const pill = document.createElement('div');
        pill.className = 'node-pill';
        pill.innerHTML = `
          <span class="node-text">${this.escapeHtml(tech.name)}</span>
          <div class="node-tools">
            ${this.createLinkHtml(tech)}
            ${this.createExpandBtnHtml(hasSubs)}
          </div>
        `;
        
        // Link stop propagation
        const anchor = pill.querySelector('a');
        if (anchor) anchor.addEventListener('click', (e) => e.stopPropagation());

        // Subtechniques container
        let subContainer = null;
        if (hasSubs) {
          subContainer = document.createElement('div');
          subContainer.className = 'subtechnique-container';
          
          tech.subtechniques.forEach(sub => {
            const subPill = document.createElement('div');
            subPill.className = 'subtechnique-pill';
            subPill.innerHTML = `
              <span class="node-text">${this.escapeHtml(sub.name)}</span>
              ${this.createLinkHtml(sub)}
            `;
            const subAnchor = subPill.querySelector('a');
            if (subAnchor) subAnchor.addEventListener('click', (e) => e.stopPropagation());
            
            subPill.addEventListener('click', (e) => {
              e.stopPropagation();
              this.selectNode(subPill, sub);
            });
            subContainer.appendChild(subPill);
          });
          
          // Expand button event
          const expandBtn = pill.querySelector('.expand-btn');
          expandBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isExpanded = subContainer.classList.contains('expanded');
            if (isExpanded) {
              subContainer.classList.remove('expanded');
              expandBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="expand-icon"><path d="M12 5v14M5 12h14"></path></svg>`;
            } else {
              subContainer.classList.add('expanded');
              expandBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="expand-icon"><path d="M5 12h14"></path></svg>`;
            }
          });
        }
        
        pill.addEventListener('click', () => {
          this.selectNode(pill, tech);
        });

        wrapper.appendChild(pill);
        if (subContainer) wrapper.appendChild(subContainer);
        scrollArea.appendChild(wrapper);
      });
      
      col.appendChild(scrollArea);
      this.matrixContainer.appendChild(col);
    });
  }

  openDrawer(item) {
    const drawer = document.getElementById('detailDrawer');
    document.getElementById('drawerTitle').textContent = item.name;
    document.getElementById('drawerId').textContent = item.id || (item.stixId ? item.stixId.split('--')[1].substring(0,8) : "Unknown ID");
    document.getElementById('drawerDesc').innerHTML = item.description ? marked.parse(item.description) : "<i>No description currently available.</i>";
    
    drawer.classList.add('open');
  }

  closeDrawer() {
    document.getElementById('detailDrawer').classList.remove('open');
  }
}
