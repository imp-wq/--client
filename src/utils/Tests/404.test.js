const puppeteer = require('puppeteer');



const invalidPaths = ['testing', 'notexist', ' ds', '54', 'a', '   ']
    
test(`path: ${invalidPaths[0]}`, async () => {
    const browser = await puppeteer.launch({
        headless: true,
    })
    const page =  await browser.newPage();
    await page.goto(`http://localhost:3000/${invalidPaths[0]}`);
    const title = await page.title();
    expect(title).toBe('404 PAGE');
})

test(`path: ${invalidPaths[1]}`, async () => {
    const browser = await puppeteer.launch({
        headless: true,
    })
    const page =  await browser.newPage();
    await page.goto(`http://localhost:3000/${invalidPaths[1]}`)
    const title = await page.title();
    expect(title).toBe('404 PAGE');
})

test(`path: ${invalidPaths[2]}`, async () => {
    const browser = await puppeteer.launch({
        headless: true,
    })
    const page =  await browser.newPage();
    await page.goto(`http://localhost:3000/${invalidPaths[2]}`)
    const title = await page.title();
    expect(title).toBe('404 PAGE');
})

test(`path: ${invalidPaths[3]}`, async () => {
    const browser = await puppeteer.launch({
        headless: true,
    })
    const page =  await browser.newPage();
    await page.goto(`http://localhost:3000/${invalidPaths[3]}`)
    const title = await page.title();
    expect(title).toBe('404 PAGE');
})

test(`path: ${invalidPaths[4]}`, async () => {
    const browser = await puppeteer.launch({
        headless: true,
    })
    const page =  await browser.newPage();
    await page.goto(`http://localhost:3000/${invalidPaths[4]}`)
    const title = await page.title();
    expect(title).toBe('404 PAGE');
})