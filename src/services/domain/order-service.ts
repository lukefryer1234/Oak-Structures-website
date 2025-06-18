// src/services/domain/order-service.ts
import { z } from 'zod';
import FirebaseServices from '../firebase'; // Adjusted path based on previous product-service
import { CustomError, handleError } from '@/lib/error-utils'; // Assuming error utils path

export const OrderStatusSchema = z.enum([
  'Pending',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
  'Refunded', // Added another common status
]);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

// Basic Order Item Schema (can be expanded)
export const OrderItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  quantity: z.number().min(1),
  priceAtPurchase: z.number(), // Price per unit at the time of purchase
  configuration: z.record(z.any()).optional(), // For configured products
});
export type OrderItem = z.infer<typeof OrderItemSchema>;

export const OrderSchema = z.object({
  id: z.string(), // Firestore document ID
  userId: z.string(), // ID of the user who placed the order
  customerName: z.string().optional(), // Denormalized for quick display
  customerEmail: z.string().email().optional(), // Denormalized
  items: z.array(OrderItemSchema),
  totalAmount: z.number(),
  status: OrderStatusSchema.default('Pending'),
  orderDate: z.string().datetime(), // ISO date string
  shippingAddress: z.record(z.any()).optional(), // Can be a more specific schema
  billingAddress: z.record(z.any()).optional(), // Can be a more specific schema
  paymentMethod: z.string().optional(),
  paymentStatus: z.string().optional(), // e.g., 'Paid', 'Unpaid', 'Refunded'
  trackingNumber: z.string().optional(),
  notes: z.string().optional(), // Admin notes or customer notes
  updatedAt: z.string().datetime().optional(),
});
export type Order = z.infer<typeof OrderSchema>;

// Params for getOrders
export const GetOrdersParamsSchema = z.object({
  status: OrderStatusSchema.optional(),
  userId: z.string().optional(),
  limit: z.number().int().positive().optional(),
  // For Firestore pagination, startAfter typically expects a DocumentSnapshot or specific field values from the last doc.
  // Using a string ID here implies FirestoreService's getDocuments method can handle it or this needs adjustment.
  startAfter: z.custom<any>().optional(), // Placeholder for actual pagination cursor type
  searchQuery: z.string().optional(), // For searching by order ID, customer name/email
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});
export type GetOrdersParams = z.infer<typeof GetOrdersParamsSchema>;

// Schemas for creating an order
export const CreateOrderItemSchema = OrderItemSchema.omit({}); // Assuming OrderItemSchema is sufficient as is
export type CreateOrderItem = z.infer<typeof CreateOrderItemSchema>;

export const CreateOrderAddressSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  town: z.string().min(1),
  postcode: z.string().min(5, { message: "Valid UK postcode is required." }).max(8),
  phone: z.string().optional(),
});
export type CreateOrderAddress = z.infer<typeof CreateOrderAddressSchema>;

export const CreateOrderDataSchema = z.object({
  userId: z.string().optional(), // Optional for guest checkouts
  billingAddress: CreateOrderAddressSchema,
  shippingAddress: CreateOrderAddressSchema.optional(),
  useBillingAsShipping: z.boolean().optional().default(false),
  items: z.array(CreateOrderItemSchema).min(1),
  subtotal: z.number(),
  shippingCost: z.number(),
  vat: z.number(),
  totalAmount: z.number(), // Renamed from 'total' to match OrderSchema
  paymentMethod: z.string(), // E.g., "paypal", "stripe"
  paymentStatus: z.string().default('Pending'), // Initial payment status
  orderNotes: z.string().optional(),
});
export type CreateOrderData = z.infer<typeof CreateOrderDataSchema>;

class OrderService {
  private firestoreService: FirebaseServices['firestore']; // Use the type from FirebaseServices
  private readonly collectionName = "orders";

  constructor() {
    // Assuming FirebaseServices is an object with a firestore instance
    this.firestoreService = FirebaseServices.firestore;
  }

