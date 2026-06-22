/**
 * MediStay AI — Frontend JavaScript
 * v2.0 — Simple/Advanced Mode, Auto-Fill, Sample Data, Tooltips
 */

'use strict';

// ══════════════════════════════════════════════════════════════════
// HOSPITAL LOOKUP TABLE  (mirrors app.py HOSPITAL_LOOKUP)
// Hospital_code → {type, city, region, extra_rooms, ward_type, ward_facility}
// ══════════════════════════════════════════════════════════════════
const HOSPITAL_LOOKUP = {
  1:  {type:'d', city:10, region:'Y', extra_rooms:3, ward_type:'R', ward_facility:'B'},
  2:  {type:'c', city:5,  region:'Z', extra_rooms:2, ward_type:'S', ward_facility:'F'},
  3:  {type:'c', city:3,  region:'Z', extra_rooms:3, ward_type:'R', ward_facility:'A'},
  4:  {type:'a', city:4,  region:'X', extra_rooms:3, ward_type:'R', ward_facility:'F'},
  5:  {type:'a', city:1,  region:'X', extra_rooms:3, ward_type:'R', ward_facility:'E'},
  6:  {type:'a', city:6,  region:'X', extra_rooms:3, ward_type:'R', ward_facility:'F'},
  7:  {type:'a', city:4,  region:'X', extra_rooms:3, ward_type:'R', ward_facility:'F'},
  8:  {type:'c', city:3,  region:'Z', extra_rooms:3, ward_type:'R', ward_facility:'F'},
  9:  {type:'d', city:5,  region:'Z', extra_rooms:3, ward_type:'Q', ward_facility:'F'},
  10: {type:'e', city:1,  region:'X', extra_rooms:3, ward_type:'Q', ward_facility:'E'},
  11: {type:'b', city:2,  region:'Y', extra_rooms:4, ward_type:'Q', ward_facility:'D'},
  12: {type:'a', city:9,  region:'Y', extra_rooms:3, ward_type:'R', ward_facility:'B'},
  13: {type:'a', city:5,  region:'Z', extra_rooms:3, ward_type:'R', ward_facility:'F'},
  14: {type:'a', city:1,  region:'X', extra_rooms:3, ward_type:'Q', ward_facility:'E'},
  15: {type:'c', city:5,  region:'Z', extra_rooms:3, ward_type:'Q', ward_facility:'F'},
  16: {type:'c', city:3,  region:'Z', extra_rooms:3, ward_type:'S', ward_facility:'A'},
  17: {type:'e', city:1,  region:'X', extra_rooms:3, ward_type:'R', ward_facility:'E'},
  18: {type:'d', city:13, region:'Y', extra_rooms:3, ward_type:'Q', ward_facility:'B'},
  19: {type:'a', city:7,  region:'Y', extra_rooms:3, ward_type:'Q', ward_facility:'C'},
  20: {type:'b', city:2,  region:'Y', extra_rooms:2, ward_type:'S', ward_facility:'D'},
  21: {type:'c', city:3,  region:'Z', extra_rooms:3, ward_type:'S', ward_facility:'A'},
  22: {type:'g', city:9,  region:'Y', extra_rooms:3, ward_type:'S', ward_facility:'B'},
  23: {type:'a', city:6,  region:'X', extra_rooms:3, ward_type:'Q', ward_facility:'F'},
  24: {type:'a', city:1,  region:'X', extra_rooms:3, ward_type:'R', ward_facility:'E'},
  25: {type:'e', city:1,  region:'X', extra_rooms:3, ward_type:'S', ward_facility:'E'},
  26: {type:'b', city:2,  region:'Y', extra_rooms:3, ward_type:'R', ward_facility:'D'},
  27: {type:'a', city:7,  region:'Y', extra_rooms:3, ward_type:'R', ward_facility:'C'},
  28: {type:'b', city:11, region:'X', extra_rooms:3, ward_type:'R', ward_facility:'F'},
  29: {type:'a', city:4,  region:'X', extra_rooms:3, ward_type:'R', ward_facility:'F'},
  30: {type:'c', city:3,  region:'Z', extra_rooms:3, ward_type:'Q', ward_facility:'A'},
  31: {type:'c', city:3,  region:'Z', extra_rooms:3, ward_type:'R', ward_facility:'A'},
  32: {type:'f', city:9,  region:'Y', extra_rooms:2, ward_type:'S', ward_facility:'B'},
};

