import React, { useState, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html, Line } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. 타입 정의 및 5차원 가상 데이터 ---
interface MusicData {
  title: string;
  genre: string;
  artist: string;
  features: number[]; 
}

const FEATURE_NAMES = ["활기참", "잔잔함", "비트감", "우울함", "대중성"];

const initialMusicDatabase: MusicData[] = [
  { title: "Dynamic Hype", genre: "댄스", artist: "DJ Spark", features: [0.9, 0.4, 0.9, 0.1, 0.8] },
  { title: "Calm River", genre: "발라드", artist: "이지은", features: [0.1, 0.9, 0.2, 0.7, 0.4] },
  { title: "Neon City Pop", genre: "시티팝", artist: "RetroWave", features: [0.7, 0.6, 0.5, 0.3, 0.9] }, 
  { title: "Deep Midnight", genre: "인디", artist: "새벽감성", features: [0.3, 0.8, 0.1, 0.9, 0.2] },
  { title: "Summer Dance", genre: "EDM", artist: "Avicii Fan", features: [0.95, 0.1, 0.95, 0.05, 0.6] },
  { title: "Acoustic Jazz", genre: "재즈", artist: "Blue Note", features: [0.4, 0.7, 0.4, 0.5, 0.5] },
  { title: "Heavy Metal Rock", genre: "락", artist: "Metallica", features: [0.9, 0.1, 0.85, 0.8, 0.3] },
  { title: "My First Track", genre: "사용자 곡", artist: "나의 취향", features: [0.8, 0.3, 0.75, 0.2, 0.7] }
];

// --- 2. 하이브리드 차원 변환 엔진 ---
function processDynamicCoordinates(data: MusicData[], currentCenterTitle: string, selectedAxes: number[]) {
  const centerMusic = data.find(m => m.title === currentCenterTitle) || data[0];
  const uV = centerMusic.features;
  const axisCount = selectedAxes.length;

  const calculatedData = data.map(music => {
    const v = music.features;
    const euclideanDist = Math.sqrt(v.reduce((sum, val, i) => sum + Math.pow(val - uV[i], 2), 0));
    const nonMetricDist = 1.0 - Math.exp(-1.0 * Math.pow(euclideanDist, 2));

    let x = 0, y = 0, z = 0;

    if (axisCount === 2) {
      x = v[selectedAxes[0]];
      y = v[selectedAxes[1]];
      z = 0.5; 
    } 
    else if (axisCount === 3) {
      x = v[selectedAxes[0]];
      y = v[selectedAxes[1]] - (v[selectedAxes[1]] * x * 0.15);
      z = v[selectedAxes[2]] - (v[selectedAxes[2]] * y * 0.15);
    } 
    else {
      x = v[selectedAxes[0]];
      y = v[selectedAxes[1]] - (v[selectedAxes[1]] * x * 0.15);
      const remainingAxes = selectedAxes.slice(2);
      const compressedZ = remainingAxes.reduce((sum, idx) => sum + v[idx], 0) / remainingAxes.length;
      z = compressedZ;
    }

    const getRelativeVal = (val: number, centerVal: number) => (val - centerVal) * 10;

    const cx = centerMusic.features[selectedAxes[0]];
    const cy = axisCount >= 2 ? centerMusic.features[selectedAxes[1]] - (centerMusic.features[selectedAxes[1]] * cx * 0.15) : 0;
    let cz = 0;
    if (axisCount === 3) {
      cz = centerMusic.features[selectedAxes[2]] - (centerMusic.features[selectedAxes[2]] * cy * 0.15);
    } else if (axisCount >= 4) {
      const remainingAxes = selectedAxes.slice(2);
      cz = remainingAxes.reduce((sum, idx) => sum + centerMusic.features[idx], 0) / remainingAxes.length;
    } else {
      cz = 0.5;
    }

    return {
      ...music,
      x: getRelativeVal(x, cx),
      y: axisCount === 2 ? (y - cy) * 10 : getRelativeVal(y, cy), 
      z: axisCount === 2 ? 0 : getRelativeVal(z, cz),
      distance: nonMetricDist
    };
  });

  const others = [...calculatedData].filter(m => m.title !== currentCenterTitle);
  others.sort((a, b) => a.distance - b.distance);

  return {
    processedPoints: calculatedData,
    centerNode: calculatedData.find(m => m.title === currentCenterTitle),
    closest: others[0],
    furthest: others[others.length - 1]
  };
}

