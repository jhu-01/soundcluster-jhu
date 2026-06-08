import { StarNode } from "./StarNode";
import type { StarNodeData } from "./StarNode";

interface StarNodeCollectionProps {
  nodes: StarNodeData[];
  selectedNodeId: string | null;
  onPreviewNode: (node: StarNodeData | null) => void;
  onSelectNode: (node: StarNodeData) => void;
}

export function StarNodeCollection({
  nodes,
  selectedNodeId,
  onPreviewNode,
  onSelectNode,
}: StarNodeCollectionProps) {
  return (
    <group>
      {nodes.map((node, index) => (
        <StarNode
          index={index}
          isSelected={node.id === selectedNodeId}
          key={node.id}
          node={node}
          onPreview={onPreviewNode}
          onSelect={onSelectNode}
        />
      ))}
    </group>
  );
}