// Sample data rows (validated against the model — returns correct classes)
const SAMPLE_DATA = {
  short: {
    Hospital_code: 8, Hospital_type_code: 'c', City_Code_Hospital: 3,
    Hospital_region_code: 'Z', Available_Extra_Rooms_in_Hospital: 3,
    Department: 'radiotherapy', Ward_Type: 'R', Ward_Facility_Code: 'F',
    Bed_Grade: 2, City_Code_Patient: 7, Type_of_Admission: 'Emergency',
    Severity_of_Illness: 'Extreme', Visitors_with_Patient: 2, Age: '51-60',
    Admission_Deposit: 4911,
  },
  medium: {
    Hospital_code: 2, Hospital_type_code: 'c', City_Code_Hospital: 5,
    Hospital_region_code: 'Z', Available_Extra_Rooms_in_Hospital: 2,
    Department: 'radiotherapy', Ward_Type: 'S', Ward_Facility_Code: 'F',
    Bed_Grade: 2, City_Code_Patient: 7, Type_of_Admission: 'Trauma',
    Severity_of_Illness: 'Extreme', Visitors_with_Patient: 2, Age: '51-60',
    Admission_Deposit: 5954,
  },
  long: {
    Hospital_code: 19, Hospital_type_code: 'a', City_Code_Hospital: 7,
    Hospital_region_code: 'Y', Available_Extra_Rooms_in_Hospital: 2,
    Department: 'radiotherapy', Ward_Type: 'S', Ward_Facility_Code: 'C',
    Bed_Grade: 3, City_Code_Patient: 7, Type_of_Admission: 'Emergency',
    Severity_of_Illness: 'Minor', Visitors_with_Patient: 4, Age: '71-80',
    Admission_Deposit: 4718,
  },
};

// Simple Mode defaults (matches app.py SIMPLE_DEFAULTS)
const SIMPLE_DEFAULTS = { Hospital_code: 8, City_Code_Patient: 7 };

// ══════════════════════════════════════════════════════════════════
// STATE
// ══════════════════════════════════════════════════════════════════
let currentMode = 'simple'; // 'simple' | 'advanced'

// ══════════════════════════════════════════════════════════════════
// DOM REFERENCES
// ══════════════════════════════════════════════════════════════════
const form             = document.getElementById('predictionForm');
const submitBtn        = document.getElementById('submitBtn');
const resetBtn         = document.getElementById('resetBtn');
const resultCard       = document.getElementById('resultCard');
const loadingState     = document.getElementById('loadingState');
const resultState      = document.getElementById('resultState');
const resultBadge      = document.getElementById('resultBadge');
const resultIcon       = document.getElementById('resultIcon');
const resultLabel      = document.getElementById('resultLabel');
const resultRange      = document.getElementById('resultRange');
const resultDesc       = document.getElementById('resultDescription');
const shortBar         = document.getElementById('shortBar');
const mediumBar        = document.getElementById('mediumBar');
const longBar          = document.getElementById('longBar');
const shortPct         = document.getElementById('shortPct');
const mediumPct        = document.getElementById('mediumPct');
const longPct          = document.getElementById('longPct');
const timestamp        = document.getElementById('resultTimestamp');
const simpleModeFields = document.getElementById('simpleModeFields');
const advancedFields   = document.getElementById('advancedModeFields');
const btnSimple        = document.getElementById('btnSimple');
const btnAdvanced      = document.getElementById('btnAdvanced');
const modeInfoText     = document.getElementById('modeInfoText');
const autofillNotice   = document.getElementById('autofillNotice');
const autofillClose    = document.getElementById('autofillClose');

