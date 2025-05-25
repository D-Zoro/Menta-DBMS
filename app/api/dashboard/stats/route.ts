import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, format } from 'date-fns';

// Add BigInt serialization support
(BigInt.prototype as any).toJSON = function() {
  return Number(this);
};

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const doctorId = session.user.id;
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    
    // Get total patients - convert to number to avoid BigInt issues
    const totalPatients = Number(await prisma.patient.count({
      where: { doctorId }
    }));
    
    // Get upcoming appointments count
    const upcomingAppointments = Number(await prisma.appointment.count({
      where: {
        doctorId,
        scheduledAt: {
          gte: today
        }
      }
    }));
    
    // Get today's appointments count
    const appointmentsToday = Number(await prisma.appointment.count({
      where: {
        doctorId,
        scheduledAt: {
          gte: todayStart,
          lte: todayEnd
        }
      }
    }));
    
    // Get recent assessments count (last 30 days)
    const recentAssessments = Number(await prisma.assessment.count({
      where: {
        patient: {
          doctorId
        },
        assessedOn: {
          gte: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    }));
    
    // Get patients by gender
    const patients = await prisma.patient.findMany({
      where: { doctorId },
      select: { gender: true }
    });
    
    // Calculate gender distribution
    const patientsByGender = {
      male: patients.filter(p => p.gender?.toLowerCase() === 'male').length,
      female: patients.filter(p => p.gender?.toLowerCase() === 'female').length,
      other: patients.filter(p => !p.gender || !['male', 'female'].includes(p.gender.toLowerCase())).length
    };
    
    // Get appointments by day for the current month
    const appointmentsByDay = await prisma.appointment.groupBy({
      by: ['scheduledAt'],
      where: {
        doctorId,
        scheduledAt: {
          gte: monthStart,
          lte: monthEnd
        }
      },
      _count: true
    });
    
    const formattedAppointmentsByDay = appointmentsByDay.map(item => ({
      date: format(item.scheduledAt, 'yyyy-MM-dd'),
      count: Number(item._count)
    }));
    
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
      score: Number(a.score) // Convert possible BigInt to Number
    }));

    // Serialize the response data to handle any potential BigInt values
    const responseData = {
      totalPatients,
      upcomingAppointments,
      appointmentsToday,
      recentAssessments,
      patientsByGender,
      appointmentsByDay: formattedAppointmentsByDay,
      assessmentScores
    };
    
    return NextResponse.json(responseData);
    
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics', details: error.message },
      { status: 500 }
    );
  }
}