import { EJSVERSION } from '@stopify/elementary-js/dist/version';
import { OCELOTVERSION } from './version';
import { getUrl } from './utils/api/apiHelpers';

type RespType = 'json' | 'text';

function respHandler(resp: Response, respType?: RespType): Promise<any> {
  if (!resp.ok) {
    throw new Error(`Code ${resp.status} from ${resp.url}.`);
  }

  switch (respType) {
    case 'text':
      return resp.text();
    default: // 'json'
      return resp.json();
  }
}

export async function postJson(path: string,
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

  return await respHandler(await fetch(getUrl(path), {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
  }));
}

export async function getJson(path: string): Promise<any> {
  return await respHandler(await fetch(path));
}

export async function getText(path: string): Promise<any> {
  return await respHandler(await fetch(path), 'text');
}
