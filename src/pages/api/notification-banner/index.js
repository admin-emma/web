import { getDatabase } from '../../../lib/database.js';

export async function GET() {
  try {
    const db = getDatabase();
    
    const banners = db.prepare(`
      SELECT * FROM notification_banners 
      ORDER BY is_active DESC
    `).all();

    return new Response(JSON.stringify(banners), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching notification banners:', error);
    return new Response(JSON.stringify({ error: 'Error loading banners' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function POST({ request }) {
  try {
    const db = getDatabase();
    const data = await request.json();

    const { title, description, banner_type, image_url, action_url, action_text, is_active, dismissible, show_on_pages } = data;

    if (!title || !banner_type) {
      return new Response(JSON.stringify({ error: 'Title and banner_type are required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const stmt = db.prepare(`
      INSERT INTO notification_banners (title, description, banner_type, image_url, action_url, action_text, is_active, dismissible, show_on_pages)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      title,
      description || null,
      banner_type,
      image_url || null,
      action_url || null,
      action_text || null,
      is_active ? 1 : 0,
      dismissible ? 1 : 0,
      show_on_pages || 'all'
    );

    return new Response(JSON.stringify({ 
      success: true, 
      id: result.lastInsertRowid,
      message: 'Banner created successfully' 
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error creating banner:', error);
    return new Response(JSON.stringify({ error: 'Error creating banner' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function PUT({ request }) {
  try {
    const db = getDatabase();
    const data = await request.json();
    const { id, title, description, banner_type, image_url, action_url, action_text, is_active, dismissible, show_on_pages } = data;

    if (!id || !title || !banner_type) {
      return new Response(JSON.stringify({ error: 'ID, title and banner_type are required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Si se activa este banner, desactivar todos los demás
    if (is_active) {
      db.prepare(`UPDATE notification_banners SET is_active = 0 WHERE is_active = 1 AND id != ?`).run(id);
    }

    const stmt = db.prepare(`
      UPDATE notification_banners 
      SET title = ?, description = ?, banner_type = ?, image_url = ?, action_url = ?, action_text = ?, is_active = ?, dismissible = ?, show_on_pages = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = stmt.run(
      title,
      description || null,
      banner_type,
      image_url || null,
      action_url || null,
      action_text || null,
      is_active ? 1 : 0,
      dismissible ? 1 : 0,
      show_on_pages || 'all',
      id
    );

    if (result.changes === 0) {
      return new Response(JSON.stringify({ error: 'Banner not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Banner updated successfully' 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error updating banner:', error);
    return new Response(JSON.stringify({ error: 'Error updating banner' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function DELETE({ request }) {
  try {
    const db = getDatabase();
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ error: 'Banner ID is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const stmt = db.prepare('DELETE FROM notification_banners WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      return new Response(JSON.stringify({ error: 'Banner not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Banner deleted successfully' 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error deleting banner:', error);
    return new Response(JSON.stringify({ error: 'Error deleting banner' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
