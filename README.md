# bookkit-helper
Makes usage of BookKit a little bit better.

Attention! It is quickly written helper and it is not tested well yet. It can be very buggy but it does not write anything into BookKit so you can "only" end with errors in console or not loaded page.

Quick guide:
1. Put MnkBookKitHelper.user.js into Tampermonkey addon for Firefox and turn it on.
2. (Re)load some BookKit page with Algorithm and Error List (for example some uuCmd).
3. Small yellow button "Check error list" should appear in the top right corner (on the top of the user menu button). If not, verify if it is installed correctly.
4. Click the button.
5. Yellow textarea should appear.
6. Fill the form with code from "Page" -> "Update Source Data".
7. Click the button again.
8. Result should be displayed in the same textarea and it is also written into browser console with some objects (if your browser supports objects output into console).
9. Click the button again to close the text area (it's content will be deleted!).
