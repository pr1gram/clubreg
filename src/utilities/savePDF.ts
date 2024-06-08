import chrome from "chrome-aws-lambda"
import puppeteer from "puppeteer-core"

export async function savePDF(url: string) {
  console.log( chrome)
    const options = process.env.AWS_REGION
    
      ? {
          args: chrome.args,
          executablePath:
            process.platform === "win32"
              ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
              : process.platform === "linux"
              ? "/usr/bin/google-chrome"
              : "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
          headless: chrome.headless,
        }
      : {
          args: [],
          executablePath:
            process.platform === "win32"
              ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
              : process.platform === "linux"
              ? "/usr/bin/google-chrome"
              : "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        }
    const browser = await puppeteer.launch(options)
    const page = await browser.newPage()
  
    await page.goto(url, { waitUntil: "networkidle2" })
    
    return await page.pdf({format: "a4"})
  }