// src/app/api/settings/financial/route.ts
import { NextRequest, NextResponse } from 'next/server';
import SettingsService, { FinancialSettings, financialSettingsSchema } from '@/services/domain/settings-service';
import { getErrorMessage } from '@/utils/error-utils';

// GET handler to fetch financial settings
export async function GET() {
  try {
    const financialSettings = await SettingsService.getFinancialSettings();
    
    return NextResponse.json({
      data: financialSettings,
      success: true,
    });
  } catch (error) {
    console.error('Error fetching financial settings:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error),
      },
      { status: 500 }
    );
  }
}

// POST handler to update financial settings
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate the settings data using our schema
    const validatedFields = financialSettingsSchema.safeParse(body);
    
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
    const result = await SettingsService.updateFinancialSettings(validatedFields.data);
    
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
      message: 'Financial settings updated successfully.',
    });
  } catch (error) {
    console.error('Error updating financial settings:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error),
      },
      { status: 500 }
    );
  }
}

