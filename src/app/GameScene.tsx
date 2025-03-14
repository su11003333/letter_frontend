import Phaser from 'phaser';
import { useEffect, useRef } from 'react';

interface GameSceneProps {
  characterId: string;
  onStrokeComplete: (points: Array<{ x: number; y: number }>) => void;
}

export default function GameScene({
  characterId = 'default',
  onStrokeComplete = (points: Array<{ x: number; y: number }>) => {}
}: GameSceneProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const strokePoints = useRef<Array<{ x: number; y: number }>>([]);
  const isDrawing = useRef(false);

  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: 'game-container',
      width: 800,
      height: 600,
      transparent: true,
      scene: {
        preload() {
          this.load.svg(characterId, `/assets/${characterId}.svg`);
        },
        create() {
          this.load.image(characterId, `/assets/${characterId}.svg`);
          this.load.once('complete', () => {
            const svg = this.add.image(400, 300, characterId)
              .setScale(0.5)
              .setAlpha(0.3);
          });
          this.load.start();

          // 筆畫互動區域
          const zone = this.add.zone(0, 0, 800, 600)
            .setOrigin(0)
            .setInteractive();

          zone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            isDrawing.current = true;
            strokePoints.current = [{ x: pointer.x, y: pointer.y }];
          });

          zone.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (isDrawing.current) {
              strokePoints.current.push({ x: pointer.x, y: pointer.y });
            }
          });

          zone.on('pointerup', () => {
            isDrawing.current = false;
            if (strokePoints.current.length > 0) {
              onStrokeComplete(simplifyStroke(strokePoints.current));
            }
          });
        }
      }
    };

    gameRef.current = new Phaser.Game(config);
    return () => gameRef.current?.destroy(true);
  }, [characterId]);

  // 筆畫軌跡簡化算法（道格拉斯-普克算法）
  const simplifyStroke = (points: Array<{ x: number; y: number }>): Array<{ x: number; y: number }> => {
    if (points.length <= 3) return points;
    
    const tolerance = 5;
    let maxDistance = 0;
    let index = 0;

    for (let i = 1; i < points.length - 1; i++) {
      const distance = perpendicularDistance(
        points[i],
        points[0],
        points[points.length - 1]
      );
      if (distance > maxDistance) {
        maxDistance = distance;
        index = i;
      }
    }

    if (maxDistance > tolerance) {
      const left = points.slice(0, index + 1);
      const right = points.slice(index);
      return [
        ...simplifyStroke(left),
        ...simplifyStroke(right).slice(1)
      ];
    }
    return [points[0], points[points.length - 1]];
  };

  const perpendicularDistance = (
    point: { x: number; y: number },
    lineStart: { x: number; y: number },
    lineEnd: { x: number; y: number }
  ) => {
    const area = Math.abs(
      (lineEnd.x - lineStart.x) * (lineStart.y - point.y) -
      (lineStart.x - point.x) * (lineEnd.y - lineStart.y)
    );
    const lineLength = Math.sqrt(
      Math.pow(lineEnd.x - lineStart.x, 2) + 
      Math.pow(lineEnd.y - lineStart.y, 2)
    );
    return area / lineLength;
  };

  return <div id="game-container" className="w-full h-[600px]"/>;
}