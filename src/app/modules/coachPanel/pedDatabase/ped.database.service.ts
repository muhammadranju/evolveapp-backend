import { ICategory } from './ped.database.interface';
import { PEDDatabaseInfoModel } from './ped.database.model';

/* ---------- Utils ---------- */

const generateId = (name: string) =>
  name.trim().toLowerCase().replace(/\s+/g, '-');

/* ---------- Service ---------- */

export class PEDDatabaseService {
  async createWeeklyPEDDatabase(payload: {
    category: string;
    subCategory: { name: string }[];
  }) {
    const { category, subCategory } = payload;

    // ✅ Get or create SINGLE document
    let doc = await PEDDatabaseInfoModel.findOne();

    if (!doc) {
      doc = await PEDDatabaseInfoModel.create({
        categories: [],
      });
    }

    // ✅ Prepare subCategories
    const formattedSubCategories = subCategory.map(sub => ({
      id: generateId(sub.name),
      name: sub.name,
      dosage: '',
      frequency: '',
      mon: '',
      tue: '',
      wed: '',
      thu: '',
      fri: '',
      sat: '',
      sun: '',
    }));

    // ✅ Find category
    const existingCategory = doc.categories.find(
      (cat: ICategory) => cat.name === category
    );

    if (existingCategory) {
      // ✅ Add only NEW subcategories
      const existingNames = new Set(
        existingCategory.subCategory.map(sub => sub.name)
      );

      const newSubCategories = formattedSubCategories.filter(
        sub => !existingNames.has(sub.name)
      );

      existingCategory.subCategory.push(...newSubCategories);
    } else {
      // ✅ New category
      doc.categories.push({
        name: category,
        subCategory: formattedSubCategories,
      });
    }

    await doc.save();
    return doc;
  }

  async getPEDByWeek() {
    return PEDDatabaseInfoModel.findOne().lean();
  }

  async getAllPED() {
    return PEDDatabaseInfoModel.find().sort({ createdAt: 1 }).lean();
  }
}
