// src/app/api/admin/crm/lead/[leadId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Lead, StatusUpdateResponse } from '@/app/admin/crm/actions'; // Assuming Lead and StatusUpdateResponse are exported there
import { doc, getDoc, updateDoc, FieldValue } from 'firebase-admin/firestore'; // Added FieldValue

interface RouteParams {
  params: {
    leadId: string;
  };
}

// Handler for GET requests to fetch a lead (from previous step, unchanged by this operation)
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { leadId } = params;
  const sourceCollectionParam = request.nextUrl.searchParams.get('sourceCollection');

  if (!leadId) {
    return NextResponse.json({ message: "Lead ID is required" }, { status: 400 });
  }
  if (!sourceCollectionParam || !['contactSubmissions', 'customOrderInquiries'].includes(sourceCollectionParam)) {
    return NextResponse.json({ message: "Valid sourceCollection ('contactSubmissions' or 'customOrderInquiries') is required" }, { status: 400 });
  }
  const sourceCollection = sourceCollectionParam as 'contactSubmissions' | 'customOrderInquiries';

  try {
    console.log(`API GET: Fetching lead ${leadId} from ${sourceCollection}`);
    const docRef = doc(adminDb, sourceCollection, leadId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({ message: "Lead not found" }, { status: 404 });
    }

    const data = docSnap.data();
    if (!data) {
        return NextResponse.json({ message: "Lead data is undefined after existence check" }, { status: 500 });
    }

    let leadResult: Lead;
    const submittedAtTimestamp = data.submittedAt;
    let createdAtISO = new Date().toISOString();

    if (submittedAtTimestamp) {
        if (typeof submittedAtTimestamp.toDate === 'function') {
            createdAtISO = submittedAtTimestamp.toDate().toISOString();
        } else if (typeof submittedAtTimestamp === 'string' || typeof submittedAtTimestamp === 'number') {
            try {
                const date = new Date(submittedAtTimestamp);
                if (!isNaN(date.getTime())) {
                    createdAtISO = date.toISOString();
                } else {
                    console.warn(`Invalid date string for submittedAt for lead ${leadId}: ${submittedAtTimestamp}`);
                }
            } catch (e) {
                console.warn(`Error parsing date string for submittedAt for lead ${leadId}: ${submittedAtTimestamp}`, e);
            }
        } else {
            console.warn(`Unknown type for submittedAt for lead ${leadId}: ${typeof submittedAtTimestamp}`);
        }
    }

    if (sourceCollection === 'contactSubmissions') {
      leadResult = {
        id: docSnap.id,
        name: data.name || 'Unknown',
        email: data.email || 'No email',
        source: 'Contact Form',
        status: data.status || 'New',
        createdAt: createdAtISO,
        notes: data.message || undefined,
      };
    } else { // 'customOrderInquiries'
      leadResult = {
        id: docSnap.id,
        name: data.fullName || 'Unknown',
        email: data.email || 'No email',
        source: 'Custom Order',
        status: data.status || 'New',
        createdAt: createdAtISO,
        notes: data.description || undefined,
      };
    }

    return NextResponse.json(leadResult, { status: 200 });

  } catch (error) {
    console.error(`API GET Error for lead ${leadId} in ${sourceCollection}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: "Error fetching lead", error: errorMessage }, { status: 500 });
  }
}

// Handler for PUT requests to update a lead
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { leadId } = params;
  const sourceCollectionParam = request.nextUrl.searchParams.get('sourceCollection');

  if (!leadId) {
    return NextResponse.json({ message: "Lead ID is required" }, { status: 400 });
  }
  if (!sourceCollectionParam || !['contactSubmissions', 'customOrderInquiries'].includes(sourceCollectionParam)) {
    return NextResponse.json({ message: "Valid sourceCollection ('contactSubmissions' or 'customOrderInquiries') is required" }, { status: 400 });
  }
  const sourceCollection = sourceCollectionParam as 'contactSubmissions' | 'customOrderInquiries';

  try {
    const updateDataFromRequest: Partial<Lead> = await request.json();

    if (typeof updateDataFromRequest !== 'object' || updateDataFromRequest === null || Object.keys(updateDataFromRequest).length === 0) {
        return NextResponse.json({ message: "Request body must be a non-empty JSON object with update data." }, { status: 400 });
    }

    const updateFields: Record<string, any> = {
      lastUpdated: FieldValue.serverTimestamp() // Using Firestore server timestamp
    };

    if (sourceCollection === 'contactSubmissions') {
      if (updateDataFromRequest.name !== undefined) updateFields.name = updateDataFromRequest.name;
      if (updateDataFromRequest.email !== undefined) updateFields.email = updateDataFromRequest.email;
      if (updateDataFromRequest.status !== undefined) updateFields.status = updateDataFromRequest.status;
      if (updateDataFromRequest.notes !== undefined) updateFields.message = updateDataFromRequest.notes;
    } else { // 'customOrderInquiries'
      if (updateDataFromRequest.name !== undefined) updateFields.fullName = updateDataFromRequest.name;
      if (updateDataFromRequest.email !== undefined) updateFields.email = updateDataFromRequest.email;
      if (updateDataFromRequest.status !== undefined) updateFields.status = updateDataFromRequest.status;
      if (updateDataFromRequest.notes !== undefined) updateFields.description = updateDataFromRequest.notes;
    }

    // Check if any actual data fields were mapped for update
    // (Object.keys(updateFields).length will be at least 1 due to lastUpdated)
    // This check ensures we don't just update 'lastUpdated' if no other valid fields were sent.
    const nonTimestampFields = Object.keys(updateFields).filter(k => k !== 'lastUpdated');
    if (nonTimestampFields.length === 0) {
        // If the only field is lastUpdated, but the original request also didn't try to set lastUpdated explicitly
        // and no other fields were valid from updateDataFromRequest.
        // This condition is a bit tricky: if 'lastUpdated' was the *only* field in updateDataFromRequest, it would be caught here.
        // More accurately, if updateDataFromRequest had fields, but none were valid for mapping to updateFields.
        let hasMappableField = false;
        for (const key in updateDataFromRequest) {
            if (key === 'name' || key === 'email' || key === 'status' || key === 'notes') {
                hasMappableField = true;
                break;
            }
        }
        if (!hasMappableField) {
             return NextResponse.json({ message: "No valid fields provided for update in the request." }, { status: 400 });
        }
    }

    const docRef = doc(adminDb, sourceCollection, leadId);
    // Check if document exists before updating
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
        return NextResponse.json({ message: "Lead not found, cannot update." }, { status: 404 });
    }

    await updateDoc(docRef, updateFields);

    return NextResponse.json({ success: true, message: "Lead updated successfully." } as StatusUpdateResponse, { status: 200 });

  } catch (error) {
    console.error(`API PUT Error for lead ${leadId} in ${sourceCollection}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (error instanceof SyntaxError) {
        return NextResponse.json({ success: false, message: "Invalid JSON in request body", error: errorMessage } as StatusUpdateResponse, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Error updating lead", error: errorMessage } as StatusUpdateResponse, { status: 500 });
  }
}
