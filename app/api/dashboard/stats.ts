import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, format, addDays, subMonths } from 'date-fns';

// Configure BigInt serialization support
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
    
    // Get total patients - convert to number to avoid BigInt serialization issues
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
    
    // Get patients by gender with proper null handling
    const patients = await prisma.patient.findMany({
      where: { doctorId },
      select: { gender: true }
    });
    
    // Calculate gender distribution with null handling
    const patientsByGender = {
      male: patients.filter(p => p.gender?.toLowerCase() === 'male').length,
      female: patients.filter(p => p.gender?.toLowerCase() === 'female').length,
      other: patients.filter(p => !p.gender || !['male', 'female'].includes(p.gender.toLowerCase())).length
    };
    
    // Generate dates for the past 30 days
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subMonths(today, 1);
      return addDays(date, i);
    });
    
    // Format dates for comparison
    const formattedDays = last30Days.map(date => format(date, 'yyyy-MM-dd'));
    
    // Get appointments for each day in the last 30 days
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        scheduledAt: {
          gte: last30Days[0],
          lte: today
        }
      },
      select: {
        scheduledAt: true
      }
    });
    
    // Count appointments by day
    const appointmentsByDay = formattedDays.map(dateStr => {
      const count = appointments.filter(a => 
        format(a.scheduledAt, 'yyyy-MM-dd') === dateStr
      ).length;
      
      return {
        date: dateStr,
        count
      };
    });
    
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
      score: Number(a.score), // Convert possible BigInt to Number
      assessedOn: a.assessedOn.toISOString() // Ensure date is serializable
    }));
    
    // Make sure all data is serializable
    const responseData = {
      totalPatients,
      upcomingAppointments,
      appointmentsToday,
      recentAssessments,
      patientsByGender,
      appointmentsByDay,
      assessmentScores,
      success: true
    };
    
    // Ensure all potential BigInts are converted to Numbers
    const sanitizedData = JSON.parse(JSON.stringify(responseData, (key, value) =>
      typeof value === 'bigint' ? Number(value) : value
    ));
    
    return NextResponse.json(sanitizedData);
    
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics', details: error.message },
      { status: 500 }
    );
  }
}