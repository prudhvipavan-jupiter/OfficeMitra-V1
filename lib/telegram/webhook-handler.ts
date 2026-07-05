import { getCmsTotals } from "@/lib/cms/stats";
import { getDiscussions } from "@/lib/db/discussions";
import { getExpertRequests } from "@/lib/db/requests";
import { siteConfig } from "@/lib/metadata";
import { sendTelegramMessage } from "./client";
import { setTelegramAdminChatId } from "./settings";

interface TelegramUpdate {
  message?: {
    chat: { id: number; type: string };
    text?: string;
    from?: { first_name?: string; username?: string };
  };
}

export async function handleTelegramUpdate(update: TelegramUpdate): Promise<void> {
  const msg = update.message;
  if (!msg?.text || !msg.chat?.id) return;

  const chatId = String(msg.chat.id);
  const text = msg.text.trim();
  const command = text.split(/\s+/)[0]?.toLowerCase();

  if (command === "/start" || command === "/link") {
    await setTelegramAdminChatId(chatId);
    await sendTelegramMessage(
      [
        `✅ Linked to <b>${siteConfig.name} Admin</b>`,
        "",
        `Your chat ID: <code>${chatId}</code>`,
        "",
        "This chat will receive admin alerts (expert requests, community questions).",
        "",
        "Commands:",
        "/status — queue snapshot",
        "/help — admin portal guide links",
      ].join("\n"),
      chatId
    );
    return;
  }

  if (command === "/help") {
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://officemitra.vercel.app";
    await sendTelegramMessage(
      [
        `<b>${siteConfig.name} Admin Bot</b>`,
        "",
        "📖 Full how-to guide:",
        `${base}/admin/guide`,
        "",
        "Modules:",
        `• Command — ${base}/admin`,
        `• People Queue — ${base}/admin/people`,
        `• NeXus — ${base}/admin/nexus`,
        `• Review Hub — ${base}/admin/review`,
        `• CMS — ${base}/admin/content`,
        "",
        "/status — live queue counts",
        "/link — re-link this chat for notifications",
      ].join("\n"),
      chatId
    );
    return;
  }

  if (command === "/status") {
    const [requests, pendingDiscussions, cms] = await Promise.all([
      getExpertRequests(),
      getDiscussions({ status: "pending" }),
      getCmsTotals().catch(() => null),
    ]);
    const pendingExpert = requests.filter((r) => r.status === "pending").length;

    await sendTelegramMessage(
      [
        `📊 <b>Admin status</b>`,
        "",
        `Expert pending: <b>${pendingExpert}</b>`,
        `Community pending: <b>${pendingDiscussions.length}</b>`,
        `CMS published: <b>${cms?.publishedTotal ?? "—"}</b>`,
        `CMS drafts: <b>${cms?.draftTotal ?? "—"}</b>`,
      ].join("\n"),
      chatId
    );
  }
}
