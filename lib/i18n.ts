import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translation files
const resources = {
  en: {
    common: {
      nav: {
        siteName: 'DanceLink',
        home: 'Home',
        classes: 'Classes',
        events: 'Events',
        instructors: 'Instructors',
        about: 'About',
        contact: 'Contact'
      },
      hero: {
        subtitle: 'Connect Through Movement',
        title: 'Master the Art of Dance',
        description: 'Where dancers unite, stories unfold, and connections are made through the universal language of movement. Join our vibrant community today.',
        exploreClasses: 'Explore Classes',
        bookFreeTrial: 'Book Free Trial'
      },
      about: {
        title: 'Why Choose DanceLink?',
        description: 'Experience the difference of professional instruction and passionate community',
        expertInstructors: 'Expert Instructors',
        expertInstructorsDesc: 'Learn from certified professionals with years of experience in their craft',
        allLevelsWelcome: 'All Levels Welcome',
        allLevelsWelcomeDesc: 'From complete beginners to advanced dancers, we have the perfect class for you',
        modernFacilities: 'Modern Facilities',
        modernFacilitiesDesc: 'Dance in beautiful studios equipped with the latest sound systems and amenities'
      },
      classes: {
        popularClasses: 'Popular Classes',
        discoverStyles: 'Discover Dance Styles',
        joinPopular: 'Join our most popular classes with real students',
        exploreDiverse: 'Explore our diverse range of dance styles',
        viewAll: 'View All Classes'
      },
      stats: {
        happyStudents: 'Happy Students',
        danceStyles: 'Dance Styles',
        expertInstructors: 'Expert Instructors',
        studioLocations: 'Studio Locations'
      },
      cta: {
        title: 'Ready to Start Your Dance Journey?',
        description: 'Join hundreds of happy dancers and transform your life through movement',
        startFreeTrial: 'Start Free Trial',
        browseClasses: 'Browse Classes',
        benefits: '✅ No commitment required • ✅ All skill levels welcome • ✅ Professional instructors'
      },
      danceStyles: {
        title: 'Discover Our Dance Styles',
        subtitle: 'Choose Your Perfect Dance Journey',
        loading: 'Loading our amazing dance styles...',
        noStyles: 'No dance styles available at the moment.',
        scrollLeft: 'Scroll tabs left',
        scrollRight: 'Scroll tabs right',
        swipeHint: '💡 Swipe left or right to see more dance styles',
        styleInfo: '📊 Style Information',
        characteristics: '✨ Characteristics',
        availability: '📈 Availability',
        origin: 'Origin',
        difficulty: 'Difficulty',
        musicStyle: 'Music Style',
        category: 'Category',
        classes: 'Classes',
        events: 'Events',
        students: 'Students',
        available: 'available',
        upcoming: 'upcoming',
        learning: 'learning',
        readyToStart: 'Ready to Start Your {style} Journey?',
        joinCommunity: 'Join our community of passionate dancers and discover the joy of {style}',
        viewClasses: 'View {style} Classes',
        bookFreeTrial: 'Book Free Trial'
      },
      footer: {
        allRightsReserved: 'All rights reserved.'
      }
    }
  },
  ko: {
    common: {
      nav: {
        siteName: '댄스링크',
        home: '홈',
        classes: '수업',
        events: '이벤트',
        instructors: '강사',
        about: '소개',
        contact: '연락처'
      },
      hero: {
        subtitle: '움직임을 통한 연결',
        title: '댄스의 예술을 마스터하세요',
        description: '댄서들이 하나가 되고, 이야기가 펼쳐지며, 움직임의 보편적 언어를 통해 연결을 만들어가는 곳입니다. 오늘 우리의 활기찬 커뮤니티에 참여하세요.',
        exploreClasses: '수업 둘러보기',
        bookFreeTrial: '무료 체험 예약'
      },
      about: {
        title: '왜 댄스링크를 선택해야 할까요?',
        description: '전문 강습과 열정적인 커뮤니티의 차별화된 경험',
        expertInstructors: '전문 강사진',
        expertInstructorsDesc: '각 분야에서 수년간의 경험을 가진 인증된 전문가들로부터 배우세요',
        allLevelsWelcome: '모든 수준 환영',
        allLevelsWelcomeDesc: '완전 초보자부터 고급 댄서까지, 당신에게 완벽한 수업이 있습니다',
        modernFacilities: '현대적 시설',
        modernFacilitiesDesc: '최신 음향 시스템과 편의시설을 갖춘 아름다운 스튜디오에서 춤추세요'
      },
      classes: {
        popularClasses: '인기 수업',
        discoverStyles: '댄스 스타일 발견',
        joinPopular: '실제 학생들과 함께하는 가장 인기있는 수업에 참여하세요',
        exploreDiverse: '다양한 댄스 스타일을 탐험해보세요',
        viewAll: '모든 수업 보기'
      },
      stats: {
        happyStudents: '행복한 학생들',
        danceStyles: '댄스 스타일',
        expertInstructors: '전문 강사',
        studioLocations: '스튜디오 위치'
      },
      cta: {
        title: '댄스 여정을 시작할 준비가 되셨나요?',
        description: '수백 명의 행복한 댄서들과 함께하고 움직임을 통해 삶을 변화시키세요',
        startFreeTrial: '무료 체험 시작',
        browseClasses: '수업 둘러보기',
        benefits: '✅ 약속 불필요 • ✅ 모든 실력 수준 환영 • ✅ 전문 강사진'
      },
      danceStyles: {
        title: '저희의 댄스 스타일을 발견하세요',
        subtitle: '당신에게 완벽한 댄스 여정을 선택하세요',
        loading: '매력적인 댄스 스타일을 로딩 중...',
        noStyles: '현재 사용 가능한 댄스 스타일이 없습니다.',
        scrollLeft: '탭 왼쪽으로 스크롤',
        scrollRight: '탭 오른쪽으로 스크롤',
        swipeHint: '💡 더 많은 댄스 스타일을 보려면 왼쪽 또는 오른쪽으로 스와이프하세요',
        styleInfo: '📊 스타일 정보',
        characteristics: '✨ 특징',
        availability: '📈 사용 가능성',
        origin: '기원',
        difficulty: '난이도',
        musicStyle: '음악 스타일',
        category: '카테고리',
        classes: '수업',
        events: '이벤트',
        students: '학생',
        available: '사용 가능',
        upcoming: '예정된',
        learning: '학습 중',
        readyToStart: '{style} 여정을 시작할 준비가 되션나요?',
        joinCommunity: '열정적인 댄서들의 커뮤니티에 참여하여 {style}의 즐거움을 발견하세요',
        viewClasses: '{style} 수업 보기',
        bookFreeTrial: '무료 체험 예약'
      },
      footer: {
        allRightsReserved: '모든 권리 보유.'
      }
    }
  },
  vi: {
    common: {
      nav: {
        siteName: 'DanceLink',
        home: 'Trang chủ',
        classes: 'Lớp học',
        events: 'Sự kiện',
        instructors: 'Giảng viên',
        about: 'Giới thiệu',
        contact: 'Liên hệ'
      },
      hero: {
        subtitle: 'Kết nối qua chuyển động',
        title: 'Làm chủ nghệ thuật khiêu vũ',
        description: 'Nơi các vũ công hòa hợp, câu chuyện được kể, và sự kết nối được tạo ra thông qua ngôn ngữ chung của chuyển động. Tham gia cộng đồng sôi động của chúng tôi ngay hôm nay.',
        exploreClasses: 'Khám phá lớp học',
        bookFreeTrial: 'Đặt học thử miễn phí'
      },
      about: {
        title: 'Tại sao chọn DanceLink?',
        description: 'Trải nghiệm sự khác biệt của hướng dẫn chuyên nghiệp và cộng đồng đam mê',
        expertInstructors: 'Giảng viên chuyên nghiệp',
        expertInstructorsDesc: 'Học từ các chuyên gia được chứng nhận với nhiều năm kinh nghiệm trong lĩnh vực của họ',
        allLevelsWelcome: 'Chào đón mọi trình độ',
        allLevelsWelcomeDesc: 'Từ người mới bắt đầu đến vũ công nâng cao, chúng tôi có lớp học hoàn hảo cho bạn',
        modernFacilities: 'Cơ sở vật chất hiện đại',
        modernFacilitiesDesc: 'Khiêu vũ trong các studio đẹp được trang bị hệ thống âm thanh và tiện nghi mới nhất'
      },
      classes: {
        popularClasses: 'Lớp học phổ biến',
        discoverStyles: 'Khám phá phong cách khiêu vũ',
        joinPopular: 'Tham gia các lớp học phổ biến nhất của chúng tôi với học viên thật',
        exploreDiverse: 'Khám phá đa dạng phong cách khiêu vũ của chúng tôi',
        viewAll: 'Xem tất cả lớp học'
      },
      stats: {
        happyStudents: 'Học viên hài lòng',
        danceStyles: 'Phong cách khiêu vũ',
        expertInstructors: 'Giảng viên chuyên nghiệp',
        studioLocations: 'Vị trí studio'
      },
      cta: {
        title: 'Sẵn sàng bắt đầu hành trình khiêu vũ?',
        description: 'Tham gia cùng hàng trăm vũ công hạnh phúc và thay đổi cuộc sống thông qua chuyển động',
        startFreeTrial: 'Bắt đầu học thử miễn phí',
        browseClasses: 'Duyệt lớp học',
        benefits: '✅ Không cam kết • ✅ Chào đón mọi trình độ • ✅ Giảng viên chuyên nghiệp'
      },
      danceStyles: {
        title: 'Khám phá phong cách khiêu vũ của chúng tôi',
        subtitle: 'Chọn hành trình khiêu vũ hoàn hảo của bạn',
        loading: 'Đang tải các phong cách khiêu vũ tuyệt vời...',
        noStyles: 'Hiện tại không có phong cách khiêu vũ nào.',
        scrollLeft: 'Cuộn tab sang trái',
        scrollRight: 'Cuộn tab sang phải',
        swipeHint: '💡 Trượt sang trái hoặc phải để xem thêm phong cách khiêu vũ',
        styleInfo: '📊 Thông tin phong cách',
        characteristics: '✨ Đặc điểm',
        availability: '📈 Tình trạng',
        origin: 'Xuất xứ',
        difficulty: 'Độ khó',
        musicStyle: 'Phong cách âm nhạc',
        category: 'Thể loại',
        classes: 'Lớp học',
        events: 'Sự kiện',
        students: 'Học viên',
        available: 'có sẵn',
        upcoming: 'sắp tới',
        learning: 'đang học',
        readyToStart: 'Sẵn sàng bắt đầu hành trình {style}?',
        joinCommunity: 'Tham gia cộng đồng các vũ công đam mê và khám phá niềm vui của {style}',
        viewClasses: 'Xem các lớp {style}',
        bookFreeTrial: 'Đặt học thử miễn phí'
      },
      footer: {
        allRightsReserved: 'Tất cả quyền được bảo lưu.'
      }
    }
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },

    detection: {
      order: ['localStorage', 'cookie', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
    },
  })

export default i18n