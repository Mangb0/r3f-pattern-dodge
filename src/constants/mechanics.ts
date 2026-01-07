// 절에덴 4페이즈 기믹 설정

export const EDEN_P4_MECHANICS = {
  // Akh Morn (플레이어 위치 장판)
  akhMorn: {
    castTime: 1500, // 보스 스폰 후 시전까지 시간 (ms)
    radius: 3, // AOE 반지름
    delay: 2000, // 장판 표시 후 폭발까지 시간 (ms)
    duration: 2500, // 장판 총 표시 시간 (ms)
    color: '#ff6b6b',
  },
} as const;

// AOE 기본 설정
export const AOE_DEFAULTS = {
  warningColor: '#ff6b6b',
  explodeColor: '#ffffff',
  minOpacity: 0.2,
  maxOpacity: 0.8,
} as const;
