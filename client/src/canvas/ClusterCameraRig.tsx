import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Vector3 } from "three";

interface ClusterCameraRigProps {
  focusPoint: Vector3;
}

const CAMERA_SETTLE_SPEED = 1.35;
const CAMERA_SETTLE_DISTANCE = 0.025;
const CAMERA_OFFSET = new Vector3(6.4, 4.8, 7.6);

export function ClusterCameraRig({ focusPoint }: ClusterCameraRigProps) {
  const hasSettledRef = useRef(false);
  const targetCameraPosition = useMemo(() => {
    return focusPoint.clone().add(CAMERA_OFFSET);
  }, [focusPoint]);

  useFrame(({ camera }, delta) => {
    if (hasSettledRef.current) {
      return;
    }

    const easing = 1 - Math.exp(-CAMERA_SETTLE_SPEED * delta);

    camera.position.lerp(targetCameraPosition, easing);
    camera.lookAt(focusPoint);

    if (camera.position.distanceTo(targetCameraPosition) < CAMERA_SETTLE_DISTANCE) {
      hasSettledRef.current = true;
    }
  });

  return null;
}
