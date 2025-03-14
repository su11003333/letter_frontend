// components/game/WritingScene.ts
import * as Phaser from 'phaser';
import { Character, Node, Stroke, StrokeRecordRequest } from '@/lib/types';
import { ApiService } from '@/lib/utils/api';

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
  
  constructor() {
    super('WritingScene');
  }
  
  // 初始化場景數據
  init(data: WritingSceneInitData) {
    this.characterData = data.characterData;
    this.onComplete = data.onComplete;
  }
  
  // 預加載資源
  preload() {
    // 預加載SVG
    this.load.svg('character', this.characterData.svgUrl);
  }
  
  // 創建場景
  create() {
    // 渲染字體SVG作為遮罩
    this.characterMask = this.add.image(300, 300, 'character');
    this.characterMask.setAlpha(0.3);
    
    // 創建繪圖區域
    this.graphics = this.add.graphics();
    
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
        const circle = this.add.circle(node.x, node.y, 10, 0x00ff00);
        // 顯示筆順編號
        const text = this.add.text(node.x, node.y, `${strokeIndex+1}.${nodeIndex+1}`, {
          fontSize: '16px',
          color: '#000'
        }).setOrigin(0.5);
        
        // 如果不是當前筆畫，隱藏
        if (strokeIndex !== 0) {
          circle.setVisible(false);
          text.setVisible(false);
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
  }
  
  // 開始繪製
  private startDrawing(pointer: Phaser.Input.Pointer) {
    if (this.currentStroke >= this.characterData.strokeData.length) return;
    
    this.isDrawing = true;
    this.currentPath = [];
    this.currentPath.push({ x: pointer.x, y: pointer.y });
    
    // 繪製筆劃
    this.graphics.lineStyle(5, 0x000000);
    this.graphics.beginPath();
    this.graphics.moveTo(pointer.x, pointer.y);
  }
  
  // 繼續繪製
  private continueDrawing(pointer: Phaser.Input.Pointer) {
    if (!this.isDrawing) return;
    
    this.currentPath.push({ x: pointer.x, y: pointer.y });
    this.graphics.lineTo(pointer.x, pointer.y);
    this.graphics.strokePath();
  }
  
  // 結束繪製
  private endDrawing() {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    
    // 評估筆劃完成度
    if (this.currentStroke < this.characterData.strokeData.length) {
      const completion = this.evaluateStrokeCompletion(
        this.currentPath, 
        this.strokeNodes[this.currentStroke]
      );
      
      // 記錄筆畫軌跡到服務器
      this.recordStrokeData(this.currentPath, this.currentStroke, completion);
      
      if (completion > 0.7) { // 70% 符合度視為成功
        // 標記當前筆劃完成
        this.strokeNodes[this.currentStroke].forEach(node => {
          node.circle.setFillStyle(0x0000ff);
        });
        
        this.currentStroke++;
        
        // 如果還有下一筆畫，顯示下一筆的節點
        if (this.currentStroke < this.characterData.strokeData.length) {
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
          const stroke = this.characterData.strokeData[i];
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
  }
  
  // 評估筆劃完成度
  private evaluateStrokeCompletion(
    currentPath: Node[], 
    strokeNodes: {
      circle: Phaser.GameObjects.Shape;
      text: Phaser.GameObjects.Text;
      x: number;
      y: number;
    }[]
  ): number {
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
  }
  
  // 記錄筆畫軌跡到服務器
  private async recordStrokeData(path: Node[], strokeIndex: number, score: number) {
    // 從本地存儲獲取用戶ID（假設已經登入）
    const userId = parseInt(localStorage.getItem('userId') || '1');
    
    // 準備發送到服務器的數據
    const strokeData: StrokeRecordRequest = {
      userId,
      characterId: this.characterData.id,
      strokeIndex,
      path,
      score
    };
    
    try {
      // 發送到服務器
      const response = await ApiService.recordStroke(strokeData);
      console.log('Stroke data recorded:', response);
      // 可以在這裡處理服務器返回的簡化節點數據
    } catch (error) {
      console.error('Error recording stroke data:', error);
    }
  }
  
  // 顯示成功訊息
  private showSuccess() {
    const successText = this.add.text(300, 150, '寫字成功！', {
      fontSize: '36px',
      color: '#00ff00'
    }).setOrigin(0.5);
    
    this.time.delayedCall(2000, () => {
      if (this.onComplete) this.onComplete();
    });
  }
}