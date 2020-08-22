db.klkPost.find({ id: 'd9nkyr' }).pretty()
// {
//   "_id" : ObjectId("5f40f8af09df4159d5c8af50"),
//   "id" : "d9nkyr",
//   "title" : "Nonon takes a hit (actual still in comments) (episode 11)",
//   "episode" : 11,
//   "size" : null,
//   "createdAt" : "2019-09-26T18:20:40.000Z",
//   "permalink" : "/r/KillLaKill/comments/d9nkyr/nonon_takes_a_hit_actual_still_in_comments/",
//   "url" : "https://i.imgur.com/ylULt0t.gifv"
// }
db.klkPost.update({ id: 'd9nkyr' }, { $set: { url: 'https://i.imgur.com/ylULt0t.gif' } })

db.klkPost.find({ id: '909jr7' }).pretty()
// {
//   "_id" : ObjectId("5f40f8e409df4159d5c8b0a5"),
//   "id" : "909jr7",
//   "title" : "In honor of the upcoming video game, I re-did this clip",
//   "episode" : null,
//   "size" : null,
//   "createdAt" : "2018-07-19T20:39:56.000Z",
//   "permalink" :
//     "/r/KillLaKill/comments/909jr7/in_honor_of_the_upcoming_video_game_i_redid_this/",
//   "url" : "https://gfycat.com/GoodnaturedCooperativeJabiru"
// }
db.klkPost.remove({ id: '909jr7' })
