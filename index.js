const port = 3000
const express = require('express')
const app = express()
const MongoClient = require ('mongodb').MongoClient
const url = "mongodb://root:password@localhost:27017"
const ObjectId = require('mongodb').ObjectId
app.use(express.urlencoded({extended: true}))

var cors = require('cors')

app.use(cors())
app.use(express.json());

const connToDb = (callback) => {

    MongoClient.connect(url, {}, async (error, client) => {
        const db = client.db('hyperlynx')
        const collection = db.collection('todolist')
        console.log('yes, you have connected the db')
        callback(collection)
    })
// is collection now set to be a method?
}
app.get('/', async(req,res) => {
    connToDb(async (collection) => {
        const todolist = await collection.find({}).toArray()
        res.json({todolist})
    })
})

app.get('/uncompleted', async(req,res) => {
    connToDb(async (collection) => {
        const todolist = await collection.find({completed: false}).toArray()
        res.json({todolist})
    })
})

app.get('/completed', async(req,res) => {
    connToDb(async (collection) => {
        const todolist = await collection.find({completed: true}).toArray()
        res.json({todolist})
    })
})

app.put('/markAsComplete/:id', (req,res) => {
    const id = ObjectId(req.params.id)
    connToDb(async(collection)=>{
        const result = await collection.updateOne({_id: id},{$set: {completed: true}})
        if (result.acknowledged) {
            res.json({success: true, data: result})
            console.log('marked as complete')
        } else {
            res.json({success: false, data: result})
            console.log('failed to mark as complete')
        }
    })
})

app.put('/markAsUncomplete/:id', (req,res) => {
    const id = ObjectId(req.params.id)
    connToDb(async(collection)=>{
        const result = await collection.updateOne({_id: id},{$set: {completed: false}})
        if (result.acknowledged) {
            res.json({success: true, data: result})
            console.log('marked as uncomplete')
        } else {
            res.json({success: false, data: result})
            console.log('failed to mark as uncomplete')
        }
    })
})

app.post('/add', async(req, res) => {
    const newToDoItem = {
        item: req.body.item,
        completed: req.body.completed
    }
    connToDb(async(collection)=>{
        const result = await collection.insertOne(newToDoItem)
        if (result.acknowledged) {
            res.json({success: true, data: result})
            console.log('Added')
        } else {
            res.json({success: false, data: result})
            console.log('Failed to add')
        }
    })
})

app.delete('/remove/:id', (req, res) => {
    const id = ObjectId(req.params.id)
    connToDb(async(collection) => {
        const result = await collection.deleteOne({_id: id})
        if(result.acknowledged) {
            res.json({success: true, data: result})
            console.log('ID: '+ id + ' has been deleted')
        } else {
            res.json({success: false, data: result})
            console.log('ID: '+ id + 'failed to be deleted')
        }
    })
})

app.put('/edit', (req,res) => {
    const id = ObjectId(req.body.id)
    const item = req.body.item
    connToDb(async(collection)=>{
        const result = await collection.updateOne({_id: id},{$set: {item: item}})
        if (result.acknowledged) {
            res.json({success: true, data: result})
            console.log('itemEdited')
        } else {
            res.json({success: false, data: result})
            console.log('failed to edit item')
        }
    })
})


app.listen(port)
