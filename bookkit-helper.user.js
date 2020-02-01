// ==UserScript==
// @name         MnkBookKitHelper
// @namespace    https://github.com/uumnk/bookkit-helper
// @version      0.2
// @description  Makes work with BookKit a little bit better.
// @author       Monika
// @match        https://uuos9.plus4u.net/uu-bookkitg01-main/*
// @grant        none
// @require      bookkit-parser.js
// @require      algorithm-parser.js
// @require      error-list-parser.js
// @require      compare-utils.js
// @require      error-list-generator.js
// ==/UserScript==

(function() {
    'use strict';

    function main(jsonString) {
        let stringResult = "";
        try {
            console.log("MnkBookKitHelper start.");

            // Parse page content:
            let bookkitParser = new BookkitParser();
            let pageContent = bookkitParser.parsePageData(jsonString);
            console.log("[MnkBookKitHelper] Parsed content:");
            console.log(pageContent);

            // Errors / warnings from Algorithm:
            let algorithmParser = new AlgorithmParser();
            let errorsAndWarnings = algorithmParser.extractErrorsAndWarningsFromAlgorithm(pageContent);

            // Count of errors / warnings from Algorithm:
            let errorsAndWarningsCountString = errorsAndWarnings == null ? "No errors or warnings were found in Algorithm or no Algorithm found." : "Found " + errorsAndWarnings.length + " errors / warnings in Algorithm.";
            if (errorsAndWarnings != null) {
                console.log("[MnkBookKitHelper] Errors and warnings from Algorithm:");
                console.log(errorsAndWarnings);
            }
            console.log(errorsAndWarningsCountString);
            stringResult += errorsAndWarningsCountString + "\n";

            // Errors / warnings from Error List:
            let errorListParser = new ErrorListParser();
            let errorsList = errorListParser.extractErrorsAndWarningsFromErrorList(pageContent);

            // Count of errors / warnings from Error List:
            let errorsListCountString = errorsList == null ? "No errors in Error List or no Error List found." : "Found " + errorsList.length + " errors / warnings in Error List.";
            if (errorsList != null) {
                console.log("[MnkBookKitHelper] Errors and warnings from Error List:");
                console.log(errorsList);
            }
            console.log(errorsListCountString);
            stringResult += errorsListCountString + "\n";

            if (errorsAndWarnings == null || errorsList == null) {
                let canNotContinueString = "Can not continue with comparing.";
                console.log("[MnkBookKitHelper] " + canNotContinueString);
                stringResult += canNotContinueString + "\n";
            } else {
                let lengthDifferenceString = errorsAndWarnings.length === errorsList.length ? "Error List has the same length as count of found errors in Algorithm." : "ERROR LIST LENGTH IS DIFFERENT FROM COUNT OF ERRORS IN ALGORITHM!";
                console.log("[MnkBookKitHelper] " + lengthDifferenceString);
                stringResult += lengthDifferenceString + "\n";

                let algorithmErrorCodes = algorithmParser.getErrorCodesListFromAlgorithmErrors(errorsAndWarnings);
                let errorListErrorCodes = errorListParser.getErrorCodesListFromErrorList(errorsList);

                let compareUtils = new CompareUtils();
                let missingInErrorList = compareUtils.compareLists(algorithmErrorCodes, errorListErrorCodes);
                let missingInErrorListString = "Errors / Warnings from Algorithm, missing in Error List: " + (missingInErrorList.length > 0 ? missingInErrorList.join(", ") : "(nothing, it's OK)") + ".";
                console.log("[MnkBookKitHelper] " + missingInErrorListString);
                stringResult += missingInErrorListString + "\n";

                let missingInAlgorithm = compareUtils.compareLists(errorListErrorCodes, algorithmErrorCodes);
                let missingInAlgorithmString = "Errors / Warnings from Error List, missing in Algorithm: " + (missingInAlgorithm.length > 0 ? missingInAlgorithm.join(", ") : "(nothing, it's OK)") + ".";
                console.log("[MnkBookKitHelper] " + missingInAlgorithmString);
                stringResult += missingInAlgorithmString + "\n";
            }

            if (errorsAndWarnings != null) {
                // Generate error list
                let errorPrefix = algorithmParser.extractErrorPrefixFromAlgorithm(pageContent);
                let generatedErrorListTitleString = "Generated Error List:";
                stringResult += "\n" + generatedErrorListTitleString + "\n";
                console.log("[MnkBookKitHelper] " + generatedErrorListTitleString);
                let errorListGenerator = new ErrorListGenerator();
                let generatedErrorListString = errorListGenerator.generateErrorListString(errorsAndWarnings, errorPrefix);
                stringResult += generatedErrorListString + "\n";
                console.log("[MnkBookKitHelper] " + generatedErrorListString);
            }

            console.log("MnkBookKitHelper end.");
        } catch (e) {
            let errorString = "Processing of data has failed because of error: " + e.toString();
            console.log("[MnkBookKitHelper] " + errorString);
            console.log(e);
            stringResult += errorString;
        }

        return stringResult;
    }

    function hideTextarea() {
        let textarea = document.getElementById("mnkBookKitHelperTextArea");
        textarea.parentElement.removeChild(textarea);
        let btn = document.getElementById("mnkBookKitHelperButton");
        btn.onclick = createTextarea;
        btn.innerHTML = "Check / generate error list";
    }

    function processData() {
        let textarea = document.getElementById("mnkBookKitHelperTextArea");
        let text = textarea.value;
        if (text !== "") {
            textarea.value = main(text);
            let btn = document.getElementById("mnkBookKitHelperButton");
            btn.onclick = hideTextarea;
            btn.innerHTML = "Close text area";
        } else {
            hideTextarea();
        }
    }

    function createTextarea() {
        let textarea = document.createElement("TEXTAREA");
        textarea.placeholder = "Paste book data from \"Page\" -> \"Update Source Data\" here.";
        textarea.rows = 10;
        textarea.cols = 100;
        textarea.wrap = "off";
        textarea.style.position = "fixed";
        textarea.style.right = "100px";
        textarea.style.top = "20px";
        textarea.style.zOrder = "255";
        textarea.style.backgroundColor = "yellow";
        textarea.id = "mnkBookKitHelperTextArea";
        document.body.appendChild(textarea);
        let btn = document.getElementById("mnkBookKitHelperButton");
        btn.onclick = processData;
        btn.innerHTML = "Process data";
    }

    function createButton() {
        let btn = document.createElement("BUTTON");
        btn.innerHTML = "Check / generate error list";
        btn.onclick = createTextarea;
        btn.style.cssText = "position: absolute; right: 0px, top: 0px; z-order: 255;";
        btn.style.position = "fixed";
        btn.style.right = "0px";
        btn.style.top = "0px";
        btn.style.zOrder = "255";
        btn.style.backgroundColor = "yellow";
        btn.id = "mnkBookKitHelperButton";
        document.body.appendChild(btn);
    }

    setTimeout(createButton, 5000); // TODO: refactor GUI methods somehow, the main function should run on the start, display GUI and then run a different method.
})();