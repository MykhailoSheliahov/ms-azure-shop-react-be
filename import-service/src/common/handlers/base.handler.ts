import { injectable } from "inversify";
import { Context } from "@azure/functions";

@injectable()
export abstract class BaseHandler {
  abstract executeFunction(context: Context, ...args: any[]): Promise<void>;
}
