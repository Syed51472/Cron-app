// const express = require("express");
import nodeCron from "node-cron";
import puppeteer from "puppeteer";
import ora from "ora";
import chalk from "chalk";

// const app = express();
// const port = 1000; 

const url = "https://www.worldometers.info/world-population/";

async function scrapWorldPopulation(){
    console.log(chalk.green("Running scheduled Job"));
    const spinner = ora({
        text: "Launching puppeteer",
        color: "blue",
        hideCursor: false,
    }).start();
try{
    const date = Date.now();
    const browser = await puppeteer.launch();
    spinner.text = "Launching Headless browser page";
    const newPage = await browser.newPage();
    spinner.text = "Navigating to URL";
    await newPage.goto(url, {waitUntil: "load", timeout: 0});
    spinner.text = "Scraping Page";
    const digitGroups = await newPage.evaluate(() => {
        const digitGroupArr = [];
        const selector  = "#maincounter-wrap .maincounter-number .rts-counter span";
        const digitSpans = document.querySelectorAll(selector);
        digitSpans.forEach((span) => {
            if (!isNaN(parseInt(span.textContent))) {
                digitGroupArr.push(span.textContent);
            }
        });
        return JSON.stringify(digitGroupArr);
    });

    spinner.text = "Closing Headless browser";
    await browser.close();
    spinner.succeed(`Page scraping successfully after ${Date.now() - date}ms`);
    spinner.clear();
    console.log(
        chalk.yellow.bold(`World population on ${new Date().toISOString()}:`),
        chalk.blue.bold(JSON.parse(digitGroups).join(","))
    );
}
catch (error){
    spinner.fail({text: "Scraping Failed"});
    spinner.clear();
    console.log(error);
}
}

const job = nodeCron.schedule("*/2 * * * *", scrapWorldPopulation);

// app.use("/", (req, res) => {
//     res.send("Cron Scheduling!");
// })

// app.listen(port, () => {
//     console.log("Server is running on port 1000");
// })