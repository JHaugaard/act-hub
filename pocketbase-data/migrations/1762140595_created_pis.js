/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "tiye4jdvdsuixiz",
    "created": "2025-11-03 03:29:55.276Z",
    "updated": "2025-11-03 03:29:55.276Z",
    "name": "pis",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "yp6s0sfy",
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
  const collection = dao.findCollectionByNameOrId("tiye4jdvdsuixiz");

  return dao.deleteCollection(collection);
})
