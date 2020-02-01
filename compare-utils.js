class CompareUtils {

    compareLists(baseList, againstList) {
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
}