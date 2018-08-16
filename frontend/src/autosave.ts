import * as Rx from 'rxjs';
import * as RxOps from 'rxjs/operators';
import { saveChanges } from './utils/api/saveFileChanges';
import { currentProgram, currentFileName, dirty,
    notification } from './state';

function saveRequest() {
    dirty.next('saving');
    window.onbeforeunload = function() {
        return true;
    };
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
            window.onbeforeunload = function() {
                return null;
            };
        }
        else {
            notification.next({ message: `Failed to save file`, position: 'top' });
        }
    });
