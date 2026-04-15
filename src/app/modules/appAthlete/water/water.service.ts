import { IWater } from './water.interface';
import { Water } from './water.model';

// helper to format today's date YYYY-MM-DD
const getTodayDate = (): string => {
  const swissDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Zurich',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  return swissDate; // YYYY-MM-DD format
};

const createWaterToDB = async (payload: IWater) => {
  const waterData: IWater = {
    ...payload,
    date: payload.date,
    // date: getTodayDate(),
  };

  const result = await Water.create(waterData);
  return result;
};

const getAllWaterFromDB = async (userId: string, date?: string) => {
  const filter: any = { userId };
  if (date) {
    filter.date = date;
  }
  return await Water.find(filter).sort({ createdAt: -1 });
};

const getSingleWaterFromDB = async (id: string) => {
  return await Water.findById(id);
};

const updateWaterInDB = async (id: string, payload: Partial<IWater>) => {
  return await Water.findByIdAndUpdate(id, payload, {
    new: true,
  });
};

const deleteWaterFromDB = async (id: string) => {
  return await Water.findByIdAndDelete(id);
};

export const WaterService = {
  createWaterToDB,
  getAllWaterFromDB,
  getSingleWaterFromDB,
  updateWaterInDB,
  deleteWaterFromDB,
};
