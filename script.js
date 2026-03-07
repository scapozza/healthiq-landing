/**
 * HealthIQ Landing Page — Form Handling
 * Uses Formspree for email capture, no backend needed.
 */

(function () {
  "use strict";

  /**
   * Handle a waitlist form submission via fetch (AJAX).
   * @param {HTMLFormElement} form - The form element
   * @param {HTMLElement} successEl - The success message element
   */
  function handleForm(form, successEl) {
    if (!form) return;

    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const submitBtn = form.querySelector(".cta-button");
      const originalText = submitBtn ? submitBtn.textContent : "";

      // Loading state
      if (submitBtn) {
        submitBtn.textContent = "Joining…";
        submitBtn.disabled = true;
      }

      try {
        const data = new FormData(form);
        const response = await fetch(form.action, {
          method: "POST",
          body: data,
          headers: {
            Accept: "application/json",
          },
        });

        if (response.ok) {
          // Show success, hide form
          form.hidden = true;
          if (successEl) {
            successEl.hidden = false;
            successEl.style.opacity = "0";
            successEl.style.transform = "translateY(8px)";
            // Animate in
            requestAnimationFrame(() => {
              successEl.style.transition = "opacity 0.4s ease, transform 0.4s ease";
              successEl.style.opacity = "1";
              successEl.style.transform = "translateY(0)";
            });
          }
        } else {
          // Try to parse error from Formspree
          const json = await response.json().catch(() => ({}));
          const msg =
            json.errors
              ? json.errors.map((err) => err.message).join(", ")
              : "Something went wrong. Please try again.";
          showError(form, msg);
          resetButton(submitBtn, originalText);
        }
      } catch (err) {
        showError(form, "Network error — please check your connection.");
        resetButton(submitBtn, originalText);
      }
    });
  }

  function resetButton(btn, text) {
    if (!btn) return;
    btn.textContent = text;
    btn.disabled = false;
  }

  function showError(form, message) {
    // Remove existing error if any
    const existing = form.querySelector(".form-error");
    if (existing) existing.remove();

    const el = document.createElement("p");
    el.className = "form-error";
    el.textContent = message;
    el.style.cssText =
      "color:#f87171;font-size:0.875rem;margin-top:10px;text-align:center;";
    form.appendChild(el);
  }

  // Bind both forms (hero + bottom CTA)
  handleForm(
    document.getElementById("waitlist-form"),
    document.getElementById("form-success")
  );
  handleForm(
    document.getElementById("waitlist-form-bottom"),
    document.getElementById("form-success-bottom")
  );

  // Sync submissions — if one form succeeds, hide the other too
  const heroForm = document.getElementById("waitlist-form");
  const heroSuccess = document.getElementById("form-success");
  const bottomForm = document.getElementById("waitlist-form-bottom");
  const bottomSuccess = document.getElementById("form-success-bottom");

  if (heroForm && bottomForm) {
    const heroObserver = new MutationObserver(() => {
      if (heroForm.hidden) {
        bottomForm.hidden = true;
        if (bottomSuccess) bottomSuccess.hidden = false;
      }
    });
    heroObserver.observe(heroForm, { attributes: true });

    const bottomObserver = new MutationObserver(() => {
      if (bottomForm.hidden) {
        heroForm.hidden = true;
        if (heroSuccess) heroSuccess.hidden = false;
      }
    });
    bottomObserver.observe(bottomForm, { attributes: true });
  }
})();
