import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";
import Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  console.log("=== WEBHOOK RECEIVED ===");
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature") as string;

  console.log("Webhook signature present:", !!signature);
  console.log("Webhook secret configured:", !!webhookSecret);

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log("Webhook signature verified successfully");
  } catch (err: any) {
    console.error(`Webhook signature verification failed.`, err.message);
    console.error("Error details:", {
      hasSignature: !!signature,
      hasSecret: !!webhookSecret,
      secretLength: webhookSecret?.length,
      error: err.message,
    });
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    console.log("Webhook received. Event type:", event.type);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userEmail = session.metadata?.userId;
        const mode = session.mode;
        const paymentStatus = session.payment_status;

        console.log(
          `Processing checkout session. Email: ${userEmail}, Mode: ${mode}, Payment Status: ${paymentStatus}`
        );

        if (!userEmail) {
          console.error("No userId in metadata");
          break;
        }

        if (mode === "payment") {
          // Only process if payment is completed
          if (paymentStatus !== "paid") {
            console.log(`Payment not completed yet. Status: ${paymentStatus}`);
            break;
          }

          // Determine credits based on Price ID
          // Try metadata first, then line_items
          let priceId = session.metadata?.priceId;

          if (!priceId && session.line_items) {
            const lineItems = await stripe.checkout.sessions.listLineItems(
              session.id,
              { limit: 1 }
            );
            if (lineItems.data.length > 0) {
              priceId = lineItems.data[0].price?.id;
            }
          }

          console.log(
            "Payment mode. Price ID from metadata:",
            session.metadata?.priceId
          );
          console.log("Payment mode. Price ID resolved:", priceId);
          console.log("Environment variables:", {
            SMALL: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDIT_SMALL,
            LARGE: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDIT_LARGE,
            XLARGE: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDIT_XLARGE,
          });

          let creditsToAdd = 0;

          if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDIT_SMALL) {
            creditsToAdd = 10;
            console.log("Matched SMALL pack (10 credits)");
          } else if (
            priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDIT_LARGE
          ) {
            creditsToAdd = 30;
            console.log("Matched LARGE pack (30 credits)");
          } else if (
            priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDIT_XLARGE
          ) {
            creditsToAdd = 100;
            console.log("Matched XLARGE pack (100 credits)");
          } else {
            // Fallback logic (amounts in cents)
            console.log(
              `Price ID not matched. Trying fallback. Amount: ${session.amount_total}`
            );
            if (session.amount_total === 449) {
              creditsToAdd = 10;
              console.log("Fallback: Matched 10 credits by amount");
            } else if (session.amount_total === 1199) {
              creditsToAdd = 30;
              console.log("Fallback: Matched 30 credits by amount");
            } else if (session.amount_total === 2999) {
              creditsToAdd = 100;
              console.log("Fallback: Matched 100 credits by amount");
            } else {
              console.error(
                `Could not determine credits. Price ID: ${priceId}, Amount: ${session.amount_total}`
              );
            }
          }

          console.log(`Credits to add: ${creditsToAdd}`);

          if (creditsToAdd > 0) {
            await addCredits(userEmail, creditsToAdd);
            console.log(
              `Credits added successfully. User: ${userEmail}, Amount: ${creditsToAdd}`
            );
          } else {
            console.error(`No credits to add. Price ID: ${priceId}`);
          }
        } else if (mode === "subscription") {
          // New subscription
          const subscriptionId = session.subscription as string;
          const subscription = await stripe.subscriptions.retrieve(
            subscriptionId
          );
          const priceId = subscription.items.data[0].price.id;

          console.log("Subscription mode. Price ID:", priceId);

          // Upsert profile with subscription details
          // We use upsert to handle cases where profile might not exist yet
          const { data: existingProfile } = await supabaseAdmin
            .from("profiles")
            .select("*")
            .eq("email", userEmail)
            .single();

          // If new user, create profile with 1 credit, otherwise keep existing credits
          const isNewUser = !existingProfile;
          const initialCredits = isNewUser ? 1 : existingProfile?.credits ?? 0;

          await supabaseAdmin.from("profiles").upsert(
            {
              email: userEmail, // Required for upsert
              credits: initialCredits, // 1 credit for new users, or keep existing
              subscription_status: subscription.status,
              subscription_tier: getTierName(priceId),
              stripe_customer_id: session.customer as string,
              created_at: existingProfile?.created_at, // Keep original creation date if exists
            },
            { onConflict: "email" }
          );

          const credits = getCreditsForPrice(priceId);
          console.log(`Subscription credits to add: ${credits}`);

          // addCredits will handle new users properly (already has 1 credit from above)
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
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const status = subscription.status;
        const priceId = subscription.items.data[0].price.id;

        console.log(
          `Subscription updated/deleted. Customer: ${customerId}, Status: ${status}`
        );

        // Update profile
        await supabaseAdmin
          .from("profiles")
          .update({
            subscription_status: status,
            subscription_tier:
              status === "active" || status === "trialing"
                ? getTierName(priceId)
                : "free",
          })
          .eq("stripe_customer_id", customerId);

        break;
      }

      case "payment_intent.succeeded": {
        // Handle payment intent for one-time payments as a backup
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const customerId = paymentIntent.customer as string;

        console.log("Payment intent succeeded. Customer ID:", customerId);

        // Find user by customer ID
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("email")
          .eq("stripe_customer_id", customerId)
          .single();

        if (profile?.email && paymentIntent.metadata?.priceId) {
          const priceId = paymentIntent.metadata.priceId;
          console.log("Payment intent metadata. Price ID:", priceId);

          let creditsToAdd = 0;

          if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDIT_SMALL) {
            creditsToAdd = 10;
          } else if (
            priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDIT_LARGE
          ) {
            creditsToAdd = 30;
          } else if (
            priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDIT_XLARGE
          ) {
            creditsToAdd = 100;
          }

          if (creditsToAdd > 0) {
            console.log(
              `Adding credits via payment_intent. User: ${profile.email}, Credits: ${creditsToAdd}`
            );
            await addCredits(profile.email, creditsToAdd);
          }
        }
        break;
      }
    }
  } catch (error) {
    console.error("Webhook handler failed:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}

function getCreditsForPrice(priceId: string): number {
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_SUB_BASIC) return 25;
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_SUB_PRO) return 55;
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_SUB_PREMIUM) return 140;
  return 0;
}

