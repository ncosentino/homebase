/* ─────────────────────────────────────────────────────────────────────────
   integrations.js — shared runtime for Homebase widget integrations
   Loaded only when at least one interactive integration widget is enabled.
   ───────────────────────────────────────────────────────────────────────── */
(function (HB) {
  'use strict';

  /* ── GA4 helper ─────────────────────────────────────────────────────────── */
  HB.track = function (name, params) {
    if (typeof gtag === 'function') gtag('event', name, params || {});
  };

  /* ── Widget view tracking via IntersectionObserver ──────────────────────── */
  HB.observeWidgets = function () {
    if (!('IntersectionObserver' in window)) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var type = entry.target.dataset.gaWidget;
        if (type) HB.track('widget_view', { widget_type: type });
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.4 });
    document.querySelectorAll('[data-ga-widget]').forEach(function (el) {
      obs.observe(el);
    });
  };

  /* ── UI state manager ───────────────────────────────────────────────────── */
  // state: 'idle' | 'loading' | 'success' | 'error'
  HB.setState = function (el, state, msg) {
    ['idle', 'loading', 'success', 'error'].forEach(function (s) {
      el.classList.remove('hb-state-' + s);
    });
    el.classList.add('hb-state-' + state);
    var msgEl = el.querySelector('.hb-msg');
    if (msgEl && msg !== undefined) msgEl.textContent = msg;
    var btn = el.querySelector('[type="submit"]');
    if (btn) btn.disabled = (state === 'loading' || state === 'success');
  };

  /* ── JSON POST helper ───────────────────────────────────────────────────── */
  HB._post = function (url, data) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(function (r) {
      return r.json().then(function (d) {
        if (!r.ok) throw new Error(d.error || d.message || 'Error ' + r.status);
        return d;
      });
    });
  };

  /* ── Email submission (newsletter + lead magnet) ────────────────────────── */
  // widget: DOM element with data-backend, data-formspree-id, etc.
  // opts: { onSuccess }
  HB.submitEmail = function (widget, email, opts) {
    opts = opts || {};
    email = (email || '').trim();
    if (!email || email.indexOf('@') < 1) {
      HB.setState(widget, 'error', 'Please enter a valid email address.');
      return;
    }
    HB.setState(widget, 'loading');
    var d = widget.dataset;
    var backend = d.backend || 'formspree';
    var p;

    if (backend === 'formspree') {
      p = HB._post('https://formspree.io/f/' + d.formspreeId, { email: email });
    } else if (backend === 'convertkit') {
      p = HB._post(
        'https://app.convertkit.com/forms/' + d.convertkitFormId + '/subscriptions',
        { email_address: email }
      ).then(function (r) {
        if (r.subscription) return r;
        throw new Error(r.description || 'Subscription failed');
      });
    } else if (backend === 'web3forms') {
      p = HB._post('https://api.web3forms.com/submit', {
        access_key: d.web3formsKey, email: email
      }).then(function (r) {
        if (!r.success) throw new Error(r.message || 'Error');
        return r;
      });
    } else {
      p = Promise.reject(new Error('Unknown backend: ' + backend));
    }

    var successMsg = d.successMsg || "You're subscribed!";
    var gaWidget = d.gaWidget || 'newsletter';

    p.then(function () {
      HB.setState(widget, 'success', successMsg);
      HB.track('newsletter_subscribe', { method: backend, widget: gaWidget });
      if (opts.onSuccess) opts.onSuccess();
    }).catch(function (err) {
      HB.setState(widget, 'error', 'Something went wrong. Please try again.');
      console.error('[HB newsletter]', err);
    });
  };

  /* ── Generic form submission (contact + poll + lead-magnet) ─────────────── */
  HB.submitForm = function (widget, data, gaWidget) {
    var d = widget.dataset;
    HB.setState(widget, 'loading');
    var backend = d.backend || 'formspree';
    var p;

    if (backend === 'formspree') {
      p = HB._post('https://formspree.io/f/' + d.formspreeId, data);
    } else if (backend === 'web3forms') {
      p = HB._post('https://api.web3forms.com/submit',
        Object.assign({ access_key: d.web3formsKey }, data)
      ).then(function (r) {
        if (!r.success) throw new Error(r.message || 'Error');
        return r;
      });
    } else {
      p = Promise.reject(new Error('Unknown backend: ' + backend));
    }

    var successMsg = d.successMsg || 'Submitted!';
    var type = gaWidget || d.gaWidget || 'form';

    p.then(function () {
      HB.setState(widget, 'success', successMsg);
      HB.track('form_submit', { widget: type, method: backend });
    }).catch(function (err) {
      HB.setState(widget, 'error', 'Something went wrong. Please try again.');
      console.error('[HB form]', err);
    });
  };

  /* ── Widget initializers ────────────────────────────────────────────────── */

  HB.initNewsletter = function () {
    document.querySelectorAll('.hb-widget-newsletter form').forEach(function (form) {
      var widget = form.closest('.hb-widget-newsletter');
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var emailEl = form.querySelector('[type="email"]');
        HB.submitEmail(widget, emailEl ? emailEl.value : '');
      });
    });
  };

  HB.initContactForm = function () {
    document.querySelectorAll('.hb-widget-contact form').forEach(function (form) {
      var widget = form.closest('.hb-widget-contact');
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var data = {};
        new FormData(form).forEach(function (v, k) { data[k] = v; });
        HB.submitForm(widget, data, 'contact_form');
      });
    });
  };

  HB.initLeadMagnet = function () {
    document.querySelectorAll('.hb-widget-lead-magnet form').forEach(function (form) {
      var widget = form.closest('.hb-widget-lead-magnet');
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var emailEl = form.querySelector('[type="email"]');
        HB.submitEmail(widget, emailEl ? emailEl.value : '', {
          onSuccess: function () {
            var link = widget.querySelector('.hb-resource-link');
            if (link) link.style.display = 'block';
          }
        });
      });
    });
  };

  HB.initPoll = function () {
    document.querySelectorAll('.hb-widget-poll form').forEach(function (form) {
      var widget = form.closest('.hb-widget-poll');
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var selected = form.querySelector('input[name="poll_option"]:checked');
        if (!selected) {
          HB.setState(widget, 'error', 'Please select an option.');
          return;
        }
        HB.submitForm(widget, {
          poll_question: widget.dataset.question || '',
          poll_answer: selected.value,
          poll_label: selected.dataset.label || selected.value
        }, 'poll');
      });
    });
  };

  /* ── Boot ───────────────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    HB.observeWidgets();
    HB.initNewsletter();
    HB.initContactForm();
    HB.initLeadMagnet();
    HB.initPoll();
  });

}(window.HB = window.HB || {}));
