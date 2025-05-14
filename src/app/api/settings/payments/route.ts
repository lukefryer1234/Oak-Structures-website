// src/app/api/settings/payments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import SettingsService, { PaymentSettings, paymentSettingsSchema } from '@/services/domain/settings-service';
import { getErrorMessage } from '@/utils/error-utils';

// GET handler to fetch payment settings
export async function GET() {
  try {
    const paymentSettings = await SettingsService.getPaymentSettings();
    
    return NextResponse.json({
      data: paymentSettings,
      success: true,
    });
  } catch (error) {
    console.error('Error fetching payment settings:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error),
      },
      { status: 500 }
    );
  }
}

// POST handler to update payment settings
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate the settings data using our schema
    const validatedFields = paymentSettingsSchema.safeParse(body);
    
    if (!validatedFields.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed.',
          errors: validatedFields.error.errors,
        },
        { status: 400 }
      );
    }
    
    // Update the settings using our service
    const result = await SettingsService.updatePaymentSettings(validatedFields.data);
    
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
          errors: result.errors,
        },
        { status: 400 }
      );
    }
    
    // Return a success response
    return NextResponse.json({
      data: validatedFields.data,
      success: true,
      message: 'Payment settings updated successfully.',
    });
  } catch (error) {
    console.error('Error updating payment settings:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error),
      },
      { status: 500 }
    );
  }
}

