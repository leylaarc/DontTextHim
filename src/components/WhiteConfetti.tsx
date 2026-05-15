import { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, useWindowDimensions, View } from 'react-native';

const CONFETTI_COLORS = [
  'rgba(122,72,82,0.55)',
  'rgba(82,50,57,0.5)',
  'rgba(245,232,234,0.95)',
  'rgba(232,217,221,0.9)',
  'rgba(212,196,188,0.75)',
  'rgba(250,246,246,0.9)',
];

type PieceConfig = {
  startX: number;
  width: number;
  height: number;
  duration: number;
  delay: number;
  drift: number;
  rotateEnd: string;
  color: string;
};

function ConfettiPiece({
  screenH,
  cfg,
}: {
  screenH: number;
  cfg: PieceConfig;
}) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const run = Animated.sequence([
      Animated.delay(cfg.delay),
      Animated.timing(progress, { toValue: 1, duration: cfg.duration, useNativeDriver: true }),
    ]);
    run.start();
    return () => {
      run.stop();
    };
  }, [cfg.delay, cfg.duration, progress]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, screenH + 80],
  });
  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, cfg.drift],
  });
  const rotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', cfg.rotateEnd],
  });
  const opacity = progress.interpolate({
    inputRange: [0, 0.06, 0.85, 1],
    outputRange: [0, 1, 1, 0],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: cfg.startX,
        top: 0,
        width: cfg.width,
        height: cfg.height,
        backgroundColor: cfg.color,
        borderRadius: 2,
        opacity,
        transform: [{ translateY }, { translateX }, { rotate }],
      }}
    />
  );
}

/** Full-screen overlay: pastel confetti falling once per `burst` increment. */
export function WhiteConfetti({ burst }: { burst: number }) {
  const { width, height } = useWindowDimensions();

  const configs = useMemo(() => {
    if (burst < 1) return [];
    const count = 48;
    return Array.from({ length: count }, () => ({
      startX: Math.random() * Math.max(1, width - 10),
      width: 4 + Math.random() * 6,
      height: 7 + Math.random() * 12,
      duration: 1600 + Math.random() * 1400,
      delay: Math.random() * 500,
      drift: (Math.random() - 0.5) * 100,
      rotateEnd: `${180 + Math.floor(Math.random() * 540)}deg`,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]!,
    }));
  }, [burst, width]);

  if (configs.length === 0) {
    return null;
  }

  return (
    <View style={[StyleSheet.absoluteFill, styles.layer]} pointerEvents="none">
      {configs.map((cfg, i) => (
        <ConfettiPiece key={`${burst}-${i}`} screenH={height} cfg={cfg} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    zIndex: 1000,
    elevation: 1000,
  },
});
