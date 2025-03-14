// components/PhaserGame.jsx
import { useEffect, useRef } from 'react';
import Phaser from 'phaser';

const PhaserGame = ({ characterData, onComplete }) => {
  const gameRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!characterData) return;

    const config = {
      type: Phaser.AUTO,
      parent: gameRef.current,
      width: 600,
      height: 600,
      backgroundColor: '#f8f8f8',
      scene: {
        init: function() {
          this.characterData = characterData;
          this.onComplete = onComplete;
        },
        preload: function() {
          // 預加載SVG
          this.load.svg('character', characterData.svgUrl);
          
          // 預加載筆畫數據
          this.strokeData = characterData.strokeData;
        },
        create: function() {
          // 渲染字體SVG作為遮罩
          this.characterMask = this.add.image(300, 300, 'character');
          this.characterMask.setAlpha(0.3);
          
          // 創建繪圖區域
          this.graphics = this.add.graphics();
          
          // 創建筆畫節點
          this.strokeNodes = [];
          this.currentStroke = 0;
          
          // 為每個筆畫繪製節點指示器
          this.strokeData.forEach((stroke, strokeIndex) => {
            let strokeNodes = [];
            stroke.nodes.forEach((node, nodeIndex) => {
              const circle = this.add.circle(node.x, node.y, 10, 0x00ff00);
              // 顯示筆順編號
              const text = this.add.text(node.x, node.y, `${strokeIndex+1}.${nodeIndex+1}`, {
                fontSize: '16px',
                fill: '#000'
              }).setOrigin(0.5);
              
              // 如果不是當前筆畫，隱藏
              if (strokeIndex !== 0) {
                circle.setVisible(false);
                text.setVisible(false);
              }
              
              strokeNodes.push({ circle, text, ...node });
            });
            this.strokeNodes.push(strokeNodes);
          });
          
          // 設置繪圖事件
          this.input.on('pointerdown', this.startDrawing, this);
          this.input.on('pointermove', this.continueDrawing, this);
          this.input.on('pointerup', this.endDrawing, this);
          
          // 目前筆跡
          this.currentPath = [];
          this.isDrawing = false;
        },
        startDrawing: function(pointer) {
          if (this.currentStroke >= this.strokeData.length) return;
          
          this.isDrawing = true;
          this.currentPath = [];
          this.currentPath.push({ x: pointer.x, y: pointer.y });
          
          // 繪製筆劃
          this.graphics.lineStyle(5, 0x000000);
          this.graphics.beginPath();
          this.graphics.moveTo(pointer.x, pointer.y);
        },
        continueDrawing: function(pointer) {
          if (!this.isDrawing) return;
          
          this.currentPath.push({ x: pointer.x, y: pointer.y });
          this.graphics.lineTo(pointer.x, pointer.y);
          this.graphics.strokePath();
        },
        endDrawing: function() {
          if (!this.isDrawing) return;
          this.isDrawing = false;
          
          // 評估筆劃完成度
          if (this.currentStroke < this.strokeData.length) {
            const completion = this.evaluateStrokeCompletion(this.currentPath, this.strokeNodes[this.currentStroke]);
            
            // 記錄筆畫軌跡到服務器
            this.recordStrokeData(this.currentPath, this.currentStroke, completion);
            
            if (completion > 0.7) { // 70% 符合度視為成功
              // 標記當前筆劃完成
              this.strokeNodes[this.currentStroke].forEach(node => {
                node.circle.setFillStyle(0x0000ff);
              });
              
              this.currentStroke++;
              
              // 如果還有下一筆畫，顯示下一筆的節點
              if (this.currentStroke < this.strokeData.length) {
                this.strokeNodes[this.currentStroke].forEach(node => {
                  node.circle.setVisible(true);
                  node.text.setVisible(true);
                });
              } else {
                // 所有筆劃完成
                this.showSuccess();
              }
            } else {
              // 筆劃不符合要求，清除並重試
              this.graphics.clear();
              
              // 重新繪製之前完成的筆劃
              for (let i = 0; i < this.currentStroke; i++) {
                const stroke = this.strokeData[i];
                this.graphics.lineStyle(5, 0x000000);
                this.graphics.beginPath();
                this.graphics.moveTo(stroke.nodes[0].x, stroke.nodes[0].y);
                
                stroke.nodes.forEach(node => {
                  this.graphics.lineTo(node.x, node.y);
                });
                
                this.graphics.strokePath();
              }
            }
          }
        },
        
        // 記錄筆畫軌跡到服務器
        recordStrokeData: function(path, strokeIndex, score) {
          // 從本地存儲獲取用戶ID（假設已經登入）
          const userId = localStorage.getItem('userId') || 1;
          
          // 準備發送到服務器的數據
          const strokeData = {
            userId: parseInt(userId),
            characterId: this.characterData.id,
            strokeIndex: strokeIndex,
            path: path,
            score: score
          };
          
          // 發送到服務器
          fetch('/api/strokes/record', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(strokeData)
          })
          .then(response => response.json())
          .then(data => {
            console.log('Stroke data recorded:', data);
            // 可以在這裡處理服務器返回的簡化節點數據
          })
          .catch(error => {
            console.error('Error recording stroke data:', error);
          });
        },
        evaluateStrokeCompletion: function(currentPath, strokeNodes) {
          // 簡單的評估方法：檢查是否經過了所有的節點
          let passedNodes = 0;
          
          // 為每個節點檢查是否有筆劃經過附近
          strokeNodes.forEach(node => {
            for (let point of currentPath) {
              const distance = Phaser.Math.Distance.Between(point.x, point.y, node.x, node.y);
              if (distance < 30) { // 30像素範圍內視為經過該節點
                passedNodes++;
                break;
              }
            }
          });
          
          return passedNodes / strokeNodes.length;
        },
        showSuccess: function() {
          const successText = this.add.text(300, 150, '寫字成功！', {
            fontSize: '36px',
            fill: '#00ff00'
          }).setOrigin(0.5);
          
          this.time.delayedCall(2000, () => {
            if (this.onComplete) this.onComplete();
          });
        }
      }
    };

    // 創建遊戲實例
    const game = new Phaser.Game(config);

    // 清理函數
    return () => {
      game.destroy(true);
    };
  }, [characterData, onComplete]);

  return (
    <div className="game-container">
      <div ref={gameRef} className="phaser-container"></div>
    </div>
  );
};

export default PhaserGame;