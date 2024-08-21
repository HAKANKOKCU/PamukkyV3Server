let http = require("http");
const fs = require('fs');
const process = require('process');
let url = require('url');
let path = require('path');
const port = 8080;

let users = {};
let userauths = {};
let chats = {};
let userfromtoken = {};
let tokenfromuser = {};
let uidfromemail = {};
let chatslist = {};
let groups = {};
let groupusers = {};
let useronlinetimeouts = {};
let useronlinestatus = {};
let updaterinfo = {};
let notifications = {};
const r = ["AllowMessageDeleting","AllowEditingUsers","AllowEditingSettings","AllowKicking","AllowBanning","AllowSending","AllowSendingReactions"];
const chatpagesize = 64;
const args = process.argv;
console.log(args);

Number.prototype.pad = function(size) {
    let s = String(this);
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
fs.mkdirSync("uploads");
fs.mkdirSync("data/chats");
}catch{}


const isFile = fileName => {
  return fs.lstatSync(fileName).isFile();
};

const isFolder = fileName => {
  return !fs.lstatSync(fileName).isFile();
};


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
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,:;~$%{[]}()=?\\*-|_\'"';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < 50) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

function savedata(cb) {
	let savejson = {
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
		if (!fs.existsSync("./data.json")) {
			fs.writeFileSync("./data.json", "{}")
		}
		let parsedjson = JSON.parse(fs.readFileSync("./data.json"));
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
		if (args.includes('--CLEANUP_UNUSEDFILES')) {
			let folderPath = "uploads";
			let files = fs.readdirSync(folderPath)
			  .map(fileName => {
				return path.join(folderPath, fileName).replace("\\","/");
			  })
			  .filter(isFile);
			console.log(files);
			
			{
				//users
				console.log("users:")
				let ukeys = Object.keys(users);
				ukeys.forEach((i) => {
					let u = users[i];
					if (u.picture) {
						if (u.picture.startsWith("%SERVER%getmedia/?file=")) {
							let up = u.picture.replace("%SERVER%getmedia/?file=","");
							let io = files.indexOf("uploads/" + up);
							if (io > -1) {
								console.log(up + " is used");
								files.splice(io, 1);
							} 
						}
					}
				});
			}
			
			{
				//groups
				console.log("groups:")
				let ukeys = Object.keys(groups);
				ukeys.forEach((i) => {
					let u = groups[i];
					if (u.picture) {
						if (u.picture.startsWith("%SERVER%getmedia/?file=")) {
							let up = u.picture.replace("%SERVER%getmedia/?file=","");
							let io = files.indexOf("uploads/" + up);
							if (io > -1) {
								console.log(up + " is used");
								files.splice(io, 1);
							} 
						}
					}
				});
			}
			
			
			{
				//groups
				
				console.log("chats:")
				let folderPath = "data/chats";
				let chats = fs.readdirSync(folderPath)
				  .map(fileName => {
					return path.join(folderPath, fileName);
				  })
				  .filter(isFolder);
				console.log(chats);
				chats.forEach((i) => {
					let datajson = path.join(i, "data.json")
					console.log(datajson);
					let chat = JSON.parse(fs.readFileSync(datajson));
					let ckeys = Object.keys(chat);
					ckeys.forEach((i) => {
						let msg = chat[i];
						if (msg.files) {
							msg.files.forEach((i) => {
								if (i.startsWith("%SERVER%getmedia/?file=")) {
									let up = i.replace("%SERVER%getmedia/?file=","");
									let io = files.indexOf("uploads/" + up);
									if (io > -1) {
										console.log(up + " is used");
										files.splice(io, 1);
									} 
								}
							})
						}
					})
				})
			}
			
			
			console.log(files);
			if (args.includes('--WIPEUNUSED')) {
				console.log("Starting to delete files...")
				files.forEach((i) => {
					fs.unlinkSync(i);
					console.log("Deleted " + i)
				})
			}else {
				console.log("Summary of unused files created, if you meant to delete them, add '--WIPEUNUSED' argument.")
			}
			console.log("Done!")
		}
	}catch (e) {
		console.log("A critical error occured!");
		throw e;
	}
}

