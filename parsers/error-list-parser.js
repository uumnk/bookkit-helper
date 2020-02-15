class ErrorListParser {
    constructor() {
        // This is the way to make possible to load classes via JS modules if it is run by test or use already loaded classes if it is run via HTML or Tampermonkey.
        this._DataExtractUtils = typeof module !== "undefined" ? require('../utils/data-extract-utils.js').DataExtractUtils : DataExtractUtils;
    }

    getErrorCodesListFromErrorList(errorList) {
        let errorCodes = [];
        for (let error of errorList) {
            errorCodes.push(error[0]);
        }
        return errorCodes;
    }

    extractErrorsAndWarningsFromErrorList(pageContent) {
        // TODO Quick implementation, write it better!
        let childErrorListDataValue = this._DataExtractUtils.extractBrickDataValue(pageContent, "UuApp.DesignKit.UuCmdErrorList");
        if (childErrorListDataValue != null) {
            return childErrorListDataValue;
        }
        return null;
    }
}

if (typeof module !== "undefined") {
    // If run via test, this is needed to make the test work.
    module.exports = { ErrorListParser };
}