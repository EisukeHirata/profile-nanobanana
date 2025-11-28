import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";
import Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed.`, err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    console.log("Webhook received. Event type:", event.type);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userEmail = session.metadata?.userId;
        const mode = session.mode;

        console.log(`Processing checkout session. Email: ${userEmail}, Mode: ${mode}`);

        if (!userEmail) {
            console.error("No userId in metadata");
            break;
        }

        if (mode === "payment") {
          // Determine credits based on Price ID
          const priceId = session.metadata?.priceId;
          console.log("Payment mode. Price ID:", priceId);
          
          let creditsToAdd = 0;
          
          if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDIT_SMALL) {
            creditsToAdd = 10;
          } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDIT_LARGE) {
            creditsToAdd = 50;
          } else {
            // Fallback logic
            if (session.amount_total === 499) creditsToAdd = 10;
            if (session.amount_total === 1799) creditsToAdd = 50;
          }

          console.log(`Credits to add: ${creditsToAdd}`);

          if (creditsToAdd > 0) {
            await addCredits(userEmail, creditsToAdd);
            console.log("Credits added successfully");
          }
        } else if (mode === "subscription") {
          // New subscription
          const subscriptionId = session.subscription as string;
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0].price.id;
          
          console.log("Subscription mode. Price ID:", priceId);

          // Upsert profile with subscription details
          // We use upsert to handle cases where profile might not exist yet
          const { data: existingProfile } = await supabaseAdmin
            .from("profiles")
            .select("*")
            .eq("email", userEmail)
            .single();

          await supabaseAdmin.from("profiles").upsert({
            email: userEmail, // Required for upsert
            credits: existingProfile?.credits ?? 55, // Default to 50+5 if new, or keep existing
            subscription_status: subscription.status,
            subscription_tier: getTierName(priceId),
            stripe_customer_id: session.customer as string,
            created_at: existingProfile?.created_at // Keep original creation date if exists
          }, { onConflict: 'email' });
          
          const credits = getCreditsForPrice(priceId);
          console.log(`Subscription credits to add: ${credits}`);
          
          await addCredits(userEmail, credits);
          console.log("Subscription credits added successfully");
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        
        console.log("Invoice payment succeeded. Customer ID:", customerId);

        // Find user by customer ID
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("email")
          .eq("stripe_customer_id", customerId)
          .single();

        if (profile?.email && invoice.billing_reason === "subscription_cycle") {
          // Renew credits for the new month
          const lineItem = invoice.lines.data[0] as any;
          const priceId = lineItem?.price?.id;
          
          console.log("Subscription renewal. Price ID:", priceId);

          if (priceId) {
            const credits = getCreditsForPrice(priceId);
            console.log(`Renewal credits to add: ${credits}`);
            await addCredits(profile.email, credits);
          }
        }
        break;
      }
    }
  } catch (error) {
    console.error("Webhook handler failed:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

function getCreditsForPrice(priceId: string): number {
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_SUB_BASIC) return 40;
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_SUB_PRO) return 90;
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_SUB_PREMIUM) return 240;
  return 0;
}

function getTierName(priceId: string): string {
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_SUB_BASIC) return "basic";
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_SUB_PRO) return "pro";
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_SUB_PREMIUM) return "premium";
  return "free";
}

async function addCredits(email: string, amount: number) {
  // Fetch current profile to get existing data
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("email", email)
    .single();

  const currentCredits = profile?.credits || 0;
  const newCredits = currentCredits + amount;

  // Upsert to ensure we don't fail if profile is missing, 
  // but also preserve other fields if they exist.
  await supabaseAdmin
    .from("profiles")
    .upsert({ 
        email: email,
        credits: newCredits,
        stripe_customer_id: profile?.stripe_customer_id,
        subscription_tier: profile?.subscription_tier,
        subscription_status: profile?.subscription_status,
        created_at: profile?.created_at
    }, { onConflict: 'email' });
}
