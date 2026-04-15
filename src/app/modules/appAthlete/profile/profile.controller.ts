import { Request, Response } from 'express';
import { ProfileService } from './profile.service';

export class ProfileController {
  async getProfileDetails(req: Request, res: Response) {
    try {
      const athleteId = req.user.id;
      console.log(athleteId);
      if (!athleteId)
        return res.status(400).json({ message: 'athleteId is required' });

      const data = await ProfileService.getAthleteDetails(athleteId);
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error in getAthleteDetails:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  }
}
