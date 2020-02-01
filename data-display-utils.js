class DataDisplayUtils {

    /**
     * Converts content of the section from XML (uu5string?) to string to be able to display it in human-readable way. It was here for testing purposes but can be used in future to display data.
     *
     * @param pageContent Parsed value of content attribute from one item from sectionList of BookKit page source data.
     * @returns {string} Human-readable string with input data.
     * @private
     */
    static convertPageContentToString(pageContent) { // TODO: do something with this unused method
        let parsedContentStringArray = [];
        let parsedElements = [...pageContent];
        let parsedElementLevels = [];
        while (parsedElements.length > 0) {
            let parsedElement = parsedElements.shift();
            let currentLevel = parsedElementLevels.length > 0 ? parsedElementLevels.shift() : 0;
            let rowPadding = "\t".repeat(currentLevel);
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
                    for (let i = 0; i < parsedElement.content.length; i++) {
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
}