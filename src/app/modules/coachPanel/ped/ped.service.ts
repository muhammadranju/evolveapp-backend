import mongoose from 'mongoose';
import { ICategory } from './ped.interface';
import { PEDDatabaseModel } from './ped.model';

/* ---------- Utils ---------- */

const isSundayEvening = () => {
  const now = new Date();
  return now.getDay() === 0 && now.getHours() >= 18;
};

const getNextWeekLabel = (week: string) => {
  const num = Number(week.split('_')[1]);
  return `week_${num + 1}`;
};

const getWeekDateRange = () => {
  const now = new Date();

  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay() + 1); // Monday
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  return { start, end };
};

function mergeTemplateWithExisting(templateCats: any[], existingCats: any[]) {
  const existingMap = new Map(existingCats.map(cat => [cat.name, cat]));

  return templateCats.map(templateCat => {
    const existingCat = existingMap.get(templateCat.name);

    // 🟢 New Category → Add Full Template Category
    if (!existingCat) {
      return structuredClone(templateCat);
    }

    // 🟡 Merge SubCategories
    const existingSubMap = new Map(
      existingCat.subCategories.map((sub: any) => [sub.name, sub]),
    );

    const mergedSub = templateCat.subCategories.map((templateSub: any) => {
      return existingSubMap.get(templateSub.name)
        ? existingSubMap.get(templateSub.name) // keep athlete data
        : structuredClone(templateSub); // add new sub
    });

    return {
      ...existingCat,
      subCategories: mergedSub,
    };
  });
}

/* ---------- Service ---------- */

