class DataExtractUtils {

    /**
     * Find a brick in page content object and return the data value from it.
     *
     * @param pageContent Result of the parsePageData method - Object made of source data with content of each section replaced with result of _parseSectionContent method.
     * @param brickName Name of the brick to take data from.
     * @returns {null|undefined} Return brick data value or null if nothing was found.
     */
    static extractBrickDataValue(pageContent, brickName) {
        let pageKeys = Object.keys(pageContent);
        for (let pageKey of pageKeys) {
            if (pageKey === "sectionList") {
                let sectionList = pageContent[pageKey];
                for (let section of sectionList) {
                    let sectionKeys = Object.keys(section);
                    for (let sectionKey of sectionKeys) {
                        if (sectionKey === "content") {
                            let content = section[sectionKey];
                            if (content == null) {
                                continue;
                            }

                            // Try to search through LSIs:
                            let parent = content;
                            do {
                                let childLsi = DataExtractUtils._extractChildWith(parent, "name", "UU5.Bricks.Lsi");
                                if (childLsi != null) {
                                    let childLsiItem = DataExtractUtils._extractChildWith(childLsi.content, "name", "UU5.Bricks.Lsi.Item", "language", "en");
                                    if (childLsiItem != null) {
                                        let theBrick = DataExtractUtils._tryToExtractTheBrickDataValue(childLsiItem.content, brickName);
                                        if (theBrick != null) {
                                            return theBrick;
                                        }
                                        parent = childLsiItem.content;
                                        continue;
                                    }
                                }
                                break;
                            } while (parent != null);

                            // Try to at least get the brick out of LSI:
                            let theBrickOutOfLsi = DataExtractUtils._tryToExtractTheBrickDataValue(content, brickName);
                            if (theBrickOutOfLsi != null) {
                                return theBrickOutOfLsi;
                            }
                        }
                    }
                }
                break;
            }
        }
        return null;
    }

    /**
     * Extract and returns data of the given brick.
     *
     * @param parent Parent object to look for the child in.
     * @param brickName Name of the child to get data of.
     * @returns {*} Data of the found child or nothing if the child was not found.
     * @private
     */
    static _tryToExtractTheBrickDataValue(parent, brickName) {
        let childBrick = DataExtractUtils._extractChildWith(parent, "name", brickName);
        if (childBrick == null) {
            let childSection = DataExtractUtils._extractChildWith(parent, "name", "UU5.Bricks.Section");
            if (childSection != null) {
                childBrick = DataExtractUtils._extractChildWith(childSection.content, "name", brickName);
            }
        }
        if (childBrick != null) {
            let childBrickData = DataExtractUtils._extractChildWith(childBrick.attributes, "name", "data");
            if (childBrickData != null) {
                return childBrickData.value;
            }
        }
    }

    /**
     * Finds child in {@param children} array which has attribute {@param key} with value {@param value}.
     * If {@param attributeKey} is given, the child must have an attribute "name" in its attributes attribute which value equals to {@param attributeKey}
     * and attribute value of that attribute have to equal to {@param attributeValue}.
     *
     * @param children Array of children to search in.
     * @param key Key to find child with.
     * @param value Value of the key to find child with.
     * @param attributeKey The child must have an attribute "name" in its attributes attribute with this value if it is not null.
     * @param attributeValue Attribute matched by {@param attributeKey} must have attribute value which equals this param.
     * @returns {null} Found child or null if the child was not found.
     * @private
     */
    static _extractChildWith(children, key, value, attributeKey, attributeValue) {
        for (let child of children) {
            if (child[key] === value) {
                if (attributeKey != null) {
                    let attribute = DataExtractUtils._extractChildWith(child.attributes, "name", attributeKey);
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
}