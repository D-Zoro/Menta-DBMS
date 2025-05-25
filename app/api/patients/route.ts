import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// POST - Create a new patient
export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const doctorId = session.user.id;
    const { name, age, gender, contactInfo } = await request.json();
    
    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'Patient name is required' }, { status: 400 });
    }

    // Create new patient
    const patient = await prisma.patient.create({
      data: {
        name,
        age: age ? parseInt(age) : null,
        gender,
        contactInfo,
        doctorId
      }
    });

    return NextResponse.json(
      { message: 'Patient created successfully', patient },
      { status: 201 }
    );
    
  } catch (error: any) {
    console.error('Error creating patient:', error);
    return NextResponse.json(
      { error: 'Failed to create patient', details: error.message },
      { status: 500 }
    );
  }
}

// GET - Retrieve all patients for the logged in doctor
export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const doctorId = session.user.id;
    
    // Get all patients for this doctor
    const patients = await prisma.patient.findMany({
      where: {
        doctorId
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({ patients });
    
  } catch (error: any) {
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patients', details: error.message },
      { status: 500 }
    );
  }
}