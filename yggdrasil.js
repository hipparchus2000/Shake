//yggdrasil.js

var route="/project";
var breadcrumbs=["/"];

var projectsUrl = "/api/projects";
var blogsUrl = "/api/blogs";
var usersUrl = "/api/login";
var tasksUrl = "/api/tasks";

var authUrl = "/api/auth";

//initialise global variables used for edit
var projects={};
var tasks={};
var users={};
var blogEntries={};
var id = null;
var jwtToken = null;

function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

function admin() {
	navigate('/user');
}

function addButton() {
	route = route+"/add";
	refresh();
}

function editButton(editId) {
	route = route+"/edit";
	refresh(editId);
}

function deleteButton(id) {
	var r = confirm("Are you sure you want to delete this?");
	if (r == true) {
		deleteRecord(id, refresh);
	} 
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function navigateBack() {
	var lastSlashIndex = route.lastIndexOf("/");
	var newRoute = route.slice(route,lastSlashIndex);
	route = newRoute;
	refresh();
}

function cancelChanges() {
	navigateBack();
}

function getPayloadForResource(resource) {
	var payload = {};
	switch (resource) {
		
		case "projects": 
			payload = {
				"title":       document.getElementById("editProjectProjectName").value,
				"id":          document.getElementById("editProjectProjectId").value,
				"description": document.getElementById("editProjectProjectDescription").value,
				"year":        document.getElementById("editProjectProjectYear").value,
				"codeUrl":     document.getElementById("editProjectProjectCodeUrl").value,
				"url":         document.getElementById("editProjectProjectUrl").value,
				"pdfUrl":      document.getElementById("editProjectProjectPdfUrl").value
			};
			break;
			
		case "blogs":
			payload = {
				"storyName": document.getElementById("editBlogStoryname").value,
				"storyText": document.getElementById("editBlogStorytext").value,
				"date":      document.getElementById("editBlogStorydate").value
			};
			break;
		case "users":
			payload = {
				"username": document.getElementById("userEditUsername").value,
				"password": document.getElementById("userEditPassword").value,
				"roles":      document.getElementById("userEditRoles").value,
				"admin":      false
			};
			break;
		case "tasks":
			payload = {
				"storyName": document.getElementById("editTaskStoryname").value,
				"storyText": document.getElementById("editTaskStorytext").value
			};
			break;
	}
	return payload;
}

function saveChanges() {
	//find resource
	var lastSlashIndex = route.lastIndexOf("/");
	var routeWithoutAdd = route.slice(route,lastSlashIndex);
	resource = routeWithoutAdd.replace("/","")+"s";
	var url="/api/"+resource;
	var payload = getPayloadForResource(resource);
	
	if(id==null) { //then save with post
		http_post(url,payload,navigateBack,updateFailed);
	} else { //then update with put
		http_put(url,payload,navigateBack,updateFailed);
	}
	
}

function updateFailed() {
	alert("update failed");
}

function deleteRecord(id, callback) {
	var resource = route.replace("/","")+"s";
	var url="/api/"+resource+"/"+id;
	http_del(url,deleteFailed, callback);
}

function deleteFailed() {
	alert("delete failed");
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    ev.target.appendChild(document.getElementById(data));
}

function registerServiceWorker () {
	//register the service worker
	if ('serviceWorker' in navigator) {
	  window.addEventListener('load', function() {
		navigator.serviceWorker.register('sw.js').then(function(registration) {
		  // Registration was successful
		  console.log('ServiceWorker registration successful with scope: ', registration.scope);
		}).catch(function(err) {
		  // registration failed :(
		  console.log('ServiceWorker registration failed: ', err);
		});
	  });
	}
}

function generateUUID(){
    var d = new Date().getTime();
    if(window.performance && typeof window.performance.now === "function"){
        d += performance.now(); //use high-precision timer if available
    }
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}

function loadHtmlFragmentToRoot(url) {
	http_get_html(url,function(blobCallback) {
		var root = document.getElementById("root");
		//clear all nodes from root
		while (root.firstChild) {
			root.removeChild(root.firstChild);
		};
		blobCallback.then(function(blob) {
			root.innerHTML = blob;
		});
	});
}

function updateField(node, name,value) {
	var re = new RegExp("{{"+name+"}}","g");
	node.innerHTML = node.innerHTML.replace(re, value);
}

function updateFormField(id,value) {
	var field = document.getElementById(id);	
	field.value=value;
}


function clearRootNode() {
	var root = document.getElementById("root");
	while (root.firstChild) {
		root.removeChild(root.firstChild);
	}
}

function appendNodeToRoot(node) {
	var root = document.getElementById("root");
	root.append(node);
}

function applyProjectsTemplate() {
	clearRootNode();
	var cardrowTemplate = document.getElementById("cardRow-template");
	var cardTemplate = document.getElementById("card-template");
	
	http_get_json(projectsUrl,function (response) {
		projects = response;
		
		var rowcount=0;
		var currentRow=null;
		
		projects.forEach(function (project) {
			if ((rowcount % 3) == 0) {
				currentRow = cardrowTemplate.cloneNode(true);
			}
			var node = cardTemplate.cloneNode(true);
			updateField( node, "title", project.title);
			//updateField( node, "id", rowcount);
			updateField( node, "id", project._id);
			updateField( node, "description", project.description);
			updateField( node, "year", project.year);
			updateField( node, "codeUrl", project.codeUrl);
			updateField( node, "siteUrl", project.siteUrl);
			updateField( node, "url", project.url);
			updateField( node, "pdfUrl", project.pdfUrl);
			updateField( node, "editButton", makeEditAndDeleteButtons(project._id));
			
			//hide buttons with undefined href and onclick   --> first button (0) is used for title, so ignore
			var allButtons = node.getElementsByClassName("btn");
			for (var i = 1; i < allButtons.length; i++) {
				
				var href =allButtons[i].getAttribute("href");
				var onclick = allButtons[i].getAttribute("onclick");
				
				var hrefNotFound = href.includes("undefined");
				var onclickNotFound = onclick==null;
				if (href == "#")
					hrefNotFound = true;
				if(onclick!=null) {
					if (onclick.includes("undefined")) {
						onclickNotFound=true;
					}
				}
				
				if(hrefNotFound && onclickNotFound) {
					var classAttribute = allButtons[i].getAttribute("class");
					allButtons[i].className = classAttribute+" hidden";
				}
			}
			
			currentRow.append(node);
			if ((rowcount % 3) == 0) {
				appendNodeToRoot(currentRow);
			}
			rowcount++;
		});
	});
}

function applyAddProjectTemplate () {
	applyEditProjectTemplate(null);
}

function applyEditProjectTemplate (id) {
	clearRootNode();
	var blogTemplate = document.getElementById("edit-project-template");
	var node = blogTemplate.cloneNode(true);
	root.append(node);
	var title = "";
	var description = "";
	var year="";
	var codeUrl="";
	var id="";
	var url="";
	var pdfUrl="";
	if(id!=null) {
		projects.forEach(function (item) {
			if (item._id == id) {
				title = item.title;
				description = item.description;
				id = item.id;
				year = item.year;
				codeUrl = item.codeUrl;
				url = item.url;
				pdfUrl = item.pdfUrl;
			}
		});
	}
	updateFormField( "editProjectProjectName", title);
	updateFormField( "editProjectProjectDescription", description);
	updateFormField( "editProjectProjectId", id);
	updateFormField( "editProjectProjectYear", year);
	updateFormField( "editProjectProjectCodeUrl", codeUrl);
	updateFormField( "editProjectProjectUrl", url);
	updateFormField( "editProjectProjectPdfUrl", pdfUrl);
}


function applyTasksTemplate() {
	clearRootNode();
	var kanbanTemplate = document.getElementById("kanban-template");
	var slotTemplate = document.getElementById("kanban-slot-template");
	var cardTemplate = document.getElementById("kanban-task-template");
	var kanbanRoot = kanbanTemplate.cloneNode(true);
	kanbanRoot.innerHTML = kanbanRoot.innerHTML.replace(/kanban-template/g,"kanbanroot");
	root.append(kanbanRoot); 

	//todo change blog to use tasks Url (currently using blog items for example
	var slotId=0;
	http_get_json(blogsUrl,function (response) {
		
		tasks = response;
		var currentSlot=null;
		
		tasks.forEach(function (task) {
			//todo need to assign tasks to correct slot
			var node = cardTemplate.cloneNode(true);
			updateField( node, "storyText", task.storyText);
			updateField( node, "storyName", task.storyName);
			updateField( node, "id", task._id);
			updateField( node, "editButton", makeEditAndDeleteButtons(task._id));
			
			currentSlot = slotTemplate.cloneNode(true);
			currentSlot.id = slotId;
			updateField( currentSlot, "kanban-slot-template",  "slot"+id );
			updateField( currentSlot, "cards",  node.innerHTML );
			slotId++;
			var slots = document.getElementById("kanban-slots");
			slots.appendChild(currentSlot);

		});
		
	});

}

function applyAddTasksTemplate () {
	applyEditTasksTemplate(null);
}

function applyEditTasksTemplate (id) {
	clearRootNode();
	var blogTemplate = document.getElementById("edit-task-template");
	var node = blogTemplate.cloneNode(true);
	root.append(node);
	var storyText = "";
	var storyName = "";
	updateFormField( "editTaskStorytext", storyText);
	updateFormField( "editTaskStoryname", storyName);
}

function applyEditKanbanSlotsTemplate () {
	
}

function applyBlogTemplate() {
	clearRootNode();
	var blogTemplate = document.getElementById("blog-template");
	http_get_json(blogsUrl,function (response) {
		blogEntries = response;
		blogEntries.forEach(function (story) {
			var node = blogTemplate.cloneNode(true);
			updateField( node, "storyText", story.storyText);
			updateField( node, "storyName", story.storyName);
			updateField( node, "date", story.date);
			updateField( node, "id", story._id);
			updateField( node, "editButton", makeEditAndDeleteButtons(story._id));
			root.append(node);
		});
	});
}

function applyAddBlogTemplate () {
	applyEditBlogTemplate(null);
}

function applyEditBlogTemplate (id) {
	var storyText = "";
	var storyName = "";
	var date= "";	
	if(id!=null) {
		blogEntries.forEach(function (item) {
			if (item._id == id) {
				storyText = item.storyText;
				storyName = item.storyName;
				date = item.date;				
			}
		});
	}
	clearRootNode();
	var blogTemplate = document.getElementById("edit-blog-template");
	var node = blogTemplate.cloneNode(true);
	root.append(node);
	updateFormField( "editBlogId", id);
	updateFormField( "editBlogStoryname", storyName);
	updateFormField( "editBlogStorytext", storyText);
	updateFormField( "editBlogStorydate", date);
}


function applyUsersTemplate () {
	clearRootNode();
	var userTemplate = document.getElementById("user-template");

    var id=0;	
	http_get_json_restricted(usersUrl,function (response) {
		var users = response;
		
		users.forEach(function (user) {
			var node = userTemplate.cloneNode(true);
			updateField( node, "username", user.username);
			updateField( node, "editButton", makeEditAndDeleteButtons(user._id));
			root.append(node);
			id++;
		});
	});
}

function applyAddUsersTemplate () {
	
}

function applyEditUsersTemplate (id) {
	
}

function navigateState(stateTitle,templateFunction, id) {
	var title=document.getElementById("pageTitle");
	title.innerHTML=stateTitle;
	templateFunction(id);
}

function makeEditAndDeleteButtons(id,) {
	var requiredRole = route.replace("/","")+"-editor";
	var editButton="";
	if (jwtToken.roles.includes(requiredRole))
		editButton='<i class="fa fa-trash fa-3x pull-right" onclick="deleteButton(\''+id+'\')" aria-hidden="true"></i><i class="fa fa-pencil fa-3x pull-right" onclick="editButton(\''+id+'\')" aria-hidden="true"></i>';
	return editButton;
}

function rewriteUrlFromRoute() {
	var url = window.location.href;
	var parts = url.split("#");
	window.location.replace(parts[0] + "#" + route);
}

function refresh(id) {

	rewriteUrlFromRoute();	
	
	jwtToken = fetchJwt();
	if (jwtToken==null) {
		jwtToken={ admin: false, username: "Guest", roles: ""};
		storeJwt();
	}
	
	var hideButtons = route.includes("edit") || route.includes("add");
	var addButton = document.getElementById("addButton"); 
	if (hideButtons == false) {
		var requiredRole = route.replace("/","")+"-editor";
		if (jwtToken.roles.includes(requiredRole))
			addButton.style.display = "block";
	} else {
		addButton.style.display = "none";
	}
	
	var adminButton = document.getElementById("adminButton"); 
	if (hideButtons == false) {
		if (jwtToken.admin == true)
			adminButton.style.display = "block";
	} else {
		adminButton.style.display = "none";
	}

	switch(route) {
		
		case "/project":     navigateState("Yggsrasil Projects", applyProjectsTemplate ); break;
		case "/project/add": navigateState("Add Project", applyAddProjectTemplate ); break;
		case "/project/edit": navigateState("Edit Project", applyEditProjectTemplate, id ); break;
		
		case "/blog": navigateState("Jeff Davies' Blog", applyBlogTemplate ); break;
		case "/blog/add": navigateState("Add Blog", applyAddBlogTemplate ); break;
		case "/blog/edit": navigateState("Edit Blog", applyEditBlogTemplate, id ); break;
		
		case "/task": navigateState("Kanban", applyTasksTemplate ); break;
		case "/task/add": navigateState("Add Task", applyAddTasksTemplate ); break;
		case "/task/edit": navigateState("Edit Task", applyEditTasksTemplate, id ); break;
		case "/task/edit-slots": navigateState("Edit Kanban Slots", applyEditKanbanSlotsTemplate ); break;
		
		case "/user": navigateState("Users", applyUsersTemplate ); break;
		case "/user/add": navigateState("Add User", applyAddUsersTemplate ); break;
		case "/user/edit": navigateState("Edit User", applyEditUsersTemplate, id ); break;

	} 
		
}

function makeBreadCrumbs () {
	//todo
}

function navigate(newroute) {
	route=newroute;
	refresh();
}


function http_get_json(url, callback) {
	fetch(url).then(function(response) {
	  	return response.json();
	}).then(function(data) {
		rewriteUrlFromRoute();	
		callback(data);
	}).catch(function(err) {
	  	console.log("Failed To Get Url "+err);
	});
}

function http_get_html(url, callback) {
	fetch(url, { mode: 'no-cors' }).then(function(response) {
		return response;
	}).then(function(data) {
		rewriteUrlFromRoute();	
		callback(data.text());
	}).catch(function(err) {
		console.log("Failed To Get Url "+err);
	});
}

function http_get_json_restricted(url, callback) {
	fetch(url,
	{
    	method: "get", 
		headers: {
        	'Accept': 'application/json, text/plain, */*',
        	'Content-Type': 'application/json',
			'jwt': jwtToken.token
    	}
	}).then(function(res){ 
		return res.json();
	}).then(function(data){ 
		rewriteUrlFromRoute();	
		callback(data);
	}).catch(function(err) {
	  	console.log("Failed To Get Url "+err);
	});
}

function http_post(url,payload,callback,errorCallback) {
	var json = {
    	json: JSON.stringify(payload),
    	delay: 3
	};
	fetch(url,
	{
    	method: "post", 
		headers: {
        	'Accept': 'application/json, text/plain, */*',
        	'Content-Type': 'application/json',
			'jwt': jwtToken.token
    	},
        body: json = JSON.stringify(payload)
	})
	.then(function(res){ 
		return res.json();
	})
	.then(callback).catch(errorCallback);
}

function http_put(url,payload,callback,errorCallback) {
	var json = {
    	json: JSON.stringify(payload),
    	delay: 3
	};
	fetch(url,
	{
    	method: "put", 
		headers: {
        	'Accept': 'application/json, text/plain, */*',
        	'Content-Type': 'application/json',
			'jwt': jwtToken.token
    	},
        body: json = JSON.stringify(payload)
	})
	.then(function(res){ 
		return res.json();
	})
	.then(callback).catch(errorCallback);
}

function http_del(url,errorCallback, callback) {
	fetch(url,
	{
    	method: "delete", 
		headers: {
        	'Accept': 'application/json, text/plain, */*',
        	'Content-Type': 'application/json',
			'jwt': jwtToken.token
    	}
	})
	.then(function(res){
		return;
	})
	.then(callback).catch(errorCallback);
}

function emptyJwt() {
	return {
		"admin" : false,
		"roles" : "",
		"username" : "guest"
	};
}

function logout() {
	jwtToken = emptyJwt();
	storeJwt();
	refresh();
}

function login() {
	var loginStatus = document.getElementById('loginStatus');
	loginStatus.innerHTML = "";
	var username = document.getElementById("username").value;
	var password = document.getElementById("password").value;
	var url = authUrl;
	var payload = {
    	"username": username,
	    "password": password
	};
	
	var json = {
    	json: JSON.stringify(payload),
    	delay: 3
	};
	fetch(url,
	{
    	method: "post", 
		headers: {
        	'Accept': 'application/json, text/plain, */*',
        	'Content-Type': 'application/json'
    	},
        body: json = JSON.stringify(payload)
	})
	.then(function(res){ 
		return res.json();
	})
	.then(function(token){ 
		jwtToken = token;
        storeJwt(token);
		if (jwtToken.loginSuccess==true) {
			var modal = document.getElementById('myModal');
			loginModal.style.display = "none";
			refresh();
		} else {
			var modal = document.getElementById('loginStatus');
			modal.innerHTML = "failed to login";
		};
	}).catch(function(err) {
		var loginStatus = document.getElementById('loginStatus');
		loginStatus.innerHTML = "failed to login";
		jwtToken = {};
	});
}

var storeJwt = function (value) {
	localStorage.setItem('jwt', JSON.stringify(value));
}

function fetchJwt() {
	var token = localStorage.getItem('jwt');
	if (token == null || token =="" || token == "undefined") {
		jwtToken = emptyJwt();
		storeJwt(jwtToken);
	} else {
		var jwtToken = JSON.parse(token);
	}
	return jwtToken;
}

window.onload = function(){
	jwtToken=emptyJwt();
	
	var loginModal = document.getElementById('loginModal');

	var loginBtn = document.getElementById("loginBtn");
	loginBtn.onclick = function() {
		loginModal.style.display = "block";
	}

	var logoutBtn = document.getElementById("logoutBtn");
	logoutBtn.onclick = function() {
		logout();
	}

	var loginDialogClose = document.getElementById("loginClose");
	loginDialogClose.onclick = function() {
		loginModal.style.display = "none";
	}

	window.onclick = function(event) {
		if (event.target == loginModal) {
			loginModal.style.display = "none";
		}

	}
	
	refresh();
	registerServiceWorker();
}



