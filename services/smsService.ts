/**
 * SMS Service using Twilio
 * Handles sending SMS messages for verification
 */

import twilio from 'twilio';

// Twilio credentials from your dashboard
const TWILIO_ACCOUNT_SID = 'AC10994bbd0df0e996a20dd46f8abf673e'; // Your main Account SID (starts with AC)
const TWILIO_API_KEY = 'SK97f472cee5b1ac645353cbd15bbb610b'; // Your API Key
const TWILIO_API_SECRET = 'kM7r4pDWbU5PKHIY292bZFU3mHEKCT02'; // Your API Secret
const TWILIO_PHONE_NUMBER = '+16814994409'; // Your Twilio phone number

// Initialize Twilio client with API Key
const client = twilio(TWILIO_API_KEY, TWILIO_API_SECRET, {
  accountSid: TWILIO_ACCOUNT_SID
});

interface SMSVerificationData {
  phone: string;
  verificationCode: string;
  timestamp: number;
  attempts: number;
}

// In-memory storage for verification codes (use Redis in production)
const verificationCodes = new Map<string, SMSVerificationData>();

/**
 * Generate a random 6-digit verification code
 */
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send SMS verification code
 * @param phone - Phone number in E.164 format (e.g., +1234567890)
 * @returns Promise<{ success: boolean; message: string; code?: string }>
 */
export async function sendVerificationSMS(phone: string): Promise<{
  success: boolean;
  message: string;
  code?: string;
}> {
  try {
    // Validate phone number format (basic E.164 validation)
    if (!phone.startsWith('+') || phone.length < 10) {
      return {
        success: false,
        message: 'Invalid phone number format. Please use international format (+1234567890)',
      };
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    
    // Store verification data (expires in 10 minutes)
    const verificationData: SMSVerificationData = {
      phone,
      verificationCode,
      timestamp: Date.now(),
      attempts: 0,
    };
    
    verificationCodes.set(phone, verificationData);

    // Create SMS message
    const message = `Your Geffter verification code is: ${verificationCode}. This code expires in 10 minutes.`;

    // Send SMS via Twilio
    const result = await client.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER, // Your Twilio phone number
      to: phone,
    });

    console.log(`✅ SMS sent to ${phone}. Message SID: ${result.sid}`);

    return {
      success: true,
      message: 'Verification code sent successfully!',
      code: verificationCode, // Include for testing - remove in production
    };

  } catch (error) {
    console.error('❌ Error sending SMS:', error);
    
    // Handle specific Twilio errors
    if (error instanceof Error) {
      if (error.message.includes('Invalid phone number')) {
        return {
          success: false,
          message: 'Invalid phone number. Please check the format.',
        };
      }
      if (error.message.includes('not a mobile number')) {
        return {
          success: false,
          message: 'This number cannot receive SMS messages.',
        };
      }
    }

    return {
      success: false,
      message: 'Failed to send verification code. Please try again.',
    };
  }
}

/**
 * Verify SMS code
 * @param phone - Phone number in E.164 format
 * @param code - Verification code entered by user
 * @returns Promise<{ success: boolean; message: string }>
 */
export async function verifySMSCode(phone: string, code: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const verificationData = verificationCodes.get(phone);

    if (!verificationData) {
      return {
        success: false,
        message: 'No verification code found for this number. Please request a new code.',
      };
    }

    // Check if code has expired (10 minutes)
    const now = Date.now();
    const expirationTime = verificationData.timestamp + (10 * 60 * 1000); // 10 minutes

    if (now > expirationTime) {
      verificationCodes.delete(phone);
      return {
        success: false,
        message: 'Verification code has expired. Please request a new code.',
      };
    }

    // Check attempt limit (max 3 attempts)
    if (verificationData.attempts >= 3) {
      verificationCodes.delete(phone);
      return {
        success: false,
        message: 'Too many incorrect attempts. Please request a new code.',
      };
    }

    // Verify code
    if (verificationData.verificationCode !== code) {
      verificationData.attempts++;
      verificationCodes.set(phone, verificationData);
      
      const remainingAttempts = 3 - verificationData.attempts;
      return {
        success: false,
        message: `Incorrect code. ${remainingAttempts} attempts remaining.`,
      };
    }

    // Code is correct - remove from storage
    verificationCodes.delete(phone);
    
    console.log(`✅ Phone number ${phone} verified successfully`);
    
    return {
      success: true,
      message: 'Phone number verified successfully!',
    };

  } catch (error) {
    console.error('❌ Error verifying SMS code:', error);
    return {
      success: false,
      message: 'Verification failed. Please try again.',
    };
  }
}

/**
 * Resend verification SMS
 * @param phone - Phone number in E.164 format
 * @returns Promise<{ success: boolean; message: string }>
 */
export async function resendVerificationSMS(phone: string): Promise<{
  success: boolean;
  message: string;
}> {
  // Clear existing verification data
  verificationCodes.delete(phone);
  
  // Send new verification SMS
  return await sendVerificationSMS(phone);
}

/**
 * Clean up expired verification codes (call this periodically)
 */
export function cleanupExpiredCodes(): void {
  const now = Date.now();
  const expirationTime = 10 * 60 * 1000; // 10 minutes

  const entries = Array.from(verificationCodes.entries());
  for (const [phone, data] of entries) {
    if (now - data.timestamp > expirationTime) {
      verificationCodes.delete(phone);
      console.log(`🧹 Cleaned up expired verification for ${phone}`);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredCodes, 5 * 60 * 1000);

export default {
  sendVerificationSMS,
  verifySMSCode,
  resendVerificationSMS,
  cleanupExpiredCodes,
};
