import dbConnect from '@/utils/dbConnect';
import User from '@/models/User';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { calculateFitnessParams } from '@/utils/fitness';

const JWT_SECRET = process.env.JWT_SECRET || 'calora_default_secret_key_123';

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    const {
      email,
      password,
      fullName,
      phoneNumber,
      gender,
      height,
      weight,
      heightUnit,
      weightUnit,
      age,
      workoutFrequency,
      goal,
    } = body;

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

    // Split Full Name
    const names = (fullName || '').trim().split(/\s+/);
    const firstName = names[0] || 'Protein';
    const lastName = names.slice(1).join(' ') || 'Enthusiast';

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Calculate calories & macros targets based on inputs
    const fitnessParams = calculateFitnessParams({
      weight: parseFloat(weight) || 70,
      height: parseFloat(height) || 170,
      age: parseInt(age, 10) || 25,
      gender: gender || 'male',
      workoutFrequency: workoutFrequency || '3-4',
      goal: goal || 'maintain',
    });

    // Create User Document
    const newUser = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      phoneNumber: phoneNumber || '',
      age: parseInt(age, 10) || 25,
      gender: gender || 'male',
      height: parseFloat(height) || 170,
      weight: parseFloat(weight) || 70,
      workoutFrequency: workoutFrequency || '3-4',
      goal: goal || 'maintain',
      heightUnit: heightUnit || 'cm',
      weightUnit: weightUnit || 'kg',
      xp: 0,
      streak: 0,
      badges: [],
      targetCalories: fitnessParams.targetCalories,
      targetMacros: fitnessParams.macros,
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
