// src/components/game/WritingScene.ts
import * as Phaser from 'phaser';
import { Character, Node } from '@/lib/types';

interface WritingSceneInitData {
  characterData: Character;
  onComplete: () => void;
}

export default class WritingScene extends Phaser.Scene {
  private characterData!: Character;
  private onComplete!: () => void;
  private characterMask!: Phaser.GameObjects.Image;
  private graphics!: Phaser.GameObjects.Graphics;
  private strokeNodes: {
    circle: Phaser.GameObjects.Shape;
    text: Phaser.GameObjects.Text;
    x: number;
    y: number;
  }[][] = [];
  private currentStroke = 0;
  private currentPath: Node[] = [];
  private isDrawing = false;
  private completedStrokeGraphics!: Phaser.GameObjects.Graphics;
  private instructionText!: Phaser.GameObjects.Text;
  
  constructor() {
    super('WritingScene');
  }
  
  init(data: WritingSceneInitData) {
    this.characterData = data.characterData;
    this.onComplete = data.onComplete;
  }
  
  preload() {
    // 設定字元的圖像路徑 - 這裡使用模擬路徑，實際上不會載入
    // 我們會用繪圖代替真實SVG
    this.load.svg('character', this.characterData.svgUrl);
  }
  
  create() {
    // 建立背景
    this.add.rectangle(300, 300, 600, 600, 0xf8f8f8);
    
    // 創建已完成筆畫的圖層
    this.completedStrokeGraphics = this.add.graphics();
    
    // 由於可能沒有實際的SVG文件，我們用模擬的輪廓代替
    // 創建字元輪廓
    const characterOutline = this.add.graphics();
    characterOutline.lineStyle(2, 0xcccccc, 0.5);
    
    // 繪製每個筆畫的路徑作為輪廓
    this.characterData.strokeData.forEach(stroke => {
      if (stroke.nodes.length > 0) {
        characterOutline.beginPath();
        characterOutline.moveTo(stroke.nodes[0].x, stroke.nodes[0].y);
        
        for (let i = 1; i < stroke.nodes.length; i++) {
          characterOutline.lineTo(stroke.nodes[i].x, stroke.nodes[i].y);
        }
        
        characterOutline.strokePath();
      }
    });
    
    // 創建繪圖區域
    this.graphics = this.add.graphics();
    
    // 指引文字
    this.instructionText = this.add.text(300, 50, `請依順序練習「${this.characterData.name}」字 - 第 ${this.currentStroke + 1} 筆`, {
      fontSize: '24px',
      color: '#333333',
      stroke: '#ffffff',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    // 創建筆畫節點
    this.strokeNodes = [];
    this.currentStroke = 0;
    
    // 為每個筆畫繪製節點指示器
    this.characterData.strokeData.forEach((stroke, strokeIndex) => {
      let strokeNodes: {
        circle: Phaser.GameObjects.Shape;
        text: Phaser.GameObjects.Text;
        x: number;
        y: number;
      }[] = [];
      
      stroke.nodes.forEach((node, nodeIndex) => {
        // 主節點圓圈
        const circle = this.add.circle(node.x, node.y, 15, 0x4CAF50);
        
        // 節點編號
        const text = this.add.text(node.x, node.y, `${nodeIndex + 1}`, {
          fontSize: '16px',
          color: '#ffffff',
          fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // 如果不是當前筆畫，隱藏
        if (strokeIndex !== 0) {
          circle.setVisible(false);
          text.setVisible(false);
        }
        
        // 如果是起始節點，添加額外標記
        if (nodeIndex === 0) {
          this.add.circle(node.x, node.y, 20, 0x000000, 0.2);
          
          // 只為當前筆畫的起點添加提示箭頭
          if (strokeIndex === this.currentStroke) {
            const arrow = this.add.triangle(
              node.x, node.y - 30, 
              -10, -15, 
              10, -15, 
              0, 0, 
              0x4CAF50
            );
            
            // 添加動畫
            this.tweens.add({
              targets: arrow,
              y: node.y - 40,
              duration: 800,
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut'
            });
            
            // 將箭頭添加到節點數據中，以便稍後隱藏/顯示
            (strokeNodes as any).startArrow = arrow;
          }
        }
        
        strokeNodes.push({ 
          circle, 
          text, 
          x: node.x,
          y: node.y 
        });
      });
      
      this.strokeNodes.push(strokeNodes);
    });
    
    // 設置繪圖事件
    this.input.on('pointerdown', this.startDrawing, this);
    this.input.on('pointermove', this.continueDrawing, this);
    this.input.on('pointerup', this.endDrawing, this);
    this.input.on('pointerout', this.endDrawing, this);
  }
  
  startDrawing(pointer: Phaser.Input.Pointer) {
    if (this.currentStroke >= this.characterData.strokeData.length) return;
    
    this.isDrawing = true;
    this.currentPath = [];
    this.currentPath.push({ x: pointer.x, y: pointer.y });
    
    // 繪製筆劃
    this.graphics.clear();
    this.graphics.lineStyle(8, 0x333333, 1);
    this.graphics.beginPath();
    this.graphics.moveTo(pointer.x, pointer.y);
  }
  
  continueDrawing(pointer: Phaser.Input.Pointer) {
    if (!this.isDrawing) return;
    
    this.currentPath.push({ x: pointer.x, y: pointer.y });
    this.graphics.lineTo(pointer.x, pointer.y);
    this.graphics.strokePath();
  }
  
  endDrawing() {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    
    // 評估筆劃完成度
    if (this.currentStroke < this.characterData.strokeData.length) {
      const completion = this.evaluateStrokeCompletion(
        this.currentPath, 
        this.strokeNodes[this.currentStroke]
      );
      
      // 記錄筆畫軌跡 - 在獨立版本中，我們不實際發送到服務器
      // 簡化筆畫為三個關鍵節點
      const simplifiedPath = this.simplifyStroke(this.currentPath);
      console.log('筆畫完成，得分：', completion);
      console.log('簡化後的筆畫節點：', simplifiedPath);
      
      if (completion > 0.7) { // 70% 符合度視為成功
        // 在完成圖層上永久繪製該筆畫
        this.completedStrokeGraphics.lineStyle(8, 0x333333, 1);
        this.completedStrokeGraphics.beginPath();
        
        const stroke = this.characterData.strokeData[this.currentStroke];
        this.completedStrokeGraphics.moveTo(stroke.nodes[0].x, stroke.nodes[0].y);
        
        for (let i = 1; i < stroke.nodes.length; i++) {
          this.completedStrokeGraphics.lineTo(stroke.nodes[i].x, stroke.nodes[i].y);
        }
        this.completedStrokeGraphics.strokePath();
        
        // 隱藏當前筆畫的節點和標記
        this.strokeNodes[this.currentStroke].forEach(node => {
          node.circle.setVisible(false);
          node.text.setVisible(false);
        });
        
        // 隱藏起始箭頭（如果有）
        if ((this.strokeNodes[this.currentStroke] as any).startArrow) {
          (this.strokeNodes[this.currentStroke] as any).startArrow.setVisible(false);
        }
        
        // 清除當前繪圖
        this.graphics.clear();
        
        // 前進到下一筆畫
        this.currentStroke++;
        
        // 更新指引文字
        if (this.currentStroke < this.characterData.strokeData.length) {
          this.instructionText.setText(`請依順序練習「${this.characterData.name}」字 - 第 ${this.currentStroke + 1} 筆`);
          
          // 顯示下一筆畫的節點
          this.strokeNodes[this.currentStroke].forEach(node => {
            node.circle.setVisible(true);
            node.text.setVisible(true);
          });
          
          // 顯示下一筆畫的起始箭頭（如果有）
          if ((this.strokeNodes[this.currentStroke] as any).startArrow) {
            (this.strokeNodes[this.currentStroke] as any).startArrow.setVisible(true);
          }
        } else {
          // 所有筆劃完成
          this.showSuccess();
        }
      } else {
        // 筆劃不符合要求，顯示錯誤動畫
        this.showErrorFeedback();
      }
    }
  }
  
  // 視覺化錯誤反饋
  private showErrorFeedback() {
    // 將目前的繪圖線條變紅
    this.graphics.clear();
    this.graphics.lineStyle(8, 0xFF5252, 1);
    this.graphics.beginPath();
    
    if (this.currentPath.length > 0) {
      this.graphics.moveTo(this.currentPath[0].x, this.currentPath[0].y);
      
      for (let i = 1; i < this.currentPath.length; i++) {
        this.graphics.lineTo(this.currentPath[i].x, this.currentPath[i].y);
      }
      
      this.graphics.strokePath();
    }
    
    // 短暫顯示後清除
    this.time.delayedCall(800, () => {
      this.graphics.clear();
    });
  }
  
  private evaluateStrokeCompletion(
    currentPath: Node[], 
    strokeNodes: {
      circle: Phaser.GameObjects.Shape;
      text: Phaser.GameObjects.Text;
      x: number;
      y: number;
    }[]
  ): number {
    // 如果筆畫太短，視為無效
    if (currentPath.length < 5) return 0;
    
    // 檢查是否經過了所有的節點（特別是起點和終點）
    let passedNodes = 0;
    let startNodePassed = false;
    let endNodePassed = false;
    
    // 檢查起點
    const startNode = strokeNodes[0];
    const endNode = strokeNodes[strokeNodes.length - 1];
    
    // 檢查起點（特別重視）
    const startPoint = currentPath[0];
    const distanceToStart = Phaser.Math.Distance.Between(
      startPoint.x, startPoint.y, startNode.x, startNode.y
    );
    
    if (distanceToStart < 30) {
      startNodePassed = true;
      passedNodes++;
    }
    
    // 檢查終點（特別重視）
    const endPoint = currentPath[currentPath.length - 1];
    const distanceToEnd = Phaser.Math.Distance.Between(
      endPoint.x, endPoint.y, endNode.x, endNode.y
    );
    
    if (distanceToEnd < 30) {
      endNodePassed = true;
      passedNodes++;
    }
    
    // 檢查中間節點
    for (let i = 1; i < strokeNodes.length - 1; i++) {
      const node = strokeNodes[i];
      
      // 檢查是否有筆畫點接近這個節點
      for (let point of currentPath) {
        const distance = Phaser.Math.Distance.Between(
          point.x, point.y, node.x, node.y
        );
        
        if (distance < 30) {
          passedNodes++;
          break;
        }
      }
    }
    
    // 計算總得分
    let score = passedNodes / strokeNodes.length;
    
    // 如果起點或終點沒通過，嚴重扣分
    if (!startNodePassed || !endNodePassed) {
      score *= 0.5;
    }
    
    // 檢查筆畫方向是否正確
    const pathDirection = this.checkStrokeDirection(currentPath, strokeNodes);
    if (!pathDirection) {
      score *= 0.7;
    }
    
    return score;
  }
  
  // 檢查筆畫方向是否正確
  private checkStrokeDirection(currentPath: Node[], strokeNodes: any[]): boolean {
    // 簡化筆畫檢查：起點->終點方向是否大致符合
    if (currentPath.length < 2 || strokeNodes.length < 2) return true;
    
    // 取得筆畫的總體方向向量
    const pathStartX = currentPath[0].x;
    const pathStartY = currentPath[0].y;
    const pathEndX = currentPath[currentPath.length - 1].x;
    const pathEndY = currentPath[currentPath.length - 1].y;
    
    // 取得標準筆畫的總體方向向量
    const strokeStartX = strokeNodes[0].x;
    const strokeStartY = strokeNodes[0].y;
    const strokeEndX = strokeNodes[strokeNodes.length - 1].x;
    const strokeEndY = strokeNodes[strokeNodes.length - 1].y;
    
    // 計算兩個向量的點積，檢查方向是否大致相同
    const dotProduct = 
      (pathEndX - pathStartX) * (strokeEndX - strokeStartX) + 
      (pathEndY - pathStartY) * (strokeEndY - strokeStartY);
    
    // 如果點積為正，則方向大致相同
    return dotProduct > 0;
  }
  
  // 簡化筆畫為關鍵節點 (每筆劃最多3個節點: 起點，中點，終點)
  private simplifyStroke(path: Node[]): Node[] {
    if (path.length <= 3) return path;
    
    const simplified: Node[] = [];
    
    // 起點
    simplified.push(path[0]);
    
    // 中點 (選取路徑近似中間的點)
    const midIndex = Math.floor(path.length / 2);
    simplified.push(path[midIndex]);
    
    // 終點
    simplified.push(path[path.length - 1]);
    
    return simplified;
  }
  
  private showSuccess() {
    // 清除所有游標事件
    this.input.off('pointerdown');
    this.input.off('pointermove');
    this.input.off('pointerup');
    this.input.off('pointerout');
    
    // 更新指引文字
    this.instructionText.setText(`恭喜！您已完成「${this.characterData.name}」字的練習`);
    
    // 添加成功圖標和動畫
    const successIcon = this.add.circle(300, 300, 50, 0x4CAF50);
    const checkmark = this.add.text(300, 300, '✓', {
      fontSize: '64px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // 添加縮放動畫
    this.tweens.add({
      targets: [successIcon, checkmark],
      scale: { from: 0.5, to: 1 },
      duration: 500,
      ease: 'Back.easeOut'
    });
    
    // 顯示"下一個"按鈕
    const nextButton = this.add.rectangle(300, 450, 200, 50, 0x2196F3).setInteractive();
    const nextText = this.add.text(300, 450, '繼續練習', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    nextButton.on('pointerdown', () => {
      if (this.onComplete) {
        this.onComplete();
      }
    });
    
    // 添加滑入動畫
    this.tweens.add({
      targets: [nextButton, nextText],
      y: { from: 550, to: 450 },
      alpha: { from: 0, to: 1 },
      duration: 500,
      delay: 500,
      ease: 'Power2'
    });
  }
}