  async getOrders(params: GetOrdersParams = {}): Promise<{ orders: Order[]; lastDocId: string | null }> {
    try {
      const validParams = GetOrdersParamsSchema.parse(params);
      const constraints: FirebaseServices['firestore']['constraintsType'] = []; // Use correct constraint type

      if (validParams.status) {
        constraints.push(this.firestoreService.constraints.where('status', '==', validParams.status));
      }
      if (validParams.userId) {
        constraints.push(this.firestoreService.constraints.where('userId', '==', validParams.userId));
      }
      if (validParams.dateFrom) {
        constraints.push(this.firestoreService.constraints.where('orderDate', '>=', validParams.dateFrom));
      }
      if (validParams.dateTo) {
        constraints.push(this.firestoreService.constraints.where('orderDate', '<=', validParams.dateTo));
      }

      constraints.push(this.firestoreService.constraints.orderBy('orderDate', 'desc')); // Default sort

      const { documents: orderDocs, lastDoc: lastFirestoreDoc } = await this.firestoreService.getDocuments(
        this.collectionName,
        constraints,
        validParams.limit || 20,
        validParams.startAfter // Pass the cursor directly
      );

      // Validate and transform documents
      const orders = orderDocs.map(docData => {
        const withId = { id: docData.id, ...docData };
        const parseResult = OrderSchema.safeParse(withId);
        if (!parseResult.success) {
          console.warn(`Failed to parse order (ID: ${docData.id}):`, parseResult.error.flatten());
          return null;
        }
        return parseResult.data;
      }).filter(Boolean) as Order[];

      // Basic client-side filtering if searchQuery is for customer name/email for this example
      let filteredOrders = orders;
      if (validParams.searchQuery) {
        const query = validParams.searchQuery.toLowerCase();
        filteredOrders = orders.filter(order =>
          order.id.toLowerCase().includes(query) ||
          order.customerName?.toLowerCase().includes(query) ||
          order.customerEmail?.toLowerCase().includes(query)
        );
      }

      return { orders: filteredOrders, lastDocId: lastFirestoreDoc ? lastFirestoreDoc.id : null };
    } catch (error) {
      throw handleError(error, "Failed to retrieve orders", "OrderService.getOrders");
    }
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Partial<Order>> {
    try {
      if (!orderId) throw new CustomError("Order ID is required.", "INVALID_ARGUMENT");
      OrderStatusSchema.parse(status); // Validate status

      const updateData = {
        status: status,
        updatedAt: new Date().toISOString(),
      };

      await this.firestoreService.updateDocument(
        this.collectionName,
        orderId,
        updateData
      );

      // Return the fields that were updated, plus ID for reference
      return { id: orderId, status: status, updatedAt: updateData.updatedAt };
    } catch (error) {
      throw handleError(error, "Failed to update order status", "OrderService.updateOrderStatus");
    }
  }

  async createOrder(orderInput: CreateOrderData): Promise<Order> {
    try {
      // Validate input data against the schema
      const validatedOrderData = CreateOrderDataSchema.parse(orderInput);

      const { useBillingAsShipping, ...restOfValidatedData } = validatedOrderData;

      const newOrderPayload = {
        ...restOfValidatedData,
        orderDate: new Date().toISOString(),
        status: OrderStatusSchema.parse('Pending'), // Default initial status
        items: validatedOrderData.items.map(item => ({...item})), // Ensure items are plain objects
        shippingAddress: useBillingAsShipping
                         ? validatedOrderData.billingAddress
                         : validatedOrderData.shippingAddress || validatedOrderData.billingAddress,
        updatedAt: new Date().toISOString(),
        // Ensure customerName and customerEmail are added based on billingAddress
        customerName: `${validatedOrderData.billingAddress.firstName} ${validatedOrderData.billingAddress.lastName}`,
        customerEmail: validatedOrderData.billingAddress.email,
      };

      const docId = await this.firestoreService.addDocument(
        this.collectionName,
        newOrderPayload // This payload should align with fields in OrderSchema (excluding id)
      );

      // Construct the full Order object to return, matching OrderSchema
      const finalOrderData = {
        id: docId,
        ...newOrderPayload,
        // Ensure all fields expected by OrderSchema are present and correctly typed
        // If newOrderPayload already matches OrderSchema (minus id), this is simpler
        // For example, if customerName/Email were part of newOrderPayload directly.
      };

      // Validate the final structure before returning, to be absolutely sure
      const finalOrder = OrderSchema.parse(finalOrderData);

      return finalOrder;

    } catch (error) {
      // Log the validation error specifically if it's a ZodError
      if (error instanceof z.ZodError) {
        console.error("Order data validation failed:", error.flatten().fieldErrors);
        throw new CustomError("Invalid order data provided.", "INVALID_ARGUMENT", error.flatten().fieldErrors);
      }
      throw handleError(error, "Failed to create order", "OrderService.createOrder");
    }
  }

  async getRecentOrdersCount(daysAgo: number = 7): Promise<number> {
    try {
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - daysAgo);

      const params: GetOrdersParams = {
        dateFrom: dateFrom.toISOString(),
      };
      // We are only interested in the count, so limit to 0 to fetch no documents if possible,
      // or rely on FirestoreService.getCount if available.
      // For now, getOrders will fetch matching documents and we'll take the length.
      // A more optimized version might use a count query.
      const { orders } = await this.getOrders({ ...params, limit: undefined }); // Pass limit as undefined to use default or no limit if getOrders supports it for counts
      return orders.length;

      // Ideal scenario with a getCount method in FirestoreService:
      // const constraints: FirebaseServices['firestore']['constraintsType'] = [
      //   this.firestoreService.constraints.where('orderDate', '>=', dateFrom.toISOString())
      // ];
      // return await this.firestoreService.getCount(this.collectionName, constraints);

    } catch (error) {
      throw handleError(error, "Failed to get recent orders count", "OrderService.getRecentOrdersCount");
    }
  }
  // TODO: Add getOrder(orderId) etc.
}

export const orderService = new OrderService();
