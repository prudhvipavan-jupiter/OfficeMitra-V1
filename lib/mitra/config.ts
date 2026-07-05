/** Public Mitra AI — disabled in V1 launch unless explicitly enabled. */
export function isMitraPublicEnabled(): boolean {
  const explicit =
    process.env.MITRA_AI_ENABLED ?? process.env.NEXT_PUBLIC_MITRA_AI_ENABLED;
  if (explicit === "true") return true;
  return false;
}
