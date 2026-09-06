import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export function Modal({ title, children, onClose }) {
  const modalCardRef = useRef(null);
  const closeBtnRef = useRef(null);

  // 1. Body Scroll Lock & Escape key listener
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  // 2. Focus Trap & Auto-focus
  useEffect(() => {
    const card = modalCardRef.current;
    if (!card) return;

    // Focus first interactive element or close button
    const focusableElements = card.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length > 0) {
      // If there's an input, focus the first input, otherwise focus close button
      const firstInput = card.querySelector("input:not([disabled]), textarea:not([disabled])");
      if (firstInput) {
        firstInput.focus();
      } else {
        focusableElements[0].focus();
      }
    }

    const handleTabTrap = (e) => {
      if (e.key !== "Tab") return;

      const focusables = Array.from(
        card.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );

      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusables[0];
      const lastElement = focusables[focusables.length - 1];

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    card.addEventListener("keydown", handleTabTrap);
    return () => {
      card.removeEventListener("keydown", handleTabTrap);
    };
  }, []);

  const modalContent = (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        ref={modalCardRef}
        className="modal-card"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <h3 id="modal-title">{title}</h3>
          <button
            ref={closeBtnRef}
            className="icon-button"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
