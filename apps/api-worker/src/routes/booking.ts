/**
 * Booking API Endpoints (Public)
 * For standalone booking widget integration
 */

import { Hono } from 'hono';
import { BookingService } from '../services/booking/booking-service';
import { z } from 'zod';

type Bindings = {
  DATABASE_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Validation schemas
const getAvailabilitySchema = z.object({
  widgetId: z.string(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

const createBookingSchema = z.object({
  widgetId: z.string(),
  customerFirstName: z.string().min(1).max(100),
  customerLastName: z.string().min(1).max(100),
  customerPhone: z.string().min(8).max(20), // Basic phone validation
  appointmentDatetime: z.string().datetime(),
  customerNotes: z.string().max(500).optional(),
});

const cancelBookingSchema = z.object({
  bookingReference: z.string(),
  reason: z.string().max(500).optional(),
});

/**
 * GET /booking/widget/:widgetId/config
 * Get widget configuration (public endpoint)
 */
app.get('/widget/:widgetId/config', async (c) => {
  try {
    const widgetId = c.req.param('widgetId');

    const bookingService = new BookingService(c.env.DATABASE_URL);

    // Get account and configuration (limited public info)
    const { getPrisma } = await import('../db');
    const prisma = getPrisma(c.env.DATABASE_URL);

    const account = await prisma.bookingAccount.findUnique({
      where: { widgetId },
      include: { configuration: true },
    });

    if (!account || !account.configuration) {
      return c.json({ error: 'Widget not found' }, 404);
    }

    const config = account.configuration;

    // Return only public configuration (not sensitive data)
    return c.json({
      widgetId,
      ownerName: account.ownerName,
      config: {
        timezone: config.timezone,
        locale: config.locale,
        slotDuration: config.slotDuration,
        minAdvanceBooking: config.minAdvanceBooking,
        maxAdvanceBooking: config.maxAdvanceBooking,
        widgetTitle: config.widgetTitle,
        widgetSubtitle: config.widgetSubtitle,
        widgetPrimaryColor: config.widgetPrimaryColor,
        widgetFontFamily: config.widgetFontFamily,
        confirmationMessage: config.confirmationMessage,
        termsUrl: config.termsUrl,
        privacyUrl: config.privacyUrl,
      },
    });
  } catch (error) {
    console.error('Get widget config error:', error);
    return c.json({ error: 'Failed to load configuration' }, 500);
  }
});

/**
 * POST /booking/widget/:widgetId/availability
 * Get available time slots (public endpoint)
 */
app.post('/widget/:widgetId/availability', async (c) => {
  try {
    const widgetId = c.req.param('widgetId');
    const body = await c.req.json();

    const validated = getAvailabilitySchema.parse({ widgetId, ...body });

    const startDate = new Date(validated.startDate);
    const endDate = new Date(validated.endDate);

    // Validate date range (max 90 days)
    const daysDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff > 90) {
      return c.json({ error: 'Date range cannot exceed 90 days' }, 400);
    }

    const bookingService = new BookingService(c.env.DATABASE_URL);
    const slots = await bookingService.getAvailableSlots(widgetId, startDate, endDate);

    return c.json({ slots });
  } catch (error) {
    console.error('Get availability error:', error);
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get availability',
      },
      500
    );
  }
});

/**
 * POST /booking/widget/:widgetId/book
 * Create a new booking (public endpoint with rate limiting)
 */
app.post('/widget/:widgetId/book', async (c) => {
  try {
    const widgetId = c.req.param('widgetId');
    const body = await c.req.json();

    const validated = createBookingSchema.parse({ widgetId, ...body });

    // Get client info for rate limiting and spam prevention
    const clientIp = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';
    const userAgent = c.req.header('user-agent') || 'unknown';

    // Rate limiting: Check if same IP has made too many bookings recently
    const { getPrisma } = await import('../db');
    const prisma = getPrisma(c.env.DATABASE_URL);

    const account = await prisma.bookingAccount.findUnique({
      where: { widgetId },
    });

    if (!account) {
      return c.json({ error: 'Widget not found' }, 404);
    }

    // Check rate limit: max 5 bookings per IP per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentBookings = await prisma.bookingSlot.count({
      where: {
        accountId: account.id,
        customerIp: clientIp,
        createdAt: { gte: oneHourAgo },
      },
    });

    if (recentBookings >= 5) {
      return c.json(
        {
          error: 'Too many booking attempts. Please try again later.',
        },
        429
      );
    }

    // Create booking
    const bookingService = new BookingService(c.env.DATABASE_URL);
    const booking = await bookingService.createBooking({
      accountId: account.id,
      customerFirstName: validated.customerFirstName,
      customerLastName: validated.customerLastName,
      customerPhone: validated.customerPhone,
      appointmentDatetime: validated.appointmentDatetime,
      customerNotes: validated.customerNotes,
      customerIp: clientIp,
      customerAgent: userAgent,
    });

    // TODO: Send email notifications (implement later)
    // - Send confirmation email to customer
    // - Send notification email to owner (if enabled)

    return c.json(
      {
        success: true,
        booking: {
          bookingReference: booking.bookingReference,
          customerFirstName: booking.customerFirstName,
          customerLastName: booking.customerLastName,
          appointmentDate: booking.appointmentDate,
          duration: booking.duration,
        },
      },
      201
    );
  } catch (error) {
    console.error('Create booking error:', error);
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create booking',
      },
      error instanceof Error && error.message.includes('no longer available') ? 409 : 500
    );
  }
});

