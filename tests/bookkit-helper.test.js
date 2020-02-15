const {processData} = require('../bookkit-helper.user');

test('Test start of the application', () => {
    expect(processData("{}")).toBe("No errors or warnings were found in Algorithm or no Algorithm found.\n" +
        "No errors in Error List or no Error List found.\n" +
        "Can not continue with comparing.\n");
});

// TODO: Add more tests.