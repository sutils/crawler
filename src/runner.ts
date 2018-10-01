import { Browser, BrowserContext, Page } from 'puppeteer';
import { Storage } from "./storage";

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
    private pageContext: any = {};

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
        if (this.waiting.length) {
            let next = this.waiting.pop();
            next.resolve(await this.creator.createIncognitoBrowserContext(key));
            return;
        }
        this.running--;
    }

    public async newPage(key: string): Promise<Page> {
        let context = await this.createIncognitoBrowserContext(key);
        let page = await context.newPage();
        (page as any)["_context_"] = context;
        return page;
    }
    public async freePage(key: string, page: Page): Promise<void> {
        let context = ((page as any)["_context_"]) as BrowserContext;
        await page.close()
        return this.freeIncognitoBrowserContext(key, context);
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
        return this.browser.newPage()
    }
    public async freePage(key: string, page: Page): Promise<void> {
        return await page.close()
    }
}

export interface Runner {
    id: string;
    options: any;
    storage: Storage;
    process(browser: BrowserContextCreator): Promise<any>;
}

var runners: any = {};

export function Register(key: string, creator: (id: string, ...args: any[]) => Runner) {
    runners[key] = creator;
}

export function NewRunner(key: string, id: string, ...args: any[]): Runner {
    let creator = runners[key];
    if (creator) {
        return runners[key](id, ...args);
    } else {
        return null;
    }
}