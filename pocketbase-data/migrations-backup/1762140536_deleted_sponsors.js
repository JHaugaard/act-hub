/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("m7c0y1bsy1vm5fp");

  return dao.deleteCollection(collection);
}, (db) => {
  const collection = new Collection({
    "id": "m7c0y1bsy1vm5fp",
    "created": "2025-11-03 03:27:02.792Z",
    "updated": "2025-11-03 03:27:02.792Z",
    "name": "sponsors",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "yoxjgebq",
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
