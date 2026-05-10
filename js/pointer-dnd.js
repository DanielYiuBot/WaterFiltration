/* ============================================================
   pointer-dnd.js – touch / pen drag using Pointer Events
   HTML5 drag-drop does not work reliably with finger input on
   iOS Safari; this mirrors desktop DnD for pointerType !== mouse.
   ============================================================ */

(function (global) {
  'use strict';

  const DEFAULT_THRESHOLD = 12;

  function suppressNextClick(el) {
    const block = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      el.removeEventListener('click', block, true);
    };
    el.addEventListener('click', block, true);
  }

  function makeGhost(fromEl) {
    const g = fromEl.cloneNode(true);
    g.classList.add('pointer-dnd-ghost');
    g.removeAttribute('id');
    const r = fromEl.getBoundingClientRect();
    g.style.boxSizing = 'border-box';
    g.style.position = 'fixed';
    g.style.left = '0';
    g.style.top = '0';
    g.style.width = `${r.width}px`;
    g.style.margin = '0';
    g.style.pointerEvents = 'none';
    g.style.zIndex = '2147483646';
    g.style.opacity = '0.92';
    g.style.boxShadow = '0 8px 28px rgba(35, 65, 82, 0.25)';
    document.body.appendChild(g);
    return g;
  }

  function positionGhost(ghost, clientX, clientY, offsetX, offsetY) {
    ghost.style.transform = `translate(${clientX - offsetX}px, ${clientY - offsetY}px)`;
  }

  /**
   * @param {HTMLElement} el
   * @param {object} opts
   * @param {() => boolean} opts.canStart
   * @param {() => object} opts.getPayload
   * @param {(x:number,y:number) => object|null} opts.getDropTarget
   * @param {(payload:object, target:object) => void} opts.onDrop
   * @param {(target:object|null) => void} [opts.onHoverChange]
   * @param {number} [opts.threshold]
   */
  function attach(el, opts) {
    const {
      canStart,
      getPayload,
      getDropTarget,
      onDrop,
      onHoverChange,
      threshold = DEFAULT_THRESHOLD,
    } = opts;

    el.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse') return;
      if (e.button !== 0 && e.pointerType !== 'touch' && e.pointerType !== 'pen') return;
      if (e.isPrimary === false) return;
      if (!canStart()) return;

      const pointerId = e.pointerId;
      const startX = e.clientX;
      const startY = e.clientY;
      const rect = el.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;

      let dragging = false;
      let ghost = null;
      let payload = null;
      let hoverTarget = null;

      const clearHover = () => {
        if (onHoverChange && hoverTarget !== null) {
          hoverTarget = null;
          onHoverChange(null);
        }
      };

      const finishVisual = () => {
        if (ghost) {
          ghost.remove();
          ghost = null;
        }
        el.classList.remove('dragging');
        clearHover();
      };

      const moveOpts = { passive: false };

      const onMove = (ev) => {
        if (ev.pointerId !== pointerId) return;

        if (!dragging) {
          if (Math.hypot(ev.clientX - startX, ev.clientY - startY) < threshold) return;
          dragging = true;
          payload = getPayload();
          el.classList.add('dragging');
          ghost = makeGhost(el);
          positionGhost(ghost, ev.clientX, ev.clientY, offsetX, offsetY);
          ev.preventDefault();
          try {
            el.setPointerCapture(pointerId);
          } catch (_) {
            /* ignore */
          }
        } else {
          ev.preventDefault();
          positionGhost(ghost, ev.clientX, ev.clientY, offsetX, offsetY);
          const t = getDropTarget(ev.clientX, ev.clientY);
          if (t !== hoverTarget) {
            hoverTarget = t;
            if (onHoverChange) onHoverChange(t);
          }
        }
      };

      const onUp = (ev) => {
        if (ev.pointerId !== pointerId) return;

        document.removeEventListener('pointermove', onMove, moveOpts);
        document.removeEventListener('pointerup', onUp);
        document.removeEventListener('pointercancel', onUp);

        try {
          el.releasePointerCapture(pointerId);
        } catch (_) {
          /* ignore */
        }

        if (dragging) {
          const target = getDropTarget(ev.clientX, ev.clientY);
          if (target) onDrop(payload, target);
          suppressNextClick(el);
        }

        finishVisual();
      };

      document.addEventListener('pointermove', onMove, moveOpts);
      document.addEventListener('pointerup', onUp);
      document.addEventListener('pointercancel', onUp);
    });
  }

  global.PointerDnD = { attach };
})(typeof window !== 'undefined' ? window : globalThis);