// ══════════════════════════════════════════════════════════════════
// BOOTSTRAP TOOLTIPS
// ══════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
    new bootstrap.Tooltip(el, { placement: 'top', trigger: 'hover focus' });
  });
});

// ══════════════════════════════════════════════════════════════════
// NAVBAR SCROLL EFFECT
// ══════════════════════════════════════════════════════════════════
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// ══════════════════════════════════════════════════════════════════
// SMOOTH SCROLL
// ══════════════════════════════════════════════════════════════════
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.pageYOffset - 80,
        behavior: 'smooth'
      });
    }
    const bsCollapse = bootstrap.Collapse.getInstance(document.getElementById('navbarNav'));
    if (bsCollapse) bsCollapse.hide();
  });
});

// ══════════════════════════════════════════════════════════════════
// SCROLL ANIMATIONS
// ══════════════════════════════════════════════════════════════════
function getInitialTransform(type) {
  if (type === 'fade-up')    return 'translateY(30px)';
  if (type === 'fade-down')  return 'translateY(-30px)';
  if (type === 'fade-left')  return 'translateX(30px)';
  if (type === 'fade-right') return 'translateX(-30px)';
  if (type === 'zoom-in')    return 'scale(0.9)';
  return 'translateY(20px)';
}

(function setupAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        el.style.opacity = '1';
        el.style.transform = 'translateY(0) translateX(0) scale(1)';
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-aos]').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = getInitialTransform(el.dataset.aos);
    const delay = parseInt(el.dataset.aosDelay || '0', 10);
    el.style.transition = `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`;
    observer.observe(el);
  });
})();

// ══════════════════════════════════════════════════════════════════
// MODE SWITCHING
// ══════════════════════════════════════════════════════════════════
function switchMode(mode) {
  currentMode = mode;

  if (mode === 'simple') {
    simpleModeFields.classList.remove('d-none');
    advancedFields.classList.add('d-none');
    btnSimple.classList.add('active');
    btnAdvanced.classList.remove('active');
    modeInfoText.textContent = '7 easy fields — hospital details auto-filled';
    // Remove required from advanced inputs so they don't block submit
    advancedFields.querySelectorAll('[required]').forEach(el => el.removeAttribute('data-adv-required'));
  } else {
    simpleModeFields.classList.add('d-none');
    advancedFields.classList.remove('d-none');
    btnSimple.classList.remove('active');
    btnAdvanced.classList.add('active');
    modeInfoText.textContent = 'All 15 fields — full control over every parameter';
  }

  // Clear validation state on switch
  form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
  resultCard.classList.add('d-none');
}

btnSimple.addEventListener('click',   () => switchMode('simple'));
btnAdvanced.addEventListener('click', () => switchMode('advanced'));

// ══════════════════════════════════════════════════════════════════
// HOSPITAL AUTO-FILL (Advanced Mode)
// ══════════════════════════════════════════════════════════════════
function autoFillHospital(code) {
  const h = HOSPITAL_LOOKUP[parseInt(code)];
  if (!h) return;

  setSelectValue('Hospital_type_code',              h.type);
  setSelectValue('City_Code_Hospital',              String(h.city));
  setSelectValue('Hospital_region_code',            h.region);
  setInputValue ('Available_Extra_Rooms_in_Hospital', h.extra_rooms);
  setSelectValue('Ward_Type',                       h.ward_type);
  setSelectValue('Ward_Facility_Code',              h.ward_facility);

  // Show autofill notice
  autofillNotice.classList.remove('d-none');

  // Add visual indicator to autofilled fields
  advancedFields.querySelectorAll('.autofilled').forEach(el => {
    el.classList.add('was-autofilled');
    setTimeout(() => el.classList.remove('was-autofilled'), 2000);
  });
}

document.getElementById('Hospital_code').addEventListener('change', function () {
  autoFillHospital(this.value);
});

autofillClose.addEventListener('click', () => autofillNotice.classList.add('d-none'));

function setSelectValue(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  for (const opt of el.options) {
    if (opt.value === String(value)) { opt.selected = true; break; }
  }
  el.classList.remove('is-invalid');
}

