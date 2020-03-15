class ErrorListGenerator {

    /**
     * Generates uu5string code of content of Error List.
     *
     * @param errorsAndWarnings array of error object from Algorithm component (error object contains attributes: code, type, message and params).
     * @param errorPrefix prefix of errors from Algorithm component. If is null or empty, the default prefix "{uuApp}-{uuSubApp}/{uuCmd}/" is used.
     * @returns {string} uu5string code of content of Error List to be inserted into sectionList in uu5string source code of the BookKit page.
     */
    generateErrorListString(errorsAndWarnings, errorPrefix) {
        if (errorPrefix) {
            if (errorPrefix.charAt(errorPrefix.length - 1) !== "/") {
                errorPrefix += "/";
            }
        } else {
            errorPrefix = "{uuApp}-{uuSubApp}/{uuCmd}/";
        }
        let errorListString = `  {` + "\n";
        errorListString += `    "content": "<uu5string/>\\n<UU5.Bricks.Lsi>\\n  <UU5.Bricks.Lsi.Item language=\\"en\\">\\n    <UU5.Bricks.Section header=\\"Error List\\">\\n        <UU5.Bricks.Text>\\n          Error format: ${errorPrefix}{errorCode}\\n       </UU5.Bricks.Text>\\n      <UuApp.DesignKit.UuCmdErrorList data='<uu5json/>[`;
        let usedErrors = [];
        for (let i = 0; i < errorsAndWarnings.length; i++) {
            let error = errorsAndWarnings[i];
            let code = error.code.trim();

            // Skip duplicate errors and errors without code:
            if (!code || usedErrors.includes(code)) {
                continue;
            }
            usedErrors.push(code);

            let type = error.type.charAt(0).toUpperCase() + error.type.slice(1).replace(/\n/g, "").trim();
            let message = error.message.replace(/\n/g, "").replace(/"/g, "\\\\\\\\\"").trim();
            let params = error.params.replace(/"/g, "\\\\\\\\\"").trim();
            let paramsArray = params.split("\\n");
            for (let j = 0; j < paramsArray.length; j++) {
                paramsArray[j] = paramsArray[j].replace(/\/\/.*$/, "").trim();
            }
            params = paramsArray.join("\\n").replace(/\\n/g, " ");
            let props = `,\\n    \\"${params}\\"\\n`;

            errorListString += `\\n  [\\n    \\"${code}\\",\\n    \\"${type}\\",\\n    \\"${message}\\"${props}  ]`;
            errorListString += i === errorsAndWarnings.length - 1 ? "" : ",";
        }

        errorListString += `\\n]'/>\\n    </UU5.Bricks.Section>\\n  </UU5.Bricks.Lsi.Item>\\n</UU5.Bricks.Lsi>"` + "\n";
        errorListString += `  }`;
        return errorListString;
    }
}

if (typeof module !== "undefined") {
    // If run via test, this is needed to make the test work.
    module.exports = { ErrorListGenerator };
}