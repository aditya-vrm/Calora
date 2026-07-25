import dbConnect from '@/utils/dbConnect';
import User from '@/models/User';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'calora_default_secret_key_123';

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { email, password, firstName, lastName } = body;

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Please provide email and password.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return new Response(
        JSON.stringify({ error: 'An account with this email already exists.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create user with default/empty onboarding fields
    const newUser = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName: firstName || 'Protein',
      lastName: lastName || 'Enthusiast',
      age: 25,
      gender: 'male',
      height: 175,
      weight: 70,
      workoutFrequency: '3-4',
      goal: 'maintain',
      heightUnit: 'cm',
      weightUnit: 'kg',
      xp: 0,
      streak: 0,
      badges: [],
      targetCalories: 2000,
      targetMacros: { protein: 120, carbs: 200, fat: 65 },
    });

    await newUser.save();

    // Sign JWT
    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, {
      expiresIn: '30d',
    });

    // Create User Response without password
    const userResponse = newUser.toObject();
    delete userResponse.password;

    // Set cookie headers
    const secureFlag = process.env.NODE_ENV === 'production' ? 'Secure;' : '';
    const cookieHeader = `token=${token}; HttpOnly; ${secureFlag} Path=/; Max-Age=${30 * 24 * 60 * 60}; SameSite=Strict`;

    return new Response(
      JSON.stringify({ user: userResponse }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': cookieHeader,
        },
      }
    );
  } catch (error) {
    console.error('Registration API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
