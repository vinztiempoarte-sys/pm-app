// Función programada: revisa ventas pendientes de recompra y envía un push
// a cada distribuidor una vez al día por cada venta que le toque.

import { createClient } from "jsr:@supabase/supabase-js@2";
import webpush from "npm:web-push@3";

Deno.serve(async () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY")!;
  const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY")!;

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  webpush.setVapidDetails(
    "mailto:no-reply@nutriciondetransporte.com",
    vapidPublicKey,
    vapidPrivateKey
  );

  const today = new Date().toISOString().slice(0, 10);

  const { data: sales, error } = await supabase
    .from("sales")
    .select(
      "id, owner_id, reminder_sent_at, contacts(full_name), products(name)"
    )
    .eq("status", "pendiente_recompra")
    .lte("estimated_reorder_date", today);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  const dueSales = (sales ?? []).filter((s) => {
    if (!s.reminder_sent_at) return true;
    return s.reminder_sent_at.slice(0, 10) < today;
  });

  const byOwner = new Map<string, typeof dueSales>();
  for (const sale of dueSales) {
    const list = byOwner.get(sale.owner_id) ?? [];
    list.push(sale);
    byOwner.set(sale.owner_id, list);
  }

  let sent = 0;

  for (const [ownerId, ownerSales] of byOwner) {
    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("owner_id", ownerId);

    if (!subs || subs.length === 0) continue;

    const count = ownerSales.length;
    const first = ownerSales[0] as unknown as {
      contacts: { full_name: string };
      products: { name: string };
    };
    const body =
      count === 1
        ? `${first.contacts.full_name} puede necesitar recomprar ${first.products.name}`
        : `Tienes ${count} recompras pendientes hoy`;

    const payload = JSON.stringify({ title: "PM App", body, url: "/" });

    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
        sent++;
      } catch (e) {
        const statusCode = (e as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
        }
      }
    }

    await supabase
      .from("sales")
      .update({ reminder_sent_at: new Date().toISOString() })
      .in(
        "id",
        ownerSales.map((s) => s.id)
      );
  }

  return new Response(
    JSON.stringify({ sent, ownersNotified: byOwner.size }),
    { headers: { "Content-Type": "application/json" } }
  );
});
