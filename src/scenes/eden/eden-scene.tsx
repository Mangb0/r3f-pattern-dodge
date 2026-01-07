import { useState, useRef, useCallback } from "react";
import type { Mesh } from "three";
import GameScene from "../../components/game-scene";
import Boss from "../../components/boss";
import AoeCircle from "../../components/gimmicks/aoe-circle";
import Raidwide from "../../components/gimmicks/raidwide";
import Tower from "../../components/gimmicks/tower";
import HallowedWings from "../../components/gimmicks/hallowed-wings";
import SomberDance from "../../components/gimmicks/somber-dance";
import PathOfLight from "../../components/gimmicks/path-of-light";
import SpiritTaker from "../../components/gimmicks/spirit-taker";
import DarkWater from "../../components/gimmicks/dark-water";
import AkhMorn from "../../components/gimmicks/akh-morn";
import MornAfah from "../../components/gimmicks/morn-afah";
import Hourglass from "../../components/gimmicks/hourglass";
import DragonHead from "../../components/gimmicks/dragon-head";
import Exaflare from "../../components/gimmicks/exaflare";
import ReturnPoint from "../../components/gimmicks/return-point";
import TidalLight from "../../components/gimmicks/tidal-light";
import UnholyDarkness from "../../components/gimmicks/unholy-darkness";
import Quietus from "../../components/gimmicks/quietus";
import DarkDebuff from "../../components/gimmicks/dark-debuff";
import Enrage from "../../components/gimmicks/enrage";
import NpcMarker from "../../components/npc-marker";
import EdenGround from "./eden-ground";

// 4페이즈 타임라인 (07:22 타겟 가능 기준 = 0ms)
// 실제 레이드 시간: 07:22 ~ 10:17
const PHASE_START = 0; // 07:22를 0ms로 설정

const TIMELINE = {
  // ===== 1. 오프닝 (07:22 ~ 07:57) =====
  MATERIALIZATION: PHASE_START + 9000, // 07:31
  DRACHEN_ARMOR: PHASE_START + 20000, // 07:42
  AKH_RHAI: PHASE_START + 23000, // 07:45
  EDGE_OF_OBLIVION_1: PHASE_START + 25000, // 07:47
  BOSS_TO_CENTER: PHASE_START + 30000, // 오프닝 종료 후 중앙 이동

  // ===== 2. Darklit Dragonsong (07:57 ~ 08:26) =====
  DARKLIT_DRAGONSONG: PHASE_START + 35000, // 07:57
  DARKLIT_BRIGHT_HUNGER: PHASE_START + 46000, // 08:08 (타워)
  DARKLIT_PATH_OF_LIGHT: PHASE_START + 47000, // 08:09 (프로틴)
  DARKLIT_SPIRIT_TAKER: PHASE_START + 49000, // 08:11
  DARKLIT_DARK_WATER: PHASE_START + 54000, // 08:16
  DARKLIT_HALLOWED_WINGS: PHASE_START + 54000, // 08:16
  DARKLIT_SOMBER_1: PHASE_START + 57000, // 08:19
  DARKLIT_SOMBER_2: PHASE_START + 60000, // 08:22
  DARKLIT_SOMBER_FAR: PHASE_START + 57000, // 별칭 (기존 호환)
  DARKLIT_SOMBER_CLOSE: PHASE_START + 60000, // 별칭 (기존 호환)
  EDGE_OF_OBLIVION_2: PHASE_START + 64000, // 08:26

  // ===== 3. Akh Morn #1 (08:33 ~ 08:43) =====
  BOSS_TO_CENTER_2: PHASE_START + 68000, // Akh Morn 준비
  AKH_MORN_1: PHASE_START + 71000, // 08:33
  MORN_AFAH_1: PHASE_START + 81000, // 08:43

  // ===== 4. Crystallize Time (08:58 ~ 09:32) =====
  CRYSTALLIZE_TIME: PHASE_START + 96000, // 08:58
  CRYSTALLIZE_EDGE: PHASE_START + 102000, // 09:04
  CRYSTALLIZE_SPEED: PHASE_START + 106000, // 09:08
  CRYSTALLIZE_HOURGLASSES: PHASE_START + 107000, // 모래시계 (별칭)
  CRYSTALLIZE_MAELSTREAM_1: PHASE_START + 107000, // 09:09
  CRYSTALLIZE_DEBUFFS: PHASE_START + 110000, // 09:12 (Water, Aero, Eruption, Blizzard)
  CRYSTALLIZE_DRAGONS: PHASE_START + 110000, // 용 머리 (별칭)
  CRYSTALLIZE_DRAGON_1: PHASE_START + 110000, // 09:12
  CRYSTALLIZE_MAELSTREAM_2: PHASE_START + 113000, // 09:15
  CRYSTALLIZE_DRAGON_2: PHASE_START + 114000, // 09:16
  CRYSTALLIZE_UNHOLY: PHASE_START + 114000, // 09:16
  CRYSTALLIZE_EXAFLARE: PHASE_START + 118000, // 엑사플레어 (별칭)
  CRYSTALLIZE_TIDAL_1: PHASE_START + 118000, // 09:20
  CRYSTALLIZE_MAELSTREAM_3: PHASE_START + 119000, // 09:21
  CRYSTALLIZE_TIDAL_2: PHASE_START + 124000, // 09:26
  CRYSTALLIZE_QUIETUS: PHASE_START + 128000, // 09:30
  CRYSTALLIZE_REWIND: PHASE_START + 130000, // 되감기 (별칭)
  CRYSTALLIZE_RETURN: PHASE_START + 130000, // 09:32

  // ===== 5. 후반 Hallowed Wings (09:36 ~ 09:46) =====
  POST_SPIRIT_TAKER: PHASE_START + 134000, // 09:36
  POST_HALLOWED_PREP: PHASE_START + 137000, // 09:39
  POST_HALLOWED_1: PHASE_START + 139000, // 09:41
  POST_HALLOWED_2: PHASE_START + 144000, // 09:46

  // ===== 6. Akh Morn #2 (09:56 ~ 10:06) =====
  AKH_MORN_2: PHASE_START + 154000, // 09:56
  EDGE_OF_OBLIVION_3: PHASE_START + 161000, // 10:03
  MORN_AFAH_2: PHASE_START + 164000, // 10:06

  // ===== 7. 전멸기 (10:17) =====
  ENRAGE: PHASE_START + 175000, // 10:17
} as const;

