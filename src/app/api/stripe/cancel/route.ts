import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's Stripe Customer ID
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("email", session.user.email)
      .single();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
    }

    // Find active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
    }

    const subscriptionId = subscriptions.data[0].id;

    // Cancel at period end
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    return NextResponse.json({ 
      success: true, 
      subscription: updatedSubscription 
    });

  } catch (error: any) {
    console.error("Error canceling subscription:", error);
    return NextResponse.json(
      { error: error.message || "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