/**
 * GET /booking/reference/:bookingReference
 * Get booking details by reference (public endpoint)
 */
app.get('/reference/:bookingReference', async (c) => {
  try {
    const bookingReference = c.req.param('bookingReference');

    const bookingService = new BookingService(c.env.DATABASE_URL);
    const booking = await bookingService.getBookingByReference(bookingReference);

    // Return limited info (don't expose sensitive owner data)
    return c.json({
      booking: {
        bookingReference: booking.bookingReference,
        customerFirstName: booking.customerFirstName,
        customerLastName: booking.customerLastName,
        customerPhone: booking.customerPhone,
        appointmentDate: booking.appointmentDate,
        duration: booking.duration,
        status: booking.status,
        customerNotes: booking.customerNotes,
        ownerName: booking.account.ownerName,
      },
    });
  } catch (error) {
    console.error('Get booking error:', error);
    return c.json({ error: 'Booking not found' }, 404);
  }
});

/**
 * POST /booking/reference/:bookingReference/cancel
 * Cancel a booking (public endpoint)
 */
app.post('/reference/:bookingReference/cancel', async (c) => {
  try {
    const bookingReference = c.req.param('bookingReference');
    const body = await c.req.json();

    const validated = cancelBookingSchema.parse({ bookingReference, ...body });

    const bookingService = new BookingService(c.env.DATABASE_URL);
    await bookingService.cancelBooking(validated.bookingReference, validated.reason);

    // TODO: Send cancellation email to customer and owner

    return c.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Cancel booking error:', error);
    return c.json(
      {
        error: error instanceof Error ? error.message : 'Failed to cancel booking',
      },
      500
    );
  }
});

// ============================================
// PROTECTED ENDPOINTS (For Dashboard/Owner)
// ============================================

/**
 * GET /booking/account/:accountId/bookings
 * List bookings for an account (protected - requires authentication)
 */
app.get('/account/:accountId/bookings', async (c) => {
  try {
    // TODO: Add authentication middleware
    const accountId = c.req.param('accountId');

    const status = c.req.query('status');
    const startDate = c.req.query('startDate');
    const endDate = c.req.query('endDate');
    const limit = parseInt(c.req.query('limit') || '100');
    const offset = parseInt(c.req.query('offset') || '0');

    const bookingService = new BookingService(c.env.DATABASE_URL);
    const bookings = await bookingService.listBookings(accountId, {
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit,
      offset,
    });

    return c.json({ bookings });
  } catch (error) {
    console.error('List bookings error:', error);
    return c.json({ error: 'Failed to list bookings' }, 500);
  }
});

/**
 * GET /booking/account/:accountId/stats
 * Get booking statistics (protected)
 */
app.get('/account/:accountId/stats', async (c) => {
  try {
    // TODO: Add authentication middleware
    const accountId = c.req.param('accountId');

    const bookingService = new BookingService(c.env.DATABASE_URL);
    const stats = await bookingService.getBookingStats(accountId);

    return c.json({ stats });
  } catch (error) {
    console.error('Get stats error:', error);
    return c.json({ error: 'Failed to get statistics' }, 500);
  }
});

/**
 * PATCH /booking/account/:accountId/configuration
 * Update booking configuration (protected)
 */
app.patch('/account/:accountId/configuration', async (c) => {
  try {
    // TODO: Add authentication middleware
    const accountId = c.req.param('accountId');
    const body = await c.req.json();

    const { getPrisma } = await import('../db');
    const prisma = getPrisma(c.env.DATABASE_URL);

    const config = await prisma.bookingConfiguration.update({
      where: { accountId },
      data: {
        ...body,
        updatedAt: new Date(),
      },
    });

    return c.json({ config });
  } catch (error) {
    console.error('Update configuration error:', error);
    return c.json({ error: 'Failed to update configuration' }, 500);
  }
});

/**
 * POST /booking/account/:accountId/bookings/:bookingId/notes
 * Add owner notes to a booking (protected)
 */
app.post('/account/:accountId/bookings/:bookingId/notes', async (c) => {
  try {
    // TODO: Add authentication middleware
    const accountId = c.req.param('accountId');
    const bookingId = c.req.param('bookingId');
    const body = await c.req.json();

    const { getPrisma } = await import('../db');
    const prisma = getPrisma(c.env.DATABASE_URL);

    const booking = await prisma.bookingSlot.update({
      where: {
        id: bookingId,
        accountId, // Ensure booking belongs to this account
      },
      data: {
        ownerNotes: body.notes,
      },
    });

    return c.json({ booking });
  } catch (error) {
    console.error('Add notes error:', error);
    return c.json({ error: 'Failed to add notes' }, 500);
  }
});

export function registerBookingRoutes(mainApp: Hono<{ Bindings: Bindings }>) {
  mainApp.route('/booking', app);
}

export default app;
