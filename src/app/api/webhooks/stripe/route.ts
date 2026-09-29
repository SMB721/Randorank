import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, tierForPriceId } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

// Subscription statuses that grant access to the paid tier; anything else
// (past_due, canceled, unpaid, incomplete...) falls back to freemium.
const ACTIVE_STATUSES = ["active", "trialing"];

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET ?? "");
  } catch (err) {
    return NextResponse.json(
      { error: `Signature invalide : ${err instanceof Error ? err.message : "unknown"}` },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id ?? session.metadata?.supabase_user_id;
      const customerId =
        typeof session.customer === "string" ? session.customer : session.customer?.id;

      if (userId && customerId) {
        await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", userId);
      }
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
      const priceId = subscription.items.data[0]?.price.id;
      const tier = priceId ? tierForPriceId(priceId) : null;

      if (tier) {
        // Stripe doesn't guarantee event order: subscription.created can land
        // before checkout.session.completed has stored stripe_customer_id, in
        // which case matching on the customer alone updates zero rows and a
        // user who just paid stays locked behind the paywall. The user id
        // stamped on the subscription at checkout is always there, so match
        // on it and (re)store the customer id in the same write.
        const userId = subscription.metadata?.supabase_user_id;
        const query = supabase.from("profiles").update({
          stripe_customer_id: customerId,
          subscription_tier: ACTIVE_STATUSES.includes(subscription.status) ? tier : "freemium",
          subscription_status: subscription.status,
        });
        await (userId ? query.eq("id", userId) : query.eq("stripe_customer_id", customerId));
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

      await supabase
        .from("profiles")
        .update({ subscription_tier: "freemium", subscription_status: "canceled" })
        .eq("stripe_customer_id", customerId);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
