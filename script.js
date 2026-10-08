/* ==========================================================================
   Утилиты и состояние
   ========================================================================== */

const $ = id => document.getElementById(id);
const page = document.body.dataset.page;
const cmp = new Intl.Collator('be');

/* ==========================================================================
   Демо-данные
   ========================================================================== */

const demo = [
  {
    id: 'demo1',
    type: 'poem',
    title: 'Ціхі ранак',
    author: 'Аліна Каваленка',
    text: 'На падваконні сонца спіць,\nІ дзень павольна пачынаецца.\nУ кубку цёплая імгла дрыжыць,\nА свет за вокнамі ўсміхаецца.',
    created: 3
  },
  {
    id: 'demo2',
    type: 'poem',
    title: 'Лісты да восені',
    author: 'Максім Ліс',
    text: 'Я напішу табе на жоўтым лісці\nПра дождж, што заблукаў паміж дамоў,\nПра тое, як мы некалі ў дзяцінстве\nЗбіралі цэлы свет з простых слоў.',
    created: 2
  },
  {
    id: 'demo3',
    type: 'poem',
    title: 'Паміж радкоў',
    author: 'Дар’я Мельнік',
    text: 'Паміж радкоў жыве маё маўчанне,\nТам кожны гук яшчэ не мае меж.\nІ кожнае маленькае прызнанне\nЗнаходзіць шлях у ненапісаны верш.',
    created: 1
  },
  {
    id: 'demo4',
    type: 'language',
    title: 'Слова, якое хочацца захаваць',
    author: 'Рэдакцыя Натхнення',
    text: 'Прыклад рубрыкі пра беларускую мову. Тут можна размясціць матэрыял пра любімае слова, яго значэнне і ўжыванне.\n\nГэта дэманстрацыйны тэкст для афармлення старонкі.',
    created: 6
  },
  {
    id: 'demo5',
    type: 'culture',
    title: 'Культура ў штодзённасці',
    author: 'Рэдакцыя Натхнення',
    text: 'Прыклад матэрыялу пра культуру. Гісторыя пра кнігу, музыку або выставу, якая пакінула след.\n\nГэта дэманстрацыйны тэкст, а не паведамленне пра рэальную падзею.',
    created: 5
  },
  {
    id: 'demo6',
    type: 'news',
    title: 'Навіны нашай супольнасці',
    author: 'Рэдакцыя Натхнення',
    text: 'Месца для праверанай навіны пра Беларусь або студэнцкую супольнасць.\n\nГэты тэкст паказвае афармленне і не з’яўляецца рэальнай навіной.',
    created: 4
  }
];

const labels = {
  poem: 'Верш',
  news: 'Навіны',
  culture: 'Культура',
  language: 'Мова',
  idea: 'Ідэя'
};

let items = demo;

/* ==========================================================================
   Валидация и загрузка из localStorage
   ========================================================================== */

function valid(arr) {
  if (!Array.isArray(arr)) return null;
  return arr
    .filter(p =>
      p &&
      typeof p.id === 'string' &&
      typeof p.title === 'string' &&
      typeof p.author === 'string' &&
      typeof p.text === 'string'
    )
    .map(p => ({ ...p, type: labels[p.type] ? p.type : 'poem' }));
}

try {
  const v2 = valid(JSON.parse(localStorage.getItem('natkhnenne-content-v2')));
  if (v2) {
    items = v2;
  } else {
    const old = valid(JSON.parse(localStorage.getItem('natkhnenne-poems-v1')));
    if (old) items = [...old, ...demo.filter(p => p.type !== 'poem')];
  }
} catch (e) {}

/* ==========================================================================
   Хелпер создания элемента
   ========================================================================== */

function node(tag, cls, text) {
  const n = document.createElement(tag);
  n.className = cls || '';
  if (text !== undefined) n.textContent = text;
  return n;
}

/* ==========================================================================
   Заполнение фильтра авторов
   ========================================================================== */

[...new Set(items.map(p => p.author))]
  .sort(cmp.compare)
  .forEach(a => $('filter').add(new Option(a, a)));

/* ==========================================================================
   Рендер
   ========================================================================== */

