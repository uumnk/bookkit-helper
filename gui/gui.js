class Gui {
    hideTextarea(processDataCallback) {
        let textarea = document.getElementById("mnkBookKitHelperTextArea");
        textarea.parentElement.removeChild(textarea);
        let btn = document.getElementById("mnkBookKitHelperButton");
        btn.onclick = () => { this.createTextarea(processDataCallback); };
        btn.innerHTML = "Check / generate error list";
    }

    processData(processDataCallback) {
        let textarea = document.getElementById("mnkBookKitHelperTextArea");
        let text = textarea.value;
        if (text !== "") {
            textarea.value = processDataCallback(text);
            let btn = document.getElementById("mnkBookKitHelperButton");
            btn.onclick = () => { this.hideTextarea(processDataCallback); };
            btn.innerHTML = "Close text area";
        } else {
            this.hideTextarea();
        }
    }

    createTextarea(processDataCallback) {
        let textarea = document.createElement("TEXTAREA");
        textarea.placeholder = "Paste book data from \"Page\" -> \"Update Source Data\" here.";
        textarea.rows = 10;
        textarea.cols = 100;
        textarea.wrap = "off";
        textarea.style.position = "fixed";
        textarea.style.right = "100px";
        textarea.style.top = "20px";
        textarea.style.zOrder = "255";
        textarea.style.backgroundColor = "yellow";
        textarea.id = "mnkBookKitHelperTextArea";
        document.body.appendChild(textarea);
        let btn = document.getElementById("mnkBookKitHelperButton");
        btn.onclick = () => { this.processData(processDataCallback); };
        btn.innerHTML = "Process data";
    }

    createButton(processDataCallback) {
        let btn = document.createElement("BUTTON");
        btn.innerHTML = "Check / generate error list";
        btn.onclick = () => { this.createTextarea(processDataCallback); };
        btn.style.cssText = "position: absolute; right: 0px, top: 0px; z-order: 255;";
        btn.style.position = "fixed";
        btn.style.right = "0px";
        btn.style.top = "0px";
        btn.style.zOrder = "255";
        btn.style.backgroundColor = "yellow";
        btn.id = "mnkBookKitHelperButton";
        document.body.appendChild(btn);
    }
}