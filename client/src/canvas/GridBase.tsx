export function GridBase() {
  return (
    <group position={[0, -1.35, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[36, 36]} />
        <meshBasicMaterial color="#06211d" transparent opacity={0.42} />
      </mesh>
      <gridHelper args={[36, 36, "#1dd6c4", "#18433d"]} />
      <gridHelper
        args={[36, 12, "#d946ef", "#1d2a3a"]}
        position={[0, 0.02, 0]}
      />
    </group>
  );
}
