import axios, { AxiosRequestConfig } from "axios";
import { logger } from "../log";

export enum PageFormat {
  STORAGE = "storage",
  VIEW = "view",
}

export interface ConfluenceConfig {
  CONFLUENCE_BASE_URL: string;
  CONFLUENCE_USER: string;
  CONFLUENCE_PASSWORD: string;
  CONFLUENCE_SPACE_KEY: string;
  CONFLUENCE_PARENT_PAGE_ID: string;
  CONFLUENCE_TEMPLATE_PAGE_ID: string;
}

export class ConfluenceClient {
  private defaultRequestConfig: AxiosRequestConfig;

  constructor(private config: ConfluenceConfig) {
    this.defaultRequestConfig = {
      auth: {
        username: this.config.CONFLUENCE_USER,
        password: this.config.CONFLUENCE_PASSWORD,
      },
      baseURL: this.config.CONFLUENCE_BASE_URL,
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
    };
  }

  async findLinkForPage(spaceKey: string, title: string): Promise<string | undefined> {
    const response = await axios.get("/rest/api/content", {
      ...this.defaultRequestConfig,
      params: { spaceKey: spaceKey, title: title },
    });
    logger.info(response.statusText);
    if (response.status !== 200) {
      throw Error(
        `${response.status} - Could not find Confluence page with title '${title}', response was '${response.data}'.`
      );
    }
    const results = response.data.results;
    return results.length > 0 ? results[0]._links.self : undefined;
  }

  async getPageBody(pageId: string, format: PageFormat = PageFormat.STORAGE): Promise<string> {
    const response = await axios.get(`/rest/api/content/${pageId}`, {
      ...this.defaultRequestConfig,
      params: { expand: `body.${format}` },
    });
    if (response.status !== 200) {
      throw Error(
        `${response.status} - Could not retrieve Confluence page with id '${pageId}', response was '${response.data}'.`
      );
    }
    return response.data.body.storage.value;
  }

  async createSessionPage(title: string, storageContent: string): Promise<string> {
    const response = await axios.post(
      "/rest/api/content",
      {
        type: "page",
        space: { key: this.config.CONFLUENCE_SPACE_KEY },
        title: title,
        ancestors: [{ id: this.config.CONFLUENCE_PARENT_PAGE_ID }],
        body: {
          storage: {
            value: storageContent,
            representation: "storage",
          },
        },
      },
      this.defaultRequestConfig
    );
    if (response.status !== 200) {
      throw Error(`${response.status} - Cannot create Confluence page '{title}', response was '${response.data}'.`);
    }
    return response.data._links.self;
  }
}
