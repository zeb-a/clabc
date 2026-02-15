/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId('pbc_672729168');

  // update collection data
  unmarshal({
    'createRule': 'teacher = @request.auth.email',
    'deleteRule': 'teacher = @request.auth.email',
    'updateRule': 'teacher = @request.auth.email'
  }, collection);

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId('pbc_672729168');

  // update collection data
  unmarshal({
    'createRule': '@request.auth.id != ""',
    'deleteRule': '@request.auth.id != ""',
    'updateRule': '@request.auth.id != ""'
  }, collection);

  return app.save(collection);
});
