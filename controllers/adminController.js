const Category = require('../models/Category')
const Bank = require('../models/Bank')
const Item = require('../models/Item')
const Image = require('../models/Image')
const Feature = require('../models/Feature')
const Activity = require('../models/Activity')
const Booking = require('../models/Booking')
const Member = require('../models/Member')
const User = require('../models/User')
const fs = require('fs-extra')
const path = require('path')
const bcrypt = require('bcryptjs')

module.exports = {
   viewSignin: async (req, res) =>{
      try {
         const alertMessage = req.flash('alertMessage')
         const alertStatus = req.flash('alertStatus')
         const alert = {message: alertMessage, status: alertStatus}
         if(req.session.user == null || req.session.user == undefined) {
            res.render('index',{
               alert,
               title: 'Staycation | Login'
            })
         }else{
            res.redirect('/admin/dashboard')
         }
      } catch (error) {
         res.redirect('admin/signin')
      }
   },
   actionSignin: async (req, res) => {
      try {
         const {username,password} = req.body;
         const user = await User.findOne({username: username})
         if(!user) {
            req.flash('alertMessage','Username yang anda masukkan salah')
            req.flash('alertStatus','danger')
            res.redirect('/admin/signin')
         }
         const isPasswordMatch = await bcrypt.compare(password, user.password)
         if(!isPasswordMatch){
            req.flash('alertMessage','Password yang anda masukkan salah')
            req.flash('alertStatus','danger')
            res.redirect('/admin/signin')
         }

         req.session.user = {
            id: user.id,
            username: user.username
         }

         res.redirect('/admin/dashboard')
      } catch (error) {
         res.redirect('/admin/signin')
      }
   },
   actionSignout: async (req, res) => {
      req.session.destroy()
      res.redirect('/admin/signin')
   },
   viewDashboard: async (req,res)=>{
      try {
         const member = await Member.find()
         const booking = await Booking.find()
         const item = await Item.find()
         res.render('admin/dashboard/view_dashboard',{ 
            member,
            booking,
            item,
            title: 'Staycation | Dashboard',
            user:req.session.user
         })
         
      } catch (error) {
         
      }
   },
   viewCategory: async (req,res)=>{
      try {
         const category = await Category.find()
         const alertMessage = req.flash('alertMessage')
         const alertStatus = req.flash('alertStatus')
         const alert = {message: alertMessage, status: alertStatus}
         res.render('admin/category/view_category',{
            category,
            alert,
            title: 'Staycation | Category',
            user:req.session.user
         })
      } catch (error) {
         res.render('admin/category')
      }
   },
   addCategory: async (req,res)=>{
      try {
         const {name} = req.body
         await Category.create({name})
         req.flash('alertMessage','Success Add Category')
         req.flash('alertStatus','success')
         res.redirect('/admin/category')
      } 
      catch (error) {
         req.flash('alertMessage',`${error.message}`)
         req.flash('alertStatus',`danger`)
         res.redirect('/admin/category')
      }
   },
   editCategory: async (req,res)=>{
      try {
         const {id,name} = req.body
         const category = await Category.findOne({_id:id})
         category.name = name
         req.flash('alertMessage','Success Update Category')
         req.flash('alertStatus','success')
         await category.save()
         res.redirect('/admin/category')
      } catch (error) {
         req.flash('alertMessage',`${error.message}`)
         req.flash('alertStatus',`danger`)
         res.redirect('/admin/category')
      }
   },
   deleteCategory: async (req,res)=>{
      try {
         const {id} = req.params
         const category = await Category.findOne({_id:id})
         req.flash('alertMessage','Success Delete Category')
         req.flash('alertStatus','success')
         await category.remove()
         res.redirect('/admin/category')
      } catch (error) {
         req.flash('alertMessage',`${error.message}`)
         req.flash('alertStatus',`danger`)
         res.redirect('/admin/category')
      }
   },
   viewBank: async (req,res)=>{
      try {
         const bank = await Bank.find()
         const alertMessage = req.flash('alertMessage')
         const alertStatus = req.flash('alertStatus')
         const alert = {message: alertMessage, status: alertStatus}
         res.render('admin/bank/view_bank',{
            bank,
            alert,
            title: 'Staycation | bank',
            user:req.session.user
         })
      } catch (error) {
         res.render('admin/bank')
      }
   },
   addBank: async (req,res)=>{
      try {
         const {nameBank,nomorRekening,name} = req.body
         await Bank.create({
            nameBank,
            nomorRekening,
            name,
            imageUrl : `images/${req.file.filename}`
         })
         req.flash('alertMessage','Success Add Bank')
         req.flash('alertStatus','success')
         res.redirect('/admin/bank')
      } 
      catch (error) {
         req.flash('alertMessage',`${error.message}`)
         req.flash('alertStatus',`danger`)
         res.redirect('/admin/bank')
      }
   },
   editBank: async (req,res)=>{
      try {
         const {id,nameBank,nomorRekening,name} = req.body
         const bank = await Bank.findOne({_id:id})
         if(req.file == undefined){
            bank.nameBank = nameBank
            bank.nomorRekening = nomorRekening
            bank.name = name
            req.flash('alertMessage','Success Update Bank')
            req.flash('alertStatus','success')
            await bank.save()
            res.redirect('/admin/bank')
         } else {
            fs.unlink(path.join(`public/${bank.imageUrl}`))
            bank.nameBank = nameBank
            bank.nomorRekening = nomorRekening
            bank.name = name
            bank.imageUrl = `images/${req.file.filename}`
            req.flash('alertMessage','Success Update Bank')
            req.flash('alertStatus','success')
            await bank.save()
            res.redirect('/admin/bank')
         }
      } catch (error) {
         req.flash('alertMessage',`${error.message}`)
         req.flash('alertStatus',`danger`)
         res.redirect('/admin/category')
      }
   },
   deleteBank: async (req,res)=>{
      try {
         const {id} = req.params
         const bank = await Bank.findOne({_id:id})
         fs.unlink(path.join(`public/${bank.imageUrl}`))
         req.flash('alertMessage','Success Delete Bank')
         req.flash('alertStatus','success')
         await bank.remove()
         res.redirect('/admin/bank')
      } catch (error) {
         req.flash('alertMessage',`${error.message}`)
         req.flash('alertStatus',`danger`)
         res.redirect('/admin/bank')
      }
   },
   viewItem: async (req,res)=>{
      try {
         const item = await Item.find()
            .populate({path:'imageId', select:'id imageUrl' })
            .populate({path:'categoryId', select:'id name' })
         const category = await Category.find()
         const alertMessage = req.flash('alertMessage')
         const alertStatus = req.flash('alertStatus')
         const alert = {message: alertMessage, status: alertStatus}
         res.render('admin/item/view_item',{
            item,
            category,
            alert,
            action: 'view',
            title: 'Staycation | Item',
            user:req.session.user
         })
      } catch (error) {
         req.flash('alertMessage',`${error.message}`)
         req.flash('alertStatus',`danger`)
         res.redirect('/admin/item')
      }
   },
   addItem: async (req, res)=>{
      try {
         const {categoryId, title, price, city, about} = req.body
         if(req.files.length > 0){
            const category = await Category.findOne({_id:categoryId})
            const newItem = {
               categoryId: category._id,
               title,
               price,
               city,
               description:about
            }
            const item = await Item.create(newItem)
            category.itemId.push(item._id)
            await category.save()
            for (let i = 0; i < req.files.length; i++) {
               const imageSave = await Image.create({imageUrl:`images/${req.files[i].filename}`})
               item.imageId.push({_id:imageSave._id})
               await item.save()
            }
            req.flash('alertMessage','Success Add Item')
            req.flash('alertStatus','success')
            res.redirect('/admin/item')
         }
      } catch (error) {
         req.flash('alertMessage',`${error.message}`)
         req.flash('alertStatus',`danger`)
         res.redirect('/admin/item')
      }
   },
   showImageItem: async (req, res)=>{
      try {
         const {id} = req.params
         const item = await Item.findOne({_id:id})
            .populate({path: 'imageId', select:'id imageUrl'})

         const alertMessage = req.flash('alertMessage')
         const alertStatus = req.flash('alertStatus')
         const alert = {message: alertMessage, status: alertStatus}
         res.render('admin/item/view_item',{
            item,
            alert,
            action: 'show image',
            title: 'Staycation | Item'
         })
      } catch (error) {
         req.flash('alertMessage',`${error.message}`)
         req.flash('alertStatus',`danger`)
         res.redirect('/admin/item')
      }
   },
   showEditItem: async (req, res)=>{
      try {
         const {id} = req.params
         const item = await Item.findOne({_id:id})
            .populate({path: 'imageId', select:'id imageUrl'})
            .populate({path:'categoryId', select:'id name' })
         const category = await Category.find()
         const alertMessage = req.flash('alertMessage')
         const alertStatus = req.flash('alertStatus')
         const alert = {message: alertMessage, status: alertStatus}
         res.render('admin/item/view_item',{
            item,
            alert,
            category,
            action: 'edit item',
            title: 'Staycation | Edit Item'
         })
      } catch (error) {
         req.flash('alertMessage',`${error.message}`)
         req.flash('alertStatus',`danger`)
         res.redirect('/admin/item')
      }
   },
   editItem: async(req, res)=>{
      try {
         const {title,price,city,categoryId,about} = req.body
         const {id} = req.params
         let item = await Item.findOne({_id:id})
            .populate({path: 'imageId', select:'id imageUrl'})
            .populate({path:'categoryId', select:'id name' })

         if(req.files.length > 0){
            let imageList = [...item.imageId]
            for(let i = 0; i < item.imageId.length; i++){
               const imageUpdate = await Image.findOne({_id:item.imageId[i]._id})
               await fs.unlink(path.join(`public/${imageUpdate.imageUrl}`))
               // imageUpdate.imageUrl =`images/${req.files[i].filename}`
               imageList.splice(0,1)
               await imageUpdate.remove()
            }
            item.imageId = imageList
            for (let i = 0; i < req.files.length; i++) {
               const imageSave = await Image.create({imageUrl:`images/${req.files[i].filename}`})
               item.imageId.push({_id:imageSave._id})
               await item.save()
            }
            item.title = title
            item.price = price
            item.city = city
            item.categoryId = categoryId
            item.description = about
            await item.save()
            req.flash('alertMessage','Success Edit Item')
            req.flash('alertStatus','success')
            res.redirect('/admin/item')
         }else{
            item.title = title
            item.price = price
            item.city = city
            item.categoryId = categoryId
            item.description = about
            await item.save()
            req.flash('alertMessage','Success Edit Item')
            req.flash('alertStatus','success')
            res.redirect('/admin/item')
         }
      } catch (error) {
         req.flash('alertMessage',`${error.message}`)
         req.flash('alertStatus',`danger`)
         res.redirect('/admin/item')
      }
   },
   deleteItem: async (req, res) => {
      try {
         const {id,itemId} = req.params
         const item = await Item.findOne({_id:id}).populate({path:'imageId'})
         for(let i = 0; i < item.imageId.length;i++){
            Image.findOne({_id:item.imageId[i].id}).then((image)=>{
               fs.unlink(path.join(`public/${image.imageUrl}`))
               image.remove()
            }).catch((error)=>{
               req.flash('alertMessage',`${error.message}`)
               req.flash('alertStatus',`danger`)
               res.redirect('/admin/item')
            })
         }
         req.flash('alertMessage','Success Delete Bank')
         req.flash('alertStatus','success')
         await item.remove()
         res.redirect('/admin/item')
      } catch (error) {
         req.flash('alertMessage',`${error.message}`)
         req.flash('alertStatus',`danger`)
         res.redirect('/admin/item')
      }
   },
   viewDetailItem: async (req, res) => {
      try {
         const {itemId} = req.params
         const alertMessage = req.flash('alertMessage')
         const alertStatus = req.flash('alertStatus')
         const alert = {message: alertMessage, status: alertStatus}
         const feature = await Feature.find({itemId: itemId})
         const activity = await Activity.find({itemId: itemId})
         res.render('admin/item/detail_item/view_detail_item',{ 
            title: 'Staycation | Item',
            alert,
            itemId,
            feature,
            activity,
            user:req.session.user
         })
      } catch (error) {
         req.flash('alertMessage',`${error.message}`)
         req.flash('alertStatus',`danger`)
         res.redirect('/admin/item/show-detail-item')
      }
   },
   addFeature: async (req,res)=>{
      try {
         const {name,qty,itemId} = req.body
         if (!req.file) {
            req.flash('alertMessage','Image not found')
            req.flash('alertStatus','danger')
            res.redirect(`/admin/item/show-detail-item/${itemId}`)
         }
         const feature = await Feature.create({
            name,
            qty,
            itemId,
            imageUrl : `images/${req.file.filename}`
         })
         const item = await Item.findOne({_id:itemId})
         item.featureId.push({_id:feature._id}) 
         await item.save()
         req.flash('alertMessage','Success Add Feature')
         req.flash('alertStatus','success')
         res.redirect(`/admin/item/show-detail-item/${itemId}`)
      } 
      catch (error) {
         req.flash('alertMessage',`${error.message}`)
         req.flash('alertStatus',`danger`)
         res.redirect(`/admin/item/show-detail-item/${itemId}`)
      }
   },
   editFeature: async (req, res) => {
      try {
         const {id,nameFeature,qty,itemId} = req.body
         const feature = await Feature.findOne({_id:id})
         const item = await Item.findOne({_id:itemId}).populate('featureId')
         if(req.file == undefined){
            feature.name = nameFeature
            feature.qty = qty
            feature.itemId = itemId
            req.flash('alertMessage','Success Update Feature')
            req.flash('alertStatus','success')
            await feature.save()
            res.redirect(`/admin/item/show-detail-item/${itemId}`)
         } else {
            fs.unlink(path.join(`public/${feature.imageUrl}`))
            feature.name = nameFeature
            feature.qty = qty
            feature.itemId = itemId
            feature.imageUrl = `images/${req.file.filename}`
            req.flash('alertMessage','Success Update Feature')
            req.flash('alertStatus','success')
            await feature.save()
            res.redirect(`/admin/item/show-detail-item/${itemId}`)
         }
      } catch (error) {
         req.flash('alertMessage',`${error.message}`)
         req.flash('alertStatus',`danger`)
         res.redirect(`/admin/item/show-detail-item/${itemId}`)
      }
   },
   deleteFeature: async (req, res) => {
      const {id,itemId} = req.params
      try {
         const feature = await Feature.findOne({_id:id})
         const item = await Item.findOne({_id:itemId}).populate('featureId')
         for(let i = 0; i < item.featureId.length; i++){
            if(item.featureId[i]._id.toString() === feature._id.toString()){
               item.featureId.pull({_id: feature._id})
               await item.save()
            }
         }
         fs.unlink(path.join(`public/${feature.imageUrl}`))
         await feature.remove()
         req.flash('alertMessage','Success Delete Feature')
         req.flash('alertStatus','success')
         res.redirect(`/admin/item/show-detail-item/${itemId}`)
      } catch (error) {
         req.flash('alertMessage',`${error.message}`)
         req.flash('alertStatus',`danger`)
         res.redirect(`/admin/item/show-detail-item/${itemId}`)
      }
   },
   addActivity: async (req, res) => {
      try {
         const {name,type,itemId} = req.body
         if (!req.file) {
            req.flash('alertMessage','Image not found')
            req.flash('alertStatus','danger')
            res.redirect(`/admin/item/show-detail-item/${itemId}`)
         }
         const activity = await Activity.create({
            name,
            type,
            itemId,
            imageUrl : `images/${req.file.filename}`
         })
         const item = await Item.findOne({_id:itemId})
         item.activityId.push({_id:activity._id}) 
         await item.save()
         req.flash('alertMessage','Success Add activity')
         req.flash('alertStatus','success')
         res.redirect(`/admin/item/show-detail-item/${itemId}`)
      } catch (error) {
         req.flash('alertMessage',`${error.message}`)
         req.flash('alertStatus',`danger`)
         res.redirect(`/admin/item/show-detail-item/${itemId}`)
      }
   },
   editActivity: async (req, res) => {
      try {
         const {id,nameActivity,type,itemId} = req.body
         const activity = await Activity.findOne({_id:id})
         if(req.file == undefined){
            activity.name = nameActivity
            activity.type = type
            activity.itemId = itemId
            req.flash('alertMessage','Success Update activity')
            req.flash('alertStatus','success')
            await activity.save()
            res.redirect(`/admin/item/show-detail-item/${itemId}`)
         } else {
            fs.unlink(path.join(`public/${activity.imageUrl}`))
            activity.name = nameActivity
            activity.type = type
            activity.itemId = itemId
            activity.imageUrl = `images/${req.file.filename}`
            req.flash('alertMessage','Success Update activity')
            req.flash('alertStatus','success')
            await activity.save()
            res.redirect(`/admin/item/show-detail-item/${itemId}`)
         }
      } catch (error) {
         req.flash('alertMessage',`${error.message}`)
         req.flash('alertStatus',`danger`)
         res.redirect(`/admin/item/show-detail-item/${itemId}`)
      }
   },
   deleteActivity: async (req, res) => {
      const {id,itemId} = req.params
      try {
         const activity = await Activity.findOne({_id:id})
         const item = await Item.findOne({_id:itemId}).populate('activityId')
         for(let i = 0; i < item.activityId.length; i++){
            if(item.activityId[i]._id.toString() === activity._id.toString()){
               item.activityId.pull({_id: Activity._id})
               await item.save()
            }
         }
         fs.unlink(path.join(`public/${Activity.imageUrl}`))
         await activity.remove()
         req.flash('alertMessage','Success Delete activity')
         req.flash('alertStatus','success')
         res.redirect(`/admin/item/show-detail-item/${itemId}`)
      } catch (error) {
         req.flash('alertMessage',`${error.message}`)
         req.flash('alertStatus',`danger`)
         res.redirect(`/admin/item/show-detail-item/${itemId}`)
      }
   },
   viewBooking: async (req,res)=>{
      try {
         const booking = await Booking.find()
            .populate('memberId')
            .populate('bankId')
         const alertMessage = req.flash('alertMessage')
         const alertStatus = req.flash('alertStatus')
         const alert = {message: alertMessage, status: alertStatus}
         res.render('admin/booking/view_booking',{
            booking,
            alert,
            title: 'Staycation | Booking',
            user:req.session.user
         })
      } catch (error) {
         res.redirect('/admin/booking')
      }
   },
   showDetailBooking: async (req, res) => {
      const {id} = req.params
      try {
         const booking = await Booking.findOne({_id:id})
            .populate('memberId')
            .populate('bankId')
         res.render('admin/booking/show_detail_booking',{
            booking,
            title: 'Staycation | Booking',
            user:req.session.user
         })
      } catch (error) {
         res.redirect('/admin/booking')
      }
   },
   actionConfirmation: async (req, res) => {
      const {id} = req.params
      try {
         const booking = await Booking.findOne({_id:id})
         booking.payments.status = 'Accept'
         await booking.save()
         req.flash('alertMessage','Success Accept Payemnt!')
         req.flash('alertStatus','success')
         res.redirect('/admin/booking')
      } catch (error) {
         
      }
   },
   actionReject: async (req, res) => {
      const {id} = req.params
      try {
         const booking = await Booking.findOne({_id:id})
         booking.payments.status = 'Reject'
         await booking.save()
         req.flash('alertMessage','Success Reject Payemnt!')
         req.flash('alertStatus','success')
         res.redirect('/admin/booking')
      } catch (error) {
         
      }
   }
} 