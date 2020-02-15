// ==UserScript==
// @name         MnkBookKitHelper
// @namespace    https://github.com/uumnk/bookkit-helper
// @version      0.2
// @description  Makes work with BookKit a little bit better.
// @author       Monika
// @match        https://uuos9.plus4u.net/uu-bookkitg01-main/*
// @grant        none
// @require      gui/gui.js
// @require      parsers/bookkit-parser.js
// @require      parsers/algorithm-parser.js
// @require      parsers/error-list-parser.js
// @require      utils/compare-utils.js
// @require      generators/error-list-generator.js
// @require      utils/data-extract-utils.js
// @require      utils/data-display-utils.js
// ==/UserScript==

(function() {
    'use strict';

    // This is the way to make possible to load classes via JS modules if it is run by test or use already loaded classes if it is run via HTML or Tampermonkey.
    let _BookkitParser = typeof module !== "undefined" ? require('./parsers/bookkit-parser.js').BookkitParser : BookkitParser;
    let _AlgorithmParser = typeof module !== "undefined" ? require('./parsers/algorithm-parser.js').AlgorithmParser : AlgorithmParser;
    let _ErrorListParser = typeof module !== "undefined" ? require('./parsers/error-list-parser.js').ErrorListParser : ErrorListParser;

    function main() {
        let gui = new Gui();
        gui.createButton(processData);
    }

    function processData(jsonString) {
        let stringResult = "";
        try {
            console.log("MnkBookKitHelper start.");

            // Parse page content:
            let bookkitParser = new _BookkitParser();
            let pageContent = bookkitParser.parsePageData(jsonString);
            console.log("[MnkBookKitHelper] Parsed content:");
            console.log(pageContent);

            // Errors / warnings from Algorithm:
            let algorithmParser = new _AlgorithmParser();
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
            let errorListParser = new _ErrorListParser();
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

                let missingInErrorList = CompareUtils.compareLists(algorithmErrorCodes, errorListErrorCodes);
                let missingInErrorListString = "Errors / Warnings from Algorithm, missing in Error List: " + (missingInErrorList.length > 0 ? missingInErrorList.join(", ") : "(nothing, it's OK)") + ".";
                console.log("[MnkBookKitHelper] " + missingInErrorListString);
                stringResult += missingInErrorListString + "\n";

                let missingInAlgorithm = CompareUtils.compareLists(errorListErrorCodes, algorithmErrorCodes);
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

    setTimeout(main, 5000);

    if (typeof module !== "undefined") {
        // If run via test, this is needed to make the test work.
        module.exports = { main, processData };
    }
})();