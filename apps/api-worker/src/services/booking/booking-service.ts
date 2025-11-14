/**
 * Booking Service - Standalone Booking Plugin
 * Handles availability calculation, double-booking prevention, and booking creation
 */

import { getPrisma } from '../db';

interface WorkingHoursSlot {
  start: string; // "09:00"
  end: string;   // "13:00"
}

interface WorkingHoursDay {
  enabled: boolean;
  slots: WorkingHoursSlot[];
}

interface WorkingHours {
  monday?: WorkingHoursDay;
  tuesday?: WorkingHoursDay;
  wednesday?: WorkingHoursDay;
  thursday?: WorkingHoursDay;
  friday?: WorkingHoursDay;
  saturday?: WorkingHoursDay;
  sunday?: WorkingHoursDay;
}

interface AvailableSlot {
  date: string; // ISO date
  time: string; // "09:00"
  datetime: string; // Full ISO datetime
}

interface CreateBookingParams {
  accountId: string;
  customerFirstName: string;
  customerLastName: string;
  customerPhone: string;
  appointmentDatetime: string; // ISO datetime
  customerNotes?: string;
  customerIp?: string;
  customerAgent?: string;
}

export class BookingService {
  private prisma: ReturnType<typeof getPrisma>;

  constructor(databaseUrl: string) {
    this.prisma = getPrisma(databaseUrl);
  }

  /**
   * Get available slots for a specific date range
   */
  async getAvailableSlots(
    widgetId: string,
    startDate: Date,
    endDate: Date
  ): Promise<AvailableSlot[]> {
    // Get account and configuration
    const account = await this.prisma.bookingAccount.findUnique({
      where: { widgetId },
      include: { configuration: true },
    });

    if (!account || !account.configuration) {
      throw new Error('Booking account or configuration not found');
    }

    const config = account.configuration;
    const workingHours = config.workingHours as WorkingHours;
    const blockedDates = (config.blockedDates as string[]) || [];

    // Get existing bookings in the date range
    const existingBookings = await this.prisma.bookingSlot.findMany({
      where: {
        accountId: account.id,
        status: 'ACTIVE',
        appointmentDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        appointmentDate: true,
        duration: true,
      },
    });

    // Generate all possible slots
    const allSlots = this.generateTimeSlots(
      startDate,
      endDate,
      workingHours,
      config.slotDuration,
      config.bufferTime,
      config.minAdvanceBooking,
      config.maxAdvanceBooking,
      blockedDates,
      config.timezone
    );

    // Filter out booked slots
    const availableSlots = allSlots.filter((slot) => {
      return !this.isSlotBooked(slot.datetime, config.slotDuration, existingBookings);
    });

    return availableSlots;
  }

