import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">서비스 소개</h1>
          
          <div className="space-y-8">
            {/* 서비스 개요 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">OTT 검색 서비스</h2>
              <p className="text-gray-300 leading-relaxed">
                OTT 검색은 한국에서 시청 가능한 영화, 드라마, TV 프로그램의 OTT 서비스 정보를 
                한눈에 확인할 수 있는 플랫폼입니다. 넷플릭스, 디즈니플러스, 티빙, 웨이브, 
                왓챠, 라프텔 등 주요 OTT 플랫폼의 콘텐츠 정보를 실시간으로 제공합니다.
              </p>
            </section>

            {/* 주요 기능 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">주요 기능</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3">실시간 검색</h3>
                  <p className="text-gray-300">
                    영화나 드라마 제목으로 검색하여 현재 시청 가능한 OTT 플랫폼을 
                    즉시 확인할 수 있습니다.
                  </p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3">OTT 비교</h3>
                  <p className="text-gray-300">
                    여러 OTT 플랫폼의 콘텐츠를 비교하여 최적의 시청 경험을 
                    선택할 수 있습니다.
                  </p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3">인기 콘텐츠</h3>
                  <p className="text-gray-300">
                    현재 인기 있는 영화와 드라마를 확인하고 
                    어떤 OTT에서 시청할 수 있는지 알아보세요.
                  </p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3">정확한 정보</h3>
                  <p className="text-gray-300">
                    실시간으로 업데이트되는 OTT 가용성 정보로 
                    정확하고 신뢰할 수 있는 데이터를 제공합니다.
                  </p>
                </div>
              </div>
            </section>

            {/* 지원 OTT 플랫폼 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">지원 OTT 플랫폼</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: '넷플릭스', logo: '/ott-logos/netflix.svg' },
                  { name: '디즈니플러스', logo: '/ott-logos/disney-plus.svg' },
                  { name: '웨이브', logo: '/ott-logos/wavve.svg' },
                  { name: '티빙', logo: '/ott-logos/tving.svg' },
                  { name: '왓챠', logo: '/ott-logos/watcha.svg' },
                  { name: '라프텔', logo: '/ott-logos/laftel.svg' },
                  { name: '애플TV', logo: '/ott-logos/apple-tv.svg' },
                  { name: '아마존프라임', logo: '/ott-logos/amazon-prime.svg' }
                ].map((platform) => (
                  <div key={platform.name} className="bg-gray-800 p-4 rounded-lg text-center">
                    <div className="w-12 h-12 mx-auto mb-2">
                      <Image 
                        src={platform.logo} 
                        alt={platform.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-sm text-gray-300">{platform.name}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 데이터 출처 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">데이터 출처</h2>
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Streaming Availability API</h3>
                <p className="text-gray-300 mb-4">
                  본 서비스는 Streaming Availability API를 통해 실시간 OTT 가용성 데이터를 제공받고 있습니다. 
                  이 API는 RapidAPI 플랫폼을 통해 제공되며, 전 세계 주요 OTT 플랫폼의 콘텐츠 정보를 
                  실시간으로 수집하여 정확한 시청 가능 여부를 확인할 수 있습니다.
                </p>
                <div className="flex items-center space-x-4">
                  <a 
                    href="https://rapidapi.com/movie-of-the-night-movie-of-the-night-default/api/streaming-availability" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Streaming Availability API →
                  </a>
                  <a 
                    href="https://rapidapi.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    RapidAPI →
                  </a>
                </div>
              </div>
            </section>

            {/* 기술 스택 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">기술 스택</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  'Next.js 14',
                  'TypeScript',
                  'Tailwind CSS',
                  'Vercel',
                  'Streaming Availability API',
                  'RapidAPI',
                  'React',
                  'Node.js'
                ].map((tech) => (
                  <div key={tech} className="bg-gray-800 p-4 rounded-lg text-center">
                    <p className="text-gray-300">{tech}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 연락처 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">문의 및 피드백</h2>
              <p className="text-gray-300">
                서비스 개선을 위한 제안이나 버그 리포트가 있으시면 언제든 연락해 주세요. 
                사용자 여러분의 의견이 더 나은 서비스를 만드는 데 큰 도움이 됩니다.
              </p>
              <div className="mt-4">
                <a 
                  href="/contact" 
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  문의하기
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 