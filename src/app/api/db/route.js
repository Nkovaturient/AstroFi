const { config } = require('@/config/config');
const mongoose = require('mongoose');

const uri = config.DB_URI;

export async function GET() {

  try {
    await mongoose.connect(uri)
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    return new Response(JSON.stringify({message: 'connected'}), { status: 200 });
  } catch (error) {
    console.error("Error connecting to db: ", error.message); 
    return new Response(JSON.stringify({ error: 'Error connecting to db' }), { status: 500 });
  }

}
