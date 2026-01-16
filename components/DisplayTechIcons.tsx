import React from 'react'
import { cn } from '@/lib/utils'

const DisplayTechIcons = ({ techStack }: TechIconProps) => {
    // Simple tech icon mapping without async/await
    const techIconMap: Record<string, string> = {
        'javascript': '📘',
        'typescript': '📘',
        'react': '⚛️',
        'nodejs': '💚',
        'python': '🐍',
        'java': '☕',
        'csharp': '#️⃣',
        'golang': '🐹',
        'rust': '🦀',
        'nextjs': '⬛',
        'express': '⚡',
        'fastapi': '⚡',
        'django': '🎯',
    };

    return (
        <div className='flex flex-row -space-x-2'> {/* Added negative space for that overlapping look */}
            {techStack.slice(0, 3).map((tech, index) => (
                <div 
                    key={tech} 
                    className={cn("relative group bg-dark-300 rounded-full p-2 flex-center text-lg", index >= 1 ? "-ml-3" : "")}
                    title={tech}
                >
                    {/* Tooltip */}
                    <span className="tech-tooltip group-hover:opacity-100">
                        {tech}
                    </span>
                    
                    {/* Icon - Using emoji */}
                    {techIconMap[tech.toLowerCase()] || '🔧'}
                </div>
            ))}
        </div>
    )
}

export default DisplayTechIcons