export class PEDDatabaseService {
  async createOrUpdatePEDTemplate(payload: {
    category: string;
    subCategory: { name: string }[];
  }) {
    const { category, subCategory } = payload;

    // 1️⃣ Get template doc
    let pedDoc = await PEDDatabaseModel.findOne({ isTemplate: true });

    // 2️⃣ Create template only once
    if (!pedDoc) {
      pedDoc = await PEDDatabaseModel.create({
        isTemplate: true,
        categories: [],
      });
    }

    // 3️⃣ Format subCategories
    const formattedSubCategories = subCategory.map(sub => ({
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

    // 4️⃣ Find category in template
    const existingCategory = pedDoc.categories.find(
      (cat: any) => cat.name === category,
    );

    let newlyAddedCategory = null;
    let newlyAddedSubs: any[] = [];

    if (existingCategory) {
      const existingNames = new Set(
        existingCategory.subCategory.map((sub: any) => sub.name),
      );

      newlyAddedSubs = formattedSubCategories.filter(
        sub => !existingNames.has(sub.name),
      );

      if (newlyAddedSubs.length > 0) {
        existingCategory.subCategory.push(...newlyAddedSubs);
      }
    } else {
      newlyAddedCategory = {
        name: category,
        isActive: true, // Defaulting to true as per new requirement
        subCategory: formattedSubCategories,
      };

      pedDoc.categories.push(newlyAddedCategory);
    }

    await pedDoc.save();

    // ⭐⭐⭐ IMPORTANT PART ⭐⭐⭐
    // Update all athlete documents

    // Get all athlete docs (exclude template)
    const athleteDocs = await PEDDatabaseModel.find({
      isTemplate: { $ne: true },
    });

    for (const doc of athleteDocs) {
      // 👉 If NEW CATEGORY added
      if (newlyAddedCategory) {
        doc.categories.push(structuredClone(newlyAddedCategory));
      }

      // 👉 If NEW SUBCATEGORY added
      if (newlyAddedSubs.length > 0) {
        const targetCat = doc.categories.find((c: any) => c.name === category);

        if (targetCat) {
          const existingSubNames = new Set(
            targetCat.subCategory.map((s: any) => s.name),
          );

          const subsToAdd = newlyAddedSubs.filter(
            sub => !existingSubNames.has(sub.name),
          );

          if (subsToAdd.length > 0) {
            targetCat.subCategory.push(...structuredClone(subsToAdd));
          }
        }
      }

      await doc.save();
    }

    return pedDoc;
  }

  /**
   * Create athlete PED data from template
   */
  async createFromTemplate(athleteId: string, coachId: string, week: string) {
    const template = await PEDDatabaseModel.findOne().lean();

    if (!template) throw new Error('PED template not found');

    return PEDDatabaseModel.create({
      athleteId,
      coachId,
      week,
      categories: structuredClone(template.categories),
    });
  }

  async getPEDByWeek(week: string) {
    return PEDDatabaseModel.findOne({ week }).lean();
  }

  async getAllPED() {
    return PEDDatabaseModel.findOne({ week: '' }).sort({ createdAt: 1 }).lean();
  }

  async getAllPEDForApp(athleteId: string, week?: string) {
    const query: any = { athleteId };

    if (week) {
      query.week = week;
    }

    return PEDDatabaseModel.find(query)
      .sort({ createdAt: -1 }) // latest first
      .lean();
  }

  /**
   * Get PED data for athlete
   * If athlete-specific data doesn't exist,
   * create it from template
   */
  async getOrCreateForAthlete(athleteId: string, coachId: string) {
    // 1️⃣ Latest record
    const latestRecord = await PEDDatabaseModel.findOne({
      athleteId,
      coachId,
    }).sort({ createdAt: -1 });

    let week: string;

    // ✅ First Ever Record
    if (!latestRecord) {
      week = 'week_1';
    }
    // ✅ Only Sunday Evening → New Week
    else if (isSundayEvening()) {
      week = getNextWeekLabel(latestRecord.week);
    }
    // ❌ Other Days → Return Latest
    else {
      return latestRecord;
    }

    // 2️⃣ Prevent multiple creation in same week date range
    const { start, end } = getWeekDateRange();

    const alreadyCreatedThisWeek = await PEDDatabaseModel.findOne({
      athleteId,
      coachId,
      createdAt: {
        $gte: start,
        $lt: end,
      },
    });

    if (alreadyCreatedThisWeek) return alreadyCreatedThisWeek;

    // 3️⃣ Check if week already exists
    let record = await PEDDatabaseModel.findOne({
      athleteId,
      coachId,
      week,
    });

    if (record) return record;

    // 4️⃣ Get main template
    const template = await PEDDatabaseModel.findOne().lean();
    if (!template) throw new Error('PED template not found');

    // 5️⃣ Merge template with athlete last data
    let mergedCategories = template.categories;

    if (latestRecord) {
      mergedCategories = mergeTemplateWithExisting(
        template.categories,
        latestRecord.categories,
      );
    }

    // 6️⃣ Create record
    record = await PEDDatabaseModel.create({
      athleteId,
      coachId,
      week,
      categories: mergedCategories,
    });

    return record;
  }

  /**
   * Coach updates athlete PED data
   */
  async updateForAthlete(
    athleteId: string,
    coachId: string,
    week: string,
    categories: any[],
  ) {
    const record = await PEDDatabaseModel.findOne({
      athleteId,
      coachId,
      week,
    });

    if (!record) {
      throw new Error('Athlete PED record not found');
    }

    // 🔁 Loop through each incoming category
    categories.forEach((incomingCategory: any) => {
      // Find the existing category in record
      const existingCategory = record.categories.find(
        (cat: any) => cat.name === incomingCategory.name,
      );

      if (!existingCategory) return;

      // 🔁 Loop through subCategories to update
      incomingCategory.subCategory.forEach((incomingSub: any) => {
        const existingSub = existingCategory.subCategory.find(
          (sub: any) => sub.name === incomingSub.name,
        );

        if (!existingSub) return;

        // ✅ Update only allowed fields
        existingSub.name = incomingSub.name ?? existingSub.name;
        existingSub.subCategory =
          incomingSub.subCategory ?? existingSub.subCategory;
        existingSub.dosage = incomingSub.dosage ?? existingSub.dosage;
        existingSub.frequency = incomingSub.frequency ?? existingSub.frequency;
        existingSub.mon = incomingSub.mon ?? existingSub.mon;
        existingSub.tue = incomingSub.tue ?? existingSub.tue;
        existingSub.wed = incomingSub.wed ?? existingSub.wed;
        existingSub.thu = incomingSub.thu ?? existingSub.thu;
        existingSub.fri = incomingSub.fri ?? existingSub.fri;
        existingSub.sat = incomingSub.sat ?? existingSub.sat;
        existingSub.sun = incomingSub.sun ?? existingSub.sun;
      });
    });

    await record.save();
    return record;
  }

  async updateAthletePEDById(id: string, payload: any) {
    const { categoryId, toggleCategory, deleteSubCategoryId, clearFields } =
      payload;

    const fieldClearObj: Record<string, string> = {};
    if (clearFields?.fields?.length) {
      clearFields.fields.forEach((field: string) => {
        fieldClearObj[field] = '';
      });
    }

    const pipeline: any[] = [
      {
        $set: {
          categories: {
            $map: {
              input: '$categories',
              as: 'cat',
              in: {
                $mergeObjects: [
                  '$$cat',
                  // 1️⃣ Toggle Category Active Status (Optional)
                  categoryId
                    ? {
                        isActive: {
                          $cond: [
                            {
                              $eq: [
                                '$$cat._id',
                                new mongoose.Types.ObjectId(categoryId),
                              ],
                            },
                            toggleCategory ?? '$$cat.isActive',
                            '$$cat.isActive',
                          ],
                        },
                      }
                    : {},
                  {
                    subCategory: {
                      $filter: {
                        input: {
                          $map: {
                            input: '$$cat.subCategory',
                            as: 'sub',
                            in: {
                              // 3️⃣ Clear specific fields (Optional)
                              $cond: [
                                {
                                  $and: [
                                    { $literal: !!clearFields?.subCategoryId },
                                    {
                                      $eq: [
                                        '$$sub._id',
                                        new mongoose.Types.ObjectId(
                                          clearFields?.subCategoryId ||
                                            '000000000000000000000000',
                                        ),
                                      ],
                                    },
                                  ],
                                },
                                { $mergeObjects: ['$$sub', fieldClearObj] },
                                '$$sub',
                              ],
                            },
                          },
                        },
                        as: 'filteredSub',
                        // 2️⃣ Delete a SubCategory (Optional)
                        cond: {
                          $cond: [
                            { $literal: !!deleteSubCategoryId },
                            {
                              $ne: [
                                '$$filteredSub._id',
                                new mongoose.Types.ObjectId(
                                  deleteSubCategoryId ||
                                    '000000000000000000000000',
                                ),
                              ],
                            },
                            true,
                          ],
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
    ];

    const updateResult = await PEDDatabaseModel.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      pipeline,
    );

    if (updateResult.matchedCount === 0) {
      throw new Error('PED document not found');
    }

    return await PEDDatabaseModel.findById(id);
  }

  async removeSubCategoryFromPED(
    pedId: string,
    categoryId: string,
    subCategoryId: string,
  ) {
    const result = await PEDDatabaseModel.findByIdAndUpdate(
      pedId,
      {
        $pull: {
          'categories.$[cat].subCategory': {
            _id: subCategoryId,
          },
        },
      },
      {
        new: true,
        arrayFilters: [
          {
            'cat._id': categoryId,
          },
        ],
      },
    );

    return result;
  }

  async removeCategoryFromPED(pedId: string, categoryId: string) {
    const result = await PEDDatabaseModel.findByIdAndUpdate(
      pedId,
      {
        $pull: {
          categories: {
            _id: categoryId,
          },
        },
      },
      {
        new: true,
      },
    );

    return result;
  }
}
