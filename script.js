const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('#navMenu');

navToggle?.addEventListener('click', () => {
  const expanded = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!expanded));
  navMenu.classList.toggle('open');
});

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

const analyzerForm = document.querySelector('#analyzerForm');
const scoreRing = document.querySelector('#scoreRing');
const scoreValue = document.querySelector('#scoreValue');
const verdict = document.querySelector('#verdict');
const recommendations = document.querySelector('#recommendations');
const messageText = document.querySelector('#messageText');
const fillExample = document.querySelector('#fillExample');
const resetAnalyzer = document.querySelector('#resetAnalyzer');
const printResult = document.querySelector('#printResult');

function setScore(score) {
  const safeScore = Math.max(0, Math.min(100, score));
  const deg = safeScore * 3.6;
  let color = '#df4b4b';
  if (safeScore >= 70) color = '#13a36f';
  else if (safeScore >= 45) color = '#f2a51a';
  scoreRing.style.background = `conic-gradient(${color} ${deg}deg, #e9edf6 0deg)`;
  scoreValue.textContent = `${safeScore}`;
  return safeScore;
}

function renderRecommendations(score, checkedIds) {
  let items = [];
  if (score >= 70) {
    verdict.textContent = 'Информация выглядит относительно надёжной, но её всё равно стоит сравнить с другими источниками.';
    items = [
      'Проверьте первоисточник статистики и дату публикации.',
      'Сформулируйте вывод: какие факты подтверждены, а какие требуют дополнительной проверки?',
      'Обсудите, какая аудитория является адресатом сообщения.'
    ];
  } else if (score >= 45) {
    verdict.textContent = 'Информации можно частично доверять, но нужна дополнительная проверка.';
    items = [
      'Найдите минимум один независимый источник по той же теме.',
      'Отделите факты от мнений и рекламных утверждений.',
      'Проверьте, не устарели ли экономические данные.'
    ];
  } else {
    verdict.textContent = 'Сообщение содержит признаки недостоверности или манипуляции.';
    items = [
      'Не принимайте финансовых решений на основе этого сообщения.',
      'Проверьте автора, источник и доказательства.',
      'Обратите внимание на срочность, обещания гарантированного дохода и эмоциональное давление.'
    ];
  }

  if (checkedIds.has('qUrgent')) items.unshift('Призыв к срочному действию — важный сигнал риска.');
  if (checkedIds.has('qProfit')) items.unshift('Гарантированный высокий доход почти всегда требует критической проверки.');
  if (!checkedIds.has('qData')) items.push('Попросите учащихся найти, какие цифры и факты можно проверить.');

  recommendations.innerHTML = items.map(item => `<li>${item}</li>`).join('');
}

analyzerForm?.addEventListener('submit', event => {
  event.preventDefault();
  const inputs = [...analyzerForm.querySelectorAll('input[type="checkbox"]')];
  const checked = inputs.filter(input => input.checked);
  const checkedIds = new Set(checked.map(input => input.id));
  let score = 35;

  checked.forEach(input => {
    score += Number(input.dataset.score || 0);
  });

  const text = messageText.value.toLowerCase();
  const riskyWords = ['срочно', 'гарантирован', 'быстро', 'без риска', 'только сегодня', 'успей', 'шок', 'секрет'];
  const evidenceWords = ['исследование', 'статистика', 'источник', 'данные', 'отчёт', 'доклад', 'официальн'];
  riskyWords.forEach(word => { if (text.includes(word)) score -= 3; });
  evidenceWords.forEach(word => { if (text.includes(word)) score += 2; });

  const finalScore = setScore(score);
  renderRecommendations(finalScore, checkedIds);
});

fillExample?.addEventListener('click', () => {
  messageText.value = 'В социальной сети появился пост: «Только сегодня вложи 5000 рублей и получи гарантированный доход 30% в месяц. Риска нет, эксперты уже подтвердили. Успей перейти по ссылке, пока места не закончились!»';
  analyzerForm.querySelectorAll('input[type="checkbox"]').forEach(input => input.checked = false);
  ['qEmotion', 'qUrgent', 'qProfit'].forEach(id => document.querySelector(`#${id}`).checked = true);
});

resetAnalyzer?.addEventListener('click', () => {
  scoreRing.style.background = 'conic-gradient(var(--primary) 0deg, #e9edf6 0deg)';
  scoreValue.textContent = '—';
  verdict.textContent = 'Заполните форму, чтобы получить оценку.';
  recommendations.innerHTML = '<li>Начните с определения источника, автора и даты публикации.</li><li>Проверьте, есть ли факты, цифры и ссылки на первоисточники.</li>';
});

printResult?.addEventListener('click', () => window.print());

const cases = [
  {
    label: 'Кейс 1',
    title: 'Блогер обещает доход 30% в месяц',
    text: 'В социальной сети блогер пишет: «Я нашёл лучший способ заработать. Вложи 10 000 рублей сегодня и уже через месяц получишь 13 000. Риск отсутствует, количество мест ограничено».'
  },
  {
    label: 'Кейс 2',
    title: 'Новость о резком росте цен',
    text: 'Новостной канал публикует заголовок: «Цены скоро взлетят! Покупатели массово скупают товары». В тексте есть один комментарий продавца, но нет статистики и ссылки на официальные данные.'
  },
  {
    label: 'Кейс 3',
    title: 'Кредит без переплаты',
    text: 'Реклама банка обещает: «Кредит без переплаты и скрытых условий». Внизу мелким шрифтом указано, что предложение действует только при подключении платной услуги и соблюдении ряда условий.'
  },
  {
    label: 'Кейс 4',
    title: 'Скидка 90% на маркетплейсе',
    text: 'Маркетплейс показывает товар со скидкой 90%. При сравнении выясняется, что за неделю до акции цена была повышена, а итоговая цена похожа на цену у конкурентов.'
  }
];

const caseTabs = document.querySelectorAll('.case-tab');
const caseLabel = document.querySelector('#caseLabel');
const caseTitle = document.querySelector('#caseTitle');
const caseText = document.querySelector('#caseText');

caseTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    caseTabs.forEach(item => item.classList.remove('active'));
    tab.classList.add('active');
    const data = cases[Number(tab.dataset.case)];
    caseLabel.textContent = data.label;
    caseTitle.textContent = data.title;
    caseText.textContent = data.text;
    document.querySelectorAll('.analysis-table td[contenteditable="true"]').forEach(td => td.textContent = 'Введите ответ...');
  });
});

const quizForm = document.querySelector('#quizForm');
const quizResult = document.querySelector('#quizResult');

quizForm?.addEventListener('submit', event => {
  event.preventDefault();
  const total = 5;
  let score = 0;
  for (let i = 1; i <= total; i++) {
    const answer = quizForm.querySelector(`input[name="q${i}"]:checked`);
    if (answer) score += Number(answer.value);
  }
  let comment = 'Попробуйте ещё раз и повторите чек-лист.';
  if (score === 5) comment = 'Отлично! Вы уверенно распознаёте признаки достоверной и сомнительной информации.';
  else if (score >= 3) comment = 'Хороший результат. Обратите внимание на различие фактов, мнений и рекламных обещаний.';
  quizResult.classList.add('show');
  quizResult.innerHTML = `<h3>Результат: ${score} из ${total}</h3><p>${comment}</p>`;
});
