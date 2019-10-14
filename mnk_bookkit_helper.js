// ==UserScript==
// @name         MnkBookKitHelper
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Makes work with BookKit a little bit better.
// @author       Monika
// @match        https://uuos9.plus4u.net/uu-bookkitg01-main/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function main(jsonString) {
        console.log("MnkBookKitHelper start.");
        let pageContent = parsePageData(jsonString);

        console.log("[MnkBookKitHelper] Parsed content:");
        console.log(pageContent);

        let errorsAndWarnings = extractErrorsAndWarningsFromAlgorithm(pageContent);

        console.log("[MnkBookKitHelper] Errors and warnings from Algorithm:");
        console.log(errorsAndWarnings || "No errors or warnings were found.");

        let errorsList = extractErrorsAndWarningsFromErrorList(pageContent);

        console.log("[MnkBookKitHelper] Errors and warnings from Error List:");
        console.log(errorsList || "No errors in Error List.");

        if (errorsAndWarnings == null || errorsList == null) {
            console.log("[MnkBookKitHelper] Can not continue with comparing.")
            return;
        }

        console.log(errorsAndWarnings.length === errorsList.length ? "[MnkBookKitHelper] Error List has the same length as count of found errors in Algorithm." : "[MnkBookKitHelper] ERROR LIST LENGTH IS DIFFERENT FROM COUNT OF ERRORS IN ALGORITHM!");

        let algorithmErrorCodes = getErrorCodesListFromAlgorithmErrors(errorsAndWarnings);
        let errorListErrorCodes = getErrorCodesListFromErrorList(errorsList);

        let missingInErrorList = compareLists(algorithmErrorCodes, errorListErrorCodes);
        console.log("[MnkBookKitHelper] Errors / Warnings from Algorithm, missing in Error List: " + (missingInErrorList.length > 0 ? missingInErrorList.join(", ") : "(nothing, it's OK)") + ".");

        let missingInAlgorithm = compareLists(errorListErrorCodes, algorithmErrorCodes);
        console.log("[MnkBookKitHelper] Errors / Warnings from Error List, missing in Algorithm: " + (missingInAlgorithm.length > 0 ? missingInAlgorithm.join(", ") : "(nothing, it's OK)") + ".");

        console.log("MnkBookKitHelper end.");
    }

    function compareLists(baseList, againstList) {
        let missingItems = [];
        let matchFound = false;
        for (let item of baseList) {
            for (let against of againstList) {
                if (item.trim() === against.trim()) {
                    matchFound = true; // Match found, continue to next item.
                    break;
                }
            }
            if (!matchFound) {
                missingItems.push(item);
            } else {
                matchFound = false;
            }
        }
        return missingItems;
    }

    function getErrorCodesListFromAlgorithmErrors(errorsAndWarnings) {
        let errorCodes = [];
        for (let error of errorsAndWarnings) {
            errorCodes.push(error.code);
        }
        return errorCodes;
    }

    function getErrorCodesListFromErrorList(errorList) {
        let errorCodes = [];
        for (let error of errorList) {
            errorCodes.push(error[0]);
        }
        return errorCodes;
    }

    function parsePageData(pageData) {
        let page = JSON.parse(pageData);

        // Find and parse all section contents:
        let pageKeys = Object.keys(page);
        for (let pageKey of pageKeys) {
            if (pageKey === "sectionList") {
                let sectionList = page[pageKey];
                for (let section of sectionList) {
                    let sectionKeys = Object.keys(section);
                    for (let sectionKey of sectionKeys) {
                        if (sectionKey === "content") {
                            let content = section[sectionKey];

                            // DEBUG ONLY:
                            // console.log(content.length);
                            // console.log(content);

                            let parsedXmlContent = parseSectionContent(content);

                            // DEBUG ONLY:
                            // let stringXml = convertParsedXmlToString(parsedXmlContent);
                            // console.log(stringXml);

                            section[sectionKey] = parsedXmlContent;

                        }
                    }
                }
                break;
            }
        }

        return page;
    }

    function extractErrorsAndWarningsFromAlgorithm(pageContent) {
        // TODO Quick implementation, write it better!
        let childAlgorithmDataValue = extractBrickDataValue(pageContent, "UuApp.DesignKit.Algorithm");
        if (childAlgorithmDataValue != null) {
            let statementList = childAlgorithmDataValue.statementList;
            let flatStatementList = extractAllStatements(statementList);
            let errorsAndWarnings = [];
            for (let statement of flatStatementList) {
                if (statement.type === "error" || statement.type === "warning") {
                    errorsAndWarnings.push(statement);
                }
            }
            return errorsAndWarnings;
        }
        return null;
    }

    function extractErrorsAndWarningsFromErrorList(pageContent) {
        // TODO Quick implementation, write it better!
        let childErrorListDataValue = extractBrickDataValue(pageContent, "UuApp.DesignKit.UuCmdErrorList");
        if (childErrorListDataValue != null) {
            return childErrorListDataValue;
        }
        return null;
    }

    function extractBrickDataValue(pageContent, brickName) {
        let pageKeys = Object.keys(pageContent);
        for (let pageKey of pageKeys) {
            if (pageKey === "sectionList") {
                let sectionList = pageContent[pageKey];
                for (let section of sectionList) {
                    let sectionKeys = Object.keys(section);
                    for (let sectionKey of sectionKeys) {
                        if (sectionKey === "content") {
                            let content = section[sectionKey];
                            let childLsi = extractChildWith(content, "name", "UU5.Bricks.Lsi");
                            if (childLsi != null) {
                                let childLsiItem = extractChildWith(childLsi.content, "name", "UU5.Bricks.Lsi.Item", "language", "en");
                                if (childLsiItem != null) {
                                    let childBrick = extractChildWith(childLsiItem.content, "name", brickName);
                                    if (childBrick == null) {
                                        let childSection = extractChildWith(childLsiItem.content, "name", "UU5.Bricks.Section");
                                        if (childSection != null) {
                                            childBrick = extractChildWith(childSection.content, "name", brickName);
                                        }
                                    }
                                    if (childBrick != null) {
                                        let childBrickData = extractChildWith(childBrick.attributes, "name", "data");
                                        if (childBrickData != null) {
                                            return childBrickData.value;
                                        }
                                    }
                                }
                            }

                        }
                    }
                }
                break;
            }
        }
        return null;
    }

    function extractChildWith(children, key, value, attributeKey, attributeValue) {
        for (let child of children) {
            if (child[key] === value) {
                if (attributeKey != null) {
                    let attribute = extractChildWith(child.attributes, "name", attributeKey);
                    if (attribute != null && attribute.value === attributeValue) {
                        return child;
                    }
                } else {
                    return child;
                }
            }
        }
        return null;
    }

    function extractAllStatements(statementList) {
        let statements = [];
        let statementsToExplore = [...statementList];
        while (statementsToExplore.length > 0) {
            let statement = statementsToExplore.shift();
            statements.push(statement);
            if (statement.statementList != null) {
                statementsToExplore.unshift(...statement.statementList);
            }
        }
        return statements;
    }

    function convertParsedXmlToString(parsedXmlContent) {
        let parsedContentStringArray = [];
        let parsedElements = [...parsedXmlContent];
        let parsedElementLevels = [];
        while (parsedElements.length > 0) {
            let parsedElement = parsedElements.shift();
            let currentLevel = parsedElementLevels.length > 0 ? parsedElementLevels.shift() : 0;
            let rowPadding = "\t".repeat(currentLevel)
            let elementString = "";
            if (typeof parsedElement === "string") {
                elementString += parsedElement.trim();
                if (elementString.length > 0) {
                    elementString = rowPadding + elementString.replace(/\n/g, "\n" + rowPadding);
                }
            } else {
                elementString += rowPadding + "<" + parsedElement.name + " ";
                for (let attribute of parsedElement.attributes) {
                    elementString += attribute.name;
                    if (attribute.value !== "") {
                        elementString += "=\"" + attribute.value.replace(/\n/g, "\n" + rowPadding) + "\"";
                    }
                    elementString += " ";
                }

                if (parsedElement.content.length > 0) {
                    if (elementString.charAt(elementString.length - 1) === " ") {
                        elementString = elementString.slice(0, -1);
                    }
                    elementString += ">";
                    parsedElementLevels.unshift(currentLevel);
                    for (let subElement of parsedElement.content) {
                        parsedElementLevels.unshift(currentLevel + 1);
                    }
                    parsedElements.unshift(...parsedElement.content, "</" + parsedElement.name + ">");
                } else {
                    elementString += "/>";
                }
            }
            if (elementString.length > 0) {
                parsedContentStringArray.push(elementString);
            }
        }
        return parsedContentStringArray.join("\n");
    }

    function parseSectionContent(content) {
        let parsedContent;
        try {
            parsedContent = parseXml(content);
        } catch (e) {
            switch (e.error) {
                case 500:
                    console.log("Parsing Error in mode " + e.mode + ": Unexpected character " + e.char + " on position " + e.pos + ".");
                    break;
                case 501:
                    console.log("Parsing Error in mode " + e.mode + ": Unexpected mode occurred while parsing.");
                    break;
                case 502:
                    console.log("Parsing Error in mode " + e.mode + ": Unexpected closing tag " + e.closingTagName + " on position " + e.pos + ", expected " + e.expectedTagName + ".");
                    break;
                case 503:
                    console.log("Parsing Error in mode " + e.mode + ": Unexpected state of parser: " + e.state + " occurred while parsing char " + e.char + " on position " + e.pos + ".");
                    break;
                case 504:
                    console.log("Parsing Error in mode " + e.mode + ": Unexpected level of immersion occurred while parsing char " + e.char + " on position " + e.pos + ".");
                    break;
                default:
                    console.log("Parsing Error in mode " + e.mode + ": Totally unexpected error: " + e);
            }
        }
        return parsedContent;

    }

    function parseXml(xmlString) {
        let elements = []; // Resulting elements array (objects = elements, strings = content between elements.

        let mode = 0; // Current pasing mode (see switch below).
        let currentElements = []; // Stack of parents of current element.
        let currentElement = {name: "", attributes: [], content: []}; // Element which is currently parsed.
        let currentAttribute = {name: "", value: ""}; // Attribute of element which is currently parsed.
        let parsingClosingTag = false; // Incitate if a closing tag is parsing right now.
        let closingTagName = ""; // Name of currently parsed closing tag for syntax check.
        let finishElement = false; // Indicate if parser has to finish currently parsed element in the end of parsing current char.
        let finishAttribute = false; // Indicate if parser has to finish currently parsed attribute in the end of parsing current char.
        let diveIntoElementContent = false; // Indicate if parser has to jump into content of currently parsed element in the end of parsing current char.
        let diveOutOfElementContent = false; // Indicate if parser has to jump out of content of currently parsed element in the end of parsing current char.
        let attributeValueOpeningChar = null; // Variable for remembering of opening char of currently parsed attribute.
        let escapedChar = false; // TODO: Maybe will be used later?
        let currentContent = ""; // Currently parsed non-sub-element of currently parsed element.

        for (let pos = 0; pos < xmlString.length; pos++) {
            let char = xmlString[pos];
            switch (mode) {
                case 0: // 0 = Looking for tag.
                    switch (char) {
                        case "<":
                            mode = 1; // Tag found.
                            if (currentContent !== "") {
                                if (currentElements.length > 0) {
                                    currentElements[currentElements.length - 1].content.push(currentContent);
                                } else {
                                    elements.push(currentContent);
                                }
                                currentContent = "";
                            }
                            break;
                        default:
                            currentContent += char;
                    }
                    break;
                case 1: // 1 = Looking for tag name.
                    switch (char) {
                        case "/":
                            parsingClosingTag = true; // It's closing tag.
                            if (currentElement.name === "") {
                                diveOutOfElementContent = true;
                            }
                            break;
                        case " ":
                        case " ":
                        case "\t":
                        case "\r":
                        case "\n":
                            break; // Continue to next char.
                        default:
                            if (parsingClosingTag) { // Add first name char.
                                closingTagName = char;
                            } else {
                                currentElement.name = char;
                            }
                            mode = 2;
                    }
                    break;
                case 2: // 2 = Parsing tag name.
                    switch (char) {
                        case " ":
                        case " ":
                        case "\t":
                        case "\r":
                        case "\n":
                            mode = 3; // End of name.
                            break;
                        case "/":
                            mode = 7; // End of self-closing element.
                            break;
                        case ">":
                            if (parsingClosingTag) {
                                // End of closing tag.
                                if (closingTagName === currentElement.name) {
                                    // Closing current element.
                                    parsingClosingTag = false;
                                    finishElement = true;
                                    mode = 0;
                                } else {
                                    // Different closing tag name.
                                    throw {error: 502, mode, char, pos, closingTagName, expectedTagName: currentElement.name};
                                }
                            } else {
                                diveIntoElementContent = true; // End of opening tag.
                                mode = 0;
                            }
                            break;
                        default:
                            if (parsingClosingTag) { // Add char to tag name.
                                closingTagName += char;
                            } else {
                                currentElement.name += char;
                            }
                    }
                    break;
                case 3: // 3 = Looking for attribute.
                    switch (char) {
                        case " ":
                        case " ":
                        case "\t":
                        case "\r":
                        case "\n":
                            break; // Continue to next char.
                        case "/":
                            mode = 7; // End of self-closing element.
                            break;
                        case ">":
                            // End of opening tag.
                            if (currentAttribute.name !== "") {
                                finishAttribute = true;
                            }
                            diveIntoElementContent = true;
                            mode = 0;
                            break;
                        default:
                            currentAttribute.name = char;
                            mode = 4;
                    }
                    break;
                case 4: // 4 = Parsing attribute name.
                    switch (char) {
                        case " ":
                        case " ":
                        case "\t":
                        case "\r":
                        case "\n":
                            // End of name.
                            finishAttribute = true;
                            mode = 3;
                            break;
                        case "/":
                            // End of name, end of attribute without value, end of element.
                            finishAttribute = true;
                            mode = 7; // End of self-closing element.
                            break;
                        case ">":
                            // End of name, end of attribute without value, end of opening tag.
                            finishAttribute = true;
                            diveIntoElementContent = true; // End of opening tag.
                            mode = 0;
                            break;
                        case "=":
                            mode = 5; // End of name, begin of value.
                            break;
                        default:
                            currentAttribute.name += char;
                    }
                    break;
                case 5: // 5 = Parsing attribute value.
                    switch (char) {
                        case " ":
                        case " ":
                        case "\t":
                        case "\r":
                        case "\n":
                            // End of value.
                            finishAttribute = true;
                            mode = 3;
                            break;
                        case "/":
                            // End of value, end of attribute without value, end of element.
                            finishAttribute = true;
                            mode = 7; // End of self-closing element.
                            break;
                        case ">":
                            // End of value, end of attribute without value, end of opening tag.
                            finishAttribute = true;
                            diveIntoElementContent = true;
                            mode = 0; // End of opening tag.
                            break;
                        case "\"":
                            attributeValueOpeningChar = char;
                            mode = 6;
                            break;
                        case "'":
                            attributeValueOpeningChar = char;
                            mode = 6;
                            break;
                        default:
                            currentAttribute.value += char;
                            attributeValueOpeningChar = null;
                            mode = 6;
                    }
                    break;
                case 6: // 6 = Parsing tag value content.
                    switch (attributeValueOpeningChar) {
                        case null: // Accept anything to first space, "/" or ">".
                            switch (char) {
                                case " ":
                                case " ":
                                case "\t":
                                case "\r":
                                case "\n":
                                    // End of value.
                                    finishAttribute = true;
                                    mode = 3;
                                    break;
                                case "/":
                                    // End of value, end of attribute without value, end of element.
                                    finishAttribute = true;
                                    mode = 7; // End of self-closing element.
                                    break;
                                case ">":
                                    // End of value, end of attribute without value, end of opening tag.
                                    finishAttribute = true;
                                    diveIntoElementContent = true;
                                    mode = 0; // End of opening tag.
                                    break;
                                default:
                                    currentAttribute.value += char;
                            }
                            break;
                        case "\"": // Accept anything to first ".
                            switch (char) {
                                case "\"":
                                    if (escapedChar) {
                                        currentAttribute.value += char;
                                        escapedChar = false;
                                    } else {
                                        // End of value.
                                        finishAttribute = true;
                                        mode = 3;
                                    }
                                    break;
                                case "\\": // Escaped char.
                                    escapedChar = !escapedChar;
                                    currentAttribute.value += char;
                                    break;
                                default:
                                    currentAttribute.value += char;
                            }
                            break;
                        case "'": // Accept anything to first '.
                            switch (char) {
                                case "\'":
                                    if (escapedChar) {
                                        currentAttribute.value += char;
                                        escapedChar = false;
                                    } else {
                                        // End of value.
                                        finishAttribute = true;
                                        mode = 3;
                                    }
                                    break;
                                case "\\": // Escaped char.
                                    escapedChar = !escapedChar;
                                    currentAttribute.value += char;
                                    break;
                                default:
                                    currentAttribute.value += char;
                            }
                            break;
                        default: // Bad value of attributeValueOpeningChar, something is wrong.
                            throw {error: 503, mode, char, pos, state: "attributeValueOpeningChar=" + attributeValueOpeningChar};
                    }

                    break;
                case 7: // 7 = End of self-closing tag.
                    switch (char) {
                        case ">":
                            finishElement = true;
                            mode = 0;
                            break;
                        default:
                            throw {error: 500, mode, char, pos};
                    }
                    break;
                case 8: // 8 = Parsing tag end.
                    // TODO remove this, it seems to be useless.
                    throw {error: 501, mode, char, pos};
                    break;
                default:
                    throw {error: 501, mode, char, pos};
            }

            // DEBUG ONLY:
            // console.log(char + ", pos=" + pos + ", mode=" + mode + ", finishAttribute=" + finishAttribute + ", diveIn=" + diveIntoElementContent + ", finishElement=" + finishElement + ", diveOut=" + diveOutOfElementContent + ".");

            if (finishAttribute) {
                currentAttribute.value = parseJsonAttributeValue(currentAttribute.value);
                currentElement.attributes.push(currentAttribute);
                currentAttribute = {name: "", value: ""};
                finishAttribute = false;
            }

            if (diveIntoElementContent) {
                currentElements.push(currentElement);
                currentElement = {name: "", attributes: [], content: []};
                diveIntoElementContent = false;
            }

            if (finishElement) {
                if (currentElements.length > 0) {
                    currentElements[currentElements.length - 1].content.push(currentElement);
                } else {
                    elements.push(currentElement);
                }
                currentElement = {name: "", attributes: [], content: []};
                finishElement = false;
            }

            if (diveOutOfElementContent) {
                if (currentElements.length > 0) {
                    currentElement = currentElements.pop();
                } else {
                    throw {error: 504, mode, char, pos};
                }
                diveOutOfElementContent = false;
            }
        }

        return elements;
    }

    function parseJsonAttributeValue(attributeValue) {
        if (attributeValue.substring(0,10) === "<uu5json/>") {
            // Unescape the JSON:
            let escapedJson = attributeValue.substring(10, attributeValue.length);
            let unescapedJson = "";
            let escapedChar = false;
            for (let i = 0; i < escapedJson.length; i++) {
                let char = escapedJson.charAt(i);
                if (escapedChar) {
                    unescapedJson += char;
                    escapedChar = false;
                } else if (char === "\\") {
                    escapedChar = true;
                } else {
                    unescapedJson += char;
                }
            }
            return JSON.parse(unescapedJson);
        } else {
            return attributeValue;
        }
    }

    function hideTextarea() {
        let textarea = document.getElementById("mnkBookKitHelperTextArea");
        let text = textarea.value;
        if (text !== "") {
            main(text);
        }
        textarea.parentElement.removeChild(textarea);
        document.getElementById("mnkBookKitHelperButton").onclick = createTextarea;
    }

    function createTextarea() {
        let textarea = document.createElement("TEXTAREA");
        textarea.placeholder = "Paste book data here";
        textarea.style.position = "absolute";
        textarea.style.right = "100px";
        textarea.style.top = "20px";
        textarea.style.zOrder = "255";
        textarea.style.backgroundColor = "yellow";
        textarea.id = "mnkBookKitHelperTextArea";
        document.body.appendChild(textarea);
        document.getElementById("mnkBookKitHelperButton").onclick = hideTextarea;
    }

    function createButton() {
        let btn = document.createElement("BUTTON");
        btn.innerHTML = "Check error list";
        btn.onclick = createTextarea;
        btn.style.cssText = "position: absolute; right: 0px, top: 0px; z-order: 255;";
        btn.style.position = "absolute";
        btn.style.right = "0px";
        btn.style.top = "0px";
        btn.style.zOrder = "255";
        btn.style.backgroundColor = "yellow";
        btn.id = "mnkBookKitHelperButton";
        document.body.appendChild(btn);
    }

    setTimeout(createButton, 10000);
})();