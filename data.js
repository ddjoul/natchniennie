const db = window.supabase.createClient(
  'https://vqcjtkruncqslrxeekmz.supabase.co',
  'sb_publishable_lMQD_C8Ti6rFzc2H5CK44A_hpYt1fuN'
);

async function loadSiteData() {
  const grid = document.getElementById('grid');
  if (grid) grid.textContent = 'Загрузка матэрыялаў…';
  try {
    const [authorsResult, postsResult] = await Promise.all([
      db.from('authors').select('id, name').order('name'),
      db.from('posts')
        .select('id, author_id, title, body, category, published_at, created_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false, nullsFirst: false })
    ]);
    if (authorsResult.error) throw authorsResult.error;
    if (postsResult.error) throw postsResult.error;
    window.siteAuthors = authorsResult.data || [];
    const byId = new Map(window.siteAuthors.map(a => [String(a.id), a]));
    window.siteItems = (postsResult.data || []).map(post => ({
      id: String(post.id),
      authorId: String(post.author_id),
      type: post.category,
      title: post.title || '',
      author: byId.get(String(post.author_id))?.name || 'Аўтар недаступны',
      text: post.body || '',
      created: Date.parse(post.published_at || post.created_at) || 0
    }));
    const script = document.createElement('script');
    script.src = 'script.js?v=db-authors-2';
    script.onerror = () => {
      if (grid) grid.textContent = 'Не ўдалося загрузіць логіку сайта.';
    };
    document.body.appendChild(script);
  } catch (error) {
    console.error('Ошибка загрузки:', JSON.stringify({
      code: error?.code, message: error?.message,
      details: error?.details, hint: error?.hint
    }, null, 2));
    if (grid) grid.textContent = 'Не ўдалося загрузіць матэрыялы. Паспрабуйце пазней.';
  }
}
loadSiteData();