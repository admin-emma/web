import { notificationBannersQueries } from '../../../lib/database.js';

export async function GET({ params }) {
  const id = params.id;
  const banner = notificationBannersQueries.getById.get(id);
  if (!banner) {
    return new Response('Not found', { status: 404 });
  }
  return new Response(JSON.stringify(banner), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function PUT({ params, request }) {
  const id = params.id;
  const body = await request.json();
  notificationBannersQueries.update.run(
    body.title,
    body.description,
    body.banner_type,
    body.image_url,
    body.action_url,
    body.action_text,
    body.is_active ? 1 : 0,
    body.dismissible ? 1 : 0,
    body.show_on_pages,
    id
  );
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function DELETE({ params }) {
  const id = params.id;
  notificationBannersQueries.delete.run(id);
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
