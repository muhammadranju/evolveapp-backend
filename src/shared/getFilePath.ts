import { Types } from 'mongoose';
import { IAthlete } from '../app/modules/adminPanel/athlete/athleteInterface';

type IFolderName = 'image' | 'media' | 'doc' | 'vedio' | 'video';

//single file
export const getSingleFilePath = (files: any, folderName: IFolderName) => {
  const fileField = files && files[folderName];
  if (fileField && Array.isArray(fileField) && fileField.length > 0) {
    return `/${folderName}/${fileField[0].filename}`;
  }

  return undefined;
};

//multiple files
export const getMultipleFilesPath = (files: any, folderName: IFolderName) => {
  const folderFiles = files && files[folderName];
  if (folderFiles) {
    if (Array.isArray(folderFiles)) {
      return folderFiles.map((file: any) => `/${folderName}/${file.filename}`);
    }
  }

  return undefined;
};

interface RawAthleteInput {
  [key: string]: any;
}

export const normalizeAthleteInput = (
  input: RawAthleteInput
): Partial<IAthlete> => {
  return {
    ...input,
    weight: Number(input.weight),
    height: Number(input.height),
    age: Number(input.age),
    waterQuantity: Number(input.waterQuantity),
    trainingDaySteps: Number(input.trainingDaySteps),
    restDaySteps: Number(input.restDaySteps),
    // Convert _id / coachId to ObjectId if needed
    coachId: input.coachId ? input.coachId : undefined,
    lastCheckIn: input.lastCheckIn ? new Date(input.lastCheckIn) : undefined,
  };
};
