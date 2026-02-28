import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAuth();

    const { bookingId, rating, comment } = await req.json();

    const booking = await db.booking.findFirst({
      where: { id: bookingId, clientId: user.id },
      select: { chefId: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const review = await db.review.create({
      data: {
        bookingId,
        clientId: user.id,
        chefId: booking.chefId,
        rating,
        comment,
      },
    });

    // Update chef's total events count
    await db.chef.update({
      where: { id: booking.chefId },
      data: { totalEvents: { increment: 1 } },
    });

    return NextResponse.json(review);
  } catch (error: any) {
    if (error?.digest?.includes("NEXT_REDIRECT")) throw error;
    return NextResponse.json(
      { error: error.message || "Failed to submit review" },
      { status: 500 },
    );
  }
}