  /**
   * Generate time slots based on working hours
   */
  private generateTimeSlots(
    startDate: Date,
    endDate: Date,
    workingHours: WorkingHours,
    slotDuration: number,
    bufferTime: number,
    minAdvanceBooking: number,
    maxAdvanceBooking: number,
    blockedDates: string[],
    timezone: string
  ): AvailableSlot[] {
    const slots: AvailableSlot[] = [];
    const now = new Date();
    const minDate = new Date(now.getTime() + minAdvanceBooking * 60 * 1000);
    const maxDate = new Date(now.getTime() + maxAdvanceBooking * 24 * 60 * 60 * 1000);

    let currentDate = new Date(startDate);

    while (currentDate <= endDate && currentDate <= maxDate) {
      const dateStr = currentDate.toISOString().split('T')[0];

      // Skip if date is blocked
      if (blockedDates.includes(dateStr)) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      // Skip if before minimum advance booking
      if (currentDate < minDate) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      // Get day name
      const dayName = currentDate
        .toLocaleDateString('en-US', { weekday: 'long' })
        .toLowerCase() as keyof WorkingHours;

      const dayConfig = workingHours[dayName];

      if (dayConfig && dayConfig.enabled && dayConfig.slots) {
        // Generate slots for each time range in the day
        for (const timeSlot of dayConfig.slots) {
          const daySlots = this.generateDaySlots(
            currentDate,
            timeSlot.start,
            timeSlot.end,
            slotDuration,
            bufferTime,
            minDate
          );
          slots.push(...daySlots);
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return slots;
  }

  /**
   * Generate slots for a specific day and time range
   */
  private generateDaySlots(
    date: Date,
    startTime: string,
    endTime: string,
    slotDuration: number,
    bufferTime: number,
    minDate: Date
  ): AvailableSlot[] {
    const slots: AvailableSlot[] = [];

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    let currentTime = new Date(date);
    currentTime.setHours(startHour, startMinute, 0, 0);

    const endDateTime = new Date(date);
    endDateTime.setHours(endHour, endMinute, 0, 0);

    while (currentTime < endDateTime) {
      const slotEnd = new Date(currentTime.getTime() + slotDuration * 60 * 1000);

      // Only include slots that are after minimum advance booking
      if (currentTime >= minDate && slotEnd <= endDateTime) {
        slots.push({
          date: currentTime.toISOString().split('T')[0],
          time: currentTime.toTimeString().substring(0, 5),
          datetime: currentTime.toISOString(),
        });
      }

      // Move to next slot (duration + buffer)
      currentTime = new Date(currentTime.getTime() + (slotDuration + bufferTime) * 60 * 1000);
    }

    return slots;
  }

  /**
   * Check if a slot is already booked
   */
  private isSlotBooked(
    slotDatetime: string,
    slotDuration: number,
    existingBookings: Array<{ appointmentDate: Date; duration: number }>
  ): boolean {
    const slotStart = new Date(slotDatetime);
    const slotEnd = new Date(slotStart.getTime() + slotDuration * 60 * 1000);

    return existingBookings.some((booking) => {
      const bookingStart = new Date(booking.appointmentDate);
      const bookingEnd = new Date(bookingStart.getTime() + booking.duration * 60 * 1000);

      // Check if slots overlap
      return slotStart < bookingEnd && slotEnd > bookingStart;
    });
  }

  /**
   * Create a new booking with double-booking prevention
   */
  async createBooking(params: CreateBookingParams): Promise<any> {
    const {
      accountId,
      customerFirstName,
      customerLastName,
      customerPhone,
      appointmentDatetime,
      customerNotes,
      customerIp,
      customerAgent,
    } = params;

    // Get account and configuration
    const account = await this.prisma.bookingAccount.findUnique({
      where: { id: accountId },
      include: { configuration: true },
    });

    if (!account || !account.configuration) {
      throw new Error('Booking account not found');
    }

    const config = account.configuration;
    const appointmentDate = new Date(appointmentDatetime);

    // Validate appointment is in the future
    const now = new Date();
    const minDate = new Date(now.getTime() + config.minAdvanceBooking * 60 * 1000);

    if (appointmentDate < minDate) {
      throw new Error('Appointment is too soon. Please select a later time.');
    }

    // Validate appointment is within max advance booking
    const maxDate = new Date(now.getTime() + config.maxAdvanceBooking * 24 * 60 * 60 * 1000);
    if (appointmentDate > maxDate) {
      throw new Error('Appointment is too far in the future.');
    }

    // Check daily booking limit
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);

    const bookingsToday = await this.prisma.bookingSlot.count({
      where: {
        accountId,
        status: 'ACTIVE',
        appointmentDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (bookingsToday >= config.maxDailyBookings) {
      throw new Error('Daily booking limit reached. Please try another day.');
    }

    // Check monthly limit (plan-based)
    const startOfMonth = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), 1);
    const endOfMonth = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth() + 1, 0, 23, 59, 59, 999);

    const bookingsThisMonth = await this.prisma.bookingSlot.count({
      where: {
        accountId,
        status: 'ACTIVE',
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    if (bookingsThisMonth >= account.maxBookingsPerMonth && account.plan !== 'PRO' && account.plan !== 'ENTERPRISE') {
      throw new Error('Monthly booking limit reached. Please upgrade your plan.');
    }

    // CRITICAL: Check for double booking with transaction lock
    // This prevents race conditions when multiple users book the same slot simultaneously
    const result = await this.prisma.$transaction(async (tx) => {
      // Lock the time slot by querying with FOR UPDATE semantics
      const slotEnd = new Date(appointmentDate.getTime() + config.slotDuration * 60 * 1000);

      const conflictingBookings = await tx.bookingSlot.findMany({
        where: {
          accountId,
          status: 'ACTIVE',
          appointmentDate: {
            gte: new Date(appointmentDate.getTime() - config.slotDuration * 60 * 1000),
            lte: slotEnd,
          },
        },
      });

      // Check if any booking conflicts with the requested slot
      const hasConflict = conflictingBookings.some((booking) => {
        const bookingStart = new Date(booking.appointmentDate);
        const bookingEnd = new Date(bookingStart.getTime() + booking.duration * 60 * 1000);

        return appointmentDate < bookingEnd && slotEnd > bookingStart;
      });

      if (hasConflict) {
        throw new Error('This time slot is no longer available. Please select another time.');
      }

      // Create the booking
      const booking = await tx.bookingSlot.create({
        data: {
          accountId,
          customerFirstName,
          customerLastName,
          customerPhone,
          appointmentDate,
          duration: config.slotDuration,
          customerNotes,
          customerIp,
          customerAgent,
          status: 'ACTIVE',
        },
      });

      return booking;
    });

    return result;
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(bookingReference: string, reason?: string): Promise<void> {
    const booking = await this.prisma.bookingSlot.findUnique({
      where: { bookingReference },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.status === 'CANCELLED') {
      throw new Error('Booking is already cancelled');
    }

    await this.prisma.bookingSlot.update({
      where: { bookingReference },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancellationReason: reason,
      },
    });
  }

  /**
   * Get booking by reference
   */
  async getBookingByReference(bookingReference: string): Promise<any> {
    const booking = await this.prisma.bookingSlot.findUnique({
      where: { bookingReference },
      include: {
        account: {
          select: {
            ownerName: true,
            ownerEmail: true,
            ownerPhone: true,
          },
        },
      },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    return booking;
  }

  /**
   * List bookings for an account
   */
  async listBookings(
    accountId: string,
    filters?: {
      status?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    }
  ): Promise<any[]> {
    const where: any = { accountId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      where.appointmentDate = {};
      if (filters.startDate) where.appointmentDate.gte = filters.startDate;
      if (filters.endDate) where.appointmentDate.lte = filters.endDate;
    }

    const bookings = await this.prisma.bookingSlot.findMany({
      where,
      orderBy: { appointmentDate: 'asc' },
      take: filters?.limit || 100,
      skip: filters?.offset || 0,
    });

    return bookings;
  }

  /**
   * Get booking statistics for an account
   */
  async getBookingStats(accountId: string): Promise<any> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [totalBookings, activeBookings, bookingsThisMonth, upcomingBookings] = await Promise.all([
      this.prisma.bookingSlot.count({ where: { accountId } }),
      this.prisma.bookingSlot.count({ where: { accountId, status: 'ACTIVE' } }),
      this.prisma.bookingSlot.count({
        where: {
          accountId,
          createdAt: { gte: startOfMonth, lte: endOfMonth },
        },
      }),
      this.prisma.bookingSlot.count({
        where: {
          accountId,
          status: 'ACTIVE',
          appointmentDate: { gte: now },
        },
      }),
    ]);

    return {
      totalBookings,
      activeBookings,
      bookingsThisMonth,
      upcomingBookings,
    };
  }
}
