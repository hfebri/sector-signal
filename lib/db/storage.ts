// Simple file-based storage for development
// This will be replaced with a proper database in production

import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { BrandProfile, AnnualStrategy, MonthlyPlan, TacticalCampaign, CompetitorProfile, PerformanceMetrics } from './schema';

const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Generic storage functions
async function saveData<T>(filename: string, data: T[]): Promise<void> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

async function loadData<T>(filename: string): Promise<T[]> {
  try {
    await ensureDataDir();
    const filePath = path.join(DATA_DIR, filename);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Brand Profile operations
export async function saveBrandProfile(profile: Omit<BrandProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<BrandProfile> {
  const profiles = await loadBrandProfiles();
  const newProfile: BrandProfile = {
    ...profile,
    id: uuidv4(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  profiles.push(newProfile);
  await saveData('brand-profiles.json', profiles);
  return newProfile;
}

export async function loadBrandProfiles(): Promise<BrandProfile[]> {
  return loadData<BrandProfile>('brand-profiles.json');
}

export async function getBrandProfile(id: string): Promise<BrandProfile | null> {
  const profiles = await loadBrandProfiles();
  return profiles.find(p => p.id === id) || null;
}

export async function updateBrandProfile(id: string, updates: Partial<BrandProfile>): Promise<BrandProfile | null> {
  const profiles = await loadBrandProfiles();
  const index = profiles.findIndex(p => p.id === id);
  
  if (index === -1) return null;
  
  profiles[index] = {
    ...profiles[index],
    ...updates,
    updatedAt: new Date(),
  };
  
  await saveData('brand-profiles.json', profiles);
  return profiles[index];
}

// Annual Strategy operations
export async function saveAnnualStrategy(strategy: Omit<AnnualStrategy, 'id' | 'createdAt' | 'updatedAt'>): Promise<AnnualStrategy> {
  const strategies = await loadAnnualStrategies();
  const newStrategy: AnnualStrategy = {
    ...strategy,
    id: uuidv4(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  strategies.push(newStrategy);
  await saveData('annual-strategies.json', strategies);
  return newStrategy;
}

export async function loadAnnualStrategies(): Promise<AnnualStrategy[]> {
  return loadData<AnnualStrategy>('annual-strategies.json');
}

export async function getAnnualStrategy(id: string): Promise<AnnualStrategy | null> {
  const strategies = await loadAnnualStrategies();
  return strategies.find(s => s.id === id) || null;
}

export async function getAnnualStrategiesByBrand(brandId: string): Promise<AnnualStrategy[]> {
  const strategies = await loadAnnualStrategies();
  return strategies.filter(s => s.brandId === brandId);
}

// Monthly Plan operations
export async function saveMonthlyPlan(plan: Omit<MonthlyPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<MonthlyPlan> {
  const plans = await loadMonthlyPlans();
  const newPlan: MonthlyPlan = {
    ...plan,
    id: uuidv4(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  plans.push(newPlan);
  await saveData('monthly-plans.json', plans);
  return newPlan;
}

export async function loadMonthlyPlans(): Promise<MonthlyPlan[]> {
  return loadData<MonthlyPlan>('monthly-plans.json');
}

export async function getMonthlyPlansByBrand(brandId: string): Promise<MonthlyPlan[]> {
  const plans = await loadMonthlyPlans();
  return plans.filter(p => p.brandId === brandId);
}

// Tactical Campaign operations
export async function saveTacticalCampaign(campaign: Omit<TacticalCampaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<TacticalCampaign> {
  const campaigns = await loadTacticalCampaigns();
  const newCampaign: TacticalCampaign = {
    ...campaign,
    id: uuidv4(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  campaigns.push(newCampaign);
  await saveData('tactical-campaigns.json', campaigns);
  return newCampaign;
}

export async function loadTacticalCampaigns(): Promise<TacticalCampaign[]> {
  return loadData<TacticalCampaign>('tactical-campaigns.json');
}

export async function getTacticalCampaignsByBrand(brandId: string): Promise<TacticalCampaign[]> {
  const campaigns = await loadTacticalCampaigns();
  return campaigns.filter(c => c.brandId === brandId);
}

// Competitor Profile operations
export async function saveCompetitorProfile(profile: Omit<CompetitorProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<CompetitorProfile> {
  const profiles = await loadCompetitorProfiles();
  const newProfile: CompetitorProfile = {
    ...profile,
    id: uuidv4(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  profiles.push(newProfile);
  await saveData('competitor-profiles.json', profiles);
  return newProfile;
}

export async function loadCompetitorProfiles(): Promise<CompetitorProfile[]> {
  return loadData<CompetitorProfile>('competitor-profiles.json');
}

export async function getCompetitorProfilesByBrand(brandId: string): Promise<CompetitorProfile[]> {
  const profiles = await loadCompetitorProfiles();
  return profiles.filter(p => p.brandId === brandId);
}

// Performance Metrics operations
export async function savePerformanceMetrics(metrics: Omit<PerformanceMetrics, 'id' | 'createdAt'>): Promise<PerformanceMetrics> {
  const allMetrics = await loadPerformanceMetrics();
  const newMetrics: PerformanceMetrics = {
    ...metrics,
    id: uuidv4(),
    createdAt: new Date(),
  };
  
  allMetrics.push(newMetrics);
  await saveData('performance-metrics.json', allMetrics);
  return newMetrics;
}

export async function loadPerformanceMetrics(): Promise<PerformanceMetrics[]> {
  return loadData<PerformanceMetrics>('performance-metrics.json');
}

export async function getPerformanceMetricsByBrand(brandId: string): Promise<PerformanceMetrics[]> {
  const metrics = await loadPerformanceMetrics();
  return metrics.filter(m => m.brandId === brandId);
}