function getTierName(priceId: string): string {
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_SUB_BASIC)
    return "basic";
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_SUB_PRO) return "pro";
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_SUB_PREMIUM)
    return "premium";
  return "free";
}

async function addCredits(email: string, amount: number) {
  console.log(`addCredits called. Email: ${email}, Amount: ${amount}`);

  // Fetch current profile to get existing data
  const { data: profile, error: fetchError } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("email", email)
    .single();

  // If profile doesn't exist, create it with 1 credit for new users
  const isNewUser = !profile || fetchError?.code === "PGRST116";

  if (isNewUser) {
    console.log(`New user detected: ${email}. Creating profile with 1 credit.`);
    // Create new profile with 1 credit + purchased credits
    const initialCredits = 1;
    const newCredits = initialCredits + amount;

    const { data: newProfile, error: createError } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          email: email,
          credits: newCredits,
          subscription_tier: "free",
          subscription_status: null,
        },
        { onConflict: "email" }
      );

    if (createError) {
      console.error(`Error creating profile for ${email}:`, createError);
      throw createError;
    }

    console.log(
      `New profile created for ${email} with ${newCredits} credits (1 initial + ${amount} purchased)`
    );
    return newProfile;
  }

  // Existing user: add credits to current balance
  const currentCredits = profile?.credits || 0;
  const newCredits = currentCredits + amount;

  console.log(
    `Updating credits. Current: ${currentCredits}, Adding: ${amount}, New: ${newCredits}`
  );

  // Upsert to ensure we don't fail if profile is missing,
  // but also preserve other fields if they exist.
  const { data: updatedProfile, error: updateError } = await supabaseAdmin
    .from("profiles")
    .upsert(
      {
        email: email,
        credits: newCredits,
        stripe_customer_id: profile?.stripe_customer_id,
        subscription_tier: profile?.subscription_tier,
        subscription_status: profile?.subscription_status,
        created_at: profile?.created_at,
      },
      { onConflict: "email" }
    );

  if (updateError) {
    console.error(`Error updating credits for ${email}:`, updateError);
    throw updateError;
  }

  console.log(
    `Credits updated successfully. Email: ${email}, New credits: ${newCredits}`
  );
  return updatedProfile;
}
