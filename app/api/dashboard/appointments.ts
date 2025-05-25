import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const doctorId = session.user.id;
    const today = new Date();
    
    // Get upcoming appointments
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        scheduledAt: {
          gte: today
        }
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            age: true,
            gender: true
          }
        }
      },
      orderBy: {
        scheduledAt: 'asc'
      },
      take: 10 // Limit to 10 upcoming appointments for the dashboard
    });

    return NextResponse.json({ 
      appointments,
      success: true 
    });
    
  } catch (error: any) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments', details: error.message },
      { status: 500 }
    );
  }
}