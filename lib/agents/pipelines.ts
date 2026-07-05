import { AGENT_PIPELINES, getPipelineById, type AgentPipeline, type AgentPipelineStep } from "./pipeline-config";
import { runAgent, type AgentRunOutput } from "./runner";

export type { AgentPipeline, AgentPipelineStep };
export { AGENT_PIPELINES, getPipelineById };

export interface PipelineStepResult {
  agentId: string;
  label: string;
  usedAi: boolean;
  success: boolean;
  error?: string;
  output: AgentRunOutput;
}

export interface PipelineRunResult {
  pipelineId: string;
  success: boolean;
  steps: PipelineStepResult[];
  finalOutput: AgentRunOutput;
  combinedMarkdown: string;
}

export async function runPipeline(
  pipelineId: string,
  input: Record<string, string>
): Promise<PipelineRunResult> {
  const pipeline = getPipelineById(pipelineId);
  if (!pipeline) throw new Error("Unknown pipeline");

  const steps: PipelineStepResult[] = [];
  let content = "";
  let writerOutput: AgentRunOutput = {};

  for (const step of pipeline.steps) {
    const stepInput: Record<string, string> = { ...input };

    if (step.agentId === "ap-content-quality-reviewer" || step.agentId === "reality-checker") {
      stepInput.content = content || input.content || "";
      if (!stepInput.content.trim()) {
        steps.push({
          agentId: step.agentId,
          label: step.label,
          usedAi: false,
          success: false,
          error: "No content to review",
          output: {},
        });
        continue;
      }
    }

    if (step.agentId === "seo-specialist") {
      stepInput.title = writerOutput.title ?? input.title ?? input.topic ?? "";
      stepInput.summary = writerOutput.summary ?? "";
      stepInput.slug = writerOutput.slug ?? "";
    }

    const result = await runAgent(step.agentId, stepInput);
    steps.push({
      agentId: step.agentId,
      label: step.label,
      usedAi: result.usedAi,
      success: result.success,
      error: result.error,
      output: result.output,
    });

    if (!result.success) break;

    if (result.output.markdown && step.agentId.includes("writer")) {
      content = result.output.markdown;
      writerOutput = result.output;
    } else if (result.output.markdown && step.agentId === "ap-government-content-writer") {
      content = result.output.markdown;
      writerOutput = result.output;
    } else if (result.output.markdown) {
      content = result.output.markdown;
    }

    if (
      step.agentId === "ap-government-content-writer" ||
      step.agentId === "procedure-writer" ||
      step.agentId === "policy-update-writer"
    ) {
      content = result.output.markdown ?? content;
      writerOutput = { ...writerOutput, ...result.output };
    }
  }

  const combinedMarkdown = [
    `# Pipeline: ${pipeline.name}`,
    "",
    ...steps.flatMap((s) => [
      `## ${s.label}`,
      s.output.markdown ?? (s.error ? `_Failed: ${s.error}_` : "_No output_"),
      "",
    ]),
  ].join("\n");

  const lastWriter = steps.find((s) =>
    ["ap-government-content-writer", "procedure-writer", "policy-update-writer"].includes(s.agentId)
  );

  return {
    pipelineId,
    success: steps.every((s) => s.success),
    steps,
    finalOutput: lastWriter?.output ?? writerOutput,
    combinedMarkdown,
  };
}
