export interface Point {  
  x: number;  
  y: number;  
}  

export interface CPUVisualizationProps {  
  particleSpeed?: number;  
  rootCount?: number;  
  primaryColor?: string;  
}  

export interface BranchOptions {  
  startX: number;  
  startY: number;  
  angle: number;  
  length: number;  
  thickness: number;  
  generation?: number;  
  parent?: Branch | null;  
}  

export class Branch {  
  startX: number;  
  startY: number;  
  angle: number;  
  baseLength: number;  
  currentLength: number;  
  targetLength: number;  
  maxExtension: number;  
  thickness: number;  
  generation: number;  
  children: Branch[];  
  flowIntensity: number;  
  parent: Branch | null;  
  path: Point[];  
  private randomOffsets: number[];  

  constructor(options: BranchOptions) {  
    const { startX, startY, angle, length, thickness, generation = 0, parent = null } = options;  

    this.startX = startX;  
    this.startY = startY;  
    this.angle = angle;  
    this.baseLength = length;  
    this.currentLength = length;  
    this.targetLength = length;  
    this.maxExtension = length * 1.3;  
    this.thickness = thickness;  
    this.generation = generation;  
    this.children = [];  
    this.flowIntensity = 0;  
    this.parent = parent;  
    this.randomOffsets = Array(4).fill(0).map(() => (Math.random() - 0.5) * 30);  
    this.path = this.generatePath();  

    this.initializeChildren();  
  }  

  private initializeChildren(): void {  
    if (this.generation < 4 && this.baseLength > 15) {  
      const numChildren = Math.floor(Math.random() * 3) + 1;  
      for (let i = 0; i < numChildren; i++) {  
        const newAngle = this.angle + (Math.random() * 1.2 - 0.6);  
        const newLength = this.baseLength * (0.7 + Math.random() * 0.2);  
        const newThickness = this.thickness * 0.7;  

        this.children.push(  
          new Branch({  
            startX: this.path[3].x,  
            startY: this.path[3].y,  
            angle: newAngle,  
            length: newLength,  
            thickness: newThickness,  
            generation: this.generation + 1,  
            parent: this  
          })  
        );  
      }  
    }  
  }  

  generatePath(): Point[] {  
    const endX = this.startX + Math.cos(this.angle) * this.currentLength;  
    const endY = this.startY + Math.sin(this.angle) * this.currentLength;  

    const scaleFactor = this.currentLength / this.baseLength;  
    const cp1x = this.startX + Math.cos(this.angle) * this.currentLength * 0.3 + this.randomOffsets[0] * scaleFactor;  
    const cp1y = this.startY + Math.sin(this.angle) * this.currentLength * 0.3 + this.randomOffsets[1] * scaleFactor;  
    const cp2x = this.startX + Math.cos(this.angle) * this.currentLength * 0.6 + this.randomOffsets[2] * scaleFactor;  
    const cp2y = this.startY + Math.sin(this.angle) * this.currentLength * 0.6 + this.randomOffsets[3] * scaleFactor;  

    return [  
      { x: this.startX, y: this.startY },  
      { x: cp1x, y: cp1y },  
      { x: cp2x, y: cp2y },  
      { x: endX, y: endY }  
    ];  
  }  

  updateLength(mouseX: number, mouseY: number): void {  
    const mouseAngle = Math.atan2(mouseY - this.startY, mouseX - this.startX);  
    const angleDiff = Math.abs(((mouseAngle - this.angle + Math.PI) % (Math.PI * 2)) - Math.PI);  
    const angleAlignment = Math.max(0, 1 - angleDiff / Math.PI);  

    const extensionFactor = 0.2 * angleAlignment;  
    this.targetLength = Math.min(  
      this.baseLength * (1 + extensionFactor),  
      this.maxExtension  
    );  

    this.currentLength += (this.targetLength - this.currentLength) * 0.1;  
    this.path = this.generatePath();  

    this.children.forEach(child => {  
      child.startX = this.path[3].x;  
      child.startY = this.path[3].y;  
      child.updateLength(mouseX, mouseY);  
    });  
  }  

  draw(ctx: CanvasRenderingContext2D, color: string = '#ff0000'): void {  
    ctx.beginPath();  
    ctx.moveTo(this.path[0].x, this.path[0].y);  
    ctx.bezierCurveTo(  
      this.path[1].x, this.path[1].y,  
      this.path[2].x, this.path[2].y,  
      this.path[3].x, this.path[3].y  
    );  

    const gradient = ctx.createLinearGradient(  
      this.path[0].x, this.path[0].y,  
      this.path[3].x, this.path[3].y  
    );  
    const alpha = 0.3 + this.flowIntensity * 0.7;  
    gradient.addColorStop(0, `${color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`);  
    gradient.addColorStop(1, `${color}${Math.round(alpha * 0.5 * 255).toString(16).padStart(2, '0')}`);  

    ctx.lineWidth = this.thickness * (1 + this.flowIntensity);  
    ctx.strokeStyle = gradient;  
    ctx.lineCap = 'round';  
    ctx.stroke();  

    this.children.forEach(child => child.draw(ctx, color));  
  }  

  updateFlowIntensity(mouseX: number, mouseY: number): void {  
    const dist = Math.hypot(mouseX - this.path[3].x, mouseY - this.path[3].y);  
    const maxDist = 300;  
    this.flowIntensity = Math.max(0, 1 - dist / maxDist);  
    this.children.forEach(child => child.updateFlowIntensity(mouseX, mouseY));  
  }  

  getPointAtProgress(progress: number): Point {  
    return bezierPoint(  
      progress,  
      this.path[0],  
      this.path[1],  
      this.path[2],  
      this.path[3]  
    );  
  }  
}

// Helpers

function bezierPoint(t: number, p0: Point, p1: Point, p2: Point, p3: Point) {
  const cX = 3 * (p1.x - p0.x);
  const bX = 3 * (p2.x - p1.x) - cX;
  const aX = p3.x - p0.x - cX - bX;

  const cY = 3 * (p1.y - p0.y);
  const bY = 3 * (p2.y - p1.y) - cY;
  const aY = p3.y - p0.y - cY - bY;

  const x = (aX * Math.pow(t, 3)) + (bX * Math.pow(t, 2)) + (cX * t) + p0.x;
  const y = (aY * Math.pow(t, 3)) + (bY * Math.pow(t, 2)) + (cY * t) + p0.y;

  return {x, y};
}