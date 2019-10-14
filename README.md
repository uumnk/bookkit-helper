# bookkit-helper
Makes usage of BookKit a little bit better.

Attention! It is quickly written helper and it is not tested well yet. It can be very buggy but it does not write anything into BookKit so you can end with errors in console or not loaded page.

Quick guide:
1. Put mnk_bookkit_helper.js into Tampermonkey addon for Firefox and turn it on.
2. (Re)load some BookKit page with Algorithm and Error List (for example some uuCmd).
3. Small yellow button "Check error list" should appear in the top right corner (on the top of the user menu button). If not, verify if it is installed correctly.
4. Open browser console.
5. Click the button.
6. Small yellow textarea should appear.
7. Fill the form with code from "Page" -> "Update Source Data".
8. Click the button again.
9. Check the console for result.
