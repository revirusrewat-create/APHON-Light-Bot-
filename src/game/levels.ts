/**
 * Lightbot Camp Studio 3D - 12 Progressive Championship Levels
 * - Level 1: ด่านทดลองง่ายๆ เพื่อทำความคุ้นเคยกับระบบ 3 มิติ
 * - Level 2: เริ่มต้นกระบวนการคิด 2 ชั้น (Double-Layer Logic)
 * - Level 3-12: ไต่ระดับความท้าทายและความซับซ้อนขึ้นเรื่อยๆ จนครบทุกด่าน
 * - เน้นตัดสินผู้ชนะด้วย "เวลาที่เร็วที่สุด (Best Time)"
 */

import { LevelConfig } from './types';

export const LEVELS: LevelConfig[] = [
  // ==========================================
  // ด่านที่ 1: ด่านทดลองเริ่มต้น (Single-Layer Trial)
  // ==========================================
  {
    id: 1,
    name: 'ด่าน 1: ก้าวแรกสู่อวกาศ (ทดลองง่ายๆ)',
    gradeBracket: 'G1_3',
    gradeLabel: 'ป.1–ป.3',
    thinkingLayer: 'ระดับเริ่มต้น 1 ชั้น (ทำความคุ้นเคยระบบ 3D)',
    description: 'ด่านทดลองเดินหน้าและเปิดไฟบนพื้นระดับเดียว เพื่อเตรียมความพร้อมสู่การแข่งขัน',
    objective: 'สั่งการให้หุ่นยนต์เดินหน้าไปยังช่องเป้าหมายสีน้ำเงิน แล้วเปิดไฟให้สำเร็จ',
    gridSize: { width: 5, height: 5 },
    startPos: { x: 1, y: 1, height: 0, direction: 0 }, // North
    mainCapacity: 12,
    p1Capacity: 0,
    p2Capacity: 0,
    hasP1: false,
    hasP2: false,
    parBlocks: 3,
    parTimeSeconds: 30,
    tiles: [
      { x: 1, y: 1, height: 0, isLightTarget: false },
      { x: 1, y: 2, height: 0, isLightTarget: false },
      { x: 1, y: 3, height: 0, isLightTarget: true },
    ],
  },

  // ==========================================
  // ด่านที่ 2: เริ่มกระบวนการคิด 2 ชั้น (Double-Layer Logic)
  // ==========================================
  {
    id: 2,
    name: 'ด่าน 2: วงจรคิด 2 ชั้น (ทางเลี้ยวซ้อน)',
    gradeBracket: 'G1_3',
    gradeLabel: 'ป.1–ป.3',
    thinkingLayer: 'กระบวนการคิด 2 ชั้น (การวางแผนเลี้ยว 2 สเต็ป & หลบขอบเหว)',
    description: 'เพิ่มกระบวนการคิด 2 ชั้น! ต้องวางแผนการเลี้ยวและเดินสลับทิศทางอย่างแม่นยำ',
    objective: 'วางแผน 2 ขั้นตอน: นำหุ่นยนต์เลี้ยวและเดินไปยังเป้าหมาย 2 จุดโดยไม่ตกขอบสนาม',
    gridSize: { width: 6, height: 6 },
    startPos: { x: 1, y: 1, height: 0, direction: 0 }, // North
    mainCapacity: 14,
    p1Capacity: 0,
    p2Capacity: 0,
    hasP1: false,
    hasP2: false,
    parBlocks: 8,
    parTimeSeconds: 45,
    tiles: [
      { x: 1, y: 1, height: 0, isLightTarget: false },
      { x: 1, y: 2, height: 0, isLightTarget: false },
      { x: 1, y: 3, height: 0, isLightTarget: true },
      { x: 2, y: 3, height: 0, isLightTarget: false },
      { x: 3, y: 3, height: 0, isLightTarget: false },
      { x: 3, y: 2, height: 0, isLightTarget: false },
      { x: 3, y: 1, height: 0, isLightTarget: true },
    ],
  },

  // ==========================================
  // ด่านที่ 3: กระบวนการคิด 2 ชั้น + กระโดดต่างระดับ
  // ==========================================
  {
    id: 3,
    name: 'ด่าน 3: ซิกแซกสลับชั้น (Elevation Steps)',
    gradeBracket: 'G1_3',
    gradeLabel: 'ป.1–ป.3',
    thinkingLayer: 'กระบวนการคิด 2 ชั้น (คำนวณการกระโดดขึ้น-ลง ร่วมกับทิศทาง)',
    description: 'ผสมผสานการเลี้ยวกับการกระโดดข้ามระดับความสูง H.0 และ H.1',
    objective: 'ใช้คำสั่งกระโดดข้ามขั้นบันไดต่างระดับ พร้อมเลี้ยวเปิดไฟสัญญาณทั้ง 2 ตำแหน่ง',
    gridSize: { width: 6, height: 6 },
    startPos: { x: 1, y: 1, height: 0, direction: 1 }, // East
    mainCapacity: 14,
    p1Capacity: 0,
    p2Capacity: 0,
    hasP1: false,
    hasP2: false,
    parBlocks: 9,
    parTimeSeconds: 50,
    tiles: [
      { x: 1, y: 1, height: 0, isLightTarget: false },
      { x: 2, y: 1, height: 1, isLightTarget: false },
      { x: 3, y: 1, height: 1, isLightTarget: true },
      { x: 3, y: 2, height: 1, isLightTarget: false },
      { x: 3, y: 3, height: 0, isLightTarget: false },
      { x: 4, y: 3, height: 0, isLightTarget: true },
    ],
  },

  // ==========================================
  // ด่านที่ 4: วงจรดาวเรืองแสง 3 ทิศทาง
  // ==========================================
  {
    id: 4,
    name: 'ด่าน 4: หอคอยคู่ต่างมิติ (Twin Towers)',
    gradeBracket: 'G1_3',
    gradeLabel: 'ป.1–ป.3',
    thinkingLayer: 'กระบวนการคิด 2 ชั้น (การบริหารลำดับขั้นตอนเปิดไฟ 3 จุดสมมาตร)',
    description: 'สนามรูปตัวยูต่างระดับ 3 จุดไฟ ต้องจัดลำดับเดินหน้า เลี้ยว และกระโดดไม่ให้สะดุด',
    objective: 'เปิดไฟให้ครบทั้ง 3 จุดบนหอคอยทั้งสองฝั่งให้เร็วที่สุดเพื่อทำเวลาชนะเลิศ',
    gridSize: { width: 6, height: 6 },
    startPos: { x: 1, y: 1, height: 0, direction: 0 }, // North
    mainCapacity: 16,
    p1Capacity: 0,
    p2Capacity: 0,
    hasP1: false,
    hasP2: false,
    parBlocks: 11,
    parTimeSeconds: 60,
    tiles: [
      { x: 1, y: 1, height: 0, isLightTarget: false },
      { x: 1, y: 2, height: 1, isLightTarget: true },
      { x: 1, y: 3, height: 1, isLightTarget: false },
      { x: 2, y: 3, height: 0, isLightTarget: true },
      { x: 3, y: 3, height: 1, isLightTarget: false },
      { x: 3, y: 2, height: 1, isLightTarget: true },
    ],
  },

  // ==========================================
  // ด่านที่ 5: ช่วงชั้น ป.4-ป.6 - ปลดล็อค P1 & ด่านคำถามวิทยาการคำนวณ
  // ==========================================
  {
    id: 5,
    name: 'ด่าน 5: วงกตบันไดวน (Spiral Stairway)',
    gradeBracket: 'G4_6',
    gradeLabel: 'ป.4–ป.6',
    thinkingLayer: 'กระบวนการคิด 2 ชั้น (การแยกแพทเทิร์นซ้ำไปไว้ในฟังก์ชัน P1)',
    description: 'บันไดวนไต่ระดับความสูง H.0 -> H.1 -> H.2 พร้อมด่านคำถามวิทยาการคำนวณ ป.4 ระหว่างเดินผ่าน',
    objective: 'ไต่บันไดวนขึ้นสู่ยอดหอคอย ตอบคำถามวิทยาการคำนวณระหว่างทาง และเปิดไฟทั้ง 3 ตำแหน่ง',
    gridSize: { width: 6, height: 6 },
    startPos: { x: 1, y: 1, height: 0, direction: 1 }, // East
    mainCapacity: 12,
    p1Capacity: 8,
    p2Capacity: 0,
    hasP1: true,
    hasP2: false,
    parBlocks: 7,
    parTimeSeconds: 60,
    tiles: [
      { x: 1, y: 1, height: 0, isLightTarget: false },
      { x: 2, y: 1, height: 1, isLightTarget: true },
      { x: 3, y: 1, height: 1, isLightTarget: false, isQuizTrigger: true },
      { x: 3, y: 2, height: 2, isLightTarget: true },
      { x: 2, y: 2, height: 2, isLightTarget: false },
      { x: 1, y: 2, height: 2, isLightTarget: true },
    ],
  },

  // ==========================================
  // ด่านที่ 6: จตุรัสสลับระดับ
  // ==========================================
  {
    id: 6,
    name: 'ด่าน 6: จตุรัสสลับระดับ (Checkerboard Steps)',
    gradeBracket: 'G4_6',
    gradeLabel: 'ป.4–ป.6',
    thinkingLayer: 'กระบวนการคิด 2 ชั้น (การใช้ P1 วนรอบ 4 เสา)',
    description: 'ลานประลอง 4 เสาสัญญาณที่ต้องกระโดดและเลี้ยวเป็นจังหวะซ้ำๆ พร้อมคำถามวิทยาการคำนวณ',
    objective: 'เปิดไฟบนเสาสัญญาณทั้ง 4 ต้น และตอบคำถามวิทยาการคำนวณระหว่างเดินผ่าน',
    gridSize: { width: 6, height: 6 },
    startPos: { x: 2, y: 1, height: 0, direction: 0 }, // North
    mainCapacity: 12,
    p1Capacity: 8,
    p2Capacity: 0,
    hasP1: true,
    hasP2: false,
    parBlocks: 8,
    parTimeSeconds: 70,
    tiles: [
      { x: 2, y: 1, height: 0, isLightTarget: false },
      { x: 2, y: 2, height: 0, isLightTarget: false, isQuizTrigger: true },
      { x: 1, y: 2, height: 1, isLightTarget: true },
      { x: 3, y: 2, height: 1, isLightTarget: true },
      { x: 2, y: 3, height: 1, isLightTarget: true },
      { x: 2, y: 4, height: 2, isLightTarget: true },
    ],
  },

  // ==========================================
  // ด่านที่ 7: ปิรามิดสองแกน H.0 - H.3
  // ==========================================
  {
    id: 7,
    name: 'ด่าน 7: ปิรามิดสองแกน (Dual-Axis Citadel)',
    gradeBracket: 'G4_6',
    gradeLabel: 'ป.4–ป.6',
    thinkingLayer: 'กระบวนการคิด 3 ชั้น (การก้าวข้าม 3 มิติ และสลับขาขึ้น-ลง)',
    description: 'ปิรามิดความสูง 3 ระดับ (H.0 ถึง H.3) พร้อมจุดประลองตอบคำถามวิทยาการคำนวณ',
    objective: 'พิชิตยอดปิรามิด ตอบคำถามระหว่างทาง และเปิดไฟทั้ง 4 ตำแหน่งโดยใช้เวลาสั้นที่สุด',
    gridSize: { width: 7, height: 7 },
    startPos: { x: 1, y: 2, height: 0, direction: 1 }, // East
    mainCapacity: 14,
    p1Capacity: 8,
    p2Capacity: 0,
    hasP1: true,
    hasP2: false,
    parBlocks: 10,
    parTimeSeconds: 85,
    tiles: [
      { x: 1, y: 2, height: 0, isLightTarget: false },
      { x: 2, y: 2, height: 1, isLightTarget: true },
      { x: 3, y: 2, height: 2, isLightTarget: true, isQuizTrigger: true },
      { x: 4, y: 2, height: 3, isLightTarget: true },
      { x: 4, y: 3, height: 2, isLightTarget: false },
      { x: 4, y: 4, height: 1, isLightTarget: true },
    ],
  },

  // ==========================================
  // ด่านที่ 8: สะพานดาวกระจาย 4 ทิศ
  // ==========================================
  {
    id: 8,
    name: 'ด่าน 8: สะพานดาวกระจาย (Starlight Starburst)',
    gradeBracket: 'G4_6',
    gradeLabel: 'ป.4–ป.6',
    thinkingLayer: 'กระบวนการคิด 3 ชั้น (การทำ Subroutine ซ้ำแบบสมบูรณ์ 4 ทิศ)',
    description: 'สะพานรูปกากบาทต่างระดับ 4 ทิศ พร้อมจุดคำถามวิทยาการคำนวณ ณ ศูนย์กลาง',
    objective: 'ใช้ฟังก์ชันย่อย P1 สั่งการเปิดไฟประภาคารทั้ง 4 ทิศ และตอบคำถามวิทยาการคำนวณ',
    gridSize: { width: 7, height: 7 },
    startPos: { x: 3, y: 3, height: 0, direction: 0 }, // Center North
    mainCapacity: 12,
    p1Capacity: 8,
    p2Capacity: 0,
    hasP1: true,
    hasP2: false,
    parBlocks: 9,
    parTimeSeconds: 90,
    tiles: [
      { x: 3, y: 3, height: 0, isLightTarget: false, isQuizTrigger: true },
      // North
      { x: 3, y: 4, height: 1, isLightTarget: false },
      { x: 3, y: 5, height: 2, isLightTarget: true },
      // East
      { x: 4, y: 3, height: 1, isLightTarget: false },
      { x: 5, y: 3, height: 2, isLightTarget: true },
      // South
      { x: 3, y: 2, height: 1, isLightTarget: false },
      { x: 3, y: 1, height: 2, isLightTarget: true },
      // West
      { x: 2, y: 3, height: 1, isLightTarget: false },
      { x: 1, y: 3, height: 2, isLightTarget: true },
    ],
  },

  // ==========================================
  // ด่านที่ 9: ช่วงชั้น ม.1-ม.3 - ปลดล็อค P1 & P2
  // ==========================================
  {
    id: 9,
    name: 'ด่าน 9: สี่แยกอัลกอริทึม (Algorithmic Crossroad)',
    gradeBracket: 'G7_9',
    gradeLabel: 'ม.1–ม.3',
    thinkingLayer: 'กระบวนการคิดแบบโมดูลาร์ 2 ชั้น (การทำงานประสานกันของ P1 และ P2)',
    description: 'ปลดล็อค P1 และ P2 พร้อมด่านคำถามวิทยาการคำนวณ ม.1 เรื่อง Call Stack',
    objective: 'เปิดไฟสัญญาณทั้ง 4 จุดด้วย P1 และ P2 พร้อมตอบคำถามวิทยาการคำนวณระหว่างทาง',
    gridSize: { width: 7, height: 7 },
    startPos: { x: 2, y: 2, height: 0, direction: 0 }, // North
    mainCapacity: 12,
    p1Capacity: 8,
    p2Capacity: 8,
    hasP1: true,
    hasP2: true,
    parBlocks: 9,
    parTimeSeconds: 95,
    tiles: [
      { x: 2, y: 2, height: 0, isLightTarget: false },
      { x: 2, y: 3, height: 1, isLightTarget: true },
      { x: 2, y: 4, height: 2, isLightTarget: false, isQuizTrigger: true },
      { x: 3, y: 4, height: 2, isLightTarget: true },
      { x: 4, y: 4, height: 2, isLightTarget: false },
      { x: 4, y: 3, height: 1, isLightTarget: true },
      { x: 4, y: 2, height: 1, isLightTarget: false },
      { x: 3, y: 2, height: 0, isLightTarget: true },
    ],
  },

  // ==========================================
  // ด่านที่ 10: ป้อมปราการควอนตัม 5 จุดไฟ
  // ==========================================
  {
    id: 10,
    name: 'ด่าน 10: ป้อมปราการควอนตัม (Quantum Citadel)',
    gradeBracket: 'G7_9',
    gradeLabel: 'ม.1–ม.3',
    thinkingLayer: 'กระบวนการคิดโครงสร้างซ้อน (Nested Subroutines: P1 เรียก P2)',
    description: 'ป้อมปราการ 5 จุดไฟบนแท่นลอยฟ้า พร้อมด่านคำถามตรรกศาสตร์บูลีน ม.2',
    objective: 'เปิดไฟทั้ง 5 ตำแหน่ง ตอบคำถามตรรกศาสตร์ระหว่างเดินผ่าน และทำเวลาให้เร็วที่สุด',
    gridSize: { width: 7, height: 7 },
    startPos: { x: 1, y: 1, height: 0, direction: 1 }, // East
    mainCapacity: 14,
    p1Capacity: 8,
    p2Capacity: 8,
    hasP1: true,
    hasP2: true,
    parBlocks: 11,
    parTimeSeconds: 110,
    tiles: [
      { x: 1, y: 1, height: 0, isLightTarget: false },
      { x: 2, y: 1, height: 1, isLightTarget: true },
      { x: 3, y: 1, height: 1, isLightTarget: false, isQuizTrigger: true },
      { x: 4, y: 1, height: 2, isLightTarget: true },
      { x: 4, y: 2, height: 2, isLightTarget: false },
      { x: 4, y: 3, height: 3, isLightTarget: true },
      { x: 3, y: 3, height: 3, isLightTarget: false },
      { x: 2, y: 3, height: 2, isLightTarget: true },
      { x: 2, y: 2, height: 1, isLightTarget: true },
    ],
  },

  // ==========================================
  // ด่านที่ 11: เกลียวมังกร 3 มิติขั้นสูง 6 จุดไฟ
  // ==========================================
  {
    id: 11,
    name: 'ด่าน 11: เกลียวมังกรไฮเปอร์ (Hyper Dragon Helix)',
    gradeBracket: 'G7_9',
    gradeLabel: 'ม.1–ม.3',
    thinkingLayer: 'กระบวนการคิดขั้นสูง 4 ชั้น (ความต่างระดับ 6 จุดไฟ & การวนซ้ำเชิงลึก)',
    description: 'เส้นทางบันไดวน 6 จุดไฟสัญญาณ พร้อมโจทย์วิทยาการคำนวณ ม.3 เรื่องประสิทธิภาพอัลกอริทึม',
    objective: 'เปิดไฟให้ครบทั้ง 6 จุด ตอบโจทย์ประสิทธิภาพระหว่างเดินผ่าน และกวาดคะแนนสูงสุด',
    gridSize: { width: 8, height: 8 },
    startPos: { x: 1, y: 1, height: 0, direction: 0 }, // North
    mainCapacity: 14,
    p1Capacity: 8,
    p2Capacity: 8,
    hasP1: true,
    hasP2: true,
    parBlocks: 12,
    parTimeSeconds: 130,
    tiles: [
      { x: 1, y: 1, height: 0, isLightTarget: false },
      { x: 1, y: 2, height: 1, isLightTarget: true },
      { x: 1, y: 3, height: 1, isLightTarget: false, isQuizTrigger: true },
      { x: 1, y: 4, height: 2, isLightTarget: true },
      { x: 2, y: 4, height: 2, isLightTarget: false },
      { x: 3, y: 4, height: 3, isLightTarget: true },
      { x: 4, y: 4, height: 3, isLightTarget: false },
      { x: 5, y: 4, height: 2, isLightTarget: true },
      { x: 5, y: 3, height: 2, isLightTarget: false },
      { x: 5, y: 2, height: 1, isLightTarget: true },
      { x: 4, y: 2, height: 1, isLightTarget: false },
      { x: 3, y: 2, height: 0, isLightTarget: true },
    ],
  },

  // ==========================================
  // ด่านที่ 12: มหาศึกแชมเปี้ยนชิพ Apex (ด่านสุดท้ายแห่งเกียรติยศ)
  // ==========================================
  {
    id: 12,
    name: 'ด่าน 12: มหาศึกแชมเปี้ยนชิพ Apex (Grand Finale)',
    gradeBracket: 'G7_9',
    gradeLabel: 'ม.1–ม.3',
    thinkingLayer: 'สุดยอดกระบวนการคิดระดับแชมป์เปี้ยน (7 ประภาคารสูงสุดแห่งค่ายวิชาการ)',
    description: 'ด่านตัดสินผู้ชนะเลิศของค่าย! ประลองโจทย์วิทยาการคำนวณขั้นสูงระดับแชมป์เปี้ยน',
    objective: 'จุดประภาคารพลังงานครบทั้ง 7 จุด พิชิตคำถามวิทยาการคำนวณ และทำเวลาเร็วที่สุดเพื่อคว้าแชมป์!',
    gridSize: { width: 8, height: 8 },
    startPos: { x: 1, y: 1, height: 0, direction: 0 }, // North
    mainCapacity: 16,
    p1Capacity: 8,
    p2Capacity: 8,
    hasP1: true,
    hasP2: true,
    parBlocks: 14,
    parTimeSeconds: 150,
    tiles: [
      { x: 1, y: 1, height: 0, isLightTarget: false },
      { x: 1, y: 2, height: 1, isLightTarget: true },
      { x: 1, y: 3, height: 2, isLightTarget: true },
      { x: 2, y: 3, height: 2, isLightTarget: false, isQuizTrigger: true },
      { x: 3, y: 3, height: 3, isLightTarget: true },
      { x: 4, y: 3, height: 3, isLightTarget: false },
      { x: 5, y: 3, height: 2, isLightTarget: true },
      { x: 5, y: 2, height: 1, isLightTarget: true },
      { x: 4, y: 1, height: 1, isLightTarget: false },
      { x: 3, y: 1, height: 2, isLightTarget: true },
      { x: 2, y: 1, height: 0, isLightTarget: false },
      { x: 3, y: 2, height: 3, isLightTarget: true },
    ],
  },
];
