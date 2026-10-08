const $ = id => document.getElementById(id);
const page = document.body.dataset.page;
const cmp = new Intl.Collator('be');
const labels = { poem: 'Верш', news: 'Навіны', culture: 'Культура', language: 'Мова', idea: 'Ідэя' };
const items = window.siteItems || [];
const authors = window.siteAuthors || [];
function node(tag, cls, text) {
  const n = document.createElement(tag);
  n.className = cls || '';
  if (text !== undefined) n.textContent = text;
  return n;
}
$('filter').replaceChildren(new Option('Усе аўтары', ''));
[...authors].sort((a,b) => cmp.compare(a.name,b.name)).forEach(a => {
  $('filter').add(new Option(a.name, String(a.id)));
});
function render() {
  const q = $('search').value.trim().toLocaleLowerCase('be');
  $('grid').replaceChildren();
  if (page === 'authors') {
    const rows = authors.filter(a => a.name.toLocaleLowerCase('be').includes(q))
      .sort((a,b) => cmp.compare(a.name,b.name));
    $('count').textContent = 'Аўтараў: ' + rows.length;
    rows.forEach((a,i) => {
      const c = node('article', 'card');
      const count = items.filter(p => p.authorId === String(a.id)).length;
      c.append(
        node('div','number',String(i+1).padStart(2,'0')),
        node('div','avatar',a.name.trim().split(/\s+/).map(s => s[0]).slice(0,2).join('')),
        node('h3','',a.name),
        node('p','author','Апублікаваных матэрыялаў: '+count)
      );
      if (count) {
        const link = node('a','read','Чытаць аўтара ↗');
        link.href = 'index.html?author_id='+encodeURIComponent(a.id)+'#collection';
        c.append(link);
      } else {
        c.append(node('p','small','Матэрыялы хутка з’явяцца.'));
      }
      $('grid').append(c);
    });
  } else {
    const rows = items.filter(p =>
      (page !== 'poems' || p.type === 'poem') &&
      (page !== 'culture' || p.type !== 'poem') &&
      (p.title+' '+p.author+' '+p.text).toLocaleLowerCase('be').includes(q) &&
      (!$('filter').value || p.authorId === $('filter').value) &&
      (!$('category').value || p.type === $('category').value)
    );
    rows.sort((a,b) => $('sort').value === 'title' ? cmp.compare(a.title,b.title)
      : $('sort').value === 'author' ? cmp.compare(a.author,b.author)||cmp.compare(a.title,b.title)
      : b.created-a.created);
    $('count').textContent = 'Матэрыялаў: '+rows.length;
    rows.forEach((p,i) => {
      const c = node('article','card'), top = node('div','card-top');
      top.append(node('span','number',String(i+1).padStart(2,'0')),node('span','tag',labels[p.type]||'Матэрыял'));
      c.append(top,node('h3','',p.title),node('div','verse',p.type === 'poem'
        ? p.text.split('\n').slice(0,4).join('\n')
        : p.text.slice(0,160)+(p.text.length>160?'…':'')),node('p','author',p.author));
      const b = node('button','read','Чытаць цалкам ↗');
      b.onclick = () => {
        $('title').textContent = p.title;
        $('author').textContent = p.author;
        $('text').textContent = p.text;
        $('readCategory').textContent = labels[p.type]||'Матэрыял';
        $('reader').showModal();
      };
      c.append(b);$('grid').append(c);
    });
  }
  if (!$('grid').children.length) $('grid').append(node('p','empty','Нічога не знойдзена. Паспрабуйце іншы запыт.'));
}
document.querySelectorAll('nav a').forEach(a => {
  if(a.dataset.page === page){a.classList.add('active');a.setAttribute('aria-current','page');}
});
$('close').onclick = () => $('reader').close();
['search','filter','sort','category'].forEach(id => $(id).addEventListener(id === 'search' ? 'input' : 'change',render));
const params = new URLSearchParams(location.search);
if (params.has('author_id')) $('filter').value = params.get('author_id');
else if (params.has('author')) {
  const author = authors.find(a => a.name === params.get('author'));
  if(author) $('filter').value = String(author.id);
}
render();
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.addEventListener('click', e => {
  const a = e.target.closest('a[href]');
  if(!a||e.defaultPrevented||e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||a.target||a.hasAttribute('download')||reduced||('startViewTransition' in document))return;
  const u = new URL(a.href,location.href);
  if(u.origin!==location.origin||!u.pathname.endsWith('.html')||(u.pathname===location.pathname&&u.search===location.search))return;
  e.preventDefault();document.body.classList.add('leaving');
  setTimeout(()=>location.assign(u.href),180);
});
window.addEventListener('pageshow',()=>document.body.classList.remove('leaving'));