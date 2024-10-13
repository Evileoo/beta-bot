import puppeteer from "puppeteer"

export const sdl = {
    async getResults(url) {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto(url, { waitUntil: 'networkidle2' });

        await page.waitForSelector(".roomContainer");

        const screenshot = await page.screenshot();
        console.log(screenshot);

        await browser.close();

        return draftData;
    }
}