import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// Generate a random 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send email with OTP
async function sendOTPEmail(email: string, otp: string) {
  // For testing, you can use a service like Ethereal (https://ethereal.email/)
  // In production, use a real email service like SendGrid, AWS SES, etc.
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smpt.gmail.com', 
    port: Number(process.env.EMAIL_PORT) || 587,
    // secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `MENTA-DBMS <${process.env.EMAIL_FROM || 'noreply@menta-dbms.com'}>`,
    to: email,
    subject: 'Your Verification Code',
    text: `Your MENTA-DBMS verification code is: ${otp}. This code will expire in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(to right, #0ea5e9, #3b82f6); padding: 20px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">MENTA-DBMS</h1>
          <p style="margin: 5px 0 0;">Mental Healthcare Management System</p>
        </div>
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; text-align: center;">
          <h2>Your Verification Code</h2>
          <p>Please use the following code to verify your email address:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0; padding: 10px; background-color: #ffffff; border-radius: 4px; border: 1px solid #e5e7eb;">
            ${otp}
          </div>
          <p style="color: #4b5563; font-size: 14px;">This code will expire in 10 minutes.</p>
          <p style="color: #4b5563; font-size: 14px; margin-top: 20px;">If you didn't request this code, please ignore this email.</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }
    
    // Check if email is already registered
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return NextResponse.json({ message: 'Email is already registered' }, { status: 409 });
    }
    
    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Save OTP in database
    const otpRecord = await prisma.otpVerification.upsert({
      where: { email },
      update: {
        otp,
        expiresAt,
        attempts: 0,
      },
      create: {
        email,
        otp,
        expiresAt,
        attempts: 0,
      },
    });
    
    // Send OTP via email
    await sendOTPEmail(email, otp);
    
    return NextResponse.json({ 
      message: 'Verification code sent successfully',
      expiresAt: expiresAt.toISOString()
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('OTP request error:', error);
    return NextResponse.json(
      { message: 'Failed to send verification code', error: error.message },
      { status: 500 }
    );
  }
}