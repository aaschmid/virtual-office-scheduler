import { config } from "dotenv";
import * as t from "io-ts";
import { PathReporter } from "io-ts/lib/PathReporter";
import { isRight } from "fp-ts/lib/Either";

export interface Configuration {
    googleSpreadsheetId: string;
    virtualOfficeBaseUrl: string;
}

/**
 * @throws {Error} if env could not be processed or env does not have the correct structure
 */
export function parseConfig(): Configuration {
    const result = config();
    if (result.error) {
        throw result.error;
    }

    const configuration = EnvironmentCodec.decode(result.parsed);
    if (isRight(configuration)) {
        return envToConfig(configuration.right);
    }
    throw Error(`Parsing env failed due to '${PathReporter.report(configuration)}'.`);
}

const EnvironmentCodec = t.type(
    {
        GOOGLE_SPREADSHEET_ID: t.string,
        VIRTUAL_OFFICE_BASE_URL: t.string,
    },
    "env",
);
type Environment = t.TypeOf<typeof EnvironmentCodec>;

const envToConfig = (parsed: Environment): Configuration => ({
    googleSpreadsheetId: parsed.GOOGLE_SPREADSHEET_ID,
    virtualOfficeBaseUrl: parsed.VIRTUAL_OFFICE_BASE_URL,
});