function setInputValue(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  el.value = value;
  el.classList.remove('is-invalid');
}

// ══════════════════════════════════════════════════════════════════
// SAMPLE DATA FILL
// ══════════════════════════════════════════════════════════════════
document.querySelectorAll('.sample-item').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    const sample = item.dataset.sample;
    fillSampleData(sample);
  });
});

function fillSampleData(type) {
  const data = SAMPLE_DATA[type];
  if (!data) return;

  // Switch to Advanced Mode for full transparency
  switchMode('advanced');

  // Fill all Advanced Mode fields
  setSelectValue('Hospital_code', String(data.Hospital_code));
  // Trigger auto-fill
  autoFillHospital(data.Hospital_code);

  // Override auto-fill with sample values (sample may differ slightly)
  setSelectValue('Hospital_type_code',                 data.Hospital_type_code);
  setSelectValue('City_Code_Hospital',                 String(data.City_Code_Hospital));
  setSelectValue('Hospital_region_code',               data.Hospital_region_code);
  setInputValue ('Available_Extra_Rooms_in_Hospital',  data.Available_Extra_Rooms_in_Hospital);
  setSelectValue('Department',                         data.Department);
  setSelectValue('Ward_Type',                          data.Ward_Type);
  setSelectValue('Ward_Facility_Code',                 data.Ward_Facility_Code);
  setSelectValue('Bed_Grade',                          String(data.Bed_Grade));
  setSelectValue('City_Code_Patient',                  String(data.City_Code_Patient));
  setSelectValue('Type_of_Admission',                  data.Type_of_Admission);
  setSelectValue('Severity_of_Illness',                data.Severity_of_Illness);
  setInputValue ('Visitors_with_Patient',              data.Visitors_with_Patient);
  setSelectValue('Age',                                data.Age);
  setInputValue ('Admission_Deposit',                  data.Admission_Deposit);

  // Show notice
  autofillNotice.classList.remove('d-none');

  // Scroll to form
  document.getElementById('predict').scrollIntoView({ behavior: 'smooth' });

  // Flash feedback
  const toolbar = document.querySelector('.form-toolbar');
  toolbar.classList.add('sample-flash');
  setTimeout(() => toolbar.classList.remove('sample-flash'), 600);
}

// ══════════════════════════════════════════════════════════════════
// FORM VALIDATION
// ══════════════════════════════════════════════════════════════════
function getActiveFields() {
  if (currentMode === 'simple') {
    return simpleModeFields.querySelectorAll('[required]');
  } else {
    return advancedFields.querySelectorAll('[required]');
  }
}

function validateForm() {
  let valid = true;
  const inputs = getActiveFields();

  inputs.forEach(input => {
    input.classList.remove('is-invalid');
    const val = input.value.trim();

    if (!val) {
      input.classList.add('is-invalid');
      valid = false;
      return;
    }

    if (input.type === 'number') {
      const num = parseFloat(val);
      const min = parseFloat(input.min);
      const max = parseFloat(input.max);
      if (!isNaN(min) && num < min) { input.classList.add('is-invalid'); valid = false; }
      if (!isNaN(max) && num > max) { input.classList.add('is-invalid'); valid = false; }
    }
  });

  inputs.forEach(input => {
    input.addEventListener('input', () => input.classList.remove('is-invalid'), { once: true });
  });

  return valid;
}

