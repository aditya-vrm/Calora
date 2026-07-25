import dbConnect from '@/utils/dbConnect';
import User from '@/models/User';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'calora_default_secret_key_123';

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Please provide email and password.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Invalid email or password.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Compare passwords
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return new Response(
        JSON.stringify({ error: 'Invalid email or password.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Sign JWT
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: '30d',
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    // Set cookie headers
    const secureFlag = process.env.NODE_ENV === 'production' ? 'Secure;' : '';
    const cookieHeader = `token=${token}; HttpOnly; ${secureFlag} Path=/; Max-Age=${30 * 24 * 60 * 60}; SameSite=Strict`;

    return new Response(
      JSON.stringify({ user: userResponse }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': cookieHeader,
        },
      }
    );
  } catch (error) {
    console.error('Login API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
