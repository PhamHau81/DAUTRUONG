export type GradeLevel = 'all' | '10' | '11' | '12';

export type QuestionLevel = 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao';

export interface LessonInfo {
  id: string;
  lessonNumber: number;
  title: string;
}

export interface ChapterInfo {
  id: string;
  chapterNumber: string; // e.g. "I", "II"
  title: string;
  lessons: LessonInfo[];
}

export interface Question {
  id: string;
  grade: '10' | '11' | '12';
  chapterId?: string;
  chapterTitle?: string;
  lessonId?: string;
  lessonTitle?: string;
  topic: string;
  level: QuestionLevel;
  content: string;
  options: [string, string, string, string];
  correctAnswer: 0 | 1 | 2 | 3;
  explanation: string;
}

export type GameId = 'millionaire' | 'wheel' | 'racer' | 'puzzle';

export interface GameInfo {
  id: GameId;
  title: string;
  subtitle: string;
  badge: string;
  iconName: string;
  gradient: string;
  description: string;
  features: string[];
}

export interface TeamScore {
  id: string;
  name: string;
  color: string;
  score: number;
}
