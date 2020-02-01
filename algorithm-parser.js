class AlgorithmParser {
    extractErrorsAndWarningsFromAlgorithm(pageContent) {
        // TODO Quick implementation, write it better!
        let bookkitParser = new BookkitParser();
        let childAlgorithmDataValue = bookkitParser.extractBrickDataValue(pageContent, "UuApp.DesignKit.Algorithm");
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
        let bookkitParser = new BookkitParser();
        let childAlgorithmDataValue = bookkitParser.extractBrickDataValue(pageContent, "UuApp.DesignKit.Algorithm");
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