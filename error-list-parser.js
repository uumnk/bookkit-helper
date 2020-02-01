class ErrorListParser {

    getErrorCodesListFromErrorList(errorList) {
        let errorCodes = [];
        for (let error of errorList) {
            errorCodes.push(error[0]);
        }
        return errorCodes;
    }

    extractErrorsAndWarningsFromErrorList(pageContent) {
        // TODO Quick implementation, write it better!
        let childErrorListDataValue = DataExtractUtils.extractBrickDataValue(pageContent, "UuApp.DesignKit.UuCmdErrorList");
        if (childErrorListDataValue != null) {
            return childErrorListDataValue;
        }
        return null;
    }
}