/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("ezqlw744rol0zvh");

  return dao.deleteCollection(collection);
}, (db) => {
  const collection = new Collection({
    "id": "ezqlw744rol0zvh",
    "created": "2025-11-03 03:28:13.387Z",
    "updated": "2025-11-03 03:28:13.387Z",
    "name": "test_select",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "feb5pdcz",
        "name": "status",
        "type": "select",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "In",
            "Pending",
            "Process",
            "Done"
          ]
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