// --- 3. 🎨 인라인 SVG 앨범 커버 컴포넌트 ---
function AlbumCoverSvg({ genre }: { genre: string }) {
  if (genre === "댄스" || genre === "EDM" || genre === "락") {
    return (
      <svg width="100" height="100" viewBox="0 0 100 100" style={{ borderRadius: '6px', boxShadow: '0 0 8px #00ffcc' }}>
        <rect width="100" height="100" fill="#111" />
        <circle cx="50" cy="50" r="30" stroke="#00ffcc" strokeWidth="2" fill="none" />
        <path d="M 20 50 L 40 30 L 60 70 L 80 50" stroke="#ff0055" strokeWidth="2" fill="none" />
      </svg>
    );
  } else if (genre === "시티팝" || genre === "재즈") {
    return (
      <svg width="100" height="100" viewBox="0 0 100 100" style={{ borderRadius: '6px', boxShadow: '0 0 8px #ff00aa' }}>
        <rect width="100" height="100" fill="#1a0033" />
        <circle cx="50" cy="45" r="15" fill="#ffcc00" />
        <path d="M 15 70 L 85 70" stroke="#ff00aa" strokeWidth="3" />
      </svg>
    );
  } else {
    return (
      <svg width="100" height="100" viewBox="0 0 100 100" style={{ borderRadius: '6px', boxShadow: '0 0 8px #3333ff' }}>
        <rect width="100" height="100" fill="#050520" />
        <path d="M25,50 C35,30 65,70 75,50" stroke="#fff" strokeWidth="2" fill="none" />
      </svg>
    );
  }
}

// --- 4. 🔀 동적 거리 링커 네온 선 컴포넌트 ---
// --- 4. 🔀 동적 거리 링커 네온 선 컴포넌트 (두께 조절 버전) ---
interface ConnectionLinesProps {
  centerNode: any;
  closest: any;
  furthest: any;
}

function ConnectionLines({ centerNode, closest, furthest }: ConnectionLinesProps) {
  if (!centerNode) return null;

  // Drei의 <Line> 컴포넌트는 [[x,y,z], [x,y,z]] 형태의 좌표 배열을 받습니다.
  const closestPoints = closest 
    ? [[centerNode.x, centerNode.y, centerNode.z], [closest.x, closest.y, closest.z]] as [number, number, number][]
    : null;

  const furthestPoints = furthest 
    ? [[centerNode.x, centerNode.y, centerNode.z], [furthest.x, furthest.y, furthest.z]] as [number, number, number][]
    : null;

  return (
    <>
      {/* 1. 중심곡 ➡️ 추천곡 선 */}
      {closestPoints && (
        <Line
          points={closestPoints}       // 시작점과 끝점 좌표
          color="#00ffcc"              // 선 색상 (네온 그린)
          lineWidth={6}                // 🔥 [여기서 두께 수정!] 숫자가 커질수록 두꺼워집니다 (기본값 1)
          transparent
          opacity={0.7}
        />
      )}

      {/* 2. 중심곡 ➡️ 기피곡 선 */}
      {furthestPoints && (
        <Line
          points={furthestPoints}
          color="#3333ff"              // 선 색상 (네온 블루)
          lineWidth={3}              // 🔥 [여기서 두께 수정!] 기피곡은 살짝 더 얇게 연출
          transparent
          opacity={0.4}
          dashed                       // 점선 효과 추가로 거리감 극대화
          dashScale={2}
          gapSize={0.5}
        />
      )}
    </>
  );
}

// --- 5. 3D 음악 공간 노드 컴포넌트 ---
interface PointMeshProps {
  music: any;
  isClosest: boolean;
  isFurthest: boolean;
  isCenter: boolean;
  onSelectCenter: (title: string) => void;
}

