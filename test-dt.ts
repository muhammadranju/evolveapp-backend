import { DailyTrackingService } from './src/app/modules/appAthlete/dailyTracking/daily.tracking.service';
import mongoose from 'mongoose';
import config from './src/config';

async function main() {
  await mongoose.connect(config.database_url as string);
  const service = new DailyTrackingService();
  
  // Create dummy ids
  const userId = new mongoose.Types.ObjectId().toString();
  const coachId = new mongoose.Types.ObjectId().toString();
  
  const result = await service.getAllDailyTracking(userId, coachId, { date: '2026-06-07' });
  console.log("Week Data Dates:");
  result.weekData.forEach(d => console.log(d.date, d.day));
  
  mongoose.disconnect();
}

main().catch(console.error);
