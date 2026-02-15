/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId('pbc_672729168');

  // update collection data
  unmarshal({
    'listRule': 'teacher = @request.auth.email',
    'viewRule': 'teacher = @request.auth.email'
  }, collection);

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId('pbc_672729168');

  // update collection data
  unmarshal({
    'listRule': null,
    'viewRule': null
  }, collection);

  return app.save(collection);
});
