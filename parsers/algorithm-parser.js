class AlgorithmParser {
    constructor() {
        // This is the way to make possible to load classes via JS modules if it is run by test or use already loaded classes if it is run via HTML or Tampermonkey.
        this._DataExtractUtils = typeof module !== "undefined" ? require('../utils/data-extract-utils.js').DataExtractUtils : DataExtractUtils;
    }

    extractErrorsAndWarningsFromAlgorithm(pageContent) {
        // TODO Quick implementation, write it better!
        let childAlgorithmDataValue = this._DataExtractUtils.extractBrickDataValue(pageContent, "UuApp.DesignKit.Algorithm");
        if (childAlgorithmDataValue != null) {
            let statementList = childAlgorithmDataValue.statementList;
            let flatStatementList = this._extractAllStatements(statementList);
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

    getErrorCodesListFromAlgorithmErrors(errorsAndWarnings) {
        let errorCodes = [];
        for (let error of errorsAndWarnings) {
            errorCodes.push(error.code);
        }
        return errorCodes;
    }

    extractErrorPrefixFromAlgorithm(pageContent) {
        let childAlgorithmDataValue = this._DataExtractUtils.extractBrickDataValue(pageContent, "UuApp.DesignKit.Algorithm");
        if (childAlgorithmDataValue != null) {
            return childAlgorithmDataValue.errorPrefix;
        }
        return null;
    }

    _extractAllStatements(statementList) {
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
}

if (typeof module !== "undefined") {
    // If run via test, this is needed to make the test work.
    module.exports = { AlgorithmParser };
}