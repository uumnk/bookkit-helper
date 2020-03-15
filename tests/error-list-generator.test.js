const { ErrorListGenerator } = require('../generators/error-list-generator');

test('Test generating error list with error containing quotation marks in its message', () => {
    // Test data:
    let errorsAndWarnings = [
        {
            code: "testQuotationMarks",
            type: "error",
            message: "This is error message with \\\"text in quotation marks\\\".",
            params: "{\\n  \\\"these\\\": \\\"are props in quotation marks\\\"\\n}"
        }
    ];
    let errorPrefix = "testPrefix";

    // Test the method:
    let errorListGenerator = new ErrorListGenerator();
    let testResult = errorListGenerator.generateErrorListString(errorsAndWarnings, errorPrefix);
    expect(testResult).toBe('  {\n    "content": "<uu5string/>\\n<UU5.Bricks.Lsi>\\n  <UU5.Bricks.Lsi.Item language=\\"en\\">\\n    <UU5.Bricks.Section header=\\"Error List\\">\\n        <UU5.Bricks.Text>\\n          Error format: testPrefix/{errorCode}\\n       </UU5.Bricks.Text>\\n      <UuApp.DesignKit.UuCmdErrorList data=\'<uu5json/>[\\n  [\\n    \\"testQuotationMarks\\",\\n    \\"Error\\",\\n    \\"This is error message with \\\\\\\\\\"text in quotation marks\\\\\\\\\\".\\",\\n    \\"{ \\\\\\\\\\"these\\\\\\\\\\": \\\\\\\\\\"are props in quotation marks\\\\\\\\\\" }\\"\\n  ]\\n]\'/>\\n    </UU5.Bricks.Section>\\n  </UU5.Bricks.Lsi.Item>\\n</UU5.Bricks.Lsi>"\n  }');
});

// TODO: test without error prefix (=> default error prefix), with error prefix ending with "/", with error prefix not ending with "/".
// TODO: test with new line in error message