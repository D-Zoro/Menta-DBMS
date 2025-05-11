import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const hash = await bcrypt.hash("docpass123",10);

    await prisma.user.create({
        data: {
            name: "Dr. John Doe",
            email: "john@example.com",
            password:hash,
        },
    });
    console.log("doctor created .");

}

main();