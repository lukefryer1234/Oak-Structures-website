// src/app/api/settings/delivery/route.ts
import { NextRequest, NextResponse } from 'next/server';
import SettingsService, { DeliverySettings, deliverySettingsSchema } from '@/services/domain/settings-service';
import { getErrorMessage } from '@/utils/error-utils';

/**
 * GET handler to fetch delivery settings
 */
export async function GET() {
  try {
    // Fetch delivery settings using the service
    const deliverySettings = await SettingsService.getDeliverySettings();
    
    // Return successful response with data
    return NextResponse.json({
      data: deliverySettings,
      success: true,
    });
  } catch (error) {
    // Log the error
    console.error('Error fetching delivery settings:', error);
    
    // Return error response
    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error),
      },
      { status: 500 }
    );
  }
}

/**
 * POST handler to update delivery settings
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate the settings data using our schema
    const validatedFields = deliverySettingsSchema.safeParse(body);
    
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
    const result = await SettingsService.updateDeliverySettings(validatedFields.data);
    
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
      message: 'Delivery settings updated successfully.',
    });
  } catch (error) {
    // Log the error
    console.error('Error updating delivery settings:', error);
    
    // Return error response
    return NextResponse.json(
      {
        success: false,
        message: getErrorMessage(error),
      },
      { status: 500 }
    );
  }
}

