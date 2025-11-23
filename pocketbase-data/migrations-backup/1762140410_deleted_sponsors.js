/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("vrutaosnimoqclg");

  return dao.deleteCollection(collection);
}, (db) => {
  const collection = new Collection({
    "id": "vrutaosnimoqclg",
    "created": "2025-11-03 03:25:16.648Z",
    "updated": "2025-11-03 03:25:16.648Z",
    "name": "sponsors",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "ztqukbpj",
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
})
