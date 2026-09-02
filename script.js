const menuBtn = document.querySelector('#menuBtn');
const mobileNav = document.querySelector('#mobileNav');
const planForm = document.querySelector('#planForm');
const planResult = document.querySelector('#planResult');
const timeRange = document.querySelector('#timeRange');
const timeValue = document.querySelector('#timeValue');
const generateBtn = document.querySelector('#generateBtn');

menuBtn?.addEventListener('click', () => {
  const open = mobileNav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.textContent = open ? '×' : '☰';
});

document.querySelectorAll('#mobileNav a').forEach(link => {
  link.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.textContent = '☰';
  });
});

timeRange?.addEventListener('input', () => {
  timeValue.textContent = timeRange.value;
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

function getSavedCompleted() {
  try { return JSON.parse(localStorage.getItem('healthy-life-completed') || '[]'); }
  catch { return []; }
}

function saveCompleted(ids) {
  localStorage.setItem('healthy-life-completed', JSON.stringify(ids));
}

function renderPlan(data) {
  const saved = new Set(getSavedCompleted());
  const completedPoints = data.habits.filter(h => saved.has(h.id)).reduce((sum, h) => sum + h.points, 0);
  const score = Math.max(0, Math.min(100, completedPoints));

  planResult.innerHTML = `
    <div class="result-shell">
      <div class="result-top">
        <div><span class="eyebrow">Tu plan · ${data.profile.time} min</span><h3>${data.profile.goal}</h3><p class="intro">${data.intro}</p></div>
        <div class="score-ring" id="scoreRing" style="--score:${score}%"><span id="scoreValue">${score}</span></div>
      </div>
      <div class="habit-list">
        ${data.habits.map(h => `
          <label class="habit-item">
            <input class="habit-check" type="checkbox" data-id="${h.id}" data-points="${h.points}" ${saved.has(h.id) ? 'checked' : ''}>
            <span><strong>${h.pillar} · ${h.title}</strong><span>${h.action}</span></span>
            <span class="points">+${h.points}</span>
          </label>`).join('')}
      </div>
      <p class="result-disclaimer">${data.disclaimer}</p>
    </div>`;

  planResult.querySelectorAll('.habit-check').forEach(box => {
    box.addEventListener('change', () => {
      const checked = [...planResult.querySelectorAll('.habit-check:checked')];
      const ids = checked.map(el => el.dataset.id);
      const newScore = checked.reduce((sum, el) => sum + Number(el.dataset.points || 0), 0);
      saveCompleted(ids);
      document.querySelector('#scoreValue').textContent = newScore;
      document.querySelector('#scoreRing').style.setProperty('--score', `${newScore}%`);
    });
  });
}

planForm?.addEventListener('submit', async event => {
  event.preventDefault();
  generateBtn.disabled = true;
  generateBtn.textContent = 'Generando…';
  planResult.innerHTML = '<div class="loading">Preparando tus 3 microhábitos…</div>';

  const form = new FormData(planForm);
  const payload = {
    goal: form.get('goal'),
    time: Number(form.get('time')),
    energy: form.get('energy')
  };

  try {
    const response = await fetch('/api/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error(data.error || 'No se pudo generar el plan');
    renderPlan(data);
  } catch (error) {
    planResult.innerHTML = `<div class="error">No se pudo conectar con la API Node.js. ${error.message}</div>`;
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = 'Generar mi plan';
  }
});
