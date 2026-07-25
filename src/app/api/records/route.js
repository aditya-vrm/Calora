import dbConnect from '@/utils/dbConnect';
import Record from '@/models/Record';
import { getSessionUserId } from '@/utils/auth';

export async function GET(request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await dbConnect();
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); // YYYY-MM-DD
    const type = searchParams.get('type'); // food, weight, steps, water

    const query = { userId };
    if (date) query.date = date;
    if (type) query.type = type;

    // Fetch records sorted by creation date (latest first)
    const records = await Record.find(query).sort({ createdAt: -1 });

    return new Response(
      JSON.stringify({ records }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('API /records GET Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST(request) {
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
    const { type, date, foodDetails, weightVal, stepsVal, waterVal } = body;

    if (!type || !date) {
      return new Response(
        JSON.stringify({ error: 'Type and date are required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Prepare data
    const recordData = {
      userId,
      type,
      date,
    };

    if (type === 'food') {
      if (!foodDetails || !foodDetails.foodName || !foodDetails.calories) {
        return new Response(
          JSON.stringify({ error: 'Food details (name, calories) are required.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      recordData.foodDetails = {
        foodName: foodDetails.foodName,
        mealType: foodDetails.mealType || 'Breakfast',
        weightGrams: parseFloat(foodDetails.weightGrams) || 0,
        calories: parseFloat(foodDetails.calories) || 0,
        protein: parseFloat(foodDetails.protein) || 0,
        carbs: parseFloat(foodDetails.carbs) || 0,
        fat: parseFloat(foodDetails.fat) || 0,
        fiber: parseFloat(foodDetails.fiber) || 0,
        sugar: parseFloat(foodDetails.sugar) || 0,
      };
    } else if (type === 'weight') {
      if (weightVal === undefined) {
        return new Response(
          JSON.stringify({ error: 'Weight value is required.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      recordData.weightVal = parseFloat(weightVal);
    } else if (type === 'steps') {
      if (stepsVal === undefined) {
        return new Response(
          JSON.stringify({ error: 'Steps value is required.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      recordData.stepsVal = parseInt(stepsVal, 10);
    } else if (type === 'water') {
      if (waterVal === undefined) {
        return new Response(
          JSON.stringify({ error: 'Water volume is required.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      recordData.waterVal = parseInt(waterVal, 10);
    }

    // Save record
    const newRecord = new Record(recordData);
    await newRecord.save();

    return new Response(
      JSON.stringify({ record: newRecord }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('API /records POST Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function DELETE(request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Record ID is required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Delete and ensure it belongs to the logged-in user
    const deletedRecord = await Record.findOneAndDelete({ _id: id, userId });
    
    if (!deletedRecord) {
      return new Response(
        JSON.stringify({ error: 'Record not found or unauthorized.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Record deleted successfully.', record: deletedRecord }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('API /records DELETE Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