// ══════════════════════════════════════════════════════════════════
// BUILD PAYLOAD
// Constructs the full 15-field payload from whichever mode is active.
// Simple Mode fills missing fields from SIMPLE_DEFAULTS + hospital lookup.
// ══════════════════════════════════════════════════════════════════
function buildPayload() {
  if (currentMode === 'simple') {
    const s = id => document.getElementById(id);
    const hospCode = SIMPLE_DEFAULTS.Hospital_code;
    const h = HOSPITAL_LOOKUP[hospCode];

    return {
      Hospital_code:                     hospCode,
      Hospital_type_code:                h.type,
      City_Code_Hospital:                h.city,
      Hospital_region_code:              h.region,
      Available_Extra_Rooms_in_Hospital: h.extra_rooms,
      Department:                        s('s_Department').value,
      Ward_Type:                         h.ward_type,
      Ward_Facility_Code:                h.ward_facility,
      Bed_Grade:                         parseFloat(s('s_Bed_Grade').value),
      City_Code_Patient:                 SIMPLE_DEFAULTS.City_Code_Patient,
      Type_of_Admission:                 s('s_Type_of_Admission').value,
      Severity_of_Illness:               s('s_Severity_of_Illness').value,
      Visitors_with_Patient:             parseInt(s('s_Visitors_with_Patient').value, 10),
      Age:                               s('s_Age').value,
      Admission_Deposit:                 parseFloat(s('s_Admission_Deposit').value),
    };

  } else {
    // Advanced Mode — collect all 15 fields from form
    const numericFields = [
      'Hospital_code', 'City_Code_Hospital', 'Available_Extra_Rooms_in_Hospital',
      'Bed_Grade', 'City_Code_Patient', 'Visitors_with_Patient', 'Admission_Deposit'
    ];

    const payload = {};
    const formData = new FormData(form);

    for (const [key, value] of formData.entries()) {
      // Skip the simple-mode prefixed inputs (s_*)
      if (key.startsWith('s_')) continue;
      payload[key] = numericFields.includes(key) ? parseFloat(value) : value;
    }

    return payload;
  }
}

// ══════════════════════════════════════════════════════════════════
// SHOW / HIDE LOADING STATE
// ══════════════════════════════════════════════════════════════════
function showLoading() {
  resultCard.classList.remove('d-none');
  loadingState.classList.remove('d-none');
  resultState.style.display = 'none';
  setTimeout(() => resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
}

function hideLoading() {
  loadingState.classList.add('d-none');
  resultState.style.display = '';
}

// ══════════════════════════════════════════════════════════════════
// RENDER PREDICTION RESULT
// ══════════════════════════════════════════════════════════════════
function renderResult(data) {
  hideLoading();

  const badgeMap = {
    low:    { cls: 'badge-low',    icon: 'bi-check-circle-fill',       color: '#00c97d' },
    medium: { cls: 'badge-medium', icon: 'bi-exclamation-circle-fill', color: '#ff8c42' },
    high:   { cls: 'badge-high',   icon: 'bi-x-circle-fill',           color: '#ff4d6d' },
  };

  const cfg = badgeMap[data.severity];
  resultBadge.className = `result-badge-large ${cfg.cls}`;
  resultIcon.className  = `bi ${cfg.icon} result-icon`;
  resultIcon.style.color  = cfg.color;
  resultLabel.textContent = data.label;
  resultLabel.style.color = cfg.color;
  resultRange.textContent = data.range;

  const descMap = {
    low:    'The model predicts a <strong>short hospital stay (0–30 days)</strong>. The patient is likely to recover quickly with minimal intervention required.',
    medium: 'The model predicts a <strong>medium hospital stay (31–70 days)</strong>. Moderate clinical resources and monitoring will be needed.',
    high:   'The model predicts a <strong>long hospital stay (71+ days)</strong>. Intensive care and significant resource allocation is recommended.',
  };
  resultDesc.innerHTML = descMap[data.severity];

  const probs = data.probabilities;
  setTimeout(() => {
    shortBar.style.width  = probs.short  + '%';
    mediumBar.style.width = probs.medium + '%';
    longBar.style.width   = probs.long   + '%';
    shortPct.textContent  = probs.short  + '%';
    mediumPct.textContent = probs.medium + '%';
    longPct.textContent   = probs.long   + '%';
  }, 150);

  timestamp.textContent = 'Predicted at ' + new Date().toLocaleTimeString();

  resultCard.style.animation = 'none';
  requestAnimationFrame(() => { resultCard.style.animation = ''; });
}

// ══════════════════════════════════════════════════════════════════
// FORM SUBMIT
// ══════════════════════════════════════════════════════════════════
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    const firstInvalid = form.querySelector('.is-invalid');
    if (firstInvalid) {
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstInvalid.focus();
    }
    return;
  }

  submitBtn.disabled = true;
  submitBtn.querySelector('.btn-normal-state').classList.add('d-none');
  submitBtn.querySelector('.btn-loading-state').classList.remove('d-none');
  showLoading();

  try {
    const payload = buildPayload();

    const response = await fetch('/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok || result.error) {
      throw new Error(result.error || `Server error: ${response.status}`);
    }

    await new Promise(resolve => setTimeout(resolve, 600));
    renderResult(result);

  } catch (err) {
    hideLoading();
    resultCard.classList.remove('d-none');
    resultState.style.display = '';
    resultBadge.className = 'result-badge-large';
    resultBadge.style.border = '2px solid rgba(255,77,109,0.4)';
    resultLabel.textContent = 'Error';
    resultLabel.style.color = '#ff4d6d';
    resultRange.textContent = '';
    resultDesc.innerHTML = `<span class="text-danger"><i class="bi bi-exclamation-triangle me-2"></i>${err.message}</span>`;
    console.error('[MediStay AI] Prediction error:', err);

  } finally {
    submitBtn.disabled = false;
    submitBtn.querySelector('.btn-normal-state').classList.remove('d-none');
    submitBtn.querySelector('.btn-loading-state').classList.add('d-none');
  }
});