function render() {
  const ap = page === 'authors';
  const q = $('search').value.trim().toLocaleLowerCase('be');

  let rows = items.filter(p =>
    (page !== 'poems' || p.type === 'poem') &&
    (page !== 'culture' || p.type !== 'poem') &&
    (ap ? p.author : p.title + ' ' + p.author + ' ' + p.text)
      .toLocaleLowerCase('be').includes(q) &&
    (ap || !$('filter').value || p.author === $('filter').value) &&
    (!$('category').value || p.type === $('category').value)
  );

  rows.sort((a, b) =>
    $('sort').value === 'title'
      ? cmp.compare(a.title, b.title)
      : $('sort').value === 'author'
        ? cmp.compare(a.author, b.author) || cmp.compare(a.title, b.title)
        : (b.created || 0) - (a.created || 0)
  );

  $('grid').replaceChildren();

  if (ap) {
    /* --- Страница авторов: одна карточка на автора --- */
    const names = [...new Set(rows.map(p => p.author))].sort(cmp.compare);
    $('count').textContent = 'Аўтараў: ' + names.length;

    names.forEach((a, i) => {
      const c = node('article', 'card');
      c.append(
        node('div', 'number', String(i + 1).padStart(2, '0')),
        node('div', 'avatar', a.split(/\s+/).map(s => s[0]).slice(0, 2).join('')),
        node('h3', '', a),
        node('p', 'author', 'Матэрыялаў: ' + items.filter(p => p.author === a).length)
      );

      const l = node('a', 'read', 'Чытаць аўтара ↗');
      l.href = 'index.html?author=' + encodeURIComponent(a) + '#collection';
      c.append(l);
      $('grid').append(c);
    });
  } else {
    /* --- Обычный список материалов --- */
    $('count').textContent = 'Матэрыялаў: ' + rows.length;

    rows.forEach((p, i) => {
      const c = node('article', 'card');
      const top = node('div', 'card-top');

      top.append(
        node('span', 'number', String(i + 1).padStart(2, '0')),
        node('span', 'tag', labels[p.type] + (p.id.startsWith('demo') ? ' · прыклад' : ''))
      );

      c.append(
        top,
        node('h3', '', p.title),
        node(
          'div',
          'verse',
          p.type === 'poem'
            ? p.text.split('\n').slice(0, 4).join('\n')
            : p.text.slice(0, 160) + (p.text.length > 160 ? '…' : '')
        ),
        node('p', 'author', p.author)
      );

      const b = node('button', 'read', 'Чытаць цалкам ↗');
      b.onclick = () => {
        $('title').textContent = p.title;
        $('author').textContent = p.author;
        $('text').textContent = p.text;
        $('readCategory').textContent = labels[p.type];
        $('reader').showModal();
      };

      c.append(b);
      $('grid').append(c);
    });
  }

  if (!$('grid').children.length) {
    $('grid').append(node('p', 'empty', 'Нічога не знойдзена. Паспрабуйце іншы запыт.'));
  }
}

/* ==========================================================================
   Активная навигация
   ========================================================================== */

document.querySelectorAll('nav a').forEach(a => {
  if (a.dataset.page === page) {
    a.classList.add('active');
    a.setAttribute('aria-current', 'page');
  }
});

/* ==========================================================================
   Диалог и события фильтров
   ========================================================================== */

$('close').onclick = () => $('reader').close();

['search', 'filter', 'sort', 'category'].forEach(id =>
  $(id).addEventListener(id === 'search' ? 'input' : 'change', render)
);

/* ==========================================================================
   Автор из URL
   ========================================================================== */

const params = new URLSearchParams(location.search);
if (params.has('author')) $('filter').value = params.get('author');

render();

/* ==========================================================================
   Синхронизация между вкладками
   ========================================================================== */

window.addEventListener('storage', e => {
  if (['natkhnenne-content-v2', 'natkhnenne-poems-v1'].includes(e.key)) {
    location.reload();
  }
});

/* ==========================================================================
   Плавные переходы между страницами
   ========================================================================== */

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('click', e => {
  const a = e.target.closest('a[href]');
  if (
    !a ||
    e.defaultPrevented ||
    e.button !== 0 ||
    e.ctrlKey ||
    e.metaKey ||
    e.shiftKey ||
    e.altKey ||
    a.target ||
    a.hasAttribute('download') ||
    reduced ||
    ('startViewTransition' in document)
  ) return;

  const u = new URL(a.href, location.href);
  if (
    u.origin !== location.origin ||
    !u.pathname.endsWith('.html') ||
    (u.pathname === location.pathname && u.search === location.search)
  ) return;

  e.preventDefault();
  document.body.classList.add('leaving');
  setTimeout(() => location.assign(u.href), 180);
});

window.addEventListener('pageshow', () => document.body.classList.remove('leaving'));