import dbConnect from '@/utils/dbConnect';
import User from '@/models/User';
import { getSessionUserId } from '@/utils/auth';

export async function GET() {
  try {
    const userId = await getSessionUserId();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized. No active session.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await dbConnect();
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not found.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ user }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('API /auth/me Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