loaddata();
const requestListener = async (req, res) => {
	res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', '*');//GET, POST, OPTIONS, PUT, PATCH, DELETE

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', '*'); //X-Requested-With,content-type,Content-Type,token,Content-Length,Connection,Accept,Origin,Content-Language,Accept-Language,DPR,Save-Data,Viewport-Width,Width,Accept-Encoding,Host, Sec-Fetch-Dest, Sec-Fetch-Mode,Sec-Fetch-Site,User-Agent
	//res.setHeader('Access-Control-Expose-Headers', 'agreementrequired');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
	if (req.url == "/") {
		res.writeHead(302, {
		  'Location': 'https://pamukky.netlify.app/v3/?server=' + "http" + '://' + req.headers.host + "/" //req.headers.protocol
		  //add other headers here...
		});
		res.end();
	}else if (req.url == "/savedata") {
		savedata(function() {
			res.statusCode = 200;
			res.end("saved");
		});
	}else if (req.url == "/login") {
		let data = []
		req.on('data', (chunk) => {
			data.push(chunk)
		})
		req.on('end', () => {
			try {
				let bd = JSON.parse(data);
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
				let auth = userauths[bd["email"]];
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
				let bd = JSON.parse(data);
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
				let id = makeid(28);
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
				let token = maketoken();
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
			try {
				let bd = JSON.parse(data);
				let token = bd["token"];
				if (token) {
					let email = userfromtoken[token];
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
							let oldchatslist = Object.assign([], chatslist[token])
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
							let id = uidfromemail[email];
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
			}catch {}
		});
	}else if (req.url == "/getuser") {
		let data = []
		req.on('data', (chunk) => {
			data.push(chunk)
		})
		req.on('end', () => {
			try {
				let bd = JSON.parse(data);
				let email = getKeyByValue(uidfromemail,bd["uid"]);
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
				let bd = JSON.parse(data);
				let gid = bd["groupid"];
				if (gid) {
					if (groups[gid]) {
						res.statusCode = 200;
						let name = groups[gid].name;
						let picture = groups[gid].picture;
						let info = groups[gid].info;
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
				let bd = JSON.parse(data);
				let gid = bd["groupid"];
				if (gid) {
					if (groups[gid]) {
						res.statusCode = 200;
						let rs = groups[gid].roles;
						Object.keys(rs).forEach((i) => {
							let rp = rs[i];
							r.forEach((i) => {
								
								if (rp[i] == undefined) {
									rp[i] = false;
								}
							})
						})
						res.end(JSON.stringify(rs));
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
				let bd = JSON.parse(data);
				let token = bd["token"];
				if (token) {
					let email = userfromtoken[token];
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
				let bd = JSON.parse(data);
				let token = bd["token"];
				if (token) {
					let email = userfromtoken[token];
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
								let cht = chats[i.chatid];
								if (cht == undefined || cht == null) {
									try {
										cht = JSON.parse(fs.readFileSync("data/chats/" + i.chatid + "/data.json"));
										chats[i.chatid] = cht;
									}catch {
										cht = {};
									}
								}
								let kys = Object.keys(cht);
								i.lastmessage = cht[kys[kys.length - 1]]
							}catch (e) {console.log(e)}
						})
						chatlista.sort(function(x, y){
							return -(new Date(x.lastmessage.time) - new Date(y.lastmessage.time));
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
			}catch (e) {console.error(e)}
		});
	}else if (req.url == "/getlastmessage") {
		let data = []
		req.on('data', (chunk) => {
			data.push(chunk)
		})
		req.on('end', () => {
			try {
				let bd = JSON.parse(data);
				let token = bd["token"];
				if (token) {
					let email = userfromtoken[token];
					if (users[uidfromemail[email]]) {
						let spl = bd["chatid"].split("-");
						let isgroup = !bd["chatid"].includes("-");
						if (!isgroup ? (spl[0] == uidfromemail[email] || spl[1] == uidfromemail[email]) : (groupusers[bd["chatid"]][uidfromemail[email]])) {
							res.statusCode = 200;
							//let chatpagei = [];
							let chatitself = chats[bd["chatid"]];
							if (chatitself == undefined || chatitself == null) {
								chatitself = {};
							}
							let kys = Object.keys(chatitself);
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
				let bd = JSON.parse(data);
				let token = bd["token"];
				if (token) {
					let email = userfromtoken[token];
					if (users[uidfromemail[email]]) {
						let semail = bd["email"];
						if (semail) {
							if (users[uidfromemail[semail]]) {
								let chatlist = chatslist[token];
								if (chatlist == undefined) {
									chatlist = [];
								}
								let chatlistsec = chatslist[tokenfromuser[semail]];
								if (chatlistsec == undefined) {
									chatlistsec = [];
								}
								let ind = chatlist.findIndex(e => e.user === uidfromemail[semail])
								if (ind != -1) {
									if (chatlistsec.some(e => e.user === uidfromemail[email])) {
										console.log("both users already has chat item");
										res.statusCode = 411;
										res.end(JSON.stringify({status: "done", description: "Both users already has the chat.", "id":"ALREADYHAS"}));
										return;
									}else {
										chatlistsec.push({
											user: uidfromemail[email],
											type: "user",
											chatid: chatlist[ind].chatid
										});
									}
								}else {
									let indd = chatlistsec.findIndex(e => e.user === uidfromemail[email]);
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
								if (chats[uidfromemail[email] + "-" + uidfromemail[semail]] == undefined) {
									try {
										chats[uidfromemail[email] + "-" + uidfromemail[semail]] = JSON.parse(fs.readFileSync("data/chats/" + bd["chatid"] + "/data.json"));
									}catch {
										chats[uidfromemail[email] + "-" + uidfromemail[semail]] = {};
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
				let bd = JSON.parse(data);
				let token = bd["token"];
				if (token) {
					let email = userfromtoken[token];
					if (users[uidfromemail[email]]) {
						let spl = bd["chatid"].split("-");
						let isgroup = !bd["chatid"].includes("-");
						if (!isgroup ? (spl[0] == uidfromemail[email] || spl[1] == uidfromemail[email]) : (groupusers[bd["chatid"]][uidfromemail[email]])) {
							res.statusCode = 200;
							if (updaterinfo[token][bd["chatid"]] == undefined) {
								updaterinfo[token][bd["chatid"]] == {}
							}
							//let chatpagei = [];
							let chatitself = chats[bd["chatid"]];
							let chatpage = 0;
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
							let kys = Object.keys(chatitself);
							let start = kys.length + (chatpage - 1 * chatpagesize);
							let end = kys.length + (chatpage * chatpagesize);
							if (start < 0) {
								start = 0;
							}
							const chunk = kys.slice(start, end);
							let items = {};
							chunk.forEach(i => {
								let a = Object.assign({},chatitself[i]);
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
								if (a.files) {
									a.gImages = [];
									a.gVideos = [];
									a.gFiles = [];
									a.files.forEach(function(i) {
										let extension = i.split(".")[1];
										if (extension == "png" || extension == "jpg" || extension == "jpeg" || extension == "gif" || extension == "bmp") {
											a.gImages.push({url:i})
										}else if (extension == "mp4") {
											a.gVideos.push({url:i});
										}else {
											if (i.includes("%SERVER%getmedia/?file=")) {
												let x = i.replace("%SERVER%getmedia/?file=","./uploads/")
												try {
													let inf = JSON.parse(fs.readFileSync(x + ".json"))
													a.gFiles.push({url:i, name: inf.actualname, size: inf.size})
												}catch {
													a.gFiles.push({url:i, name: i})
												}
											}else {
												a.gFiles.push({url:i, name: i})
											}
										}
									});
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
			}catch (e) {console.error(e)}
		});
	}else if (req.url == "/getmsgpage") {
		let data = []
		req.on('data', (chunk) => {
			data.push(chunk)
		})
		req.on('end', () => {
			try {
				let bd = JSON.parse(data);
				let token = bd["token"];
				if (token) {
					let email = userfromtoken[token];
					if (users[uidfromemail[email]]) {
						let spl = bd["chatid"].split("-");
						let isgroup = !bd["chatid"].includes("-");
						if (!isgroup ? (spl[0] == uidfromemail[email] || spl[1] == uidfromemail[email]) : (groupusers[bd["chatid"]][uidfromemail[email]])) {
							let chatitself = chats[bd["chatid"]];
							if (chatitself[bd["msgid"]]) {
								let kys = Object.keys(chatitself);
								let io = kys.length - kys.indexOf(bd["msgid"]);
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
			try {
				let bd = JSON.parse(data);
				let token = bd["token"];
				if (token) {
					let email = userfromtoken[token];
					if (users[uidfromemail[email]]) {
						let isgroup = !bd["chatid"].includes("-");
						let spl = bd["chatid"].split("-");
						if (!isgroup ? (spl[0] == uidfromemail[email] || spl[1] == uidfromemail[email]) : (groupusers[bd["chatid"]][uidfromemail[email]] && groups[bd["chatid"]].roles[groupusers[bd["chatid"]][uidfromemail[email]].role].AllowSending == true)) {
							res.statusCode = 200;
							let chatitself = chats[bd["chatid"]];
							if (chatitself == undefined || chatitself == null) {
								try {
									chatitself = JSON.parse(fs.readFileSync("data/chats/" + bd["chatid"] + "/data.json"));
									chats[bd["chatid"]] = chatitself;
								}catch {
									chatitself = {};
								}
							}
							if (bd.files == null || bd.files == undefined) bd.files = [];
							if (bd["content"] || bd.files.length > 0) {
								if (bd["content"].toString().trim().length == 0 && bd.files.length < 1) {
									res.statusCode = 411;
									res.end(JSON.stringify({status: "error", description: "No Content", "id":"NOCONTENT"}));
								}else {
									let date = new Date();
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
											let a = {
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
											
											if (a.files) {
												a.gImages = [];
												a.gFiles = [];
												a.gVideos = [];
												a.files.forEach(function(i) {
													let extension = i.split(".")[1];
													if (extension == "png" || extension == "jpg" || extension == "jpeg" || extension == "gif" || extension == "bmp") {
														a.gImages.push({url:i})
													}else if (extension == "mp4") {
														a.gVideos.push({url:i});
													}else {
														if (i.includes("%SERVER%getmedia/?file=")) {
															let x = i.replace("%SERVER%getmedia/?file=","./uploads/")
															try {
																let inf = JSON.parse(fs.readFileSync(x + ".json"))
																a.gFiles.push({url:i, name: inf.actualname, size: inf.size})
															}catch {
																a.gFiles.push({url:i, name: i})
															}
														}else {
															a.gFiles.push({url:i, name: i})
														}
													}
												});
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
			}catch {}
		});
	}else if (req.url == "/deletemessage") {
		let data = []
		req.on('data', (chunk) => {
			data.push(chunk)
		})
		req.on('end', () => {
			try {
				let bd = JSON.parse(data);
				let token = bd["token"];
				if (token) {
					let email = userfromtoken[token];
					if (users[uidfromemail[email]]) {
						let isgroup = !bd["chatid"].includes("-");
						let spl = bd["chatid"].split("-");
						let msgid = bd["msgid"];
						let chatitself = chats[bd["chatid"]];
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
			}catch {}
		});
	}else if (req.url == "/savemessage") {
		let data = []
		req.on('data', (chunk) => {
			data.push(chunk)
		})
		req.on('end', () => {
			try {
				let bd = JSON.parse(data);
				let token = bd["token"];
				if (token) {
					let email = userfromtoken[token];
					if (users[uidfromemail[email]]) {
						let msgid = bd["msgid"];
						if (msgid == undefined) {
							res.statusCode = 411;
							res.end(JSON.stringify({status: "error", description: "No messageid", "id":"NOMSGID"}));
							return;
						}
						let isgroup = !bd["chatid"].includes("-");
						let spl = bd["chatid"].split("-");
						//console.log(groupusers[bd["chatid"]][uidfromemail[email]]);
						if (!isgroup ? (spl[0] == uidfromemail[email] || spl[1] == uidfromemail[email]) : groupusers[bd["chatid"]][uidfromemail[email]]) {
							let chatitself = chats[bd["chatid"]];
							if (chatitself == undefined || chatitself == null) {
								chatitself = {};
							}
							res.statusCode = 200;
							if (chatitself[msgid]) {
								let savedmessagesid = uidfromemail[email] + "-" + uidfromemail[email];
								let chatsaveds = chats[savedmessagesid];
								if (chatsaveds == undefined || chatsaveds == null) {
									try {
										chatsaveds = JSON.parse(fs.readFileSync("data/chats/" + savedmessagesid + "/data.json"));
										chats[savedmessagesid] = chatsaveds;
									}catch {
										chatsaveds = {};
									}
								}
								let date = new Date();
								let diff = -date.getTimezoneOffset();
								chatsaveds[new Date().getTime().toString()] = {
									content: chatitself[msgid]["content"].toString(),
									sender: chatitself[msgid]["sender"],
									files: chatitself[msgid]["files"],
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
				let bd = JSON.parse(data);
				let token = bd["token"];
				if (token) {
					let email = userfromtoken[token];
					if (users[uidfromemail[email]]) {
						let msgid = bd["msgid"];
						if (msgid == undefined) {
							res.statusCode = 411;
							res.end(JSON.stringify({status: "error", description: "No messageid", "id":"NOMSGID"}));
							return;
						}
						let isgroup = !bd["chatid"].includes("-");
						let spl = bd["chatid"].split("-");
						//console.log(groupusers[bd["chatid"]][uidfromemail[email]]);
						if (!isgroup ? (spl[0] == uidfromemail[email] || spl[1] == uidfromemail[email]) : groupusers[bd["chatid"]][uidfromemail[email]]) {
							let chatitself = chats[bd["chatid"]];
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
								let tochatid = bd["tochatid"];
								if (tochatid) {
									let isgroup = !tochatid.includes("-");
									let spl = tochatid.split("-");
									//console.log(groupusers[tochatid][uidfromemail[email]]);
									if (!isgroup ? (spl[0] == uidfromemail[email] || spl[1] == uidfromemail[email]) : (groupusers[bd["chatid"]][uidfromemail[email]] && groups[bd["chatid"]].roles[groupusers[bd["chatid"]][uidfromemail[email]].role].AllowSending == true)) {
										let ctst = chats[tochatid];
										if (ctst == undefined || ctst == null) {
											try {
												ctst = JSON.parse(fs.readFileSync("data/chats/" + bd["chatid"] + "/data.json"));
												chats[bd["chatid"]] = ctst;
											}catch {
												ctst = {};
											}
										}
										let date = new Date();
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
				let bd = JSON.parse(data);
				let token = bd["token"];
				if (token) {
					let email = userfromtoken[token];
					if (users[uidfromemail[email]]) {
						let groupname = bd["name"];
						let grouppicture = bd["picture"];
						let groupinfo = bd["info"];
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
						let groupid = groupname.split(" ")[0] + new Date().getTime().toString();
						if (groups[groupid]) {
							res.statusCode = 500;
							res.end(JSON.stringify({status: "error", description: "Group id already taken", "id":"GIDAT"}));
							return;
						}
						let date = new Date();
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
						chats[groupid] = {};
						let groupusersa = {}
						groupusersa[uidfromemail[email]] = {
							user: uidfromemail[email],
							role: "Owner",
							jointime: (date.getMonth() + 1).pad() + " " + date.getDate().pad() + " " + date.getFullYear() + ", " + date.getHours().toString().padStart(2, '0') + ":" + date.getMinutes().toString().padStart(2, '0') + " " + ((diff<=0?"":"+") + Math.floor(diff / 60).pad().toString() + ":" + Math.floor(diff % 60).pad().toString())
						}
						groupusers[groupid] = groupusersa;
						let chatlist = chatslist[token];
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
				let bd = JSON.parse(data);
				let token = bd["token"];
				if (token) {
					let email = userfromtoken[token];
					if (users[uidfromemail[email]]) {
						let groupname = bd["name"];
						let grouppicture = bd["picture"];
						let groupinfo = bd["info"];
						let groles = bd["roles"];
						let groupid = bd["groupid"];
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
							if (groupusers[groupid][uidfromemail[email]] && groups[groupid].roles[groupusers[groupid][uidfromemail[email]].role].AllowEditingSettings == true) {
								groups[groupid].name = groupname;
								groups[groupid].picture = grouppicture;
								groups[groupid].info = groupinfo;
								groups[groupid].roles = groles;
								res.statusCode = 200;
								res.end(JSON.stringify({groupid: groupid}));
							}else {
								res.statusCode = 403;
								res.end(JSON.stringify({status: "error", description: "Denied.", "id":"DENIED"}));
							}
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
				let bd = JSON.parse(data);
				let token = bd["token"];
				if (token) {
					let email = userfromtoken[token];
					if (users[uidfromemail[email]]) {
						let groupid = bd["groupid"];
						if (groups[groupid]) {
							let chatlist = chatslist[token];
							if (chatlist == undefined) {
								chatlist = [];
							}
							if (chatlist.some(e => e.group === groupid)) {
								res.statusCode = 200;
								res.end(JSON.stringify({groupid: groupid}));
								return;
							}
							let date = new Date();
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
				let bd = JSON.parse(data);
				let token = bd["token"];
				if (token) {
					let email = userfromtoken[token];
					if (users[uidfromemail[email]]) {
						let groupid = bd["groupid"];
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
			try {
				let bd = JSON.parse(data);
				let token = bd["token"];
				if (token) {
					let email = userfromtoken[token];
					if (users[uidfromemail[email]]) {
						let groupid = bd["groupid"];
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
			}catch {}
		});
	}else if (req.url == "/edituser") {
		let data = []
		req.on('data', (chunk) => {
			data.push(chunk)
		})
		req.on('end', () => {
			try {
				let bd = JSON.parse(data);
				let token = bd["token"];
				if (token) {
					let email = userfromtoken[token];
					if (users[uidfromemail[email]]) {
						let groupid = bd["groupid"];
						let userid = bd["userid"];
						if (userid == undefined) {
							res.statusCode = 411;
							res.end(JSON.stringify({status: "error", description: "No UID", "id":"NOUID"}));
						}
						if (groups[groupid]) {
							let gusers = groupusers[groupid];
							if (groups[groupid].roles[gusers[uidfromemail[email]].role].AllowEditingUsers == true) {
								if (gusers[userid]) {
									let role = bd["role"];
									if (role) {
										let roles = groups[groupid].roles;
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
				let bd = JSON.parse(data);
				let token = bd["token"];
				if (token) {
					let email = userfromtoken[token];
					if (users[uidfromemail[email]]) {
						let groupid = bd["groupid"];
						let userid = bd["userid"];
						if (userid == undefined) {
							res.statusCode = 411;
							res.end(JSON.stringify({status: "error", description: "No UID", "id":"NOUID"}));
						}
						if (groups[groupid]) {
							let gusers = groupusers[groupid];
							if (groups[groupid].roles[gusers[uidfromemail[email]].role].AllowKicking == true) {
								if (gusers[userid]) {
									delete gusers[userid];
									groupusers[groupid] = gusers;
									let chatlist = chatslist[tokenfromuser[getKeyByValue(uidfromemail,userid)]]
									let ind = chatlist.findIndex(e => e.group === groupid)
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
				let bd = JSON.parse(data);
				let token = bd["token"];
				if (updaterinfo[token] == undefined) {
					updaterinfo[token] = {};
				};
				if (token) {
					let email = userfromtoken[token];
					let uid = uidfromemail[email];
					if (users[uid]) {
						useronlinestatus[uid] = "Online";
						if (useronlinetimeouts[uid]) {
							try {
								clearTimeout(useronlinetimeouts[uid]);
							}catch {}
						}
						useronlinetimeouts[uid] = setTimeout(function() {
							let date = new Date();
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
				let bd = JSON.parse(data);
				let token = bd["token"];
				if (token) {
					let email = userfromtoken[token];
					let uid = uidfromemail[email];
					if (users[uid]) {
						let date = new Date();
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
				let bd = JSON.parse(data);
				let token = bd["token"];
				if (token) {
					let email = userfromtoken[token];
					let uid = uidfromemail[email];
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
				let bd = JSON.parse(data);
				let token = bd["token"];
				if (token) {
					let email = userfromtoken[token];
					let uid = uidfromemail[email];
					if (users[uid]) {
						let tuid = bd["uid"];
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
				let bd = JSON.parse(data);
				let token = bd["token"];
				if (token) {
					let email = userfromtoken[token];
					let uid = uidfromemail[email];
					if (users[uid]) {
						if (bd["chatid"]) {
							let chat = chats[bd["chatid"]];
							if (bd["msgid"]) {
								if (chat[bd["msgid"]]) {
									let reaction = bd["reaction"];
									if (reaction) {
										let msg = chat[bd["msgid"]];
										let isgroup = !bd["chatid"].includes("-");
										let spl = bd["chatid"].split("-");
										if (!isgroup ? (spl[0] == uidfromemail[email] || spl[1] == uidfromemail[email]) : (groupusers[bd["chatid"]][uidfromemail[email]] && groups[bd["chatid"]].roles[groupusers[bd["chatid"]][uidfromemail[email]].role].AllowSendingReactions == true)) {
											let date = new Date();
											let diff = -date.getTimezoneOffset();
											let reactions = msg["reactions"];
											if (reactions == undefined) {
												reactions = {};
											}
											let reactionsemoji = reactions[reaction];
											if (reactionsemoji == undefined) {
												reactionsemoji = {};
											}
											if (reactionsemoji[uid]) {
												delete reactionsemoji[uid];
												//console.log(Object.keys(reactionsemoji).length);
												if (Object.keys(reactionsemoji).length == 0) {
													reactions[reaction] = undefined;
													
													delete reactions[reaction];
													reactionsemoji = undefined;
													//console.log(reactionsemoji)
												}
												//Object.values(updaterinfo).forEach((i) => {
													//if (i[bd[chatid]]) {
													//	i[bd[chatid]][msg] = {
													//		event:"REMREACT",
													//		id:uid,
													//		msg:msg
													//	}
													//}
												//})
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
			}catch (e) {console.error(e)}
		});
	}else if (req.url == "/getreactions") {
		let data = []
		req.on('data', (chunk) => {
			data.push(chunk)
		})
		req.on('end', () => {
			try {
				let bd = JSON.parse(data);
				let token = bd["token"];
				if (token) {
					let email = userfromtoken[token];
					let uid = uidfromemail[email];
					if (users[uid]) {
						if (bd["chatid"]) {
							let chat = chats[bd["chatid"]];
							if (bd["msgid"]) {
								if (chat[bd["msgid"]]) {
									let msg = chat[bd["msgid"]];
									let isgroup = !bd["chatid"].includes("-");
									let spl = bd["chatid"].split("-");
									if (!isgroup ? (spl[0] == uidfromemail[email] || spl[1] == uidfromemail[email]) : (groupusers[bd["chatid"]][uidfromemail[email]])) {
										let reactions = msg["reactions"];
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
			let token =  req.headers["token"];
			console.log(token);
			if (token) {
				let email = userfromtoken[token];
				let uid = uidfromemail[email];
				if (users[uid]) {
					res.setHeader('Content-Type', 'application/json')

					let contentLength = parseInt(req.headers['content-length'])
					if (isNaN(contentLength) || contentLength <= 0 ) {
						console.log("NO FILE", req.headers)
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
					if (req.headers['filename'] == undefined) {
						req.headers['filename'] = filename;
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
							fs.writeFile(`./uploads/${filename}.json`, JSON.stringify({
								sender: token,
								size: req.headers['content-length'],
								actualname: decodeURI(req.headers['filename'])
							}), function() {
								res.end(JSON.stringify({status: "success",url: fil}))
							})
							
						})
					})
				}else {
					res.statusCode = 401;
					res.end(JSON.stringify({status: "error", description: "Invalid token", "id":"INTOKEN"}));
				}
			}else {
				console.log("NO TOKEN", req.headers)
				res.statusCode = 411;
				res.end(JSON.stringify({status: "error", description: "No token", "id":"NOTOKEN"}));
			}
		}catch (e) {console.error(e)}
	}else if (req.url.split("?")[0] == "/getmedia/") {
		try {
			//console.time("stat");
			let query = url.parse(req.url,true).query;
			//console.log(query.file,req.headers,"new request");
			if (query["file"]) {
				let file = query["file"].replace(/\\/g,"");
				if (req.headers["sec-fetch-dest"] == "video") {
					let filePath = "./uploads/" + query["file"].replace(/\\/g,"");
					try {
						inf = JSON.parse(fs.readFileSync("./uploads/" + file + ".json"))
					}catch {
						inf = {actualname: file};
					}
					let range = req.headers.range
					if (!range) {
						range = "0";
					}
				 
					// get video stats (about 100MB)
					let fileSize = fs.statSync(filePath).size
				 
					// Parse Range
					// Example: "bytes=32324-"
					let CHUNK_SIZE = 10 ** 6 // 1MB
					let start = Number(range.replace(/\D/g, ""))
					let end = Math.min(start + CHUNK_SIZE, fileSize - 1)
				 
				  // Create headers
					let contentLength = end - start + 1
					let headers = {
						"Content-Range": `bytes ${start}-${end}/${fileSize}`,
						"Accept-Ranges": "bytes",
						"Content-Length": contentLength,
						"Content-Type":"video/mp4"
					}
				 
					// HTTP Status 206 for Partial Content
					res.writeHead(206, headers)
				 
					// create video read stream for this particular chunk
					let fileStream = fs.createReadStream(filePath, { start, end })
				 
					// Stream the video chunk to the client
					fileStream.pipe(res)
				}else {
					fs.stat("./uploads/" + file,(err,stat) => {
						if (err) {
							res.writeHead(500);
							res.end();
							console.error(err);
							return;
						}
						//console.time("read");
						//console.timeEnd("stat");
						let inf;
						try {
							inf = JSON.parse(fs.readFileSync("./uploads/" + file + ".json"))
						}catch {
							inf = {actualname: file};
						}
						if (req.headers["sec-fetch-dest"] == "document") {
							res.writeHead(200, {
								'Content-Length': stat.size,
							});
						}else {
							res.writeHead(200, {
								'Content-Length': stat.size,
								'Content-Disposition': `attachment; filename=${encodeURIComponent(inf.actualname)}`,
							});
						}
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
				}
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
			try {
				let bd = JSON.parse(data);
				
				let token = bd["token"];
				if (token) {
					let email = userfromtoken[token];
					let uid = uidfromemail[email];
					if (users[uid]) {
						let tuid = bd["id"];
						if (tuid) {
							if (updaterinfo[token]) {
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
			}catch {}
		});
	}else {
		res.statusCode = 200;
		res.write("Pong!")
		res.end()
	}
}

process.on('SIGHUP', function() {
	console.log("Shutting down...")
	let date = new Date();
	let diff = -date.getTimezoneOffset();
	let timestr = (date.getMonth() + 1).pad() + " " + date.getDate().pad() + " " + date.getFullYear() + ", " + date.getHours().toString().padStart(2, '0') + ":" + date.getMinutes().toString().padStart(2, '0') + " " + ((diff<=0?"":"+") + Math.floor(diff / 60).pad().toString() + ":" + Math.floor(diff % 60).pad().toString());
	console.log("Ending offline timers...")
	let tkeys = Object.keys(useronlinetimeouts);
	tkeys.forEach(i => {
		try {
			clearTimeout(useronlinetimeouts[i]);
		}catch {}
	});
	console.log("Making users offline...")
	let keys = Object.keys(useronlinestatus);
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