import dbConnect from '@/utils/dbConnect';
import User from '@/models/User';
import { getSessionUserId } from '@/utils/auth';
import { calculateFitnessParams } from '@/utils/fitness';

export async function PUT(request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await dbConnect();
    const body = await request.json();
    
    // Find the user first
    const user = await User.findById(userId);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not found.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // List of allowed profile/setting updates
    const updates = [
      'firstName',
      'lastName',
      'age',
      'gender',
      'height',
      'weight',
      'workoutFrequency',
      'goal',
      'heightUnit',
      'weightUnit',
      'xp',
      'streak',
      'badges',
    ];

    // Apply updates
    updates.forEach((field) => {
      if (body[field] !== undefined) {
        user[field] = body[field];
      }
    });

    // Re-calculate calorie targets if fitness parameters changed
    const fitnessParamsChanged =
      body.weight !== undefined ||
      body.height !== undefined ||
      body.age !== undefined ||
      body.gender !== undefined ||
      body.workoutFrequency !== undefined ||
      body.goal !== undefined;

    if (fitnessParamsChanged) {
      const fitnessParams = calculateFitnessParams({
        weight: user.weight,
        height: user.height,
        age: user.age,
        gender: user.gender,
        workoutFrequency: user.workoutFrequency,
        goal: user.goal,
      });

      user.targetCalories = fitnessParams.targetCalories;
      user.targetMacros = fitnessParams.macros;
    }

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    return new Response(
      JSON.stringify({ user: userResponse }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('API /profile Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function DELETE() {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await dbConnect();
    await User.findByIdAndDelete(userId);
    
    // Also delete all records belonging to user
    const Record = (await import('@/models/Record')).default;
    await Record.deleteMany({ userId });

    const cookieHeader = `token=; HttpOnly; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`;

    return new Response(
      JSON.stringify({ success: true, message: 'Account deleted successfully.' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': cookieHeader,
        },
      }
    );
  } catch (error) {
    console.error('API /profile DELETE Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
