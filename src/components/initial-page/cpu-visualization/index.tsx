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
  const dimensions = useStore({ width: 0, height: 0 });

  const platform = useContext(Platform) 
  const resizeTimeout = useSignal<number | null>(null);

  const getScaleFactors = $(() => {
    const baseWidth = 2560; // Base width for 2K resolution
    const baseHeight = 1440; // Base height for 2K resolution
    
    const widthScale = dimensions.width / baseWidth;
    const heightScale = dimensions.height / baseHeight;
    const scale = Math.min(widthScale, heightScale);
    
    return {
      cpuSize: Math.max(64, Math.min(128, 96 * scale)), // Min 64px, Max 128px
      branchLengthBase: Math.max(50, Math.min(200, 70 * scale)),
      branchLengthVariation: Math.max(100, Math.min(250, 170 * scale)),
      particleCount: Math.max(30, Math.min(70, Math.floor(50 * scale))),
      branchThickness: Math.max(3, Math.min(8, 6 * scale)),
      mouseGlowDistance: Math.max(70, Math.min(150, 100 * scale)),
    };
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async ({ cleanup }) => {            
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

    const drawCPU = async () => {    
      const { cpuSize } = await getScaleFactors();
      const innerSize = cpuSize * 0.8;    
      const x = cpuCenter.x;    
      const y = cpuCenter.y;    

      // Calculate mouse distance and add glow  
      const mouseDistance = Math.sqrt(  
        Math.pow(mousePos.x - x, 2) +   
        Math.pow(mousePos.y - y, 2)  
      );  

      const { mouseGlowDistance } = await getScaleFactors();
      if (mouseDistance <= mouseGlowDistance) {  
        const mouseGlowIntensity = (1 - mouseDistance / mouseGlowDistance) * MAX_MOUSE_GLOW;  
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

    const createRoots = async () => {
      const cpuRect = containerRef.value!.getBoundingClientRect();
      dimensions.width = cpuRect.width;
      dimensions.height = cpuRect.height;
      
      cpuCenter.x = cpuRect.right - (cpuRect.width * (platform.isMobile.value ? -0.33: 0.33));
      cpuCenter.y = cpuRect.height / 2;

      const { branchLengthBase, branchLengthVariation, branchThickness } = await getScaleFactors();

      roots = Array.from({ length: rootCount }, (_, i) => {
        const baseAngle = (i * Math.PI * 2 / rootCount) - Math.PI;
        const angle = baseAngle + (Math.random() * 0.2 - 0.1);
        
        return new Branch({
          startX: cpuCenter.x,
          startY: cpuCenter.y,
          angle,
          length: branchLengthBase + Math.random() * branchLengthVariation,
          thickness: branchThickness,
          generation: 0
        });
      });

      updateEndBranches();

      // Pre-populate with particles
      particles = [];
      const { particleCount } = await getScaleFactors();
      const allBranches = getAllBranches();

      for (let i = 0; i < particleCount; i++) {
        const branchIndex = Math.floor(Math.pow(Math.random(), 2) * allBranches.length);
        const selectedBranch = allBranches[branchIndex];
        const particle = new Particle(selectedBranch, particleSpeed);
        particle.progress = Math.random();
        particles.push(particle);
      }
    }; 

    const animate = async (currentTime: number) => {            
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

      const { cpuSize, particleCount } = await getScaleFactors();

      particles = particles.filter(particle => {    
        const isComplete = particle.update();    
        if (!particle.dead) {    
          const point = particle.currentBranch.getPointAtProgress(particle.progress);    
          const distance = Math.sqrt(    
            Math.pow(point.x - cpuCenter.x, 2) +     
            Math.pow(point.y - cpuCenter.y, 2)    
          );    
          if (distance <= cpuSize/2 + 5) {    
            cpuGlowIntensity = Math.min(
              Math.max(cpuGlowIntensity, MAX_PARTICLE_GLOW),   
              MAX_MOUSE_GLOW
            );    
          }    
          particle.draw(ctx, primaryColor);    
        }    
        return !isComplete;    
      });        

      if (particles.length < particleCount && Math.random() < 0.05) {            
        if (cachedEndBranches.length) {            
          const randomBranch = cachedEndBranches[Math.floor(Math.random() * cachedEndBranches.length)];    
          particles.push(new Particle(randomBranch, particleSpeed));        
        }            
      }    

      await drawCPU();    
    };            

    const resizeObserver = new ResizeObserver(async () => {
      if (resizeTimeout.value !== null) {
        clearTimeout(resizeTimeout.value);
      }

      resizeTimeout.value = setTimeout(async () => {
        canvas.width = window.innerWidth;            
        canvas.height = window.innerHeight;  

        const oldParticles = [...particles];

        await createRoots();

        oldParticles.forEach(particle => {
          const oldPoint = particle.currentBranch.getPointAtProgress(particle.progress);
          let closestBranch = roots[0];
          let minDistance = Infinity;

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
      }, 150) as unknown as number;
    });            
    resizeObserver.observe(containerRef.value);

    cleanup(() => {
      if (resizeTimeout.value !== null) {
        clearTimeout(resizeTimeout.value);
      }
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
    });          

    await createRoots();            
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