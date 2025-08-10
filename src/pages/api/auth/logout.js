export async function POST({ request }) {
  return new Response(JSON.stringify({
    success: true,
    message: 'Logout exitoso'
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': 'auth-token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict'
    }
  });
}
