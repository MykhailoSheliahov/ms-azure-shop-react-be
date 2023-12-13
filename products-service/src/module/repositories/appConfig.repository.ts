import { injectable } from "inversify";
import { AppConfigurationClient, GetConfigurationSettingResponse } from '@azure/app-configuration';

import { Logger } from "../../common/logger/logger";

@injectable()
export class AppConfigRepository {
  constructor(
    private readonly logger: Logger,
  ) { }

  async getAppConfig(name: string): Promise<GetConfigurationSettingResponse> {
    try {
      this.logger.info('HTTP trigger getAppConfig function processed a request.');

      const client = new AppConfigurationClient(process.env.AZURE_APP_CONFIG_CONNECTION_STRING);
      const configs = await client.getConfigurationSetting({ key: name });

      this.logger.info(`Config ${name} value - ${JSON.stringify(configs)}`);

      return configs
    }
    catch (err) {
      throw err
    }
  }
}
