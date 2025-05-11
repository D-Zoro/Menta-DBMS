import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // Parse JSON body
    const body = await request.json();
    const { email, otp } = body;
    
    if (!email || !otp) {
      return NextResponse.json(
        { message: 'Email and verification code are required' },
        { status: 400 }
      );
    }
    
    // Fetch OTP record
    const otpRecord = await prisma.otpVerification.findUnique({
      where: { email },
    });
    
    if (!otpRecord) {
      return NextResponse.json(
        { message: 'No verification code found for this email' },
        { status: 400 }
      );
    }
    
    // Check if OTP is expired
    if (otpRecord.expiresAt < new Date()) {
      return NextResponse.json(
        { message: 'Verification code has expired' },
        { status: 400 }
      );
    }
    
    // Check if too many attempts
    if (otpRecord.attempts >= 3) {
      return NextResponse.json(
        { message: 'Too many failed attempts. Please request a new code.' },
        { status: 400 }
      );
    }
    
    // Verify OTP
    if (otpRecord.otp !== otp) {
      // Increment attempts
      await prisma.otpVerification.update({
        where: { email },
        data: { attempts: otpRecord.attempts + 1 },
      });
      
      return NextResponse.json(
        { message: 'Invalid verification code' },
        { status: 400 }
      );
    }
    
    // OTP is valid - mark as verified
    await prisma.otpVerification.update({
      where: { email },
      data: { verified: true },
    });
    
    return NextResponse.json(
      { message: 'Email verified successfully' },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { message: 'Failed to verify code', error: error.message },
      { status: 500 }
    );
  }
}