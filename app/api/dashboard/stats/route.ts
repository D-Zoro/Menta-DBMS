import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, format } from 'date-fns';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const doctorId = session.user.id;
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    
    // Get total patients
    const totalPatients = await prisma.patient.count({
      where: { doctorId }
    });
    
    // Get upcoming appointments count
    const upcomingAppointments = await prisma.appointment.count({
      where: {
        doctorId,
        scheduledAt: {
          gte: today
        }
      }
    });
    
    // Get today's appointments count
    const appointmentsToday = await prisma.appointment.count({
      where: {
        doctorId,
        scheduledAt: {
          gte: todayStart,
          lte: todayEnd
        }
      }
    });
    
    // Get recent assessments count (last 30 days)
    const recentAssessments = await prisma.assessment.count({
      where: {
        patient: {
          doctorId
        },
        assessedOn: {
          gte: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    });
    
    // Get patients by gender
    const patientsByGender = await prisma.$queryRaw<
      { male: number; female: number; other: number }[]
    >`
      SELECT
        SUM(CASE WHEN gender = 'male' THEN 1 ELSE 0 END) as male,
        SUM(CASE WHEN gender = 'female' THEN 1 ELSE 0 END) as female,
        SUM(CASE WHEN gender IS NULL OR gender NOT IN ('male', 'female') THEN 1 ELSE 0 END) as other
      FROM "Patient"
      WHERE "doctorId" = ${doctorId}
    `;
    
    // Get appointments by day for the current month
    const appointmentDays = await prisma.$queryRaw`
      SELECT 
        DATE("scheduledAt") as date,
        COUNT(*) as count
      FROM "Appointment"
      WHERE 
        "doctorId" = ${doctorId} AND
        "scheduledAt" >= ${monthStart} AND
        "scheduledAt" <= ${monthEnd}
      GROUP BY DATE("scheduledAt")
      ORDER BY date ASC
    `;
    
    // Get recent assessment scores
    const assessments = await prisma.assessment.findMany({
      where: {
        patient: {
          doctorId
        }
      },
      take: 10,
      orderBy: {
        assessedOn: 'desc'
      },
      include: {
        patient: {
          select: {
            name: true
          }
        }
      }
    });
    
    const assessmentScores = assessments.map(a => ({
      patient: a.patient.name,
      type: a.type,
      score: a.score
    }));
    
    return NextResponse.json({
      totalPatients,
      upcomingAppointments,
      appointmentsToday,
      recentAssessments,
      patientsByGender: patientsByGender[0] || { male: 0, female: 0, other: 0 },
      appointmentsByDay: appointmentDays,
      assessmentScores
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}