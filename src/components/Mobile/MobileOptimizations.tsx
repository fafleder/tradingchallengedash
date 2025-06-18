import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface MobileOptimizationsProps {
  children: React.ReactNode;
}

const MobileOptimizations: React.FC<MobileOptimizationsProps> = ({ children }) => {
  const { darkMode } = useTheme();

  return (
    <div className="mobile-optimized">
      {/* Mobile-specific styles */}
      <style jsx>{`
        .mobile-optimized {
          /* Touch-friendly tap targets */
          --tap-target-size: 44px;
        }
        
        @media (max-width: 768px) {
          /* Larger touch targets on mobile */
          .mobile-optimized button,
          .mobile-optimized input,
          .mobile-optimized select {
            min-height: var(--tap-target-size);
            min-width: var(--tap-target-size);
          }
          
          /* Better spacing on mobile */
          .mobile-optimized .container {
            padding-left: 1rem;
            padding-right: 1rem;
          }
          
          /* Improved table scrolling */
          .mobile-optimized table {
            font-size: 0.875rem;
          }
          
          /* Stack cards vertically on mobile */
          .mobile-optimized .grid-responsive {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          
          /* Hide less important columns on mobile */
          .mobile-optimized .hide-mobile {
            display: none;
          }
          
          /* Larger text for better readability */
          .mobile-optimized .text-mobile-lg {
            font-size: 1.125rem;
          }
          
          /* Better modal sizing on mobile */
          .mobile-optimized .modal-mobile {
            margin: 1rem;
            max-height: calc(100vh - 2rem);
            overflow-y: auto;
          }
        }
        
        @media (max-width: 480px) {
          /* Extra small screens */
          .mobile-optimized .text-xs-mobile {
            font-size: 0.75rem;
          }
          
          .mobile-optimized .p-xs-mobile {
            padding: 0.5rem;
          }
        }
      `}</style>
      
      {children}
    </div>
  );
};

export default MobileOptimizations;