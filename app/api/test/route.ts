import { PrismaClient } from "@/app/generated/prisma";
const prisma = new PrismaClient();

export async function GET(){
    try{
        const user = await prisma.user.findMany();
        return Response.json({user});
    }catch(err){
        console.log(err);
        return new Response(JSON.stringify({ error: err.message}),{
        status: 500,});
    }
}