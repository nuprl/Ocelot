import * as Rx from 'rxjs';
import * as RxOps from 'rxjs/operators';
import { saveChanges } from './utils/api/saveFileChanges';
import { currentProgram, dirty, notification } from './state';

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

function saveRequest(): Rx.Observable<boolean> {
    dirty.next('saving');
    const p = currentProgram.getValue();
    if (p.kind !== 'program') {
        dirty.next('saved');
        return Rx.of(true);
    }

    const saveReq = saveChanges({
        fileName: p.name,
        type: 'create',
        changes: p.content
    });

    return Rx.from(saveReq)
        .pipe(RxOps.map(x => x.status === 'SUCCESS'));
}

dirty.pipe(
    RxOps.filter(x => x === 'dirty'),
    RxOps.debounceTime(1000),
    RxOps.mergeMap(saveRequest, 1))
    .subscribe(ok => {
        if (ok) {
            // Note that if there are other pending changes, then the buffer
            // may not be saved. However, the next save request, which fires
            // almost immediately, does isBufferSaved.next(false).
            dirty.next('saved');
        }
        else {
            // Suppress the notification if the browser is offline. Note that
            // we still try to save, even when the UA thinks we are offline.
            // I am not certain that online/offline detection is particularly
            // reliable, so it is not worth disabling saving when offline.
            if (navigator.onLine === false) {
                return;
            }
            notification.next({ message: `Failed to save file`, position: 'top' });
        }
    });
