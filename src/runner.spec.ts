import 'mocha';
import { Browser, launch } from 'puppeteer';
import { MaxBrowserContextCreator, NativeBrowserContextCreator, Register, NewRunner } from './runner';
import { Runner } from './runner';
import { assert } from 'chai';
describe('runner', async () => {
    it("Creator", async () => {
        let nativeBrowser: Browser;
        nativeBrowser = await launch({
            args: ["--blink-settings=imagesEnabled=false", "--proxy-server="],
            headless: false,
        });
        //
        let creator0 = new NativeBrowserContextCreator(nativeBrowser);
        await creator0.freeIncognitoBrowserContext("test0", await creator0.createIncognitoBrowserContext("test0"));
        await creator0.freePage("test1", await creator0.newPage("test1"));
        //
        let creator1 = new MaxBrowserContextCreator(creator0, 1);
        await creator1.freeIncognitoBrowserContext("test0", await creator1.createIncognitoBrowserContext("test0"));
        await creator1.freePage("test1", await creator1.newPage("test1"));
        let ctx0 = await creator1.createIncognitoBrowserContext("test0");
        setTimeout(async () => {
            await creator1.freeIncognitoBrowserContext("test0", ctx0);
        }, 500);
        await creator1.freeIncognitoBrowserContext("test0", await creator1.createIncognitoBrowserContext("test0"));
        await nativeBrowser.close();
        new MaxBrowserContextCreator(creator0);
    });
    it("Register", async () => {
        assert.equal(NewRunner("not", "x0"), null);
        await new Promise<any>((resolve, reject) => {
            Register("t0", (id: string, ...args: any[]): Runner => {
                resolve(null);
                return null;
            });
            NewRunner("t0", "x");
        })
    })
});