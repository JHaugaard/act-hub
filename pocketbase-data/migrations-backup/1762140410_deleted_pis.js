/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("nj3csjj010ojxp0");

  return dao.deleteCollection(collection);
}, (db) => {
  const collection = new Collection({
    "id": "nj3csjj010ojxp0",
    "created": "2025-11-03 03:25:16.644Z",
    "updated": "2025-11-03 03:25:16.644Z",
    "name": "pis",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "eanxxhik",
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
