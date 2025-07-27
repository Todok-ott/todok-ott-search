interface ScrapedOTTInfo {
  title: string;
  ott_services: string[];
  url: string;
  last_updated: string;
}

class WebScrapingClient {
  // 한국 OTT 사이트들
  private ottSites = {
    netflix: 'https://www.netflix.com/kr/',
    watcha: 'https://www.watcha.com/',
    tving: 'https://www.tving.com/',
    wavve: 'https://www.wavve.com/',
    disney: 'https://www.disneyplus.com/ko-kr',
    apple: 'https://tv.apple.com/kr/',
    prime: 'https://www.amazon.com/Prime-Video/'
  };

  // 인기 콘텐츠 목록 (수동 데이터)
  private popularContent = [
    {
      title: '오펜하이머',
      ott_services: ['netflix', 'watcha'],
      year: 2023
    },
    {
      title: '바비',
      ott_services: ['netflix', 'disney'],
      year: 2023
    },
    {
      title: '듄: 파트 2',
      ott_services: ['netflix', 'wavve'],
      year: 2024
    },
    {
      title: '데드풀 & 울버린',
      ott_services: ['disney'],
      year: 2024
    },
    {
      title: '스파이더맨: 어크로스 더 유니버스',
      ott_services: ['netflix', 'disney'],
      year: 2023
    },
    {
      title: '가디언즈 오브 갤럭시: Volume 3',
      ott_services: ['disney'],
      year: 2023
    },
    {
      title: '인디아나 존스: 운명의 다이얼',
      ott_services: ['disney'],
      year: 2023
    },
    {
      title: '미션 임파서블: 데드 레코닝',
      ott_services: ['netflix', 'prime'],
      year: 2023
    },
    {
      title: '존 윅: Chapter 4',
      ott_services: ['netflix', 'watcha'],
      year: 2023
    },
    {
      title: '크리에이터',
      ott_services: ['disney'],
      year: 2023
    }
  ];

  // TV 시리즈 인기 콘텐츠
  private popularTVShows = [
    {
      title: '수트',
      ott_services: ['netflix'],
      year: 2018
    },
    {
      title: '브리저튼',
      ott_services: ['netflix'],
      year: 2020
    },
    {
      title: '위쳐',
      ott_services: ['netflix'],
      year: 2019
    },
    {
      title: '스트레인저 씽즈',
      ott_services: ['netflix'],
      year: 2016
    },
    {
      title: '위드',
      ott_services: ['netflix'],
      year: 2021
    },
    {
      title: '스쿼드 게임',
      ott_services: ['netflix'],
      year: 2021
    },
    {
      title: '오징어 게임',
      ott_services: ['netflix'],
      year: 2021
    },
    {
      title: '앨리스 인 보더랜드',
      ott_services: ['netflix'],
      year: 2020
    },
    {
      title: '킹덤',
      ott_services: ['netflix'],
      year: 2019
    },
    {
      title: '킹덤: 아신전',
      ott_services: ['netflix'],
      year: 2023
    }
  ];

  // 제목으로 OTT 정보 검색
  async searchOTTInfo(title: string): Promise<ScrapedOTTInfo[]> {
    try {
      console.log(`OTT 정보 검색: ${title}`);
      
      // 실제로는 웹 스크래핑을 수행하지만, 현재는 수동 데이터 사용
      const results: ScrapedOTTInfo[] = [];
      
      // 영화 검색
      const movieMatch = this.popularContent.find(item => 
        item.title.toLowerCase().includes(title.toLowerCase()) ||
        title.toLowerCase().includes(item.title.toLowerCase())
      );
      
      if (movieMatch) {
        results.push({
          title: movieMatch.title,
          ott_services: movieMatch.ott_services,
          url: `https://www.google.com/search?q=${encodeURIComponent(movieMatch.title + ' 스트리밍')}`,
          last_updated: new Date().toISOString()
        });
      }
      
      // TV 시리즈 검색
      const tvMatch = this.popularTVShows.find(item => 
        item.title.toLowerCase().includes(title.toLowerCase()) ||
        title.toLowerCase().includes(item.title.toLowerCase())
      );
      
      if (tvMatch) {
        results.push({
          title: tvMatch.title,
          ott_services: tvMatch.ott_services,
          url: `https://www.google.com/search?q=${encodeURIComponent(tvMatch.title + ' 스트리밍')}`,
          last_updated: new Date().toISOString()
        });
      }
      
      return results;
      
    } catch (error) {
      console.error('OTT 정보 검색 실패:', error);
      throw error;
    }
  }

  // 인기 영화 OTT 정보 가져오기
  async getPopularMoviesOTT(): Promise<ScrapedOTTInfo[]> {
    try {
      console.log('인기 영화 OTT 정보 가져오기');
      
      return this.popularContent.map(item => ({
        title: item.title,
        ott_services: item.ott_services,
        url: `https://www.google.com/search?q=${encodeURIComponent(item.title + ' 스트리밍')}`,
        last_updated: new Date().toISOString()
      }));
      
    } catch (error) {
      console.error('인기 영화 OTT 정보 가져오기 실패:', error);
      throw error;
    }
  }

  // 인기 TV 시리즈 OTT 정보 가져오기
  async getPopularTVShowsOTT(): Promise<ScrapedOTTInfo[]> {
    try {
      console.log('인기 TV 시리즈 OTT 정보 가져오기');
      
      return this.popularTVShows.map(item => ({
        title: item.title,
        ott_services: item.ott_services,
        url: `https://www.google.com/search?q=${encodeURIComponent(item.title + ' 스트리밍')}`,
        last_updated: new Date().toISOString()
      }));
      
    } catch (error) {
      console.error('인기 TV 시리즈 OTT 정보 가져오기 실패:', error);
      throw error;
    }
  }

  // OTT 서비스 정보 가져오기
  getOTTServices() {
    return this.ottSites;
  }
}

export const webScrapingClient = new WebScrapingClient();
export type { ScrapedOTTInfo }; 