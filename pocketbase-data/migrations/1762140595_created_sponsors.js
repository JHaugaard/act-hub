/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "g2z46ra5odijvp4",
    "created": "2025-11-03 03:29:55.281Z",
    "updated": "2025-11-03 03:29:55.281Z",
    "name": "sponsors",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "hmfp8rwr",
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
  const collection = dao.findCollectionByNameOrId("g2z46ra5odijvp4");

  return dao.deleteCollection(collection);
})