interface AoeMarker {
  id: number;
  position: [number, number, number];
}

type Phase =
  | "waiting"
  | "ryne_spawn"
  | "akh_rhai"
  | "edge1"
  | "boss_center"
  | "darklit";

export interface CastInfo {
  skillName: string;
  bossName: string;
  castTime: number;
  color: string;
}

export interface MechanicInfo {
  name: string;
  description: string;
  severity: "info" | "warning" | "danger";
}

interface EdenSceneProps {
  onCastStart?: (cast: CastInfo) => void;
  onCastEnd?: () => void;
  onMechanicChange?: (mechanic: MechanicInfo | null) => void;
  onTimelineStart?: (startTime: number) => void;
}

export default function EdenScene({
  onCastStart,
  onCastEnd,
  onMechanicChange,
  onTimelineStart,
}: EdenSceneProps) {
  const [phase, setPhase] = useState<Phase>("ryne_spawn");
  const [aoeMarkers, setAoeMarkers] = useState<AoeMarker[]>([]);
  const [showRaidwide, setShowRaidwide] = useState(false);
  const [bossTarget, setBossTarget] = useState<
    [number, number, number] | undefined
  >();
  const [showOracle, setShowOracle] = useState(false);
  const [oracleTarget, setOracleTarget] = useState<
    [number, number, number] | undefined
  >();
  const [towers, setTowers] = useState<
    { id: number; position: [number, number, number] }[]
  >([]);
  const [hallowedSide, setHallowedSide] = useState<"left" | "right" | null>(
    null
  );
  const [somberType, setSomberType] = useState<"far" | "close" | null>(null);
  const [somberTarget, setSomberTarget] = useState<[number, number, number]>([
    0, 0, 0,
  ]);
  const [oraclePos, setOraclePos] = useState<[number, number, number]>([
    0, 1.25, 8,
  ]);
  // 새로운 기믹 상태
  const [proteans, setProteans] = useState<
    { id: number; target: [number, number, number] }[]
  >([]);
  const [spiritTaker, setSpiritTaker] = useState<{
    target: [number, number, number];
  } | null>(null);
  const [darkWater, setDarkWater] = useState<{
    position: [number, number, number];
  } | null>(null);
  // Akh Morn & Morn Afah 상태
  const [akhMorn, setAkhMorn] = useState<{ hits: number } | null>(null);
  const [mornAfah, setMornAfah] = useState(false);
  // Crystallize Time 상태
  const [hourglasses, setHourglasses] = useState<
    {
      id: number;
      position: [number, number, number];
      type: "yellow" | "purple" | "untethered";
    }[]
  >([]);
  const [dragonHeads, setDragonHeads] = useState<
    {
      id: number;
      start: [number, number, number];
      end: [number, number, number];
    }[]
  >([]);
  const [exaflares, setExaflares] = useState<
    {
      id: number;
      start: [number, number, number];
      direction: "north" | "south" | "east" | "west";
    }[]
  >([]);
  const [returnPoints, setReturnPoints] = useState<
    { id: number; position: [number, number, number] }[]
  >([]);
  // 추가 Crystallize Time 상태
  const [tidalLights, setTidalLights] = useState<
    { id: number; direction: "east" | "west" }[]
  >([]);
  const [unholyDarkness, setUnholyDarkness] = useState<
    { id: number; position: [number, number, number] }[]
  >([]);
  const [showQuietus, setShowQuietus] = useState(false);
  const [darkDebuffs, setDarkDebuffs] = useState<
    {
      id: number;
      position: [number, number, number];
      type: "water" | "aero" | "eruption" | "blizzard";
    }[]
  >([]);
  // 후반 기믹 상태
  const [postSpiritTaker, setPostSpiritTaker] = useState<{
    target: [number, number, number];
  } | null>(null);
  const [postHallowed, setPostHallowed] = useState<"left" | "right" | null>(
    null
  );
  // Akh Morn #2 상태
  const [akhMorn2, setAkhMorn2] = useState<{ hits: number } | null>(null);
  const [mornAfah2, setMornAfah2] = useState(false);
  // 전멸기
  const [showEnrage, setShowEnrage] = useState(false);

  const characterRef = useRef<Mesh | null>(null);
  const towerIdRef = useRef(0);
  const aoeIdRef = useRef(0);
  const spawnTimeRef = useRef<number>(0);

  // 캐릭터 위치 스냅샷 후 AOE 생성
  const spawnAoeAtPlayer = useCallback(() => {
    if (!characterRef.current) return;

    const pos = characterRef.current.position;
    const newAoe: AoeMarker = {
      id: aoeIdRef.current++,
      position: [pos.x, 0, pos.z],
    };

    setAoeMarkers((prev) => [...prev, newAoe]);
  }, []);

  // AOE 제거
  const removeAoe = useCallback((id: number) => {
    setAoeMarkers((prev) => prev.filter((aoe) => aoe.id !== id));
  }, []);

  // 타워 제거
  const removeTower = useCallback((id: number) => {
    setTowers((prev) => prev.filter((tower) => tower.id !== id));
  }, []);

  // 시전 바 헬퍼
  const startCast = useCallback(
    (skillName: string, bossName: string, castTime: number, color: string) => {
      onCastStart?.({ skillName, bossName, castTime, color });
      setTimeout(() => onCastEnd?.(), castTime);
    },
    [onCastStart, onCastEnd]
  );

  // 기믹 표시 헬퍼
  const showMechanic = useCallback(
    (
      name: string,
      description: string,
      severity: "info" | "warning" | "danger",
      duration: number
    ) => {
      onMechanicChange?.({ name, description, severity });
      setTimeout(() => onMechanicChange?.(null), duration);
    },
    [onMechanicChange]
  );

  // 보스 스폰 후 전체 타임라인 시작
  const handleBossSpawned = useCallback(() => {
    console.log("린 등장!");
    spawnTimeRef.current = Date.now();
    onTimelineStart?.(Date.now());

    // 13.7초: Akh Rhai 시전 (날개 펼치기)
    setTimeout(() => {
      console.log("Akh Rhai 시전!");
      setPhase("akh_rhai");
      startCast("Akh Rhai", "Usurper of Frost", 5100, "#ff6b6b");
      showMechanic(
        "Akh Rhai",
        "플레이어 위치에 장판 생성 - 피하세요!",
        "danger",
        5500
      );
      spawnAoeAtPlayer();
    }, TIMELINE.AKH_RHAI);

    // 16.2초: Edge of Oblivion (전체 공격)
    setTimeout(() => {
      console.log("Edge of Oblivion!");
      setPhase("edge1");
      startCast("Edge of Oblivion", "Usurper of Frost", 800, "#8844ff");
      showMechanic("Edge of Oblivion", "전체 공격 - 힐 체크!", "warning", 1000);
      setShowRaidwide(true);
    }, TIMELINE.EDGE_OF_OBLIVION_1);

    // 19.4초: 보스 중앙으로 이동
    setTimeout(() => {
      console.log("보스 중앙 이동!");
      setPhase("boss_center");
      setBossTarget([0, 1.25, 0]);
    }, TIMELINE.BOSS_TO_CENTER);

    // 25.7초: Darklit Dragonsong 시작
    setTimeout(() => {
      console.log("빛과 어둠의 용시 시작!");
      setPhase("darklit");
      startCast("Darklit Dragonsong", "Usurper of Frost", 3000, "#9933ff");
      showMechanic(
        "Darklit Dragonsong",
        "Oracle of Darkness 등장!",
        "info",
        3500
      );
      setShowOracle(true);
    }, TIMELINE.DARKLIT_DRAGONSONG);

    // 36.9초: Bright Hunger (타워 2개) + Path of Light (프로틴 4방향) 동시
    setTimeout(() => {
      console.log("Bright Hunger + Path of Light!");
      startCast("Bright Hunger", "Usurper of Frost", 3000, "#ffcc00");
      showMechanic(
        "타워 + 프로틴",
        "타워 2개(북/남) 밟기 + 4방향 프로틴 유도!",
        "warning",
        3500
      );

      // 타워 2개 (북/남)
      const towerPositions: [number, number, number][] = [
        [0, 0, -10], // 북 (Ryne 쪽)
        [0, 0, 10], // 남 (Oracle 쪽)
      ];
      const newTowers = towerPositions.map((pos) => ({
        id: towerIdRef.current++,
        position: pos,
      }));
      setTowers(newTowers);

      // 프로틴 4방향 (Ryne 중앙에서 인터카디널 방향)
      const proteanTargets: [number, number, number][] = [
        [-8, 0, -8], // 북서
        [8, 0, -8], // 북동
        [-8, 0, 8], // 남서
        [8, 0, 8], // 남동
      ];
      const newProteans = proteanTargets.map((target, i) => ({
        id: i,
        target,
      }));
      setProteans(newProteans);
    }, TIMELINE.DARKLIT_BRIGHT_HUNGER);

    // 프로틴 종료
    setTimeout(() => {
      setProteans([]);
    }, TIMELINE.DARKLIT_BRIGHT_HUNGER + 3000);

    // 39.9초: Spirit Taker (산개) - Oracle이 랜덤 위치로 점프
    setTimeout(() => {
      console.log("Spirit Taker!");
      startCast("Spirit Taker", "Oracle of Darkness", 1500, "#cc00ff");
      showMechanic(
        "Spirit Taker",
        "산개! 다른 플레이어와 겹치지 마세요!",
        "danger",
        2000
      );
      if (characterRef.current) {
        const pos = characterRef.current.position;
        setSpiritTaker({ target: [pos.x, 0, pos.z] });
      }
    }, TIMELINE.DARKLIT_SPIRIT_TAKER);

    // Spirit Taker 종료
    setTimeout(() => {
      setSpiritTaker(null);
    }, TIMELINE.DARKLIT_SPIRIT_TAKER + 2000);

    // 44.9초: Hallowed Wings + Dark Water (랜덤 방향)
    setTimeout(() => {
      console.log("Hallowed Wings + Dark Water III!");
      startCast("Hallowed Wings", "Oracle of Darkness", 2000, "#ff4488");
      showMechanic(
        "Hallowed Wings + Dark Water",
        "반쪽 피하고 + 쉐어 뭉치기!",
        "danger",
        2500
      );
      const side = Math.random() > 0.5 ? "left" : "right";
      setHallowedSide(side);
      // Dark Water III - 안전지대 중앙에 생성
      const safeX = side === "left" ? 10 : -10;
      setDarkWater({ position: [safeX, 0, 0] });
    }, TIMELINE.DARKLIT_HALLOWED_WINGS);

    // Dark Water 종료
    setTimeout(() => {
      setDarkWater(null);
    }, TIMELINE.DARKLIT_HALLOWED_WINGS + 2500);

    // 48.5초: Somber Dance (멀리) - 탱커가 가장 먼 곳으로 유도
    setTimeout(() => {
      console.log("Somber Dance - 멀리! (탱버)");
      startCast("Somber Dance", "Oracle of Darkness", 1500, "#ff6600");
      showMechanic(
        "Somber Dance (Far)",
        "탱커가 멀리! 다른 사람은 피하세요!",
        "warning",
        2000
      );
      // Oracle이 중앙으로 이동 시작
      setOracleTarget([0, 1.25, 0]);
      setOraclePos([0, 1.25, 0]);
      // 탱커가 맵 끝으로 (Hallowed Wings 안전지대 반대쪽)
      setSomberTarget([18, 0, 0]); // 동쪽 끝
      setSomberType("far");
    }, TIMELINE.DARKLIT_SOMBER_FAR);

    // 51.8초: Somber Dance (가까이) - 탱커가 Oracle 가까이로
    setTimeout(() => {
      console.log("Somber Dance - 가까이! (탱버)");
      startCast("Somber Dance", "Oracle of Darkness", 1500, "#ff6600");
      showMechanic(
        "Somber Dance (Close)",
        "탱커가 가까이! 다른 사람은 피하세요!",
        "warning",
        2000
      );
      setSomberTarget([2, 0, 0]); // Oracle 근처
      setSomberType("close");
    }, TIMELINE.DARKLIT_SOMBER_CLOSE);

    // Somber Dance 종료
    setTimeout(() => {
      setSomberType(null);
    }, TIMELINE.DARKLIT_SOMBER_CLOSE + 2500);

    // 55.2초: Edge of Oblivion 2
    setTimeout(() => {
      console.log("Edge of Oblivion 2!");
      startCast("Edge of Oblivion", "Usurper of Frost", 800, "#8844ff");
      showMechanic("Edge of Oblivion", "전체 공격 - 힐 체크!", "warning", 1000);
      setShowRaidwide(true);
    }, TIMELINE.EDGE_OF_OBLIVION_2);

    // 56.7초: 보스 중앙 이동 (Akh Morn 준비)
    setTimeout(() => {
      console.log("보스 중앙 이동 - Akh Morn 준비!");
      setBossTarget([0, 1.25, -3]); // Ryne 북쪽 중앙
      setOracleTarget([0, 1.25, 3]); // Oracle 남쪽 중앙
      setOraclePos([0, 1.25, 3]);
    }, TIMELINE.BOSS_TO_CENTER_2);

    // 58.7초: Akh Morn (라이트파티 쉐어)
    setTimeout(() => {
      console.log("Akh Morn!");
      startCast("Akh Morn", "Dual Cast", 2000, "#ff4444");
      showMechanic(
        "Akh Morn",
        "라이트파티 쉐어! LP1 북, LP2 남!",
        "danger",
        4000
      );
      setAkhMorn({ hits: 4 });
    }, TIMELINE.AKH_MORN_1);

    // Akh Morn 종료
    setTimeout(() => {
      setAkhMorn(null);
    }, TIMELINE.AKH_MORN_1 + 4000);

    // 63.7초: Morn Afah (전체 쉐어)
    setTimeout(() => {
      console.log("Morn Afah!");
      startCast("Morn Afah", "Dual Cast", 2000, "#ff8800");
      showMechanic(
        "Morn Afah",
        "전체 쉐어! 중앙 집합! (HP 체크)",
        "danger",
        3000
      );
      setMornAfah(true);
    }, TIMELINE.MORN_AFAH_1);

    // Morn Afah 종료
    setTimeout(() => {
      setMornAfah(false);
    }, TIMELINE.MORN_AFAH_1 + 3000);

    // ===== Crystallize Time =====

    // 67.7초: Crystallize Time 시작
    setTimeout(() => {
      console.log("Crystallize Time!");
      startCast("Crystallize Time", "Dual Cast", 3000, "#00ccff");
      showMechanic(
        "Crystallize Time",
        "시간 결정화! 디버프 확인!",
        "danger",
        4000
      );
    }, TIMELINE.CRYSTALLIZE_TIME);

    // 69.7초: 모래시계 6개 생성
    setTimeout(() => {
      console.log("Hourglasses spawn!");
      const hourglassData: {
        id: number;
        position: [number, number, number];
        type: "yellow" | "purple" | "untethered";
      }[] = [
        { id: 0, position: [0, 0, -15], type: "yellow" }, // 북 (Yellow)
        { id: 1, position: [0, 0, 15], type: "yellow" }, // 남 (Yellow)
        { id: 2, position: [-12, 0, -8], type: "purple" }, // 북서 (Purple)
        { id: 3, position: [12, 0, 8], type: "purple" }, // 남동 (Purple)
        { id: 4, position: [12, 0, -8], type: "untethered" }, // 북동
        { id: 5, position: [-12, 0, 8], type: "untethered" }, // 남서
      ];
      setHourglasses(hourglassData);
    }, TIMELINE.CRYSTALLIZE_HOURGLASSES);

    // 모래시계 종료
    setTimeout(() => {
      setHourglasses([]);
    }, TIMELINE.CRYSTALLIZE_HOURGLASSES + 8000);

    // 09:12: 디버프 폭발 (Water, Aero, Eruption, Blizzard)
    setTimeout(() => {
      console.log("Dark Debuffs!");
      showMechanic("Debuffs", "디버프 처리! 위치 확인!", "danger", 3000);
      setDarkDebuffs([
        { id: 0, position: [-8, 0, -8], type: "water" },
        { id: 1, position: [8, 0, -8], type: "aero" },
        { id: 2, position: [-8, 0, 8], type: "eruption" },
        { id: 3, position: [8, 0, 8], type: "blizzard" },
      ]);
    }, TIMELINE.CRYSTALLIZE_DEBUFFS);

    setTimeout(() => {
      setDarkDebuffs([]);
    }, TIMELINE.CRYSTALLIZE_DEBUFFS + 4000);

    // 73.7초: 용 머리 이동
    setTimeout(() => {
      console.log("Dragon Heads spawn!");
      showMechanic(
        "Dragon Heads",
        "용 머리 이동! Wormclaw는 터뜨려서 정화!",
        "warning",
        3000
      );
      const dragons: {
        id: number;
        start: [number, number, number];
        end: [number, number, number];
      }[] = [
        { id: 0, start: [0, 0, -18], end: [-10, 0, 0] }, // 북 → 서
        { id: 1, start: [0, 0, -18], end: [10, 0, 0] }, // 북 → 동
      ];
      setDragonHeads(dragons);
    }, TIMELINE.CRYSTALLIZE_DRAGONS);

    // 용 머리 종료
    setTimeout(() => {
      setDragonHeads([]);
    }, TIMELINE.CRYSTALLIZE_DRAGONS + 4000);

    // 77.7초: 엑사플레어
    setTimeout(() => {
      console.log("Exaflares!");
      showMechanic("Exaflare", "직선 장판 이동! 피하세요!", "danger", 4000);
      const exas: {
        id: number;
        start: [number, number, number];
        direction: "north" | "south" | "east" | "west";
      }[] = [
        { id: 0, start: [-18, 0, 0], direction: "east" },
        { id: 1, start: [0, 0, -18], direction: "south" },
      ];
      setExaflares(exas);
    }, TIMELINE.CRYSTALLIZE_EXAFLARE);

    // 엑사플레어 종료
    setTimeout(() => {
      setExaflares([]);
    }, TIMELINE.CRYSTALLIZE_EXAFLARE + 5000);

    // 81.7초: 되감기
    setTimeout(() => {
      console.log("Rewind!");
      showMechanic("Rewind", "되감기! 안전지대로 이동!", "danger", 3000);
      const rewinds: { id: number; position: [number, number, number] }[] = [
        { id: 0, position: [-8, 0, -8] }, // 북서
      ];
      setReturnPoints(rewinds);
    }, TIMELINE.CRYSTALLIZE_REWIND);

    // 되감기 종료
    setTimeout(() => {
      setReturnPoints([]);
    }, TIMELINE.CRYSTALLIZE_REWIND + 7000);

    // ===== Crystallize Time 내부 추가 기믹 =====

    // 09:16: Unholy Darkness
    setTimeout(() => {
      console.log("Unholy Darkness!");
      showMechanic(
        "Unholy Darkness",
        "다크 홀리! 쉐어 위치로!",
        "danger",
        2000
      );
      setUnholyDarkness([{ id: 0, position: [0, 0, 0] }]);
    }, TIMELINE.CRYSTALLIZE_UNHOLY);

    setTimeout(() => {
      setUnholyDarkness([]);
    }, TIMELINE.CRYSTALLIZE_UNHOLY + 3000);

    // 09:20: Tidal Light #1
    setTimeout(() => {
      console.log("Tidal Light #1!");
      showMechanic("Tidal Light", "빛의 너울! 동→서 스윕!", "danger", 3000);
      setTidalLights([{ id: 0, direction: "east" }]);
    }, TIMELINE.CRYSTALLIZE_TIDAL_1);

    setTimeout(() => {
      setTidalLights([]);
    }, TIMELINE.CRYSTALLIZE_TIDAL_1 + 3000);

    // 09:26: Tidal Light #2
    setTimeout(() => {
      console.log("Tidal Light #2!");
      showMechanic("Tidal Light", "빛의 너울! 서→동 스윕!", "danger", 3000);
      setTidalLights([{ id: 1, direction: "west" }]);
    }, TIMELINE.CRYSTALLIZE_TIDAL_2);

    setTimeout(() => {
      setTidalLights([]);
    }, TIMELINE.CRYSTALLIZE_TIDAL_2 + 3000);

    // 09:30: Quietus
    setTimeout(() => {
      console.log("Quietus!");
      startCast("Quietus", "Dual Cast", 2000, "#9900ff");
      showMechanic("Quietus", "종지부! 전체 대미지!", "danger", 3000);
      setShowQuietus(true);
    }, TIMELINE.CRYSTALLIZE_QUIETUS);

    setTimeout(() => {
      setShowQuietus(false);
    }, TIMELINE.CRYSTALLIZE_QUIETUS + 3000);

    // ===== 5. 후반 Hallowed Wings (09:36 ~ 09:46) =====

    // 09:36: Spirit Taker (후반)
    setTimeout(() => {
      console.log("Post-Crystallize Spirit Taker!");
      startCast("Spirit Taker", "Oracle of Darkness", 1500, "#cc00ff");
      showMechanic("Spirit Taker", "산개! Oracle 대상 공격!", "danger", 2000);
      setPostSpiritTaker({ target: [5, 0, 5] });
    }, TIMELINE.POST_SPIRIT_TAKER);

    setTimeout(() => {
      setPostSpiritTaker(null);
    }, TIMELINE.POST_SPIRIT_TAKER + 2000);

    // 09:41: Hallowed Wings #1
    setTimeout(() => {
      console.log("Post Hallowed Wings #1!");
      startCast("Hallowed Wings", "Usurper of Frost", 1500, "#ffffff");
      showMechanic(
        "Hallowed Wings",
        "신성한 날개! 안전지대로!",
        "danger",
        2000
      );
      setPostHallowed("left");
    }, TIMELINE.POST_HALLOWED_1);

    setTimeout(() => {
      setPostHallowed(null);
    }, TIMELINE.POST_HALLOWED_1 + 2000);

    // 09:46: Hallowed Wings #2
    setTimeout(() => {
      console.log("Post Hallowed Wings #2!");
      startCast("Hallowed Wings", "Usurper of Frost", 1500, "#ffffff");
      showMechanic(
        "Hallowed Wings",
        "신성한 날개 연속! 반대로!",
        "danger",
        2000
      );
      setPostHallowed("right");
    }, TIMELINE.POST_HALLOWED_2);

    setTimeout(() => {
      setPostHallowed(null);
    }, TIMELINE.POST_HALLOWED_2 + 2000);

    // ===== 6. Akh Morn #2 (09:56 ~ 10:06) =====

    // 09:56: Akh Morn #2
    setTimeout(() => {
      console.log("Akh Morn #2!");
      startCast("Akh Morn", "Dual Cast", 2000, "#ff4444");
      showMechanic(
        "Akh Morn",
        "라이트파티 쉐어! LP1 북, LP2 남!",
        "danger",
        4000
      );
      setAkhMorn2({ hits: 4 });
    }, TIMELINE.AKH_MORN_2);

    setTimeout(() => {
      setAkhMorn2(null);
    }, TIMELINE.AKH_MORN_2 + 4000);

    // 10:03: Edge of Oblivion #3
    setTimeout(() => {
      console.log("Edge of Oblivion #3!");
      startCast("Edge of Oblivion", "Usurper of Frost", 800, "#8844ff");
      showMechanic("Edge of Oblivion", "전체 공격!", "warning", 1000);
      setShowRaidwide(true);
    }, TIMELINE.EDGE_OF_OBLIVION_3);

    // 10:06: Morn Afah #2
    setTimeout(() => {
      console.log("Morn Afah #2!");
      startCast("Morn Afah", "Dual Cast", 2000, "#ff8800");
      showMechanic("Morn Afah", "전체 쉐어! 중앙 집합!", "danger", 3000);
      setMornAfah2(true);
    }, TIMELINE.MORN_AFAH_2);

    setTimeout(() => {
      setMornAfah2(false);
    }, TIMELINE.MORN_AFAH_2 + 3000);

    // ===== 7. 전멸기 (10:17) =====
    setTimeout(() => {
      console.log("ENRAGE - Absolute Zero / Memory's End!");
      startCast("Absolute Zero", "Dual Cast", 5000, "#00ccff");
      showMechanic("전멸기", "시간 내 클리어 필요!", "danger", 5000);
      setShowEnrage(true);
    }, TIMELINE.ENRAGE);
  }, [spawnAoeAtPlayer, startCast, showMechanic, onTimelineStart]);

  return (
    <GameScene
      backgroundColor="#1a1a2e"
      onCharacterRef={(mesh) => (characterRef.current = mesh)}
    >
      <EdenGround />

      {/* 린 (Usurper of Frost) */}
      {phase !== "waiting" && (
        <Boss
          name="Usurper of Frost"
          color="#88ccff"
          position={[0, 1.25, -8]}
          targetPosition={bossTarget}
          moveSpeed={8}
          spawnDelay={500}
          onSpawned={handleBossSpawned}
          onArrived={() => console.log("보스 도착!")}
        />
      )}

      {/* Oracle of Darkness (어둠의 무녀) */}
      {showOracle && (
        <Boss
          name="Oracle of Darkness"
          color="#9933ff"
          position={[0, 1.25, 8]}
          targetPosition={oracleTarget}
          moveSpeed={6}
          spawnDelay={300}
          onSpawned={() => console.log("어둠의 무녀 등장!")}
          onArrived={() => console.log("어둠의 무녀 도착!")}
        />
      )}

      {/* AOE 장판들 - Akh Rhai */}
      {aoeMarkers.map((aoe) => (
        <AoeCircle
          key={aoe.id}
          position={aoe.position}
          radius={5}
          color="#ff6b6b"
          delay={5100}
          duration={5600}
          onExplode={() => {
            console.log("Akh Rhai 폭발!");
            setTimeout(() => removeAoe(aoe.id), 500);
          }}
        />
      ))}

      {/* 타워들 - Bright Hunger */}
      {towers.map((tower) => (
        <Tower
          key={tower.id}
          position={tower.position}
          radius={2.5}
          color="#ffcc00"
          delay={3000}
          duration={3500}
          onExplode={() => {
            console.log("타워 폭발!");
            setTimeout(() => removeTower(tower.id), 500);
          }}
        />
      ))}

      {/* Hallowed Wings - 반쪽 공격 */}
      {hallowedSide && (
        <HallowedWings
          side={hallowedSide}
          color="#ff4488"
          delay={2000}
          duration={2500}
          onExplode={() => {
            console.log(`Hallowed Wings ${hallowedSide} 폭발!`);
            setTimeout(() => setHallowedSide(null), 500);
          }}
        />
      )}

      {/* Somber Dance - 탱버 (Oracle이 점프) */}
      {somberType && (
        <>
          {/* NPC 탱커 위치 가이드 */}
          <NpcMarker
            position={[somberTarget[0], 1, somberTarget[2]]}
            color="#00ff88"
            label="MT"
          />
          <SomberDance
            type={somberType}
            bossPosition={oraclePos}
            targetPosition={somberTarget}
            color="#ff6600"
            delay={1500}
            duration={2000}
            aoeRadius={4}
            onExplode={() => {
              console.log(`Somber Dance ${somberType} 폭발!`);
            }}
          />
        </>
      )}

      {/* Path of Light (프로틴 4방향) - Ryne 중앙에서 시전 */}
      {proteans.map((protean) => (
        <PathOfLight
          key={protean.id}
          bossPosition={[0, 1.25, 0]} // Ryne 중앙 위치
          targetPosition={protean.target}
          color="#ffff00"
          delay={3000}
          duration={3500}
          coneAngle={Math.PI / 4} // 45도 (4방향이므로 각도 줄임)
          radius={20}
          onExplode={() => console.log(`프로틴 ${protean.id} 폭발!`)}
        />
      ))}

      {/* Spirit Taker - 산개 기믹 */}
      {spiritTaker && (
        <SpiritTaker
          bossPosition={oraclePos}
          targetPosition={spiritTaker.target}
          color="#cc00ff"
          delay={1500}
          duration={2000}
          radius={5}
          onExplode={() => console.log("Spirit Taker 폭발!")}
        />
      )}

      {/* Dark Water III - 쉐어 기믹 */}
      {darkWater && (
        <DarkWater
          position={darkWater.position}
          color="#4466ff"
          delay={2000}
          duration={2500}
          radius={4}
          onExplode={() => console.log("Dark Water III 폭발!")}
        />
      )}

      {/* Akh Morn - 라이트파티 쉐어 */}
      {akhMorn && (
        <AkhMorn
          northPosition={[0, 0.03, -6]}
          southPosition={[0, 0.03, 6]}
          hits={akhMorn.hits}
          color="#ff4444"
          castTime={2000}
          duration={4000}
          radius={4}
          onComplete={() => console.log("Akh Morn 완료!")}
        />
      )}

      {/* Morn Afah - 전체 쉐어 */}
      {mornAfah && (
        <MornAfah
          position={[0, 0.03, 0]}
          color="#ff8800"
          castTime={2000}
          duration={3000}
          radius={6}
          onComplete={() => console.log("Morn Afah 완료!")}
        />
      )}

      {/* ===== Crystallize Time 기믹들 ===== */}

      {/* 모래시계 */}
      {hourglasses.map((hg) => (
        <Hourglass
          key={hg.id}
          position={hg.position}
          type={hg.type}
          delay={6000}
          duration={8000}
          radius={6}
          onExplode={() => console.log(`Hourglass ${hg.id} 폭발!`)}
        />
      ))}

      {/* 용 머리 */}
      {dragonHeads.map((dragon) => (
        <DragonHead
          key={dragon.id}
          startPosition={dragon.start}
          endPosition={dragon.end}
          moveTime={3000}
          duration={4000}
          onPopped={(pos) => console.log(`Dragon ${dragon.id} popped at`, pos)}
        />
      ))}

      {/* 엑사플레어 */}
      {exaflares.map((exa) => (
        <Exaflare
          key={exa.id}
          startPosition={exa.start}
          direction={exa.direction}
          count={5}
          interval={500}
          radius={3}
          duration={5000}
        />
      ))}

      {/* 되감기 위치 */}
      {returnPoints.map((rp) => (
        <ReturnPoint
          key={rp.id}
          position={rp.position}
          countdown={6000}
          duration={7000}
          radius={2}
          onRewind={() => console.log("Rewind triggered!")}
        />
      ))}

      {/* ===== 추가 Crystallize Time 기믹들 ===== */}

      {/* Tidal Light (빛의 너울) */}
      {tidalLights.map((tl) => (
        <TidalLight
          key={tl.id}
          direction={tl.direction}
          castTime={2000}
          duration={3000}
          width={20}
          onExplode={() => console.log(`Tidal Light ${tl.id} 폭발!`)}
        />
      ))}

      {/* Unholy Darkness (다크 홀리) */}
      {unholyDarkness.map((ud) => (
        <UnholyDarkness
          key={ud.id}
          position={ud.position}
          castTime={2000}
          duration={3000}
          radius={6}
          onExplode={() => console.log("Unholy Darkness 폭발!")}
        />
      ))}

      {/* Quietus (종지부) */}
      {showQuietus && (
        <Quietus
          castTime={2000}
          duration={3000}
          onComplete={() => console.log("Quietus 완료!")}
        />
      )}

      {/* Dark Debuffs (디버프 폭발) */}
      {darkDebuffs.map((dd) => (
        <DarkDebuff
          key={dd.id}
          position={dd.position}
          type={dd.type}
          delay={3000}
          duration={4000}
          radius={5}
          onExplode={() => console.log(`Dark ${dd.type} 폭발!`)}
        />
      ))}

      {/* ===== 후반 기믹들 ===== */}

      {/* 후반 Spirit Taker */}
      {postSpiritTaker && (
        <SpiritTaker
          bossPosition={oraclePos}
          targetPosition={postSpiritTaker.target}
          color="#cc00ff"
          delay={1500}
          duration={2000}
          radius={5}
          onExplode={() => console.log("Post Spirit Taker 폭발!")}
        />
      )}

      {/* 후반 Hallowed Wings */}
      {postHallowed && (
        <HallowedWings
          side={postHallowed}
          color="#ffffff"
          delay={1500}
          duration={2000}
          onExplode={() =>
            console.log(`Post Hallowed Wings ${postHallowed} 폭발!`)
          }
        />
      )}

      {/* Akh Morn #2 */}
      {akhMorn2 && (
        <AkhMorn
          northPosition={[0, 0.03, -6]}
          southPosition={[0, 0.03, 6]}
          hits={akhMorn2.hits}
          color="#ff4444"
          castTime={2000}
          duration={4000}
          radius={4}
          onComplete={() => console.log("Akh Morn #2 완료!")}
        />
      )}

      {/* Morn Afah #2 */}
      {mornAfah2 && (
        <MornAfah
          position={[0, 0.03, 0]}
          color="#ff8800"
          castTime={2000}
          duration={3000}
          radius={6}
          onComplete={() => console.log("Morn Afah #2 완료!")}
        />
      )}

      {/* 전멸기 (Enrage) */}
      {showEnrage && (
        <Enrage castTime={5000} onComplete={() => console.log("ENRAGE!")} />
      )}

      {/* 전체 공격 이펙트 */}
      {showRaidwide && (
        <Raidwide
          color="#8844ff"
          duration={800}
          onComplete={() => setShowRaidwide(false)}
        />
      )}
    </GameScene>
  );
}
