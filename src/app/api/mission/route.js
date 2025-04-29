import { Mission } from '../db/schema';

export async function GET(){
    try {
        const response = await Mission.find({});
        if(!response || response.length === 0) {
            return new Response(JSON.stringify({ error: "No missions found" }), { status: 404 });
        }
        
        const data = await response.json();
        return new Response(JSON.stringify(data), { status: 200 });
        
    } catch (error) {
        console.error('Error processing funding:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        
    }
}
