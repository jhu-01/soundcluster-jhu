import { StarNode } from "./StarNode";
import type { StarNodeData } from "./StarNode";

interface StarNodeCollectionProps {
  nodes: StarNodeData[];
  selectedNodeId: string | null;
  onSelectNode: (node: StarNodeData) => void;
}

export function StarNodeCollection({
  nodes,
  selectedNodeId,
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
          onSelect={onSelectNode}
        />
      ))}
    </group>
  );
}
