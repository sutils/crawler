
import { Browser, BrowserContext, Page } from 'puppeteer';


export interface BrowserContextCreator {
    browser: Browser;
    createIncognitoBrowserContext(key: string): Promise<BrowserContext>;
    freeIncognitoBrowserContext(key: string, context: BrowserContext): Promise<void>;
    newPage(key: string): Promise<Page>;
    freePage(key: string, page: Page): Promise<void>;
}

export class MaxBrowserContextCreator implements BrowserContextCreator {
    public browser: Browser;
    public max: number = 3;
    public creator: BrowserContextCreator;

    private waiting: any[] = [];
    private running: number = 0;

    public constructor(creator: BrowserContextCreator, max?: number) {
        this.creator = creator;
        this.browser = creator.browser;
        this.max = max ? max : 3;
    }

    public async createIncognitoBrowserContext(key: string): Promise<BrowserContext> {
        return new Promise<BrowserContext>(async (resolve, reject) => {
            if (this.running >= this.max) {
                this.waiting.push({ resolve: resolve, reject: reject });
                return;
            }
            this.running++;
            resolve(await this.creator.createIncognitoBrowserContext(key));
        })
    }

    public async freeIncognitoBrowserContext(key: string, context: BrowserContext): Promise<void> {
        await this.creator.freeIncognitoBrowserContext(key, context)
        this.running--;
    }

    public async newPage(key: string): Promise<Page> {
        return (await this.createIncognitoBrowserContext(key)).newPage()

    }
    public async freePage(key: string, page: Page): Promise<void> {
        return page.close()
    }
}

export class NativeBrowserContextCreator implements BrowserContextCreator {
    public browser: Browser;

    public constructor(browser: Browser) {
        this.browser = browser;
    }

    public async createIncognitoBrowserContext(key: string): Promise<BrowserContext> {
        return this.browser.createIncognitoBrowserContext();
    }

    public async freeIncognitoBrowserContext(key: string, context: BrowserContext): Promise<void> {
        return context.close();
    }

    public async newPage(key: string): Promise<Page> {
        return (await this.createIncognitoBrowserContext(key)).newPage()
    }
    public async freePage(key: string, page: Page): Promise<void> {
        return await page.close()
    }
}

export interface Runner {
    id: string;
    options?: any;
    storage: DataStorage;
    process(browser: BrowserContextCreator): Promise<any>;
}

export interface DataStorage {
    save(uri: string, data: any, options: any): Promise<any>;
    exist(uri: string[]): Promise<number>;
}