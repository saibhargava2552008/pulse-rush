export type Quality = 'low' | 'medium' | 'high';

export interface QualityProfile {
  pixelRatioCap: number;
  antialias: boolean;
  skyline: number;
  fogFar: number;
  runnerLight: boolean;
}

export const QUALITY: Record<Quality, QualityProfile> = {
  low: { pixelRatioCap: 1, antialias: false, skyline: 70, fogFar: 110, runnerLight: false },
  medium: { pixelRatioCap: 1.5, antialias: true, skyline: 120, fogFar: 150, runnerLight: true },
  high: { pixelRatioCap: 2, antialias: true, skyline: 180, fogFar: 175, runnerLight: true },
};
