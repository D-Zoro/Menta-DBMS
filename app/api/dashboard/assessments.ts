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
    
    // Get recent assessments (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const assessments = await prisma.assessment.findMany({
      where: {
        patient: {
          doctorId
        },
        assessedOn: {
          gte: thirtyDaysAgo
        }
      },
      include: {
        patient: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        assessedOn: 'desc'
      },
      take: 10
    });

    // Transform the data to a more usable format
    const formattedAssessments = assessments.map(assessment => ({
      id: assessment.id,
      type: assessment.type,
      score: assessment.score,
      comments: assessment.comments,
      assessedOn: assessment.assessedOn.toISOString(),
      patientId: assessment.patientId,
      patient: {
        name: assessment.patient.name
      }
    }));

    return NextResponse.json({ 
      assessments: formattedAssessments,
      success: true 
    });
    
  } catch (error: any) {
    console.error('Error fetching assessments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessments', details: error.message },
      { status: 500 }
    );
  }
}