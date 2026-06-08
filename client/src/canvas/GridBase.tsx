export function GridBase() {
  return (
    <group position={[0, -1.35, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[36, 36]} />
        <meshBasicMaterial color="#050716" transparent opacity={0.48} />
      </mesh>
      <gridHelper args={[36, 36, "#34e5d6", "#172137"]} />
      <gridHelper
        args={[36, 12, "#7c4dff", "#24183d"]}
        position={[0, 0.02, 0]}
      />
    </group>
  );
}
