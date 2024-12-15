import { $, component$, useVisibleTask$, useSignal, useOnWindow, useStore, useContext } from '@builder.io/qwik';            
import { Branch, type CPUVisualizationProps } from './types';            
import { Particle } from './particle';            
import { Platform } from '~/lib/state/platform';    

function useCPUVisualization({     
  particleSpeed = 0.001,     
  rootCount = 15,            
  primaryColor = '#ff0000'     
}: CPUVisualizationProps) {        
  const canvasRef = useSignal<HTMLCanvasElement>();            
  const containerRef = useSignal<HTMLDivElement>();            
  const mousePos = useStore({ x: 0, y: 0 });        
  const cpuCenter = useStore({ x: 0, y: 0 });        

  const platform = useContext(Platform) 
  
  const resizeTimeout = useSignal<number | null>(null);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {            
    if (!canvasRef.value || !containerRef.value) return;            

    const canvas = canvasRef.value;            
    const ctx = canvas.getContext('2d')!;            

    let roots: Branch[] = [];            
    let particles: Particle[] = [];           
    let animationFrame: number;          

    // Performance optimization    
    const fps = 24;      
    const frameInterval = 1000 / fps;      
    let lastFrameTime = 0;      

    let cachedEndBranches: Branch[] = [];      
    let endBranchesUpdateCounter = 0;      
    const END_BRANCHES_UPDATE_INTERVAL = 30;    

    // CPU glow effect state    
    let cpuGlowIntensity = 0;    
    const MAX_PARTICLE_GLOW = 30;    
    const MAX_MOUSE_GLOW = 70;    
    const GLOW_DECAY_RATE = 0.2;    
    const MOUSE_GLOW_DISTANCE = 100;  

    const drawCPU = () => {    
      const cpuSize = 96;    
      const innerSize = cpuSize * 0.8;    
      const x = cpuCenter.x;    
      const y = cpuCenter.y;    

      // Calculate mouse distance and add glow  
      const mouseDistance = Math.sqrt(  
        Math.pow(mousePos.x - x, 2) +   
        Math.pow(mousePos.y - y, 2)  
      );  

      if (mouseDistance <= MOUSE_GLOW_DISTANCE) {  
        const mouseGlowIntensity = (1 - mouseDistance / MOUSE_GLOW_DISTANCE) * MAX_MOUSE_GLOW;  
        cpuGlowIntensity = Math.max(cpuGlowIntensity, mouseGlowIntensity);  
      }  

      // Dynamic glow effect    
      ctx.shadowColor = primaryColor;    
      ctx.shadowBlur = 10 + cpuGlowIntensity;    
      ctx.shadowOffsetX = 0;    
      ctx.shadowOffsetY = 0;    

      if (cpuGlowIntensity > 0) {    
        cpuGlowIntensity = Math.max(0, cpuGlowIntensity - GLOW_DECAY_RATE);    
      }    

      // Outer CPU box    
      ctx.fillStyle = '#374151';    
      ctx.strokeStyle = '#4B5563';    
      ctx.lineWidth = 2;    
      ctx.beginPath();    
      ctx.rect(x - cpuSize/2, y - cpuSize/2, cpuSize, cpuSize);    
      ctx.fill();    
      ctx.stroke();    

      // Reset shadow for inner CPU    
      ctx.shadowColor = 'transparent';    
      ctx.shadowBlur = 0;    

      // Inner CPU gradient    
      const gradient = ctx.createLinearGradient(    
        x - innerSize/2,    
        y - innerSize/2,    
        x + innerSize/2,    
        y + innerSize/2    
      );    
      gradient.addColorStop(0, '#1F2937');    
      gradient.addColorStop(1, '#374151');    

      ctx.fillStyle = gradient;    
      ctx.strokeStyle = '#4B5563';    
      ctx.lineWidth = 1;    
      ctx.beginPath();    
      ctx.rect(x - innerSize/2, y - innerSize/2, innerSize, innerSize);    
      ctx.fill();    
      ctx.stroke();    
    };    

    const getAllBranches = () => {            
      const allBranches: Branch[] = [];            
      const collectBranches = (branch: Branch) => {            
        allBranches.push(branch);            
        branch.children.forEach(collectBranches);            
      };            
      roots.forEach(collectBranches);            
      return allBranches;            
    };        

    const updateEndBranches = () => {      
      cachedEndBranches = getAllBranches().filter(branch => !branch.children.length);      
    };      

    const createRoots = () => {
      const cpuRect = containerRef.value!.getBoundingClientRect();
      cpuCenter.x = cpuRect.right - (cpuRect.width * (platform.isMobile.value ? -0.33: 0.33));
      cpuCenter.y = cpuRect.height / 2;

      roots = Array.from({ length: rootCount }, (_, i) => {
        // Start angle from -PI to ensure even distribution
        const baseAngle = (i * Math.PI * 2 / rootCount) - Math.PI;
        // Add small random variation
        const angle = baseAngle + (Math.random() * 0.2 - 0.1);
        
        return new Branch({
          startX: cpuCenter.x,
          startY: cpuCenter.y,
          angle,
          length: 70 + Math.random() * 170, // Variation
          thickness: 6,
          generation: 0
        });
      });

      updateEndBranches();

      // Pre-populate with particles
      particles = [];
      const initialParticleCount = 50;
      const allBranches = getAllBranches();

      for (let i = 0; i < initialParticleCount; i++) {
        const branchIndex = Math.floor(Math.pow(Math.random(), 2) * allBranches.length);
        const selectedBranch = allBranches[branchIndex];
        const particle = new Particle(selectedBranch, particleSpeed);
        particle.progress = Math.random();
        particles.push(particle);
      }
    }; 

    const animate = (currentTime: number) => {            
      animationFrame = requestAnimationFrame(animate);            

      const deltaTime = currentTime - lastFrameTime;      
      if (deltaTime < frameInterval) return;      
      lastFrameTime = currentTime - (deltaTime % frameInterval);      

      ctx.clearRect(0, 0, canvas.width, canvas.height);            

      if (++endBranchesUpdateCounter >= END_BRANCHES_UPDATE_INTERVAL) {      
        updateEndBranches();      
        endBranchesUpdateCounter = 0;      
      }      

      roots.forEach(root => {            
        root.updateFlowIntensity(mousePos.x, mousePos.y);            
        root.updateLength(mousePos.x, mousePos.y);            
        root.draw(ctx, primaryColor);            
      });            

      particles = particles.filter(particle => {    
        const isComplete = particle.update();    
        if (!particle.dead) {    
          const point = particle.currentBranch.getPointAtProgress(particle.progress);    
          const distance = Math.sqrt(    
            Math.pow(point.x - cpuCenter.x, 2) +     
            Math.pow(point.y - cpuCenter.y, 2)    
          );    
          if (distance <= 48 + 5) {    
            cpuGlowIntensity = Math.min(  
              Math.max(cpuGlowIntensity, MAX_PARTICLE_GLOW),   
              MAX_MOUSE_GLOW  
            );    
          }    
          particle.draw(ctx, primaryColor);    
        }    
        return !isComplete;    
      });        

      if (particles.length < 50 && Math.random() < 0.05) {            
        if (cachedEndBranches.length) {            
          const randomBranch = cachedEndBranches[Math.floor(Math.random() * cachedEndBranches.length)];    
          particles.push(new Particle(randomBranch, particleSpeed));        
        }            
      }    

      drawCPU();    
    };            

    const resizeObserver = new ResizeObserver(() => {
      // Clear any existing timeout
      if (resizeTimeout.value !== null) {
        clearTimeout(resizeTimeout.value);
      }

      // Set a new timeout
      resizeTimeout.value = setTimeout(() => {
        canvas.width = window.innerWidth;            
        canvas.height = window.innerHeight;  

        // Store old particles
        const oldParticles = [...particles];

        oldParticles.forEach(particle => {
          const oldPoint = particle.currentBranch.getPointAtProgress(particle.progress);
          let closestBranch = roots[0];
          let minDistance = Infinity;

          // Find the closest new branch
          getAllBranches().forEach(branch => {
            const branchPoint = branch.getPointAtProgress(0.5);
            const distance = Math.hypot(
              branchPoint.x - oldPoint.x,
              branchPoint.y - oldPoint.y
            );
            if (distance < minDistance) {
              minDistance = distance;
              closestBranch = branch;
            }
          });

          particle.updatePath(closestBranch);
        });

        particles = oldParticles;
        resizeTimeout.value = null;
      }, 150) as unknown as number; // Type assertion needed because setTimeout returns NodeJS.Timeout in some contexts
    });            
    resizeObserver.observe(containerRef.value);

    // Update the cleanup function
    cleanup(() => {
      if (resizeTimeout.value !== null) {
        clearTimeout(resizeTimeout.value);
      }
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
    });          

    createRoots();            
    animate(0);                       
  });    

  useOnWindow('mousemove', $((e: MouseEvent) => {    
    if (!platform.isMobile.value) {    
      requestAnimationFrame(() => {    
        mousePos.x = e.clientX;    
        mousePos.y = e.clientY;    
      });    
    }    
  }));        

  return { containerRef, canvasRef, cpuCenter }        
}        

export const CPUVisualization = component$((props: CPUVisualizationProps) => {            
  const { containerRef, canvasRef } = useCPUVisualization(props)        

  return (            
    <div ref={containerRef} class="absolute inset-0 w-full h-full -z-50">            
      <canvas ref={canvasRef} class="absolute inset-0 blur-sm md:blur-none" />          
    </div>            
  );            
});  