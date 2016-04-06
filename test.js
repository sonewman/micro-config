const desc = require('macchiato');
const Config = require('./').Config;

desc('disposition')
.it('should set config and retrieve value', function (t) {
  const config = new Config({ a: { b: 1 } });
  t.equals(config.get('a.b'), 1);
  t.eqls(config.get('a'), { b: 1 });
  t.end();
})
.it('should return same value each time it is called with same key', function (t) {
  const config = new Config({ a: { b: { c: { d: 1 } } } });
  const c1 = config.get('a.b');
  const c2 = config.get('a.b');

  t.eqls(c1, { c: { d: 1 } });
  t.eqls(c2, { c: { d: 1 } });
  t.equals(c1, c2);

  t.end();
})
.it('should allow data to be updated returning new value', function (t) {
  const config = new Config({ a: { b: 1 } });
  t.equals(config.get('a.b'), 1);
  
  config.update({ a : { b: 2 } });
  t.equals(config.get('a.b'), 2);
  t.end();
})
.it('should allow other data to be added uneffected', function (t) {
  const config = new Config({ a: { b: 1 } });
  
  config.update({ a: { a: 2 } });

  t.equals(config.get('a.b'), 1);
  t.equals(config.get('a.a'), 2);
  t.end();
})
.it('should allow keys to be updated', function (t) {
  const config = new Config({ a: { b: 1 } });
  t.eqls(config.get('a'), { b: 1 });
  
  config.update('a', { b: 2 });
  t.eqls(config.get('a'), { b: 2 });

  config.update('a', { a: 1 });
  t.eqls(config.get('a'), { a: 1, b: 2 });

  t.end();
})
.it('should allow deep non existing key generation on update', function (t) {
  const config = new Config({ a: { b: 1 } });
  
  config.update('a.a.b.c', { a: 2 });
  t.eqls(config.get('a'), { a: { b: { c: { a: 2 } } }, b: 1 });
  t.end();
})
.it('should allow keys to be set', function (t) {
  const config = new Config({ a: { b: 1 } });
  
  config.set('a.a.b.c', { a: 2 });
  t.eqls(config.get('a'), { a: { b: { c: { a: 2 } } }, b: 1 });

  config.set('a.a.b.c', { a: 3 });
  t.eqls(config.get('a'), { a: { b: { c: { a: 3 } } }, b: 1 });

  config.set('a.a', { b: { c: { a: 4 } } });
  t.eqls(config.get('a'), { a: { b: { c: { a: 4 } } }, b: 1 });
  t.eqls(config.get('a.a.b.c'), { a: 4 });

  t.end();
});
