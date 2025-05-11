import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const doctorId = session.user.id;
    
    // Get recent assessments
    const assessments = await prisma.assessment.findMany({
      where: {
        patient: {
          doctorId
        }
      },
      orderBy: {
        assessedOn: 'desc'
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
      take: 10
    });
    
    return NextResponse.json({ assessments });
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessments' },
      { status: 500 }
    );
  }
}