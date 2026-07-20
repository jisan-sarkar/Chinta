import {
  BarChart3,
  FileUp,
  Globe2,
  Image,
  KeyRound,
  Microscope,
  PanelsTopLeft,
  Search,
} from "lucide-react";

export const composerAddMenuItems = [
  {
    id: "files",
    label: "Add photos & files",
    description: "Upload from computer",
    icon: FileUp,
    disabled: true,
  },
  {
    id: "image",
    label: "Create image",
    description: "Visualize anything",
    icon: Image,
    disabled: true,
  },
  {
    id: "web-search",
    label: "Web search",
    description: "Find real-time news and info",
    icon: Globe2,
    disabled: true,
  },
  {
    id: "deep-research",
    label: "Deep research",
    description: "Get a detailed report",
    icon: Microscope,
    disabled: true,
  },
  {
    id: "notion",
    label: "Notion",
    description: "Notion workflows for specs, research, meetings, and knowledge",
    icon: PanelsTopLeft,
    disabled: true,
  },
  {
    id: "openai-platform",
    label: "OpenAI Platform",
    description: "Create an OpenAI API key after connecting Platform",
    icon: KeyRound,
    disabled: true,
  },
  {
    id: "visualize",
    label: "Visualize",
    description: "Create visualizations and interactive tools",
    icon: BarChart3,
    disabled: true,
  },
  {
    id: "atlassian-rovo",
    label: "Atlassian Rovo",
    description: "Manage Jira and Confluence fast",
    icon: Search,
    disabled: true,
  },
] as const;

export type ComposerPrimaryAction =
  | { type: "voice"; disabled: false; label: "Start voice chat" }
  | { type: "send"; disabled: boolean; label: "Send message" };

export function getComposerPrimaryAction({
  prompt,
  canSend,
  isStreaming,
}: {
  prompt: string;
  canSend: boolean;
  isStreaming: boolean;
}): ComposerPrimaryAction {
  if (!prompt.trim()) {
    return { type: "voice", disabled: false, label: "Start voice chat" };
  }

  return {
    type: "send",
    disabled: !canSend || isStreaming,
    label: "Send message",
  };
}
