const database = db.getSiblingDB(process.env.MONGO_INITDB_DATABASE || 'benchmark')
const world = database.getCollection('world')

world.createIndex({ id: 1 }, { unique: true })

if (world.countDocuments() === 0) {
  for (let id = 1; id <= 100000; id += 1000) {
    world.insertMany(
      Array.from({ length: 1000 }, (_, index) => ({
        id: id + index,
        random_number: Math.floor(Math.random() * 1000001),
      })),
    )
  }
}

const highest = world.find().sort({ id: -1 }).limit(1).next()
database
  .getCollection('counters')
  .updateOne({ _id: 'world' }, { $max: { seq: highest ? highest.id : 0 } }, { upsert: true })
