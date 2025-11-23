/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("7tgkqu9k21j2epl");

  return dao.deleteCollection(collection);
}, (db) => {
  const collection = new Collection({
    "id": "7tgkqu9k21j2epl",
    "created": "2025-11-03 03:15:02.518Z",
    "updated": "2025-11-03 03:15:02.518Z",
    "name": "pis",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "eniwbnhg",
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
