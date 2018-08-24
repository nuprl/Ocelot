import { EJSVERSION } from 'elementary-js/dist/version';
import { OCELOTVERSION } from './version';
import { getUrl } from './utils/api/apiHelpers';

export async function postJson(
    path: string,
    fields: { [key: string]: any }): Promise<any> {
    const body: any = {
        userEmail: localStorage.getItem('userEmail'),
        sessionId: localStorage.getItem('sessionId'),
        ejsVersion: EJSVERSION,
        ocelotVersion: OCELOTVERSION 
    };
    for (const k of Object.keys(fields)) {
        body[k] = fields[k];
    }
    const resp = await fetch(getUrl(path), {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
    });
    if (resp.status !== 200) {
        throw new Error(`code ${resp.status} from ${path}`);
    }
    return await resp.json();
}