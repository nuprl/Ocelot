import * as Rx from 'rxjs';
import * as RxOps from 'rxjs/operators';
import { saveChanges } from './utils/api/saveFileChanges';
import { currentProgram, currentFileName, dirty,
    notification } from './state';

window.addEventListener('beforeunload', (event) => {
    if (dirty.getValue() === 'saved') {
        return null;
    }
    else {
        // NOTE(arjun): It does not appear to actually show this message.
        event.returnValue = `You may lose changes if you close the page.`;
        return true;
    }
});

function saveRequest() {
    dirty.next('saving');
    return Rx.from(saveChanges([ { 
        fileName: currentFileName(),
        type: 'create', 
        changes: currentProgram.getValue()
    } ]));
}

dirty.pipe(
    RxOps.filter(x => x === 'dirty'),
    RxOps.debounceTime(1000),
    RxOps.mergeMap(saveRequest, 1))
    .subscribe(response => {
        if (response.status === 'SUCCESS') {
            // Note that if there are other pending changes, then the buffer
            // may not be saved. However, the next save request, which fires
            // almost immediately, does isBufferSaved.next(false).
            dirty.next('saved');
        }
        else {
            notification.next({ message: `Failed to save file`, position: 'top' });
        }
    });
