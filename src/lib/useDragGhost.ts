"use client";

import { useCallback, useRef, useState } from "react";

const DRAG_THRESHOLD = 4;

interface GhostDragState {
  id: string;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  lastT: number;
  rotation: number;
  ghost: HTMLElement;
  raf: number;
}

interface UseDragGhostOptions {
  /** Called continuously while the pointer moves during an active drag. */
  onDragMove?: (clientX: number, clientY: number) => void;
  /** Called once the drag ends, with the pointer's release position. */
  onDrop: (id: string, clientX: number, clientY: number) => void;
}

/**
 * Pointer-driven drag-and-drop that clones the dragged element into a
 * `fixed`-position "ghost" following the cursor, tilting based on throw
 * velocity (Trello-style swing) instead of relying on the browser's native
 * HTML5 drag image, which can't be animated in real time.
 */
export function useDragGhost({ onDragMove, onDrop }: UseDragGhostOptions) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const stateRef = useRef<GhostDragState | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent, id: string) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      const cardEl = e.currentTarget as HTMLElement;
      const startX = e.clientX;
      const startY = e.clientY;
      let started = false;

      function applyTransform(st: GhostDragState) {
        const dx = st.lastX - st.startX;
        const dy = st.lastY - st.startY;
        st.ghost.style.transform = `translate3d(${dx}px, ${dy}px, 0) rotate(${st.rotation.toFixed(2)}deg) scale(1.05)`;
      }

      function tick() {
        const st = stateRef.current;
        if (!st) return;
        // Decay rotation toward 0 each frame so the card keeps gently
        // rocking/settling even between pointermove events.
        st.rotation *= 0.9;
        applyTransform(st);
        st.raf = requestAnimationFrame(tick);
      }

      function beginDrag(moveEvent: PointerEvent) {
        started = true;
        const rect = cardEl.getBoundingClientRect();
        const ghost = cardEl.cloneNode(true) as HTMLElement;
        ghost.style.position = "fixed";
        ghost.style.left = `${rect.left}px`;
        ghost.style.top = `${rect.top}px`;
        ghost.style.width = `${rect.width}px`;
        ghost.style.height = `${rect.height}px`;
        ghost.style.margin = "0";
        ghost.style.pointerEvents = "none";
        ghost.style.zIndex = "999";
        ghost.style.boxShadow = "0 24px 48px -12px rgba(76,29,149,0.45)";
        ghost.style.cursor = "grabbing";
        ghost.style.willChange = "transform";
        // The cloned node inherits the card's Tailwind `transition` class
        // (used for its hover effect), which would otherwise animate every
        // transform update with a CSS transition and make the ghost lag
        // behind the cursor instead of tracking it instantly.
        ghost.style.transition = "none";
        document.body.appendChild(ghost);

        stateRef.current = {
          id,
          startX,
          startY,
          lastX: moveEvent.clientX,
          lastY: moveEvent.clientY,
          lastT: performance.now(),
          rotation: 0,
          ghost,
          raf: 0,
        };
        setDraggingId(id);
        tick();
      }

      function onMove(moveEvent: PointerEvent) {
        if (!started) {
          const dx0 = moveEvent.clientX - startX;
          const dy0 = moveEvent.clientY - startY;
          if (Math.hypot(dx0, dy0) < DRAG_THRESHOLD) return;
          beginDrag(moveEvent);
          return;
        }

        const st = stateRef.current;
        if (!st) return;
        const now = performance.now();
        const dt = Math.max(now - st.lastT, 1);
        const vx = (moveEvent.clientX - st.lastX) / dt;
        const targetRotation = Math.max(-10, Math.min(10, vx * 22));
        st.rotation += (targetRotation - st.rotation) * 0.35;
        st.lastX = moveEvent.clientX;
        st.lastY = moveEvent.clientY;
        st.lastT = now;
        applyTransform(st);
        onDragMove?.(moveEvent.clientX, moveEvent.clientY);
      }

      function suppressClick(clickEvent: MouseEvent) {
        clickEvent.preventDefault();
        clickEvent.stopPropagation();
      }

      function onUp(upEvent: PointerEvent) {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        const st = stateRef.current;
        if (!st) return;
        cancelAnimationFrame(st.raf);

        onDrop(st.id, upEvent.clientX, upEvent.clientY);
        // The browser fires a synthetic "click" right after this pointerup,
        // targeting whatever's under the cursor — swallow it so a completed
        // drag never re-triggers a click handler underneath.
        window.addEventListener("click", suppressClick, { capture: true, once: true });

        const dx = st.lastX - st.startX;
        const dy = st.lastY - st.startY;
        st.ghost.style.transition = "transform 160ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 160ms ease";
        st.ghost.style.transform = `translate3d(${dx}px, ${dy}px, 0) rotate(0deg) scale(0.95)`;
        st.ghost.style.opacity = "0";
        const ghost = st.ghost;
        window.setTimeout(() => ghost.remove(), 160);

        stateRef.current = null;
        setDraggingId(null);
      }

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [onDragMove, onDrop]
  );

  return { draggingId, onPointerDown };
}
