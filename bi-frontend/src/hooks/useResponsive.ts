import { useState, useEffect } from 'react';

interface ResponsiveInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
}

const useResponsive = (): ResponsiveInfo => {
  const [responsiveInfo, setResponsiveInfo] = useState<ResponsiveInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    screenWidth: 0,
    screenHeight: 0,
    orientation: 'portrait',
  });

  useEffect(() => {
    const updateResponsiveInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // 响应式断点
      const isMobile = width <= 768;
      const isTablet = width > 768 && width <= 1024;
      const isDesktop = width > 1024;
      
      // 判断屏幕方向
      const orientation = width > height ? 'landscape' : 'portrait';
      
      setResponsiveInfo({
        isMobile,
        isTablet,
        isDesktop,
        screenWidth: width,
        screenHeight: height,
        orientation,
      });
    };

    // 初始化
    updateResponsiveInfo();
    
    // 监听窗口大小变化
    window.addEventListener('resize', updateResponsiveInfo);
    
    // 监听屏幕方向变化
    if ('orientation' in window) {
      window.addEventListener('orientationchange', updateResponsiveInfo);
    }

    return () => {
      window.removeEventListener('resize', updateResponsiveInfo);
      if ('orientation' in window) {
        window.removeEventListener('orientationchange', updateResponsiveInfo);
      }
    };
  }, []);

  return responsiveInfo;
};

export default useResponsive;
