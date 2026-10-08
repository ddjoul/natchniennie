const db = window.supabase.createClient(
  'https://vqcjtkruncqslrxeekmz.supabase.co',
  'sb_publishable_lMQD_C8Ti6rFzc2H5CK44A_hpYt1fuN'
);

async function loadSiteData() {
  const grid = document.getElementById('grid');

  if (grid) {
    grid.textContent = 'Загрузка матэрыялаў…';
  }

  try {
    const { data, error } = await db
      .from('posts')
      .select(`
        id,
        title,
        body,
        category,
        published_at,
        created_at,
        authors (
          name
        )
      `)
      .eq('status', 'published')
      .order('published_at', {
        ascending: false,
        nullsFirst: false
      });

    if (error) throw error;

    // Приводим записи базы к формату текущего сайта.
    window.siteItems = data.map(post => ({
      id: post.id,
      type: post.category,
      title: post.title,
      author: post.authors?.name || 'Без аўтара',
      text: post.body,
      created: Date.parse(
        post.published_at || post.created_at
      )
    }));

    // Запускаем оформление карточек после загрузки данных.
    const script = document.createElement('script');
    script.src = 'script.js';

    script.onerror = () => {
      if (grid) {
        grid.textContent =
          'Не ўдалося загрузіць логіку сайта.';
      }
    };

    document.body.appendChild(script);
  } catch (error) {
    console.error('Ошибка загрузки:', error);

    if (grid) {
      grid.textContent =
        'Не ўдалося загрузіць матэрыялы. Паспрабуйце пазней.';
    }
  }
}

loadSiteData();
