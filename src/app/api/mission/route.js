import { Mission } from '../db/schema';

export async function GET(){
    try {
        const response = await Mission.find({}).maxTimeMS(30000);
        if(!response || response.length === 0) {
            return new Response(JSON.stringify({ error: "No missions found" }), { status: 404 });
        }
    
        return new Response(JSON.stringify(response), { status: 200 });
        
    } catch (error) {
        console.error('Error fetching missions:', error);
     return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
        
    }
}
