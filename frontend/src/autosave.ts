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
    return Rx.from(saveChanges([ { 
        fileName: files.getValue()[index].name, 
        type: 'create', 
        changes: prog 
    } ]));
}

uiActive.pipe(
    RxOps.switchMap(saveIfLoggedIn),
    RxOps.switchMap(saveRequest))
    .subscribe(response => {
        if (response.status === 'SUCCESS') {
            isBufferSaved.next(true);
        }
        else {
            notification.next({ message: `Failed to save file`, position: 'top' });
        }
    });