function MusicPoint({ music, isClosest, isFurthest, isCenter, onSelectCenter }: PointMeshProps) {
  const [hovered, setHover] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      const targetScale = hovered ? 1.4 : 1.0;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      meshRef.current.position.lerp(new THREE.Vector3(music.x, music.y, music.z), 0.08);
    }
  });

  const color = isCenter ? '#ff0055' : isClosest ? '#00ffcc' : isFurthest ? '#3333ff' : '#888888';

  return (
    <mesh
      ref={meshRef}
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
      onPointerOut={() => setHover(false)}
      onClick={(e) => { e.stopPropagation(); onSelectCenter(music.title); }}
    >
      <sphereGeometry args={[isCenter ? 0.35 : 0.2, 32, 32]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 2.5 : isCenter ? 1.0 : 0.2} />

      <Html distanceFactor={12} position={[0, 0.4, 0]} center style={{ color: '#fff', fontSize: '11px', whiteSpace: 'nowrap', pointerEvents: 'none', background: 'rgba(0,0,0,0.7)', padding: '2px 6px', borderRadius: '4px' }}>
        {music.title}
      </Html>

      {hovered && (
        <Html distanceFactor={10} position={[0.4, 0.4, 0]}>
          <div style={{
            background: 'rgba(8, 8, 20, 0.95)',
            border: `2px solid ${color}`,
            borderRadius: '12px',
            padding: '12px',
            width: '210px',
            boxShadow: `0 0 20px ${color}`,
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            pointerEvents: 'none'
          }}>
            <AlbumCoverSvg genre={music.genre} />
            <div style={{ width: '100%', fontSize: '12px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{music.title}</div>
              <div style={{ color: '#aaa', fontSize: '11px' }}>{music.artist}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #223', marginTop: '4px', paddingTop: '4px' }}>
                <span>{music.genre}</span>
                <span style={{ color: '#ffcc00' }}>{isCenter ? '기준점' : `거리: ${music.distance.toFixed(3)}`}</span>
              </div>
            </div>
          </div>
        </Html>
      )}
    </mesh>
  );
}

// --- 6. 메인 대시보드 컴포넌트 ---
export default function App() {
  const [centerTitle, setCenterTitle] = useState<string>("My First Track");
  const [selectedAxes, setSelectedAxes] = useState<number[]>([0, 1, 2]);

  const handleAxisToggle = (index: number) => {
    if (selectedAxes.includes(index)) {
      if (selectedAxes.length <= 2) {
        alert("거리 계산 및 공간 구성을 위해 최소 2개의 축은 선택해야 합니다!");
        return;
      }
      setSelectedAxes(selectedAxes.filter(idx => idx !== index));
    } else {
      setSelectedAxes([...selectedAxes, index].sort((a, b) => a - b));
    }
  };

const { processedPoints, centerNode, closest, furthest } = useMemo(() => {
  return processDynamicCoordinates(initialMusicDatabase, centerTitle, selectedAxes); // ◀️ 이름을 이렇게 매칭!
}, [centerTitle, selectedAxes]);

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#04040a', color: '#fff', position: 'relative' }}>
      
      {/* HUD 대시보드 패널 */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, background: 'rgba(8,8,20,0.92)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', width: '330px', boxShadow: '0 20px 40px rgba(0,0,0,0.8)' }}>
        <h3 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>🧬 하이브리드 음악 성단 지도</h3>
        <p style={{ fontSize: '11px', color: '#667', margin: '0 0 15px 0' }}>실시간 링커 선을 통해 Non-metric 거리를 직관적으로 확인하세요.</p>
        
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: '10px', marginBottom: '15px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px', fontWeight: 'bold' }}>분석 감성 축 On / Off</div>
          {FEATURE_NAMES.map((name, idx) => {
            const isChecked = selectedAxes.includes(idx);
            return (
              <label key={name} style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '6px 0', cursor: 'pointer', fontSize: '13px', color: isChecked ? '#fff' : '#556' }}>
                <input 
                  type="checkbox" 
                  checked={isChecked} 
                  onChange={() => handleAxisToggle(idx)}
                  style={{ accentColor: '#ff0055', cursor: 'pointer' }}
                />
                <span>{name}</span>
                {isChecked && <span style={{ fontSize: '10px', color: '#ff0055' }}>[차원 고정]</span>}
              </label>
            );
          })}
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ color: '#ff0055', fontWeight: 'bold' }}>📍 기준: {centerTitle}</div>
          <div style={{ color: '#00ffcc' }}>🟢 추천(가장 가까움): {closest?.title}</div>
          <div style={{ color: '#3333ff' }}>🔵 외곽(가장 먼 곳): {furthest?.title}</div>
        </div>
      </div>

      {/* 3D 그래픽 캔버스 */}
      <Canvas camera={{ position: [0, 6, 14], fov: 55 }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[20, 20, 20]} intensity={1.5} />
        <Stars radius={100} depth={40} count={2000} factor={5} saturation={0.5} fade speed={1} />
        
        {/* 🔥 체계적인 3차원 입체 격자무늬 가이드 보강 (바닥 + 옆면 레이어 격자축) */}
        <gridHelper args={[40, 25, '#ff0055', '#121226']} position={[0, -5, 0]} />
        <gridHelper args={[40, 25, '#00ffcc', '#121226']} position={[0, 5, 0]} opacity={0.2} transparent />
        <gridHelper args={[40, 25, '#3333ff', '#121226']} position={[-20, 0, 0]} rotation={[0, 0, Math.PI / 2]} opacity={0.15} transparent />

        {/* 🔥 추천/기피 곡을 이어주는 동적 혼합색 링커 선 */}
        <ConnectionLines centerNode={centerNode} closest={closest} furthest={furthest} />

        {/* 음악 데이터 구체 노드 렌더링 */}
        {processedPoints.map((music) => (
          <MusicPoint
            key={music.title}
            music={music}
            isCenter={music.title === centerTitle}
            isClosest={music.title === closest?.title}
            isFurthest={music.title === furthest?.title}
            onSelectCenter={setCenterTitle}
          />
        ))}

        <OrbitControls enableDamping dampingFactor={0.05} maxDistance={25} minDistance={4} />
      </Canvas>
    </div>
  );
}