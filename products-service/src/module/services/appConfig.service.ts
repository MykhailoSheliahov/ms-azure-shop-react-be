import { injectable } from "inversify";
import { GetConfigurationSettingResponse } from '@azure/app-configuration';

import { AppConfigRepository } from "../repositories/appConfig.repository";

@injectable()
export class AppConfigService {
  constructor(
    private readonly appConfigRepository: AppConfigRepository,
  ) { }

  async getAppConfig(name: string): Promise<GetConfigurationSettingResponse> {
    try {
      return await this.appConfigRepository.getAppConfig(name);
    } catch (err) {
      throw err;
    }
  }
}
