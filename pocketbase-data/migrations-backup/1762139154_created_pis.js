/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "m2bfzlvuetukw3p",
    "created": "2025-11-03 03:05:54.064Z",
    "updated": "2025-11-03 03:05:54.064Z",
    "name": "pis",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "mzuiolhp",
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
  const collection = dao.findCollectionByNameOrId("m2bfzlvuetukw3p");

  return dao.deleteCollection(collection);
})
