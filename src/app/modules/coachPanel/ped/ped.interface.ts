/* ---------- Interfaces ---------- */

export interface ISubCategory {
  name: string;
  dosage: string;
  frequency: string;
  mon: string;
  tue: string;
  wed: string;
  thu: string;
  fri: string;
  sat: string;
  sun: string;
  subCategory?: ISubCategory[];
}

export interface ICategory {
  _id?: string;
  name: string;
  isActive: boolean;
  subCategory: ISubCategory[];
}

export interface IPEDDatabase extends Document {
  coachId?: string;
  athleteId?: string | null;
  week: string;
  categories: ICategory[];
  isTemplate: boolean;
  createdAt: Date;
  updatedAt: Date;
}
