import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// POST - Create a new appointment
export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const doctorId = session.user.id;
    const { patientId, scheduledAt, durationMinutes, notes } = await request.json();
    
    // Validate required fields
    if (!patientId || !scheduledAt) {
      return NextResponse.json({ 
        error: 'Patient and scheduled date/time are required' 
      }, { status: 400 });
    }

    // Verify the patient belongs to the logged-in doctor
    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        doctorId: doctorId
      }
    });

    if (!patient) {
      return NextResponse.json({ 
        error: 'Patient not found or not associated with this doctor' 
      }, { status: 404 });
    }

    // Create new appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        scheduledAt: new Date(scheduledAt),
        durationMinutes: durationMinutes || 60,
        notes
      },
      include: {
        patient: {
          select: {
            name: true,
            gender: true,
            age: true
          }
        }
      }
    });

    return NextResponse.json(
      { message: 'Appointment created successfully', appointment },
      { status: 201 }
    );
    
  } catch (error: any) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment', details: error.message },
      { status: 500 }
    );
  }
}

// GET - Retrieve all appointments for the logged in doctor
export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const doctorId = session.user.id;
    const url = new URL(request.url);
    const future = url.searchParams.get('future');
    
    let whereClause: any = { doctorId };

    // If future=true, only get appointments in the future
    if (future === 'true') {
      whereClause.scheduledAt = { gte: new Date() };
    }
    
    // Get all appointments for this doctor
    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            gender: true,
            age: true
          }
        }
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    });

    return NextResponse.json({ appointments });
    
  } catch (error: any) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments', details: error.message },
      { status: 500 }
    );
  }
}