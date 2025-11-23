/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "ejw6c4vlysem7yh",
    "created": "2025-11-03 03:28:56.598Z",
    "updated": "2025-11-03 03:28:56.598Z",
    "name": "pis",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "vzeu5e3w",
        "name": "name",
        "type": "text",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      }
    ],
    "indexes": [],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("ejw6c4vlysem7yh");

  return dao.deleteCollection(collection);
})
