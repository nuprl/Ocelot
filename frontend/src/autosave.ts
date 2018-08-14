import * as Rx from 'rxjs';
import * as RxOps from 'rxjs/operators';
import { saveChanges } from './utils/api/saveFileChanges';
import { selectedFileIndex, currentProgram, uiActive, isBufferSaved,
    notification, files } from './state';

// Index and code to save, if a file is selected
function toSaveIfSelected() {
    return selectedFileIndex.pipe(
        RxOps.switchMap(index => {
            if (index === -1) {
                return Rx.empty();
            }
            return currentProgram.pipe(
                RxOps.debounceTime(1000),
                RxOps.map(prog => ({ index: index, prog: prog })));
        }));
}

// Index and code to save, if logged in
function saveIfLoggedIn(isLoggedIn: boolean) {
    return isLoggedIn ? toSaveIfSelected() : Rx.empty();
}

function saveRequest({index, prog }: { index: number, prog: string }) {
    isBufferSaved.next(false);
    return Rx.from(saveChanges([ { 
        fileName: files.getValue()[index].name, 
        type: 'create', 
        changes: prog 
    } ]));
}

uiActive.pipe(
    // Concurrency is not an issue here.
    RxOps.mergeMap(saveIfLoggedIn),
    // Only 1 concurrent request at a time to ensure that we do not save out
    // of order.
    RxOps.mergeMap(saveRequest, 1))
    .subscribe(response => {
        if (response.status === 'SUCCESS') {
            // Note that if there are other pending changes, then the buffer
            // may not be saved. However, the next save request, which fires
            // almost immediately, does isBufferSaved.next(false).
            isBufferSaved.next(true);
        }
        else {
            notification.next({ message: `Failed to save file`, position: 'top' });
        }
    });
