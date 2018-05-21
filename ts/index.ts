
import * as storage from '@google-cloud/storage';

const sto = storage();
const bucket = sto.bucket('paws-student-files');

async function pawsMain(req: any) {
  const [file] = await bucket.file('test.pdf').get();
  const [buffer] =  await file.download();
  return buffer.toString();
}

export function paws(req: any, res: any) {
  pawsMain(req).then(body => res.status(200).send(body));
}