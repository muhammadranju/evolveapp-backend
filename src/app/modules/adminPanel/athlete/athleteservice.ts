import { StatusCodes } from 'http-status-codes';
import { USER_ROLES } from '../../../../enums/user';
import ApiError from '../../../../errors/ApiError';
import { IAthlete } from './athleteInterface';
import { AthleteModel } from './athleteModel';
import generateOTP from '../../../../util/generateOTP';
import { emailTemplate } from '../../../../shared/emailTemplate';
import { emailHelper } from '../../../../helpers/emailHelper';
import { JwtPayload } from 'jsonwebtoken';
import unlinkFile from '../../../../shared/unlinkFile';

export class AthleteService {
  async createAthlete(data: IAthlete) {
    data.role = USER_ROLES.ATHLETE;
    const createAthlete = await AthleteModel.create(data);
    if (!createAthlete) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create Athlete');
    }
    return createAthlete;
  }

  async getAllAthletes() {
    return await AthleteModel.find();
  }

  async getAllAthletesByCoachId(coachId: string) {
    return await AthleteModel.find({ coachId });
  }

  async getAthleteById(id: string) {
    return await AthleteModel.findById(id);
  }

  async updateAthlete(id: string, data: Partial<IAthlete>) {
    // return
    // console.log(id);
    const updateDoc = await AthleteModel.findByIdAndUpdate({ _id: id }, data, {
      new: true,
    });
    // console.log(updateDoc);
    return updateDoc;
  }

  async deleteAthlete(id: string) {
    return await AthleteModel.findByIdAndDelete(id);
  }

  async checkIn(id: string) {
    return await AthleteModel.findByIdAndUpdate(
      id,
      { lastCheckIn: new Date() },
      { new: true },
    );
  }

  async updateActiveStatus(id: string) {
    return await AthleteModel.findByIdAndUpdate(
      id,
      {
        isActive: 'In-Active',
        lastActive: new Date(),
      },
      { new: true },
    );
  }

  async setActiveOnLogin(id: string) {
    return await AthleteModel.findByIdAndUpdate(
      id,
      {
        isActive: 'Active',
        lastActive: new Date(),
      },
      { new: true },
    );
  }

  async getUserProfileFromDB(user: JwtPayload): Promise<Partial<IAthlete>> {
    const { id } = user;
    const isExistAthlete =
      await AthleteModel.isExistAthleteById(id).populate('shows');
    if (!isExistAthlete) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }

    return isExistAthlete;
  }

  updateProfileToDB = async (
    user: JwtPayload,
    payload: Partial<IAthlete>,
  ): Promise<Partial<IAthlete | null>> => {
    const { id } = user;
    const isExistUser = await AthleteModel.isExistAthleteById(id);
    if (!isExistUser) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Athlete doesn't exist!");
    }

    //unlink file here
    if (payload.image) {
      unlinkFile(isExistUser.image);
    }

    const updateDoc = await AthleteModel.findOneAndUpdate(
      { _id: id },
      payload,
      {
        new: true,
      },
    );

    return updateDoc;
  };

  async getSingleProfile(id: string) {
    const athlete = await AthleteModel.findById(id)
      .select('-password -authentication')
      .lean()
      .populate('shows');
    if (!athlete)
      throw new ApiError(StatusCodes.NOT_FOUND, 'Athlete not found');
    return athlete;
  }
}
