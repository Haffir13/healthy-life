const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
menuButton?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});
nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  nav.classList.remove('open');
  menuButton?.setAttribute('aria-expanded', 'false');
}));

const observer = new IntersectionObserver(entries => {
  for (const entry of entries) if (entry.isIntersecting) entry.target.classList.add('visible');
}, { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const form = document.querySelector('#habit-form');
const output = document.querySelector('#plan-output');
const iconMap = { nutre:'⌁', mueve:'↗', equilibra:'◌' };

function scoreFromCompleted(done, total) {
  if (!total) return 0;
  return Math.round((done / total) * 100);
}

function renderPlan(data) {
  const saved = JSON.parse(localStorage.getItem('healthyLifeCompleted') || '{}');
  const completed = data.habits.filter(h => saved[h.id]).length;
  output.innerHTML = `
    <div class="plan-top">
      <h3>Tu plan de hoy</h3>
      <div class="live-score"><b id="live-score">${scoreFromCompleted(completed, data.habits.length)}%</b><span>Healthy Score</span></div>
    </div>
    <div class="plan-habits">
      ${data.habits.map(h => `
        <label class="habit-check ${saved[h.id] ? 'done' : ''}">
          <input type="checkbox" data-id="${h.id}" ${saved[h.id] ? 'checked' : ''}>
          <div><strong>${iconMap[h.id] || '•'} ${h.pillar}</strong><p>${h.text}</p></div>
          <span class="minutes">${h.minutes} min</span>
        </label>`).join('')}
    </div>
    <p class="plan-disclaimer">${data.disclaimer || ''}</p>`;

  output.querySelectorAll('input[type="checkbox"]').forEach(input => {
    input.addEventListener('change', () => {
      const state = JSON.parse(localStorage.getItem('healthyLifeCompleted') || '{}');
      state[input.dataset.id] = input.checked;
      localStorage.setItem('healthyLifeCompleted', JSON.stringify(state));
      input.closest('.habit-check').classList.toggle('done', input.checked);
      const checks = [...output.querySelectorAll('input[type="checkbox"]')];
      const done = checks.filter(c => c.checked).length;
      document.querySelector('#live-score').textContent = `${scoreFromCompleted(done, checks.length)}%`;
    });
  });
}

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = form.querySelector('button');
  const original = button.textContent;
  button.disabled = true;
  button.textContent = 'Creando tu plan…';
  output.innerHTML = '<div class="empty-state"><span>⌁</span><strong>Adaptando tus microhábitos…</strong></div>';
  try {
    const payload = {
      goal: document.querySelector('#goal').value,
      time: Number(document.querySelector('#time').value),
      mood: document.querySelector('#mood').value
    };
    const response = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('No se pudo generar el plan');
    const data = await response.json();
    renderPlan(data);
  } catch (error) {
    output.innerHTML = `<div class="empty-state"><span>!</span><strong>No pudimos generar el plan.</strong><p>Intenta nuevamente.</p></div>`;
  } finally {
    button.disabled = false;
    button.textContent = original;
  }
});
