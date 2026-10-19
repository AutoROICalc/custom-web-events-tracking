declare module "AutoRoiCalc" {
  interface Config {
    debug: boolean;
    maxSources: number;
    cookieNameSources: string;
    storageNameTimeout: string;
    storageNameTimeoutSent: string;
    storageNameSources: string;
    timeout: number;
    ignoreUtmCampaign: boolean;
    ignoreUtmSource: boolean;
    useSourceMedium: boolean;
  }

  interface AutoRoiCalc {
    appendNewSource(
      customSource?: string,
      checkTimeout?: boolean,
      customTimeoutStorageItemName?: string
    ): boolean;
    getSources(removeDuplicates?: boolean): Array<string>;
    setTrackingId(id: string): void;
    setConfig(key: string, value: string | boolean | number): boolean;
    getConfig(): Config;
    sendEvent(
      type: string,
      desc: string,
      value?: number,
      checkTimeout?: boolean,
      customTimeoutStorageItemName?: string,
      customSource?: string,
      tags?: Array<string> | string
    ): boolean;
    /** Update in-memory consent using the site's consent manager. Defaults to denied. */
    setConsent(consent: { analytics?: boolean; marketing?: boolean }): { analytics: boolean; marketing: boolean };
    hasConsent(category?: 'analytics' | 'marketing'): boolean;
    /** Queue one anonymous event with static labels. True does not confirm delivery. */
    sendAnonymousEvent(type: string, desc: string): boolean;
    setSourcesCookie(): boolean;
  }

  const autoRoiCalc: AutoRoiCalc;

  export = autoRoiCalc;
}