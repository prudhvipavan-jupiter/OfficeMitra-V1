import { siteConfig } from "@/lib/metadata";
import { sendTelegramMessage } from "./client";
import { isTelegramConfigured, isTelegramNotificationsEnabled } from "./settings";

function adminUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://officemitra.vercel.app";
  return `${base.replace(/\/$/, "")}${path}`;
}

export async function notifyTelegramAdmin(html: string): Promise<void> {
  try {
    if (!(await isTelegramConfigured())) return;
    if (!(await isTelegramNotificationsEnabled())) return;
    await sendTelegramMessage(html);
  } catch (err) {
    console.error("[Telegram] notify failed:", err);
  }
}

export async function notifyExpertRequestSubmitted(input: {
  reference_number: string;
  name: string;
  institution: string;
  service_type: string;
}): Promise<void> {
  await notifyTelegramAdmin(
    [
      "🆕 <b>New expert assistance request</b>",
      "",
      `<b>Ref:</b> ${escapeHtml(input.reference_number)}`,
      `<b>From:</b> ${escapeHtml(input.name)}`,
      `<b>Institution:</b> ${escapeHtml(input.institution)}`,
      `<b>Service:</b> ${escapeHtml(input.service_type)}`,
      "",
      `<a href="${adminUrl("/admin/people")}">Open People Queue →</a>`,
    ].join("\n")
  );
}

export async function notifyCommunityQuestionSubmitted(input: {
  title: string;
  author_name: string;
  category: string;
}): Promise<void> {
  await notifyTelegramAdmin(
    [
      "💬 <b>New community question (pending moderation)</b>",
      "",
      `<b>Title:</b> ${escapeHtml(input.title)}`,
      `<b>Author:</b> ${escapeHtml(input.author_name)}`,
      `<b>Category:</b> ${escapeHtml(input.category)}`,
      "",
      `<a href="${adminUrl("/admin/people")}">Moderate in People Queue →</a>`,
    ].join("\n")
  );
}

export async function notifyAdminDigest(input: {
  pendingExpert: number;
  pendingCommunity: number;
  draftTotal: number;
  publishedTotal: number;
}): Promise<void> {
  await notifyTelegramAdmin(
    [
      `📊 <b>${escapeHtml(siteConfig.name)} admin digest</b>`,
      "",
      `Expert requests pending: <b>${input.pendingExpert}</b>`,
      `Community pending: <b>${input.pendingCommunity}</b>`,
      `CMS drafts: <b>${input.draftTotal}</b>`,
      `CMS published: <b>${input.publishedTotal}</b>`,
      "",
      `<a href="${adminUrl("/admin")}">Open Command →</a>`,
    ].join("\n")
  );
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
