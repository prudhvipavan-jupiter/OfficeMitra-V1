import fs from "fs";
import path from "path";
import { readJsonFile } from "@/lib/read-json-file";
import type { ExpertTopic } from "@/lib/expert/topic-utils";

export type { ExpertTopic } from "@/lib/expert/topic-utils";
export {
  defaultServiceTypeForCategory,
  groupExpertTopicsByCategory,
} from "@/lib/expert/topic-utils";

const topicsPath = path.join(process.cwd(), "content", "expert", "topics.json");

export function getExpertTopics(): ExpertTopic[] {
  if (!fs.existsSync(topicsPath)) return [];
  return readJsonFile<ExpertTopic[]>(topicsPath, []);
}

export function getExpertTopicByBase(base: string): ExpertTopic | undefined {
  return getExpertTopics().find((t) => t.base === base);
}
