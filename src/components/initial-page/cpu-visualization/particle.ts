import { type Branch } from './types';  

export class Particle {  
  progress: number;  
  speed: number;  
  currentBranch: Branch;  
  dead: boolean;  
  path: Branch[];  

  constructor(branch: Branch, speed: number = 0.01) {  
    this.progress = 1;  
    this.speed = speed + Math.random() * 0.01;  
    this.currentBranch = branch;  
    this.dead = false;  
    this.path = [];  

    let current: Branch | null = branch;  
    while (current !== null) {  
      this.path.push(current);  
      current = current.parent;  
    }  
  }  

  update(): boolean {  
    if (this.dead) return true;  

    this.progress -= this.speed * (0.5 + this.currentBranch.flowIntensity);  

    if (this.progress <= 0) {  
      this.path.shift();  

      if (this.path.length > 0) {  
        this.currentBranch = this.path[0];  
        this.progress = 1;  
      } else {  
        this.dead = true;  
      }  
    }  

    return this.dead;  
  }

  updatePath(branch: Branch): void {
    this.currentBranch = branch;
    this.path = [];

    let current: Branch | null = branch;
    while (current !== null) {
      this.path.push(current);
      current = current.parent;
    }
  }

  draw(ctx: CanvasRenderingContext2D, color: string = '#ff0000'): void {  
    const point = this.currentBranch.getPointAtProgress(this.progress);  
    const intensity = this.currentBranch.flowIntensity;  

    const gradient = ctx.createRadialGradient(  
      point.x, point.y, 0,  
      point.x, point.y, 6 + intensity * 4  
    );  
    gradient.addColorStop(0, `${color}${Math.round((0.8 + intensity * 0.2) * 255).toString(16).padStart(2, '0')}`);  
    gradient.addColorStop(1, `${color}00`);  

    ctx.beginPath();  
    ctx.arc(point.x, point.y, 6 + intensity * 4, 0, Math.PI * 2);  
    ctx.fillStyle = gradient;  
    ctx.fill();  
  }  
}