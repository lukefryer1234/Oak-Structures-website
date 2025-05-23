// src/app/api/customorderform/route.ts
// This API route is being simplified as the frontend form is removed for initial launch.
// It will now just return a basic success to avoid errors if inadvertently called.
// Proper form handling and data saving to Firestore will be re-implemented later.

// import { db } from '@/lib/firebase';
// import { addDoc, collection } from 'firebase/firestore';
// import { z } from 'zod';

// const customOrderSchemaServer = z.object({
//   fullName: z.string().min(1, "Full name is required"),
//   email: z.string().email("Invalid email address").min(1, "Email is required"),
//   description: z.string().min(10, "Please provide a detailed description (min 10 characters)"),
//   phone: z.string().optional(),
//   postcode: z.string().optional(),
//   companyName: z.string().optional(),
//   productType: z.enum(["Garage", "Gazebo", "Porch", "Beams", "Flooring", "Other", ""]).optional(),
//   contactMethod: z.enum(["Email", "Phone", ""]).optional(),
//   budget: z.string().optional(),
//   timescale: z.string().optional(),
// });

export async function POST(_request: Request) { // request parameter is unused
  try {
    // const json = await request.json();
    // const validatedFields = customOrderSchemaServer.safeParse(json);

    // if (!validatedFields.success) {
    //   console.log("Validation failed for custom order (API):", validatedFields.error);
    //   return new Response(JSON.stringify({ message: 'Validation failed. Please check your input.' }), {
    //     status: 400,
    //     headers: { 'Content-Type': 'application/json' },
    //   });
    // }

    // await addDoc(collection(db, 'customOrderInquiries'), {
    //   ...validatedFields.data,
    //   submittedAt: new Date(),
    // });

    // For simplified version, just acknowledge the attempt
    console.log("Simplified custom order API endpoint called (currently no-op).");
    return new Response(JSON.stringify({ message: 'Inquiry endpoint reached (simplified). Please contact us directly.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in simplified custom order API endpoint:', error);
    let errorMessage = 'An error occurred.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return new Response(JSON.stringify({ message: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
