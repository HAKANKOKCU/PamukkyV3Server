var http = require("http");
const fs = require('fs');
const process = require('process');
var url = require('url');
const port = 8080;

var users = {};
var userauths = {};
var chats = {};
var userfromtoken = {};
var tokenfromuser = {};
var uidfromemail = {};
var chatslist = {};
var groups = {};
var groupusers = {};
var useronlinetimeouts = {};
var useronlinestatus = {};
var updaterinfo = {};
var notifications = {};
const chatpagesize = 64;

Number.prototype.pad = function(size) {
    var s = String(this);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
}

function getKeyByValue(object, value) {
	return Object.keys(object).find(key => object[key] === value);
}


function nonundefined(input,ifund) {
	if (input == undefined) {
		return ifund;
	}
	return input;
}
try {
fs.mkdirSync("data");
fs.mkdirSync("data/chats");
}catch{}


function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

function maketoken() {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:;`¨~£$½%{[]}()=?\\*-|_\'"';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < 50) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

function savedata(cb) {
	var savejson = {
		users: users,
		userauths: userauths,
		//chats: chats,
		userfromtoken: userfromtoken,
		tokenfromuser: tokenfromuser,
		uidfromemail: uidfromemail,
		chatslist: chatslist,
		groups:groups,
		groupusers:groupusers,
		useronlinestatus:useronlinestatus
	}
	console.log("Saving chats to files...");
	console.log(chats)
	Object.keys(chats).forEach(function(i) {
		console.log(i);
		try {fs.mkdirSync("data/chats/" + i);}catch{}
		fs.writeFileSync("data/chats/" + i + "/data.json",JSON.stringify(chats[i]));
	})
	fs.writeFile("./data.json",JSON.stringify(savejson),cb);
}


function loaddata() {
	try {
		var parsedjson = JSON.parse(fs.readFileSync("./data.json"));
		users = nonundefined(parsedjson["users"], {});
		userauths = nonundefined(parsedjson["userauths"], {});
		chats = nonundefined(parsedjson["chats"], {});
		userfromtoken = nonundefined(parsedjson["userfromtoken"], {});
		tokenfromuser = nonundefined(parsedjson["tokenfromuser"], {});
		uidfromemail = nonundefined(parsedjson["uidfromemail"], {});
		chatslist = nonundefined(parsedjson["chatslist"], {});
		groups = nonundefined(parsedjson["groups"], {});
		groupusers = nonundefined(parsedjson["groupusers"], {});
		useronlinestatus = nonundefined(parsedjson["useronlinestatus"], {});
	}catch {}
}

loaddata();
const requestListener = function (req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', '*');//GET, POST, OPTIONS, PUT, PATCH, DELETE

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', '*'); //X-Requested-With,content-type,Content-Type,token,Content-Length,Connection,Accept,Origin,Content-Language,Accept-Language,DPR,Save-Data,Viewport-Width,Width,Accept-Encoding,Host, Sec-Fetch-Dest, Sec-Fetch-Mode,Sec-Fetch-Site,User-Agent
	//res.setHeader('Access-Control-Expose-Headers', 'agreementrequired');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

	if (req.url == "/login") {
		let data = []
		req.on('data', (chunk) => {
			data.push(chunk)
		})
		req.on('end', () => {
			try {
				var bd = JSON.parse(data);
				if (bd["password"] == undefined) {
					res.statusCode = 411;
					res.end(JSON.stringify({status: "error", description: "Password is undefined.", "id":"NOPASS"}))
					return;
				}
				if (bd["email"] == undefined) {
					res.statusCode = 411;
					res.end(JSON.stringify({status: "error", description: "Email is undefined.", "id":"NOEMAIL"}))
					return;
				}
				if (userauths[bd["email"]] == undefined) {
					res.statusCode = 401;
					res.end(JSON.stringify({status: "error", description: "No user found.", "id":"NOUSER"}))
					return;
				}
				var auth = userauths[bd["email"]];
				if (auth.password == bd["password"]) {
					res.statusCode = 200;
					res.end(JSON.stringify({
						token: tokenfromuser[bd["email"]],
						uid:uidfromemail[bd["email"]],
						userinfo:users[uidfromemail[bd["email"]]]
					}));
				}else {
					res.statusCode = 401;
					res.end(JSON.stringify({status: "error", description: "Password is wrong."}))
					return;
				}
			}catch {}
		});
	}else if (req.url == "/signup") {
		let data = []
		req.on('data', (chunk) => {
			data.push(chunk)
		})
		req.on('end', () => {
			try {
				var bd = JSON.parse(data);
				if (bd["password"] == undefined) {
					res.statusCode = 411;
					res.end(JSON.stringify({status: "error", description: "Password is undefined.", "id":"NOPASS"}))
					return;
				}
				if (bd["email"] == undefined) {
					res.statusCode = 411;
					res.end(JSON.stringify({status: "error", description: "Email is undefined.", "id":"NOEMAIL"}))
					return;
				}
				if (userauths[bd["email"]]) {
					res.statusCode = 401;
					res.end(JSON.stringify({status: "error", description: "User already exsists.", "id":"USERAE"}))
					return;
				}
				if (!(bd["email"].includes("@") && bd["email"].includes("."))) {
					res.statusCode = 411;
					res.end(JSON.stringify({status: "error", description: "Wrong email format.", "id":"EMAILFW"}))
					return;
				}
				
				if (bd["password"].length < 6) {
					res.statusCode = 411;
					res.end(JSON.stringify({status: "error", description: "Password too short. Should be minimum 6 in length", "id":"PASSTSHORT"}))
					return;
				}
				var id = makeid(28);
				if (users[id]) {
					res.statusCode = 500;
					res.end(JSON.stringify({status: "error", description: "UID was already taken. Please try again."}))
					return;
				}
				users[id] = {
					name: bd["email"].split("@")[0].split(".")[0],
					picture: "",
					description: ""
				}
				
				userauths[bd["email"]] = {
					password: bd["password"]
				}
				var token = maketoken();
				tokenfromuser[bd["email"]] = token;
				userfromtoken[token] = bd["email"];
				uidfromemail[bd["email"]] = id;
				res.statusCode = 200;
				res.end(JSON.stringify({
					token: tokenfromuser[bd["email"]],
					uid:uidfromemail[bd["email"]],
					userinfo:users[id]
				}));
			}catch {}
		});
	}else if (req.url == "/changepassword") {
		let data = []
		req.on('data', (chunk) => {
			data.push(chunk)
		})
		req.on('end', () => {
			//try {
				var bd = JSON.parse(data);
				var token = bd["token"];
				if (token) {
					var email = userfromtoken[token];
					if (users[uidfromemail[email]]) {
						if (bd["password"] == undefined) {
							res.statusCode = 411;
							res.end(JSON.stringify({status: "error", description: "Password is undefined.", "id":"NOPASS"}))
							return;
						}
						
						if (bd["oldpassword"] == undefined) {
							res.statusCode = 411;
							res.end(JSON.stringify({status: "error", description: "Old password is undefined.", "id":"NOOLDPASS"}))
							return;
						}
						
						if (bd["password"].length < 6) {
							res.statusCode = 411;
							res.end(JSON.stringify({status: "error", description: "Password too short. Should be minimum 6 in length", "id":"PASSTSHORT"}))
							return;
						}
						if (userauths[email].password == bd["oldpassword"]) {
							userauths[email] = {
								password: bd["password"]
							}
							
							delete userfromtoken[token];
							var oldchatslist = Object.assign([], chatslist[token])
							delete chatslist[token];
							token = maketoken();
							if (userfromtoken[token]) {
								res.statusCode = 500;
								res.end(JSON.stringify({status: "error", description: "Token was already taken. Please try again."}))
								return;
							}
							chatslist[token] = oldchatslist;
							tokenfromuser[email] = token;
							userfromtoken[token] = email;
							var id = uidfromemail[email];
							res.statusCode = 200;
							res.end(JSON.stringify({
								token: tokenfromuser[email],
								uid:id,
								userinfo:users[id]
							}));
						}else {
							res.statusCode = 401;
							res.end(JSON.stringify({status: "error", description: "Invalid password", "id":"INPASS"}));
						}
					}else {
						res.statusCode = 401;
						res.end(JSON.stringify({status: "error", description: "Invalid token", "id":"INTOKEN"}));
					}
				}else {
					res.statusCode = 411;
					res.end(JSON.stringify({status: "error", description: "No token", "id":"NOTOKEN"}));
				}
			//}catch {}
		});
	}else if (req.url == "/getuser") {
		let data = []
		req.on('data', (chunk) => {
			data.push(chunk)
		})
		req.on('end', () => {
			try {
				var bd = JSON.parse(data);
				var email = getKeyByValue(uidfromemail,bd["uid"]);
				if (email) {
					if (users[uidfromemail[email]]) {
						res.statusCode = 200;
						res.end(JSON.stringify(users[uidfromemail[email]]));
					}else {
						res.statusCode = 404;
						res.end(JSON.stringify({status: "error", description: "No user", "id":"NOUSER"}));
					}
				}else {
					res.statusCode = 411;
					res.end(JSON.stringify({status: "error", description: "No UID", "id":"NOUID"}));
				}
			}catch {}
		});
	}else if (req.url == "/getgroup") {
		let data = []
		req.on('data', (chunk) => {
			data.push(chunk)
		})
		req.on('end', () => {
			try {
				var bd = JSON.parse(data);
				var gid = bd["groupid"];
				if (gid) {
					if (groups[gid]) {
						res.statusCode = 200;
						var name = groups[gid].name;
						var picture = groups[gid].picture;
						var info = groups[gid].info;
						res.end(JSON.stringify({
							name:name,
							picture:picture,
							info:info
						}));
					}else {
						res.statusCode = 404;
						res.end(JSON.stringify({status: "error", description: "No group", "id":"NOGROUP"}));
					}
				}else {
					res.statusCode = 404;
					res.end(JSON.stringify({status: "error", description: "No GID", "id":"NOGID"}));
				}
			}catch {}
		});
	}else if (req.url == "/getgrouproles") {
		let data = []
		req.on('data', (chunk) => {
			data.push(chunk)
		})
		req.on('end', () => {
			try {
				var bd = JSON.parse(data);
				var gid = bd["groupid"];
				if (gid) {
					if (groups[gid]) {
						res.statusCode = 200;
						res.end(JSON.stringify(groups[gid].roles));
					}else {
						res.statusCode = 404;
						res.end(JSON.stringify({status: "error", description: "No group", "id":"NOGROUP"}));
					}
				}else {
					res.statusCode = 404;
					res.end(JSON.stringify({status: "error", description: "No GID", "id":"NOGID"}));
				}
			}catch {}
		});
	}else if (req.url == "/updateuser") {
		let data = []
		req.on('data', (chunk) => {
			data.push(chunk)
		})
		req.on('end', () => {
			try {
				var bd = JSON.parse(data);
				var token = bd["token"];
				if (token) {
					var email = userfromtoken[token];
					if (users[uidfromemail[email]]) {
						if (bd["name"] == undefined) {
							res.statusCode = 411;
							res.end(JSON.stringify({status: "error", description: "Name is required", "id":"NAMEREQ"}));
							return;
						}
						if (bd["name"].toString().trim().length == 0) {
							res.statusCode = 411;
							res.end(JSON.stringify({status: "error", description: "Name is required", "id":"NAMEREQ"}));
							return;
						}
						if (bd["picture"] == undefined) {
							bd["picture"] = "";
						}
						if (bd["description"] == undefined) {
							bd["description"] = "";
						}
						users[uidfromemail[email]] = {
							name: bd["name"],
							picture: bd["picture"],
							description: bd["description"]
						}
						res.statusCode = 200;
						res.end(JSON.stringify({status: "done"}));
					}else {
						res.statusCode = 401;
						res.end(JSON.stringify({status: "error", description: "Invalid token", "id":"INTOKEN"}));
					}
				}else {
					res.statusCode = 411;
					res.end(JSON.stringify({status: "error", description: "No token", "id":"NOTOKEN"}));
				}
			}catch {}
		});
	}else if (req.url == "/getchatslist") {
		let data = []
		req.on('data', (chunk) => {
			data.push(chunk)
		})
		req.on('end', () => {
			try {
				var bd = JSON.parse(data);
				var token = bd["token"];
				if (token) {
					var email = userfromtoken[token];
					if (users[uidfromemail[email]]) {
						let chatlista = Object.assign([], chatslist[token]);
						if (chatlista == undefined) {
							chatlista = [];
						}
						chatlista.forEach(i => {
							try {
								if (i.type == "user") {
									i.info = {
										name: users[i.user].name,
										picture: users[i.user].picture
									};
								}else if (i.type == "group") {
									i.info = {
										name: groups[i.group].name,
										picture: groups[i.group].picture
									};
								}
								var cht = chats[i.chatid];
								if (cht == undefined || cht == null) {
									try {
										cht = JSON.parse(fs.readFileSync("data/chats/" + i.chatid + "/data.json"));
										chats[i.chatid] = cht;
									}catch {
										cht = {};
									}
								}
								var kys = Object.keys(cht);
								i.lastmessage = cht[kys[kys.length - 1]]
							}catch (e) {console.log(e)}
						})
						res.statusCode = 200;
						res.end(JSON.stringify(chatlista));
					}else {
						res.statusCode = 401;
						res.end(JSON.stringify({status: "error", description: "Invalid token", "id":"INTOKEN"}));
					}
				}else {
					res.statusCode = 411;
					res.end(JSON.stringify({status: "error", description: "No token", "id":"NOTOKEN"}));
				}
			}catch {}
		});
	}else if (req.url == "/getlastmessage") {
		let data = []
		req.on('data', (chunk) => {
			data.push(chunk)
		})
		req.on('end', () => {
			try {
				var bd = JSON.parse(data);
				var token = bd["token"];
				if (token) {
					var email = userfromtoken[token];
					if (users[uidfromemail[email]]) {
						var spl = bd["chatid"].split("-");
						var isgroup = !bd["chatid"].includes("-");
						if (!isgroup ? (spl[0] == uidfromemail[email] || spl[1] == uidfromemail[email]) : (groupusers[bd["chatid"]][uidfromemail[email]])) {
							res.statusCode = 200;
							//var chatpagei = [];
							var chatitself = chats[bd["chatid"]];
							if (chatitself == undefined || chatitself == null) {
								chatitself = {};
							}
							var kys = Object.keys(chatitself);
							res.end(JSON.stringify(chatitself[kys[kys.length - 1]]));
						}else {
							res.statusCode = 403;
							res.end(JSON.stringify({status: "error", description: "No chat permission", "id":"INCP"}));
						}
						
					}else {
						res.statusCode = 401;
						res.end(JSON.stringify({status: "error", description: "Invalid token", "id":"INTOKEN"}));
					}
				}else {
					res.statusCode = 411;
					res.end(JSON.stringify({status: "error", description: "No token", "id":"NOTOKEN"}));
				}
			}catch {}
		});
	}else if (req.url == "/adduserchat") {
		let data = []
		req.on('data', (chunk) => {
			data.push(chunk)
		})
		req.on('end', () => {
			try {
				var bd = JSON.parse(data);
				var token = bd["token"];
				if (token) {
					var email = userfromtoken[token];
					if (users[uidfromemail[email]]) {
						var semail = bd["email"];
						if (semail) {
							if (users[uidfromemail[semail]]) {
								var chatlist = chatslist[token];
								if (chatlist == undefined) {
									chatlist = [];
								}
								var chatlistsec = chatslist[tokenfromuser[semail]];
								if (chatlistsec == undefined) {
									chatlistsec = [];
								}
								var ind = chatlist.findIndex(e => e.user === uidfromemail[semail])
								if (ind != -1) {
									if (chatlistsec.some(e => e.user === uidfromemail[email])) {
										
									}else {
										chatlistsec.push({
											user: uidfromemail[email],
											type: "user",
											chatid: chatlist[ind].chatid
										});
									}
								}else {
									var indd = chatlistsec.findIndex(e => e.user === uidfromemail[email]);
									if (indd != -1) {
										chatlist.push({
											user: uidfromemail[email],
											type: "user",
											chatid: chatlistsec[ind].chatid
										});
									}else {
										chatlistsec.push({
											user: uidfromemail[email],
											type: "user",
											chatid: uidfromemail[email] + "-" + uidfromemail[semail]
										});
										if (uidfromemail[email] != uidfromemail[semail]) {
											chatlist.push({
												user: uidfromemail[semail],
												type: "user",
												chatid: uidfromemail[email] + "-" + uidfromemail[semail]
											});
										}
									}
								}
								chatslist[token] = chatlist;
								chatslist[tokenfromuser[semail]] = chatlistsec;
								res.statusCode = 200;
								res.end(JSON.stringify({status: "done"}));
							}else {
								res.statusCode = 411;
								res.end(JSON.stringify({status: "error", description: "Invalid email", "id":"INEMAIL"}));
							}
						}else {
							res.statusCode = 411;
							res.end(JSON.stringify({status: "error", description: "No email", "id":"NOEMAIL"}));
						}
					}else {
						res.statusCode = 401;
						res.end(JSON.stringify({status: "error", description: "Invalid token", "id":"INTOKEN"}));
					}
				}else {
					res.statusCode = 411;
					res.end(JSON.stringify({status: "error", description: "No token", "id":"NOTOKEN"}));
				}
			}catch {}
		});
	}else if (req.url == "/getchatpage") {
		let data = []
		req.on('data', (chunk) => {
			data.push(chunk)
		})
		req.on('end', () => {
			try {
				var bd = JSON.parse(data);
				var token = bd["token"];
				if (token) {
					var email = userfromtoken[token];
					if (users[uidfromemail[email]]) {
						var spl = bd["chatid"].split("-");
						var isgroup = !bd["chatid"].includes("-");
						if (!isgroup ? (spl[0] == uidfromemail[email] || spl[1] == uidfromemail[email]) : (groupusers[bd["chatid"]][uidfromemail[email]])) {
							res.statusCode = 200;
							if (updaterinfo[token][bd["chatid"]] == undefined) {
								updaterinfo[token][bd["chatid"]] == {}
							}
							//var chatpagei = [];
							var chatitself = chats[bd["chatid"]];
							var chatpage = 0;
							try {
								chatpage = parseInt(bd["page"]);
								if (chatpage < 0) {
									chatpage = 0;
								}
							}catch {}
							if (chatitself == undefined || chatitself == null) {
								try {
									chatitself = JSON.parse(fs.readFileSync("data/chats/" + bd["chatid"] + "/data.json"));
									chats[bd["chatid"]] = chatitself;
								}catch {
									chatitself = {};
								}
							}
							var kys = Object.keys(chatitself);
							var start = kys.length + (chatpage - 1 * chatpagesize);
							var end = kys.length + (chatpage * chatpagesize);
							if (start < 0) {
								start = 0;
							}
							const chunk = kys.slice(start, end);
							var items = {};
							chunk.forEach(i => {
								var a = Object.assign({},chatitself[i]);
								a.senderuser = {
									name: users[a.sender].name,
									picture: users[a.sender].picture
								};
								if (a.replymsgid) {
									try {
										a.replymsgcontent = chatitself[a.replymsgid].content;
										a.replymsgsender = users[chatitself[a.replymsgid].sender].name
									}catch (e) {console.error(e)}
								}
								if (a.forwardedfrom) {
									try {
										a.forwardedname = users[a.forwardedfrom].name;
									}catch (e) {console.error(e)}
								}
								items[i] = a;
							})
							res.end(JSON.stringify(items));
						}else {
							res.statusCode = 403;
							res.end(JSON.stringify({status: "error", description: "No chat permission", "id":"INCP"}));
						}
						
					}else {
						res.statusCode = 401;
						res.end(JSON.stringify({status: "error", description: "Invalid token", "id":"INTOKEN"}));
					}
				}else {
					res.statusCode = 411;
					res.end(JSON.stringify({status: "error", description: "No token", "id":"NOTOKEN"}));
				}
			}catch {}
		});
	}else if (req.url == "/getmsgpage") {
		let data = []
		req.on('data', (chunk) => {
			data.push(chunk)
		})
		req.on('end', () => {
			try {
				var bd = JSON.parse(data);
				var token = bd["token"];
				if (token) {
					var email = userfromtoken[token];
					if (users[uidfromemail[email]]) {
						var spl = bd["chatid"].split("-");
						var isgroup = !bd["chatid"].includes("-");
						if (!isgroup ? (spl[0] == uidfromemail[email] || spl[1] == uidfromemail[email]) : (groupusers[bd["chatid"]][uidfromemail[email]])) {
							var chatitself = chats[bd["chatid"]];
							if (chatitself[bd["msgid"]]) {
								var kys = Object.keys(chatitself);
								var io = kys.length - kys.indexOf(bd["msgid"]);
								res.statusCode = 200;
								res.end(Math.floor(io / chatpagesize).toString());
							}else {
								res.statusCode = 404;
								res.end(JSON.stringify({status: "error", description: "No message found", "id":"NOMESSAGE"}));
							}
						}else {
							res.statusCode = 403;
							res.end(JSON.stringify({status: "error", description: "No chat permission", "id":"INCP"}));
						}
						
					}else {
						res.statusCode = 401;
						res.end(JSON.stringify({status: "error", description: "Invalid token", "id":"INTOKEN"}));
					}
				}else {
					res.statusCode = 411;
					res.end(JSON.stringify({status: "error", description: "No token", "id":"NOTOKEN"}));
				}
			}catch {}
		});
	}else if (req.url == "/sendmessage") {
		let data = []
		req.on('data', (chunk) => {
			data.push(chunk)
		})
		req.on('end', () => {
			//try {
				var bd = JSON.parse(data);
				var token = bd["token"];
				if (token) {
					var email = userfromtoken[token];
					if (users[uidfromemail[email]]) {
						var isgroup = !bd["chatid"].includes("-");
						var spl = bd["chatid"].split("-");
						if (!isgroup ? (spl[0] == uidfromemail[email] || spl[1] == uidfromemail[email]) : (groupusers[bd["chatid"]][uidfromemail[email]] && groups[bd["chatid"]].roles[groupusers[bd["chatid"]][uidfromemail[email]].role].AllowSending == true)) {
							res.statusCode = 200;
							var chatitself = chats[bd["chatid"]];
							if (chatitself == undefined || chatitself == null) {
								try {
									chatitself = JSON.parse(fs.readFileSync("data/chats/" + bd["chatid"] + "/data.json"));
									chats[bd["chatid"]] = chatitself;
								}catch {
									chatitself = {};
								}
							}
							if (bd["content"]) {
								if (bd["content"].toString().trim().length == 0 && ((bd["files"] != null) ? bd["files"] : undefined) == undefined) {
									res.statusCode = 411;
									res.end(JSON.stringify({status: "error", description: "No Content", "id":"NOCONTENT"}));
								}else {
									var date = new Date();
									let diff = -date.getTimezoneOffset();
									let id = new Date().getTime().toString();
									chatitself[id] = {
										content: bd["content"].toString().trim(),
										sender: uidfromemail[email],
										replymsgid: (bd["replymsg"] != null) ? bd["replymsg"] : undefined,
										files: (bd["files"] != null) ? bd["files"] : undefined,
										time: (date.getMonth() + 1).pad() + " " + date.getDate().pad() + " " + date.getFullYear() + ", " + date.getHours().toString().padStart(2, '0') + ":" + date.getMinutes().toString().padStart(2, '0') + " " + ((diff<=0?"":"+") + Math.floor(diff / 60).pad().toString() + ":" + Math.floor(diff % 60).pad().toString())
									};
									chats[bd["chatid"]] = chatitself;
									res.end(JSON.stringify({status: "done"}));
									Object.values(updaterinfo).forEach((i) => {
										if (i[bd["chatid"]]) {
											var a = {
												event: "NEWMESSAGE",
												content: bd["content"].toString().trim(),
												sender: uidfromemail[email],
												replymsgid: (bd["replymsg"] != null) ? bd["replymsg"] : undefined,
												files: (bd["files"] != null) ? bd["files"] : undefined,
												time: (date.getMonth() + 1).pad() + " " + date.getDate().pad() + " " + date.getFullYear() + ", " + date.getHours().toString().padStart(2, '0') + ":" + date.getMinutes().toString().padStart(2, '0') + " " + ((diff<=0?"":"+") + Math.floor(diff / 60).pad().toString() + ":" + Math.floor(diff % 60).pad().toString()),
												senderuser : {
													name: users[uidfromemail[email]].name,
													picture: users[uidfromemail[email]].picture
												}
											}
											
											if (bd["replymsg"] != null) {
												try {
													a.replymsgcontent = chatitself[a.replymsgid].content;
													a.replymsgsender = users[chatitself[a.replymsgid].sender].name
												}catch (e) {console.error(e)}
											}
											i[bd["chatid"]][id] = a;
											
											
										}
									})
									if (isgroup) {
										let usersa = Object.keys(groupusers[bd["chatid"]])
										usersa.forEach(function(i) {
											if (i != uidfromemail[email]) {
												let emaila = Object.keys(uidfromemail).find(key => uidfromemail[key] === i)
												//console.log(emaila)
												let token = tokenfromuser[emaila]
												//console.log(token)
												if (notifications[token] == undefined) {
													notifications[token] = {};
												}
												notifications[token][new Date().getTime().toString()] = {
													chatid: bd["chatid"],
													user: users[uidfromemail[email]],
													content: bd["content"]
												}
											}
										})
									}else {
										let i;
										if (spl[0] == uidfromemail[email]) {
											i = spl[1]
										}else {
											i = spl[0];
										}
										if (i != uidfromemail[email]) {
											let emaila = Object.keys(uidfromemail).find(key => uidfromemail[key] === i)
											//console.log(emaila)
											let token = tokenfromuser[emaila]
											//console.log(token)
											if (notifications[token] == undefined) {
												notifications[token] = {};
											}
											notifications[token][new Date().getTime().toString()] = {
												chatid: bd["chatid"],
												user: users[uidfromemail[email]],
												content: bd["content"]
											}
										}
									}
									//console.log(notifications)
								}
							}else {
								res.statusCode = 411;
								res.end(JSON.stringify({status: "error", description: "No Content", "id":"NOCONTENT"}));
							}
						}else {
							res.statusCode = 403;
							res.end({status:"error", description: "No permission"});
						}
						
					}else {
						res.statusCode = 401;
						res.end(JSON.stringify({status: "error", description: "Invalid token", "id":"INTOKEN"}));
					}
				}else {
					res.statusCode = 411;
					res.end(JSON.stringify({status: "error", description: "No token", "id":"NOTOKEN"}));
				}
			//}catch {}
		});
	}else if (req.url == "/deletemessage") {
		let data = []
		req.on('data', (chunk) => {
			data.push(chunk)
		})
		req.on('end', () => {
			//try {
				var bd = JSON.parse(data);
				var token = bd["token"];
				if (token) {
					var email = userfromtoken[token];
					if (users[uidfromemail[email]]) {
						var isgroup = !bd["chatid"].includes("-");
						var spl = bd["chatid"].split("-");
						var msgid = bd["msgid"];
						var chatitself = chats[bd["chatid"]];
						if (chatitself == undefined || chatitself == null) {
							chatitself = {};
						}
						if (!isgroup ? (spl[0] == uidfromemail[email] || spl[1] == uidfromemail[email]) : (groupusers[bd["chatid"]][uidfromemail[email]] && (groups[bd["chatid"]].roles[groupusers[bd["chatid"]][uidfromemail[email]].role].AllowMessageDeleting == true || (msgid && chatitself[msgid] && chatitself[msgid].sender == uidfromemail[email])))) {
							res.statusCode = 200;
							delete chatitself[msgid];
							chats[bd["chatid"]] = chatitself;
							res.end(JSON.stringify({status: "done"}));
							Object.values(updaterinfo).forEach((i) => {
								if (i[bd["chatid"]]) {
									i[bd["chatid"]][msgid] = {event: "DELETED"}
								}
							});
						}else {
							res.statusCode = 403;
							res.end(JSON.stringify({status:"error", description: "No permission"}));
						}
						
					}else {
						res.statusCode = 401;
						res.end(JSON.stringify({status: "error", description: "Invalid token", "id":"INTOKEN"}));
					}
				}else {
					res.statusCode = 411;
					res.end(JSON.stringify({status: "error", description: "No token", "id":"NOTOKEN"}));
				}
			//}catch {}
		});
	}else if (req.url == "/savemessage") {
		let data = []
		req.on('data', (chunk) => {
			data.push(chunk)
		})
		req.on('end', () => {
			try {
				var bd = JSON.parse(data);
				var token = bd["token"];
				if (token) {
					var email = userfromtoken[token];
					if (users[uidfromemail[email]]) {
						var msgid = bd["msgid"];
						if (msgid == undefined) {
							res.statusCode = 411;
							res.end(JSON.stringify({status: "error", description: "No messageid", "id":"NOMSGID"}));
							return;
						}
						var isgroup = !bd["chatid"].includes("-");
						var spl = bd["chatid"].split("-");
						//console.log(groupusers[bd["chatid"]][uidfromemail[email]]);
						if (!isgroup ? (spl[0] == uidfromemail[email] || spl[1] == uidfromemail[email]) : groupusers[bd["chatid"]][uidfromemail[email]]) {
							var chatitself = chats[bd["chatid"]];
							if (chatitself == undefined || chatitself == null) {
								chatitself = {};
							}
							res.statusCode = 200;
							if (chatitself[msgid]) {
								var savedmessagesid = uidfromemail[email] + "-" + uidfromemail[email];
								var chatsaveds = chats[savedmessagesid];
								if (chatsaveds == undefined || chatsaveds == null) {
									try {
										chatsaveds = JSON.parse(fs.readFileSync("data/chats/" + savedmessagesid + "/data.json"));
										chats[savedmessagesid] = chatsaveds;
									}catch {
										chatsaveds = {};
									}
								}
								var date = new Date();
								let diff = -date.getTimezoneOffset();
								chatsaveds[new Date().getTime().toString()] = {
									content: chatitself[msgid]["content"].toString(),
									sender: chatitself[msgid]["sender"],
									time: (date.getMonth() + 1).pad() + " " + date.getDate().pad() + " " + date.getFullYear() + ", " + date.getHours().toString().padStart(2, '0') + ":" + date.getMinutes().toString().padStart(2, '0') + " " + ((diff<=0?"":"+") + Math.floor(diff / 60).pad().toString() + ":" + Math.floor(diff % 60).pad().toString())
								};
								chats[savedmessagesid] = chatsaveds;
								res.end(JSON.stringify({status: "done"}));
							}else {
								res.statusCode = 404;
								res.end(JSON.stringify({status: "error", description: "No message", "id":"NOMSG"}));
							}
						}else {
							res.statusCode = 403;
							res.end("You tried hacking i guess.");
						}
						
					}else {
						res.statusCode = 401;
						res.end(JSON.stringify({status: "error", description: "Invalid token", "id":"INTOKEN"}));
					}
				}else {
					res.statusCode = 411;
					res.end(JSON.stringify({status: "error", description: "No token", "id":"NOTOKEN"}));
				}
			}catch {}
		});
	}else if (req.url == "/forwardmessage") {
		let data = []
		req.on('data', (chunk) => {
			data.push(chunk)
		})
		req.on('end', () => {
			try {
				var bd = JSON.parse(data);
				var token = bd["token"];
				if (token) {
					var email = userfromtoken[token];
					if (users[uidfromemail[email]]) {
						var msgid = bd["msgid"];
						if (msgid == undefined) {
							res.statusCode = 411;
							res.end(JSON.stringify({status: "error", description: "No messageid", "id":"NOMSGID"}));
							return;
						}
						var isgroup = !bd["chatid"].includes("-");
						var spl = bd["chatid"].split("-");
						//console.log(groupusers[bd["chatid"]][uidfromemail[email]]);
						if (!isgroup ? (spl[0] == uidfromemail[email] || spl[1] == uidfromemail[email]) : groupusers[bd["chatid"]][uidfromemail[email]]) {
							var chatitself = chats[bd["chatid"]];
							if (chatitself == undefined || chatitself == null) {
								try {
									chatitself = JSON.parse(fs.readFileSync("data/chats/" + bd["chatid"] + "/data.json"));
									chats[bd["chatid"]] = chatitself;
								}catch {
									chatitself = {};
								}
							}
							res.statusCode = 200;
							if (chatitself[msgid]) {
								var tochatid = bd["tochatid"];
								if (tochatid) {
									var isgroup = !tochatid.includes("-");
									var spl = tochatid.split("-");
									//console.log(groupusers[tochatid][uidfromemail[email]]);
									if (!isgroup ? (spl[0] == uidfromemail[email] || spl[1] == uidfromemail[email]) : groupusers[tochatid][uidfromemail[email]]) {
										var ctst = chats[tochatid];
										if (ctst == undefined || ctst == null) {
											try {
												ctst = JSON.parse(fs.readFileSync("data/chats/" + bd["chatid"] + "/data.json"));
												chats[bd["chatid"]] = ctst;
											}catch {
												ctst = {};
											}
										}
										var date = new Date();
										let diff = -date.getTimezoneOffset();
										ctst[new Date().getTime().toString()] = {
											content: chatitself[msgid]["content"].toString(),
											files: chatitself[msgid]["files"],
											forwardedfrom: chatitself[msgid]["sender"],
											sender: uidfromemail[email],
											time: (date.getMonth() + 1).pad() + " " + date.getDate().pad() + " " + date.getFullYear() + ", " + date.getHours().toString().padStart(2, '0') + ":" + date.getMinutes().toString().padStart(2, '0') + " " + ((diff<=0?"":"+") + Math.floor(diff / 60).pad().toString() + ":" + Math.floor(diff % 60).pad().toString())
										};
										if (isgroup) {
											let usersa = Object.keys(groupusers[tochatid])
											usersa.forEach(function(i) {
												if (i != uidfromemail[email]) {
													let emaila = Object.keys(uidfromemail).find(key => uidfromemail[key] === i)
													//console.log(emaila)
													let token = tokenfromuser[emaila]
													//console.log(token)
													if (notifications[token] == undefined) {
														notifications[token] = {};
													}
													notifications[token][new Date().getTime().toString()] = {
														chatid: tochatid,
														user: users[uidfromemail[email]],
														content: chatitself[msgid]["content"].toString()
													}
												}
											})
										}else {
											let i;
											if (spl[0] == uidfromemail[email]) {
												i = spl[1]
											}else {
												i = spl[0];
											}
											if (i != uidfromemail[email]) {
												let emaila = Object.keys(uidfromemail).find(key => uidfromemail[key] === i)
												//console.log(emaila)
												let token = tokenfromuser[emaila]
												//console.log(token)
												if (notifications[token] == undefined) {
													notifications[token] = {};
												}
												notifications[token][new Date().getTime().toString()] = {
													chatid: tochatid,
													user: users[uidfromemail[email]],
													content: chatitself[msgid]["content"].toString()
												}
											}
										}
										chats[tochatid] = ctst;
										res.end(JSON.stringify({status: "done"}));
									}else {
										res.statusCode = 403;
										res.end(JSON.stringify({status: "error", description: "You don't have the permission", "id":"NOPERM"}));
									}
								}else {
									res.statusCode = 411;
									res.end(JSON.stringify({status: "error", description: "No Chatid to send to", "id":"NOCIDTOSEND"}));
								}
							}else {
								res.statusCode = 404;
								res.end(JSON.stringify({status: "error", description: "No message", "id":"NOMSG"}));
							}
						}else {
							res.statusCode = 403;
							res.end("You tried hacking i guess.");
						}
						
					}else {
						res.statusCode = 401;
						res.end(JSON.stringify({status: "error", description: "Invalid token", "id":"INTOKEN"}));
					}
				}else {
					res.statusCode = 411;
					res.end(JSON.stringify({status: "error", description: "No token", "id":"NOTOKEN"}));
				}
			}catch (e) {console.error(e)}
		});
	}else if (req.url == "/creategroup") {
		let data = []
		req.on('data', (chunk) => {
			data.push(chunk)
		})
		req.on('end', () => {
			try {
				var bd = JSON.parse(data);
				var token = bd["token"];
				if (token) {
					var email = userfromtoken[token];
					if (users[uidfromemail[email]]) {
						var groupname = bd["name"];
						var grouppicture = bd["picture"];
						var groupinfo = bd["info"];
						if (grouppicture == undefined) {
							grouppicture = "";
						}
						if (groupinfo == undefined) {
							groupinfo = "";
						}
						if (groupname == undefined) {
							res.statusCode = 411;
							res.end(JSON.stringify({status: "error", description: "No name", "id":"NONAME"}));
							return;
						}
						if (groupname.toString().trim().length == 0) {
							res.statusCode = 411;
							res.end(JSON.stringify({status: "error", description: "No name", "id":"NONAME"}));
							return;
						}
						var groupid = groupname.split(" ")[0] + new Date().getTime().toString();
						if (groups[groupid]) {
							res.statusCode = 500;
							res.end(JSON.stringify({status: "error", description: "Group id already taken", "id":"GIDAT"}));
							return;
						}
						var date = new Date();
						let diff = -date.getTimezoneOffset();
						groups[groupid] = {
							name: groupname,
							picture: grouppicture,
							info: groupinfo,
							owner: uidfromemail[email],
							time: (date.getMonth() + 1).pad() + " " + date.getDate().pad() + " " + date.getFullYear() + ", " + date.getHours().toString().padStart(2, '0') + ":" + date.getMinutes().toString().padStart(2, '0') + " " + ((diff<=0?"":"+") + Math.floor(diff / 60).pad().toString() + ":" + Math.floor(diff % 60).pad().toString()),
							roles: {
								"Owner": {
									"AdminOrder": 0,
									"AllowMessageDeleting": true,
									"AllowEditingSettings": true,
									"AllowKicking": true,
									"AllowBanning": true,
									"AllowSending": true,
									"AllowEditingUsers":true,
									"AllowSendingReactions":true
								},
								"Admin": {
									"AdminOrder": 1,
									"AllowMessageDeleting": true,
									"AllowEditingSettings": false,
									"AllowKicking": true,
									"AllowBanning": false,
									"AllowSending": true,
									"AllowEditingUsers":true,
									"AllowSendingReactions":true
								},
								"Moderator": {
									"AdminOrder": 2,
									"AllowMessageDeleting": true,
									"AllowEditingSettings": false,
									"AllowKicking": false,
									"AllowBanning": false,
									"AllowSending": true,
									"AllowEditingUsers":false,
									"AllowSendingReactions":true
								},
								"Normal": {
									"AdminOrder": 3,
									"AllowMessageDeleting": false,
									"AllowEditingSettings": false,
									"AllowKicking": false,
									"AllowBanning": false,
									"AllowSending": true,
									"AllowEditingUsers":false,
									"AllowSendingReactions":true
								},
								"Readonly": {
									"AdminOrder": 4,
									"AllowMessageDeleting": false,
									"AllowEditingSettings": false,
									"AllowKicking": false,
									"AllowBanning": false,
									"AllowSending": false,
									"AllowEditingUsers":false,
									"AllowSendingReactions":false
								}
							}
						}
						var groupusersa = {}
						groupusersa[uidfromemail[email]] = {
							user: uidfromemail[email],
							role: "Owner",
							jointime: (date.getMonth() + 1).pad() + " " + date.getDate().pad() + " " + date.getFullYear() + ", " + date.getHours().toString().padStart(2, '0') + ":" + date.getMinutes().toString().padStart(2, '0') + " " + ((diff<=0?"":"+") + Math.floor(diff / 60).pad().toString() + ":" + Math.floor(diff % 60).pad().toString())
						}
						groupusers[groupid] = groupusersa;
						var chatlist = chatslist[token];
						if (chatlist == undefined) {
							chatlist = [];
						}
						chatlist.push({
							group: groupid,
							type: "group",
							chatid: groupid
						});
						chatslist[token] = chatlist;
						res.statusCode = 200;
						res.end(JSON.stringify({groupid: groupid}));
					}else {
						res.statusCode = 401;
						res.end(JSON.stringify({status: "error", description: "Invalid token", "id":"INTOKEN"}));
					}
				}else {
					res.statusCode = 411;
					res.end(JSON.stringify({status: "error", description: "No token", "id":"NOTOKEN"}));
				}
			}catch {}
		});
	}else if (req.url == "/editgroup") {
		let data = []
		req.on('data', (chunk) => {
			data.push(chunk)
		})
		req.on('end', () => {
			try {
				var bd = JSON.parse(data);
				var token = bd["token"];
				if (token) {
					var email = userfromtoken[token];
					if (users[uidfromemail[email]]) {
						var groupname = bd["name"];
						var grouppicture = bd["picture"];
						var groupinfo = bd["info"];
						var groles = bd["roles"];
						var groupid = bd["groupid"];
						if (grouppicture == undefined) {
							grouppicture = "";
						}
						if (groupinfo == undefined) {
							groupinfo = "";
						}
						if (groles == undefined) {
							groles = groups[groupid].roles;
							console.log("no roles");
						}
						if (groupname == undefined) {
							res.statusCode = 411;
							res.end(JSON.stringify({status: "error", description: "No name", "id":"NONAME"}));
							return;
						}
						if (groupname.toString().trim().length == 0) {
							res.statusCode = 411;
							res.end(JSON.stringify({status: "error", description: "No name", "id":"NONAME"}));
							return;
						}
						
						if (groups[groupid]) {
							groups[groupid].name = groupname;
							groups[groupid].picture = grouppicture;
							groups[groupid].info = groupinfo;
							groups[groupid].roles = groles;
							res.statusCode = 200;
							res.end(JSON.stringify({groupid: groupid}));
						}else {
							res.statusCode = 404;
							res.end(JSON.stringify({status: "error", description: "No group", "id":"NOGROUP"}));
						}
					}else {
						res.statusCode = 401;
						res.end(JSON.stringify({status: "error", description: "Invalid token", "id":"INTOKEN"}));
					}
				}else {
					res.statusCode = 411;
					res.end(JSON.stringify({status: "error", description: "No token", "id":"NOTOKEN"}));
				}
			}catch (e) {console.error(e)}
		});
	}else if (req.url == "/joingroup") {
		let data = []
		req.on('data', (chunk) => {
			data.push(chunk)
		})
		req.on('end', () => {
			try {
				var bd = JSON.parse(data);
				var token = bd["token"];
				if (token) {
					var email = userfromtoken[token];
					if (users[uidfromemail[email]]) {
						var groupid = bd["groupid"];
						if (groups[groupid]) {
							var chatlist = chatslist[token];
							if (chatlist == undefined) {
								chatlist = [];
							}
							if (chatlist.some(e => e.group === groupid)) {
								res.statusCode = 200;
								res.end(JSON.stringify({groupid: groupid}));
								return;
							}
							var date = new Date();
							let diff = -date.getTimezoneOffset();
							groupusersa = groupusers[groupid];
							if (groupusersa[uidfromemail[email]]) {
								res.statusCode = 200;
								res.end(JSON.stringify({groupid: groupid}));
								return;
							}
							groupusersa[uidfromemail[email]] = {
								user: uidfromemail[email],
								role: "Normal",
								jointime: (date.getMonth() + 1).pad() + " " + date.getDate().pad() + " " + date.getFullYear() + ", " + date.getHours().toString().padStart(2, '0') + ":" + date.getMinutes().toString().padStart(2, '0') + " " + ((diff<=0?"":"+") + Math.floor(diff / 60).pad().toString() + ":" + Math.floor(diff % 60).pad().toString())
							};
							groupusers[groupid] = groupusersa;
							chatlist.push({
								group: groupid,
								type: "group",
								chatid: groupid
							});
							chatslist[token] = chatlist;
							res.statusCode = 200;
							res.end(JSON.stringify({groupid: groupid}));
						}else {
							res.statusCode = 404;
							res.end(JSON.stringify({status: "error", description: "No group found", "id":"NOGROUP"}));
						}
					}else {
						res.statusCode = 401;
						res.end(JSON.stringify({status: "error", description: "Invalid token", "id":"INTOKEN"}));
					}
				}else {
					res.statusCode = 411;
					res.end(JSON.stringify({status: "error", description: "No token", "id":"NOTOKEN"}));
				}
			}catch {}
		});
	}else if (req.url == "/getgroupusers") {
		let data = []
		req.on('data', (chunk) => {
			data.push(chunk)
		})
		req.on('end', () => {
			try {
				var bd = JSON.parse(data);
				var token = bd["token"];
				if (token) {
					var email = userfromtoken[token];
					if (users[uidfromemail[email]]) {
						var groupid = bd["groupid"];
						if (groups[groupid]) {
							res.statusCode = 200;
							res.end(JSON.stringify(groupusers[groupid]));
						}else {
							res.statusCode = 404;
							res.end(JSON.stringify({status: "error", description: "No group found", "id":"NOGROUP"}));
						}
					}else {
						res.statusCode = 401;
						res.end(JSON.stringify({status: "error", description: "Invalid token", "id":"INTOKEN"}));
					}
				}else {
					res.statusCode = 411;
					res.end(JSON.stringify({status: "error", description: "No token", "id":"NOTOKEN"}));
				}
			}catch {}
		});
	}else if (req.url == "/getgroupuserscount") {
		let data = []
		req.on('data', (chunk) => {
			data.push(chunk)
		})
		req.on('end', () => {
			//try {
				var bd = JSON.parse(data);
				var token = bd["token"];
				if (token) {
					var email = userfromtoken[token];
					if (users[uidfromemail[email]]) {
						var groupid = bd["groupid"];
						if (groups[groupid]) {
							res.statusCode = 200;
							res.end(Object.keys(groupusers[groupid]).length.toString());
						}else {
							res.statusCode = 404;
							res.end(JSON.stringify({status: "error", description: "No group found", "id":"NOGROUP"}));
						}
					}else {
						res.statusCode = 401;
						res.end(JSON.stringify({status: "error", description: "Invalid token", "id":"INTOKEN"}));
					}
				}else {
					res.statusCode = 411;
					res.end(JSON.stringify({status: "error", description: "No token", "id":"NOTOKEN"}));
				}
			//}catch {}
		});
	}else if (req.url == "/edituser") {
		let data = []
		req.on('data', (chunk) => {
			data.push(chunk)
		})
		req.on('end', () => {
			try {
				var bd = JSON.parse(data);
				var token = bd["token"];
				if (token) {
					var email = userfromtoken[token];
					if (users[uidfromemail[email]]) {
						var groupid = bd["groupid"];
						var userid = bd["userid"];
						if (userid == undefined) {
							res.statusCode = 411;
							res.end(JSON.stringify({status: "error", description: "No UID", "id":"NOUID"}));
						}
						if (groups[groupid]) {
							var gusers = groupusers[groupid];
							if (groups[groupid].roles[gusers[uidfromemail[email]].role].AllowEditingUsers == true) {
								if (gusers[userid]) {
									var role = bd["role"];
									if (role) {
										var roles = groups[groupid].roles;
										if (roles[role]) {
											gusers[userid].role = role;
											groupusers[groupid] = gusers;
											res.statusCode = 200;
											res.end(JSON.stringify({status: "done"}));
										}else {
											res.statusCode = 404;
											res.end(JSON.stringify({status: "error", description: "Invalid role", "id":"INROLE"}));
										}
									}else {
										res.statusCode = 411;
										res.end(JSON.stringify({status: "error", description: "No role", "id":"NOROLE"}));
									}
								}else {
									res.statusCode = 404;
									res.end(JSON.stringify({status: "error", description: "No user found", "id":"NOUSER"}));
								}
							}else {
								res.statusCode = 403;
								res.end(JSON.stringify({status: "error", description: "You don't have the permission", "id":"NOPERM"}));
							}
						}else {
							res.statusCode = 404;
							res.end(JSON.stringify({status: "error", description: "No group found", "id":"NOGROUP"}));
						}
					}else {
						res.statusCode = 401;
						res.end(JSON.stringify({status: "error", description: "Invalid token", "id":"INTOKEN"}));
					}
				}else {
					res.statusCode = 411;
					res.end(JSON.stringify({status: "error", description: "No token", "id":"NOTOKEN"}));
				}
			}catch {}
		});
	}else if (req.url == "/kickuser") {
		let data = []
		req.on('data', (chunk) => {
			data.push(chunk)
		})
		req.on('end', () => {
			try {
				var bd = JSON.parse(data);
				var token = bd["token"];
				if (token) {
					var email = userfromtoken[token];
					if (users[uidfromemail[email]]) {
						var groupid = bd["groupid"];
						var userid = bd["userid"];
						if (userid == undefined) {
							res.statusCode = 411;
							res.end(JSON.stringify({status: "error", description: "No UID", "id":"NOUID"}));
						}
						if (groups[groupid]) {
							var gusers = groupusers[groupid];
							if (groups[groupid].roles[gusers[uidfromemail[email]].role].AllowKicking == true) {
								if (gusers[userid]) {
									delete gusers[userid];
									groupusers[groupid] = gusers;
									var chatlist = chatslist[tokenfromuser[getKeyByValue(uidfromemail,userid)]]
									var ind = chatlist.findIndex(e => e.group === groupid)
									if (ind != -1) {
										chatlist.splice(ind, 1);
									}
									res.statusCode = 200;
									res.end(JSON.stringify({status: "done"}));
								}else {
									res.statusCode = 404;
									res.end(JSON.stringify({status: "error", description: "No user found", "id":"NOUSER"}));
								}
							}else {
								res.statusCode = 403;
								res.end(JSON.stringify({status: "error", description: "You don't have the permission", "id":"NOPERM"}));
							}
						}else {
							res.statusCode = 404;
							res.end(JSON.stringify({status: "error", description: "No group found", "id":"NOGROUP"}));
						}
					}else {
						res.statusCode = 401;
						res.end(JSON.stringify({status: "error", description: "Invalid token", "id":"INTOKEN"}));
					}
				}else {
					res.statusCode = 411;
					res.end(JSON.stringify({status: "error", description: "No token", "id":"NOTOKEN"}));
				}
			}catch {}
		});
	}else if (req.url == "/setonline") {
		let data = []
		req.on('data', (chunk) => {
			data.push(chunk)
		})
		req.on('end', () => {
			try {
				var bd = JSON.parse(data);
				var token = bd["token"];
				if (updaterinfo[token] == undefined) {
					updaterinfo[token] = {};
				};
				if (token) {
					var email = userfromtoken[token];
					var uid = uidfromemail[email];
					if (users[uid]) {
						useronlinestatus[uid] = "Online";
						if (useronlinetimeouts[uid]) {
							try {
								clearTimeout(useronlinetimeouts[uid]);
							}catch {}
						}
						useronlinetimeouts[uid] = setTimeout(function() {
							var date = new Date();
							let diff = -date.getTimezoneOffset();
							useronlinestatus[uid] = (date.getMonth() + 1).pad() + " " + date.getDate().pad() + " " + date.getFullYear() + ", " + date.getHours().toString().padStart(2, '0') + ":" + date.getMinutes().toString().padStart(2, '0') + " " + ((diff<=0?"":"+") + Math.floor(diff / 60).pad().toString() + ":" + Math.floor(diff % 60).pad().toString());
							updaterinfo[token] = {};
						}, 6000) 
						res.statusCode = 200;
						res.end("");
					}else {
						res.statusCode = 401;
						res.end(JSON.stringify({status: "error", description: "Invalid token", "id":"INTOKEN"}));
					}
				}else {
					res.statusCode = 411;
					res.end(JSON.stringify({status: "error", description: "No token", "id":"NOTOKEN"}));
				}
			}catch {}
		});
	}else if (req.url == "/setoffline") {
		let data = []
		req.on('data', (chunk) => {
			data.push(chunk)
		})
		req.on('end', () => {
			try {
				var bd = JSON.parse(data);
				var token = bd["token"];
				if (token) {
					var email = userfromtoken[token];
					var uid = uidfromemail[email];
					if (users[uid]) {
						var date = new Date();
						let diff = -date.getTimezoneOffset();
						useronlinestatus[uid] = (date.getMonth() + 1).pad() + " " + date.getDate().pad() + " " + date.getFullYear() + ", " + date.getHours().toString().padStart(2, '0') + ":" + date.getMinutes().toString().padStart(2, '0') + " " + ((diff<=0?"":"+") + Math.floor(diff / 60).pad().toString() + ":" + Math.floor(diff % 60).pad().toString());
						if (useronlinetimeouts[uid]) {
							try {
								clearTimeout(useronlinetimeouts[uid]);
							}catch {}
						}
						res.statusCode = 200;
						res.end(JSON.stringify({status: "done"}));
					}else {
						res.statusCode = 401;
						res.end(JSON.stringify({status: "error", description: "Invalid token", "id":"INTOKEN"}));
					}
				}else {
					res.statusCode = 411;
					res.end(JSON.stringify({status: "error", description: "No token", "id":"NOTOKEN"}));
				}
			}catch {}
		});
	}else if (req.url == "/getnotifications") {
		let data = []
		req.on('data', (chunk) => {
			data.push(chunk)
		})
		req.on('end', () => {
			try {
				var bd = JSON.parse(data);
				var token = bd["token"];
				if (token) {
					var email = userfromtoken[token];
					var uid = uidfromemail[email];
					if (users[uid]) {
						if (notifications[token] == undefined) {
							notifications[token] = {};
						}
						res.statusCode = 200;
						res.end(JSON.stringify(notifications[token]));
						let keys = Object.keys(notifications[token]);
						setTimeout(function() {
							try {
								keys.forEach(function(i) {
									delete notifications[token][i]
								})
							}catch{}
						},3000)
					}else {
						res.statusCode = 401;
						res.end(JSON.stringify({status: "error", description: "Invalid token", "id":"INTOKEN"}));
					}
				}else {
					res.statusCode = 411;
					res.end(JSON.stringify({status: "error", description: "No token", "id":"NOTOKEN"}));
				}
			}catch {}
		});
	}else if (req.url == "/getonline") {
		let data = []
		req.on('data', (chunk) => {
			data.push(chunk)
		})
		req.on('end', () => {
			try {
				var bd = JSON.parse(data);
				var token = bd["token"];
				if (token) {
					var email = userfromtoken[token];
					var uid = uidfromemail[email];
					if (users[uid]) {
						var tuid = bd["uid"];
						if (tuid) {
							if (users[tuid]) {
								res.statusCode = 200;
								res.end(useronlinestatus[tuid]);
							}else {
								res.statusCode = 401;
								res.end(JSON.stringify({status: "error", description: "Invalid UID", "id":"INUID"}));
							}
						}else {
							res.statusCode = 411;
							res.end(JSON.stringify({status: "error", description: "No UID", "id":"NOUID"}));
						}
					}else {
						res.statusCode = 401;
						res.end(JSON.stringify({status: "error", description: "Invalid token", "id":"INTOKEN"}));
					}
				}else {
					res.statusCode = 411;
					res.end(JSON.stringify({status: "error", description: "No token", "id":"NOTOKEN"}));
				}
			}catch {}
		});
	}else if (req.url == "/sendreaction") {
		let data = []
		req.on('data', (chunk) => {
			data.push(chunk)
		})
		req.on('end', () => {
			try {
				var bd = JSON.parse(data);
				var token = bd["token"];
				if (token) {
					var email = userfromtoken[token];
					var uid = uidfromemail[email];
					if (users[uid]) {
						if (bd["chatid"]) {
							var chat = chats[bd["chatid"]];
							if (bd["msgid"]) {
								if (chat[bd["msgid"]]) {
									var reaction = bd["reaction"];
									if (reaction) {
										var msg = chat[bd["msgid"]];
										var isgroup = !bd["chatid"].includes("-");
										var spl = bd["chatid"].split("-");
										if (!isgroup ? (spl[0] == uidfromemail[email] || spl[1] == uidfromemail[email]) : (groupusers[bd["chatid"]][uidfromemail[email]] && groups[bd["chatid"]].roles[groupusers[bd["chatid"]][uidfromemail[email]].role].AllowSendingReactions == true)) {
											var date = new Date();
											let diff = -date.getTimezoneOffset();
											var reactions = msg["reactions"];
											if (reactions == undefined) {
												reactions = {};
											}
											var reactionsemoji = reactions[reaction];
											if (reactionsemoji == undefined) {
												reactionsemoji = {};
											}
											if (reactionsemoji[uid]) {
												delete reactionsemoji[uid];
												if (Object.keys(reactionsemoji).length == 0) {
													delete reactionsemoji;
												}
												Object.values(updaterinfo).forEach((i) => {
													//if (i[bd[chatid]]) {
													//	i[bd[chatid]][msg] = {
													//		event:"REMREACT",
													//		id:uid,
													//		msg:msg
													//	}
													//}
												})
											}else {
												reactionsemoji[uid] = {
													reaction: reaction,
													sender: uid,
													time: (date.getMonth() + 1).pad() + " " + date.getDate().pad() + " " + date.getFullYear() + ", " + date.getHours().toString().padStart(2, '0') + ":" + date.getMinutes().toString().padStart(2, '0') + " " + ((diff<=0?"":"+") + Math.floor(diff / 60).pad().toString() + ":" + Math.floor(diff % 60).pad().toString())
												}
												
											}
											reactions[reaction] = reactionsemoji;
											msg["reactions"] = reactions;
											chat[bd["msgid"]] = msg;
											chats[bd["chatid"]] = chat;
											res.statusCode = 200;
											res.end(JSON.stringify(reactions));
											Object.values(updaterinfo).forEach((i) => {
												if (i[bd["chatid"]]) {
													//i[bd[chatid]][msg] = {
													//	event:"REACT",
													//	reaction: reaction,
													//	msg:msg,
													//	sender: uid,
													//	time: (date.getMonth() + 1).pad() + " " + date.getDate().pad() + " " + date.getFullYear() + ", " + date.getHours().toString().padStart(2, '0') + ":" + date.getMinutes().toString().padStart(2, '0') + " " + ((diff<=0?"":"+") + Math.floor(diff / 60).pad().toString() + ":" + Math.floor(diff % 60).pad().toString())
													//}
													i[bd["chatid"]][bd["msgid"]] = {
														event:"REACTIONS",
														rect:reactions
													}
												}
											})
										}else {
											res.statusCode = 403;
											res.end(JSON.stringify({status: "error", description: "You dont have permission to react messages", "id":"NOPERM"}));
										}
									}else {
										res.statusCode = 411;
										res.end(JSON.stringify({status: "error", description: "No reaction", "id":"NOREACT"}));
									}
								}else {
									res.statusCode = 404;
									res.end(JSON.stringify({status: "error", description: "Invalid messageid", "id":"INMSGID"}));
								}
							}else {
								res.statusCode = 411;
								res.end(JSON.stringify({status: "error", description: "No messageid", "id":"NOMSGID"}));
							}
						}else {
							res.statusCode = 411;
							res.end(JSON.stringify({status: "error", description: "No chatid", "id":"NOCID"}));
						}
					}else {
						res.statusCode = 401;
						res.end(JSON.stringify({status: "error", description: "Invalid token", "id":"INTOKEN"}));
					}
				}else {
					res.statusCode = 411;
					res.end(JSON.stringify({status: "error", description: "No token", "id":"NOTOKEN"}));
				}
			}catch {}
		});
	}else if (req.url == "/getreactions") {
		let data = []
		req.on('data', (chunk) => {
			data.push(chunk)
		})
		req.on('end', () => {
			try {
				var bd = JSON.parse(data);
				var token = bd["token"];
				if (token) {
					var email = userfromtoken[token];
					var uid = uidfromemail[email];
					if (users[uid]) {
						if (bd["chatid"]) {
							var chat = chats[bd["chatid"]];
							if (bd["msgid"]) {
								if (chat[bd["msgid"]]) {
									var msg = chat[bd["msgid"]];
									var isgroup = !bd["chatid"].includes("-");
									var spl = bd["chatid"].split("-");
									if (!isgroup ? (spl[0] == uidfromemail[email] || spl[1] == uidfromemail[email]) : (groupusers[bd["chatid"]][uidfromemail[email]])) {
										var reactions = msg["reactions"];
										if (reactions == undefined) {
											reactions = {};
										}
										res.statusCode = 200;
										res.end(JSON.stringify(reactions));
									}else {
										res.statusCode = 403;
										res.end(JSON.stringify({status: "error", description: "Not joined this chat", "id":"NOPERM"}));
									}
								}else {
									res.statusCode = 404;
									res.end(JSON.stringify({status: "error", description: "Invalid messageid", "id":"INMSGID"}));
								}
							}else {
								res.statusCode = 411;
								res.end(JSON.stringify({status: "error", description: "No messageid", "id":"NOMSGID"}));
							}
						}else {
							res.statusCode = 411;
							res.end(JSON.stringify({status: "error", description: "No chatid", "id":"NOCID"}));
						}
					}else {
						res.statusCode = 401;
						res.end(JSON.stringify({status: "error", description: "Invalid token", "id":"INTOKEN"}));
					}
				}else {
					res.statusCode = 411;
					res.end(JSON.stringify({status: "error", description: "No token", "id":"NOTOKEN"}));
				}
			}catch {}
		});
	}else if (req.url == "/upload" && req.method.toLowerCase() == "post") {
		try {
			var token = req.headers["token"];
			console.log(token);
			if (token) {
				var email = userfromtoken[token];
				var uid = uidfromemail[email];
				if (users[uid]) {
					res.setHeader('Content-Type', 'application/json')

					let contentLength = parseInt(req.headers['content-length'])
					if (isNaN(contentLength) || contentLength <= 0 ) {
					  res.statusCode = 411;
					  res.end(JSON.stringify({status: "error", description: "No File"}))
					  return
					}
					// Try to use the original filename
					let id = makeid(20);
					if (req.headers['content-type'] == undefined) {
						req.headers['content-type'] = "UNKNOWN/file"
					}
					let filename = id + "." + req.headers['content-type'].split('/')[1];
					while (fs.existsSync(`./uploads/${filename}`)) {
						let id = makeid(20);
						filename = id + "." + req.headers['content-type'].split('/')[1];
						filename = filename.replace(/\\/g,"");
						console.log(filename,fs.existsSync(`./uploads/${filename}`))
					}
					const fil = '%SERVER%getmedia/?file=' + filename;
					console.log(fil);
					const filestream = fs.createWriteStream(`./uploads/${filename}`)

					filestream.on("error", (error) => {
					  console.error(error)
					  res.statusCode = 400;
					  res.write(JSON.stringify({status: "error", description: error}))
					  res.end()
					})
					

					// Write data as it comes
					req.pipe(filestream)

					req.on('end', () => {
						console.log(fil);
						filestream.close(() => {
							console.log(fil);
							res.end(JSON.stringify({status: "success",url: fil}))
						})
					})
				}else {
					res.statusCode = 401;
					res.end(JSON.stringify({status: "error", description: "Invalid token", "id":"INTOKEN"}));
				}
			}else {
				res.statusCode = 411;
				res.end(JSON.stringify({status: "error", description: "No token", "id":"NOTOKEN"}));
			}
		}catch (e) {console.error(e)}
	}else if (req.url.split("?")[0] == "/getmedia/") {
		try {
			//console.time("stat");
			var query = url.parse(req.url,true).query;
			console.log(query.file,"new request");
			if (query["file"]) {
				var file = query["file"].replace(/\\/g,"");
				fs.stat("./uploads/" + file,(err,stat) => {
					if (err) {
						res.writeHead(500);
						res.end();
						console.error(err);
						return;
					}
					//console.time("read");
					//console.timeEnd("stat");
					res.writeHead(200, {
						'Content-Length': stat.size
					});
					delete stat;
					try {
						const readStream = fs.createReadStream("./uploads/" + file);

						readStream.on('data', function(chunk) {
							res.write(chunk);
						});

						readStream.on('end', function() {
							//console.timeEnd("read");
							res.end();
							delete readStream;
						});
					}catch (e) {
						res.writeHead(500);
						res.end();
						console.error(e);
					}
				})
			}else {
				res.statusCode = 441;
				res.write("No file provided.")
				res.end()
			}
		}catch (e) {console.error(e)}
	}else if (req.url == "/ping") {
		res.statusCode = 200;
		res.write("Pong!")
		res.end()
	}else if (req.url == "/getupdates") {
		let data = []
		req.on('data', (chunk) => {
			data.push(chunk)
		})
		req.on('end', () => {
			//try {
				var bd = JSON.parse(data);
				var token = bd["token"];
				if (token) {
					var email = userfromtoken[token];
					var uid = uidfromemail[email];
					if (users[uid]) {
						var tuid = bd["id"];
						if (tuid) {
							if (updaterinfo[token][tuid]) {
								res.statusCode = 200;
								res.end(JSON.stringify(updaterinfo[token][tuid]));
								let keys = Object.keys(updaterinfo[token][tuid]);
								setTimeout(function() {
									try {
										keys.forEach(function(i) {
											delete updaterinfo[token][tuid][i]
										})
									}catch{}
								},3000)
							}else {
								res.statusCode = 401;
								res.end(JSON.stringify({status: "error", description: "Invalid ID", "id":"INUID"}));
								updaterinfo[token][tuid] = {};
							}
						}else {
							res.statusCode = 411;
							res.end(JSON.stringify({status: "error", description: "No ID", "id":"NOUID"}));
						}
					}else {
						res.statusCode = 401;
						res.end(JSON.stringify({status: "error", description: "Invalid token", "id":"INTOKEN"}));
					}
				}else {
					res.statusCode = 411;
					res.end(JSON.stringify({status: "error", description: "No token", "id":"NOTOKEN"}));
				}
			//}catch {}
		});
	}else {
		res.statusCode = 200;
		res.write("Pong!")
		res.end()
	}
}

process.on('SIGHUP', function() {
	console.log("Shutting down...")
	var date = new Date();
	let diff = -date.getTimezoneOffset();
	var timestr = (date.getMonth() + 1).pad() + " " + date.getDate().pad() + " " + date.getFullYear() + ", " + date.getHours().toString().padStart(2, '0') + ":" + date.getMinutes().toString().padStart(2, '0') + " " + ((diff<=0?"":"+") + Math.floor(diff / 60).pad().toString() + ":" + Math.floor(diff % 60).pad().toString());
	console.log("Ending offline timers...")
	var tkeys = Object.keys(useronlinetimeouts);
	tkeys.forEach(i => {
		try {
			clearTimeout(useronlinetimeouts[i]);
		}catch {}
	});
	console.log("Making users offline...")
	var keys = Object.keys(useronlinestatus);
	keys.forEach(i => {
		if (useronlinestatus[i] == "Online") {
			useronlinestatus[i] = timestr;
		}
	});
	console.log("Saving data...")
	savedata(function() {
		process.exit();
	});
});

const server = http.createServer(requestListener);
server.listen(port);