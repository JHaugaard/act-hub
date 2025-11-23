/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("siwnuf9r34dv65g");

  return dao.deleteCollection(collection);
}, (db) => {
  const collection = new Collection({
    "id": "siwnuf9r34dv65g",
    "created": "2025-11-03 03:28:56.602Z",
    "updated": "2025-11-03 03:28:56.602Z",
    "name": "sponsors",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "ji5wtotl",
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
