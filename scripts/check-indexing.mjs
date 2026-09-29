import assert from 'node:assert/strict';
import {resolveSiteConfig} from '../lib/site-config.mjs';
const domain = {SITE_URL:'https://ohhzaz.com'};
for (const CONTEXT of [undefined,'production','deploy-preview','branch-deploy']) {
  for (const SITE_INDEXABLE of [undefined,'false','true']) {
    assert.equal(resolveSiteConfig({...domain,CONTEXT,SITE_INDEXABLE}).indexable,
      SITE_INDEXABLE==='true' && (!CONTEXT || CONTEXT==='production'));
  }
}
assert.equal(resolveSiteConfig({SITE_URL:'http://localhost:3000',SITE_INDEXABLE:'true'}).indexable,false);
assert.equal(resolveSiteConfig({...domain,SITE_INDEXABLE:'false'}).indexable,false);
assert.equal(resolveSiteConfig({SITE_URL:'https://ohhzaz.com/fr'}).origin,'https://ohhzaz.com');
assert.throws(()=>resolveSiteConfig({SITE_URL:'https://user:secret@example.com'}));
console.log('PASS indexing opt-out, explicit opt-in, preview isolation and canonical origin');
