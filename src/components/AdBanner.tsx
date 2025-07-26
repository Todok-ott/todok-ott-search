'use client';

interface AdBannerProps {
  className?: string;
  style?: 'horizontal' | 'vertical' | 'square';
}

export default function AdBanner({ className = '', style = 'horizontal' }: AdBannerProps) {
  const getAdStyle = () => {
    switch (style) {
      case 'horizontal':
        return { width: '100%', maxWidth: 728, height: 90 };
      case 'vertical':
        return { width: 160, height: 600 };
      case 'square':
        return { width: 300, height: 250 };
      default:
        return { width: '100%', maxWidth: 728, height: 90 };
    }
  };

  const adStyle = getAdStyle();

  return (
    <div className={`flex justify-center ${className}`}>
      {/* 실제 AdSense 광고 배너 */}
      <div style={adStyle}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot="1234567890"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
        <script>
          (adsbygoogle = window.adsbygoogle || []).push({});
        </script>
      </div>
    </div>
  );
} 