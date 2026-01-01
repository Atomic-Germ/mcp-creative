export interface ArtifactContent {
  type: 'text' | 'image' | 'sound';
  data: string;
}

export interface Artifact {
  id: string;
  model?: string;
  prompt?: string;
  systemPrompt?: string;
  content: ArtifactContent[];
  tags: string[];
  metadata?: Record<string, any>;
  createdAt: string;
}