// ══════════════════════════════════════════════════════════════════
// RESET
// ══════════════════════════════════════════════════════════════════
resetBtn.addEventListener('click', () => {
  form.reset();
  form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
  resultCard.classList.add('d-none');
  autofillNotice.classList.add('d-none');
  [shortBar, mediumBar, longBar].forEach(b => b.style.width = '0%');
  [shortPct, mediumPct, longPct].forEach(p => p.textContent = '0%');
});

// ══════════════════════════════════════════════════════════════════
// NUMBER INPUT LIVE RANGE VALIDATION
// ══════════════════════════════════════════════════════════════════
form.querySelectorAll('input[type="number"]').forEach(input => {
  input.addEventListener('input', () => {
    const val = parseFloat(input.value);
    const min = parseFloat(input.min);
    const max = parseFloat(input.max);
    if (!isNaN(min) && !isNaN(max)) {
      input.classList.toggle('is-invalid', val < min || val > max);
    }
  });
});

// ══════════════════════════════════════════════════════════════════
// HERO ANIMATED COUNTERS
// ══════════════════════════════════════════════════════════════════
function animateCounter(el, from, to, duration, suffix = '') {
  const startTime = performance.now();
  const update = (now) => {
    const p = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(from + (to - from) * eased).toLocaleString() + suffix;
    if (p < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

(function setupCounters() {
  const statsEls      = document.querySelectorAll('.stat-value');
  const counterConfig = [
    { value: 66.97, suffix: '%',  decimals: true  },
    { value: 318,   suffix: 'K+', decimals: false },
    { value: 15,    suffix: '',   decimals: false  },
  ];
  let counted = false;

  new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting || counted) return;
      counted = true;
      statsEls.forEach((el, i) => {
        const cfg = counterConfig[i];
        if (!cfg) return;
        if (cfg.decimals) {
          const start = performance.now();
          const run = (now) => {
            const p = Math.min((now - start) / 1200, 1);
            el.textContent = (cfg.value * (1 - Math.pow(1 - p, 3))).toFixed(2) + cfg.suffix;
            if (p < 1) requestAnimationFrame(run);
          };
          requestAnimationFrame(run);
        } else {
          animateCounter(el, 0, cfg.value, 1200, cfg.suffix);
        }
      });
    });
  }, { threshold: 0.3 }).observe(document.querySelector('.hero-stats'));
})();

console.log('%c MediStay AI 🏥 v2.0 ', 'background:#0066ff;color:#fff;font-size:14px;font-weight:bold;border-radius:4px;padding:4px 8px;');
console.log('%c Simple Mode + Advanced Mode + Auto-Fill + Sample Data ', 'color:#00d4ff;font-size:11px;');
