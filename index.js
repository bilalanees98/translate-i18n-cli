#!/usr/bin/env node

import inquirer from "inquirer";
import TranslateJSONObject from "translate-json-object";
import { existsSync, readFileSync, writeFile } from "fs";
import { LANGUAGE_MAP } from "./language-map.js";

function translate(
  googleApiKey,
  pathToFileToBeTranslated,
  pathToTranslateTo,
  languagesToTranslateTo
) {
  const tjo = TranslateJSONObject();
  //initialize translation object
  const isApiKeyValid = tjo.init({
    googleApiKey,
  });
  if (!isApiKeyValid) return false;

  const fileToBeTranslated = JSON.parse(
    readFileSync(pathToFileToBeTranslated, { encoding: "utf8" })
  );

  for (let index = 0; index < languagesToTranslateTo.length; index++) {
    const language = languagesToTranslateTo[index];
    tjo
      .translate(fileToBeTranslated, LANGUAGE_MAP[language])
      .then(function (data) {
        writeFile(
          `${pathToTranslateTo}/${language}.json`,
          JSON.stringify(data),
          "utf8",
          (err) => {
            if (err) throw err;
            console.log(`${language} has been saved!`);
          }
        );
      })
      .catch(function (err) {
        console.log(`Could not translate to ${language} `, err);
      });
  }
}

function fileExists(path) {
  return existsSync(path) ? true : "File not found!";
}
function folderExists(path) {
  return existsSync(path) ? true : "Folder not found!";
}

/**
 * Enter you google API key - validate
 * Enter path to file that you wish to translate - validate if file present
 * Enter path where you wish to translate to
 * Choose the languages you wish to translate to - check box
 * Translate
 */

function askQuestions() {
  const questions = [
    {
      name: "googleApiKey",
      type: "input",
      message: "Enter the Google API Key you wish to use.",
    },
    {
      name: "pathToFileToBeTranslated",
      type: "input",
      message:
        "Enter the path to the json file you wish to translate - only english is supported atm.",
      validate: (value) => fileExists(value),
    },
    {
      name: "pathToTranslateTo",
      type: "input",
      message: "Enter path of folder where you wish to store translated files.",
      validate: (value) => folderExists(value),
    },
    {
      name: "languagesToTranslateTo",
      type: "checkbox",
      message: "Choose language you wish to translate to.",
      choices: ["ja-jp", "nl-nl", "zh-cn"],
      validate: (choices) => {
        return choices.length < 1
          ? "You must choose atleast one language."
          : true;
      },
    },
  ];

  return inquirer.prompt(questions);
}

async function run() {
  console.log("Lets get translating...");

  const {
    googleApiKey,
    pathToFileToBeTranslated,
    pathToTranslateTo,
    languagesToTranslateTo,
  } = await askQuestions();

  translate(
    googleApiKey,
    pathToFileToBeTranslated,
    pathToTranslateTo,
    languagesToTranslateTo
  );

  console.log("translation complete");
}

run();
