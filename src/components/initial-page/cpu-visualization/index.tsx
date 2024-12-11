import { $, component$, useVisibleTask$, useSignal, useOnWindow, useStore } from '@builder.io/qwik';    
import { Branch, type CPUVisualizationProps } from './types';    
import { Particle } from './particle';    

function useCPUVisualization(props: CPUVisualizationProps) {
  const {    
    particleSpeed = 0.001,    
    rootCount = 15,    
    primaryColor = '#ff0000'    
  } = props;

  const canvasRef = useSignal<HTMLCanvasElement>();    
  const containerRef = useSignal<HTMLDivElement>();    

  const mousePos = useStore({ x: 0, y: 0 });

  useVisibleTask$(({ cleanup }) => {    
    if (!canvasRef.value || !containerRef.value) return;    

    const canvas = canvasRef.value;    
    const ctx = canvas.getContext('2d')!;    
    let roots: Branch[] = [];    
    let particles: Particle[] = [];   
    let animationFrame: number;    

    function getAllBranches() {    
      const allBranches: Branch[] = [];    
      function collectBranches(branch: Branch) {    
        allBranches.push(branch);    
        branch.children.forEach(child => collectBranches(child));    
      }    
      roots.forEach(root => collectBranches(root));    
      return allBranches;    
    }

    function createRoots() {    
      const cpuRect = containerRef.value!.getBoundingClientRect();  
      // Position CPU on the right side  
      const cpuCenterX = cpuRect.right - (cpuRect.width * 0.2); // Adjust the 0.2 multiplier to fine-tune position  
      const cpuCenterY = cpuRect.height / 2;    

      roots = [];    
      for (let i = 0; i < rootCount; i++) {    
        const angle = (i * Math.PI * 2 / rootCount) + (Math.random() * 0.2 - 0.1);    
        roots.push(new Branch({    
          startX: cpuCenterX,    
          startY: cpuCenterY,    
          angle,    
          length: 120 + Math.random() * 40,    
          thickness: 6    
        }));    
      }    
    }    

    function animate() {    
      ctx.clearRect(0, 0, canvas.width, canvas.height);    

      roots.forEach(root => {    
        root.updateFlowIntensity(mousePos.x, mousePos.y);    
        root.updateLength(mousePos.x, mousePos.y);    
        root.draw(ctx, primaryColor);    
      });    

      particles = particles.filter(particle => !particle.update()); // Pass particleSpeed to update method  
      particles.forEach(particle => particle.draw(ctx, primaryColor));    

      // Chance of spawning a particle per animation frame
      if (Math.random() < 0.05) {    
        const endBranches = getAllBranches().filter(branch => branch.children.length === 0);    
        if (endBranches.length > 0) {    
          const randomBranch = endBranches[Math.floor(Math.random() * endBranches.length)];    
          particles.push(new Particle(randomBranch, particleSpeed)); // Pass particleSpeed to constructor  
        }    
      }    

      animationFrame = requestAnimationFrame(animate);    
    }    

    const resizeObserver = new ResizeObserver(() => {    
      canvas.width = window.innerWidth;    
      canvas.height = window.innerHeight;     
    });    
    resizeObserver.observe(containerRef.value);    

    createRoots();    
    animate();    

    cleanup(() => {    
      cancelAnimationFrame(animationFrame);    
      resizeObserver.disconnect();    
    });    
  });    

  useOnWindow('mousemove', $((e: MouseEvent) => {    
    mousePos.x = e.clientX;    
    mousePos.y = e.clientY;    
  }));

  //useOnWindow('DOMContentLoaded', updateIsMobile);

  return { containerRef, canvasRef }
}

export const CPUVisualization = component$((props: CPUVisualizationProps) => {    
  const { containerRef, canvasRef } = useCPUVisualization(props)

  return (    
    <div ref={containerRef} class="absolute inset-0 w-full h-full">    
      <canvas    
        ref={canvasRef}
      />  
      <div class="absolute top-1/2 left-2/3 -translate-y-1/2 w-32 h-32 bg-gray-700 border-2 border-gray-600 shadow-[0px_0px_10px_2px_var(--primary-color)] z-10">    
        <div class="relative top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600" />    
      </div>    
    </div>    
  );    
});  