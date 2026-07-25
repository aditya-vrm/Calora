export async function POST() {
  const cookieHeader = `token=; HttpOnly; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`;

  return new Response(
    JSON.stringify({ success: true, message: 'Logged out successfully.' }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookieHeader,
      },
    }
  );
}
